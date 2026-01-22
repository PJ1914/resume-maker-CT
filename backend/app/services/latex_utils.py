"""
LaTeX Utilities
Provides LaTeX sanitization and helper functions
"""

import re
from typing import Any, Dict
import logging

def clean_bullet_text(text: str) -> str:
    """
    Clean up bullet points, dashes, and other leading markers from text.
    Prevents double bullets/dashes in PDF output.
    
    Args:
        text: Text that may have leading bullets or dashes
        
    Returns:
        Cleaned text with leading markers removed
    """
    if not text:
        return ""
    
    text = str(text).strip()
    
    # Remove common leading bullet patterns
    # Patterns include: •, -, –, —, *, >, », ›, ○, ●, ▪, ▸, ◦, and their combinations
    bullet_patterns = [
        r'^[\s]*[•\-–—\*\>»›○●▪▸◦]+[\s]*',  # Common bullets
        r'^[\s]*[\d]+[\.\)]+[\s]*',  # Numbered lists like "1. " or "1) "
        r'^[\s]*[a-zA-Z][\.\)]+[\s]*',  # Lettered lists like "a. " or "a) "
    ]
    
    for pattern in bullet_patterns:
        text = re.sub(pattern, '', text, count=1)
    
    return text.strip()

def escape_latex(s: Any) -> str:
    """
    NO-OP function - escaping is now handled by templates using |escape_tex filter.
    This function is kept for backward compatibility but does NOT escape.
    Templates control escaping via the |escape_tex Jinja filter in latex_compiler.py.
    
    Args:
        s: String to pass through
        
    Returns:
        Original string converted to str
    """
    if not s:
        return ""
    return str(s)

# Keep these for backward compatibility or direct usage if needed
def latex_escape(text: str) -> str:
    """
    Escape special LaTeX characters.
    Note: In the new system, use the | escape_tex filter in Jinja templates instead.
    """
    if not text:
        return ""
    
    replacements = {
        '\\': r'\textbackslash{}',
        '{': r'\{',
        '}': r'\}',
        '$': r'\$',
        '&': r'\&',
        '%': r'\%',
        '#': r'\#',
        '_': r'\_',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
    }
    
    result = str(text)
    for char, replacement in replacements.items():
        result = result.replace(char, replacement)
    
    return result


def format_date(date_str: str) -> str:
    """
    Format date string for LaTeX display.
    
    Args:
        date_str: Date in YYYY-MM format or other human-readable format
        
    Returns:
        Formatted date string (e.g., "Jan 2024")
    """
    if not date_str:
        return ""
    
    date_str = str(date_str).strip()
    
    # Preserve common non-standard date strings as-is
    # Check for keywords that indicate it's already in human-readable format
    keywords = ['present', 'current', 'expected', 'ongoing', 'now', 
                'summer', 'spring', 'fall', 'winter', 'quarter']
    lower_date = date_str.lower()
    if any(keyword in lower_date for keyword in keywords):
        return date_str
    
    # If it's just a year (4 digits), return as-is
    if date_str.isdigit() and len(date_str) == 4:
        return date_str
    
    # If it contains a month name, it's already formatted
    month_names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                   'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    if any(month in lower_date for month in month_names):
        return date_str
    
    try:
        # Parse YYYY-MM format
        if '-' in date_str:
            parts = date_str.split('-')
            if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                year, month = parts
                months = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ]
                month_idx = int(month) - 1
                if 0 <= month_idx < 12:
                    return f"{months[month_idx]} {year}"
    except (ValueError, IndexError):
        pass
    
    # Return original if parsing fails
    return date_str


def split_date_range(start_date: str, end_date: str) -> tuple:
    """
    Detect if start_date or end_date contains a combined range (e.g., '2024 – 2028')
    and split it properly.
    
    Args:
        start_date: The start date field value
        end_date: The end date field value
        
    Returns:
        Tuple of (clean_start_date, clean_end_date)
    """
    # Range separators to look for - only dash with spaces indicates a range, not YYYY-MM
    separators = [' – ', ' - ', '–', ' to ']
    
    # Check if start_date contains a range
    clean_start = str(start_date).strip() if start_date else ''
    clean_end = str(end_date).strip() if end_date else ''
    
    # Helper to check if it looks like a YYYY-MM date format (not a range)
    def is_yyyy_mm_format(s):
        import re
        return bool(re.match(r'^\d{4}-\d{1,2}$', s.strip()))
    
    # Don't split if it looks like YYYY-MM format
    if is_yyyy_mm_format(clean_start):
        return (clean_start, clean_end)
    
    # If start_date contains a range separator, split it
    for sep in separators:
        if sep in clean_start:
            parts = clean_start.split(sep)
            if len(parts) == 2:
                # Make sure both parts look like valid dates (contain years)
                part0 = parts[0].strip()
                part1 = parts[1].strip()
                # Check if both parts have years (4-digit numbers)
                import re
                has_year_0 = bool(re.search(r'\d{4}', part0))
                has_year_1 = bool(re.search(r'\d{4}', part1)) or part1.lower() in ['present', 'current', 'now']
                
                if has_year_0 and has_year_1:
                    clean_start = part0
                    # Only use the second part as end_date if end_date is empty or same as start_date
                    if not clean_end or clean_end == start_date:
                        clean_end = part1
            break
    
    # If end_date contains a range separator, extract just the end part
    for sep in separators:
        if sep in clean_end:
            parts = clean_end.split(sep)
            if len(parts) == 2:
                clean_end = parts[1].strip()
            break
    
    return (clean_start, clean_end)


def prepare_template_data(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare resume data for LaTeX template rendering.
    Formats dates and structures data, but DOES NOT escape LaTeX characters.
    Escaping should be done in the Jinja template using the | escape_tex filter.
    
    All nested data structures (experience, education, projects, etc.) are converted
    to SimpleNamespace objects to enable dot notation access in templates (e.g., skill.items)
    instead of dict access which conflicts with dict.items() method.
    
    Args:
        resume_data: Raw resume data from Firestore
        
    Returns:
        Template-ready data with SimpleNamespace objects for nested structures
    """
    # Deep copy to avoid modifying original
    import copy
    from types import SimpleNamespace
    logger = logging.getLogger(__name__)

    data = copy.deepcopy(resume_data)
    
    # Helper to parse text into bullets (handling inline dashes/-)
    def parse_text_to_bullets(text):
        if not text: return [], ''
        text = str(text).strip()
        # Convert inline bullets to newlines
        # 1. Sentence ending followed by dash/bullet: "text. - Next" -> "text.\nNext"
        text = re.sub(r'([.!?])\s*[-•–—*]\s+', r'\1\n', text)
        # 2. Mid-line dashes acting as bullets: " text - next" -> " text\nnext"
        text = re.sub(r'\s+[-•–—*]\s+', r'\n', text)
        
        parts = re.split(r'[\n\r]+', text)
        cleaned = [clean_bullet_text(p) for p in parts if clean_bullet_text(p)]
        
        if len(cleaned) > 1:
            return [escape_latex(c) for c in cleaned], ''
        elif len(cleaned) == 1:
            return [], escape_latex(cleaned[0])
        return [], ''

    # Structure contact info
    contact = data.get('contact', {}) or data.get('contact_info', {})
    if not isinstance(contact, dict):
        contact = {}
    
    # Helper to ensure URLs have protocol for LaTeX \href command
    def ensure_url_protocol(url: str) -> str:
        """Add https:// if URL doesn't have protocol"""
        if not url:
            return ''
        url = str(url).strip()
        if not url:
            return ''
        if url.startswith(('http://', 'https://')):
            return url
        return f'https://{url}'
    
    sanitized_contact = {
        'full_name': escape_latex(contact.get('fullName', '') or contact.get('name', '')),
        'email': escape_latex(contact.get('email', '')),
        'phone': escape_latex(contact.get('phone', '')),
        'location': escape_latex(contact.get('location', '')),
        'linkedin': ensure_url_protocol(contact.get('linkedin', '')),
        'github': ensure_url_protocol(contact.get('github', '')),
        'portfolio': ensure_url_protocol(contact.get('portfolio', '')),
        'leetcode': ensure_url_protocol(contact.get('leetcode', '')),
        'codechef': ensure_url_protocol(contact.get('codechef', '')),
        'hackerrank': ensure_url_protocol(contact.get('hackerrank', '')),
        'website': ensure_url_protocol(contact.get('website', '') or contact.get('portfolio', '')),
    }
    
    # Structure summary
    summary = escape_latex(data.get('summary', '') or data.get('professional_summary', ''))
    
    # Structure experience (convert to SimpleNamespace for dot notation)
    experience = []
    exp_data = data.get('experience', [])
    
    if isinstance(exp_data, list):
        for exp in exp_data:
            if not isinstance(exp, dict): continue
            
            # Clean up date ranges
            raw_start = exp.get('startDate', '')
            raw_end = exp.get('endDate', '')
            clean_start, clean_end = split_date_range(raw_start, raw_end)
            
            # Determine end_date
            is_current = exp.get('current', False)
            if is_current:
                end_date = 'Present'
            elif clean_end:
                end_date = escape_latex(format_date(clean_end))
            else:
                end_date = ''
            
            # Use smart parser for description/highlights
            raw_description = str(exp.get('description', '') or '')
            raw_highlights = exp.get('highlights', []) or []
            if not isinstance(raw_highlights, list): raw_highlights = []
            
            final_description = ''
            all_highlights = []
            
            if raw_highlights:
                # Process each existing highlight to clean/split
                for h in raw_highlights:
                    h_list, h_desc = parse_text_to_bullets(h)
                    all_highlights.extend(h_list if h_list else ([h_desc] if h_desc else []))
            else:
                # Parse description
                all_highlights, final_description = parse_text_to_bullets(raw_description)
            
            experience.append(SimpleNamespace(
                position=escape_latex(exp.get('position', exp.get('title', ''))),
                company=escape_latex(exp.get('company', '')),
                location=escape_latex(exp.get('location', '')),
                start_date=escape_latex(format_date(clean_start)),
                end_date=end_date,
                current=is_current,
                description=final_description,
                highlights=all_highlights,
            ))
    
    # Structure education (convert to SimpleNamespace for dot notation)
    education = []
    edu_data = data.get('education', [])
    logger.info(f"[prepare_template_data] Processing {len(edu_data)} education entries")
    if isinstance(edu_data, list):
        for idx, edu in enumerate(edu_data):
            if not isinstance(edu, dict): continue
            
            logger.info(f"[prepare_template_data] Education #{idx+1}: {edu.get('school', 'N/A')}")
            logger.info(f"  Raw startDate: {edu.get('startDate', 'MISSING')}")
            logger.info(f"  Raw endDate: {edu.get('endDate', 'MISSING')}")
            
            # Get start and end dates
            raw_start = edu.get('startDate', '')
            raw_end = edu.get('endDate', '') or edu.get('year', '')
            
            clean_start, clean_end = split_date_range(raw_start, raw_end)
            
            start_formatted = escape_latex(format_date(clean_start)) if clean_start else ''
            end_formatted = escape_latex(format_date(clean_end)) if clean_end else ''
            
            if not end_formatted and not start_formatted:
                end_formatted = ''
            elif not end_formatted:
                end_formatted = 'Expected'
            
            # Ensure school attribute falls back to institution key if school is missing
            school_val = edu.get('school', '') or edu.get('institution', '')
            
            # Heuristic to infer grade type (Percentage vs CGPA) if missing or generic
            raw_grade_type = edu.get('gradeType', '') or edu.get('grade_type', '')
            raw_gpa = edu.get('gpa', '')
            final_grade_type = raw_grade_type
            
            if (not final_grade_type or final_grade_type.upper() == 'GPA') and raw_gpa:
                try:
                    val = float(str(raw_gpa).replace('%','').split('/')[0].strip())
                    if val > 20: # Safe threshold (some CGPAs are out of 20, but mostly 10. Percentage usually > 35)
                        final_grade_type = 'Percentage'
                    elif not final_grade_type and val <= 10: # Only default to CGPA if type was completely missing
                        final_grade_type = 'CGPA'
                except:
                    pass
            
            # Default to 'GPA' only if we still have nothing
            if not final_grade_type:
                final_grade_type = 'GPA'

            education.append(SimpleNamespace(
                degree=escape_latex(edu.get('degree', '')),
                field=escape_latex(edu.get('field', '')),
                school=escape_latex(school_val),
                institution=escape_latex(edu.get('institution', '') or edu.get('school', '')),
                location=escape_latex(edu.get('location', '')),
                start_date=start_formatted,
                end_date=end_formatted,
                startDate=start_formatted,  # Alias for compatibility
                endDate=end_formatted,      # Alias for compatibility
                gpa=escape_latex(edu.get('gpa', '')),
                grade_type=escape_latex(final_grade_type),
                honors=escape_latex(edu.get('honors', '')),
            ))
    
    # Structure projects (convert to SimpleNamespace for dot notation)
    projects = []
    proj_data = data.get('projects', [])
    if isinstance(proj_data, list):
        for proj in proj_data:
            if not isinstance(proj, dict): continue
            
            # Clean up date ranges
            raw_start = proj.get('startDate', '')
            raw_end = proj.get('endDate', '')
            clean_start, clean_end = split_date_range(raw_start, raw_end)
            
            # Handle technologies
            tech = proj.get('technologies', [])
            if isinstance(tech, str):
                technologies = [escape_latex(t.strip()) for t in tech.split(',') if t.strip()]
            elif isinstance(tech, list):
                technologies = [escape_latex(str(t)) for t in tech if t]
            else:
                technologies = []
            
            # Process description/highlights using smart parser
            raw_description = str(proj.get('description', '') or '')
            raw_highlights = proj.get('highlights', []) or []
            if not isinstance(raw_highlights, list): raw_highlights = []
            
            final_description = ''
            all_highlights = []
            
            if raw_highlights:
                for h in raw_highlights:
                    h_list, h_desc = parse_text_to_bullets(h)
                    all_highlights.extend(h_list if h_list else ([h_desc] if h_desc else []))
            else:
                all_highlights, final_description = parse_text_to_bullets(raw_description)
            
            projects.append(SimpleNamespace(
                name=escape_latex(proj.get('name', '')),
                description=final_description,
                technologies=technologies,
                link=escape_latex(proj.get('link', '')),
                highlights=all_highlights,
                start_date=escape_latex(format_date(clean_start)),
                end_date=format_date(clean_end),
            ))
    
    # Structure skills
    skills = []
    skills_data = data.get('skills', [])
    
    if isinstance(skills_data, dict):
        for category, items in skills_data.items():
            if isinstance(items, list):
                filtered_items = [escape_latex(str(item)) for item in items if item and str(item).strip()]
                if filtered_items:
                    skills.append(SimpleNamespace(
                        category=escape_latex(category.title()),
                        items=filtered_items,
                    ))
    elif isinstance(skills_data, list):
        for skill in skills_data:
            if not isinstance(skill, dict): continue
            skill_items = skill.get('items', [])
            if not isinstance(skill_items, list): continue
            
            filtered_items = [escape_latex(str(item)) for item in skill_items if item and str(item).strip()]
            if filtered_items:
                skills.append(SimpleNamespace(
                    category=escape_latex(skill.get('category', '')),
                    items=filtered_items,
                ))
    
    # Structure certifications
    certifications = []
    cert_data = data.get('certifications', [])
    if isinstance(cert_data, list):
        for cert in cert_data:
            if not isinstance(cert, dict): continue
            certifications.append(SimpleNamespace(
                name=escape_latex(clean_bullet_text(cert.get('name', ''))),
                issuer=escape_latex(clean_bullet_text(cert.get('issuer', ''))),
                date=format_date(cert.get('date', '')),
                credential_id=escape_latex(cert.get('credentialId', '')),
                url=escape_latex(cert.get('url', '')),
            ))

    # Structure languages
    languages = []
    lang_data = data.get('languages', [])
    if isinstance(lang_data, list):
        for lang in lang_data:
            if not isinstance(lang, dict): continue
            languages.append(SimpleNamespace(
                language=escape_latex(lang.get('language', '')),
                proficiency=escape_latex(lang.get('proficiency', '')),
            ))

    # Structure achievements
    achievements = []
    ach_data = data.get('achievements', [])
    if isinstance(ach_data, list):
        for ach in ach_data:
            if not isinstance(ach, dict): continue
            
            # Process description into highlights for achievements too
            raw_description = str(ach.get('description', '') or '')
            
            # Use smart parser
            all_highlights, final_description = parse_text_to_bullets(raw_description)
            
            achievements.append(SimpleNamespace(
                title=escape_latex(clean_bullet_text(ach.get('title', ''))),
                description=final_description,
                highlights=all_highlights,
                date=format_date(ach.get('date', '')),
            ))
    
    # Structure theme (with defaults)
    theme_data = data.get('theme', {})
    
    # Handle both dict and SimpleNamespace objects
    from types import SimpleNamespace
    if isinstance(theme_data, SimpleNamespace):
        # Already a SimpleNamespace, keep it
        theme = theme_data
    elif isinstance(theme_data, dict):
        # Convert dict to SimpleNamespace
        theme = SimpleNamespace(
            primary_color=theme_data.get('primary_color', '00008B'),
            secondary_color=theme_data.get('secondary_color', '4B4B4B'),
            font_size=theme_data.get('font_size', '11pt'),
            font_family=theme_data.get('font_family', 'default')
        )
    else:
        # Create default theme
        theme = SimpleNamespace(
            primary_color='00008B',
            secondary_color='4B4B4B',
            font_size='11pt',
            font_family='default'
        )
    
    return {
        **sanitized_contact,
        'summary': summary,
        'experience': experience,
        'education': education,
        'projects': projects,
        'skills': skills,
        'certifications': certifications,
        'languages': languages,
        'achievements': achievements,
        'theme': theme,
    }
