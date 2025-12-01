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
    def extract_contact_info(text: str, hyperlinks: List[Dict[str, str]] = None) -> Dict[str, Optional[str]]:
        """
        Extract contact information using regex patterns and PDF hyperlinks.
        
        Args:
            text: Resume text (preferably from top section)
            hyperlinks: List of hyperlinks extracted from PDF (each has 'uri' key)
            
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
        
        # Process hyperlinks first if available (crucial for LaTeX-generated PDFs)
        if hyperlinks:
            for link in hyperlinks:
                uri = link.get('uri', '')
                if not uri:
                    continue
                    
                # Email from mailto: links
                if uri.startswith('mailto:') and not contact_info['email']:
                    email = uri.replace('mailto:', '').split('?')[0]  # Remove query params
                    contact_info['email'] = email
                    
                # LinkedIn
                elif 'linkedin.com/in/' in uri.lower() and not contact_info['linkedin']:
                    # Extract just the path part
                    match = re.search(r'linkedin\.com/in/([A-Za-z0-9_-]+)', uri, re.IGNORECASE)
                    if match:
                        contact_info['linkedin'] = f"linkedin.com/in/{match.group(1)}"
                    else:
                        # Use full URL if pattern doesn't match
                        contact_info['linkedin'] = uri.replace('https://', '').replace('http://', '').replace('www.', '')
                        
                # GitHub
                elif 'github.com/' in uri.lower() and not contact_info['github']:
                    match = re.search(r'github\.com/([A-Za-z0-9_-]+)', uri, re.IGNORECASE)
                    if match:
                        contact_info['github'] = f"github.com/{match.group(1)}"
                    else:
                        contact_info['github'] = uri.replace('https://', '').replace('http://', '').replace('www.', '')
                        
                # Portfolio/Website (any other http link)
                elif uri.startswith(('http://', 'https://')) and not contact_info['portfolio']:
                    # Skip common non-portfolio links
                    skip_domains = ['linkedin.com', 'github.com', 'leetcode.com', 'hackerrank.com', 'codeforces.com']
                    if not any(domain in uri.lower() for domain in skip_domains):
                        contact_info['portfolio'] = uri
        
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
        
        # Email - only extract from text if not already found from hyperlinks
        if not contact_info['email']:
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
        
        # LinkedIn - only extract from text if not already found from hyperlinks
        if not contact_info['linkedin']:
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
        
        # GitHub - only extract from text if not already found from hyperlinks
        if not contact_info['github']:
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
        
        # Portfolio/Website - only extract from text if not already found from hyperlinks
        if not contact_info['portfolio']:
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
        
        # Location - improved pattern for various formats
        # Must avoid matching partial words like "Hub" from "GitHub"
        # Matches: "Hyderabad, Telangana", "San Francisco, CA", "Jagital, Telangana", 
        # "Hyderabad, Telangana – 500097, India"
        
        # First, look for location on a dedicated line (after contact info)
        # Pattern: "City, State – Pincode, Country" or "City, State"
        lines = text.split('\n')
        for line in lines[:15]:  # Check first 15 lines for contact section
            line = line.strip()
            
            # Skip lines with common contact info patterns
            if '@' in line or 'linkedin' in line.lower() or 'github' in line.lower():
                continue
            if '|' in line:  # Contact separator line
                continue
            if not line or len(line) < 5:
                continue
            
            # Indian address with pincode: "Hyderabad, Telangana – 500097, India"
            loc_match = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z][a-z]+)\s*[–-]\s*\d{5,6},?\s*India$', line)
            if loc_match:
                contact_info['location'] = f"{loc_match.group(1)}, {loc_match.group(2)}"
                break
            
            # Indian address: "Hyderabad, Telangana, India" or "Hyderabad, India"
            loc_match = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z][a-z]+)(?:,\s*India)?$', line)
            if loc_match and loc_match.group(2).lower() not in ['present', 'current', 'now']:
                contact_info['location'] = f"{loc_match.group(1)}, {loc_match.group(2)}"
                break
            
            # US address: "San Francisco, CA" (two-letter state code)
            loc_match = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})$', line)
            if loc_match:
                contact_info['location'] = f"{loc_match.group(1)}, {loc_match.group(2)}"
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
        Handles multiple formats including LaTeX resume formats:
        1. "• Company Role Date" followed by "Location" on next line
        2. "Position, Company Date"
        3. "Company | Position Date"
        """
        experiences = []
        if not text:
            return experiences
            
        lines = text.split('\n')
        current_exp = None
        description_lines = []
        
        # Date patterns - handle various formats including "May2024" (no space)
        date_pattern = r'((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4})\s*[-–—]\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|Present|Current|Now)'
        
        # Year range pattern: 2022 - Present, June 2025 – Present
        year_range_pattern = r'((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)?\s*\d{4})\s*[-–—]\s*(\d{4}|Present|Current|Now)'
        
        # Location pattern for next-line location
        location_pattern = r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+(?:India|USA|UK|Canada|Australia|[A-Z][a-z]+)$'
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Check for bullet points starting with dash - these are descriptions
            if line.startswith('–') or (line.startswith('-') and not re.search(date_pattern, line)):
                bullet_text = line.lstrip('–- ').strip()
                if bullet_text and current_exp:
                    description_lines.append(bullet_text)
                i += 1
                continue
            
            # Check if this line contains a date range - likely a job header
            # Format: "• Company Role May2024–Aug2024" or "Company Role May 2024 – Aug 2024"
            is_bullet = line.startswith('•')
            clean_line = line.lstrip('• ').strip() if is_bullet else line
            
            date_match = re.search(date_pattern, clean_line, re.IGNORECASE)
            if not date_match:
                date_match = re.search(year_range_pattern, clean_line, re.IGNORECASE)
            
            if date_match:
                # Save previous experience
                if current_exp:
                    current_exp['description'] = '\n'.join(description_lines)
                    experiences.append(current_exp)
                    description_lines = []
                
                # Extract date range
                start_date = date_match.group(1).strip()
                end_date = date_match.group(2).strip()
                
                # Extract the job info (text before the date)
                job_info = clean_line[:date_match.start()].strip()
                job_info = job_info.rstrip(',|:')
                
                # Parse company and position
                # LaTeX format: "Calcitex Web Developer Intern" -> Company is first word, rest is position
                # Or: "CodeTapasya Founder– Full-Stack Developer" 
                company = ''
                position = ''
                location = ''
                
                # Check for explicit separators first
                if ' | ' in job_info:
                    parts = job_info.split(' | ')
                    company = parts[0].strip()
                    position = parts[1].strip() if len(parts) > 1 else ''
                elif '–' in job_info or ' - ' in job_info:
                    # "Founder– Full-Stack Developer" or "Founder - Full-Stack Developer"
                    sep = '–' if '–' in job_info else ' - '
                    parts = job_info.split(sep, 1)
                    first_part = parts[0].strip()
                    second_part = parts[1].strip() if len(parts) > 1 else ''
                    
                    # First word of first_part is likely company
                    first_words = first_part.split()
                    if len(first_words) >= 2:
                        company = first_words[0]
                        position = ' '.join(first_words[1:]) + (f" / {second_part}" if second_part else '')
                    else:
                        company = first_part
                        position = second_part
                else:
                    # Format: "Company Position Position" - first word is company
                    words = job_info.split()
                    if len(words) >= 2:
                        company = words[0]
                        position = ' '.join(words[1:])
                    else:
                        position = job_info
                
                # Check next line for location
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    loc_match = re.match(location_pattern, next_line, re.IGNORECASE)
                    if loc_match or (next_line and ',' in next_line and len(next_line) < 50 and 
                                    not next_line.startswith('–') and not next_line.startswith('-') and
                                    not re.search(date_pattern, next_line)):
                        # This looks like a location line
                        location = next_line.rstrip(',.')
                        i += 1  # Skip the location line
                
                current_exp = {
                    'company': company,
                    'position': position,
                    'location': location,
                    'startDate': start_date,
                    'endDate': end_date,
                    'description': '',
                }
                
            i += 1
        
        # Don't forget the last experience
        if current_exp:
            current_exp['description'] = '\n'.join(description_lines)
            experiences.append(current_exp)
        
        return experiences

    @staticmethod
    def extract_project_details(text: str) -> List[Dict[str, str]]:
        """
        Extract structured project details.
        Handles LaTeX format:
        1. "• Project Name– Description Tech" 
        2. "  Date (on separate line or at end)"
        3. "– Bullet point descriptions"
        """
        projects = []
        if not text:
            return projects
            
        lines = text.split('\n')
        current_proj = None
        
        # Date patterns - including year ranges
        date_pattern = r'((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4})'
        year_range_pattern = r'(\d{4})\s*[-–—]\s*(\d{4}|Present|Current|Now)'
        standalone_year = r'^(\d{4})(?:\s*[-–—]\s*(\d{4}|Present))?$'
        
        # Technology patterns - common tech keywords
        tech_keywords = r'\b(React\.?js|Angular|Vue\.?js|Node\.?js|Python|Java(?:Script)?|TypeScript|Flutter|Django|Flask|FastAPI|Spring|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes|AWS|Azure|GCP|Firebase|GraphQL|REST|API|HTML|CSS|Sass|Tailwind|Bootstrap|Git|CI/CD|Next\.?js|Express|Nest\.?js|Swift|Kotlin|Go|Rust|C\+\+|C#|\.NET|Ruby|Rails|PHP|Laravel|TensorFlow|PyTorch|Pandas|NumPy|Scikit-learn|OpenCV|Figma|Electron|MERN|Socket\.?io|WebSocket|Microservices|Serverless|AI|ML|Gemini|AR|VR|YOLOv8|TTS|DynamoDB|Lambda|Computer Vision|MusicGen|LMS)\b'
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
            
            is_bullet = line.startswith('•')
            is_dash = line.startswith('–') or line.startswith('-')
            clean_line = line.lstrip('•–- ').strip()
            
            # Check if this is a standalone date line (belongs to previous project)
            year_match = re.match(standalone_year, clean_line)
            if year_match and current_proj:
                start = year_match.group(1)
                end = year_match.group(2) if year_match.group(2) else start
                current_proj['startDate'] = start
                current_proj['endDate'] = end
                i += 1
                continue
            
            # Check if this is a description line (starts with dash or action verb)
            first_word = clean_line.lower().split()[0] if clean_line.split() else ''
            is_description = first_word in ['developed', 'built', 'designed', 'created', 'implemented', 
                                            'integrated', 'engineered', 'optimized', 'managed', 'led',
                                            'collaborated', 'worked', 'utilized', 'achieved', 'increased',
                                            'reduced', 'improved', 'spearheaded', 'architected', 'deployed',
                                            'converted', 'analyzed', 'presented']
            
            if is_dash and not is_bullet:
                # This is a bullet description
                if current_proj:
                    current_proj['highlights'].append(clean_line)
                i += 1
                continue
            
            # Check if this is a project header line
            # LaTeX format: "• Pulse AI– AI-Driven Monitoring System React.js, Django, Gemini API, AR/VR"
            if is_bullet and not is_description:
                # Save previous project
                if current_proj:
                    projects.append(current_proj)
                
                project_name = clean_line
                tech = ''
                date = ''
                description = ''
                
                # Check for "– Description" separator
                if '–' in project_name:
                    parts = project_name.split('–', 1)
                    project_name = parts[0].strip()
                    remainder = parts[1].strip() if len(parts) > 1 else ''
                    
                    # The remainder might contain description and tech
                    # Find tech keywords at the end
                    tech_matches = re.findall(tech_keywords, remainder, re.IGNORECASE)
                    if tech_matches:
                        tech = ', '.join(tech_matches)
                        # What's left is the description
                        for t in tech_matches:
                            remainder = re.sub(r'\b' + re.escape(t) + r'\b,?\s*', '', remainder, flags=re.IGNORECASE)
                        description = remainder.strip().rstrip(',')
                    else:
                        description = remainder
                
                # Extract date from project name or end if present
                date_match = re.search(date_pattern, project_name, re.IGNORECASE)
                year_match_proj = re.search(year_range_pattern, project_name)
                
                if date_match:
                    date = date_match.group(1)
                    project_name = project_name[:date_match.start()].strip()
                elif year_match_proj:
                    date = f"{year_match_proj.group(1)} - {year_match_proj.group(2)}"
                    project_name = project_name[:year_match_proj.start()].strip()
                
                # Clean up project name
                project_name = project_name.rstrip('–—-|,').strip()
                
                current_proj = {
                    'name': project_name,
                    'description': description,
                    'technologies': tech,
                    'startDate': date,
                    'endDate': date,
                    'link': '',
                    'role': '',
                    'highlights': []
                }
            
            elif current_proj and is_description:
                # Action verb line - add as highlight
                current_proj['highlights'].append(clean_line)
            
            i += 1
        
        if current_proj:
            projects.append(current_proj)
            
        # Post-process: combine description and highlights, extract tech from highlights
        for proj in projects:
            if proj['highlights']:
                proj['description'] = '\n'.join(proj['highlights'])
                
                # If no technologies found, scan all highlights
                if not proj['technologies']:
                    all_tech = []
                    for h in proj['highlights']:
                        matches = re.findall(tech_keywords, h, re.IGNORECASE)
                        all_tech.extend(matches)
                    if all_tech:
                        proj['technologies'] = ', '.join(set(all_tech))
            
            del proj['highlights']
            
        return projects

    @staticmethod
    def extract_education_details(text: str) -> List[Dict[str, str]]:
        """
        Extract structured education details.
        Handles LaTeX format:
        • TKRCollege of Engineering and Technology B.Tech in Computer Science, GPA: 7.08/10 Nov2022– May2026
        Hyderabad, India
        • Sri Chaitanya Junior College Intermediate Education (MPC) Completed May 2022
        Jagtial, India
        """
        education = []
        if not text:
            return education
            
        lines = text.split('\n')
        
        # Date patterns
        date_range_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})\s*[-–]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|Present|Current)'
        completed_pattern = r'Completed\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{4})'
        
        # GPA patterns  
        gpa_pattern = r'(?:GPA|CGPA)[:\s]*(\d+\.?\d*)\s*/?\s*(\d+)?'
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            is_bullet = line.startswith('•')
            clean_line = line.lstrip('• ').strip() if is_bullet else line
            
            # Check if this looks like an education entry (has school name + degree info)
            has_degree = any(deg in clean_line for deg in ['B.Tech', 'B.E.', 'M.Tech', 'MBA', 'BSc', 'MSc', 'BA', 'MA', 'PhD', 
                                                           'Bachelor', 'Master', 'Intermediate', 'High School', 'Diploma',
                                                           'B.S.', 'M.S.', 'Computer Science', 'Engineering'])
            has_date = bool(re.search(date_range_pattern, clean_line, re.IGNORECASE) or 
                          re.search(completed_pattern, clean_line, re.IGNORECASE))
            
            if (is_bullet and (has_degree or has_date)) or (has_degree and has_date):
                # This is an education entry
                school = ''
                degree = ''
                field = ''
                gpa = None
                start_date = ''
                end_date = ''
                location = ''
                
                # Extract date range
                date_match = re.search(date_range_pattern, clean_line, re.IGNORECASE)
                completed_match = re.search(completed_pattern, clean_line, re.IGNORECASE)
                
                if date_match:
                    start_date = date_match.group(1).strip()
                    end_date = date_match.group(2).strip()
                    clean_line = clean_line[:date_match.start()].strip()
                elif completed_match:
                    end_date = completed_match.group(1).strip()
                    start_date = ''
                    clean_line = clean_line[:completed_match.start()].strip()
                
                # Extract GPA
                gpa_match = re.search(gpa_pattern, clean_line, re.IGNORECASE)
                if gpa_match:
                    gpa_value = gpa_match.group(1)
                    gpa_max = gpa_match.group(2) if gpa_match.group(2) else '10'
                    gpa = f"{gpa_value}/{gpa_max}"
                    clean_line = clean_line[:gpa_match.start()].strip().rstrip(',')
                
                # Parse school and degree
                # Common patterns:
                # "TKR College B.Tech in Computer Science"
                # "School Name Degree Field"
                
                degree_keywords = ['B.Tech', 'B.E.', 'M.Tech', 'MBA', 'BSc', 'MSc', 'BA', 'MA', 'PhD', 
                                   'Bachelor', 'Master', 'Intermediate Education', 'High School', 'Diploma',
                                   'B.S.', 'M.S.']
                
                degree_found = None
                degree_pos = len(clean_line)
                
                for dk in degree_keywords:
                    pos = clean_line.find(dk)
                    if pos != -1 and pos < degree_pos:
                        degree_pos = pos
                        degree_found = dk
                
                if degree_found:
                    school = clean_line[:degree_pos].strip()
                    degree_part = clean_line[degree_pos:].strip()
                    
                    # Check for "in Field" pattern
                    in_match = re.search(r'\s+in\s+(.+)$', degree_part, re.IGNORECASE)
                    if in_match:
                        field = in_match.group(1).strip()
                        degree = degree_part[:in_match.start()].strip()
                    else:
                        # Check for parenthetical field like "(MPC)"
                        paren_match = re.search(r'\(([^)]+)\)', degree_part)
                        if paren_match:
                            field = paren_match.group(1)
                            degree = degree_part.replace(f"({field})", '').strip()
                        else:
                            degree = degree_part
                else:
                    school = clean_line
                
                # Check next line for location
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    # Location pattern: "City, Country" or "City, State"
                    if next_line and ',' in next_line and len(next_line) < 50:
                        if not next_line.startswith('•') and not any(deg in next_line for deg in degree_keywords):
                            location = next_line.rstrip(',.')
                            i += 1
                
                edu = {
                    'school': school.rstrip(',').strip(),
                    'degree': degree.rstrip(',').strip(),
                    'field': field.rstrip(',').strip(),
                    'startDate': start_date,
                    'endDate': end_date,
                    'gpa': gpa,
                    'location': location
                }
                
                education.append(edu)
            
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
        metadata: Optional[Dict] = None,
        structured_data: Optional[Dict] = None,
        hyperlinks: Optional[List[Dict[str, str]]] = None
    ) -> Dict:
        """
        Parse resume text and extract structured information.
        
        Args:
            text: Raw resume text
            metadata: Optional metadata (filename, content_type, etc.)
            structured_data: Pre-parsed structured data (from LaTeX extraction)
            hyperlinks: List of hyperlinks extracted from PDF (for LaTeX-generated PDFs)
            
        Returns:
            Structured resume data
        """
        # Store hyperlinks for use in extraction
        self._hyperlinks = hyperlinks or []
        
        # If we have structured LaTeX data, use it directly
        if structured_data and self._is_valid_structured_data(structured_data):
            return self._build_from_structured_data(text, structured_data, metadata)
        
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
        # Pass hyperlinks for LaTeX-generated PDFs
        contact_text = sections.get('header', '') + '\n' + sections.get('contact', '')
        contact_info = self.section_detector.extract_contact_info(contact_text, self._hyperlinks)
        
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
    
    def _is_valid_structured_data(self, data: Dict) -> bool:
        """Check if structured data has useful content."""
        if not data:
            return False
        
        # Check if we have meaningful data
        has_contact = bool(data.get('contact_info', {}).get('name') or 
                         data.get('contact_info', {}).get('email'))
        has_experience = bool(data.get('experience'))
        has_education = bool(data.get('education'))
        has_projects = bool(data.get('projects'))
        has_skills = bool(data.get('skills'))
        
        # Consider valid if we have contact + at least one other section
        return has_contact and (has_experience or has_education or has_projects or has_skills)
    
    def _build_from_structured_data(
        self,
        text: str,
        structured_data: Dict,
        metadata: Optional[Dict]
    ) -> Dict:
        """Build parser result from pre-parsed structured data (LaTeX)."""
        
        # Convert skills dict to flat list if needed
        skills = structured_data.get('skills', {})
        if isinstance(skills, dict):
            skills_flat = []
            for category, skill_list in skills.items():
                if isinstance(skill_list, list):
                    skills_flat.extend(skill_list)
                else:
                    skills_flat.append(str(skill_list))
            skills = skills_flat
        
        result = {
            'parsed_text': text,
            'layout_type': 'latex',
            'sections': structured_data.get('sections', {}),
            'contact_info': structured_data.get('contact_info', {}),
            'skills': skills,
            'experience': structured_data.get('experience', []),
            'projects': structured_data.get('projects', []),
            'education': structured_data.get('education', []),
            'certifications': [],
            'achievements': [],
            'parsed_at': datetime.utcnow().isoformat(),
            'metadata': metadata or {},
            'source': 'latex_structured'
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
