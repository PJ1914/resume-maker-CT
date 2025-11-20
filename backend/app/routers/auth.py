from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.schemas.user import TokenVerifyResponse

router = APIRouter()

@router.get("/verify", response_model=TokenVerifyResponse)
async def verify_token(current_user: dict = Depends(get_current_user)):
    """
    Verify Firebase token and return decoded user info.
    This endpoint is mainly for debugging/testing.
    """
    return TokenVerifyResponse(
        uid=current_user["uid"],
        email=current_user.get("email", ""),
        email_verified=current_user.get("email_verified", False),
        auth_time=current_user.get("auth_time"),
    )
