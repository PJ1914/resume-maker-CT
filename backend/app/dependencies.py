from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.firebase import verify_firebase_token
from typing import Optional

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to get current authenticated user from Firebase token.
    
    Raises:
        HTTPException: 401 if token is invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
        )
    
    token = credentials.credentials
    decoded_token = await verify_firebase_token(token)
    
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    return decoded_token

async def get_current_user_optional(
    request: Request,
) -> Optional[dict]:
    """
    Optional authentication - returns user if token is valid, None otherwise.
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    return await verify_firebase_token(token)

async def admin_only(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to ensure the user has admin privileges.
    """
    if not user.get("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user
