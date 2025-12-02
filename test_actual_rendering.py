"""Test actual LaTeX rendering to debug line 68 error"""
import sys
sys.path.insert(0, 'backend')

from app.services.latex_compiler import LaTeXCompiler
from app.services.latex_utils import prepare_template_data

# Create sample data exactly as in pdf_export.py
sample_resume_data = {
    "contact": {
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe",
        "portfolio": "https://johndoe.com"
    },
    "summary": "Experienced software engineer with expertise in full-stack development.",
    "education": [],
    "experience": [],
    "projects": [],
    "skills": [],
    "certifications": [],
    "languages": [],
    "achievements": []
}

# Render template (it will call prepare_template_data internally)
compiler = LaTeXCompiler()
latex_source = compiler.render_template("resume_1", sample_resume_data)

# Also prepare data separately to show what's extracted
sample_data = prepare_template_data(sample_resume_data)
print("Prepared data keys:", sample_data.keys())
print("full_name:", sample_data.get('full_name'))
print("phone:", sample_data.get('phone'))
print("email:", sample_data.get('email'))
print("linkedin:", sample_data.get('linkedin'))
print("github:", sample_data.get('github'))
print("location:", sample_data.get('location'))

# Find and print lines around line 68
lines = latex_source.split('\n')
print("\n" + "="*80)
print("RENDERED LATEX AROUND HEADER SECTION (lines 60-90):")
print("="*80)
for i, line in enumerate(lines[59:90], start=60):
    print(f"{i:3}: {line}")
