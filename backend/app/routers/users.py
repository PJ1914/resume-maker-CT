from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.schemas.user import UserProfile

router = APIRouter()

@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user profile from Firebase token.
    Frontend will call this to verify backend connection.
    """
    return UserProfile(
        uid=current_user["uid"],
        email=current_user.get("email", ""),
        displayName=current_user.get("name"),
        photoURL=current_user.get("picture"),
        emailVerified=current_user.get("email_verified", False),
    )
