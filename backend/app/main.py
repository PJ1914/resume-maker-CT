from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, users, resumes, scoring, ai, pdf_export, templates, admin, credits
import sys

# Print startup info
print("\n" + "="*60)
print("🚀 Resume Maker API - Starting...")
print("="*60)
print(f"Environment: {settings.ENVIRONMENT}")
print(f"CORS Origins: {settings.CORS_ORIGINS}")
print("="*60 + "\n")

app = FastAPI(
    title="Resume Maker API",
    description="AI-powered resume builder and ATS checker with LaTeX PDF generation",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    
    # Enable XSS protection
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Enforce HTTPS in production
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    # Content Security Policy
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    # Referrer policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Permissions policy
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, tags=["Users"])
app.include_router(resumes.router, prefix="/api", tags=["Resumes"])
app.include_router(templates.router, prefix="/api", tags=["Templates"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["Scoring"])
app.include_router(ai.router, tags=["AI"])
app.include_router(pdf_export.router, tags=["PDF Export"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(credits.router, prefix="/api/credits", tags=["Credits"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Resume Maker API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    from app.firebase import codetapasya_app, resume_maker_app
    
    return {
        "status": "healthy",
        "services": {
            "firebase_auth": "connected" if codetapasya_app else "not_configured",
            "firebase_data": "connected" if resume_maker_app else "not_configured",
            "gemini": "configured" if settings.GEMINI_API_KEY != "your_gemini_api_key_here" else "not_configured",
        },
        "notes": "Service accounts should be added to ./secrets/ directory" if not codetapasya_app or not resume_maker_app else None
    }
