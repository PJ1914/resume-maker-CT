"""
Gemini AI-powered Resume Generator/Tailor.
Uses Google's Generative AI to rewrite and tailor resumes for specific job descriptions.
"""

import os
import json
import logging
from typing import Dict, Optional, List
from datetime import datetime
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class ResumeTailor:
    """Gemini-powered Resume Tailor."""
    
    def __init__(self):
        """Initialize Gemini AI with API key from environment."""
        from dotenv import load_dotenv
        load_dotenv()
        
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')
        
        if GEMINI_AVAILABLE and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.available = True
        else:
            self.model = None
            self.available = False
            logging.warning("Gemini API key not found or package missing. Resume tailoring will not be available.")

    def tailor_resume(self, current_data: Dict, job_description: str) -> Dict:
        """
        Tailor the resume data to match the provided job description.
        
        Args:
            current_data: The current resume JSON data (editor format)
            job_description: The target job description text
            
        Returns:
            A new resume JSON dictionary with tailored content
        """
        if not self.available:
            raise RuntimeError("Gemini API not available")

        # Prepare the prompt
        prompt = self._build_tailoring_prompt(current_data, job_description)
        
        try:
            # Generate content
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.4, # Slightly creative but grounded
                    max_output_tokens=16384,
                    response_mime_type="application/json"
                )
            )
            
            # Parse response
            tailored_data = json.loads(response.text)
            
            # Ensure critical structure is preserved
            # Merge tailored fields back into original structure to ensure ID/metadata preservation
            merged_data = current_data.copy()
            
            # Update tailored fields
            if 'summary' in tailored_data:
                merged_data['summary'] = tailored_data['summary']
                
            if 'skills' in tailored_data:
                merged_data['skills'] = tailored_data['skills']
                
            # For arrays (experience, projects), we need to match them up or replace them
            # The AI might have reordered them or only modified some. 
            # For simplicity and safety, we trust the AI to return the full list if requested properly by prompt.
            if 'experience' in tailored_data:
                merged_data['experience'] = tailored_data['experience']
                
            if 'projects' in tailored_data:
                merged_data['projects'] = tailored_data['projects']
                
            return merged_data
            
        except Exception as e:
            logging.error(f"Tailoring failed: {str(e)}")
            raise RuntimeError(f"Failed to tailor resume: {str(e)}")

    def _build_tailoring_prompt(self, data: Dict, job_description: str) -> str:
        """Construct the prompt for tailoring."""
        return f"""
You are an expert Resume Writer and Career Strategist.
Your task is to REWRITE and TAILOR the provided resume data to perfectly match the provided Job Description (JD).

**GOAL:**
Optimize the resume content to pass ATS (Applicant Tracking Systems) and impress human recruiters for THIS SPECIFIC JOB.

**INPUT DATA (JSON):**
{json.dumps(data, indent=2, default=str)}

**TARGET JOB DESCRIPTION:**
{job_description}

**INSTRUCTIONS:**
1. **Professional Summary:** Rewrite the summary to highlight experience relevant to the JD. Include key job titles and keywords from the JD.
2. **Skills:** Reorder skills to prioritize those mentioned in the JD. Add relevant skills if they are strongly implied by the candidate's experience, but DO NOT fabricate skills they don't have.
3. **Experience & Projects:** 
   - Rewrite bullet points to emphasize relevant achievements.
   - Use keywords from the JD naturally (e.g., if JD asks for "scaling APIs", and candidate has roughly similar experience, use that exact phrasing if truthful).
   - bringing the most relevant points to the top of each entry.
4. **Conservation of Truth:** Do NOT invent companies, degrees, or roles. Do NOT invent numbers (unless estimating logic is obvious). Only rephrase and re-emphasize *existing* facts.

**OUTPUT FORMAT:**
Return ONLY the full valid JSON object representing the resume. 
The structure must match the input structure exactly (keys: contact, summary, experience, education, skills, projects, etc.).
Do not wrap in markdown blocks.
"""

# Singleton instance
resume_tailor = ResumeTailor()
