"""
AI Improvement Router
Provides AI-powered content improvement suggestions using Gemini
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import google.generativeai as genai
from typing import Optional, Union
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
    import re
    
    def preprocess_resume_text(text: str) -> str:
        """
        Preprocess resume text to handle cases where spaces are missing.
        This happens when text is copied from PDFs or other sources.
        """
        # Add space before capital letters that follow lowercase letters
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        
        # Add space after numbers followed by letters
        text = re.sub(r'(\d)([A-Za-z])', r'\1 \2', text)
        
        # Add space after letters followed by numbers (for dates)
        text = re.sub(r'([A-Za-z])(\d{4})', r'\1 \2', text)
        
        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Add space after certain punctuation if missing
        text = re.sub(r'([|,;])([^\s])', r'\1 \2', text)
        
        return text
    
    try:
        logger.info(f"Starting resume extraction for user: {current_user.get('uid')}")
        logger.info(f"Resume text length: {len(request.resume_text)} characters")
        
        # Preprocess the text to handle missing spaces
        preprocessed_text = preprocess_resume_text(request.resume_text)
        logger.info(f"Preprocessed text length: {len(preprocessed_text)} characters")
        
        # Truncate resume if too long to speed up processing
        max_chars = 5000
        resume_text = preprocessed_text[:max_chars]
        
        # Build the prompt using string concatenation to avoid special character issues
        prompt = """Extract resume data as JSON only (no markdown).

IMPORTANT: This resume text may have been copied from a PDF and might have MISSING SPACES between words.
For example:
- "TKRCollegeofEngineeringandTechnology" should be parsed as "TKR College of Engineering and Technology"
- "May2024-Jul2024" should be parsed as "May 2024 - Jul 2024"
- "+919550654884|email@example.com" should extract phone and email correctly

Your task is to intelligently parse this text even if spacing is poor. Look for capital letters, numbers, and punctuation to identify word boundaries.

RESUME TEXT:
""" + resume_text + """

CRITICAL INSTRUCTIONS FOR SKILLS EXTRACTION:
1. Extract skills from EVERYWHERE in the resume - not just a "Skills" section
2. Look for skills in: "Technologies:" fields, project descriptions, experience descriptions, tools mentioned, etc.
3. Categorize skills properly:
   - "Languages": Python, Java, C++, JavaScript, SQL, PHP, C, TypeScript, Go, Rust, etc.
   - "Frameworks": React, Angular, Node.js, Django, FastAPI, Flask, Express.js, TensorFlow, PyTorch, Keras, Spring Boot, MEAN Stack, etc.
   - "Databases": MySQL, MongoDB, PostgreSQL, Redis, Firebase, SQLite, etc.
   - "ML/AI": TensorFlow, PyTorch, Keras, scikit-learn, LightGBM, FAISS, Hugging Face, OpenCV, CNN, NLP, OCR, etc.
   - "Tools": Git, Docker, Postman, Jupyter, VS Code, Google Colab, Render, etc.
   - "Cloud": AWS, Azure, GCP, Firebase, Heroku, Render, etc.
4. NEVER return empty skills array - always extract at least some skills from the resume content

PARSING GUIDELINES FOR POOR SPACING:
- Use capital letters as word boundaries (e.g., "DataScience" = "Data Science")
- Numbers often indicate dates or GPAs
- Punctuation like |, -, or bullets can separate items
- Email patterns: look for @ symbol
- Phone patterns: look for + and digit sequences
- URLs: look for linkedin.com, github.com, etc.
- IMPORTANT: Watch out for Date & Location combined in one line: "June 2025– Present Hyderabad, India"
  -> Extract "June 2025" as startDate
  -> Extract "Present" as endDate
  -> Extract "Hyderabad, India" as location
- Handle unspaced dates: "May2024-Aug2024" -> "May 2024", "Aug 2024"

Return valid JSON (use double braces for literal braces):
{{"contact": {{"name": "Full Name", "email": "email@example.com", "phone": "+1234567890", "location": "City, State", "linkedin": "url", "github": "url", "leetcode": "url", "codechef": "url", "hackerrank": "url", "website": "url"}}, "summary": "summary text", "experience": [{{"company": "Company", "position": "Title", "location": "City, State", "startDate": "2020", "endDate": "2021", "description": "desc"}}], "education": [{{"school": "University", "degree": "Bachelor", "field": "Field", "startDate": "2020", "endDate": "2024", "gpa": "3.8", "location": "City"}}], "skills": [{{"category": "Languages", "items": ["Python", "Java"]}}, {{"category": "Frameworks", "items": ["React", "TensorFlow"]}}, {{"category": "Databases", "items": ["MySQL"]}}, {{"category": "ML/AI", "items": ["Keras", "CNN"]}}, {{"category": "Tools", "items": ["Git", "Docker"]}}], "projects": [{{"name": "Project", "description": "desc", "startDate": "2023", "endDate": "2024", "link": "url", "technologies": ["tech1", "tech2"]}}], "certifications": [{{"name": "Cert", "issuer": "Org", "date": "2024"}}], "achievements": [{{"title": "Title", "description": "desc", "date": "2024"}}]}}

CRITICAL FOR EDUCATION DATES:
- Education dates are often right-aligned in PDFs and may appear AFTER the section or at the end of lines
- When you see date ranges like "2022- 2026" or "2022-2026" or "2022 - 2026":
  * Extract BOTH years separately
  * startDate should be the FIRST year (2022)
  * endDate should be the SECOND year (2026)
- Match dates to the NEAREST education entry ABOVE them in the text
- Typical degree durations:
  * Bachelor/Engineering (B.Tech/B.E.): 4 years (e.g., 2022-2026)
  * Master's/M.Tech: 2 years (e.g., 2024-2026)
  * Intermediate/12th: 2 years (e.g., 2020-2022)
  * 3-year Bachelor's: 3 years (e.g., 2021-2024)
  * High School/10th/SSC: Usually single year (e.g., 2020)
- If only one year is shown (e.g., "2020"), use it as endDate and infer startDate based on degree type
- Format: If you extract just years, return as "YYYY" (will be converted to YYYY-MM automatically)
"""

        logger.info("Calling Gemini API for resume extraction")
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=4000
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
        
        # Post-process education dates to ensure consistency
        if 'education' in extracted_data and isinstance(extracted_data['education'], list):
            for edu in extracted_data['education']:
                if isinstance(edu, dict):
                    # Convert year-only format to YYYY-MM format for consistency with wizard
                    start = edu.get('startDate', '') or edu.get('year', '')
                    end = edu.get('endDate', '') or edu.get('year', '')
                    degree = str(edu.get('degree', '')).lower()
                    
                    # Smart inference of start date based on degree type if missing
                    if end and not start:
                        try:
                            # Extract 4-digit year from end date using regex to handle formats like "May 2026"
                            end_match = re.search(r'(\d{4})', str(end))
                            if end_match:
                                end_year = int(end_match.group(1))
                                if 'bachelor' in degree or 'engineering' in degree or 'b.tech' in degree or 'b.e.' in degree:
                                    start = str(end_year - 4)  # 4-year degree
                                elif 'master' in degree or 'm.tech' in degree or 'm.s.' in degree or 'm.sc' in degree:
                                    start = str(end_year - 2)  # 2-year masters
                                elif 'intermediate' in degree or '12th' in degree or 'senior' in degree:
                                    start = str(end_year - 2)  # 2-year intermediate
                                elif 'diploma' in degree:
                                    start = str(end_year - 3)  # 3-year diploma
                                else:
                                    start = str(end_year - 1)  # Default 1 year
                                logger.info(f"Inferred start year {start} for {degree} ending {end}")
                        except Exception as e:
                            logger.warning(f"Could not infer start date from end date '{end}': {str(e)}")
                    
                    # Normalize dates to YYYY-MM format with robust and safe parsing
                    def normalize_date_str(d_str):
                        if not d_str: return ''
                        # Basic sanitization to prevent malicious payload processing
                        d_str = str(d_str).strip().lower()
                        d_str = re.sub(r'[^a-z0-9\s\-\/\.]', '', d_str)
                        
                        # 1. Extract Year (19xx or 20xx)
                        year_match = re.search(r'\b(19|20)\d{2}\b', d_str)
                        if not year_match:
                            return '' # No valid year found, treat as invalid
                        
                        year = year_match.group(0)
                        
                        # 2. Extract Month
                        # Name mapping
                        months = {
                            'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
                            'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
                            'sept': '09'
                        }
                        
                        # Check for month names
                        for m_name, m_num in months.items():
                            if m_name in d_str:
                                return f"{year}-{m_num}"
                        
                        # Check for numeric month
                        # Remove year to avoid matching it
                        rem = d_str.replace(year, '').strip()
                        # Match 1-12 specific digits
                        num_match = re.search(r'\b(0?[1-9]|1[0-2])\b', rem)
                        if num_match:
                            m_num = num_match.group(1).zfill(2)
                            return f"{year}-{m_num}"
                            
                        # Default to just year if no month found
                        return year

                    edu['startDate'] = normalize_date_str(start)
                    edu['endDate'] = normalize_date_str(end)
                    
                    # Remove old 'year' field if present
                    edu.pop('year', None)
                    
                    # Detect gradeType based on GPA value
                    gpa = edu.get('gpa', '')
                    if gpa:
                        gpa_str = str(gpa).strip()
                        # If GPA contains '%' or is > 10 (likely percentage)
                        if '%' in gpa_str:
                            edu['gradeType'] = 'Percentage'
                            # Remove % symbol from value
                            edu['gpa'] = gpa_str.replace('%', '').strip()
                        elif '/' in gpa_str:
                            # Extract numerator to determine if CGPA or GPA
                            parts = gpa_str.split('/')
                            try:
                                max_val = float(parts[1].strip())
                                # CGPA typically uses 10 scale, GPA typically uses 4 scale
                                if max_val >= 10:
                                    edu['gradeType'] = 'CGPA'
                                else:
                                    edu['gradeType'] = 'GPA'
                            except:
                                edu['gradeType'] = 'GPA'  # Default to GPA
                        else:
                            try:
                                numeric_val = float(gpa_str)
                                if numeric_val > 10:
                                    # Likely percentage without % symbol
                                    edu['gradeType'] = 'Percentage'
                                elif numeric_val > 4:
                                    # Likely CGPA (out of 10)
                                    edu['gradeType'] = 'CGPA'
                                else:
                                    # Likely GPA (out of 4)
                                    edu['gradeType'] = 'GPA'
                            except:
                                edu['gradeType'] = 'GPA'  # Default to GPA
                    else:
                        edu['gradeType'] = 'GPA'  # Default
                    
                    logger.info(f"Processed education: {edu.get('school', 'N/A')} - {edu.get('startDate')} to {edu.get('endDate')} - {edu.get('gradeType', 'GPA')}: {edu.get('gpa', 'N/A')}")
        
        
        # Post-process Experience to normalize dates for frontend
        if 'experience' in extracted_data and isinstance(extracted_data['experience'], list):
            # Define date normalizer (re-defined here for scope access)
            def normalize_exp_date(d_str):
                if not d_str: return ''
                d_str = str(d_str).strip().lower()
                d_str = re.sub(r'[^a-z0-9\s\-\/\.]', '', d_str)
                year_match = re.search(r'\b(19|20)\d{2}\b', d_str)
                if not year_match: return ''
                year = year_match.group(0)
                months = {'jan':'01','feb':'02','mar':'03','apr':'04','may':'05','jun':'06','jul':'07','aug':'08','sep':'09','oct':'10','nov':'11','dec':'12','sept':'09'}
                for m_name, m_num in months.items():
                    if m_name in d_str: return f"{year}-{m_num}"
                rem = d_str.replace(year, '').strip()
                num_match = re.search(r'\b(0?[1-9]|1[0-2])\b', rem)
                if num_match: return f"{year}-{num_match.group(1).zfill(2)}"
                return year

            for exp in extracted_data['experience']:
                if isinstance(exp, dict):
                    # Check for "Present" before normalization
                    # Check for "Present" or synonyms before normalization
                    raw_end = str(exp.get('endDate', '')).lower()
                    # Synonyms for current employment
                    current_keywords = ['present', 'current', 'now', 'ongoing', 'till date', 'continuing', 'progress', 'today']
                    if any(keyword in raw_end for keyword in current_keywords):
                        exp['current'] = True
                        exp['endDate'] = '' # Clear end date so frontend shows "Present" or nothing
                    else:
                        exp['current'] = False
                        exp['endDate'] = normalize_exp_date(exp.get('endDate', ''))

                    exp['startDate'] = normalize_exp_date(exp.get('startDate', ''))
                    logger.info(f"Processed experience: {exp.get('company', 'N/A')} - {exp.get('startDate')} to {exp.get('endDate')} (Current: {exp.get('current')})")

        # Post-process Projects to normalize dates
        if 'projects' in extracted_data and isinstance(extracted_data['projects'], list):
             # Redefine normalizer (safety check)
             def normalize_proj_date(d_str):
                if not d_str: return ''
                d_str = str(d_str).strip().lower()
                d_str = re.sub(r'[^a-z0-9\s\-\/\.]', '', d_str)
                year_match = re.search(r'\b(19|20)\d{2}\b', d_str)
                if not year_match: return ''
                year = year_match.group(0)
                months = {'jan':'01','feb':'02','mar':'03','apr':'04','may':'05','jun':'06','jul':'07','aug':'08','sep':'09','oct':'10','nov':'11','dec':'12','sept':'09'}
                for m_name, m_num in months.items():
                    if m_name in d_str: return f"{year}-{m_num}"
                rem = d_str.replace(year, '').strip()
                num_match = re.search(r'\b(0?[1-9]|1[0-2])\b', rem)
                if num_match: return f"{year}-{num_match.group(1).zfill(2)}"
                return year

             for proj in extracted_data['projects']:
                if isinstance(proj, dict):
                    # Check for "Present" synonyms
                    raw_end = str(proj.get('endDate', '')).lower()
                    current_keywords = ['present', 'current', 'now', 'ongoing', 'till date', 'continuing', 'progress', 'today']
                    if any(keyword in raw_end for keyword in current_keywords):
                        proj['endDate'] = '' 
                    else:
                        proj['endDate'] = normalize_proj_date(proj.get('endDate', ''))
                        
                    proj['startDate'] = normalize_proj_date(proj.get('startDate', ''))
                    logger.info(f"Processed project: {proj.get('name', 'N/A')} - {proj.get('startDate')} to {proj.get('endDate')}")

        # FALLBACK: If skills are empty, extract from project technologies
        skills = extracted_data.get('skills', [])
        if not skills or (isinstance(skills, list) and len(skills) == 0):
            logger.warning("AI returned empty skills, extracting from project technologies")
            all_techs = []
            projects = extracted_data.get('projects', [])
            for proj in projects:
                if isinstance(proj, dict):
                    techs = proj.get('technologies', [])
                    if isinstance(techs, list):
                        all_techs.extend(techs)
                    elif isinstance(techs, str):
                        all_techs.extend([t.strip() for t in techs.split(',') if t.strip()])
            
            if all_techs:
                # Deduplicate
                unique_techs = list(dict.fromkeys(all_techs))
                extracted_data['skills'] = [{'category': 'Technical', 'items': unique_techs}]
                logger.info(f"Extracted {len(unique_techs)} skills from projects: {unique_techs}")
        
        # Log skills for debugging
        logger.info(f"Final skills data: {extracted_data.get('skills', [])}")
        
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
    skills: Union[dict, list] = []
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
        
        # Skills (handle both dict and list formats)
        if request.skills:
            all_skills = []
            if isinstance(request.skills, dict):
                # Old format: {technical: [], soft: []}
                technical_skills = request.skills.get('technical', [])
                all_skills = technical_skills[:5]
            elif isinstance(request.skills, list):
                # New format: [{category: '...', items: [...]}]
                for cat in request.skills:
                    if isinstance(cat, dict) and cat.get('items'):
                        all_skills.extend(cat['items'][:3])
                all_skills = all_skills[:5]
            
            if all_skills:
                context_parts.append(f"Key technical skills: {', '.join(all_skills)}")
        
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
        
        # Create prompt using string concatenation to avoid special character issues
        prompt = """PROFESSIONAL SUMMARY GENERATION

You are generating a Professional Resume Summary. Use ONLY the data provided below.

DATA SOURCES:
""" + resume_context + """

MENTAL MODEL:
1. Who is the candidate? (Infer role from Experience/Skills)
2. What is their foundation? (Education + core technical skills)
3. What experience do they have? (Work/Projects type, not quantity)
4. Which domains? (Specialization areas)
5. Seniority level? (Fresher vs experienced based on wording, NO years)

FIXED FORMAT:
Sentence 1: ROLE + FOUNDATION + TYPE OF EXPERIENCE
Sentence 2: SKILLS applied to PRACTICAL CONTEXT
Sentence 3: DOMAIN KNOWLEDGE / SPECIALIZATION

STRICT RULES:
- NO years, numbers, or counts
- NO buzzwords like expert or highly skilled
- Facts only from provided data
- Third-person voice only
- 2-3 sentences MAX
- Plain text only

EXAMPLE:
Machine Learning Engineer with a strong foundation in computer science and hands-on experience developing machine learning models. Proficient in Python with practical exposure to data analysis and software development workflows. Demonstrates domain knowledge in data science, natural language processing, and computer vision.

Generate the professional summary now:"""
        
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
