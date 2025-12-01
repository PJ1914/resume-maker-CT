"""
Firestore-based caching service for scoring results.
Uses Firestore instead of Redis for simplicity.
"""

from typing import Optional, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def get_cached_score(
    resume_id: str,
    job_description: Optional[str] = None,
    scorer_type: Optional[str] = None
) -> Optional[Dict]:
    """
    Get cached scoring result from Firestore.
    
    Args:
        resume_id: Resume ID
        job_description: Optional job description (not used currently)
        scorer_type: Optional scorer type ('gemini' or 'local') to match
        
    Returns:
        Cached score data or None if not found or scorer type mismatch
    """
    # Import here to avoid circular imports
    from app.firebase import resume_maker_app
    
    logger.info(f"get_cached_score called for resume_id={resume_id}, scorer_type={scorer_type}")
    
    if not resume_maker_app:
        logger.error("resume_maker_app is None - cannot read cache")
        return None
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        logger.info(f"Fetching from Firestore: scoring_results/{resume_id}")
        doc = db.collection('scoring_results').document(resume_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            logger.info(f"Document found for {resume_id}, scoring_method={data.get('scoring_method', 'unknown')}")
            
            # Check if scorer type matches (if specified)
            if scorer_type:
                cached_scorer = data.get('scoring_method', 'unknown')
                # Match 'gemini' with any gemini variant, 'local' with 'local'
                if scorer_type == 'gemini' and 'gemini' not in cached_scorer:
                    logger.info(f"Cache MISS for resume {resume_id} - scorer mismatch (wanted {scorer_type}, got {cached_scorer})")
                    return None
                elif scorer_type == 'local' and cached_scorer != 'local':
                    logger.info(f"Cache MISS for resume {resume_id} - scorer mismatch (wanted {scorer_type}, got {cached_scorer})")
                    return None
            
            logger.info(f"Cache HIT for resume {resume_id} (scorer: {data.get('scoring_method', 'unknown')})")
            data['cached'] = True
            return data
        
        logger.info(f"Cache MISS for resume {resume_id} - document does not exist")
        return None
        
    except Exception as e:
        logger.error(f"Cache read error for resume {resume_id}: {e}", exc_info=True)
        return None


async def set_cached_score(
    resume_id: str,
    score_data: Dict,
    job_description: Optional[str] = None,
    ttl_hours: int = 24
) -> bool:
    """
    Cache scoring result to Firestore.
    
    Args:
        resume_id: Resume ID
        score_data: Score data to cache
        job_description: Optional job description (stored for reference)
        ttl_hours: Time to live in hours (not enforced, for reference)
        
    Returns:
        Success boolean
    """
    from app.firebase import resume_maker_app
    
    logger.info(f"set_cached_score called for resume_id={resume_id}")
    
    if not resume_maker_app:
        logger.error("resume_maker_app is None - cannot cache")
        return False
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Remove 'cached' flag before storing
        data_to_cache = {k: v for k, v in score_data.items() if k != 'cached'}
        data_to_cache['cached_at'] = datetime.utcnow()
        data_to_cache['job_description'] = job_description
        
        logger.info(f"Saving to Firestore: scoring_results/{resume_id}")
        db.collection('scoring_results').document(resume_id).set(data_to_cache)
        
        logger.info(f"Successfully cached score for resume {resume_id} (scoring_method: {score_data.get('scoring_method', 'unknown')})")
        return True
        
    except Exception as e:
        logger.error(f"Cache write error for resume {resume_id}: {e}", exc_info=True)
        return False


async def invalidate_cache(resume_id: str) -> bool:
    """
    Invalidate cached score for a resume.
    
    Args:
        resume_id: Resume ID
        
    Returns:
        Success boolean
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return False
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        db.collection('scoring_results').document(resume_id).delete()
        logger.info(f"Invalidated cached score for resume {resume_id}")
        return True
        
    except Exception as e:
        logger.error(f"Cache invalidation error: {e}")
        return False


async def get_cache_stats() -> Dict:
    """
    Get cache statistics.
    
    Returns:
        Cache stats dictionary
    """
    return {
        'available': True,
        'type': 'firestore',
        'description': 'Using Firestore for score caching'
    }
