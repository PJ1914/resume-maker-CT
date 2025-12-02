"""
Test script to verify Jinja2 template fixes
"""

import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from app.services.latex_compiler import latex_compiler
from types import SimpleNamespace

def test_template_loading():
    """Test that templates can be loaded without Jinja2 errors"""
    
    # Test data
    sample_data = {
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe",
        "website": "https://johndoe.com",
        "summary": "Experienced software engineer with expertise in full-stack development and cloud technologies.",
        "theme": SimpleNamespace(primary_color="00008B", secondary_color="4B4B4B"),
        "education": [SimpleNamespace(**{
            "institution": "University of California, Berkeley",
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
            "description": "Lead developer for cloud infrastructure projects",
            "highlights": [
                "Improved system performance by 40%",
                "Led a team of 5 engineers"
            ]
        })],
        "projects": [SimpleNamespace(**{
            "name": "Open Source Project",
            "start_date": "2021",
            "end_date": "2023",
            "description": "Contributed to major open source initiative",
            "technologies": ["Python", "Docker", "Kubernetes"],
            "link": "https://github.com/example/project"
        })],
        "skills": [
            SimpleNamespace(category="Programming Languages", items=["Python", "JavaScript", "Java"]),
            SimpleNamespace(category="Technologies", items=["Docker", "Kubernetes", "AWS"])
        ],
        "certifications": [SimpleNamespace(**{
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "date": "2022"
        })],
        "languages": [SimpleNamespace(**{
            "language": "English",
            "proficiency": "Native"
        })],
        "achievements": [SimpleNamespace(**{
            "title": "Best Innovation Award",
            "date": "2022",
            "description": "Recognized for outstanding contribution to product development"
        })]
    }
    
    # Test templates that were failing
    templates_to_test = ["resume_1", "resume_3", "resume_4", "resume_5", "resume_6"]
    
    for template_name in templates_to_test:
        print(f"\nTesting {template_name}...")
        try:
            latex_source = latex_compiler.render_template(template_name, sample_data)
            print(f"✓ {template_name} rendered successfully!")
            print(f"  Output length: {len(latex_source)} characters")
            
            # Check for unreplaced Jinja tags
            if "\\VAR{" in latex_source or "\\BLOCK{" in latex_source:
                print(f"  ⚠ Warning: Unreplaced Jinja tags found!")
            else:
                print(f"  ✓ No unreplaced Jinja tags")
                
        except Exception as e:
            print(f"✗ {template_name} FAILED: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*50)
    print("Test complete!")

if __name__ == "__main__":
    test_template_loading()
