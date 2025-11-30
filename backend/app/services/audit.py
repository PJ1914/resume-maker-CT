"""
Audit logging service for scoring operations.
Tracks token usage, costs, errors, and performance.
"""

import uuid
from typing import Optional, Dict
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# Gemini pricing (as of 2025 - update as needed)
GEMINI_PRICING = {
    'gemini-2.0-flash-exp': {
        'input_per_1k': 0.0,      # Free tier
        'output_per_1k': 0.0,     # Free tier
    },
    'gemini-1.5-flash': {
        'input_per_1k': 0.000075,  # $0.075 per 1M tokens
        'output_per_1k': 0.0003,   # $0.30 per 1M tokens
    },
    'gemini-1.5-pro': {
        'input_per_1k': 0.00125,   # $1.25 per 1M tokens
        'output_per_1k': 0.005,    # $5.00 per 1M tokens
    }
}


def estimate_cost(
    model: str,
    input_tokens: int,
    output_tokens: int
) -> float:
    """
    Estimate API cost based on token usage.
    
    Args:
        model: Gemini model name
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
        
    Returns:
        Estimated cost in USD
    """
    pricing = GEMINI_PRICING.get(model, GEMINI_PRICING['gemini-1.5-flash'])
    
    input_cost = (input_tokens / 1000) * pricing['input_per_1k']
    output_cost = (output_tokens / 1000) * pricing['output_per_1k']
    
    return round(input_cost + output_cost, 6)


async def log_scoring_request(
    resume_id: str,
    user_id: str,
    scoring_method: str,
    job_description_provided: bool = False,
    cache_hit: bool = False,
    total_score: Optional[float] = None,
    rating: Optional[str] = None,
    tokens_used: Optional[int] = None,
    model_used: Optional[str] = None,
    api_latency_ms: Optional[int] = None,
    success: bool = True,
    error_message: Optional[str] = None
) -> str:
    """
    Log a scoring request to Firestore audit collection.
    
    Args:
        resume_id: Resume ID
        user_id: User ID
        scoring_method: 'local' or 'gemini'
        job_description_provided: Whether job description was included
        cache_hit: Whether result came from cache
        total_score: Resulting score
        rating: Score rating
        tokens_used: Total tokens used (input + output)
        model_used: Gemini model name if applicable
        api_latency_ms: API latency in milliseconds
        success: Whether request succeeded
        error_message: Error message if failed
        
    Returns:
        Audit log ID
    """
    from app.firebase import resume_maker_app
    
    log_id = f"audit_{uuid.uuid4().hex[:12]}"
    
    # Calculate cost if tokens provided
    estimated_cost = None
    if tokens_used and model_used:
        # Rough estimate: 70% input, 30% output
        input_tokens = int(tokens_used * 0.7)
        output_tokens = int(tokens_used * 0.3)
        estimated_cost = estimate_cost(model_used, input_tokens, output_tokens)
    
    audit_data = {
        'log_id': log_id,
        'resume_id': resume_id,
        'user_id': user_id,
        'scoring_method': scoring_method,
        'job_description_provided': job_description_provided,
        'cache_hit': cache_hit,
        'total_score': total_score,
        'rating': rating,
        'tokens_used': tokens_used,
        'model_used': model_used,
        'estimated_cost_usd': estimated_cost,
        'api_latency_ms': api_latency_ms,
        'success': success,
        'error_message': error_message,
        'created_at': datetime.now(timezone.utc),
    }
    
    # Save to Firestore
    if not resume_maker_app:
        logger.info(f"[DEV] Would log audit: {audit_data}")
        return log_id
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Save to audit collection
        db.collection('audit_logs').document(log_id).set(audit_data)
        
        # Also save to user's audit subcollection for easy querying
        db.collection('users').document(user_id)\
          .collection('audit_logs').document(log_id)\
          .set(audit_data)
        
        logger.info(f"Logged scoring request: {log_id}")
        return log_id
        
    except Exception as e:
        logger.error(f"Failed to log audit: {e}")
        return log_id


def log_scoring_request_sync(
    resume_id: str,
    user_id: str,
    scoring_method: str,
    job_description_provided: bool = False,
    cache_hit: bool = False,
    total_score: Optional[float] = None,
    rating: Optional[str] = None,
    tokens_used: Optional[int] = None,
    model_used: Optional[str] = None,
    api_latency_ms: Optional[int] = None,
    success: bool = True,
    error_message: Optional[str] = None
) -> str:
    """
    Log a scoring request to Firestore audit collection (synchronous version).
    
    Args:
        resume_id: Resume ID
        user_id: User ID
        scoring_method: 'local' or 'gemini'
        job_description_provided: Whether job description was included
        cache_hit: Whether result came from cache
        total_score: Resulting score
        rating: Score rating
        tokens_used: Total tokens used (input + output)
        model_used: Gemini model name if applicable
        api_latency_ms: API latency in milliseconds
        success: Whether request succeeded
        error_message: Error message if failed
        
    Returns:
        Audit log ID
    """
    from app.firebase import resume_maker_app
    
    log_id = f"audit_{uuid.uuid4().hex[:12]}"
    
    # Calculate cost if tokens provided
    estimated_cost = None
    if tokens_used and model_used:
        # Rough estimate: 70% input, 30% output
        input_tokens = int(tokens_used * 0.7)
        output_tokens = int(tokens_used * 0.3)
        estimated_cost = estimate_cost(model_used, input_tokens, output_tokens)
    
    audit_data = {
        'log_id': log_id,
        'resume_id': resume_id,
        'user_id': user_id,
        'scoring_method': scoring_method,
        'job_description_provided': job_description_provided,
        'cache_hit': cache_hit,
        'total_score': total_score,
        'rating': rating,
        'tokens_used': tokens_used,
        'model_used': model_used,
        'estimated_cost_usd': estimated_cost,
        'api_latency_ms': api_latency_ms,
        'success': success,
        'error_message': error_message,
        'created_at': datetime.now(timezone.utc),
    }
    
    # Save to Firestore
    if not resume_maker_app:
        logger.info(f"[DEV] Would log audit: {audit_data}")
        return log_id
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Save to audit collection
        db.collection('audit_logs').document(log_id).set(audit_data)
        
        # Also save to user's audit subcollection for easy querying
        db.collection('users').document(user_id)\
          .collection('audit_logs').document(log_id)\
          .set(audit_data)
        
        logger.info(f"Logged scoring request: {log_id}")
        return log_id
        
    except Exception as e:
        logger.error(f"Failed to log audit: {e}")
        return log_id


async def get_user_usage_stats(
    user_id: str,
    days: int = 30
) -> Dict:
    """
    Get usage statistics for a user.
    
    Args:
        user_id: User ID
        days: Number of days to look back
        
    Returns:
        Usage statistics
    """
    from app.firebase import resume_maker_app
    from datetime import timedelta
    
    if not resume_maker_app:
        return {
            'total_requests': 0,
            'gemini_requests': 0,
            'local_requests': 0,
            'cache_hits': 0,
            'total_cost_usd': 0.0,
            'avg_latency_ms': 0
        }
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Query user's audit logs
        logs = db.collection('users').document(user_id)\
                 .collection('audit_logs')\
                 .where('created_at', '>=', cutoff_date)\
                 .stream()
        
        stats = {
            'total_requests': 0,
            'gemini_requests': 0,
            'local_requests': 0,
            'cache_hits': 0,
            'total_cost_usd': 0.0,
            'total_latency_ms': 0,
            'success_count': 0
        }
        
        for log in logs:
            data = log.to_dict()
            stats['total_requests'] += 1
            
            if data.get('scoring_method') == 'gemini':
                stats['gemini_requests'] += 1
            else:
                stats['local_requests'] += 1
            
            if data.get('cache_hit'):
                stats['cache_hits'] += 1
            
            if data.get('estimated_cost_usd'):
                stats['total_cost_usd'] += data['estimated_cost_usd']
            
            if data.get('api_latency_ms'):
                stats['total_latency_ms'] += data['api_latency_ms']
            
            if data.get('success'):
                stats['success_count'] += 1
        
        # Calculate averages
        if stats['total_requests'] > 0:
            stats['avg_latency_ms'] = stats['total_latency_ms'] // stats['total_requests']
            stats['success_rate'] = stats['success_count'] / stats['total_requests']
        else:
            stats['avg_latency_ms'] = 0
            stats['success_rate'] = 0
        
        # Cleanup
        del stats['total_latency_ms']
        del stats['success_count']
        
        # Round cost
        stats['total_cost_usd'] = round(stats['total_cost_usd'], 4)
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get usage stats: {e}")
        return {'error': str(e)}


async def check_rate_limit(
    user_id: str,
    limit_per_day: int = 50
) -> bool:
    """
    Check if user has exceeded rate limit for Gemini calls.
    
    Args:
        user_id: User ID
        limit_per_day: Maximum Gemini calls per day
        
    Returns:
        True if within limit, False if exceeded
    """
    stats = await get_user_usage_stats(user_id, days=1)
    
    gemini_count = stats.get('gemini_requests', 0) - stats.get('cache_hits', 0)
    
    if gemini_count >= limit_per_day:
        logger.warning(f"User {user_id} exceeded rate limit: {gemini_count}/{limit_per_day}")
        return False
    
    return True
