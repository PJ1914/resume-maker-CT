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
        if not has_sufficient_credits(user_id, FeatureType.AI_REWRITE):
            user_credits = get_user_credits(user_id)
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "Insufficient credits for AI content enhancement",
                    "current_balance": user_credits["balance"],
                    "required": FEATURE_COSTS[FeatureType.AI_REWRITE]
                }
            )

        # Create appropriate prompt based on context
        prompts = {
            "summary": """You are an expert ATS Optimization Specialist. Rewrite the following professional summary to ensure it is 100% ATS-friendly and high-scoring.

Requirements:
- Use high-impact, industry-standard keywords commonly found in job descriptions.
- Use strong, active voice (third-person).
- Focus strictly on hard skills, quantifiable achievements, and core competencies.
- Keep it concise (2-3 sentences) and dense with value.
- Eliminate fluff, subjective adjectives, and generic buzzwords.
- NO MARKDOWN (plain text only).

Original summary:
{text}

Provide ONLY the ATS-optimized summary as plain text.""",

            "experience": """You are an expert ATS Optimization Specialist. Rewrite the following experience bullet point to be 100% ATS-friendly.

Requirements:
- Start with a high-impact action verb (e.g., Engineered, Spearheaded, Optimized).
- Strictly follow the 'Action + Context + Result' formula.
- Include specific metrics, percentages, or numbers to quantify impact (crucial for ATS scoring).
- Integrate relevant technical keywords naturally to match job descriptions.
- Ensure simple, clear sentence structures that parsers can easily read.
- NO MARKDOWN (plain text only).

Original:
{text}

Provide ONLY the ATS-optimized bullet point as plain text.""",

            "project_description": """You are an expert ATS Optimization Specialist. Optimize this project description for maximum ATS visibility.

Requirements:
- Clearly highlighting the specific technologies, tools, and frameworks used (these are key ATS keywords).
- State the project's function and your direct contribution clearly.
- Use professional, technical language appropriate for the industry.
- Focus on the outcome or solution provided.
- NO MARKDOWN (plain text only).

Original:
{text}

Provide ONLY the ATS-optimized description as plain text.""",

            "skill_suggestion": """You are an expert ATS Optimization Specialist. Suggest 5-8 high-value, ATS-friendly technical skills relevant to this category.

Requirements:
- Focus on specific, standard industry terms (e.g., "React.js" instead of "React", "AWS Lambda" instead of "Serverless").
- Prioritize hard skills over soft skills.
- Return ONLY a comma-separated list.

Category: {text}

Provide ONLY the comma-separated list of skills.""",
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
        credits_result = deduct_credits(user_id, FeatureType.AI_REWRITE, f"AI Content Enhancement for {request.context}")
        if not credits_result['success']:
            logger.warning(f"Credit deduction failed for user {user_id}: {credits_result.get('error')}")

        return ImprovementResponse(
            original=request.text, improved=improved_text, suggestions=suggestions
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI improvement failed: {str(e)}", exc_info=True)
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
        credits_result = deduct_credits(user_id, FeatureType.AI_REWRITE, f"AI Rewrite for {request.context}")
        if not credits_result['success']:
            logger.warning(f"Credit deduction failed for user {user_id}: {credits_result.get('error')}")

        return ImprovementResponse(
            original=request.text, improved=improved_text, suggestions=[]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI rewrite failed: {str(e)}", exc_info=True)
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
        
        # Truncate resume if too long to speed up processing
        max_chars = 5000
        resume_text = request.resume_text[:max_chars]
        
        prompt = f"""Extract resume data as JSON only (no markdown).

RESUME:
{resume_text}

Return valid JSON:
{{"contact": {{"name": "Full Name", "email": "email@example.com", "phone": "+1234567890", "location": "City, State", "linkedin": "url", "github": "url", "leetcode": "url", "codechef": "url", "hackerrank": "url", "website": "url"}}, "summary": "summary text", "experience": [{{"company": "Company", "position": "Title", "startDate": "2020", "endDate": "2021", "description": "desc"}}], "education": [{{"school": "University", "degree": "Bachelor", "field": "Field", "year": "2020", "gpa": "3.8"}}], "skills": {{"technical": ["skill1", "skill2"], "soft": ["skill3"]}}, "projects": [{{"name": "Project", "description": "desc", "link": "url", "technologies": ["tech1", "tech2"]}}], "certifications": [{{"name": "Cert", "issuer": "Org", "date": "2024"}}], "achievements": [{{"title": "Title", "description": "desc", "date": "2024"}}]}}"""

        logger.info("Calling Gemini API for resume extraction")
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=4000  # Increased to handle detailed resumes without truncation
            )
        )
        
        logger.info(f"Received response from Gemini API")
        
        # Check if response was potentially truncated
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'finish_reason'):
                finish_reason = str(candidate.finish_reason)
                if 'MAX_TOKENS' in finish_reason or 'LENGTH' in finish_reason:
                    logger.warning(f"Response may be truncated due to: {finish_reason}")
        
        # Parse the response - it should be JSON
        response_text = response.text.strip()
        logger.info(f"Response text length: {len(response_text)} characters")
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        # Also handle trailing ``` if present
        if response_text.endswith("```"):
            response_text = response_text[:-3].strip()
        
        logger.info("Parsing JSON response")
        
        # Check for obvious truncation
        if not response_text.endswith("}"):
            logger.error("Response appears to be truncated - doesn't end with '}'")
            raise HTTPException(
                status_code=500,
                detail="AI response was truncated. Please try again with a shorter resume."
            )
        
        extracted_data = json.loads(response_text)
        logger.info(f"Successfully extracted resume data with keys: {list(extracted_data.keys())}")
        
        return {
            "success": True,
            **extracted_data
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        logger.error(f"Response text was: {response_text[:500] if 'response_text' in dir() else 'N/A'}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse AI response as JSON. The response may have been truncated. Please try again."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume extraction failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Resume extraction failed: {str(e)}"
        )


class GenerateSummaryRequest(BaseModel):
    """Request for generating professional summary from resume data"""
    contact: dict
    experience: list
    education: list
    skills: dict
    projects: list = []
    certifications: list = []
    achievements: list = []


class GenerateSummaryResponse(BaseModel):
    """Response with generated professional summary"""
    summary: str


@router.post("/generate-summary", response_model=GenerateSummaryResponse)
async def generate_professional_summary(
    request: GenerateSummaryRequest,
    current_user: dict = Depends(get_current_user)
) -> GenerateSummaryResponse:
    """
    Generate a professional summary using AI based on resume data.
    
    Creates a 2-3 sentence ATS-friendly summary in third-person voice.
    """
    try:
        user_id = current_user['uid']
        
        # Check credits
        if not has_sufficient_credits(user_id, FeatureType.AI_SUGGESTION):
            user_credits = get_user_credits(user_id)
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "Insufficient credits for AI summary generation",
                    "current_balance": user_credits["balance"],
                    "required": FEATURE_COSTS[FeatureType.AI_SUGGESTION]
                }
            )
        
        # Build context from resume data
        context_parts = []
        
        # Experience
        if request.experience:
            exp_count = len(request.experience)
            latest_exp = request.experience[0] if request.experience else {}
            position = latest_exp.get('position', 'Professional')
            company = latest_exp.get('company', '')
            context_parts.append(f"Current/Latest role: {position}")
            if exp_count > 0:
                context_parts.append(f"Total experience entries: {exp_count}")
        
        # Education
        if request.education:
            latest_edu = request.education[0] if request.education else {}
            degree = latest_edu.get('degree', '')
            field = latest_edu.get('field', '')
            institution = latest_edu.get('institution', '')
            if degree and field:
                context_parts.append(f"Education: {degree} in {field}")
        
        # Skills
        if request.skills:
            technical_skills = request.skills.get('technical', [])
            if technical_skills:
                top_skills = technical_skills[:5]  # Get top 5 skills
                context_parts.append(f"Key technical skills: {', '.join(top_skills)}")
        
        # Projects
        if request.projects:
            context_parts.append(f"Projects completed: {len(request.projects)}")
        
        # Certifications
        if request.certifications:
            cert_names = [c.get('name', '') for c in request.certifications[:3]]
            if cert_names:
                context_parts.append(f"Certifications: {', '.join(cert_names)}")
        
        # Achievements
        if request.achievements:
            context_parts.append(f"Notable achievements: {len(request.achievements)}")
        
        resume_context = "\n".join(context_parts)
        
        # Create prompt for Gemini with strict structure
        prompt = f"""PROFESSIONAL SUMMARY GENERATION

You are generating a Professional Resume Summary. Use ONLY the data provided below. Do NOT invent, guess, or add information.

DATA SOURCES (what you can use):
{resume_context}

MENTAL MODEL (how to think):
1️⃣ Who is the candidate? → Infer role from Experience/Skills
2️⃣ What is their foundation? → Education + core technical skills
3️⃣ What experience do they have? → Work/Projects (type, not quantity)
4️⃣ Which domains? → Specialization areas
5️⃣ Seniority? → Fresher vs experienced (based on wording, NO years)

FIXED FORMAT (DO NOT DEVIATE):
Sentence 1: [ROLE] + [FOUNDATION] + [TYPE OF EXPERIENCE]
Sentence 2: [SKILLS] applied to [PRACTICAL CONTEXT]
Sentence 3: [DOMAIN KNOWLEDGE / SPECIALIZATION]

TEMPLATE:
[Role] with a [foundation] and [type of experience]. [Core skills] applied to [practical context]. Demonstrates domain knowledge in [specialization areas].

STRICT RULES:
❌ NO years, numbers, or counts
❌ NO "expert", "highly skilled", buzzwords
❌ NO certification names listed
❌ NO invented information
✅ Facts only from provided data
✅ Neutral, professional tone
✅ Third-person (no "I", "my", "we")
✅ 2-3 sentences MAX
✅ Plain text only

REFERENCE EXAMPLE:
Machine Learning Engineer with a strong foundation in computer science and hands-on experience developing machine learning models. Proficient in Python with practical exposure to data analysis and software development workflows. Demonstrates domain knowledge in data science, natural language processing, and computer vision.

Generate the professional summary now (text only, no formatting):"""

        logger.info("Generating professional summary with Gemini")
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=300
            )
        )
        
        # Check for safety ratings or other blocks
        if hasattr(response, 'prompt_feedback'):
            logger.warning(f"Prompt feedback: {response.prompt_feedback}")
        
        # Try to get text safely
        summary = None
        try:
            if response and hasattr(response, 'text'):
                summary = response.text.strip()
        except Exception as text_error:
            logger.warning(f"Could not access response.text: {text_error}")
        
        if not summary:
            # Try candidates
            if hasattr(response, 'candidates') and response.candidates:
                for candidate in response.candidates:
                    if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                        for part in candidate.content.parts:
                            if hasattr(part, 'text') and part.text:
                                summary = part.text.strip()
                                break
                    if summary:
                        break
        
        if not summary:
            logger.error(f"Gemini API returned no usable content. Response: {response}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service could not generate a summary. Please try again or check your internet connection."
            )
        
        # Remove quotes if Gemini added them
        if summary.startswith('"') and summary.endswith('"'):
            summary = summary[1:-1]
        if summary.startswith("'") and summary.endswith("'"):
            summary = summary[1:-1]
        
        logger.info(f"Generated summary: {summary[:100]}...")
        
        # Deduct credits
        deduct_credits(user_id, FeatureType.AI_SUGGESTION, "AI Professional Summary Generation")
        
        return GenerateSummaryResponse(summary=summary)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summary generation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )
