"""
LaTeX Utilities
Provides LaTeX sanitization and helper functions
"""

import re
from typing import Any, Dict
import logging

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
    }
    
    # Structure summary
    summary = escape_latex(data.get('summary', '') or data.get('professional_summary', ''))
    
    # Structure experience (convert to SimpleNamespace for dot notation)
    experience = []
    exp_data = data.get('experience', [])
    
    if isinstance(exp_data, list):
        for exp in exp_data:
            if not isinstance(exp, dict): continue
            experience.append(SimpleNamespace(
                position=escape_latex(exp.get('position', exp.get('title', ''))),
                company=escape_latex(exp.get('company', '')),
                location=escape_latex(exp.get('location', '')),
                start_date=escape_latex(format_date(exp.get('startDate', ''))),
                end_date=escape_latex(format_date(exp.get('endDate', ''))),
                current=exp.get('current', False),
                description=escape_latex(exp.get('description', '')),
                highlights=[escape_latex(h) for h in exp.get('highlights', []) if h],
            ))
    
    # Structure education (convert to SimpleNamespace for dot notation)
    education = []
    edu_data = data.get('education', [])
    if isinstance(edu_data, list):
        for edu in edu_data:
            if not isinstance(edu, dict): continue
            education.append(SimpleNamespace(
                degree=escape_latex(edu.get('degree', '')),
                field=escape_latex(edu.get('field', '')),
                institution=escape_latex(edu.get('institution', '')),
                location=escape_latex(edu.get('location', '')),
                start_date=escape_latex(format_date(edu.get('startDate', ''))),
                end_date=escape_latex(format_date(edu.get('endDate', ''))),
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
            
            projects.append(SimpleNamespace(
                name=escape_latex(proj.get('name', '')),
                description=escape_latex(proj.get('description', '')),
                technologies=technologies,
                link=escape_latex(proj.get('link', '')),
                highlights=[escape_latex(h) for h in proj.get('highlights', []) if h],
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
                skills.append(SimpleNamespace(
                    category=escape_latex(category.title()),
                    items=[escape_latex(str(item)) for item in items if item],
                ))
    elif isinstance(skills_data, list):
        # Format: [{category: "...", items: [...]}, ...]
        for skill in skills_data:
            if not isinstance(skill, dict): continue
            skill_items = skill.get('items', [])
            if not isinstance(skill_items, list): continue
            
            skills.append(SimpleNamespace(
                category=escape_latex(skill.get('category', '')),
                items=[escape_latex(str(item)) for item in skill_items if item],
            ))
    
    # Structure certifications (convert to SimpleNamespace for dot notation)
    certifications = []
    cert_data = data.get('certifications', [])
    if isinstance(cert_data, list):
        for cert in cert_data:
            if not isinstance(cert, dict): continue
            certifications.append(SimpleNamespace(
                name=escape_latex(cert.get('name', '')),
                issuer=escape_latex(cert.get('issuer', '')),
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
                title=escape_latex(ach.get('title', '')),
                description=escape_latex(ach.get('description', '')),
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
