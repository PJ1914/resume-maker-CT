"""
Scoring endpoints for ATS resume analysis.
"""

import time
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict
from app.schemas.scoring import ScoringRequest, ScoringResponse
from app.dependencies import get_current_user
from app.services.firestore import get_resume_metadata
from app.services.gemini_scorer import HybridScorer
from app.services.cache import get_cached_score, set_cached_score
from app.services.audit import log_scoring_request, check_rate_limit
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
        resume_metadata = get_resume_metadata(resume_id, uid)
        if not resume_metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Check if resume has been parsed
        if not hasattr(resume_metadata, 'parsed_text') or not resume_metadata.parsed_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume must be parsed before scoring. Status: " + resume_metadata.status
            )
        
        # Check cache if enabled
        cached_result = None
        if request.use_cache:
            cached_result = await get_cached_score(resume_id, request.job_description)
            
            if cached_result:
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
        
        # Check rate limit for Gemini calls
        if request.prefer_gemini:
            within_limit = await check_rate_limit(uid, settings.MAX_GEMINI_CALLS_PER_USER_PER_DAY)
            if not within_limit:
                logger.warning(f"User {uid} exceeded Gemini rate limit, falling back to local scorer")
                request.prefer_gemini = False
        
        # Prepare parsed data
        parsed_data = {
            'parsed_text': resume_metadata.parsed_text,
            'sections': getattr(resume_metadata, 'sections', {}),
            'contact_info': getattr(resume_metadata, 'contact_info', {}),
            'skills': getattr(resume_metadata, 'skills', []),
            'layout_type': getattr(resume_metadata, 'layout_type', 'unknown'),
        }
        
        # Score resume
        scorer = HybridScorer()
        score_result = scorer.score_resume(
            parsed_data,
            job_description=request.job_description,
            prefer_gemini=request.prefer_gemini
        )
        
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
        
        # Cache result
        if request.use_cache:
            await set_cached_score(resume_id, score_result, request.job_description)
        
        # Add resume_id and cached flag
        score_result['resume_id'] = resume_id
        score_result['cached'] = False
        
        return ScoringResponse(**score_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scoring error for resume {resume_id}: {e}")
        
        # Log error
        await log_scoring_request(
            resume_id=resume_id,
            user_id=uid,
            scoring_method='unknown',
            job_description_provided=request.job_description is not None,
            cache_hit=False,
            success=False,
            error_message=str(e)
        )
        
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
    
    Returns the cached score if available, otherwise returns None.
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
        
        # Try to get cached score
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
