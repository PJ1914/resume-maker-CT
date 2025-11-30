from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserProfile(BaseModel):
    """User profile model"""
    uid: str
    email: EmailStr
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    emailVerified: bool
    isAdmin: bool = False

class TokenVerifyResponse(BaseModel):
    """Token verification response"""
    uid: str
    email: str
    email_verified: bool
    auth_time: Optional[int] = None
    
class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str
    code: Optional[str] = None
