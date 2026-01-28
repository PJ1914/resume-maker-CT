from fastapi import APIRouter, HTTPException, Depends
from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse
)
from app.services.payment import payment_service
from app.services.credits import add_credits, CreditTransactionType
from app.dependencies import get_current_user
from app.services.email_service import EmailService
from app.services.email_ai_service import EmailAIService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a Razorpay payment order
    
    - **plan_id**: Plan ID from database (e.g., PLAN#Resume)
    - **quantity**: Number of credits to purchase
    
    Returns order details for Razorpay checkout
    """
    try:
        logger.info(f"Creating order for user {current_user.get('uid')}: plan={request.plan_id}, quantity={request.quantity}")
        
        # Create order via Lambda
        order_result = await payment_service.create_order(
            plan_id=request.plan_id,
            quantity=request.quantity,
            user_id=current_user["uid"]
        )
        
        logger.info(f"Order created successfully: {order_result.get('order_id')}")
        
        return CreateOrderResponse(
            order_id=order_result["order_id"],
            amount=order_result["amount"],
            currency=order_result.get("currency", "INR"),
            receipt=order_result["receipt"]
        )
        
    except Exception as e:
        logger.error(f"Failed to create order: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Verify Razorpay payment and add credits to user account (ATOMIC TRANSACTION)
    
    This is the NEW recommended approach:
    - Verifies payment signature in backend (secure)
    - Adds credits to Firestore atomically
    - Stores payment record for audit trail
    - Prevents duplicate processing (idempotent)
    - No Lambda dependency for verification
    
    - **razorpay_order_id**: Razorpay order ID
    - **razorpay_payment_id**: Razorpay payment ID
    - **razorpay_signature**: Razorpay signature for verification
    - **quantity**: Number of credits purchased
    
    Returns verification status, credits added, and new balance
    """
    try:
        logger.info(f"Verifying payment for user {current_user['uid']}: order={request.razorpay_order_id}, payment={request.razorpay_payment_id}")
        
        # Verify payment and add credits atomically
        verification_result = await payment_service.verify_payment_and_add_credits(
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature,
            user_id=current_user["uid"],
            quantity=request.quantity
        )
        
        if not verification_result.get("success"):
            # Send failed payment notification
            try:
                amount = request.quantity * 10  # Assuming ₹10 per credit
                await EmailService.send_payment_failed_notification(
                    user_email=current_user.get('email'),
                    user_name=current_user.get('displayName', 'Valued Customer'),
                    amount=amount,
                    reason=verification_result.get("message", "Payment verification failed"),
                    order_id=request.razorpay_order_id
                )
                logger.info(f"✅ Payment failed notification sent to {current_user.get('email')}")
            except Exception as email_error:
                logger.error(f"❌ Failed payment email error: {email_error}")
            
            raise HTTPException(
                status_code=400,
                detail=verification_result.get("message", "Payment verification failed")
            )
        
        credits_added = verification_result.get("credits_added", 0)
        new_balance = verification_result.get("new_balance", 0)
        
        logger.info(f"Payment verified for user {current_user['uid']}, credits added: {credits_added}, new balance: {new_balance}")
        
        # Send billing receipt email (async, non-blocking)
        try:
            # Fetch actual order amount from Firestore (NOT hardcoded calculation)
            from app.firebase import resume_maker_app
            from firebase_admin import firestore
            
            db = firestore.client(app=resume_maker_app)
            order_doc = db.collection('orders').document(request.razorpay_order_id).get()
            
            if order_doc.exists:
                order_data = order_doc.to_dict()
                amount = order_data.get('amount', 0) / 100  # Convert paise to rupees
            else:
                # Fallback: This shouldn't happen, but use a safe default
                logger.warning(f"Order {request.razorpay_order_id} not found in Firestore, using fallback calculation")
                amount = credits_added * 1.78  # Approximate ₹1.78 per credit (₹89 for 50 credits)
            
            # Generate invoice number and send receipt
            invoice_number = await EmailAIService.generate_invoice_number()
            await EmailService.send_billing_receipt(
                user_email=current_user.get('email'),
                user_name=current_user.get('displayName', 'Valued Customer'),
                invoice_number=invoice_number,
                credits_purchased=credits_added,
                amount_paid=amount,  # Use actual amount from order
                transaction_id=request.razorpay_payment_id,
                currency="INR"
            )
            logger.info(f"✅ Billing receipt sent to {current_user.get('email')}")
        except Exception as email_error:
            # Don't fail payment if email fails
            logger.error(f"❌ Failed to send billing receipt: {email_error}")
        
        return VerifyPaymentResponse(
            success=True,
            message=verification_result.get("message", "Payment verified successfully"),
            credits_added=credits_added,
            new_balance=new_balance,
            user_id=current_user["uid"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify payment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/plans")
async def get_payment_plans():
    """
    Get available payment plans
    
    Returns list of available plans with pricing
    """
    try:
        plans = await payment_service.get_payment_plans()
        return plans
        
    except Exception as e:
        logger.error(f"Failed to fetch plans: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
