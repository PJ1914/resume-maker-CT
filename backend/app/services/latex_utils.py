"""
LaTeX Utilities
Provides LaTeX sanitization and helper functions
"""

import re
from typing import Any, Dict
import logging

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
        date_str: Date in YYYY-MM format
        
    Returns:
        Formatted date string (e.g., "Jan 2024")
    """
    if not date_str:
        return ""
    
    try:
        # Parse YYYY-MM format
        year, month = date_str.split('-')
        months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]
        month_idx = int(month) - 1
        return f"{months[month_idx]} {year}"
    except (ValueError, IndexError):
        # Return original if parsing fails
        return date_str


def prepare_template_data(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare resume data for LaTeX template rendering.
    Formats dates and structures data, but DOES NOT escape LaTeX characters.
    Escaping should be done in the Jinja template using the | escape_tex filter.
    
    Args:
        resume_data: Raw resume data from Firestore
        
    Returns:
        Template-ready data (raw strings, formatted dates)
    """
    # Deep copy to avoid modifying original
    import copy
    logger = logging.getLogger(__name__)

    data = copy.deepcopy(resume_data)
    
    # Structure contact info
    contact = data.get('contact', {}) or data.get('contact_info', {})
    if not isinstance(contact, dict):
        contact = {}
    
    sanitized_contact = {
        'full_name': contact.get('fullName', '') or contact.get('name', ''),
        'email': contact.get('email', ''),
        'phone': contact.get('phone', ''),
        'location': contact.get('location', ''),
        'linkedin': contact.get('linkedin', ''),
        'github': contact.get('github', ''),
        'portfolio': contact.get('portfolio', ''),
    }
    
    # Structure summary
    summary = data.get('summary', '') or data.get('professional_summary', '')
    
    # Structure experience
    experience = []
    exp_data = data.get('experience', [])
    
    if isinstance(exp_data, list):
        for exp in exp_data:
            if not isinstance(exp, dict): continue
            experience.append({
                'position': exp.get('position', exp.get('title', '')),
                'company': exp.get('company', ''),
                'location': exp.get('location', ''),
                'start_date': format_date(exp.get('startDate', '')),
                'end_date': format_date(exp.get('endDate', '')),
                'current': exp.get('current', False),
                'description': exp.get('description', ''),
                'highlights': [h for h in exp.get('highlights', []) if h],
            })
    
    # Structure education
    education = []
    edu_data = data.get('education', [])
    if isinstance(edu_data, list):
        for edu in edu_data:
            if not isinstance(edu, dict): continue
            education.append({
                'degree': edu.get('degree', ''),
                'field': edu.get('field', ''),
                'institution': edu.get('institution', ''),
                'location': edu.get('location', ''),
                'start_date': format_date(edu.get('startDate', '')),
                'end_date': format_date(edu.get('endDate', '')),
                'gpa': edu.get('gpa', ''),
                'honors': edu.get('honors', ''),
            })
    
    # Structure projects
    projects = []
    proj_data = data.get('projects', [])
    if isinstance(proj_data, list):
        for proj in proj_data:
            if not isinstance(proj, dict): continue
            projects.append({
                'name': proj.get('name', ''),
                'description': proj.get('description', ''),
                'technologies': [t for t in proj.get('technologies', []) if t],
                'link': proj.get('link', ''),
                'highlights': [h for h in proj.get('highlights', []) if h],
                'start_date': format_date(proj.get('startDate', '')),
                'end_date': format_date(proj.get('endDate', '')),
            })
    
    # Structure skills
    skills = []
    skills_data = data.get('skills', [])
    
    if isinstance(skills_data, dict):
        # Format: {technical: [...], soft: [...]}
        for category, items in skills_data.items():
            if isinstance(items, list):
                skills.append({
                    'category': category.title(),
                    'items': [str(item) for item in items if item],
                })
    elif isinstance(skills_data, list):
        # Format: [{category: "...", items: [...]}, ...]
        for skill in skills_data:
            if not isinstance(skill, dict): continue
            skill_items = skill.get('items', [])
            if not isinstance(skill_items, list): continue
            
            skills.append({
                'category': skill.get('category', ''),
                'items': [str(item) for item in skill_items if item],
            })
    
    # Structure certifications
    certifications = []
    cert_data = data.get('certifications', [])
    if isinstance(cert_data, list):
        for cert in cert_data:
            if not isinstance(cert, dict): continue
            certifications.append({
                'name': cert.get('name', ''),
                'issuer': cert.get('issuer', ''),
                'date': format_date(cert.get('date', '')),
                'credential_id': cert.get('credentialId', ''),
                'url': cert.get('url', ''),
            })

    # Structure languages
    languages = []
    lang_data = data.get('languages', [])
    if isinstance(lang_data, list):
        for lang in lang_data:
            if not isinstance(lang, dict): continue
            languages.append({
                'language': lang.get('language', ''),
                'proficiency': lang.get('proficiency', ''),
            })

    # Structure achievements
    achievements = []
    ach_data = data.get('achievements', [])
    if isinstance(ach_data, list):
        for ach in ach_data:
            if not isinstance(ach, dict): continue
            achievements.append({
                'title': ach.get('title', ''),
                'description': ach.get('description', ''),
                'date': format_date(ach.get('date', '')),
            })
    
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
