from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.schemas.user import UserProfile
from app.services.user_roles import is_user_admin

router = APIRouter()

@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user profile from Firebase token.
    Frontend will call this to verify backend connection.
    """
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    return UserProfile(
        uid=user_id,
        email=user_email,
        displayName=current_user.get("name"),
        photoURL=current_user.get("picture"),
        emailVerified=current_user.get("email_verified", False),
        isAdmin=current_user.get("admin", False) or is_user_admin(user_email, user_id),
    )
