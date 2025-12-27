import time
from fastapi import Request, HTTPException, status
from collections import defaultdict, deque
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Simple in-memory rate limiter using sliding window algorithm.
    Not suitable for distributed systems (use Redis for that), but perfect for single-instance APIs.
    """
    def __init__(self, requests: int, window: int):
        self.requests = requests
        self.window = window  # seconds
        self.clients = defaultdict(deque)

    async def __call__(self, request: Request):
        # Get client IP
        if request.client:
            client_ip = request.client.host
        else:
            client_ip = "unknown"
        
        # Check X-Forwarded-For header if behind proxy
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        now = time.time()
        client_history = self.clients[client_ip]

        # Remove requests outside the window
        while client_history and client_history[0] <= now - self.window:
            client_history.popleft()

        # Check if limit exceeded
        if len(client_history) >= self.requests:
            retry_after = int(self.window - (now - client_history[0]))
            logger.warning(f"Rate limit exceeded for {client_ip}. Retry after {retry_after}s")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please retry after {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )

        # Add current request
        client_history.append(now)

# Pre-configured limiters
# 1. Standard API limit (60 requests / minute)
standard_limiter = RateLimiter(requests=60, window=60)

# 2. Strict limit for sensitive endpoints like Login/Upload (5 requests / minute)
strict_limiter = RateLimiter(requests=5, window=60)

# 3. AI/Costly operations limit (10 requests / minute)
costly_limiter = RateLimiter(requests=10, window=60)
