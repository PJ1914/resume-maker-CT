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
    Verify Razorpay payment and add credits to user account
    
    - **razorpay_order_id**: Razorpay order ID
    - **razorpay_payment_id**: Razorpay payment ID
    - **razorpay_signature**: Razorpay signature for verification
    
    Returns verification status and credits added
    """
    try:
        # Verify payment via Lambda
        verification_result = await payment_service.verify_payment(
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature,
            user_id=current_user["uid"]
        )
        
        if not verification_result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=verification_result.get("message", "Payment verification failed")
            )
        
        # Credits are added by Lambda to DynamoDB and synced to Firestore
        credits_added = verification_result.get("credits_added", 0)
        
        logger.info(f"Payment verified for user {current_user['uid']}, credits added: {credits_added}")
        
        return VerifyPaymentResponse(
            success=True,
            message="Payment verified successfully",
            credits_added=credits_added,
            user_id=current_user["uid"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify payment: {str(e)}")
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
