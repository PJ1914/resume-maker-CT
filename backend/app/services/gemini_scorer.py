"""
Gemini AI-powered ATS scoring using Google's Generative AI.
Falls back to local scorer if API unavailable.
"""

import os
from typing import Dict, Optional, List
from datetime import datetime, timezone
import json
import logging

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class GeminiATSScorer:
    """Gemini-powered ATS scoring with intelligent analysis."""
    
    def __init__(self):
        """Initialize Gemini AI with API key from environment."""
        from dotenv import load_dotenv
        load_dotenv()  # Ensure .env is loaded
        
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')
        
        logging.info("[GeminiATSScorer] GEMINI_AVAILABLE=%s, API_KEY exists=%s", GEMINI_AVAILABLE, bool(self.api_key))
        
        if GEMINI_AVAILABLE and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.available = True
            logging.info("[GeminiATSScorer] Initialized successfully with model: %s", self.model_name)
        else:
            self.model = None
            self.available = False
            logging.info("[GeminiATSScorer] NOT available - GEMINI_AVAILABLE=%s, has_api_key=%s", GEMINI_AVAILABLE, bool(self.api_key))
    
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
            logging.info("[GeminiATSScorer] Calling Gemini API...")
            # Call Gemini API with generation config for timeout
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=2048,
                temperature=0.3,
            )
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config,
                request_options={"timeout": 60}  # 60 second timeout
            )
            logging.info("[GeminiATSScorer] Got response from Gemini API")
            
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
            
            logging.info("[GeminiATSScorer] Score: %s", result.get('total_score'))
            return result
            
        except Exception as e:
            logging.exception("[GeminiATSScorer] Error: %s", str(e))
            raise RuntimeError(f"Gemini API error: {str(e)}")
    
    def _build_scoring_prompt(self, parsed_data: Dict, job_description: Optional[str]) -> str:
        """Build comprehensive scoring prompt for Gemini."""
        
        resume_text = parsed_data.get('parsed_text', '') or ''
        sections = parsed_data.get('sections', [])
        contact_info = parsed_data.get('contact_info', {}) or {}
        skills_raw = parsed_data.get('skills', [])
        
        # Handle skills as dict or list
        if isinstance(skills_raw, dict):
            # skills is {category: [items]} - flatten all items
            skills_list = []
            for category, items in skills_raw.items():
                if isinstance(items, list):
                    skills_list.extend(items[:10])  # Take first 10 from each category
            skills_str = ', '.join(skills_list[:30])
        elif isinstance(skills_raw, list):
            # skills is [{category, items}] or just [strings]
            skills_list = []
            for item in skills_raw:
                if isinstance(item, dict) and 'items' in item:
                    skills_list.extend(item.get('items', [])[:10])
                elif isinstance(item, str):
                    skills_list.append(item)
            skills_str = ', '.join(skills_list[:30])
        else:
            skills_str = ''
        
        # Handle sections as list or dict
        if isinstance(sections, list):
            section_types = [s.get('type', 'unknown') for s in sections if isinstance(s, dict)]
            sections_str = ', '.join(section_types)
        elif isinstance(sections, dict):
            sections_str = ', '.join(sections.keys())
        else:
            sections_str = ''
        
        prompt = f"""You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume and provide a comprehensive, REALISTIC score.

**CRITICAL INSTRUCTIONS:**
- Be STRICT and REALISTIC in your scoring - scores should vary widely based on resume quality
- A score of 90+ should be RARE (only exceptional resumes)
- A score of 70-80 is GOOD (solid professional resume)
- A score of 50-70 is AVERAGE (needs improvement)
- A score below 50 is POOR (significant issues)
- DO NOT give generic scores - analyze the ACTUAL content

**RESUME DATA:**

Contact Information:
{json.dumps(contact_info, indent=2)}

Skills:
{skills_str}

Sections Present:
{sections_str}

Full Resume Text:
{resume_text[:8000]}

"""
        
        if job_description:
            prompt += f"""
**JOB DESCRIPTION:**
{job_description[:1000]}

"""
        
        prompt += """
**SCORING CRITERIA (Total: 100 points) - BE FAIR BUT DETAILED:**

1. **Keywords & Skills (30 points)**
   - 25-30: Exceptional optimization (matches job description perfectly)
   - 20-24: Good usage of industry-standard keywords
   - 15-19: Average keywords (some missing or generic)
   - Below 15: Poor optimization

2. **Section Quality (35 points)**
   - 30-35: Comprehensive details in Experience/Projects
   - 25-29: Solid sections with clear dates and roles
   - 20-24: Average sections (some vagueness)
   - Below 20: Missing critical sections (like Experience/Education)

3. **Formatting (15 points)**
   - 13-15: Perfect layout, consistent fonts, clear hierarchy
   - 10-12: Good readable structure
   - Below 10: Messy, inconsistent, or wall of text

4. **Quantification (10 points)**
   - 8-10: Excellent use of metrics (%, $, numbers) throughout
   - 5-7: Some quantification present
   - 0-4: Little to no numbers used

5. **Readability (10 points)**
   - 9-10: Professional, error-free, concise
   - 7-8: Clear but could be punchier
   - Below 7: Typos, grammar errors, or confusing sentences

**IMPORTANT - GENERATE SPECIFIC, ACTIONABLE SUGGESTIONS:**
- Analyze the ACTUAL resume content provided above
- For each weakness identified, provide SPECIFIC examples from the resume
- For "Improved Bullet Point Examples", extract ACTUAL bullet points from the resume and show improvements
- Suggestions should be tailored to this specific resume, not generic templates
- If a section like 'Education' is missing but the candidate has strong 'Projects', suggest adding Education for completeness but acknowledge the strong projects.
- RECOGNIZE achievements even without numbers (e.g., "launched app", "led team").
- IMPROVED EXAMPLES should be professionally phrased, using "Action + Context + Result" - focus on correcting grammar/clarity while boosting impact.

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
            
            # Helper to create CategoryScore with capped percentage
            def create_category_score(score, max_score=20):
                score = float(score)
                max_score = float(max_score)
                # Ensure score doesn't exceed max_score
                if score > max_score:
                    score = max_score
                percentage = (score / max_score) * 100 if max_score > 0 else 0
                # Cap percentage at 100
                percentage = min(100.0, max(0.0, percentage))
                return {
                    'score': score,
                    'max_score': max_score,
                    'percentage': round(percentage, 1)
                }

            # Map old/loose keys to strict schema keys with safe defaults
            formatting_score = breakdown.get('formatting', {}).get('score', 10)
            keywords_score = breakdown.get('keywords', {}).get('score', 20)
            sections_score = breakdown.get('sections', {}).get('score', 13)
            quantification_score = breakdown.get('quantification', {}).get('score', 7)
            readability_score = breakdown.get('readability', {}).get('score', 10)
            
            mapped_breakdown = {
                'format_ats_compatibility': create_category_score(formatting_score, 20),
                'keyword_match': create_category_score(keywords_score, 25),
                'skills_relevance': create_category_score(min(keywords_score * 0.6, 15), 15),
                'experience_quality': create_category_score(sections_score, 20),
                'achievements_impact': create_category_score(quantification_score, 10),
                'grammar_clarity': create_category_score(readability_score, 10)
            }
            
            # Process improved examples/bullets - map 'improved' to 'suggestion'
            improved_bullets = []
            for item in result.get('improved_examples', result.get('improved_bullets', [])):
                if isinstance(item, dict) and 'original' in item:
                    improved_bullets.append({
                        'original': item.get('original', ''),
                        'suggestion': item.get('improved', item.get('suggestion', ''))
                    })
            
            # Ensure all required fields are present with defaults
            final_response = {
                'total_score': min(100.0, max(0.0, float(result.get('total_score', 70)))),
                'rating': result.get('rating', 'Good'),
                'breakdown': mapped_breakdown,
                'strengths': result.get('strengths', ['Resume structure is clear', 'Good use of professional language']),
                'weaknesses': result.get('weaknesses', ['Could add more quantifiable achievements', 'Consider adding more keywords']),
                'missing_keywords': result.get('missing_keywords', []),
                'section_feedback': result.get('section_feedback', {}),
                'recommendations': result.get('suggestions', result.get('recommendations', [
                    'Add more quantifiable metrics to demonstrate impact',
                    'Include relevant keywords from job descriptions',
                    'Ensure all sections are ATS-friendly'
                ])),
                'improved_bullets': improved_bullets,
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
    
    def _transform_local_result(self, result: Dict) -> Dict:
        """Transform local scorer result to match ScoringResponse schema."""
        breakdown = result.get('breakdown', {})
        
        # Helper to create CategoryScore with capped percentage
        def create_category_score(score, max_score):
            score = float(score)
            max_score = float(max_score)
            if score > max_score:
                score = max_score
            percentage = (score / max_score) * 100 if max_score > 0 else 0
            percentage = min(100.0, max(0.0, percentage))
            return {
                'score': score,
                'max_score': max_score,
                'percentage': round(percentage, 1)
            }
        
        # Extract scores from local breakdown
        keywords_score = breakdown.get('keywords', {}).get('score', 15)
        sections_score = breakdown.get('sections', {}).get('score', 20)
        formatting_score = breakdown.get('formatting', {}).get('score', 10)
        quantification_score = breakdown.get('quantification', {}).get('score', 5)
        readability_score = breakdown.get('readability', {}).get('score', 8)
        
        # Map to ScoringResponse breakdown structure
        mapped_breakdown = {
            'format_ats_compatibility': create_category_score(formatting_score, 15),
            'keyword_match': create_category_score(keywords_score, 30),
            'skills_relevance': create_category_score(keywords_score * 0.5, 15),
            'experience_quality': create_category_score(sections_score, 35),
            'achievements_impact': create_category_score(quantification_score, 10),
            'grammar_clarity': create_category_score(readability_score, 10)
        }
        
        # Build strengths and weaknesses from analysis
        strengths = []
        weaknesses = []
        
        if keywords_score >= 20:
            strengths.append("Good use of relevant technical keywords")
        else:
            weaknesses.append("Could improve keyword density for ATS optimization")
            
        if sections_score >= 25:
            strengths.append("Well-structured resume with key sections")
        else:
            weaknesses.append("Some important sections may be missing")
            
        if formatting_score >= 10:
            strengths.append("Good formatting and structure")
        else:
            weaknesses.append("Formatting could be improved for ATS compatibility")
            
        if quantification_score >= 7:
            strengths.append("Good use of quantified achievements")
        else:
            weaknesses.append("Add more quantified metrics to achievements")
            
        if readability_score >= 8:
            strengths.append("Clear and professional writing style")
        else:
            weaknesses.append("Writing clarity could be improved")
        
        # Ensure at least one item in each
        if not strengths:
            strengths = ["Resume has been successfully parsed"]
        if not weaknesses:
            weaknesses = ["Consider adding a job description for better matching"]
        
        return {
            'total_score': min(100.0, max(0.0, float(result.get('total_score', 60)))),
            'rating': result.get('rating', 'Fair'),
            'breakdown': mapped_breakdown,
            'strengths': strengths[:10],
            'weaknesses': weaknesses[:10],
            'missing_keywords': breakdown.get('keywords', {}).get('missing_keywords', [])[:20],
            'section_feedback': {},
            'recommendations': result.get('suggestions', [])[:15],
            'improved_bullets': [],  # Local scorer doesn't generate these
            'scoring_method': 'local',
            'model_name': 'Local ATS Engine',
            'scored_at': result.get('scored_at', datetime.now(timezone.utc).isoformat()),
            'job_description_provided': False,
            'cached': False,
            'suggestions': result.get('suggestions', []),
            'keyword_matches': breakdown.get('keywords', {}).get('keywords_found', [])[:30],
            'ats_compatibility': 'Medium' if result.get('total_score', 60) >= 60 else 'Low'
        }
    
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
            Scoring report matching ScoringResponse schema
        """
        logging.debug("[HybridScorer] prefer_gemini=%s, gemini_available=%s", prefer_gemini, self.gemini_scorer.is_available())
        
        # Try Gemini first if preferred and available
        if prefer_gemini and self.gemini_scorer.is_available():
            try:
                logging.debug("[HybridScorer] Using Gemini scorer")
                result = self.gemini_scorer.score_resume(parsed_data, job_description)
                result['fallback_used'] = False
                return result
            except Exception as e:
                logging.exception("Gemini scoring failed, falling back to local scorer")
        
            # Use local scorer and transform result
            logging.debug("[HybridScorer] Using Local scorer")
        raw_result = self.local_scorer.score_resume(parsed_data, job_description)
        result = self._transform_local_result(raw_result)
        result['fallback_used'] = not prefer_gemini or not self.gemini_scorer.is_available()
        
        return result
