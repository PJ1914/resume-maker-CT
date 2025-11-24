"""
Resume parsing engine for extracting and normalizing text from PDF and DOCX files.
Handles multiple formats, layouts, and edge cases.
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime


class TextNormalizer:
    """Normalize and clean extracted text."""
    
    @staticmethod
    def normalize(text: str) -> str:
        """
        Normalize text by removing weird characters and standardizing format.
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned and normalized text
        """
        if not text:
            return ""
        
        # Replace multiple spaces/tabs with single space (preserve newlines)
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Remove zero-width characters
        text = re.sub(r'[\u200b-\u200f\u202a-\u202e\ufeff]', '', text)
        
        # Remove soft hyphens
        text = text.replace('\u00ad', '')
        
        # Normalize quotes
        text = text.replace('"', '"').replace('"', '"')
        text = text.replace(''', "'").replace(''', "'")
        
        # Normalize dashes
        text = text.replace('–', '-').replace('—', '-')
        
        # Normalize bullets
        text = re.sub(r'[•●○■□▪▫]', '•', text)
        
        # Remove control characters except newline and tab
        text = ''.join(char for char in text if char == '\n' or char == '\t' or not char.isprintable() or ord(char) >= 32)
        
        # Normalize line breaks (preserve paragraph structure)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove leading/trailing whitespace from each line
        lines = [line.strip() for line in text.split('\n')]
        text = '\n'.join(lines)
        
        return text.strip()
    
    @staticmethod
    def remove_icons_symbols(text: str) -> str:
        """
        Remove icon characters and symbols commonly found in modern resumes.
        
        Args:
            text: Text with potential icons
            
        Returns:
            Text without icon characters
        """
        # Remove common icon unicode ranges
        # Emoji & pictographs
        text = re.sub(r'[\U0001F300-\U0001F9FF]', '', text)
        # Miscellaneous symbols
        text = re.sub(r'[\u2600-\u26FF]', '', text)
        # Dingbats
        text = re.sub(r'[\u2700-\u27BF]', '', text)
        # Geometric shapes
        text = re.sub(r'[\u25A0-\u25FF]', '', text)
        
        return text


class SectionDetector:
    """Detect and extract sections from resume text."""
    
    # Common section headers (case-insensitive patterns)
    SECTION_PATTERNS = {
        'contact': r'\b(contact|personal\s+information)\b',
        'summary': r'\b(summary|profile|objective|about\s+me|professional\s+summary)\b',
        'experience': r'\b(experience|work\s+history|employment|professional\s+experience)\b',
        'education': r'\b(education|academic|qualifications|academic\s+background)\b',
        'skills': r'\b(skills|technical\s+skills|core\s+competencies|expertise)\b',
        'projects': r'\b(projects|key\s+projects)\b|^portfolio$',
        'certifications': r'\b(certifications?|licenses?|credentials)\b',
        'awards': r'\b(awards?|honors?|achievements?|recognition)\b',
        'publications': r'\b(publications?|papers?|research)\b',
        'languages': r'\b(languages?|language\s+proficiency)\b',
        'interests': r'\b(interests?|hobbies)\b',
        'references': r'\b(references?)\b',
    }
    
    @staticmethod
    def detect_sections(text: str) -> Dict[str, str]:
        """
        Detect and extract sections from resume text.
        
        Args:
            text: Normalized resume text
            
        Returns:
            Dictionary mapping section names to their content
        """
        sections = {}
        lines = text.split('\n')
        current_section = 'header'
        current_content = []
        
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
            
            # Check if this line is a section header
            detected_section = None
            for section_name, pattern in SectionDetector.SECTION_PATTERNS.items():
                if re.search(pattern, line_stripped, re.IGNORECASE):
                    # Likely a section header if it's short and matches pattern
                    if len(line_stripped.split()) <= 5:
                        detected_section = section_name
                        break
            
            if detected_section:
                # Save previous section
                if current_content:
                    existing_content = sections.get(current_section, '')
                    new_content = '\n'.join(current_content).strip()
                    if existing_content:
                        sections[current_section] = existing_content + '\n\n' + new_content
                    else:
                        sections[current_section] = new_content
                
                # Start new section
                current_section = detected_section
                current_content = []
            else:
                # Add to current section
                current_content.append(line)
        
        # Save last section
        if current_content:
            existing_content = sections.get(current_section, '')
            new_content = '\n'.join(current_content).strip()
            if existing_content:
                sections[current_section] = existing_content + '\n\n' + new_content
            else:
                sections[current_section] = new_content
        
        return sections
    
    @staticmethod
    def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
        """
        Extract contact information using regex patterns.
        
        Args:
            text: Resume text (preferably from top section)
            
        Returns:
            Dictionary with email, phone, location, linkedin, github
        """
        contact_info = {
            'name': None,
            'email': None,
            'phone': None,
            'location': None,
            'linkedin': None,
            'github': None,
            'portfolio': None,
        }
        
        # Name - extract from first line (before any contact details)
        # The first non-empty line is usually the name
        first_lines = text.split('\n')[:5]  # Check first 5 lines
        for line in first_lines:
            line_stripped = line.strip()
            # Skip empty lines
            if not line_stripped:
                continue
            # Skip if it contains email, phone patterns, or URLs
            if '@' in line_stripped or 'http' in line_stripped.lower() or '|' in line_stripped:
                continue
            # Skip if mostly digits (like phone number line)
            digit_ratio = sum(c.isdigit() for c in line_stripped) / len(line_stripped) if line_stripped else 0
            if digit_ratio > 0.3:
                continue
            # Skip if it's too long (probably not a name)
            if len(line_stripped) > 50:
                continue
            # Skip if it contains common section headers
            if any(header in line_stripped.upper() for header in ['SUMMARY', 'OBJECTIVE', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROFESSIONAL']):
                continue
            # This is likely a name
            if len(line_stripped) > 2 and ' ' in line_stripped:  # Names usually have space
                contact_info['name'] = line_stripped
                break
        
        # Email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Phone (various formats)
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            contact_info['phone'] = phone_match.group().strip()
        
        # LinkedIn
        linkedin_pattern = r'(?:linkedin\.com/in/|linkedin:)\s*([A-Za-z0-9_-]+)'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match:
            contact_info['linkedin'] = f"linkedin.com/in/{linkedin_match.group(1)}"
        
        # GitHub
        github_pattern = r'(?:github\.com/|github:)\s*([A-Za-z0-9_-]+)'
        github_match = re.search(github_pattern, text, re.IGNORECASE)
        if github_match:
            contact_info['github'] = f"github.com/{github_match.group(1)}"
        
        # Portfolio/Website
        portfolio_pattern = r'https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:/[^\s]*)?'
        portfolio_matches = re.findall(portfolio_pattern, text)
        if portfolio_matches:
            # Filter out linkedin/github URLs
            portfolio = next(
                (url for url in portfolio_matches 
                 if 'linkedin' not in url.lower() and 'github' not in url.lower()),
                None
            )
            if portfolio:
                contact_info['portfolio'] = portfolio
        
        # Location (simple city, state/country pattern)
        location_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+)\b'
        location_match = re.search(location_pattern, text)
        if location_match:
            contact_info['location'] = location_match.group().strip()
        
        return contact_info
    
    @staticmethod
    def extract_skills(text: str) -> Dict[str, List[str]]:
        """
        Extract skills from skills section, organized by category.
        
        Args:
            text: Skills section text
            
        Returns:
            Dictionary mapping category names to skill lists
        """
        skills_dict = {}
        
        lines = text.split('\n')
        current_category = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line is a category header (ends with colon)
            if ':' in line:
                parts = line.split(':', 1)
                category = parts[0].strip()
                skills_text = parts[1].strip() if len(parts) > 1 else ''
                
                # Parse skills from the same line
                if skills_text:
                    # Split by comma
                    skills = [s.strip() for s in skills_text.split(',') if s.strip()]
                    skills_dict[category] = skills
                    current_category = category
                else:
                    current_category = category
                    skills_dict[category] = []
            
            elif current_category:
                # Continue adding to current category
                if ',' in line:
                    skills = [s.strip() for s in line.split(',') if s.strip()]
                    skills_dict[current_category].extend(skills)
        
        return skills_dict

    @staticmethod
    def extract_experience_details(text: str) -> List[Dict[str, str]]:
        """
        Extract structured experience details.
        """
        experiences = []
        if not text:
            return experiences
            
        lines = text.split('\n')
        current_exp = None
        i = 0
        
        # Date pattern: 2023-2027, Jan 2020 - Present, etc.
        date_pattern = r'(\d{4})\s*(?:-|–|to)\s*(\d{4}|present|current|now)'
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Check for date range at the start of line (like "2025 – Present")
            date_match = re.search(date_pattern, line, re.IGNORECASE)
            
            if date_match and i + 1 < len(lines):
                # Save previous experience
                if current_exp and current_exp.get('position'):
                    experiences.append(current_exp)
                
                # Next line should be position title
                position_line = lines[i + 1].strip()
                company_line = lines[i + 2].strip() if i + 2 < len(lines) else ''
                
                current_exp = {
                    'company': company_line,
                    'position': position_line,
                    'startDate': date_match.group(1),
                    'endDate': date_match.group(2),
                    'description': [],
                    'location': ''
                }
                
                i += 3  # Skip date, position, and company lines
                
            elif line.startswith('•') or line.startswith('-'):
                if current_exp:
                    current_exp['description'].append(line.lstrip('•- ').strip())
                i += 1
                
            else:
                # Check if it looks like a position title (not a bullet point)
                if current_exp and not current_exp.get('description') and not line.startswith('•'):
                    # Might be additional info like location
                    if '(' in line and ')' in line:
                        # Extract location from parentheses
                        location_match = re.search(r'\((.*?)\)', line)
                        if location_match:
                            current_exp['location'] = location_match.group(1)
                i += 1

        if current_exp and current_exp.get('position'):
            experiences.append(current_exp)
            
        # Post-process descriptions
        for exp in experiences:
            exp['description'] = '\n'.join(exp['description'])
            
        return experiences

    @staticmethod
    def extract_project_details(text: str) -> List[Dict[str, str]]:
        """
        Extract structured project details.
        """
        projects = []
        if not text:
            return projects
            
        lines = text.split('\n')
        current_proj = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts with bullet point
            if line.startswith('•') or line.startswith('-'):
                bullet_text = line.lstrip('•- ').strip()
                
                # Check if this is a new project (contains "–" dash separating name and description)
                if '–' in bullet_text or '-' in bullet_text:
                    # Save previous project
                    if current_proj:
                        projects.append(current_proj)
                    
                    # Split into name and description
                    separator = '–' if '–' in bullet_text else '-'
                    parts = bullet_text.split(separator, 1)
                    project_name = parts[0].strip()
                    project_desc = parts[1].strip() if len(parts) > 1 else ''
                    
                    # Extract technologies from parentheses in project name
                    tech = ''
                    if '(' in project_name and ')' in project_name:
                        tech_match = re.search(r'\((.*?)\)', project_name)
                        if tech_match:
                            tech = tech_match.group(1)
                            project_name = re.sub(r'\s*\(.*?\)', '', project_name).strip()
                    
                    current_proj = {
                        'name': project_name,
                        'description': project_desc,
                        'technologies': tech,
                        'highlights': []
                    }
                
                elif current_proj:
                    # This is a sub-bullet for the current project
                    current_proj['highlights'].append(bullet_text)
            
            else:
                # Non-bullet line - might be a project name without bullet
                if not current_proj or (current_proj and current_proj['description']):
                    # Start new project
                    if current_proj:
                        projects.append(current_proj)
                    
                    current_proj = {
                        'name': line,
                        'description': '',
                        'technologies': '',
                        'highlights': []
                    }
        
        if current_proj:
            projects.append(current_proj)
            
        # Post-process: combine description and highlights
        for proj in projects:
            if proj['highlights']:
                full_desc = proj['description']
                if full_desc:
                    full_desc += '\n'
                full_desc += '\n'.join(proj['highlights'])
                proj['description'] = full_desc
            del proj['highlights']
            
        return projects

    @staticmethod
    def extract_education_details(text: str) -> List[Dict[str, str]]:
        """
        Extract structured education details.
        """
        education = []
        if not text:
            return education
            
        lines = text.split('\n')
        i = 0
        
        # Date pattern: 2023-2027
        date_pattern = r'(\d{4})\s*(?:-|–|to)\s*(\d{4}|present|current|now)'
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Check for date range
            date_match = re.search(date_pattern, line, re.IGNORECASE)
            
            if date_match and i + 1 < len(lines):
                # Next line should be degree
                degree_line = lines[i + 1].strip()
                school_line = lines[i + 2].strip() if i + 2 < len(lines) else ''
                
                # Extract GPA if present
                gpa = None
                if 'CGPA' in school_line or 'GPA' in school_line:
                    gpa_match = re.search(r'(?:CGPA|GPA)[:\s]*([0-9.]+)', school_line)
                    if gpa_match:
                        gpa = gpa_match.group(1)
                
                # Extract school name (before |)
                school_parts = school_line.split('|')
                school = school_parts[0].strip() if school_parts else school_line
                
                # Extract location if present
                location = ''
                if ',' in school:
                    parts = school.split(',')
                    if len(parts) >= 2:
                        location = parts[-1].strip()
                
                edu = {
                    'school': school,
                    'degree': degree_line,
                    'field': '',
                    'startDate': date_match.group(1),
                    'endDate': date_match.group(2),
                    'gpa': gpa,
                    'location': location
                }
                
                education.append(edu)
                i += 3
            else:
                i += 1
        
        return education


class LayoutDetector:
    """Detect resume layout type (single column, two column, etc.)."""
    
    @staticmethod
    def detect_layout(text: str, page_width: Optional[int] = None) -> str:
        """
        Detect if resume has multiple columns.
        
        Args:
            text: Extracted text
            page_width: Optional page width for column detection
            
        Returns:
            'single_column', 'two_column', or 'complex'
        """
        lines = text.split('\n')
        
        # Heuristic: Check for very short lines interspersed with longer ones
        # This often indicates column layout
        short_lines = 0
        medium_lines = 0
        long_lines = 0
        
        for line in lines:
            line_len = len(line.strip())
            if line_len < 20:
                short_lines += 1
            elif line_len < 50:
                medium_lines += 1
            else:
                long_lines += 1
        
        total_lines = short_lines + medium_lines + long_lines
        if total_lines == 0:
            return 'single_column'
        
        short_ratio = short_lines / total_lines
        
        # If many short lines (>40%), likely multi-column
        if short_ratio > 0.4:
            return 'two_column'
        elif short_ratio > 0.6:
            return 'complex'
        else:
            return 'single_column'
    
    @staticmethod
    def reflow_two_column(text: str) -> str:
        """
        Attempt to reflow two-column text into single column.
        This is a best-effort approach.
        
        Args:
            text: Text from two-column layout
            
        Returns:
            Reflowed text
        """
        # This is a complex problem - for now, return as-is
        # Future improvement: Use bbox information from PDF
        return text


class ResumeParser:
    """Main resume parser combining all parsing components."""
    
    def __init__(self):
        self.normalizer = TextNormalizer()
        self.section_detector = SectionDetector()
        self.layout_detector = LayoutDetector()
    
    def parse(
        self,
        text: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Parse resume text and extract structured information.
        
        Args:
            text: Raw resume text
            metadata: Optional metadata (filename, content_type, etc.)
            
        Returns:
            Structured resume data
        """
        # 1. Normalize text
        text = self.normalizer.remove_icons_symbols(text)
        text = self.normalizer.normalize(text)
        
        # 2. Detect layout
        layout_type = self.layout_detector.detect_layout(text)
        
        # 3. Reflow if multi-column (basic)
        if layout_type == 'two_column':
            text = self.layout_detector.reflow_two_column(text)
        
        # 4. Detect sections
        sections = self.section_detector.detect_sections(text)
        
        # 5. Extract contact info (from header or contact section)
        contact_text = sections.get('header', '') + '\n' + sections.get('contact', '')
        contact_info = self.section_detector.extract_contact_info(contact_text)
        
        # 6. Extract skills
        skills_text = sections.get('skills', '')
        if not skills_text:
            # Try to extract from entire resume
            skills_text = text
        skills = self.section_detector.extract_skills(skills_text)
        
        # 7. Extract structured sections
        experience = self.section_detector.extract_experience_details(sections.get('experience', ''))
        projects = self.section_detector.extract_project_details(sections.get('projects', ''))
        education = self.section_detector.extract_education_details(sections.get('education', ''))
        
        # 8. Build structured result
        result = {
            'parsed_text': text,
            'layout_type': layout_type,
            'sections': sections,
            'contact_info': contact_info,
            'skills': skills,
            'experience': experience,
            'projects': projects,
            'education': education,
            'parsed_at': datetime.utcnow().isoformat(),
            'metadata': metadata or {},
        }
        
        return result
    
    def get_summary(self, parsed_data: Dict) -> str:
        """
        Generate a text summary of parsed resume.
        
        Args:
            parsed_data: Output from parse() method
            
        Returns:
            Human-readable summary
        """
        lines = []
        
        contact = parsed_data.get('contact_info', {})
        if contact.get('email'):
            lines.append(f"Email: {contact['email']}")
        if contact.get('phone'):
            lines.append(f"Phone: {contact['phone']}")
        if contact.get('location'):
            lines.append(f"Location: {contact['location']}")
        
        skills = parsed_data.get('skills', [])
        if skills:
            lines.append(f"\nSkills ({len(skills)}): {', '.join(skills[:10])}")
            if len(skills) > 10:
                lines.append(f"  ... and {len(skills) - 10} more")
        
        sections = parsed_data.get('sections', {})
        if sections:
            lines.append(f"\nSections found: {', '.join(sections.keys())}")
        
        lines.append(f"\nLayout: {parsed_data.get('layout_type', 'unknown')}")
        
        return '\n'.join(lines)
