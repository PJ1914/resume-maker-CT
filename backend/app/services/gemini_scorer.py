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

**IMPORTANT - GENERATE SPECIFIC, ACTIONABLE SUGGESTIONS:**
- Analyze the ACTUAL resume content provided above
- For each weakness identified, provide SPECIFIC examples from the resume
- For "Improved Bullet Point Examples", extract ACTUAL bullet points from the resume and show improvements
- Suggestions should be tailored to this specific resume, not generic templates
- Include actual skills, companies, and achievements found in the resume
- If resume text is "very short or poorly extracted", mention specific sections that are missing or truncated

**RESPONSE FORMAT (JSON only):**
```json
{
  "total_score": 85,
  "rating": "Excellent",
  "breakdown": {
    "keywords": {"score": 25, "analysis": "Specific analysis of keywords found in this resume"},
    "sections": {"score": 30, "analysis": "Specific sections analysis for this resume"},
    "formatting": {"score": 13, "analysis": "Formatting analysis specific to this resume"},
    "quantification": {"score": 8, "analysis": "Analysis of metrics in this resume"},
    "readability": {"score": 9, "analysis": "Readability analysis specific to this resume"}
  },
  "strengths": [
    "Strength 1 - specific to this resume",
    "Strength 2 - with actual examples"
  ],
  "weaknesses": [
    "Weakness 1 - with specific examples from resume",
    "Weakness 2 - with specific bullet point or section mentioned"
  ],
  "suggestions": [
    "Specific suggestion 1 for this resume",
    "Specific suggestion 2 with actual improvement example",
    "Specific suggestion 3 addressing actual gaps"
  ],
  "improved_examples": [
    {
      "original": "Actual bullet point from resume",
      "improved": "Improved version with specific changes"
    }
  ],
  "keyword_matches": ["actual keywords found in resume"],
  "ats_compatibility": "High/Medium/Low"
}
```

Provide ONLY the JSON response, no additional text.
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse Gemini's JSON response and map to ScoringResponse schema."""
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
            
            # Map breakdown to match ScoreBreakdown schema
            breakdown = result.get('breakdown', {})
            
            # Helper to create CategoryScore
            def create_category_score(score, max_score=20):
                return {
                    'score': float(score),
                    'max_score': float(max_score),
                    'percentage': (float(score) / float(max_score)) * 100
                }

            # Map old/loose keys to strict schema keys
            mapped_breakdown = {
                'format_ats_compatibility': create_category_score(breakdown.get('formatting', {}).get('score', 10), 20),
                'keyword_match': create_category_score(breakdown.get('keywords', {}).get('score', 20), 25),
                'skills_relevance': create_category_score(breakdown.get('keywords', {}).get('score', 15) * 0.6, 15), # Estimate
                'experience_quality': create_category_score(breakdown.get('sections', {}).get('score', 13), 20),
                'achievements_impact': create_category_score(breakdown.get('quantification', {}).get('score', 7), 10),
                'grammar_clarity': create_category_score(breakdown.get('readability', {}).get('score', 10), 10)
            }
            
            # Construct final response matching ScoringResponse
            final_response = {
                'total_score': float(result.get('total_score', 70)),
                'rating': result.get('rating', 'Good'),
                'breakdown': mapped_breakdown,
                'strengths': result.get('strengths', []),
                'weaknesses': result.get('weaknesses', []),
                'missing_keywords': [], # Gemini prompt doesn't explicitly ask for this yet, defaulting to empty
                'section_feedback': {}, # Default empty
                'recommendations': result.get('suggestions', []), # Map suggestions to recommendations
                'improved_bullets': [], # Map improved_examples to improved_bullets
                'scoring_method': 'gemini',
                'model_name': self.model_name,
                'scored_at': datetime.now(timezone.utc).isoformat(),
                'job_description_provided': False, # Will be updated by caller if needed
                'cached': False,
                # Legacy fields for compatibility if needed
                'suggestions': result.get('suggestions', []),
                'keyword_matches': result.get('keyword_matches', []),
                'ats_compatibility': result.get('ats_compatibility', 'Medium')
            }

            # Map improved examples if present
            if 'improved_examples' in result:
                for item in result['improved_examples']:
                    if isinstance(item, dict) and 'original' in item and 'improved' in item:
                        final_response['improved_bullets'].append({
                            'original': item['original'],
                            'suggestion': item['improved']
                        })

            return final_response
            
        except json.JSONDecodeError as e:
            # Fallback parsing
            return {
                'resume_id': 'unknown', # Will be filled by caller
                'total_score': 70,
                'rating': 'Good',
                'breakdown': {
                    'format_ats_compatibility': {'score': 10, 'max_score': 20, 'percentage': 50},
                    'keyword_match': {'score': 20, 'max_score': 25, 'percentage': 80},
                    'skills_relevance': {'score': 10, 'max_score': 15, 'percentage': 66.7},
                    'experience_quality': {'score': 13, 'max_score': 20, 'percentage': 65},
                    'achievements_impact': {'score': 7, 'max_score': 10, 'percentage': 70},
                    'grammar_clarity': {'score': 10, 'max_score': 10, 'percentage': 100},
                },
                'strengths': [],
                'weaknesses': [],
                'missing_keywords': [],
                'section_feedback': {},
                'recommendations': ['Unable to parse AI response. Using default score.'],
                'improved_bullets': [],
                'scoring_method': 'gemini_fallback',
                'model_name': self.model_name,
                'scored_at': datetime.now(timezone.utc).isoformat(),
                'job_description_provided': False,
                'cached': False,
                'suggestions': ['Unable to parse AI response. Using default score.'],
                'keyword_matches': [],
                'ats_compatibility': 'Medium',
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
