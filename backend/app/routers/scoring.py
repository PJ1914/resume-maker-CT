"""
Scoring endpoints for ATS resume analysis.
"""

import time
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict
from app.schemas.scoring import ScoringRequest, ScoringResponse
from app.dependencies import get_current_user
from app.services.firestore import get_resume_metadata
from app.services.ats_scorer import ATSScorer
from app.services.gemini_scorer import HybridScorer
from app.services.cache import get_cached_score, set_cached_score
from app.services.audit import log_scoring_request, check_rate_limit
from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS, get_user_credits
from app.services.email_service import EmailService
from app.config import settings
import logging

router = APIRouter(tags=["scoring"])
logger = logging.getLogger(__name__)


@router.post("/{resume_id}", response_model=ScoringResponse)
async def score_resume(
    resume_id: str,
    request: ScoringRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Score a resume using Gemini AI or local scorer.
    
    - **resume_id**: ID of the resume to score
    - **job_description**: Optional job description for matching
    - **use_cache**: Whether to use cached results (default: true)
    - **prefer_gemini**: Prefer Gemini over local scorer (default: true)
    
    Returns comprehensive ATS score with suggestions.
    """
    uid = current_user['uid']
    start_time = time.time()
    
    try:
        # Verify resume exists and belongs to user
        # Use get_merged_resume_data to include any manual edits from the editor
        from app.services.firestore import get_merged_resume_data
        
        try:
            resume_data = get_merged_resume_data(resume_id, uid)
        except Exception as e:
            logger.error(f"Error retrieving resume {resume_id} for user {uid}: {e}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found or cannot be accessed"
            )
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Check if resume has been parsed or has content
        parsed_text = resume_data.get('parsed_text')
        contact_info = resume_data.get('contact_info', {})
        sections = resume_data.get('sections', {})
        resume_status = resume_data.get('status', 'UNKNOWN')
        
        # Handle sections - it can be either a dict or a list depending on source
        if isinstance(sections, list):
            sections = {}  # Convert to empty dict if it's a list
        
        # Build comprehensive parsed_text from structured data if missing or minimal
        # This is crucial for wizard-created resumes which only store summary in parsed_text
        def build_comprehensive_text(resume_data: Dict, contact_info: Dict, sections: Dict) -> str:
            """Build a complete text representation of the resume for ATS scoring."""
            text_parts = []
            
            # Contact Information
            if contact_info:
                name = contact_info.get('name', '')
                email = contact_info.get('email', '')
                phone = contact_info.get('phone', '')
                location = contact_info.get('location', '')
                
                contact_line = f"{name}"
                if email:
                    contact_line += f" | {email}"
                if phone:
                    contact_line += f" | {phone}"
                if location:
                    contact_line += f" | {location}"
                
                text_parts.append(contact_line)
                
                # Social/Portfolio links
                links = []
                if contact_info.get('linkedin'):
                    links.append(f"LinkedIn: {contact_info['linkedin']}")
                if contact_info.get('github'):
                    links.append(f"GitHub: {contact_info['github']}")
                if contact_info.get('website'):
                    links.append(f"Website: {contact_info['website']}")
                if links:
                    text_parts.append(' | '.join(links))
            
            # Professional Summary
            summary = sections.get('summary') or resume_data.get('professional_summary', '')
            if summary:
                text_parts.append("\nPROFESSIONAL SUMMARY")
                text_parts.append(summary)
            
            # Skills
            skills = resume_data.get('skills', {})
            if skills:
                text_parts.append("\nSKILLS")
                if isinstance(skills, dict):
                    technical = skills.get('technical', [])
                    soft = skills.get('soft', [])
                    if technical:
                        text_parts.append(f"Technical Skills: {', '.join(technical)}")
                    if soft:
                        text_parts.append(f"Soft Skills: {', '.join(soft)}")
                elif isinstance(skills, list):
                    for skill_cat in skills:
                        if isinstance(skill_cat, dict):
                            cat_name = skill_cat.get('category', 'Skills')
                            items = skill_cat.get('items', [])
                            if items:
                                text_parts.append(f"{cat_name}: {', '.join(items)}")
            
            # Experience
            experience = resume_data.get('experience', [])
            if experience:
                text_parts.append("\nEXPERIENCE")
                for exp in experience:
                    if isinstance(exp, dict):
                        company = exp.get('company', '')
                        position = exp.get('position', '') or exp.get('title', '')
                        location = exp.get('location', '')
                        start_date = exp.get('startDate', '')
                        end_date = exp.get('endDate', 'Present')
                        description = exp.get('description', '')
                        
                        exp_line = f"{position} at {company}"
                        if location:
                            exp_line += f", {location}"
                        if start_date:
                            exp_line += f" ({start_date} - {end_date})"
                        text_parts.append(exp_line)
                        
                        if description:
                            # Handle both string and list descriptions
                            if isinstance(description, list):
                                for bullet in description:
                                    text_parts.append(f"• {bullet}")
                            else:
                                text_parts.append(description)
            
            # Education
            education = resume_data.get('education', [])
            if education:
                text_parts.append("\nEDUCATION")
                for edu in education:
                    if isinstance(edu, dict):
                        school = edu.get('school', '') or edu.get('institution', '')
                        degree = edu.get('degree', '')
                        field = edu.get('field', '')
                        gpa = edu.get('gpa', '')
                        start_date = edu.get('startDate', '')
                        end_date = edu.get('endDate', '')
                        
                        edu_line = f"{degree}"
                        if field:
                            edu_line += f" in {field}"
                        edu_line += f" from {school}"
                        if start_date or end_date:
                            edu_line += f" ({start_date or ''} - {end_date or ''})"
                        if gpa:
                            edu_line += f" | GPA: {gpa}"
                        text_parts.append(edu_line)
            
            # Projects
            projects = resume_data.get('projects', [])
            if projects:
                text_parts.append("\nPROJECTS")
                for proj in projects:
                    if isinstance(proj, dict):
                        name = proj.get('name', '')
                        description = proj.get('description', '')
                        technologies = proj.get('technologies', [])
                        
                        text_parts.append(f"{name}")
                        if description:
                            text_parts.append(description)
                        if technologies:
                            tech_str = ', '.join(technologies) if isinstance(technologies, list) else technologies
                            text_parts.append(f"Technologies: {tech_str}")
            
            # Certifications
            certifications = resume_data.get('certifications', [])
            if certifications:
                text_parts.append("\nCERTIFICATIONS")
                for cert in certifications:
                    if isinstance(cert, dict):
                        name = cert.get('name', '')
                        issuer = cert.get('issuer', '')
                        date = cert.get('date', '')
                        cert_line = name
                        if issuer:
                            cert_line += f" - {issuer}"
                        if date:
                            cert_line += f" ({date})"
                        text_parts.append(cert_line)
            
            # Achievements
            achievements = resume_data.get('achievements', [])
            if achievements:
                text_parts.append("\nACHIEVEMENTS")
                for ach in achievements:
                    if isinstance(ach, dict):
                        title = ach.get('title', '')
                        description = ach.get('description', '')
                        text_parts.append(f"• {title}: {description}" if description else f"• {title}")
            
            # Languages
            languages = resume_data.get('languages', [])
            if languages:
                text_parts.append("\nLANGUAGES")
                lang_items = []
                for lang in languages:
                    if isinstance(lang, dict):
                        name = lang.get('language', '') or lang.get('name', '')
                        proficiency = lang.get('proficiency', '')
                        if name:
                            lang_items.append(f"{name} ({proficiency})" if proficiency else name)
                if lang_items:
                    text_parts.append(', '.join(lang_items))
            
            return '\n'.join(text_parts)
        
        # Check if parsed_text is missing or too short (only summary)
        has_structured_data = bool(resume_data.get('experience') or resume_data.get('education') or resume_data.get('projects'))
        is_parsed_text_minimal = not parsed_text or len(parsed_text) < 500
        
        if is_parsed_text_minimal and has_structured_data:
            # Build comprehensive text from structured data
            logger.info(f"Building comprehensive parsed_text from structured data for resume {resume_id}")
            parsed_text = build_comprehensive_text(resume_data, contact_info, sections)
            logger.debug(f"Built parsed_text length: {len(parsed_text)} characters")
        elif not parsed_text:
            # For wizard-created resumes, check if we have contact info or sections as fallback
            if not contact_info and not sections:
                # Provide helpful error message based on status
                if resume_status == 'UPLOADED':
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Resume is being processed. Please wait a few moments and try again."
                    )
                elif resume_status == 'PARSING':
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Resume is currently being parsed. Please wait and try again in a few seconds."
                    )
                elif resume_status == 'ERROR':
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Resume parsing failed. Please re-upload your resume."
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Resume must be parsed before scoring. Current status: {resume_status}"
                    )
            
            # Use contact info and sections as fallback for parsed text
            parsed_text = f"Resume for {contact_info.get('name', 'Unknown')} from {contact_info.get('location', 'Unknown')}"
            if sections.get('summary'):
                parsed_text += f"\n\n{sections.get('summary')}"
        
        # Determine requested scorer type
        requested_scorer = 'gemini' if request.prefer_gemini else 'local'
        logger.info(f"Scoring request for resume {resume_id} with prefer_gemini={request.prefer_gemini} (scorer: {requested_scorer})")
        
        # Check cache if enabled - pass scorer type to ensure we get the right cached result
        cached_result = None
        if request.use_cache:
            cached_result = await get_cached_score(resume_id, request.job_description, scorer_type=requested_scorer)
            
            if cached_result:
                # Add current credits balance to cached response
                user_credits = get_user_credits(uid)
                cached_result['credits_remaining'] = user_credits['balance']
                cached_result['credits_used'] = 0  # No credits used for cached response
                
                # Log cache hit
                await log_scoring_request(
                    resume_id=resume_id,
                    user_id=uid,
                    scoring_method=cached_result.get('scoring_method', 'unknown'),
                    job_description_provided=request.job_description is not None,
                    cache_hit=True,
                    total_score=cached_result.get('total_score'),
                    rating=cached_result.get('rating'),
                    success=True
                )
                
                return ScoringResponse(**cached_result)
        
        # Check credits ONLY for Gemini/AI scoring (Local is free)
        if request.prefer_gemini:
            if not has_sufficient_credits(uid, FeatureType.ATS_SCORING):
                user_credits = get_user_credits(uid)
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "message": "Insufficient credits for AI scoring. Use Local (Free) instead.",
                        "current_balance": user_credits["balance"],
                        "required": FEATURE_COSTS[FeatureType.ATS_SCORING]
                    }
                )

        # Check rate limit for Gemini calls
        if request.prefer_gemini:
            within_limit = await check_rate_limit(uid, settings.MAX_GEMINI_CALLS_PER_USER_PER_DAY)
            if not within_limit:
                logger.warning(f"User {uid} exceeded Gemini rate limit, falling back to local scorer")
                request.prefer_gemini = False
        
        # Prepare parsed data
        parsed_data = {
            'parsed_text': parsed_text,
            'sections': sections,
            'contact_info': contact_info,
            'skills': resume_data.get('skills', {}),
            'experience': resume_data.get('experience', []),
            'education': resume_data.get('education', []),
            'projects': resume_data.get('projects', []),
            'layout_type': resume_data.get('layout_type', 'unknown'),
        }
        
        # Score resume using HybridScorer (prefers Gemini if available)
        logger.info(f"Calling HybridScorer with prefer_gemini={request.prefer_gemini}")
        scorer = HybridScorer()
        score_result = scorer.score_resume(
            parsed_data,
            job_description=request.job_description,
            prefer_gemini=request.prefer_gemini
        )
        logger.info(f"Scoring completed. Method used: {score_result.get('scoring_method', 'unknown')}")
        
        # Deduct credits ONLY for Gemini/AI scoring (Local is free)
        actual_method = score_result.get('scoring_method', 'local')
        credits_result = None
        if actual_method == 'gemini':
            credits_result = deduct_credits(uid, FeatureType.ATS_SCORING, f"AI Scoring for resume {resume_id}")
            if credits_result['success']:
                logger.info(f"Credits deducted for Gemini AI scoring. New balance: {credits_result['new_balance']}")
                score_result['credits_remaining'] = credits_result['new_balance']
                score_result['credits_used'] = credits_result['cost']
            else:
                # This shouldn't happen as we checked before, but handle it
                logger.error(f"Credit deduction failed unexpectedly")
        else:
            logger.info(f"Local scoring - no credits deducted (free)")
            # For local scoring, still return current balance
            user_credits = get_user_credits(uid)
            score_result['credits_remaining'] = user_credits['balance']
            score_result['credits_used'] = 0
        
        # Add scoring method
        score_result['scoring_method'] = score_result.get('scoring_method', 'hybrid')
        score_result['model_name'] = score_result.get('model_name', 'Gemini/Local Hybrid Engine')
        
        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Log request
        await log_scoring_request(
            resume_id=resume_id,
            user_id=uid,
            scoring_method=score_result.get('scoring_method', 'local'),
            job_description_provided=request.job_description is not None,
            cache_hit=False,
            total_score=score_result.get('total_score'),
            rating=score_result.get('rating'),
            tokens_used=score_result.get('tokens_used'),
            model_used=score_result.get('model_name'),
            api_latency_ms=latency_ms,
            success=True
        )
        
        # ALWAYS cache result to Firestore (use_cache only controls reading, not writing)
        await set_cached_score(resume_id, score_result, request.job_description)
        
        # Update latest_score in resume metadata
        try:
            from app.services.firestore import update_resume_latest_score
            update_resume_latest_score(resume_id, uid, score_result.get('total_score', 0))
        except Exception as e:
            logger.warning(f"Failed to update latest_score: {e}")
        
        # Send high ATS score notification if score >= 80
        total_score = score_result.get('total_score', 0)
        if total_score >= 80:
            try:
                user_email = current_user.get('email')
                user_name = current_user.get('name') or current_user.get('displayName') or user_email.split('@')[0] if user_email else 'User'
                resume_name = resume_data.get('contact_info', {}).get('name', 'Your Resume')
                rating = score_result.get('rating', 'Excellent')
                
                await EmailService.send_high_ats_score_notification(
                    user_email=user_email,
                    user_name=user_name,
                    resume_name=resume_name,
                    ats_score=total_score,
                    rating=rating
                )
                logger.info(f"✅ High ATS score email sent to {user_email} (score: {total_score})")
            except Exception as email_error:
                logger.error(f"❌ High ATS score email failed: {email_error}")
        
        # Add resume_id and cached flag
        score_result['resume_id'] = resume_id
        score_result['cached'] = False
        
        return ScoringResponse(**score_result)
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Scoring error for resume {resume_id}: {e}")
        
        # Try to log error, but don't fail if logging fails
        try:
            await log_scoring_request(
                resume_id=resume_id,
                user_id=uid,
                scoring_method='unknown',
                job_description_provided=request.job_description is not None,
                cache_hit=False,
                success=False,
                error_message=str(e)
            )
        except Exception as log_err:
            logger.warning(f"Failed to log scoring error: {log_err}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scoring failed: {str(e)}"
        )


@router.get("/{resume_id}", response_model=ScoringResponse)
async def get_resume_score(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the latest score for a resume.
    
    - **resume_id**: ID of the resume
    
    Returns the cached score if available.
    """
    uid = current_user['uid']
    
    try:
        # Verify resume exists and belongs to user
        resume_metadata = get_resume_metadata(resume_id, uid)
        if not resume_metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Get cached score from Firestore
        cached_result = await get_cached_score(resume_id, job_description=None)
        
        if cached_result:
            cached_result['resume_id'] = resume_id
            cached_result['cached'] = True
            return ScoringResponse(**cached_result)
        
        # No score available
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No score available for this resume. Please score it first."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching score for resume {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch score: {str(e)}"
        )


@router.get("/stats")
async def get_scoring_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Get scoring usage statistics for current user.
    
    Returns:
    - Total scoring requests
    - Gemini vs local breakdown
    - Cache hit rate
    - Total cost
    - Average latency
    """
    from app.services.audit import get_user_usage_stats
    from app.services.cache import get_cache_stats
    
    try:
        # Get usage stats
        usage_stats = await get_user_usage_stats(current_user['uid'], days=30)
        
        # Get cache stats (global)
        cache_stats = await get_cache_stats()
        
        return {
            'user_stats': usage_stats,
            'cache_stats': cache_stats,
            'rate_limit': {
                'max_gemini_per_day': settings.MAX_GEMINI_CALLS_PER_USER_PER_DAY,
                'gemini_used_today': usage_stats.get('gemini_requests', 0) - usage_stats.get('cache_hits', 0)
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        )
