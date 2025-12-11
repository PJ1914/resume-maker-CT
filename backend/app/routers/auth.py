from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from firebase_admin import firestore
from app.dependencies import get_current_user
from app.schemas.user import TokenVerifyResponse
from app.firebase import resume_maker_app
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class GitHubTokenRequest(BaseModel):
    github_token: str
    username: str | None = None
    email: str | None = None
    photo_url: str | None = None


class GitHubTokenResponse(BaseModel):
    github_token: str
    username: str | None = None
    email: str | None = None
    photo_url: str | None = None


class DeploymentTokenRequest(BaseModel):
    platform: str  # 'vercel' or 'netlify'
    token: str


class DeploymentTokenResponse(BaseModel):
    platform: str
    has_token: bool


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


@router.post("/github-token")
async def store_github_token(
    request: GitHubTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Store GitHub OAuth token in resume-maker Firestore.
    Called after user signs in with GitHub or links GitHub account.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        user_ref = db.collection('users').document(user_id)
        user_ref.set({
            'github': {
                'accessToken': request.github_token,
                'username': request.username,
                'email': request.email,
                'profileUrl': request.photo_url,
                'linkedAt': firestore.SERVER_TIMESTAMP
            }
        }, merge=True)
        
        logger.info(f"✅ Stored GitHub token for user {user_id}")
        
        return {"success": True, "message": "GitHub token stored successfully"}
    except Exception as e:
        logger.error(f"❌ Failed to store GitHub token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store GitHub token: {str(e)}"
        )


@router.get("/github-token", response_model=GitHubTokenResponse)
async def get_github_token(
    current_user: dict = Depends(get_current_user)
):
    """
    Get GitHub OAuth token from resume-maker Firestore.
    Returns 404 if no token found.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GitHub token not found"
            )
        
        user_data = user_doc.to_dict()
        github_data = user_data.get('github', {})
        
        if not github_data.get('accessToken'):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GitHub token not found"
            )
        
        return GitHubTokenResponse(
            github_token=github_data['accessToken'],
            username=github_data.get('username'),
            email=github_data.get('email'),
            photo_url=github_data.get('profileUrl')
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get GitHub token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get GitHub token: {str(e)}"
        )


@router.delete("/github-token")
async def delete_github_token(
    current_user: dict = Depends(get_current_user)
):
    """
    Delete GitHub OAuth token from resume-maker Firestore.
    Called when user unlinks GitHub account.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        user_ref = db.collection('users').document(user_id)
        user_ref.set({
            'github': firestore.DELETE_FIELD
        }, merge=True)
        
        logger.info(f"✅ Deleted GitHub token for user {user_id}")
        
        return {"success": True, "message": "GitHub token deleted successfully"}
    except Exception as e:
        logger.error(f"❌ Failed to delete GitHub token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete GitHub token: {str(e)}"
        )


@router.post("/deployment-token")
async def store_deployment_token(
    request: DeploymentTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Store Vercel or Netlify API token in resume-maker Firestore.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    if request.platform not in ['vercel', 'netlify']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform must be 'vercel' or 'netlify'"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        user_ref = db.collection('users').document(user_id)
        user_ref.set({
            'deploymentTokens': {
                request.platform: {
                    'token': request.token,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                }
            }
        }, merge=True)
        
        logger.info(f"✅ Stored {request.platform} token for user {user_id}")
        
        return {"success": True, "message": f"{request.platform.title()} token stored successfully"}
    except Exception as e:
        logger.error(f"❌ Failed to store {request.platform} token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store {request.platform} token: {str(e)}"
        )


@router.get("/deployment-token/{platform}", response_model=DeploymentTokenResponse)
async def get_deployment_token(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check if Vercel or Netlify API token exists for user.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    if platform not in ['vercel', 'netlify']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform must be 'vercel' or 'netlify'"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return DeploymentTokenResponse(platform=platform, has_token=False)
        
        user_data = user_doc.to_dict()
        deployment_tokens = user_data.get('deploymentTokens', {})
        has_token = platform in deployment_tokens and 'token' in deployment_tokens[platform]
        
        return DeploymentTokenResponse(platform=platform, has_token=has_token)
    except Exception as e:
        logger.error(f"❌ Failed to check {platform} token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check {platform} token: {str(e)}"
        )


@router.delete("/deployment-token/{platform}")
async def delete_deployment_token(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete Vercel or Netlify API token.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    if platform not in ['vercel', 'netlify']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform must be 'vercel' or 'netlify'"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        user_ref = db.collection('users').document(user_id)
        user_ref.set({
            'deploymentTokens': {
                platform: firestore.DELETE_FIELD
            }
        }, merge=True)
        
        logger.info(f"✅ Deleted {platform} token for user {user_id}")
        
        return {"success": True, "message": f"{platform.title()} token deleted successfully"}
    except Exception as e:
        logger.error(f"❌ Failed to delete {platform} token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete {platform} token: {str(e)}"
        )
