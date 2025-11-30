"""
Admin management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel, EmailStr
from app.dependencies_admin import get_current_admin
from app.services.user_roles import add_admin, remove_admin, list_admins

router = APIRouter()

class AddAdminRequest(BaseModel):
    """Request to add a new admin"""
    user_id: str
    email: EmailStr

class AdminResponse(BaseModel):
    """Admin user response"""
    user_id: str
    email: str
    added_at: str
    added_by: str

@router.post("/admins")
async def add_new_admin(
    request: AddAdminRequest,
    current_user: dict = Depends(get_current_admin)
):
    """Add a new admin (Admin only)"""
    added_by = current_user["uid"]
    
    if add_admin(request.user_id, request.email, added_by):
        return {
            "status": "success",
            "message": f"User {request.email} added as admin",
            "user_id": request.user_id
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add admin"
        )

@router.delete("/admins/{user_id}")
async def remove_admin_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Remove an admin (Admin only)"""
    # Prevent removing self
    if user_id == current_user["uid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself as admin"
        )
    
    if remove_admin(user_id):
        return {
            "status": "success",
            "message": "Admin removed successfully"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove admin"
        )

@router.get("/admins", response_model=List[AdminResponse])
async def get_admins(
    current_user: dict = Depends(get_current_admin)
):
    """List all admins (Admin only)"""
    admins = list_admins()
    
    return [
        AdminResponse(
            user_id=admin["user_id"],
            email=admin["email"],
            added_at=admin["added_at"].isoformat() if admin.get("added_at") else "",
            added_by=admin.get("added_by", "system")
        )
        for admin in admins
    ]
