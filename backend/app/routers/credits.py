"""
Credits API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from app.dependencies import get_current_user
from app.dependencies_admin import get_current_admin
from app.services.credits import (
    get_user_credits,
    has_sufficient_credits,
    deduct_credits,
    add_credits,
    get_credit_history,
    check_and_reset_monthly_credits,
    FeatureType,
    CreditTransactionType,
    FEATURE_COSTS,
    FREE_MONTHLY_CREDITS,
)

router = APIRouter()

# Credit packages (in INR)
CREDIT_PACKAGES = [
    {"id": "starter", "credits": 50, "price": 99, "name": "Starter Pack", "discount": 0},
    {"id": "professional", "credits": 150, "price": 249, "name": "Professional Pack", "discount": 17},
    {"id": "business", "credits": 500, "price": 699, "name": "Business Pack", "discount": 30},
]

class CreditBalanceResponse(BaseModel):
    """Credit balance response"""
    balance: int
    total_earned: int
    total_spent: int
    subscription_tier: str
    is_admin: bool = False
    last_reset: Optional[str] = None

class CreditTransactionResponse(BaseModel):
    """Credit transaction response"""
    id: str
    type: str
    amount: int
    feature: Optional[str] = None
    description: str
    balance_after: int
    timestamp: str

class DeductCreditsRequest(BaseModel):
    """Request to deduct credits"""
    feature: str
    description: Optional[str] = None

class GrantCreditsRequest(BaseModel):
    """Admin request to grant credits"""
    user_id: str
    amount: int
    description: Optional[str] = None

class PurchaseCreditsRequest(BaseModel):
    """Request to purchase credits"""
    package_id: str
    payment_id: Optional[str] = None  # Payment gateway transaction ID

@router.get("/balance", response_model=CreditBalanceResponse)
async def get_balance(current_user: dict = Depends(get_current_user)):
    """Get current credit balance. Admins get unlimited credits."""
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    # Check and reset monthly credits if needed (not for admins)
    check_and_reset_monthly_credits(user_id)
    
    credits = get_user_credits(user_id, user_email)
    
    return CreditBalanceResponse(
        balance=credits["balance"],
        total_earned=credits["total_earned"],
        total_spent=credits["total_spent"],
        subscription_tier=credits["subscription_tier"],
        is_admin=credits.get("is_admin", False),
        last_reset=credits["last_reset"].isoformat() if credits.get("last_reset") else None,
    )

@router.get("/packages")
async def get_credit_packages():
    """Get available credit packages"""
    return {
        "packages": CREDIT_PACKAGES,
        "free_monthly_credits": FREE_MONTHLY_CREDITS,
        "feature_costs": {
            "ats_scoring": FEATURE_COSTS[FeatureType.ATS_SCORING],
            "ai_rewrite": FEATURE_COSTS[FeatureType.AI_REWRITE],
            "ai_suggestion": FEATURE_COSTS[FeatureType.AI_SUGGESTION],
            "pdf_export": FEATURE_COSTS[FeatureType.PDF_EXPORT],
        }
    }

@router.post("/deduct")
async def deduct_user_credits(
    request: DeductCreditsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Deduct credits for feature usage. Admins are not charged."""
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    try:
        feature = FeatureType(request.feature)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feature type: {request.feature}"
        )
    
    # Check if user has sufficient credits (admins always pass)
    if not has_sufficient_credits(user_id, feature, user_email):
        credits = get_user_credits(user_id, user_email)
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "message": "Insufficient credits",
                "current_balance": credits["balance"],
                "required": FEATURE_COSTS[feature],
            }
        )
    
    # Deduct credits (admins are not charged)
    if deduct_credits(user_id, feature, request.description, user_email):
        credits = get_user_credits(user_id, user_email)
        return {
            "success": True,
            "message": f"Deducted {FEATURE_COSTS[feature]} credits" if not credits.get("is_admin") else "Admin - no credits deducted",
            "new_balance": credits["balance"],
            "is_admin": credits.get("is_admin", False),
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deduct credits"
        )

@router.post("/purchase")
async def purchase_credits(
    request: PurchaseCreditsRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Purchase credits (placeholder - integrate with payment gateway)
    
    TODO: Integrate with Razorpay, Paytm, or other payment gateway
    """
    user_id = current_user["uid"]
    
    # Find package
    package = next((p for p in CREDIT_PACKAGES if p["id"] == request.package_id), None)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    # TODO: Verify payment with payment gateway using request.payment_id
    # For now, this is a placeholder
    
    # Add credits
    # description = f"Purchased {package['name']} - ₹{package['price']}"
    # if add_credits(user_id, package["credits"], CreditTransactionType.PURCHASE, description):
    #     credits = get_user_credits(user_id)
    #     return {
    #         "success": True,
    #         "message": f"Added {package['credits']} credits",
    #         "new_balance": credits["balance"],
    #         "package": package,
    #     }
    # else:
    #     raise HTTPException(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         detail="Failed to add credits"
    #     )
    
    # Return pending status
    return {
        "success": False,
        "message": "Payment integration is pending. Please contact admin to complete purchase.",
        "payment_id": "mock_payment_id",
        "status": "pending"
    }

@router.get("/history", response_model=List[CreditTransactionResponse])
async def get_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 50
):
    """Get credit transaction history"""
    user_id = current_user["uid"]
    
    transactions = get_credit_history(user_id, limit)
    
    return [
        CreditTransactionResponse(
            id=t["id"],
            type=t["type"],
            amount=t["amount"],
            feature=t.get("feature"),
            description=t["description"],
            balance_after=t["balance_after"],
            timestamp=t["timestamp"].isoformat() if t.get("timestamp") else "",
        )
        for t in transactions
    ]

@router.post("/admin/grant")
async def grant_credits(
    request: GrantCreditsRequest,
    current_user: dict = Depends(get_current_admin)
):
    """Grant credits to a user (Admin only)"""
    admin_id = current_user["uid"]
    
    description = request.description or f"Credits granted by admin ({admin_id})"
    
    if add_credits(request.user_id, request.amount, CreditTransactionType.GRANT, description):
        credits = get_user_credits(request.user_id)
        return {
            "success": True,
            "message": f"Granted {request.amount} credits to user",
            "user_id": request.user_id,
            "new_balance": credits["balance"],
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to grant credits"
        )

@router.get("/check/{feature}")
async def check_feature_access(
    feature: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if user has sufficient credits for a feature. Admins always have access."""
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    try:
        feature_type = FeatureType(feature)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feature type: {feature}"
        )
    
    credits = get_user_credits(user_id, user_email)
    required = FEATURE_COSTS[feature_type]
    is_admin = credits.get("is_admin", False)
    has_access = is_admin or credits["balance"] >= required
    
    return {
        "has_access": has_access,
        "current_balance": credits["balance"],
        "required": required,
        "feature": feature,
        "is_admin": is_admin,
    }
