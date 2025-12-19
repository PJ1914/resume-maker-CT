"""
Portfolio generation and deployment endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging
import uuid

from app.dependencies import get_current_user
from app.services.credits import get_user_credits, deduct_credits_custom, has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS
from app.services.portfolio_generator import PortfolioGeneratorService
from app.services.github_deploy import GitHubDeployService
from app.services.vercel_deploy import VercelDeployService
from app.services.netlify_deploy import NetlifyDeployService
from app.firebase import resume_maker_app
from firebase_admin import firestore, storage
from google.cloud.firestore import FieldFilter

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
    is_available: bool = True
    is_coming_soon: bool = False


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
    force_new: bool = False  # Force creating a new session even if existing one found
    profile_photo: str | None = None  # URL to uploaded profile photo
    project_images: Dict[str, str] = {}  # Map of project_id -> image_url


class DeployPortfolioRequest(BaseModel):
    session_id: str
    repo_name: str
    zip_url: str
    platform: str = "github"  # github, vercel, netlify
    custom_domain: Optional[str] = None


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
    template_name: str | None = None
    html_preview: str = ""
    zip_url: str = ""
    created_at: datetime | None = None
    deployed: bool = False
    deployments: List[Dict[str, Any]] = []  # Array of all deployments
    repo_url: str | None = None  # Legacy - kept for backwards compatibility
    pages_url: str | None = None  # Legacy - kept for backwards compatibility
    deployed_at: datetime | None = None
    last_deployed_at: datetime | None = None
    last_deployment_platform: str | None = None
    last_deployment_url: str | None = None
    deployment_count: int = 0
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
        
        # Check if template requires purchase (price > 0)
        requires_purchase = template_data.get('price_credits', 0) > 0
        if requires_purchase and request.template_id not in unlocked:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Template not unlocked. Purchase it first for ₹{template_data['price_inr']} or {template_data['price_credits']} credits."
            )
        
        # Check if user already has a session for this resume+template combination
        # Only reuse if force_new is False
        existing_session = None
        if not request.force_new:
            existing_sessions = db.collection('portfolio_sessions').where(
                filter=FieldFilter('user_id', '==', user_id)
            ).where(
                filter=FieldFilter('resume_id', '==', request.resume_id)
            ).where(
                filter=FieldFilter('template_id', '==', request.template_id)
            ).stream()
            
            for session_doc in existing_sessions:
                session_data = session_doc.to_dict()
                # Check if session exists
                if session_data:
                    # Regenerate signed URL (old one may have expired - 24h validity)
                    try:
                        from datetime import timedelta
                        bucket = storage.bucket(app=resume_maker_app)
                        blob = bucket.blob(f"portfolios/{user_id}/{session_doc.id}.zip")
                        
                        # Check if blob exists
                        if blob.exists():
                            # Generate new signed URL valid for 24 hours
                            fresh_zip_url = blob.generate_signed_url(
                                expiration=timedelta(hours=24),
                                method='GET',
                                version='v4'
                            )
                            
                            # Update session with fresh URL
                            session_doc.reference.update({'zip_url': fresh_zip_url})
                            
                            existing_session = {
                                'session_id': session_doc.id,
                                'html_preview': session_data.get('html_preview', ''),
                                'zip_url': fresh_zip_url,
                                'ai_enhanced': session_data.get('ai_enhanced', False)
                            }
                            logger.info(f"♻️ Reusing existing portfolio session with fresh URL: {session_doc.id}")
                            break
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to regenerate ZIP URL for session {session_doc.id}: {e}")
                        continue
        
        # If no existing session, generate new portfolio
        if not existing_session:
            generator = PortfolioGeneratorService()
            result = await generator.generate(
                user_id=user_id,
                resume_id=request.resume_id,
                template_id=request.template_id,
                theme=request.theme,
                accent_color=request.accent_color,
                font_style=request.font_style,
                use_ai_enhancement=request.use_ai_enhancement,
                profile_photo=request.profile_photo,
                project_images=request.project_images
            )
            
            # LOCK TEMPLATE: Remove from unlocked list after first use
            # Template is consumed on first portfolio generation (only for paid templates)
            requires_purchase = template_data.get('price_credits', 0) > 0
            if requires_purchase and request.template_id in unlocked:
                unlocked.remove(request.template_id)
                user_doc.reference.update({'unlocked_templates': unlocked})
                logger.info(f"🔒 Template {request.template_id} locked after use")
        else:
            # Use existing session
            result = existing_session
        
        return {
            "success": True,
            "session_id": result['session_id'],
            "html_preview": result['html_preview'],
            "zip_url": result['zip_url'],
            "ai_enhanced": result.get('ai_enhanced', False),
            "template_name": template_data['name'],
            "credits_remaining": get_user_credits(user_id).get('balance', 0),
            "reused_existing": existing_session is not None
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
    user_email = current_user.get("email", "")
    db = firestore.client(app=resume_maker_app)
    
    # Determine which feature type based on platform
    platform_feature_map = {
        "github": FeatureType.DEPLOY_GHPAGES,
        "vercel": FeatureType.DEPLOY_VERCEL,
        "netlify": FeatureType.DEPLOY_NETLIFY
    }
    
    if request.platform not in platform_feature_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid platform. Supported: github, vercel, netlify"
        )
    
    feature_type = platform_feature_map[request.platform]
    
    # Check if user has sufficient credits
    if not has_sufficient_credits(user_id, feature_type, user_email):
        user_credits = get_user_credits(user_id, user_email)
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "message": f"Insufficient credits to deploy to {request.platform}",
                "current_balance": user_credits["balance"],
                "required": FEATURE_COSTS[feature_type]
            }
        )
    
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
                github_token=deployment_token,
                custom_domain=request.custom_domain
            )
        elif request.platform == "vercel":
            deploy_service = VercelDeployService()
            result = await deploy_service.deploy(
                user_id=user_id,
                session_id=request.session_id,
                project_name=repo_name,
                zip_url=request.zip_url,
                vercel_token=deployment_token,
                custom_domain=request.custom_domain
            )
        elif request.platform == "netlify":
            deploy_service = NetlifyDeployService()
            result = await deploy_service.deploy(
                user_id=user_id,
                session_id=request.session_id,
                site_name=repo_name,
                zip_url=request.zip_url,
                netlify_token=deployment_token,
                custom_domain=request.custom_domain
            )
        
        # Get current session data for deployments array
        session_doc = db.collection('portfolio_sessions').document(request.session_id).get()
        session_data = session_doc.to_dict() if session_doc.exists else {}
        current_deployments = session_data.get('deployments', [])
        
        # Calculate credits cost based on platform
        credits_cost = {
            'github': 3,
            'netlify': 5,
            'vercel': 7
        }.get(request.platform, 3)
        
        # Keep old deployments for history (don't remove)
        # Mark old deployments for same platform as 'replaced'
        for d in current_deployments:
            if d.get('platform') == request.platform and d.get('status') == 'active':
                d['status'] = 'replaced'
                d['replaced_at'] = datetime.utcnow()
        
        # Add new deployment (use datetime instead of SERVER_TIMESTAMP for array items)
        new_deployment = {
            'platform': request.platform,
            'repo_name': repo_name,
            'repo_url': result.get('repo_url'),
            'live_url': result.get('url'),
            'deployed_at': datetime.utcnow(),
            'credits_spent': credits_cost,
            'status': 'active'
        }
        
        if request.custom_domain:
            new_deployment['custom_domain'] = request.custom_domain
        
        current_deployments.append(new_deployment)
        
        # Update session with deployment results
        session_doc.reference.update({
            'deployed': True,
            'deployed_at': firestore.SERVER_TIMESTAMP,
            'deployments': current_deployments,
            'deployment_platform': request.platform,
            'repo_url': result.get('repo_url'),  # Legacy field
            'pages_url': result.get('url'),  # Legacy field
            'repo_name': repo_name,
            'last_deployed_at': firestore.SERVER_TIMESTAMP,
            'last_deployment_platform': request.platform
        })
        
        # NO CONSUMPTION: Template stays unlocked for future deployments
        # Users can re-deploy to multiple platforms unlimited times
        # Only deployment credits are charged per platform
        
        # Deduct credits after successful deployment
        deduct_credits(user_id, feature_type, f"Deployed portfolio to {request.platform}", user_email)
        
        response = {
            "success": True,
            "platform": request.platform,
            "repo_url": result.get('repo_url'),
            "live_url": result.get('url'),
            "status": result.get('status'),
            "repo_name": repo_name,
            "message": result.get('message', f"✅ Successfully deployed to {request.platform.title()}!"),
            "credits_remaining": get_user_credits(user_id).get('balance', 0)
        }
        
        # Include custom domain and DNS instructions if present (GitHub Pages)
        if result.get('custom_domain'):
            response['custom_domain'] = result['custom_domain']
        if result.get('dns_instructions'):
            response['dns_instructions'] = result['dns_instructions']
        
        return response
        
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
            
            # MIGRATION: Convert old single deployment to new deployments array format
            if data.get('deployed') and not data.get('deployments'):
                deployments = []
                
                # Check if there's a deployment_platform (single deployment)
                platform = data.get('deployment_platform') or data.get('last_deployment_platform') or 'github'
                repo_url = data.get('repo_url')
                pages_url = data.get('pages_url')
                repo_name = data.get('repo_name')
                
                if repo_url or pages_url:
                    deployments.append({
                        'platform': platform,
                        'repo_name': repo_name or 'portfolio',
                        'repo_url': repo_url,
                        'live_url': pages_url,
                        'deployed_at': data.get('deployed_at') or data.get('created_at')
                    })
                    
                data['deployments'] = deployments
            
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


@router.patch("/sessions/{session_id}/deployment-domain")
async def update_deployment_domain(
    session_id: str,
    platform: str = Query(..., description="Platform to update domain for"),
    custom_domain: str = Query(..., description="New custom domain"),
    current_user: dict = Depends(get_current_user)
):
    """Update custom domain for a specific deployment"""
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
                detail="Not authorized to update this session"
            )
        
        # Update the custom_domain for the active deployment on specified platform
        deployments = session_data.get('deployments', [])
        updated = False
        
        for deployment in deployments:
            if deployment.get('platform') == platform and deployment.get('status') == 'active':
                deployment['custom_domain'] = custom_domain
                deployment['domain_updated_at'] = datetime.utcnow()
                updated = True
                break
        
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active deployment found for platform: {platform}"
            )
        
        # Save updated deployments
        session_ref.update({'deployments': deployments})
        
        return {
            "success": True,
            "message": f"Custom domain updated for {platform}",
            "custom_domain": custom_domain
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to update custom domain for session {session_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update custom domain: {str(e)}"
        )


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
            
        # Remote Deletion Logic - Delete from ALL deployed platforms
        deployments = session_data.get('deployments', [])
        is_deployed = session_data.get('deployed', False)
        deletion_errors = []
        
        logger.info(f"🔍 DELETE SESSION - ID: {session_id}")
        logger.info(f"   - deployed: {is_deployed}")
        logger.info(f"   - deployments array: {deployments}")
        logger.info(f"   - repo_url: {session_data.get('repo_url')}")
        logger.info(f"   - pages_url: {session_data.get('pages_url')}")
        
        if is_deployed and deployments:
            try:
                user_doc = db.collection('users').document(user_id).get()
                user_data = user_doc.to_dict() if user_doc.exists else {}
                
                # Delete from each platform
                for deployment in deployments:
                    platform = deployment.get('platform')
                    
                    try:
                        if platform == "github":
                            token = None
                            if user_data.get('github') and isinstance(user_data['github'], dict):
                                token = user_data['github'].get('accessToken')
                            if not token:
                                token = user_data.get('github_token') or user_data.get('githubToken')
                            
                            repo_name = deployment.get('repo_name')
                            repo_url = deployment.get('repo_url')
                            
                            logger.info(f"🔍 Attempting GitHub deletion - repo_name: {repo_name}, repo_url: {repo_url}")
                            
                            # Extract owner/repo from URL if repo_name is just the repo name
                            if repo_url and 'github.com' in repo_url:
                                parts = repo_url.rstrip('/').split('/')
                                if len(parts) >= 2:
                                    # Extract owner/repo from https://github.com/owner/repo
                                    owner_repo = f"{parts[-2]}/{parts[-1]}"
                                    repo_name = owner_repo
                                    logger.info(f"📝 Extracted from URL: {repo_name}")
                            
                            if not token:
                                logger.warning("⚠️ No GitHub token found, skipping deletion")
                                deletion_errors.append(f"GitHub: No token found")
                            elif not repo_name:
                                logger.warning("⚠️ No repo name found, skipping deletion")
                                deletion_errors.append(f"GitHub: No repo name found")
                            else:
                                logger.info(f"🗑️ Deleting GitHub repository: {repo_name}")
                                service = GitHubDeployService()
                                service.delete_repository(repo_name, token)
                                logger.info(f"✅ Successfully deleted GitHub repository: {repo_name}")
                            
                        elif platform == "vercel":
                            token = user_data.get('vercel', {}).get('token')
                            project_name = deployment.get('repo_name')
                            if token and project_name:
                                service = VercelDeployService()
                                service.delete_project(project_name, token)
                                logger.info(f"✅ Deleted Vercel project: {project_name}")
                            
                        elif platform == "netlify":
                            token = user_data.get('netlify', {}).get('token')
                            # For Netlify, we need to extract site_id from live_url or store it separately
                            live_url = deployment.get('live_url', '')
                            if token and live_url:
                                # Try to get site_id from URL or deployment result
                                site_id = None
                                dep_res = session_data.get('deployment_result', {})
                                if dep_res.get('site_id'):
                                    site_id = dep_res.get('site_id')
                                
                                if site_id:
                                    service = NetlifyDeployService()
                                    service.delete_site(site_id, token)
                                    logger.info(f"✅ Deleted Netlify site: {site_id}")
                    
                    except Exception as platform_error:
                        error_msg = f"Failed to delete {platform}: {str(platform_error)}"
                        logger.error(error_msg)
                        deletion_errors.append(error_msg)

            except Exception as e:
                logger.error(f"Failed to delete remote resources: {e}")
                deletion_errors.append(str(e))

        # Delete session from Firestore
        session_ref.delete()
        
        # Return appropriate message
        if deletion_errors:
            return {
                "success": True, 
                "message": f"Session deleted from history. Some remote deletions failed: {'; '.join(deletion_errors)}"
            }
        elif deployments:
            return {
                "success": True, 
                "message": f"Session and all {len(deployments)} deployment(s) deleted successfully"
            }
        else:
            return {"success": True, "message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete session: {str(e)}"
        )


@router.post("/redeploy/{session_id}")
async def redeploy_portfolio(
    session_id: str,
    platform: str,
    repo_name: str,
    custom_domain: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Re-deploy an existing portfolio session to any platform without regenerating.
    This allows users to deploy the same portfolio to multiple platforms or re-deploy after changes.
    
    Costs: Deployment credits only (3-7 credits depending on platform)
    No template purchase required - user already owns the template
    """
    if not resume_maker_app:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase not configured"
        )
    
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    db = firestore.client(app=resume_maker_app)
    
    # Validate platform
    platform_feature_map = {
        "github": FeatureType.DEPLOY_GHPAGES,
        "vercel": FeatureType.DEPLOY_VERCEL,
        "netlify": FeatureType.DEPLOY_NETLIFY
    }
    
    if platform not in platform_feature_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid platform. Supported: github, vercel, netlify"
        )
    
    feature_type = platform_feature_map[platform]
    
    # Check if user has sufficient credits for deployment
    if not has_sufficient_credits(user_id, feature_type, user_email):
        user_credits = get_user_credits(user_id, user_email)
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "message": f"Insufficient credits to deploy to {platform}",
                "current_balance": user_credits["balance"],
                "required": FEATURE_COSTS[feature_type]
            }
        )
    
    try:
        # Get session details
        session_doc = db.collection('portfolio_sessions').document(session_id).get()
        
        if not session_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio session not found"
            )
        
        session_data = session_doc.to_dict()
        
        # Verify session belongs to user
        if session_data.get('user_id') != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to deploy this session"
            )
        
        # Get ZIP URL from session
        zip_url = session_data.get('zip_url')
        if not zip_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session has no ZIP file for deployment"
            )
        
        # Get user's platform tokens
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        # Execute deployment based on platform
        result = {}
        
        if platform == "github":
            # Get GitHub token
            github_token = None
            if user_data.get('github') and isinstance(user_data['github'], dict):
                github_token = user_data['github'].get('accessToken')
            if not github_token:
                github_token = user_data.get('github_token') or user_data.get('githubToken')
            
            if not github_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub not linked. Please authenticate with GitHub first."
                )
            
            service = GitHubDeployService()
            result = await service.deploy(
                user_id=user_id,
                session_id=session_id,
                repo_name=repo_name,
                zip_url=zip_url,
                github_token=github_token,
                custom_domain=custom_domain
            )
            
        elif platform == "vercel":
            vercel_token = user_data.get('vercel', {}).get('token')
            if not vercel_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Vercel not linked. Please add your Vercel token first."
                )
            
            service = VercelDeployService()
            result = await service.deploy(
                user_id=user_id,
                session_id=session_id,
                project_name=repo_name,
                zip_url=zip_url,
                vercel_token=vercel_token,
                custom_domain=custom_domain
            )
            
        elif platform == "netlify":
            netlify_token = user_data.get('netlify', {}).get('token')
            if not netlify_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Netlify not linked. Please add your Netlify token first."
                )
            
            service = NetlifyDeployService()
            result = await service.deploy(
                user_id=user_id,
                session_id=session_id,
                site_name=repo_name,
                zip_url=zip_url,
                netlify_token=netlify_token,
                custom_domain=custom_domain
            )
        
        # Create a deployment record (keep history of all deployments)
        deployment_record = {
            'platform': platform,
            'repo_name': repo_name,
            'repo_url': result.get('repo_url'),
            'live_url': result.get('url'),
            'deployed_at': firestore.SERVER_TIMESTAMP,
            'status': result.get('status')
        }
        
        # Calculate credits cost based on platform
        credits_cost = {
            'github': 3,
            'netlify': 5,
            'vercel': 7
        }.get(platform, 3)
        
        # Get current deployments array from session
        current_deployments = session_data.get('deployments', [])
        
        # Keep old deployments for history (don't remove)
        # Mark old deployments for same platform as 'replaced'
        for d in current_deployments:
            if d.get('platform') == platform and d.get('status') == 'active':
                d['status'] = 'replaced'
                d['replaced_at'] = datetime.utcnow()
        
        # Add new deployment (use datetime instead of SERVER_TIMESTAMP for array items)
        new_deployment = {
            'platform': platform,
            'repo_name': repo_name,
            'repo_url': result.get('repo_url'),
            'live_url': result.get('url'),
            'deployed_at': datetime.utcnow(),
            'credits_spent': credits_cost,
            'status': 'active'
        }
        
        if custom_domain:
            new_deployment['custom_domain'] = custom_domain
        
        current_deployments.append(new_deployment)
        
        # Update main session with deployments array and set deployed flag
        session_doc.reference.update({
            'deployed': True,
            'deployments': current_deployments,
            'last_deployed_at': firestore.SERVER_TIMESTAMP,
            'last_deployment_platform': platform
        })
        
        # Deduct credits after successful deployment
        deduct_credits(user_id, feature_type, f"Re-deployed portfolio to {platform}", user_email)
        
        response = {
            "success": True,
            "platform": platform,
            "repo_url": result.get('repo_url'),
            "live_url": result.get('url'),
            "status": result.get('status'),
            "repo_name": repo_name,
            "message": result.get('message', f"✅ Successfully re-deployed to {platform.title()}!"),
            "credits_remaining": get_user_credits(user_id, user_email).get('balance', 0)
        }
        
        # Include custom domain and DNS instructions if present (GitHub Pages)
        if result.get('custom_domain'):
            response['custom_domain'] = result['custom_domain']
        if result.get('dns_instructions'):
            response['dns_instructions'] = result['dns_instructions']
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to re-deploy session {session_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to re-deploy portfolio: {str(e)}"
        )


@router.post("/upload-image")
async def upload_portfolio_image(
    file: UploadFile = File(...),
    type: str = Form(...),  # 'profile' or 'project'
    project_id: Optional[str] = Form(None),
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upload images for portfolio (profile photo or project images)
    """
    try:
        user_id = user_data['uid']
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Validate file size (5MB max)
        file_content = await file.read()
        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image size must be less than 5MB"
            )
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Determine storage path based on type
        if type == 'profile':
            storage_path = f"portfolio_images/{user_id}/profile/{unique_filename}"
        elif type == 'project':
            storage_path = f"portfolio_images/{user_id}/projects/{project_id or 'default'}/{unique_filename}"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image type. Must be 'profile' or 'project'"
            )
        
        # Upload to Firebase Storage
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        blob.upload_from_string(file_content, content_type=file.content_type)
        
        # Make the blob publicly accessible
        blob.make_public()
        
        # Get public URL
        image_url = blob.public_url
        
        logger.info(f"✅ Uploaded {type} image for user {user_id}: {storage_path}")
        
        return {
            "success": True,
            "url": image_url,
            "type": type,
            "message": f"{type.title()} image uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to upload image")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
