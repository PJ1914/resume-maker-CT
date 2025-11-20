"""
Pydantic schemas for ATS scoring responses.
Ensures strict validation of Gemini responses.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


class ScoreRating(str, Enum):
    """Score rating levels"""
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    NEEDS_IMPROVEMENT = "Needs Improvement"


class ComponentScore(BaseModel):
    """Individual scoring component"""
    score: float = Field(..., ge=0, description="Score value")
    analysis: str = Field(..., min_length=1, max_length=500, description="Analysis text")


class ScoreBreakdown(BaseModel):
    """Detailed score breakdown"""
    keywords: ComponentScore
    sections: ComponentScore
    formatting: ComponentScore
    quantification: ComponentScore
    readability: ComponentScore


class ScoringRequest(BaseModel):
    """Request to score a resume"""
    job_description: Optional[str] = Field(None, max_length=5000, description="Optional job description for matching")
    use_cache: bool = Field(True, description="Whether to use cached results")
    prefer_gemini: bool = Field(True, description="Prefer Gemini over local scorer")


class ScoringResponse(BaseModel):
    """Complete scoring response"""
    resume_id: str
    total_score: float = Field(..., ge=0, le=100, description="Total ATS score 0-100")
    rating: ScoreRating
    breakdown: ScoreBreakdown
    suggestions: List[str] = Field(..., min_items=0, max_items=20)
    
    # Optional Gemini-specific fields
    strengths: Optional[List[str]] = Field(None, max_items=10)
    weaknesses: Optional[List[str]] = Field(None, max_items=10)
    keyword_matches: Optional[List[str]] = Field(None, max_items=50)
    ats_compatibility: Optional[str] = Field(None, max_length=50)
    
    # Metadata
    scoring_method: str = Field(..., pattern="^(local|gemini)$")
    model_name: Optional[str] = Field(None, description="Gemini model used for scoring")
    scored_at: datetime
    cached: bool = False
    
    model_config = {"protected_namespaces": ()}
    
    @field_validator('total_score')
    @classmethod
    def validate_total_score(cls, v):
        """Ensure total score is reasonable"""
        if v < 0 or v > 100:
            raise ValueError("Total score must be between 0 and 100")
        return round(v, 1)


class GeminiScoringSchema(BaseModel):
    """
    Strict schema for Gemini API responses.
    Used to validate and parse Gemini's JSON output.
    """
    total_score: float = Field(..., ge=0, le=100)
    rating: ScoreRating
    breakdown: ScoreBreakdown
    strengths: List[str] = Field(..., min_items=1, max_items=10)
    weaknesses: List[str] = Field(..., min_items=1, max_items=10)
    suggestions: List[str] = Field(..., min_items=1, max_items=20)
    keyword_matches: Optional[List[str]] = Field(default=[], max_items=50)
    ats_compatibility: str = Field(..., pattern="^(High|Medium|Low)$")


class AuditLog(BaseModel):
    """Audit log for scoring requests"""
    log_id: str
    resume_id: str
    user_id: str
    
    # Request details
    scoring_method: str
    job_description_provided: bool
    cache_hit: bool
    
    # Response details
    total_score: Optional[float] = None
    rating: Optional[ScoreRating] = None
    
    # Cost tracking
    tokens_used: Optional[int] = None
    estimated_cost_usd: Optional[float] = None
    api_latency_ms: Optional[int] = None
    
    # Error tracking
    success: bool
    error_message: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "log_id": "audit_123abc",
                "resume_id": "resume_456def",
                "user_id": "user_789ghi",
                "scoring_method": "gemini",
                "job_description_provided": False,
                "cache_hit": False,
                "total_score": 85.5,
                "rating": "Good",
                "tokens_used": 1234,
                "estimated_cost_usd": 0.00062,
                "api_latency_ms": 1500,
                "success": True,
                "error_message": None,
                "created_at": "2025-11-19T12:00:00Z"
            }
        }
