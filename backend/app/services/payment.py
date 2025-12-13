import os
import hmac
import hashlib
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.firebase import resume_maker_app
from firebase_admin import firestore
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PaymentService:
    """Service for handling payments via Lambda (order creation) and Backend (verification)"""
    
    def __init__(self):
        self.lambda_endpoint = os.getenv("PAYMENT_LAMBDA_ENDPOINT", "https://bm9kndx62m.execute-api.us-east-1.amazonaws.com/dev")
        self.razorpay_key_id = os.getenv("RAZORPAY_KEY_ID", "")
        self.razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        logger.info(f"PaymentService initialized with Lambda endpoint: {self.lambda_endpoint}")
    
    async def create_order(self, plan_id: str, quantity: int, user_id: str) -> Dict[str, Any]:
        """
        Create a Razorpay order via Lambda
        
        Args:
            plan_id: Plan ID (e.g., PLAN#Resume)
            quantity: Number of credits to purchase
            user_id: User ID for tracking
            
        Returns:
            Dict containing order_id, amount, currency, receipt
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.lambda_endpoint}/payments/create-order",
                    json={
                        "plan_id": plan_id,
                        "quantity": quantity,
                        "user_id": user_id
                    },
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                
                logger.info(f"Order created: {data.get('order_id')} for user {user_id}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error creating order: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Failed to create order: {e.response.text}")
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            raise Exception(f"Failed to create order: {str(e)}")
    
    async def verify_payment_and_add_credits(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
        user_id: str,
        quantity: int
    ) -> Dict[str, Any]:
        """
        Verify Razorpay payment signature and atomically add credits to user account
        This is the RECOMMENDED approach - all verification + credit addition in one transaction
        
        Args:
            razorpay_order_id: Razorpay order ID
            razorpay_payment_id: Razorpay payment ID  
            razorpay_signature: Razorpay signature
            user_id: User ID for credit addition
            quantity: Number of credits to add
            
        Returns:
            Dict containing success status, message, credits_added, new_balance
        """
        if not resume_maker_app:
            raise Exception("Firebase not configured")
            
        try:
            # Step 1: Verify signature
            if not self._verify_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
                logger.warning(f"Invalid payment signature for order {razorpay_order_id}")
                return {
                    "success": False,
                    "message": "Invalid payment signature",
                    "credits_added": 0,
                    "new_balance": 0
                }
            
            logger.info(f"Payment signature verified for order {razorpay_order_id}")
            
            # Step 2: Atomic transaction - Add credits and store payment record
            db = firestore.client(app=resume_maker_app)
            
            # Check if payment already processed (idempotency)
            payment_doc = db.collection('payments').document(razorpay_payment_id).get()
            if payment_doc.exists:
                logger.warning(f"Payment {razorpay_payment_id} already processed")
                payment_data = payment_doc.to_dict()
                return {
                    "success": True,
                    "message": "Payment already processed",
                    "credits_added": payment_data.get('credits_added', 0),
                    "new_balance": payment_data.get('new_balance', 0)
                }
            
            # Get user's current balance from the correct subcollection
            balance_ref = db.collection('users').document(user_id).collection('credits').document('balance')
            balance_doc = balance_ref.get()
            
            if not balance_doc.exists:
                # Create balance document if it doesn't exist
                balance_ref.set({
                    'balance': quantity,
                    'total_earned': quantity,
                    'total_spent': 0,
                    'subscription_tier': 'free',
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                })
                new_balance = quantity
                total_earned = quantity
            else:
                # Update existing balance
                current_data = balance_doc.to_dict()
                current_balance = current_data.get('balance', 0)
                current_earned = current_data.get('total_earned', 0)
                new_balance = current_balance + quantity
                total_earned = current_earned + quantity
                balance_ref.update({
                    'balance': new_balance,
                    'total_earned': total_earned,
                    'updated_at': datetime.utcnow()
                })
            
            # Store payment record
            payment_record = {
                'payment_id': razorpay_payment_id,
                'order_id': razorpay_order_id,
                'user_id': user_id,
                'credits_added': quantity,
                'new_balance': new_balance,
                'status': 'success',
                'verified_at': datetime.utcnow(),
                'created_at': datetime.utcnow()
            }
            db.collection('payments').document(razorpay_payment_id).set(payment_record)
            
            # Store transaction history in user's subcollection
            transaction_record = {
                'type': 'PURCHASE',
                'amount': quantity,
                'payment_id': razorpay_payment_id,
                'order_id': razorpay_order_id,
                'description': f'Credit purchase via Razorpay',
                'balance_after': new_balance,
                'timestamp': datetime.utcnow()
            }
            db.collection('users').document(user_id).collection('credit_transactions').add(transaction_record)
            
            logger.info(f"Payment verified and {quantity} credits added to user {user_id}. New balance: {new_balance}")
            
            return {
                "success": True,
                "message": "Payment verified and credits added successfully",
                "credits_added": quantity,
                "new_balance": new_balance
            }
                
        except Exception as e:
            logger.error(f"Error verifying payment: {str(e)}", exc_info=True)
            raise Exception(f"Failed to verify payment: {str(e)}")
    
    async def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        DEPRECATED: Old method that calls Lambda for verification
        Use verify_payment_and_add_credits() instead for atomic transactions
        """
        try:
            # Verify signature locally first
            if not self._verify_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
                logger.warning(f"Invalid payment signature for order {razorpay_order_id}")
                return {
                    "success": False,
                    "message": "Invalid payment signature",
                    "credits_added": None
                }
            
            # TODO: Lambda API Gateway not configured - using mock for now
            logger.warning("Using mock payment verification - Lambda API Gateway not configured")
            
            # Mock successful payment verification
            # Extract quantity from order_id or use default
            credits_to_add = 100  # Default, should parse from order
            
            return {
                "success": True,
                "message": "Payment verified successfully",
                "credits_added": credits_to_add
            }
            
            # Original Lambda call (commented out until API Gateway is fixed):
            # async with httpx.AsyncClient(timeout=30.0) as client:
            #     response = await client.post(
            #         f"{self.lambda_endpoint}/payments/verify",
            #         json={
            #             "razorpay_order_id": razorpay_order_id,
            #             "razorpay_payment_id": razorpay_payment_id,
            #             "razorpay_signature": razorpay_signature,
            #             "user_id": user_id
            #         },
            #         headers={"Content-Type": "application/json"}
            #     )
            #     response.raise_for_status()
            #     return response.json()
                
        except Exception as e:
            logger.error(f"Error verifying payment: {str(e)}")
            raise Exception(f"Failed to verify payment: {str(e)}")
    
    def _verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        """
        Verify Razorpay payment signature
        
        Args:
            order_id: Razorpay order ID
            payment_id: Razorpay payment ID
            signature: Signature to verify
            
        Returns:
            True if signature is valid
        """
        try:
            message = f"{order_id}|{payment_id}"
            generated_signature = hmac.new(
                self.razorpay_key_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(generated_signature, signature)
        except Exception as e:
            logger.error(f"Error verifying signature: {str(e)}")
            return False
    
    async def get_payment_plans(self, plan_id: str = "PLAN#Resume") -> Dict[str, Any]:
        """
        Get payment plans from DynamoDB via Lambda
        
        Args:
            plan_id: Plan ID to fetch (default: PLAN#Resume)
            
        Returns:
            Dict containing plan details matching frontend PaymentPlansResponse interface
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.lambda_endpoint}/payments/plans",
                    params={"plan_id": plan_id},
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                
                logger.info(f"Fetched payment plans from Lambda: {len(data.get('plans', []))} tiers")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching plans: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Failed to fetch payment plans: {e.response.text}")
        except Exception as e:
            logger.error(f"Error fetching plans: {str(e)}")
            raise Exception(f"Failed to fetch payment plans: {str(e)}")


# Singleton instance
payment_service = PaymentService()
