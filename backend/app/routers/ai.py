"""
AI Improvement Router
Provides AI-powered content improvement suggestions using Gemini
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import google.generativeai as genai
from typing import Optional
from app.config import settings
from app.dependencies import get_current_user
from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS, get_user_credits
from fastapi import status
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI"])

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class ImprovementRequest(BaseModel):
    """Request for AI content improvement"""

    text: str = Field(..., min_length=1, max_length=5000)
    context: str = Field(
        ...,
        description="Context type: summary, experience, project_description, skill_suggestion",
    )


class ImprovementResponse(BaseModel):
    """Response with improved content"""

    original: str
    improved: str
    suggestions: list[str] = []


@router.post("/improve", response_model=ImprovementResponse)
async def improve_content(
    request: ImprovementRequest, current_user: dict = Depends(get_current_user)
) -> ImprovementResponse:
    """
    Improve resume content using Gemini AI

    Args:
        request: Content to improve with context
        current_user: Authenticated user

    Returns:
        ImprovementResponse with improved content and suggestions
    """
    try:
        user_id = current_user['uid']
        
        # Check credits
        if not has_sufficient_credits(user_id, FeatureType.AI_SUGGESTION):
            user_credits = get_user_credits(user_id)
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "Insufficient credits for AI suggestion",
                    "current_balance": user_credits["balance"],
                    "required": FEATURE_COSTS[FeatureType.AI_SUGGESTION]
                }
            )

        # Create appropriate prompt based on context
        prompts = {
            "summary": """You are an expert resume writer. Improve the following professional summary to make it more compelling and ATS-friendly.

Make it:
- Concise (2-3 sentences)
- Achievement-focused
- Include relevant keywords
- Professional tone

Original summary:
{text}

Provide ONLY the improved summary, nothing else.""",
            "experience": """You are an expert resume writer. Improve the following work experience bullet point.

Make it:
- Start with strong action verb
- Include quantifiable achievements where possible
- Highlight impact and results
- Use ATS-friendly keywords
- Keep it concise (1-2 lines)

Original:
{text}

Provide ONLY the improved bullet point, nothing else.""",
            "project_description": """You are an expert resume writer. Improve the following project description.

Make it:
- Clear and concise
- Highlight key technologies and skills
- Show impact or results
- Professional tone

Original:
{text}

Provide ONLY the improved description, nothing else.""",
            "skill_suggestion": """You are an expert resume writer. Based on the following skill category, suggest 5-8 relevant technical skills that would be valuable for this category.

Category: {text}

Provide ONLY a comma-separated list of skills, nothing else.""",
        }

        prompt_template = prompts.get(request.context)
        if not prompt_template:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid context type. Must be one of: {', '.join(prompts.keys())}",
            )

        prompt = prompt_template.format(text=request.text)

        # Call Gemini API
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7, max_output_tokens=500
            ),
        )

        improved_text = response.text.strip()

        # For skill suggestions, parse into list
        suggestions = []
        if request.context == "skill_suggestion":
            suggestions = [s.strip() for s in improved_text.split(",")]
            improved_text = request.text  # Keep original for skill suggestions

        # Deduct credits
        deduct_credits(user_id, FeatureType.AI_SUGGESTION, f"AI Suggestion for {request.context}")

        return ImprovementResponse(
            original=request.text, improved=improved_text, suggestions=suggestions
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"AI improvement failed: {str(e)}"
        )


@router.post("/rewrite", response_model=ImprovementResponse)
async def rewrite_content(
    request: ImprovementRequest, current_user: dict = Depends(get_current_user)
) -> ImprovementResponse:
    """
    Completely rewrite content using AI

    Similar to improve but generates completely new content based on the input
    """
    try:
        user_id = current_user['uid']
        
        # Check credits
        if not has_sufficient_credits(user_id, FeatureType.AI_REWRITE):
            user_credits = get_user_credits(user_id)
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "Insufficient credits for AI rewrite",
                    "current_balance": user_credits["balance"],
                    "required": FEATURE_COSTS[FeatureType.AI_REWRITE]
                }
            )

        prompt = f"""You are an expert resume writer. Completely rewrite the following content to make it more professional and impactful.

Context: {request.context}

Original content:
{request.text}

Provide ONLY the rewritten content, nothing else."""

        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.8, max_output_tokens=500
            ),
        )

        improved_text = response.text.strip()

        # Deduct credits
        deduct_credits(user_id, FeatureType.AI_REWRITE, f"AI Rewrite for {request.context}")

        return ImprovementResponse(
            original=request.text, improved=improved_text, suggestions=[]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI rewrite failed: {str(e)}")


class ResumeExtractRequest(BaseModel):
    """Request to extract resume data using AI"""
    resume_text: str = Field(..., min_length=10)


@router.post("/extract-resume")
async def extract_resume_data(
    request: ResumeExtractRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Extract structured resume data from raw text using Gemini AI
    
    Args:
        request: Raw resume text
        current_user: Authenticated user
        
    Returns:
        Extracted structured resume data
    """
    import json
    
    try:
        logger.info(f"Starting resume extraction for user: {current_user.get('uid')}")
        logger.info(f"Resume text length: {len(request.resume_text)} characters")
        
        prompt = f"""Extract structured resume information from the following text and return ONLY valid JSON (no markdown, no explanation).

RESUME TEXT:
{request.resume_text}

Return JSON with this exact structure (omit sections if not found):
{{
  "contact": {{
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "website": "example.com"
  }},
  "summary": "Professional summary text here",
  "experience": [
    {{
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "Jan 2020",
      "endDate": "Dec 2021",
      "description": "Description of responsibilities"
    }}
  ],
  "education": [
    {{
      "school": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "year": "2020",
      "gpa": "3.8"
    }}
  ],
  "skills": {{
    "technical": ["Python", "JavaScript", "React"],
    "soft": ["Leadership", "Communication"]
  }},
  "projects": [
    {{
      "name": "Project Name",
      "description": "What you built and accomplished",
      "link": "github.com/project",
      "technologies": ["React", "Node.js"]
    }}
  ],
  "certifications": [
    {{
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Jan 2024"
    }}
  ],
  "achievements": [
    {{
      "title": "Achievement Title",
      "description": "Brief description",
      "date": "2024"
    }}
  ]
}}

Extract ONLY the JSON response. No markdown code blocks, no explanations."""

        logger.info("Calling Gemini API for resume extraction")
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=2000
            )
        )
        
        logger.info(f"Received response from Gemini API")
        
        # Parse the response - it should be JSON
        response_text = response.text.strip()
        logger.info(f"Response text length: {len(response_text)} characters")
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        logger.info("Parsing JSON response")
        extracted_data = json.loads(response_text)
        logger.info(f"Successfully extracted resume data with keys: {list(extracted_data.keys())}")
        
        return {
            "success": True,
            **extracted_data
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        logger.error(f"Response text was: {response_text[:500]}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse AI response as JSON: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Resume extraction failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Resume extraction failed: {str(e)}"
        )
