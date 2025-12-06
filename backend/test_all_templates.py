"""
Test script to verify all 7 resume templates can compile successfully
"""
import sys
import logging
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.latex_compiler import latex_compiler
from app.services.latex_utils import prepare_template_data

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample resume data for testing
SAMPLE_RESUME = {
    "contact": {
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe",
        "portfolio": "https://johndoe.com"
    },
    "summary": "Experienced software engineer with expertise in full-stack development and cloud technologies. Passionate about building scalable systems and mentoring junior developers.",
    "education": [{
        "institution": "University of California, Berkeley",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "startDate": "2015",
        "endDate": "2019",
        "gpa": "3.8",
        "location": "Berkeley, CA"
    }],
    "experience": [
        {
            "position": "Senior Software Engineer",
            "company": "Tech Corp",
            "location": "San Francisco, CA",
            "startDate": "2020",
            "endDate": "Present",
            "description": "Lead developer for cloud infrastructure projects",
            "highlights": [
                "Improved system performance by 40% through optimization",
                "Led a team of 5 engineers in developing microservices architecture",
                "Implemented CI/CD pipelines reducing deployment time by 60%"
            ]
        },
        {
            "position": "Software Engineer",
            "company": "StartupXYZ",
            "location": "San Francisco, CA",
            "startDate": "2019",
            "endDate": "2020",
            "description": "Full-stack developer building web applications",
            "highlights": [
                "Developed RESTful APIs serving 100K+ daily requests",
                "Built responsive frontend using React and TypeScript"
            ]
        }
    ],
    "projects": [
        {
            "name": "Open Source Project",
            "startDate": "2021",
            "endDate": "2023",
            "description": "Contributed to major open source initiative for cloud-native applications",
            "technologies": ["Python", "Docker", "Kubernetes", "Terraform"],
            "link": "https://github.com/example/project"
        }
    ],
    "skills": {
        "technical": ["Python", "JavaScript", "Java", "TypeScript", "Go", "React", "Node.js", "AWS", "Docker"],
        "soft": ["Leadership", "Communication", "Problem-solving"]
    },
    "certifications": [
        {
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "date": "2022",
        }
    ],
    "languages": [
        {"language": "English", "proficiency": "Native"},
        {"language": "Spanish", "proficiency": "Intermediate"}
    ],
    "achievements": [
        {
            "title": "Best Innovation Award",
            "date": "2022",
        }
    ]
}

TEMPLATES = ["resume_1", "resume_2", "resume_3", "resume_4", "resume_5", "resume_6", "resume_7"]

def test_template(template_name):
    """Test a single template"""
    logger.info(f"\n{'='*60}")
    logger.info(f"Testing {template_name}...")
    logger.info(f"{'='*60}")
    
    try:
        # Render template
        logger.info(f"Rendering {template_name}...")
        rendered_files = latex_compiler.render_template(template_name, SAMPLE_RESUME)
        logger.info(f"✓ Template rendered successfully")
        
        # Extract main.tex
        latex_source = rendered_files.get('main.tex', '')
        additional_files = {k: v for k, v in rendered_files.items() if k != 'main.tex'}
        
        if not latex_source:
            logger.error(f"✗ No main.tex content generated!")
            return False
        
        logger.info(f"  - main.tex size: {len(latex_source)} bytes")
        if additional_files:
            for fname, content in additional_files.items():
                logger.info(f"  - {fname} size: {len(content)} bytes")
        
        # Compile to PDF
        logger.info(f"Compiling {template_name} to PDF...")
        pdf_content = latex_compiler.compile_pdf(latex_source, template_name, additional_files)
        logger.info(f"✓ PDF compiled successfully")
        logger.info(f"  - PDF size: {len(pdf_content)} bytes")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Failed to compile {template_name}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def main():
    """Test all templates"""
    results = {}
    
    logger.info(f"\n\nTesting all {len(TEMPLATES)} resume templates...\n")
    
    for template in TEMPLATES:
        success = test_template(template)
        results[template] = success
    
    # Summary
    logger.info(f"\n\n{'='*60}")
    logger.info("TEST SUMMARY")
    logger.info(f"{'='*60}")
    
    passed = sum(1 for v in results.values() if v)
    failed = len(results) - passed
    
    for template, success in results.items():
        status = "✓ PASS" if success else "✗ FAIL"
        logger.info(f"  {template}: {status}")
    
    logger.info(f"\nTotal: {passed}/{len(TEMPLATES)} passed, {failed} failed")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
