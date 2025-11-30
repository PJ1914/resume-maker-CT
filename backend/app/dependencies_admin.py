"""
Admin-specific dependencies and middleware
"""
from fastapi import Depends, HTTPException, status
from app.dependencies import get_current_user
from app.services.user_roles import is_user_admin


async def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to verify current user is an admin.
    
    Raises:
        HTTPException: 403 if user is not an admin
    """
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    if not is_user_admin(user_email, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. Contact your administrator to request admin privileges."
        )
    
    # Add admin flag to user dict
    current_user["is_admin"] = True
    return current_user
