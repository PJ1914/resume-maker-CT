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
    
    # Structure contact info
    contact = data.get('contact', {}) or data.get('contact_info', {})
    if not isinstance(contact, dict):
        contact = {}
    
    sanitized_contact = {
        'full_name': escape_latex(contact.get('fullName', '') or contact.get('name', '')),
        'email': escape_latex(contact.get('email', '')),
        'phone': escape_latex(contact.get('phone', '')),
        'location': escape_latex(contact.get('location', '')),
        'linkedin': escape_latex(contact.get('linkedin', '')),
        'github': escape_latex(contact.get('github', '')),
        'portfolio': escape_latex(contact.get('portfolio', '')),
        'leetcode': escape_latex(contact.get('leetcode', '')),
        'codechef': escape_latex(contact.get('codechef', '')),
        'hackerrank': escape_latex(contact.get('hackerrank', '')),
        'website': escape_latex(contact.get('website', '') or contact.get('portfolio', '')),
    }
    
    # Structure summary
    summary = escape_latex(data.get('summary', '') or data.get('professional_summary', ''))
    
    # Structure experience (convert to SimpleNamespace for dot notation)
    experience = []
    exp_data = data.get('experience', [])
    
    if isinstance(exp_data, list):
        for exp in exp_data:
            if not isinstance(exp, dict): continue
            # Determine end_date - use "Present" only if explicitly current
            end_date_raw = exp.get('endDate', '')
            is_current = exp.get('current', False)
            
            if is_current:
                # Explicitly marked as current job
                end_date = 'Present'
            elif end_date_raw:
                # Has an end date, use it
                end_date = escape_latex(format_date(end_date_raw))
            else:
                # No end date and not marked as current - leave empty
                # (template will handle display)
                end_date = ''
            
            # Get raw values
            raw_description = str(exp.get('description', '') or '')
            raw_highlights = exp.get('highlights', []) or []
            if not isinstance(raw_highlights, list):
                raw_highlights = []
            
            # Simple approach: if we have highlights, skip description (it's often duplicated)
            # If no highlights, use description
            final_description = ''
            all_highlights = []
            
            if raw_highlights:
                # Use highlights only, skip description to avoid duplicates
                seen = set()
                for h in raw_highlights:
                    if not h:
                        continue
                    cleaned = clean_bullet_text(str(h))
                    if not cleaned:
                        continue
                    key = cleaned[:50].lower().strip()
                    if key not in seen:
                        seen.add(key)
                        all_highlights.append(escape_latex(cleaned))
            elif raw_description:
                # No highlights, try to parse description into bullets
                # Split by newlines and bullet chars
                parts = re.split(r'[\n\r]+', raw_description)
                cleaned_parts = []
                for p in parts:
                    cleaned = clean_bullet_text(p.strip())
                    if cleaned:
                        cleaned_parts.append(cleaned)
                
                if len(cleaned_parts) > 1:
                    # Multiple lines - treat as highlights
                    all_highlights = [escape_latex(p) for p in cleaned_parts]
                elif len(cleaned_parts) == 1:
                    # Single paragraph - keep as description
                    final_description = escape_latex(cleaned_parts[0])
            
            experience.append(SimpleNamespace(
                position=escape_latex(exp.get('position', exp.get('title', ''))),
                company=escape_latex(exp.get('company', '')),
                location=escape_latex(exp.get('location', '')),
                start_date=escape_latex(format_date(exp.get('startDate', ''))),
                end_date=end_date,
                current=is_current,
                description=final_description,
                highlights=all_highlights,
            ))
    
    # Structure education (convert to SimpleNamespace for dot notation)
    education = []
    edu_data = data.get('education', [])
    if isinstance(edu_data, list):
        for edu in edu_data:
            if not isinstance(edu, dict): continue
            # Handle empty end_date
            end_date_raw = edu.get('endDate', '')
            if end_date_raw:
                end_date = escape_latex(format_date(end_date_raw))
            else:
                end_date = 'Present'
            
            education.append(SimpleNamespace(
                degree=escape_latex(edu.get('degree', '')),
                field=escape_latex(edu.get('field', '')),
                institution=escape_latex(edu.get('institution', '')),
                location=escape_latex(edu.get('location', '')),
                start_date=escape_latex(format_date(edu.get('startDate', ''))),
                end_date=end_date,
                gpa=escape_latex(edu.get('gpa', '')),
                honors=escape_latex(edu.get('honors', '')),
            ))
    
    # Structure projects (convert to SimpleNamespace for dot notation)
    projects = []
    proj_data = data.get('projects', [])
    if isinstance(proj_data, list):
        for proj in proj_data:
            if not isinstance(proj, dict): continue
            
            # Handle technologies as either string or list
            tech = proj.get('technologies', [])
            if isinstance(tech, str):
                # Split comma-separated string into list
                technologies = [escape_latex(t.strip()) for t in tech.split(',') if t.strip()]
            elif isinstance(tech, list):
                technologies = [escape_latex(str(t)) for t in tech if t]
            else:
                technologies = []
            
            # Get raw values
            raw_description = str(proj.get('description', '') or '')
            raw_highlights = proj.get('highlights', []) or []
            if not isinstance(raw_highlights, list):
                raw_highlights = []
            
            # Simple approach: if we have highlights, skip description (it's often duplicated)
            final_description = ''
            all_highlights = []
            
            if raw_highlights:
                # Use highlights only
                seen = set()
                for h in raw_highlights:
                    if not h:
                        continue
                    cleaned = clean_bullet_text(str(h))
                    if not cleaned:
                        continue
                    key = cleaned[:50].lower().strip()
                    if key not in seen:
                        seen.add(key)
                        all_highlights.append(escape_latex(cleaned))
            elif raw_description:
                # No highlights, try to parse description
                parts = re.split(r'[\n\r]+', raw_description)
                cleaned_parts = []
                for p in parts:
                    cleaned = clean_bullet_text(p.strip())
                    if cleaned:
                        cleaned_parts.append(cleaned)
                
                if len(cleaned_parts) > 1:
                    all_highlights = [escape_latex(p) for p in cleaned_parts]
                elif len(cleaned_parts) == 1:
                    final_description = escape_latex(cleaned_parts[0])
            
            projects.append(SimpleNamespace(
                name=escape_latex(proj.get('name', '')),
                description=final_description,
                technologies=technologies,
                link=escape_latex(proj.get('link', '')),
                highlights=all_highlights,
                start_date=escape_latex(format_date(proj.get('startDate', ''))),
                end_date=format_date(proj.get('endDate', '')),
            ))
    
    # Structure skills (convert to SimpleNamespace for dot notation to avoid dict.items() conflict)
    skills = []
    skills_data = data.get('skills', [])
    
    if isinstance(skills_data, dict):
        # Format: {technical: [...], soft: [...]}
        for category, items in skills_data.items():
            if isinstance(items, list):
                # Filter out empty items and only add category if it has items
                filtered_items = [escape_latex(str(item)) for item in items if item and str(item).strip()]
                if filtered_items:  # Only add category if it has non-empty items
                    skills.append(SimpleNamespace(
                        category=escape_latex(category.title()),
                        items=filtered_items,
                    ))
    elif isinstance(skills_data, list):
        # Format: [{category: "...", items: [...]}, ...]
        for skill in skills_data:
            if not isinstance(skill, dict): continue
            skill_items = skill.get('items', [])
            if not isinstance(skill_items, list): continue
            
            # Filter out empty items and only add category if it has items
            filtered_items = [escape_latex(str(item)) for item in skill_items if item and str(item).strip()]
            if filtered_items:  # Only add category if it has non-empty items
                skills.append(SimpleNamespace(
                    category=escape_latex(skill.get('category', '')),
                    items=filtered_items,
                ))
    
    # Structure certifications (convert to SimpleNamespace for dot notation)
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

    # Structure languages (convert to SimpleNamespace for dot notation)
    languages = []
    lang_data = data.get('languages', [])
    if isinstance(lang_data, list):
        for lang in lang_data:
            if not isinstance(lang, dict): continue
            languages.append(SimpleNamespace(
                language=escape_latex(lang.get('language', '')),
                proficiency=escape_latex(lang.get('proficiency', '')),
            ))

    # Structure achievements (convert to SimpleNamespace for dot notation)
    achievements = []
    ach_data = data.get('achievements', [])
    if isinstance(ach_data, list):
        for ach in ach_data:
            if not isinstance(ach, dict): continue
            achievements.append(SimpleNamespace(
                title=escape_latex(clean_bullet_text(ach.get('title', ''))),
                description=escape_latex(clean_bullet_text(ach.get('description', ''))),
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
