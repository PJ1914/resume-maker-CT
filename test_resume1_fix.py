"""Test script to verify resume_1 template fix"""
import sys
sys.path.insert(0, 'backend')

from app.services.latex_compiler import LaTeXCompiler
from types import SimpleNamespace

# Initialize compiler
compiler = LaTeXCompiler()

# Sample data
sample_data = {
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "website": "https://johndoe.com",
    "summary": "Experienced software engineer with expertise in full-stack development.",
    "theme": SimpleNamespace(primary_color="00008B", secondary_color="4B4B4B"),
    "education": [SimpleNamespace(**{
        "institution": "UC Berkeley",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "start_date": "2015",
        "end_date": "2019",
        "gpa": "3.8",
        "location": "Berkeley, CA"
    })],
    "experience": [SimpleNamespace(**{
        "position": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "start_date": "2020",
        "end_date": "Present",
        "description": "Lead developer for cloud infrastructure",
        "highlights": ["Improved performance by 40%"]
    })],
    "projects": [],
    "skills": [SimpleNamespace(category="Languages", items=["Python", "JavaScript"])],
    "certifications": [],
    "languages": [],
    "achievements": []
}

try:
    print("Testing resume_1 template rendering...")
    latex_source = compiler.render_template("resume_1", sample_data)
    print(f"✓ Template rendered successfully ({len(latex_source)} chars)")
    
    # Check for unreplaced Jinja tags
    if "\\VAR{" in latex_source or "\\BLOCK{" in latex_source:
        print("✗ ERROR: Found unreplaced Jinja tags!")
        sys.exit(1)
    else:
        print("✓ No unreplaced Jinja tags found")
    
    print("\n✓ All tests passed!")
    
except Exception as e:
    print(f"✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
