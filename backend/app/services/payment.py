import os
import hmac
import hashlib
import httpx
from typing import Dict, Any, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class PaymentService:
    """Service for handling payments via Lambda and Razorpay"""
    
    def __init__(self):
        self.lambda_endpoint = os.getenv("PAYMENT_LAMBDA_ENDPOINT", "https://bm9kndx62m.execute-api.us-east-1.amazonaws.com/dev")
        self.razorpay_key_id = os.getenv("RAZORPAY_KEY_ID", "")
        self.razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    
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
    
    async def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Verify payment signature and process via Lambda
        
        Args:
            razorpay_order_id: Razorpay order ID
            razorpay_payment_id: Razorpay payment ID
            razorpay_signature: Razorpay signature
            user_id: User ID for credit addition
            
        Returns:
            Dict containing success status, message, credits_added
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
            
            # Call Lambda to process payment and add credits
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.lambda_endpoint}/payments/verify",
                    json={
                        "razorpay_order_id": razorpay_order_id,
                        "razorpay_payment_id": razorpay_payment_id,
                        "razorpay_signature": razorpay_signature,
                        "user_id": user_id
                    },
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                
                logger.info(f"Payment verified: {razorpay_payment_id} for user {user_id}, credits: {data.get('credits_added')}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error verifying payment: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Failed to verify payment: {e.response.text}")
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
    
    async def get_payment_plans(self, plan_id: str = "PLAN#Resume") -> Optional[Dict[str, Any]]:
        """
        Get payment plans from Lambda/DynamoDB
        
        Args:
            plan_id: Plan ID to fetch
            
        Returns:
            Dict containing plan details
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.lambda_endpoint}/payments/plans/{plan_id}",
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching plans: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching plans: {str(e)}")
            return None


# Singleton instance
payment_service = PaymentService()
