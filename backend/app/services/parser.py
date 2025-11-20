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
        
        # Replace multiple whitespace with single space
        text = re.sub(r'\s+', ' ', text)
        
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
        'projects': r'\b(projects|portfolio|key\s+projects)\b',
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
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = detected_section
                current_content = []
            else:
                # Add to current section
                current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
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
            'email': None,
            'phone': None,
            'location': None,
            'linkedin': None,
            'github': None,
            'portfolio': None,
        }
        
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
    def extract_skills(text: str) -> List[str]:
        """
        Extract skills from skills section or entire resume.
        
        Args:
            text: Skills section text or full resume
            
        Returns:
            List of extracted skills
        """
        skills = []
        
        # Common skill separators
        # Try bullet points first
        bullet_pattern = r'[•●○■□▪▫-]\s*([^\n•●○■□▪▫-]+)'
        bullet_matches = re.findall(bullet_pattern, text)
        
        if bullet_matches:
            skills.extend([skill.strip() for skill in bullet_matches if skill.strip()])
        else:
            # Try comma/pipe separated
            for line in text.split('\n'):
                if ',' in line or '|' in line:
                    separator = ',' if ',' in line else '|'
                    line_skills = [s.strip() for s in line.split(separator)]
                    skills.extend([s for s in line_skills if s and len(s.split()) <= 5])
        
        # Remove duplicates and clean
        skills = list(dict.fromkeys(skills))  # Preserves order
        skills = [s for s in skills if len(s) > 1 and len(s) < 50]
        
        return skills[:50]  # Limit to 50 skills


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
        
        # 7. Build structured result
        result = {
            'parsed_text': text,
            'layout_type': layout_type,
            'sections': sections,
            'contact_info': contact_info,
            'skills': skills,
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
