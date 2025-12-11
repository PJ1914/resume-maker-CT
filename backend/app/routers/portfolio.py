"""
Portfolio generation and deployment endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from app.dependencies import get_current_user
from app.services.credits import get_user_credits, deduct_credits_custom
from app.services.portfolio_generator import PortfolioGeneratorService
from app.services.github_deploy import GitHubDeployService
from app.services.vercel_deploy import VercelDeployService
from app.services.netlify_deploy import NetlifyDeployService
from app.firebase import resume_maker_app
from firebase_admin import firestore

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# Pydantic models
class TemplateMetadata(BaseModel):
    id: str
    name: str
    description: str
    thumbnail_url: str
    preview_url: str
    tier: str = Field(..., pattern="^(basic|standard|premium|ultra)$")
    price_inr: int
    price_credits: int
    features: List[str]
    tags: List[str]


class UnlockTemplateRequest(BaseModel):
    template_id: str
    payment_method: str = Field(..., pattern="^(credits|inr)$")


class GeneratePortfolioRequest(BaseModel):
    resume_id: str
    template_id: str
    theme: str = "light"
    accent_color: str | None = None
    font_style: str | None = None
    use_ai_enhancement: bool = True


class DeployPortfolioRequest(BaseModel):
    session_id: str
    repo_name: str
    zip_url: str
    platform: str = "github"  # github, vercel, netlify


class LinkPlatformTokenRequest(BaseModel):
    platform: str = Field(..., pattern="^(vercel|netlify)$")
    token: str


import logging
logger = logging.getLogger(__name__)


# Helper function for credits


class PortfolioSession(BaseModel):
    id: str
    resume_id: str
    template_id: str
    html_preview: str = ""
    zip_url: str = ""
    created_at: datetime | None = None
    deployed: bool = False
    repo_url: str | None = None
    pages_url: str | None = None
    deployed_at: datetime | None = None
    theme: str | None = None
    accent_color: str | None = None
    font_style: str | None = None
    user_id: str | None = None
    
    class Config:
        extra = 'ignore'




@router.get("/templates", response_model=List[TemplateMetadata])
async def get_templates(
    current_user: dict = Depends(get_current_user)
):
    """Get all available portfolio templates"""
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    try:
        db = firestore.client(app=resume_maker_app)
        templates_ref = db.collection('portfolio_templates')
        templates = []
        
        # Use 10-second timeout for faster failure
        for doc in templates_ref.stream(timeout=10.0):
            data = doc.to_dict()
            data['id'] = doc.id
            templates.append(TemplateMetadata(**data))
        
        return templates
    except Exception as e:
        error_msg = str(e)
        if '503' in error_msg or 'unavailable' in error_msg.lower() or 'timeout' in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="🔌 Firestore connection failed. Please check: 1) Internet connection, 2) Windows Firewall settings, 3) Try: Test-NetConnection firestore.googleapis.com -Port 443"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch templates: {str(e)}"
        )


@router.get("/unlocked-templates", response_model=List[str])
async def get_unlocked_templates(
    current_user: dict = Depends(get_current_user)
):
    """Get template IDs that the user has unlocked"""
    if not resume_maker_app:
        return []
    
    user_id = current_user["uid"]
    
    try:
        db = firestore.client(app=resume_maker_app)
        # Use 10-second timeout
        user_doc = db.collection('users').document(user_id).get(timeout=10.0)
        
        if not user_doc.exists:
            return []
        
        user_data = user_doc.to_dict()
        return user_data.get('unlocked_templates', [])
    except Exception as e:
        error_msg = str(e)
        if '503' in error_msg or 'unavailable' in error_msg.lower() or 'timeout' in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="🔌 Firestore offline. Fix network: 1) Restart router, 2) Disable Windows Firewall temporarily, 3) Check ISP blocks Google Cloud"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch unlocked templates: {str(e)}"
        )


@router.post("/unlock-template")
async def unlock_template(
    request: UnlockTemplateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Unlock a template using credits or INR payment"""
    user_id = current_user["uid"]
    logger.info(f"=== UNLOCK TEMPLATE REQUEST ===")
    logger.info(f"User: {user_id}")
    logger.info(f"Template: {request.template_id}")
    logger.info(f"Payment Method: {request.payment_method}")
    
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    db = firestore.client(app=resume_maker_app)
    
    try:
        # Get template details
        template_ref = db.collection('portfolio_templates').document(request.template_id)
        template_doc = template_ref.get()
        
        if not template_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        template_data = template_doc.to_dict()
        
        logger.info(f"Template data: {template_data.get('name')} - Price: {template_data.get('price_credits')} credits")
        
        # Check if already unlocked
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        # Create user document if it doesn't exist
        if not user_doc.exists:
            user_ref.set({
                'unlocked_templates': [],
                'created_at': datetime.utcnow()
            })
            unlocked = []
        else:
            user_data = user_doc.to_dict()
            unlocked = user_data.get('unlocked_templates', [])
        
        logger.info(f"User currently has {len(unlocked)} unlocked templates")
        
        if request.template_id in unlocked:
            logger.info(f"Template {request.template_id} already unlocked for user {user_id}")
            return {
                "success": True,
                "message": "Template already unlocked",
                "template_id": request.template_id,
                "unlocked_templates": unlocked
            }
        
        # Handle payment method
        if request.payment_method == "credits":
            # Get template price in credits
            price_credits = template_data.get('price_credits', 0)
            
            if price_credits > 0:
                # Get user's credit balance
                user_email = current_user.get('email')
                user_credits_data = get_user_credits(user_id, user_email)
                user_balance = user_credits_data.get('balance', 0)
                
                logger.info(f"User {user_id} has {user_balance} credits, needs {price_credits} to unlock template {request.template_id}")
                
                if user_balance < price_credits:
                    raise HTTPException(
                        status_code=status.HTTP_402_PAYMENT_REQUIRED,
                        detail=f"Insufficient credits. Need {price_credits} credits but you have {user_balance}."
                    )
                
                # Deduct credits
                logger.info(f"Deducting {price_credits} credits from user {user_id}")
                deduction_result = deduct_credits_custom(
                    user_id=user_id,
                    amount=price_credits,
                    description=f"Unlocked portfolio template: {template_data.get('name', request.template_id)}",
                    user_email=user_email
                )
                
                if not deduction_result.get('success'):
                    logger.error(f"Failed to deduct credits for user {user_id}: {deduction_result}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to deduct credits"
                    )
                
                logger.info(f"Successfully deducted {price_credits} credits. New balance: {deduction_result.get('new_balance')}")
        elif request.payment_method == "inr":
            # INR payment already verified via Lambda/DynamoDB/Razorpay
            # Payment verification happens before this endpoint is called
            # Just unlock the template - no additional processing needed
            pass
        
        # Add to unlocked templates
        unlocked.append(request.template_id)
        
        logger.info(f"About to save unlocked_templates: {unlocked}")
        logger.info(f"User ref path: users/{user_id}")
        
        try:
            # Use update instead of set with merge to ensure it works
            user_ref.update({
                'unlocked_templates': unlocked
            })
            logger.info(f"✅ Successfully updated unlocked_templates in Firestore")
        except Exception as write_error:
            logger.error(f"❌ Failed to write unlocked_templates: {write_error}")
            # If update fails (document doesn't exist), use set
            user_ref.set({
                'unlocked_templates': unlocked,
                'created_at': datetime.utcnow()
            }, merge=True)
            logger.info(f"✅ Created user document with unlocked_templates")
        
        # Verify the update
        updated_doc = user_ref.get()
        updated_unlocked = updated_doc.to_dict().get('unlocked_templates', []) if updated_doc.exists else []
        
        logger.info(f"Template {request.template_id} unlocked for user {user_id}")
        logger.info(f"Unlocked templates before: {len(unlocked) - 1}, after: {len(updated_unlocked)}")
        logger.info(f"Verified unlocked templates: {updated_unlocked}")
        
        return {
            "success": True,
            "template_id": request.template_id,
            "unlocked_templates": updated_unlocked,  # Return the verified list
            "credits_deducted": template_data.get('price_credits', 0) if request.payment_method == "credits" else 0,
            "payment_method": request.payment_method
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlock template: {str(e)}"
        )


@router.post("/generate")
async def generate_portfolio(
    request: GeneratePortfolioRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate portfolio HTML from resume data with AI enhancement
    
    Costs: Template price (₹99-2999) or credits (10-300)
    AI enhancement is included by default
    
    Returns:
        - session_id: Portfolio session ID
        - html_preview: Preview HTML
        - zip_url: Download URL for ZIP package
        - ai_enhanced: Whether AI enhancement was used
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        # Get template details with 10-second timeout
        template_ref = db.collection('portfolio_templates').document(request.template_id)
        template_doc = template_ref.get(timeout=10.0)
        
        if not template_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        template_data = template_doc.to_dict()
        
        # Check if template is unlocked (or if it's free)
        user_doc = db.collection('users').document(user_id).get(timeout=10.0)
        user_data = user_doc.to_dict() if user_doc.exists else {}
        unlocked = user_data.get('unlocked_templates', [])
        
        # BASIC tier templates require purchase (₹99-199)
        if template_data['tier'] != 'free' and request.template_id not in unlocked:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Template not unlocked. Purchase it first for ₹{template_data['price_inr']} or {template_data['price_credits']} credits."
            )
        
        # Generate portfolio with AI enhancement
        generator = PortfolioGeneratorService()
        result = await generator.generate(
            user_id=user_id,
            resume_id=request.resume_id,
            template_id=request.template_id,
            theme=request.theme,
            accent_color=request.accent_color,
            font_style=request.font_style,
            use_ai_enhancement=request.use_ai_enhancement
        )
        
        # CONSUME TEMPLATE: Remove from unlocked list after generation
        # User must purchase again for next use (consumable model)
        if template_data['tier'] != 'free' and request.template_id in unlocked:
            unlocked.remove(request.template_id)
            db.collection('users').document(user_id).update({
                'unlocked_templates': unlocked
            })
            logger.info(f"✅ Template {request.template_id} consumed after generation. User must repurchase for next use.")
        
        return {
            "success": True,
            "session_id": result['session_id'],
            "html_preview": result['html_preview'],
            "zip_url": result['zip_url'],
            "ai_enhanced": result.get('ai_enhanced', False),
            "template_name": template_data['name'],
            "credits_remaining": get_user_credits(user_id).get('balance', 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate portfolio: {str(e)}"
        )


@router.post("/deploy")
async def deploy_portfolio(
    request: DeployPortfolioRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Deploy portfolio to GitHub Pages, Vercel, or Netlify.
    Requires appropriate API token/OAuth for the selected platform.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    db = firestore.client(app=resume_maker_app)
    
    try:
        # Get session details
        session_doc = db.collection('portfolio_sessions').document(request.session_id).get()
        if not session_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio session not found"
            )
        
        session_data = session_doc.to_dict()
        if session_data.get('user_id') != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to deploy this portfolio"
            )
        
        repo_name = request.repo_name or f"portfolio-{request.session_id[:8]}"
        
        # Get user data from Firestore
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        # Get appropriate token based on platform
        deployment_token = None
        if request.platform == "github":
            # Check for GitHub token
            if user_data.get('github') and isinstance(user_data['github'], dict):
                deployment_token = user_data['github'].get('accessToken')
            if not deployment_token:
                deployment_token = user_data.get('github_token') or user_data.get('githubToken')
            
            if not deployment_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub authentication required. Please sign in with GitHub to enable deployment."
                )
        
        elif request.platform in ["vercel", "netlify"]:
            # Check for Vercel/Netlify token stored via link-platform endpoint
            platform_data = user_data.get(request.platform, {})
            deployment_token = platform_data.get('token')
            
            if not deployment_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{request.platform.title()} authentication required. Please link your {request.platform.title()} account first."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid platform. Supported: github, vercel, netlify"
            )
        
        # Deploy based on platform
        logger.info(f"🚀 Starting {request.platform} deployment for user {user_id}")
        
        if request.platform == "github":
            deploy_service = GitHubDeployService()
            result = await deploy_service.deploy(
                user_id=user_id,
                session_id=request.session_id,
                repo_name=repo_name,
                zip_url=request.zip_url,
                github_token=deployment_token
            )
        elif request.platform == "vercel":
            deploy_service = VercelDeployService()
            result = await deploy_service.deploy(
                user_id=user_id,
                session_id=request.session_id,
                project_name=repo_name,
                zip_url=request.zip_url,
                vercel_token=deployment_token
            )
        elif request.platform == "netlify":
            deploy_service = NetlifyDeployService()
            result = await deploy_service.deploy(
                user_id=user_id,
                session_id=request.session_id,
                site_name=repo_name,
                zip_url=request.zip_url,
                netlify_token=deployment_token
            )
        
        # Update session with deployment results
        session_doc.reference.update({
            'deployed': True,
            'deployed_at': firestore.SERVER_TIMESTAMP,
            'deployment_result': result,
            'deployment_platform': request.platform,
            'repo_url': result.get('repo_url'),
            'pages_url': result.get('url'),
            'repo_name': repo_name
        })
        
        # CONSUME TEMPLATE: Remove from unlocked list after deployment
        # User must purchase again for next deployment (consumable model)
        template_id = session_data.get('template_id')
        if template_id:
            user_doc_ref = db.collection('users').document(user_id)
            user_doc_data = user_doc_ref.get()
            if user_doc_data.exists:
                user_unlocked = user_doc_data.to_dict().get('unlocked_templates', [])
                if template_id in user_unlocked:
                    user_unlocked.remove(template_id)
                    user_doc_ref.update({'unlocked_templates': user_unlocked})
                    logger.info(f"✅ Template {template_id} consumed after deployment. User must repurchase for next use.")
        
        return {
            "success": True,
            "platform": request.platform,
            "repo_url": result.get('repo_url'),
            "live_url": result.get('url'),
            "status": result.get('status'),
            "repo_name": repo_name,
            "message": result.get('message', f"✅ Successfully deployed to {request.platform.title()}!"),
            "credits_remaining": get_user_credits(user_id).get('balance', 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate deployment instructions: {str(e)}"
        )


@router.get("/sessions", response_model=List[PortfolioSession])
async def get_portfolio_sessions(
    current_user: dict = Depends(get_current_user)
):
    """Get user's portfolio generation history"""
    if not resume_maker_app:
        return []
    
    user_id = current_user["uid"]
    
    try:
        db = firestore.client(app=resume_maker_app)
        sessions_ref = db.collection('portfolio_sessions').where('user_id', '==', user_id).stream()
        
        sessions = []
        for doc in sessions_ref:
            data = doc.to_dict()
            data['id'] = doc.id
            try:
                sessions.append(PortfolioSession(**data))
            except Exception as e:
                # Skip invalid sessions
                continue
        
        # Sort by created_at in Python instead of Firestore
        sessions.sort(key=lambda x: x.created_at if x.created_at else datetime(2000, 1, 1), reverse=True)
        
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch portfolio sessions: {str(e)}"
        )


@router.post("/link-platform")
async def link_platform_token(
    request: LinkPlatformTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Store Vercel or Netlify Personal Access Token for user
    
    The token is stored in Firestore for future deployments.
    User should generate PAT from:
    - Vercel: https://vercel.com/account/tokens
    - Netlify: https://app.netlify.com/user/applications/personal
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    platform = request.platform.lower()
    token = request.token.strip()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token cannot be empty"
        )
    
    try:
        # Verify token is valid by making a test API call
        if platform == "vercel":
            service = VercelDeployService()
            user_info = service._get_user_info(token)
            logger.info(f"✅ Verified Vercel token for user: {user_info.get('username')}")
        elif platform == "netlify":
            service = NetlifyDeployService()
            user_info = service._get_user_info(token)
            logger.info(f"✅ Verified Netlify token for user: {user_info.get('email')}")
        
        # Store token in Firestore
        db = firestore.client(app=resume_maker_app)
        db.collection('users').document(user_id).set({
            platform: {
                'token': token,  # In production, encrypt this
                'linked_at': firestore.SERVER_TIMESTAMP
            }
        }, merge=True)
        
        return {
            "success": True,
            "platform": platform,
            "message": f"{platform.title()} account linked successfully!"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "Invalid" in error_msg or "token" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid {platform.title()} token. Please check your token and try again."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to link {platform.title()} account: {str(e)}"
        )


@router.get("/check-platform/{platform}")
async def check_platform_linked(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check if user has linked Vercel or Netlify account
    
    Returns:
        - linked: bool - Whether the platform is linked
        - platform: str - Platform name
    """
    if not resume_maker_app:
        return {"linked": False, "platform": platform}
    
    if platform not in ["vercel", "netlify"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform must be 'vercel' or 'netlify'"
        )
    
    user_id = current_user["uid"]
    
    try:
        db = firestore.client(app=resume_maker_app)
        user_doc = db.collection('users').document(user_id).get(timeout=10.0)
        
        if not user_doc.exists:
            return {"linked": False, "platform": platform}
        
        user_data = user_doc.to_dict()
        platform_data = user_data.get(platform, {})
        
        has_token = bool(platform_data.get('token'))
        
        return {
            "linked": has_token,
            "platform": platform,
            "linked_at": platform_data.get('linked_at')
        }
        
    except Exception as e:
        logger.error(f"Error checking {platform} status: {str(e)}")
        return {"linked": False, "platform": platform}


@router.delete("/unlink-platform/{platform}")
async def unlink_platform(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove stored Vercel or Netlify token"""
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    if platform not in ["vercel", "netlify"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform must be 'vercel' or 'netlify'"
        )
    
    user_id = current_user["uid"]
    
    try:
        db = firestore.client(app=resume_maker_app)
        db.collection('users').document(user_id).update({
            platform: firestore.DELETE_FIELD
        })
        
        return {
            "success": True,
            "platform": platform,
            "message": f"{platform.title()} account unlinked successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlink {platform}: {str(e)}"
        )


@router.delete("/sessions/{session_id}")
async def delete_portfolio_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a portfolio session from history and remove remote deployment/repository.
    Note: This attempts to delete the actual repository or deployment on the platform if possible.
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    
    try:
        db = firestore.client(app=resume_maker_app)
        session_ref = db.collection('portfolio_sessions').document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session_data = session_doc.to_dict()
        if session_data.get('user_id') != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this session"
            )
            
        # Remote Deletion Logic
        platform = session_data.get('deployment_platform')
        is_deployed = session_data.get('deployed', False)
        
        if is_deployed and platform:
            try:
                user_doc = db.collection('users').document(user_id).get()
                user_data = user_doc.to_dict() if user_doc.exists else {}
                
                if platform == "github":
                    token = None
                    if user_data.get('github') and isinstance(user_data['github'], dict):
                        token = user_data['github'].get('accessToken')
                    if not token:
                        token = user_data.get('github_token') or user_data.get('githubToken')
                    
                    repo_name = session_data.get('repo_name')
                    repo_url = session_data.get('repo_url')
                    if not repo_name and repo_url:
                        parts = repo_url.split('/')
                        if len(parts) >= 5: repo_name = f"{parts[-2]}/{parts[-1]}"
                    
                    if token and repo_name:
                        service = GitHubDeployService()
                        service.delete_repository(repo_name, token)
                        
                elif platform == "vercel":
                    token = user_data.get('vercel', {}).get('token')
                    project_name = session_data.get('repo_name')
                    if token and project_name:
                        service = VercelDeployService()
                        service.delete_project(project_name, token)
                        
                elif platform == "netlify":
                    token = user_data.get('netlify', {}).get('token')
                    dep_res = session_data.get('deployment_result', {})
                    site_id = dep_res.get('site_id')
                    if token and site_id:
                         service = NetlifyDeployService()
                         service.delete_site(site_id, token)

            except Exception as e:
                logger.error(f"Failed to delete remote resources: {e}")
                # We return this as a success but with a warning message
                session_ref.delete()
                return {
                    "success": True, 
                    "message": f"Session deleted from history, but failed to delete remote {platform} repo: {str(e)}"
                }

        session_ref.delete()
        
        return {"success": True, "message": "Session and deployment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete session: {str(e)}"
        )
