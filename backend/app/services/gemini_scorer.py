"""
Gemini AI-powered ATS scoring using Google's Generative AI.
Falls back to local scorer if API unavailable.
"""

import os
from typing import Dict, Optional, List
from datetime import datetime, timezone
import json

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class GeminiATSScorer:
    """Gemini-powered ATS scoring with intelligent analysis."""
    
    def __init__(self):
        """Initialize Gemini AI with API key from environment."""
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        
        if GEMINI_AVAILABLE and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.available = True
        else:
            self.model = None
            self.available = False
    
    def is_available(self) -> bool:
        """Check if Gemini API is available."""
        return self.available
    
    def score_resume(
        self,
        parsed_data: Dict,
        job_description: Optional[str] = None
    ) -> Dict:
        """
        Score resume using Gemini AI.
        
        Args:
            parsed_data: Parsed resume data
            job_description: Optional job description for matching
            
        Returns:
            Scoring report with AI analysis
        """
        if not self.available:
            raise RuntimeError("Gemini API not available. Check GEMINI_API_KEY and google-generativeai package.")
        
        # Build prompt
        prompt = self._build_scoring_prompt(parsed_data, job_description)
        
        try:
            # Call Gemini API with token counting
            response = self.model.generate_content(prompt)
            
            # Extract token usage
            tokens_used = None
            if hasattr(response, 'usage_metadata'):
                tokens_used = (
                    response.usage_metadata.prompt_token_count +
                    response.usage_metadata.candidates_token_count
                )
            
            # Parse response
            result = self._parse_gemini_response(response.text)
            
            # Add metadata
            result['scored_at'] = datetime.now(timezone.utc).isoformat()
            result['scoring_method'] = 'gemini'
            result['model_name'] = self.model_name
            result['tokens_used'] = tokens_used
            
            return result
            
        except Exception as e:
            raise RuntimeError(f"Gemini API error: {str(e)}")
    
    def _build_scoring_prompt(self, parsed_data: Dict, job_description: Optional[str]) -> str:
        """Build comprehensive scoring prompt for Gemini."""
        
        resume_text = parsed_data.get('parsed_text', '')
        sections = parsed_data.get('sections', {})
        contact_info = parsed_data.get('contact_info', {})
        skills = parsed_data.get('skills', [])
        
        prompt = f"""You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume and provide a comprehensive score.

**RESUME DATA:**

Contact Information:
{json.dumps(contact_info, indent=2)}

Skills:
{', '.join(skills[:30])}

Sections Present:
{', '.join(sections.keys())}

Full Resume Text:
{resume_text[:3000]}

"""
        
        if job_description:
            prompt += f"""
**JOB DESCRIPTION:**
{job_description[:1000]}

"""
        
        prompt += """
**SCORING CRITERIA (Total: 100 points):**

1. **Keywords & Skills (30 points)**
   - Relevant technical keywords
   - Industry-specific terms
   - Skills alignment
   - Action verbs

2. **Section Quality (35 points)**
   - Required sections present (Experience, Education, Skills)
   - Recommended sections (Summary, Projects, Certifications)
   - Content depth and relevance
   - Proper organization

3. **Formatting (15 points)**
   - ATS-friendly layout
   - Consistent structure
   - Appropriate length
   - Bullet point usage

4. **Quantification (10 points)**
   - Metrics and numbers
   - Measurable achievements
   - Impact demonstration

5. **Readability (10 points)**
   - Clear language
   - Professional tone
   - Grammar and spelling
   - Conciseness

**RESPONSE FORMAT (JSON only):**
```json
{
  "total_score": 85,
  "rating": "Excellent",
  "breakdown": {
    "keywords": {"score": 25, "analysis": "Strong technical keywords"},
    "sections": {"score": 30, "analysis": "All sections present"},
    "formatting": {"score": 13, "analysis": "Good structure"},
    "quantification": {"score": 8, "analysis": "Some metrics"},
    "readability": {"score": 9, "analysis": "Clear and professional"}
  },
  "strengths": [
    "Strong technical skills section",
    "Quantified achievements in experience"
  ],
  "weaknesses": [
    "Missing certifications section",
    "Could add more metrics"
  ],
  "suggestions": [
    "Add certifications if applicable",
    "Include more numbers in achievements"
  ],
  "keyword_matches": ["python", "react", "sql"],
  "ats_compatibility": "High"
}
```

Provide ONLY the JSON response, no additional text.
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse Gemini's JSON response."""
        try:
            # Extract JSON from markdown code blocks if present
            if '```json' in response_text:
                start = response_text.find('```json') + 7
                end = response_text.find('```', start)
                json_text = response_text[start:end].strip()
            elif '```' in response_text:
                start = response_text.find('```') + 3
                end = response_text.find('```', start)
                json_text = response_text[start:end].strip()
            else:
                json_text = response_text.strip()
            
            # Parse JSON
            result = json.loads(json_text)
            
            # Validate structure
            required_keys = ['total_score', 'rating', 'breakdown', 'suggestions']
            for key in required_keys:
                if key not in result:
                    raise ValueError(f"Missing required key: {key}")
            
            return result
            
        except json.JSONDecodeError as e:
            # Fallback parsing
            return {
                'total_score': 70,
                'rating': 'Good',
                'breakdown': {
                    'keywords': {'score': 20, 'analysis': 'Unable to parse detailed analysis'},
                    'sections': {'score': 25, 'analysis': 'Unable to parse detailed analysis'},
                    'formatting': {'score': 10, 'analysis': 'Unable to parse detailed analysis'},
                    'quantification': {'score': 8, 'analysis': 'Unable to parse detailed analysis'},
                    'readability': {'score': 7, 'analysis': 'Unable to parse detailed analysis'},
                },
                'strengths': [],
                'weaknesses': [],
                'suggestions': ['Unable to parse AI response. Using default score.'],
                'parse_error': str(e),
            }


class HybridScorer:
    """
    Hybrid scorer that uses Gemini when available, falls back to local scorer.
    """
    
    def __init__(self):
        from .scorer import LocalATSScorer
        
        self.gemini_scorer = GeminiATSScorer()
        self.local_scorer = LocalATSScorer()
    
    def score_resume(
        self,
        parsed_data: Dict,
        job_description: Optional[str] = None,
        prefer_gemini: bool = True
    ) -> Dict:
        """
        Score resume using best available method.
        
        Args:
            parsed_data: Parsed resume data
            job_description: Optional job description
            prefer_gemini: Whether to prefer Gemini over local scorer
            
        Returns:
            Scoring report
        """
        # Try Gemini first if preferred and available
        if prefer_gemini and self.gemini_scorer.is_available():
            try:
                result = self.gemini_scorer.score_resume(parsed_data, job_description)
                result['fallback_used'] = False
                return result
            except Exception as e:
                print(f"Gemini scoring failed: {e}. Falling back to local scorer.")
        
        # Use local scorer
        result = self.local_scorer.score_resume(parsed_data, job_description)
        result['fallback_used'] = not prefer_gemini or not self.gemini_scorer.is_available()
        
        return result
