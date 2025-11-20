"""
LaTeX Utilities
Provides LaTeX sanitization and helper functions
"""

import re
from typing import Any, Dict


def latex_escape(text: str) -> str:
    """
    Escape special LaTeX characters to prevent injection and compilation errors.
    
    Args:
        text: Raw text that may contain special characters
        
    Returns:
        LaTeX-safe string with escaped special characters
    """
    if not text:
        return ""
    
    # Special LaTeX characters that need escaping
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
    
    # Replace each special character
    result = text
    for char, replacement in replacements.items():
        result = result.replace(char, replacement)
    
    return result


def latex_escape_url(url: str) -> str:
    """
    Escape URL for use in LaTeX \href command.
    URLs need different escaping than regular text.
    
    Args:
        url: URL string
        
    Returns:
        LaTeX-safe URL
    """
    if not url:
        return ""
    
    # Only escape specific characters that break URLs in LaTeX
    replacements = {
        '%': r'\%',
        '#': r'\#',
        '&': r'\&',
    }
    
    result = url
    for char, replacement in replacements.items():
        result = result.replace(char, replacement)
    
    return result


def sanitize_resume_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively sanitize all text fields in resume data for LaTeX.
    
    Args:
        data: Resume data dictionary
        
    Returns:
        Sanitized data safe for LaTeX rendering
    """
    if isinstance(data, str):
        return latex_escape(data)
    elif isinstance(data, dict):
        return {key: sanitize_resume_data(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_resume_data(item) for item in data]
    else:
        return data


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
    Sanitizes text and formats dates.
    
    Args:
        resume_data: Raw resume data from Firestore
        
    Returns:
        Template-ready data with escaped text and formatted dates
    """
    # Deep copy to avoid modifying original
    import copy
    data = copy.deepcopy(resume_data)
    
    # Sanitize contact info
    contact = data.get('contact', {})
    sanitized_contact = {
        'full_name': latex_escape(contact.get('fullName', '')),
        'email': latex_escape(contact.get('email', '')),
        'phone': latex_escape(contact.get('phone', '')),
        'location': latex_escape(contact.get('location', '')),
        'linkedin': latex_escape_url(contact.get('linkedin', '')),
        'github': latex_escape_url(contact.get('github', '')),
        'portfolio': latex_escape_url(contact.get('portfolio', '')),
    }
    
    # Sanitize summary
    summary = latex_escape(data.get('summary', ''))
    
    # Sanitize and format experience
    experience = []
    for exp in data.get('experience', []):
        experience.append({
            'position': latex_escape(exp.get('position', exp.get('title', ''))),
            'company': latex_escape(exp.get('company', '')),
            'location': latex_escape(exp.get('location', '')),
            'start_date': format_date(exp.get('startDate', '')),
            'end_date': format_date(exp.get('endDate', '')),
            'current': exp.get('current', False),
            'description': latex_escape(exp.get('description', '')),
            'highlights': [latex_escape(h) for h in exp.get('highlights', []) if h],
        })
    
    # Sanitize and format education
    education = []
    for edu in data.get('education', []):
        education.append({
            'degree': latex_escape(edu.get('degree', '')),
            'field': latex_escape(edu.get('field', '')),
            'institution': latex_escape(edu.get('institution', '')),
            'location': latex_escape(edu.get('location', '')),
            'start_date': format_date(edu.get('startDate', '')),
            'end_date': format_date(edu.get('endDate', '')),
            'gpa': latex_escape(edu.get('gpa', '')),
            'honors': latex_escape(edu.get('honors', '')),
        })
    
    # Sanitize projects
    projects = []
    for proj in data.get('projects', []):
        projects.append({
            'name': latex_escape(proj.get('name', '')),
            'description': latex_escape(proj.get('description', '')),
            'technologies': [latex_escape(t) for t in proj.get('technologies', []) if t],
            'link': latex_escape_url(proj.get('link', '')),
            'highlights': [latex_escape(h) for h in proj.get('highlights', []) if h],
        })
    
    # Sanitize skills
    skills = []
    for skill in data.get('skills', []):
        skills.append({
            'category': latex_escape(skill.get('category', '')),
            'items': [latex_escape(item) for item in skill.get('items', []) if item],
        })
    
    return {
        **sanitized_contact,
        'summary': summary,
        'experience': experience,
        'education': education,
        'projects': projects,
        'skills': skills,
    }
