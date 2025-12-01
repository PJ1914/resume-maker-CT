"""
LaTeX Utilities
Provides LaTeX sanitization and helper functions
"""

import re
from typing import Any, Dict
import logging


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
    logger = logging.getLogger(__name__)

    logger.debug("PREPARE_TEMPLATE_DATA called")

    data = copy.deepcopy(resume_data)

    logger.info("Preparing template data. Keys: %s", list(data.keys()))
    
    # Sanitize contact info (handle both 'contact' and 'contact_info' keys)
    contact = data.get('contact', {}) or data.get('contact_info', {})
    if not isinstance(contact, dict):
        logger.warning(f"Contact is not a dict, it's {type(contact)}: {contact}")
        contact = {}
    
    sanitized_contact = {
        'full_name': latex_escape(contact.get('fullName', '') or contact.get('name', '')),
        'email': latex_escape(contact.get('email', '')),
        'phone': latex_escape(contact.get('phone', '')),
        'location': latex_escape(contact.get('location', '')),
        'linkedin': latex_escape_url(contact.get('linkedin', '')),
        'github': latex_escape_url(contact.get('github', '')),
        'portfolio': latex_escape_url(contact.get('portfolio', '')),
    }
    
    # Sanitize summary (handle both 'summary' and 'professional_summary' keys)
    summary = latex_escape(data.get('summary', '') or data.get('professional_summary', ''))
    
    # Sanitize and format experience
    experience = []
    exp_data = data.get('experience', [])
    logger.info(f"Experience type: {type(exp_data)}, length: {len(exp_data) if isinstance(exp_data, list) else 'N/A'}")
    
    for i, exp in enumerate(exp_data):
        # Skip if exp is not a dict
        if not isinstance(exp, dict):
            logger.warning(f"Experience[{i}] is not a dict, it's {type(exp)}: {exp}")
            continue
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
        # Skip if edu is not a dict
        if not isinstance(edu, dict):
            continue
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
        # Skip if proj is not a dict
        if not isinstance(proj, dict):
            continue
        projects.append({
            'name': latex_escape(proj.get('name', '')),
            'description': latex_escape(proj.get('description', '')),
            'technologies': [latex_escape(t) for t in proj.get('technologies', []) if t],
            'link': latex_escape_url(proj.get('link', '')),
            'highlights': [latex_escape(h) for h in proj.get('highlights', []) if h],
        })
    
    # Sanitize skills
    skills = []
    skills_data = data.get('skills', [])
    
    logger.debug("Skills type: %s", type(skills_data))
    logger.debug("Skills content: %s", skills_data)
    
    # Handle different skills formats
    if isinstance(skills_data, dict):
        # Format: {technical: [...], soft: [...]}
        logger.info("Processing skills as dict format")
        for category, items in skills_data.items():
            logger.debug("Category: %s, Items type: %s", category, type(items))
            if isinstance(items, list):
                skills.append({
                    'category': latex_escape(category.title()),
                    'items': [latex_escape(str(item)) for item in items if item],
                })
    elif isinstance(skills_data, list):
        # Format: [{category: "...", items: [...]}, ...]
        logger.info("Processing skills as list format")
        for i, skill in enumerate(skills_data):
            logger.debug("Skill[%s] type: %s", i, type(skill))
            if not isinstance(skill, dict):
                logger.warning("Skill item is not a dict, it's %s: %s", type(skill), skill)
                continue

            # Get items safely - could be a list or the dict.items method
            skill_items = skill.get('items', [])
            logger.debug("Skill[%s] items type: %s", i, type(skill_items))

            # Make sure items is a list, not the dict.items() method
            if not isinstance(skill_items, list):
                logger.warning("Skill[%s] items is not a list, skipping", i)
                continue

            skills.append({
                'category': latex_escape(skill.get('category', '')),
                'items': [latex_escape(str(item)) for item in skill_items if item],
            })
    
    logger.debug("Final skills count: %s", len(skills))
    for i, skill in enumerate(skills):
        logger.debug("Final skill[%s]: %s", i, skill)
    
    result = {
        **sanitized_contact,
        'summary': summary,
        'experience': experience,
        'education': education,
        'projects': projects,
        'skills': skills,
    }
    
    logger.debug("Result skills type: %s", type(result['skills']))
    logger.debug("Result skills: %s", result['skills'])
    
    return result
