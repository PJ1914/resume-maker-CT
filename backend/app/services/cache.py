"""
Redis caching service for scoring results.
Reduces Gemini API calls and costs.
"""

import hashlib
import json
from typing import Optional, Dict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Redis client (lazy initialization)
redis_client = None


def get_redis_client():
    """Get or create Redis client."""
    global redis_client
    
    if redis_client is not None:
        return redis_client
    
    try:
        import redis
        from app.config import settings
        
        redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5
        )
        
        # Test connection
        redis_client.ping()
        logger.info("Redis connection established")
        return redis_client
        
    except Exception as e:
        logger.warning(f"Redis not available: {e}. Caching disabled.")
        return None


def generate_cache_key(resume_id: str, job_description: Optional[str] = None) -> str:
    """
    Generate cache key for resume scoring.
    
    Args:
        resume_id: Resume ID
        job_description: Optional job description
        
    Returns:
        Cache key string
    """
    # Include job description in hash if provided
    if job_description:
        content = f"{resume_id}:{job_description}"
    else:
        content = resume_id
    
    hash_value = hashlib.sha256(content.encode()).hexdigest()[:16]
    return f"score:{resume_id}:{hash_value}"


async def get_cached_score(
    resume_id: str,
    job_description: Optional[str] = None
) -> Optional[Dict]:
    """
    Get cached scoring result.
    
    Args:
        resume_id: Resume ID
        job_description: Optional job description
        
    Returns:
        Cached score data or None if not found
    """
    client = get_redis_client()
    if not client:
        return None
    
    try:
        cache_key = generate_cache_key(resume_id, job_description)
        cached_data = client.get(cache_key)
        
        if cached_data:
            logger.info(f"Cache HIT for resume {resume_id}")
            data = json.loads(cached_data)
            data['cached'] = True
            return data
        
        logger.info(f"Cache MISS for resume {resume_id}")
        return None
        
    except Exception as e:
        logger.error(f"Cache read error: {e}")
        return None


async def set_cached_score(
    resume_id: str,
    score_data: Dict,
    job_description: Optional[str] = None,
    ttl_hours: int = 24
) -> bool:
    """
    Cache scoring result.
    
    Args:
        resume_id: Resume ID
        score_data: Score data to cache
        job_description: Optional job description
        ttl_hours: Time to live in hours (default 24)
        
    Returns:
        Success boolean
    """
    client = get_redis_client()
    if not client:
        return False
    
    try:
        cache_key = generate_cache_key(resume_id, job_description)
        
        # Remove 'cached' flag before storing
        data_to_cache = {k: v for k, v in score_data.items() if k != 'cached'}
        
        # Serialize to JSON
        cached_value = json.dumps(data_to_cache, default=str)
        
        # Set with expiration
        ttl_seconds = ttl_hours * 3600
        client.setex(cache_key, ttl_seconds, cached_value)
        
        logger.info(f"Cached score for resume {resume_id} (TTL: {ttl_hours}h)")
        return True
        
    except Exception as e:
        logger.error(f"Cache write error: {e}")
        return False


async def invalidate_cache(resume_id: str) -> bool:
    """
    Invalidate all cached scores for a resume.
    
    Args:
        resume_id: Resume ID
        
    Returns:
        Success boolean
    """
    client = get_redis_client()
    if not client:
        return False
    
    try:
        # Find all keys for this resume
        pattern = f"score:{resume_id}:*"
        keys = client.keys(pattern)
        
        if keys:
            client.delete(*keys)
            logger.info(f"Invalidated {len(keys)} cached scores for resume {resume_id}")
        
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
    client = get_redis_client()
    if not client:
        return {
            'available': False,
            'keys': 0,
            'memory_used': 0
        }
    
    try:
        info = client.info('stats')
        keyspace = client.info('keyspace')
        
        total_keys = 0
        if 'db0' in keyspace:
            total_keys = keyspace['db0'].get('keys', 0)
        
        return {
            'available': True,
            'keys': total_keys,
            'hits': info.get('keyspace_hits', 0),
            'misses': info.get('keyspace_misses', 0),
            'hit_rate': info.get('keyspace_hits', 0) / max(1, info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0))
        }
        
    except Exception as e:
        logger.error(f"Cache stats error: {e}")
        return {'available': False, 'error': str(e)}
