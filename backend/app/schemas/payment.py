from pydantic import BaseModel, Field
from typing import Optional


class CreateOrderRequest(BaseModel):
    plan_id: str = Field(..., description="Plan ID from database (e.g., PLAN#Resume)")
    quantity: int = Field(..., description="Number of credits to purchase", ge=1)


class CreateOrderResponse(BaseModel):
    order_id: str = Field(..., description="Razorpay order ID")
    amount: int = Field(..., description="Amount in smallest currency unit (paise for INR)")
    currency: str = Field(default="INR", description="Currency code")
    receipt: str = Field(..., description="Receipt ID for tracking")


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(..., description="Razorpay order ID")
    razorpay_payment_id: str = Field(..., description="Razorpay payment ID")
    razorpay_signature: str = Field(..., description="Razorpay signature for verification")
    quantity: int = Field(..., description="Number of credits purchased", ge=1)


class VerifyPaymentResponse(BaseModel):
    success: bool = Field(..., description="Payment verification status")
    message: str = Field(..., description="Response message")
    credits_added: int = Field(..., description="Number of credits added to user account")
    new_balance: int = Field(..., description="User's new credit balance")
    user_id: Optional[str] = Field(None, description="User ID for whom credits were added")


class PaymentPlan(BaseModel):
    price: int = Field(..., description="Price in INR")
    quantity: int = Field(..., description="Number of credits")
