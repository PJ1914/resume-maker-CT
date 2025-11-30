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
        
        # Fix concatenated words: add space before lowercase followed by uppercase
        # e.g., "Selectedamong" -> "Selected among"
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        
        # Fix concatenated words: add space before numbers after letters
        # e.g., "among3000" -> "among 3000"
        text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
        
        # Fix concatenated words: add space after numbers before letters
        # e.g., "2025program" -> "2025 program"
        text = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', text)
        
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
        'certifications': r'\b(certifications?|licenses?|credentials|certifications?\s*[/&]\s*(achievements?|awards?|honors?))\b',
        'awards': r'\b(awards?|honors?|achievements?|recognition|certifications?\s*[/&]\s*(achievements?|awards?|honors?))\b',
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
                    # Likely a section header if it's short (max 10 words to handle "Certifications / Achievements")
                    word_count = len(re.split(r'\s+', line_stripped))
                    if word_count <= 10:
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
        first_lines = text.split('\n')[:10]  # Check first 10 lines
        for line in first_lines:
            line_stripped = line.strip()
            # Skip empty lines
            if not line_stripped:
                continue
            # Skip if it contains email, phone patterns, or URLs
            if '@' in line_stripped or 'http' in line_stripped.lower():
                continue
            # Skip if line contains | (usually contact info separator)
            if '|' in line_stripped:
                continue
            # Skip if mostly digits (like phone number line)
            digit_ratio = sum(c.isdigit() for c in line_stripped) / len(line_stripped) if line_stripped else 0
            if digit_ratio > 0.3:
                continue
            # Skip if it's too long (probably not a name)
            if len(line_stripped) > 50:
                continue
            # Skip if it contains common section headers or links
            if any(keyword in line_stripped.upper() for keyword in ['SUMMARY', 'OBJECTIVE', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 
                                                                      'PROFESSIONAL', 'GITHUB', 'LINKEDIN', 'LEETCODE', 'PORTFOLIO']):
                continue
            # Skip if it starts with common prefixes
            if any(line_stripped.startswith(prefix) for prefix in ['Email', 'Phone', 'Location', 'Address']):
                continue
            # This is likely a name - should have at least 2 words
            words = line_stripped.split()
            if len(words) >= 2 and all(word[0].isupper() for word in words if word):
                contact_info['name'] = line_stripped
                break
        
        # Email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Phone (various formats including with parentheses and dashes)
        # Pattern matches: 767-1016609, (132) 767-1016, +1-234-567-8900, etc.
        phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,6}'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            # Clean up the phone number
            phone = phone_match.group().strip()
            # Remove common separators around it
            phone = phone.strip('|').strip()
            contact_info['phone'] = phone
        
        # LinkedIn - more flexible pattern
        linkedin_patterns = [
            r'linkedin\.com/in/([A-Za-z0-9_-]+)',
            r'LinkedIn[:\s]+([A-Za-z0-9_-]+)',
            r'linkedin[:\s]+([A-Za-z0-9_-]+)',
        ]
        for pattern in linkedin_patterns:
            linkedin_match = re.search(pattern, text, re.IGNORECASE)
            if linkedin_match:
                username = linkedin_match.group(1)
                contact_info['linkedin'] = f"linkedin.com/in/{username}"
                break
        
        # GitHub - more flexible pattern
        github_patterns = [
            r'github\.com/([A-Za-z0-9_-]+)',
            r'GitHub[:\s]+([A-Za-z0-9_-]+)',
            r'github[:\s]+([A-Za-z0-9_-]+)',
        ]
        for pattern in github_patterns:
            github_match = re.search(pattern, text, re.IGNORECASE)
            if github_match:
                username = github_match.group(1)
                contact_info['github'] = f"github.com/{username}"
                break
        
        # Portfolio/Website - look for explicit Portfolio label or URLs
        portfolio_patterns = [
            r'Portfolio[:\s]+(https?://[^\s|]+)',
            r'Website[:\s]+(https?://[^\s|]+)',
            r'portfolio[:\s]+(https?://[^\s|]+)',
        ]
        for pattern in portfolio_patterns:
            portfolio_match = re.search(pattern, text, re.IGNORECASE)
            if portfolio_match:
                contact_info['portfolio'] = portfolio_match.group(1)
                break
        
        # If no portfolio found, look for any URL that's not linkedin/github/email
        if not contact_info['portfolio']:
            all_urls = re.findall(r'https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:/[^\s]*)?', text)
            if all_urls:
                portfolio = next(
                    (url for url in all_urls 
                     if 'linkedin' not in url.lower() and 'github' not in url.lower()),
                    None
                )
                if portfolio:
                    contact_info['portfolio'] = portfolio
        
        # Location - improved pattern
        # Matches: "Hyderabad, Telangana", "San Francisco, CA", "Jagital, Telangana"
        location_patterns = [
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z][a-z]+|[A-Z]{2})\b',
            r'Location[:\s]+([A-Z][a-z]+,\s*[A-Z][a-z]+)',
        ]
        for pattern in location_patterns:
            location_match = re.search(pattern, text)
            if location_match:
                if len(location_match.groups()) == 2:
                    contact_info['location'] = f"{location_match.group(1)}, {location_match.group(2)}"
                else:
                    contact_info['location'] = location_match.group(1)
                break
        
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
        
        # Date pattern: May2025– Present, June 2020- May 2022, etc.
        date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|[A-Z][a-z]+\s*\d{4}|\d{4})\s*(?:-|–|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|Present|Current|Now|\d{4})'
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Check if line contains a job title with company pattern: "Title, Company"
            # Or: "Job Title at/with Company"
            if ',' in line and not line.startswith('•') and not line.startswith('-'):
                # Check if next line has a date
                next_line = lines[i + 1].strip() if i + 1 < len(lines) else ''
                date_match = re.search(date_pattern, next_line, re.IGNORECASE)
                
                if date_match:
                    # Save previous experience
                    if current_exp and current_exp.get('position'):
                        experiences.append(current_exp)
                    
                    # Parse position and company
                    parts = line.split(',', 1)
                    position = parts[0].strip()
                    company_location = parts[1].strip() if len(parts) > 1 else ''
                    
                    # Extract location if present (after |)
                    company = company_location
                    location = ''
                    if '|' in company_location:
                        company_parts = company_location.split('|')
                        company = company_parts[0].strip()
                        location = company_parts[1].strip() if len(company_parts) > 1 else ''
                    # Location might also be on next part after company name
                    elif i + 2 < len(lines):
                        potential_location = lines[i + 2].strip()
                        # Check if it looks like a location (City, State)
                        if re.match(r'^[A-Z][a-z]+,\s*[A-Z]', potential_location):
                            location = potential_location
                    
                    current_exp = {
                        'company': company,
                        'position': position,
                        'startDate': date_match.group(1).strip(),
                        'endDate': date_match.group(2).strip(),
                        'description': [],
                        'location': location
                    }
                    
                    i += 2  # Skip current line and date line
                    continue
            
            # Check for date at start of line (alternative format)
            date_match = re.search(date_pattern, line, re.IGNORECASE)
            if date_match and not current_exp:
                # Look ahead for position and company
                if i + 1 < len(lines):
                    position_line = lines[i + 1].strip()
                    company_line = lines[i + 2].strip() if i + 2 < len(lines) else ''
                    
                    if position_line and not position_line.startswith('•'):
                        # Save previous experience
                        if current_exp and current_exp.get('position'):
                            experiences.append(current_exp)
                        
                        current_exp = {
                            'company': company_line,
                            'position': position_line,
                            'startDate': date_match.group(1).strip(),
                            'endDate': date_match.group(2).strip(),
                            'description': [],
                            'location': ''
                        }
                        
                        i += 3  # Skip date, position, and company lines
                        continue
                
            # Check for bullet points (description)
            if (line.startswith('•') or line.startswith('-') or line.startswith('◦')) and current_exp:
                bullet_text = line.lstrip('•-◦ ').strip()
                if bullet_text:
                    current_exp['description'].append(bullet_text)
            
            i += 1

        # Save last experience
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
        
        # Date pattern: July 2025, June 2024
        date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})'
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts with bullet point
            if line.startswith('•') or line.startswith('-') or line.startswith('◦'):
                bullet_text = line.lstrip('•-◦ ').strip()
                
                # Check if this is a new project (not a sub-bullet)
                # Projects usually have title with technologies or links
                if ('|' in bullet_text or 'Live' in bullet_text or '—' in bullet_text or 
                    (current_proj is None and not bullet_text.lower().startswith(('developed', 'built', 'designed', 'integrated', 'engineered')))):
                    
                    # Save previous project
                    if current_proj:
                        projects.append(current_proj)
                    
                    # Parse project line: "Project Name — Description | Tech | Date"
                    # or: "Project Name | Role Link Date"
                    project_name = bullet_text
                    tech = ''
                    date = ''
                    role = ''
                    link = ''
                    
                    # Extract date if present
                    date_match = re.search(date_pattern, bullet_text, re.IGNORECASE)
                    if date_match:
                        date = date_match.group(1)
                        project_name = bullet_text[:date_match.start()].strip()
                    
                    # Extract link if present (Live, Demo, GitHub, etc.)
                    link_match = re.search(r'(Live|Demo|GitHub|Source)\s*\d*', project_name, re.IGNORECASE)
                    if link_match:
                        link = link_match.group(0)
                        project_name = project_name[:link_match.start()].strip()
                    
                    # Split by | for role/tech
                    if '|' in project_name:
                        parts = project_name.split('|')
                        project_name = parts[0].strip()
                        if len(parts) > 1:
                            role = parts[1].strip()
                        if len(parts) > 2:
                            tech = parts[2].strip()
                    
                    # Remove any remaining separators
                    project_name = project_name.rstrip('—-|').strip()
                    
                    current_proj = {
                        'name': project_name,
                        'description': '',
                        'technologies': tech,
                        'startDate': date,
                        'endDate': date,
                        'link': link,
                        'role': role,
                        'highlights': []
                    }
                
                elif current_proj:
                    # This is a sub-bullet for the current project
                    current_proj['highlights'].append(bullet_text)
            
            else:
                # Non-bullet line - might be a project name
                # Check if it has project indicators
                if ('|' in line or '—' in line or re.search(date_pattern, line, re.IGNORECASE)):
                    # Start new project
                    if current_proj:
                        projects.append(current_proj)
                    
                    project_name = line
                    tech = ''
                    date = ''
                    
                    # Extract date
                    date_match = re.search(date_pattern, line, re.IGNORECASE)
                    if date_match:
                        date = date_match.group(1)
                        project_name = line[:date_match.start()].strip()
                    
                    # Split by | or —
                    if '|' in project_name:
                        parts = project_name.split('|')
                        project_name = parts[0].strip()
                        if len(parts) > 1:
                            tech = ' | '.join(parts[1:]).strip()
                    elif '—' in project_name:
                        parts = project_name.split('—')
                        project_name = parts[0].strip()
                    
                    current_proj = {
                        'name': project_name,
                        'description': '',
                        'technologies': tech,
                        'startDate': date,
                        'endDate': date,
                        'highlights': []
                    }
        
        if current_proj:
            projects.append(current_proj)
            
        # Post-process: combine description and highlights
        for proj in projects:
            if proj['highlights']:
                proj['description'] = '\n'.join(proj['highlights'])
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
        
        # Date pattern: June 2020- May 2022, September 2022- Present
        date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})\s*(?:-|–)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|Present|Current)'
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Check if line contains school/institution name followed by location
            # Pattern: "Institution Name Location"
            # Next line usually has degree and dates
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                
                # Check if next line has degree and date info
                if '|' in next_line or re.search(date_pattern, next_line, re.IGNORECASE):
                    school_line = line
                    degree_line = next_line
                    
                    # Extract location from school line (usually at the end)
                    location = ''
                    if re.search(r',\s*[A-Z][a-z]+$', school_line):
                        # Location at end: "School Name City, State"
                        parts = school_line.rsplit(',', 1)
                        if len(parts) == 2:
                            school_name = parts[0].strip()
                            location = parts[1].strip()
                        else:
                            school_name = school_line
                    else:
                        school_name = school_line
                    
                    # Parse degree line: "Degree | Details | CGPA/GPA | Date"
                    degree = ''
                    field = ''
                    gpa = None
                    start_date = ''
                    end_date = ''
                    
                    # Extract dates
                    date_match = re.search(date_pattern, degree_line, re.IGNORECASE)
                    if date_match:
                        start_date = date_match.group(1)
                        end_date = date_match.group(2)
                        # Remove date from degree_line for further parsing
                        degree_line = degree_line[:date_match.start()].strip()
                    
                    # Extract GPA/CGPA
                    gpa_match = re.search(r'(?:CGPA|GPA)[:\s]*([0-9.]+)', degree_line)
                    if gpa_match:
                        gpa = gpa_match.group(1)
                        # Remove GPA from degree_line
                        degree_line = degree_line[:gpa_match.start()].strip()
                    
                    # Extract location if in degree line
                    if not location:
                        loc_match = re.search(r'\|\s*([A-Z][a-z]+,\s*[A-Z][a-z]+)\s*$', degree_line)
                        if loc_match:
                            location = loc_match.group(1)
                            degree_line = degree_line[:loc_match.start()].strip()
                    
                    # Parse degree and field
                    if '|' in degree_line:
                        parts = degree_line.split('|')
                        degree = parts[0].strip()
                        if len(parts) > 1:
                            field = parts[1].strip()
                    else:
                        degree = degree_line
                    
                    # Clean up degree name
                    degree = degree.rstrip('|,').strip()
                    
                    edu = {
                        'school': school_name,
                        'degree': degree,
                        'field': field,
                        'startDate': start_date,
                        'endDate': end_date,
                        'gpa': gpa,
                        'location': location
                    }
                    
                    education.append(edu)
                    i += 2  # Skip school and degree lines
                    continue
            
            i += 1
        
        return education


    @staticmethod
    def extract_certifications(text: str) -> List[Dict[str, str]]:
        """Extract certifications and licenses."""
        certifications = []
        if not text:
            return certifications
        
        lines = text.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines and bullet points
            if not line or line.startswith('•') or line.startswith('-'):
                i += 1
                continue
            
            cert = {
                'name': line,
                'issuer': '',
                'date': '',
            }
            
            # Look ahead for issuer, date, or description
            description_lines = []
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                
                if not next_line:
                    j += 1
                    continue
                
                # If we hit another certification title (doesn't start with bullet/dash and is not description)
                if not next_line.startswith('•') and not next_line.startswith('-') and j > i + 1:
                    # Could be next cert or metadata, check if it looks like a cert name or date
                    if re.search(r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}', next_line, re.IGNORECASE):
                        cert['date'] = next_line.strip()
                    elif len(next_line.split()) < 8 and not next_line.endswith('.'):
                        # Likely issuer or next cert, break
                        break
                    else:
                        description_lines.append(next_line)
                elif next_line.startswith('•') or next_line.startswith('-'):
                    # Description line
                    description_lines.append(next_line.lstrip('•-').strip())
                else:
                    # Assume it's metadata (issuer/date) on next line
                    date_match = re.search(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})', next_line, re.IGNORECASE)
                    if date_match:
                        cert['date'] = date_match.group(1)
                        cert['issuer'] = next_line.replace(date_match.group(1), '').strip()
                    else:
                        cert['issuer'] = next_line
                    break
                
                j += 1
            
            if cert['name']:
                certifications.append(cert)
            
            i = j if j > i + 1 else i + 1
        
        return certifications
    
    @staticmethod
    def extract_achievements(text: str) -> List[Dict[str, str]]:
        """Extract achievements and awards."""
        achievements = []
        if not text:
            return achievements
        
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Remove bullet points
            line = re.sub(r'^[•\-\*]\s*', '', line)
            
            achievement = {
                'title': line,
                'description': '',
                'date': '',
            }
            
            # Look ahead for date or description
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                
                # Date pattern: Month YYYY or YYYY
                date_match = re.search(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})', next_line, re.IGNORECASE)
                if date_match:
                    achievement['date'] = date_match.group(1)
                    achievement['description'] = next_line.replace(date_match.group(1), '').strip()
                elif not next_line.startswith('•') and not next_line.startswith('-'):
                    # If next line doesn't start with bullet, it might be description
                    achievement['description'] = next_line
            
            if achievement['title']:
                achievements.append(achievement)
        
        return achievements


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
        certifications = self.section_detector.extract_certifications(sections.get('certifications', ''))
        achievements = self.section_detector.extract_achievements(sections.get('awards', ''))
        
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
            'certifications': certifications,
            'achievements': achievements,
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
