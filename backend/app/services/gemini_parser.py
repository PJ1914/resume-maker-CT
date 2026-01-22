"""
Gemini AI-powered resume parsing.
Extracts structured data from resume text using LLM intelligence.
Falls back to basic extraction if API unavailable.
"""

import os
import json
import re
from typing import Dict, Optional, List
from datetime import datetime
import logging

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class GeminiResumeParser:
    """Gemini-powered resume parsing with intelligent extraction."""
    
    def __init__(self):
        """Initialize Gemini AI with API key from environment."""
        self.api_key = os.getenv('GEMINI_API_KEY')
        # Use gemini-2.0-flash-exp for better accuracy
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')
        
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
    
    def parse(
        self,
        text: str,
        metadata: Optional[Dict] = None,
        hyperlinks: Optional[List[Dict[str, str]]] = None
    ) -> Dict:
        """
        Parse resume text using Gemini AI.
        
        Args:
            text: Raw resume text
            metadata: Optional metadata (filename, content_type, etc.)
            hyperlinks: List of hyperlinks extracted from PDF
            
        Returns:
            Structured resume data
        """
        if not self.available:
            return self._fallback_parse(text, metadata, hyperlinks)
        
        try:
            # Preprocess text to handle missing spaces (common in PDF extractions)
            text = self._preprocess_text(text)
            
            # Build context with hyperlinks if available
            hyperlink_context = ""
            if hyperlinks:
                urls = [link.get('uri', '') for link in hyperlinks if link.get('uri')]
                if urls:
                    hyperlink_context = f"\n\nExtracted URLs from document:\n" + "\n".join(urls)
            
            prompt = self._build_parsing_prompt(text + hyperlink_context)
            
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,  # Low temperature for consistent extraction
                    max_output_tokens=4096,
                )
            )
            
            # Parse JSON response
            result = self._extract_json_from_response(response.text)
            
            if result:
                # Post-process to clean up dates and fields
                result = self._post_process_result(result)
                result['parsed_at'] = datetime.utcnow().isoformat()
                result['parsing_method'] = 'gemini'
                result['metadata'] = metadata or {}
                result['parsed_text'] = text
                return result
            else:
                # Fallback if JSON parsing fails
                return self._fallback_parse(text, metadata, hyperlinks)
                
        except Exception as e:
            logging.exception("Gemini parsing failed")
            return self._fallback_parse(text, metadata, hyperlinks)
    
    def _preprocess_text(self, text: str) -> str:
        """
        Preprocess text to handle missing spaces (common when copying from PDFs).
        
        Examples:
            "TKRCollegeofEngineeringandTechnology" -> "TKR College of Engineering and Technology"
            "May2024" -> "May 2024"
        """
        import re
        
        # Add space before capital letters that follow lowercase letters
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        
        # Add space after numbers followed by letters
        text = re.sub(r'(\d)([A-Za-z])', r'\1 \2', text)
        
        # Add space after letters followed by 4-digit numbers (years)
        text = re.sub(r'([A-Za-z])(\d{4})', r'\1 \2', text)
        
        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Add space after certain punctuation if missing
        text = re.sub(r'([|,;])([^\s])', r'\1 \2', text)
        
        return text.strip()

    
    def _post_process_result(self, result: Dict) -> Dict:
        """Post-process parsed result to clean up dates and transform to flat format."""
        
        def clean_date(date_str: str) -> str:
            """Clean up date strings like 'May2024' to 'May 2024'."""
            if not date_str:
                return date_str
            import re
            cleaned = re.sub(r'([A-Za-z]+)(\d{4})', r'\1 \2', str(date_str))
            return cleaned.strip()
        
        def clean_text(text: str) -> str:
            """Clean up text by removing leading bullets, dashes, and fixing common issues."""
            if not text:
                return ""
            import re
            text = str(text).strip()
            
            # Remove leading bullet patterns: •, -, –, —, *, >, etc.
            text = re.sub(r'^[\s]*[•\-–—\*\>»›○●▪▸◦]+[\s]*', '', text)
            
            # Fix concatenated words after bullets (e.g., "•Ledend" -> "Led")
            # This catches cases where there's no space after bullet removal
            
            # Remove duplicate dashes like -- or –– 
            text = re.sub(r'[\-–—]{2,}', '–', text)
            
            # Remove dash at start of text
            text = re.sub(r'^[\s]*[\-–—]+[\s]*', '', text)
            
            # Fix spacing issues - ensure space after bullet if bullet wasn't removed
            text = re.sub(r'([•\-–—])([A-Za-z])', r'\1 \2', text)
            
            return text.strip()
        
        def clean_item(item: Dict) -> Dict:
            """Clean all text fields in an item."""
            if not isinstance(item, dict):
                return item
            
            # Fields that should be cleaned
            text_fields = ['description', 'summary', 'text', 'title', 'name', 'position', 'role']
            for field in text_fields:
                if field in item and item[field]:
                    item[field] = clean_text(item[field])
            
            # Clean highlights list if present
            if 'highlights' in item and isinstance(item['highlights'], list):
                item['highlights'] = [clean_text(h) for h in item['highlights'] if h and clean_text(h)]
            
            # Clean achievements list if present  
            if 'achievements' in item and isinstance(item['achievements'], list):
                item['achievements'] = [clean_text(a) for a in item['achievements'] if a and clean_text(a)]
            
            return item

        
        # If using new dynamic sections format, transform to flat format
        if 'sections' in result:
            flat_result = {
                'contact_info': result.get('contact_info', {}),
                'sections': result.get('sections', []),  # Keep raw sections for dynamic rendering
                'professional_summary': None,
                'experience': [],
                'education': [],
                'projects': [],
                'skills': {},
                'certifications': [],
                'hackathons_competitions': [],
                'awards': [],
                'achievements': [],
                'workshops': [],
                'publications': [],
                'volunteer': [],
                'languages': [],
                'courses': [],
                'training': [],
                'research': [],
                'leadership': [],
                'extracurricular': [],
                'memberships': [],
                'patents': [],
                'conferences': [],
                'military': [],
                'interests': [],
                'references': [],
                'custom_sections': {},
            }
            
            # Transform each section to flat format
            for section in result.get('sections', []):
                section_type = section.get('type', 'custom')
                section_title = section.get('title', '')
                items = section.get('items', [])
                
                if section_type == 'summary':
                    if items:
                        summary_text = items[0].get('text', '') if isinstance(items[0], dict) else str(items[0])
                        flat_result['professional_summary'] = clean_text(summary_text)
                
                elif section_type == 'experience':
                    for item in items:
                        if isinstance(item, dict):
                            item['startDate'] = clean_date(item.get('startDate', ''))
                            item['endDate'] = clean_date(item.get('endDate', ''))
                            item = clean_item(item)
                            flat_result['experience'].append(item)
                
                elif section_type == 'education':
                    for item in items:
                        if isinstance(item, dict):
                            item['startDate'] = clean_date(item.get('startDate', ''))
                            item['endDate'] = clean_date(item.get('endDate', ''))
                            item = clean_item(item)
                            flat_result['education'].append(item)
                
                elif section_type == 'projects':
                    for item in items:
                        if isinstance(item, dict):
                            item['startDate'] = clean_date(item.get('startDate', ''))
                            item['endDate'] = clean_date(item.get('endDate', ''))
                            item = clean_item(item)
                            flat_result['projects'].append(item)
                
                elif section_type == 'skills':
                    for item in items:
                        if isinstance(item, dict):
                            category = item.get('category', 'Skills')
                            skills_list = item.get('items', [])
                            # Clean skill items
                            cleaned_skills = [clean_text(s) for s in skills_list if s and clean_text(s)]
                            if cleaned_skills:
                                flat_result['skills'][category] = cleaned_skills
                
                elif section_type == 'certifications':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['certifications'].append(item)
                
                elif section_type in ['achievements', 'hackathons']:
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            # Add to both for flexibility
                            flat_result['hackathons_competitions'].append(item)
                            flat_result['achievements'].append(item)
                
                elif section_type == 'workshops':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['workshops'].append(item)
                
                elif section_type == 'publications':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['publications'].append(item)
                
                elif section_type == 'volunteer':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['volunteer'].append(item)
                
                elif section_type == 'languages':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['languages'].append(item)
                        elif isinstance(item, str):
                            flat_result['languages'].append({'name': clean_text(item)})
                
                elif section_type == 'courses' or section_type == 'coursework':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['courses'].append(item)
                        elif isinstance(item, str):
                            flat_result['courses'].append({'name': clean_text(item)})
                
                elif section_type == 'training':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['training'].append(item)
                
                elif section_type == 'research':
                    for item in items:
                        if isinstance(item, dict):
                            item['startDate'] = clean_date(item.get('startDate', ''))
                            item['endDate'] = clean_date(item.get('endDate', ''))
                            item = clean_item(item)
                            flat_result['research'].append(item)
                
                elif section_type == 'leadership':
                    for item in items:
                        if isinstance(item, dict):
                            item['startDate'] = clean_date(item.get('startDate', ''))
                            item['endDate'] = clean_date(item.get('endDate', ''))
                            item = clean_item(item)
                            flat_result['leadership'].append(item)
                
                elif section_type == 'extracurricular' or section_type == 'activities':
                    for item in items:
                        if isinstance(item, dict):
                            item['startDate'] = clean_date(item.get('startDate', ''))
                            item['endDate'] = clean_date(item.get('endDate', ''))
                            item = clean_item(item)
                            flat_result['extracurricular'].append(item)
                
                elif section_type == 'memberships' or section_type == 'affiliations':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['memberships'].append(item)
                        elif isinstance(item, str):
                            flat_result['memberships'].append({'name': clean_text(item)})
                
                elif section_type == 'patents':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['patents'].append(item)
                
                elif section_type == 'conferences' or section_type == 'speaking':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['conferences'].append(item)
                
                elif section_type == 'military':
                    for item in items:
                        if isinstance(item, dict):
                            item['startDate'] = clean_date(item.get('startDate', ''))
                            item['endDate'] = clean_date(item.get('endDate', ''))
                            item = clean_item(item)
                            flat_result['military'].append(item)
                
                elif section_type == 'interests' or section_type == 'hobbies':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['interests'].append(item)
                        elif isinstance(item, str):
                            flat_result['interests'].append({'name': clean_text(item)})
                
                elif section_type == 'references':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['references'].append(item)
                
                elif section_type == 'awards' or section_type == 'honors':
                    for item in items:
                        if isinstance(item, dict):
                            item = clean_item(item)
                            flat_result['awards'].append(item)
                
                else:
                    # Custom section - store with title as key (skip if title is empty)
                    if section_title and section_title.strip():
                        flat_result['custom_sections'][section_title] = items
            
            return flat_result
        
        # Old format - clean dates AND clean text fields
        for exp in result.get('experience', []):
            if exp.get('startDate'):
                exp['startDate'] = clean_date(exp['startDate'])
            if exp.get('endDate'):
                exp['endDate'] = clean_date(exp['endDate'])
            clean_item(exp)
        
        # Clean education dates
        for edu in result.get('education', []):
            if edu.get('startDate'):
                edu['startDate'] = clean_date(edu['startDate'])
            if edu.get('endDate'):
                edu['endDate'] = clean_date(edu['endDate'])
            clean_item(edu)
        
        # Clean project dates
        for proj in result.get('projects', []):
            if proj.get('startDate'):
                proj['startDate'] = clean_date(proj['startDate'])
            if proj.get('endDate'):
                proj['endDate'] = clean_date(proj['endDate'])
            clean_item(proj)
        
        # Clean achievements
        for ach in result.get('achievements', []):
            clean_item(ach)
        
        # Clean certifications
        for cert in result.get('certifications', []):
            clean_item(cert)
        
        return result
    
    def _build_parsing_prompt(self, text: str) -> str:
        """Build the prompt for Gemini to parse the resume."""
        return f'''You are an expert resume parser. Parse this resume and return PERFECTLY STRUCTURED JSON.

⚠️ NOTE: This text may have been extracted from a PDF and might have missing spaces between words.
Use capital letters, numbers, and punctuation as word boundaries to parse correctly.

═══════════════════════════════════════════════════════════════════════════════
🚨 MOST CRITICAL RULE - READ CAREFULLY 🚨
═══════════════════════════════════════════════════════════════════════════════

For PROJECTS and EXPERIENCE sections:
- Each PROJECT or JOB is ONE item, even if it has multiple bullet points
- ALL bullet points belong to their parent project/job
- NEVER create separate items for each bullet point

WRONG ❌ (each bullet as separate project):
"items": [
  {{"name": "Built a complete LMS platform..."}},
  {{"name": "Designed user dashboards..."}},
  {{"name": "Developed using React.js..."}}
]

CORRECT ✅ (one project with all bullets combined):
"items": [
  {{
    "name": "CodeTapasya - Learning Management System",
    "description": "• Built a complete LMS platform to help students learn programming\\n• Designed user dashboards, course progress tracking\\n• Developed using React.js, FastAPI, and AWS",
    "technologies": "React.js, FastAPI, AWS",
    "link": "Live-Link"
  }}
]

═══════════════════════════════════════════════════════════════════════════════
HOW TO IDENTIFY PROJECT/JOB BOUNDARIES:
═══════════════════════════════════════════════════════════════════════════════

Projects usually start with:
- A project NAME followed by technical stack or description
- A link like "Live-Link" or "GitHub" at the end of the title line
- Then bullet points with "•", "-", "*", "›", "»", or other unicode bullets
- Bullet points may span multiple lines - combine them into the description

Experience entries usually have:
- Company name + Position on same or adjacent lines
- Date range (e.g., "July 2025 – Present", "2024 - 2025", "May 2024")
- Then bullet points underneath describing responsibilities

🚨 IMPORTANT: If a project or experience description has multiple bullet points, JOIN them with a newline character (\\n) into a SINGLE string. Do NOT create a list of strings. It must be ONE string.

═══════════════════════════════════════════════════════════════════════════════
SECTION TYPES (use exactly these type values):
═══════════════════════════════════════════════════════════════════════════════

COMMON SECTIONS:
- "summary": Professional summary, objective, about me, career objective, profile
- "experience": Work experience, employment history, professional experience, jobs, internships
- "education": Education, academic background, qualifications, degrees
- "projects": Projects, personal projects, academic projects, portfolio
- "skills": Technical skills, skills, competencies, expertise, technologies

ACHIEVEMENTS & RECOGNITION:
- "achievements": Achievements, accomplishments, highlights
- "awards": Awards, honors, recognition, scholarships
- "certifications": Certifications, licenses, credentials, professional certifications
- "hackathons": Hackathons, competitions, contests

ACADEMIC & RESEARCH:
- "courses": Relevant coursework, courses, training courses
- "research": Research experience, research projects, publications research
- "publications": Publications, papers, articles, blogs, books
- "patents": Patents, inventions

ACTIVITIES & INVOLVEMENT:
- "leadership": Leadership experience, leadership roles, positions of responsibility
- "extracurricular": Extracurricular activities, activities, clubs, organizations
- "volunteer": Volunteer experience, community service, social work, volunteering
- "memberships": Professional memberships, affiliations, associations
- "conferences": Conferences, speaking engagements, presentations, talks

OTHER SECTIONS:
- "workshops": Workshops conducted or attended
- "training": Training, professional development
- "military": Military service, armed forces experience
- "languages": Languages spoken (human languages like English, Hindi, Spanish)
- "interests": Hobbies, interests, personal interests
- "references": References, professional references
- "custom": Any other section that doesn't fit above categories

═══════════════════════════════════════════════════════════════════════════════
EXACT JSON STRUCTURE TO RETURN:
═══════════════════════════════════════════════════════════════════════════════

{{
  "contact_info": {{
    "name": "Full Name",
    "email": "email@domain.com",
    "phone": "+91 XXXXXXXXXX",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "instagram": "instagram.com/username",
    "twitter": "twitter.com/username",
    "leetcode": "leetcode.com/username",
    "codechef": "codechef.com/users/username",
    "hackerrank": "hackerrank.com/username",
    "portfolio": "website.com",
    "other_links": []
  }},
  "sections": [
    {{
      "type": "summary",
      "title": "Professional Summary",
      "items": [
        {{"text": "Experienced software developer with 5+ years of expertise in full-stack development. Passionate about building scalable web applications and mentoring junior developers."}}
      ]
    }},
    {{
      "type": "education",
      "title": "Education",
      "items": [
        {{
          "school": "University Name OR College Name OR School Name (FULL official name)",
          "degree": "B.Tech/M.S./B.Sc./Intermediate/SSC/etc (EXACT degree name)",
          "field": "Computer Science/Engineering/etc (field of study - MUST extract if mentioned)",
          "gpa": "9.28 / 10.0 OR 9.28 CGPA OR 82.9% OR 3.8/4.0 (extract EXACTLY as written with format)",
          "location": "City, State/Country (MUST extract if mentioned - check for location near institution name)",
          "startDate": "2022 OR Jan 2022 OR January 2022 (extract start year/date if present)",
          "endDate": "2026 OR Present OR Expected 2026 (MUST extract - critical field)"
        }}
      ]
    }},
    {{
      "type": "experience",
      "title": "Experience",
      "items": [
        {{
          "company": "Company Name",
          "position": "Software Developer Intern",
          "location": "City or Remote",
          "startDate": "July 2025",
          "endDate": "Present",
          "description": "• First bullet point describing work\\n• Second bullet point\\n• Third bullet point"
        }}
      ]
    }},
    {{
      "type": "projects",
      "title": "Projects",
      "items": [
        {{
          "name": "Project Name – Short Description",
          "description": "• First feature or accomplishment\\n• Second feature\\n• Third feature",
          "technologies": "React.js, Node.js, MongoDB",
          "link": "github.com/user/project OR Live-Link"
        }},
        {{
          "name": "Another Project Name",
          "description": "• What it does\\n• Technologies used\\n• Impact or result",
          "technologies": "Python, Django, PostgreSQL",
          "link": ""
        }}
      ]
    }},
    {{
      "type": "achievements",
      "title": "Achievements",
      "items": [
        {{"text": "Founder Member of CodeTapasya, organized hackathon for 100+ students", "title": "Founder Member", "organization": "CodeTapasya"}},
        {{"text": "Winner, Geethanjali College Hackathon", "title": "Geethanjali College Hackathon", "result": "Winner"}},
        {{"text": "Finalist, IEEE National Level Hackathon", "title": "IEEE National Level Hackathon", "result": "Finalist"}},
        {{"text": "LeetCode: 400+ problems solved | Rating: 1750+", "title": "LeetCode", "detail": "400+ problems, Rating 1750+"}}
      ]
    }},
    {{
      "type": "certifications",
      "title": "Certifications",
      "items": [
        {{"name": "ServiceNow System Administrator", "issuer": "ServiceNow", "date": "2024", "credentialId": "optional-id"}},
        {{"name": "AWS Certified Solutions Architect", "issuer": "Amazon Web Services", "date": "2023"}}
      ]
    }},
    {{
      "type": "workshops",
      "title": "Workshops",
      "items": [
        {{
          "name": "Introduction to AI & Engineering Fields",
          "role": "Conducted",
          "description": "Workshops for school students (Grades 8-10), guiding them on emerging technologies"
        }}
      ]
    }},
    {{
      "type": "skills",
      "title": "Technical Skills",
      "items": [
        {{"category": "Programming Languages", "items": ["Java", "C", "Python", "JavaScript", "TypeScript"]}},
        {{"category": "Frameworks", "items": ["React.js", "Django", "Flask", "Node.js", "Express.js"]}},
        {{"category": "Cloud Services", "items": ["AWS Lambda", "API Gateway", "DynamoDB"]}},
        {{"category": "Version Control", "items": ["Git", "GitHub"]}}
      ]
    }},
    {{
      "type": "awards",
      "title": "Awards & Honors",
      "items": [
        {{"title": "Dean's List", "issuer": "University Name", "date": "2023"}},
        {{"title": "Best Paper Award", "issuer": "IEEE Conference", "date": "2024"}}
      ]
    }},
    {{
      "type": "courses",
      "title": "Relevant Coursework",
      "items": [
        {{"name": "Data Structures and Algorithms"}},
        {{"name": "Machine Learning"}},
        {{"name": "Cloud Computing"}}
      ]
    }},
    {{
      "type": "leadership",
      "title": "Leadership Experience",
      "items": [
        {{
          "title": "President",
          "organization": "Computer Science Club",
          "startDate": "2023",
          "endDate": "2024",
          "description": "Led a team of 20 members, organized 10+ events"
        }}
      ]
    }},
    {{
      "type": "extracurricular",
      "title": "Extracurricular Activities",
      "items": [
        {{
          "name": "Debate Club",
          "role": "Member",
          "description": "Participated in national level debates"
        }}
      ]
    }},
    {{
      "type": "languages",
      "title": "Languages",
      "items": [
        {{"name": "English", "proficiency": "Native/Fluent"}},
        {{"name": "Hindi", "proficiency": "Native"}},
        {{"name": "Spanish", "proficiency": "Intermediate"}}
      ]
    }},
    {{
      "type": "interests",
      "title": "Interests",
      "items": [
        {{"name": "Open Source Contributing"}},
        {{"name": "Competitive Programming"}},
        {{"name": "Tech Blogging"}}
      ]
    }},
    {{
      "type": "volunteer",
      "title": "Volunteer Experience",
      "items": [
        {{
          "organization": "Code.org",
          "role": "Volunteer Instructor",
          "startDate": "2022",
          "endDate": "Present",
          "description": "Teaching coding to underprivileged students"
        }}
      ]
    }},
    {{
      "type": "publications",
      "title": "Publications",
      "items": [
        {{
          "title": "AI in Healthcare: A Comprehensive Survey",
          "venue": "IEEE Journal",
          "date": "2024",
          "link": "doi.org/xxx"
        }}
      ]
    }},
    {{
      "type": "research",
      "title": "Research Experience",
      "items": [
        {{
          "title": "Machine Learning Research Assistant",
          "institution": "University AI Lab",
          "startDate": "Jan 2024",
          "endDate": "Present",
          "description": "Working on NLP models for sentiment analysis"
        }}
      ]
    }}
  ]
}}

═══════════════════════════════════════════════════════════════════════════════
FINAL CHECKLIST BEFORE RETURNING:
═══════════════════════════════════════════════════════════════════════════════

✅ Each project is ONE item with ALL its bullet points in "description"
✅ Each job is ONE item with ALL its bullet points in "description"  
✅ Bullet points are joined with \\n (newline)
✅ Dates are formatted with space (e.g., "July 2025" not "July2025")
✅ ALL sections from the resume are captured - don't miss any!
✅ Section titles match what's in the resume
✅ Professional summary/objective at top → "summary" section
✅ Certifications (with issuers) → "certifications" section
✅ Awards/Honors (recognition) → "awards" section  
✅ Achievements (accomplishments) → "achievements" section
✅ Extract ALL contact info: name, email, phone, location, linkedin, github, instagram, twitter, leetcode, codechef, hackerrank, portfolio
✅ Extract GPA/CGPA from education (e.g., "8.41/10.0" or "9.28 CGPA" or "82.5%") - keep exact format
✅ Extract LOCATION from education (usually appears near institution name like "University, City" or "College, State")
✅ Extract BOTH startDate and endDate for education (even if only graduation year shown, try to infer start year)
✅ Extract FIELD of study from education (Computer Science, Engineering, etc.) - very important
✅ Use FULL institution names (e.g., "Anurag University, Hyderabad" not just "Anurag University")
✅ Extract project links (GitHub repos, live demos, etc.) from project descriptions
✅ For skills, group by category (Languages, Frameworks, Tools, Databases, etc.)
✅ Languages spoken (English, Hindi, etc.) → "languages" section (NOT programming languages)
✅ Hobbies/Interests → "interests" section
✅ Volunteer work → "volunteer" section
✅ Relevant coursework → "courses" section
✅ Leadership roles → "leadership" section
✅ Research experience → "research" section
✅ Publications/Papers → "publications" section

═══════════════════════════════════════════════════════════════════════════════
RESUME TEXT TO PARSE:
═══════════════════════════════════════════════════════════════════════════════

{text}

Return ONLY valid JSON. No markdown, no explanations.'''

    def _extract_json_from_response(self, response_text: str) -> Optional[Dict]:
        """Extract JSON from Gemini response."""
        try:
            # Try direct JSON parse first
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON in markdown code blocks
        json_patterns = [
            r'```json\s*([\s\S]*?)\s*```',
            r'```\s*([\s\S]*?)\s*```',
            r'\{[\s\S]*\}'
        ]
        
        for pattern in json_patterns:
            match = re.search(pattern, response_text)
            if match:
                try:
                    json_str = match.group(1) if '```' in pattern else match.group(0)
                    return json.loads(json_str)
                except (json.JSONDecodeError, IndexError):
                    continue
        
        return None
    
    def _fallback_parse(
        self,
        text: str,
        metadata: Optional[Dict] = None,
        hyperlinks: Optional[List[Dict[str, str]]] = None
    ) -> Dict:
        """
        Fallback parsing when Gemini is unavailable.
        Uses the regular regex-based ResumeParser for robust extraction.
        """
        try:
            from app.services.parser import ResumeParser
            
            parser = ResumeParser()
            # ResumeParser.parse returns a dict with similar structure
            regex_result = parser.parse(text, metadata=metadata, hyperlinks=hyperlinks)
            
            # Map regex_result to the structure expected here if needed
            # ResumeParser result keys: 
            # contact_info, skills, experience, projects, education, certifications, achievements
            
            # Extract summary specifically as it might be in sections['summary']
            summary = regex_result.get('sections', {}).get('summary', '') or \
                      regex_result.get('sections', {}).get('profile', '')
            
            result = {
                'contact_info': regex_result.get('contact_info', {}),
                'professional_summary': summary,
                'experience': regex_result.get('experience', []),
                'education': regex_result.get('education', []),
                'projects': regex_result.get('projects', []),
                'skills': regex_result.get('skills', {}),
                'certifications': regex_result.get('certifications', []),
                'hackathons_competitions': [], # Regex parser doesn't split these explicitly
                'awards': regex_result.get('achievements', []), # Map achievements to awards/achievements
                'achievements': regex_result.get('achievements', []),
                'custom_sections': {},
                'parsed_at': datetime.utcnow().isoformat(),
                'parsing_method': 'fallback_regex',
                'metadata': metadata or {},
                'parsed_text': text,
                'sections': regex_result.get('sections', {}) # Keep raw sections
            }
            
            return result
            
        except Exception as e:
            logging.error(f"Fallback parsing failed: {e}")
            # Absolute minimal fallback if even regular parser fails
            return {
                'contact_info': self._extract_contact_basic(text, hyperlinks),
                'professional_summary': self._extract_summary_basic(text),
                'experience': [],
                'education': [],
                'projects': [],
                'skills': {},
                'certifications': [],
                'parsed_at': datetime.utcnow().isoformat(),
                'parsing_method': 'fallback_minimal',
                'metadata': metadata or {},
                'parsed_text': text,
            }
    
    def _extract_contact_basic(
        self,
        text: str,
        hyperlinks: Optional[List[Dict[str, str]]] = None
    ) -> Dict:
        """Extract basic contact info."""
        contact = {
            'name': None,
            'email': None,
            'phone': None,
            'location': None,
            'linkedin': None,
            'github': None,
            'instagram': None,
            'twitter': None,
            'leetcode': None,
            'codechef': None,
            'hackerrank': None,
            'portfolio': None,
        }
        
        # Extract from hyperlinks first (most reliable for PDFs)
        if hyperlinks:
            for link in hyperlinks:
                uri = link.get('uri', '')
                if uri.startswith('mailto:') and not contact['email']:
                    contact['email'] = uri.replace('mailto:', '').split('?')[0]
                elif 'linkedin.com/in/' in uri.lower() and not contact['linkedin']:
                    match = re.search(r'linkedin\.com/in/([A-Za-z0-9_-]+)', uri, re.IGNORECASE)
                    if match:
                        contact['linkedin'] = f"linkedin.com/in/{match.group(1)}"
                elif 'github.com/' in uri.lower() and not contact['github']:
                    match = re.search(r'github\.com/([A-Za-z0-9_-]+)', uri, re.IGNORECASE)
                    if match:
                        contact['github'] = f"github.com/{match.group(1)}"
                elif 'instagram.com/' in uri.lower() and not contact['instagram']:
                    match = re.search(r'instagram\.com/([A-Za-z0-9_.-]+)', uri, re.IGNORECASE)
                    if match:
                        contact['instagram'] = f"instagram.com/{match.group(1)}"
                elif 'twitter.com/' in uri.lower() and not contact['twitter']:
                    match = re.search(r'twitter\.com/([A-Za-z0-9_]+)', uri, re.IGNORECASE)
                    if match:
                        contact['twitter'] = f"twitter.com/{match.group(1)}"
                elif 'leetcode.com/' in uri.lower() and not contact['leetcode']:
                    match = re.search(r'leetcode\.com/([A-Za-z0-9_-]+)', uri, re.IGNORECASE)
                    if match:
                        contact['leetcode'] = f"leetcode.com/{match.group(1)}"
                elif 'codechef.com/users/' in uri.lower() and not contact['codechef']:
                    match = re.search(r'codechef\.com/users/([A-Za-z0-9_]+)', uri, re.IGNORECASE)
                    if match:
                        contact['codechef'] = f"codechef.com/users/{match.group(1)}"
                elif 'hackerrank.com/' in uri.lower() and not contact['hackerrank']:
                    match = re.search(r'hackerrank\.com/([A-Za-z0-9_]+)', uri, re.IGNORECASE)
                    if match:
                        contact['hackerrank'] = f"hackerrank.com/{match.group(1)}"
        
        # Extract name (first non-empty line that looks like a name)
        lines = text.split('\n')[:10]
        for line in lines:
            line = line.strip()
            if not line or '@' in line or 'http' in line.lower():
                continue
            if '|' in line or len(line) > 50:
                continue
            words = line.split()
            if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                contact['name'] = line
                break
        
        # Extract email from text if not found in hyperlinks
        if not contact['email']:
            email_match = re.search(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}', text)
            if email_match:
                contact['email'] = email_match.group()
        
        # Extract phone
        phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,6}', text)
        if phone_match:
            contact['phone'] = phone_match.group().strip()
        
        # Extract location
        for line in lines:
            line = line.strip()
            if '@' in line or 'linkedin' in line.lower() or 'github' in line.lower():
                continue
            loc_match = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z][a-z]+|[A-Z]{2})(?:\s*[–-]\s*\d+)?(?:,?\s*India)?$', line)
            if loc_match:
                contact['location'] = f"{loc_match.group(1)}, {loc_match.group(2)}"
                break
        
        return contact
    
    def _extract_summary_basic(self, text: str) -> str:
        """Extract professional summary using basic pattern matching."""
        # Look for summary section
        patterns = [
            r'(?:PROFESSIONAL\s+)?SUMMARY[:\s]*\n(.*?)(?=\n[A-Z]{2,}|\nEXPERIENCE|\nEDUCATION|\nSKILLS|\nPROJECTS)',
            r'OBJECTIVE[:\s]*\n(.*?)(?=\n[A-Z]{2,})',
            r'PROFILE[:\s]*\n(.*?)(?=\n[A-Z]{2,})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                # Clean up the summary
                summary = re.sub(r'\n+', ' ', summary)
                return summary[:500]  # Limit length
        
        return ""


class HybridResumeParser:
    """
    Hybrid parser that uses Gemini AI for parsing.
    Falls back to basic extraction if Gemini unavailable.
    """
    
    def __init__(self):
        self.gemini_parser = GeminiResumeParser()
    
    def parse(
        self,
        text: str,
        metadata: Optional[Dict] = None,
        structured_data: Optional[Dict] = None,
        hyperlinks: Optional[List[Dict[str, str]]] = None
    ) -> Dict:
        """
        Parse resume text.
        
        Args:
            text: Raw resume text
            metadata: Optional metadata
            structured_data: Pre-parsed data (from LaTeX extraction)
            hyperlinks: Hyperlinks from PDF
            
        Returns:
            Structured resume data
        """
        # If we have valid structured data from LaTeX, use it
        if structured_data and self._is_valid_structured_data(structured_data):
            return self._enhance_structured_data(text, structured_data, metadata)
        
        # Use Gemini parser
        return self.gemini_parser.parse(text, metadata, hyperlinks)
    
    def _is_valid_structured_data(self, data: Dict) -> bool:
        """Check if structured data has useful content."""
        if not data:
            return False
        
        has_contact = bool(data.get('contact_info', {}).get('name') or 
                         data.get('contact_info', {}).get('email'))
        has_experience = bool(data.get('experience'))
        has_education = bool(data.get('education'))
        has_projects = bool(data.get('projects'))
        
        return has_contact and (has_experience or has_education or has_projects)
    
    def _enhance_structured_data(
        self,
        text: str,
        structured_data: Dict,
        metadata: Optional[Dict]
    ) -> Dict:
        """Enhance pre-parsed structured data."""
        result = {
            'contact_info': structured_data.get('contact_info', {}),
            'professional_summary': structured_data.get('summary', ''),
            'experience': structured_data.get('experience', []),
            'education': structured_data.get('education', []),
            'projects': structured_data.get('projects', []),
            'skills': structured_data.get('skills', {}),
            'certifications': structured_data.get('certifications', []),
            'hackathons_competitions': structured_data.get('hackathons', []),
            'awards': structured_data.get('awards', []),
            'custom_sections': structured_data.get('sections', {}),
            'parsed_at': datetime.utcnow().isoformat(),
            'parsing_method': 'latex_structured',
            'metadata': metadata or {},
            'parsed_text': text,
        }
        
        return result
