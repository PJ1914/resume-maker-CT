"""Comprehensive test of preview endpoint data flow"""
import sys
sys.path.insert(0, 'backend')

from app.services.latex_compiler import LaTeXCompiler

# Create comprehensive sample data matching pdf_export.py
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
        },
        {
            "name": "Personal Portfolio Website",
            "startDate": "2022",
            "endDate": "",
            "description": "Built modern portfolio site with blog functionality",
            "technologies": ["Next.js", "TypeScript", "Tailwind CSS"],
            "link": "https://johndoe.com"
        }
    ],
    "skills": [
        {"category": "Programming Languages", "items": ["Python", "JavaScript", "Java", "TypeScript", "Go"]},
        {"category": "Frameworks & Libraries", "items": ["React", "Node.js", "FastAPI", "Django", "Next.js"]},
        {"category": "Cloud & DevOps", "items": ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins"]},
        {"category": "Databases", "items": ["PostgreSQL", "MongoDB", "Redis", "DynamoDB"]}
    ],
    "certifications": [
        {
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "date": "2022",
            "credentialId": "AWS-123456",
            "url": "https://aws.amazon.com/certification/"
        },
        {
            "name": "Certified Kubernetes Administrator",
            "issuer": "Cloud Native Computing Foundation",
            "date": "2021"
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
            "description": "Recognized for outstanding contribution to product development and innovation"
        }
    ]
}

# Render template
compiler = LaTeXCompiler()
latex_source = compiler.render_template("resume_1", sample_resume_data)

# Verification checks
print("="*80)
print("COMPREHENSIVE PREVIEW VERIFICATION")
print("="*80)

checks = {
    "Full Name": "John Doe" in latex_source,
    "Email": "john.doe@example.com" in latex_source,
    "Phone": "+1 (555) 123-4567" in latex_source,
    "Location": "San Francisco, CA" in latex_source,
    "LinkedIn": "linkedin.com/in/johndoe" in latex_source,
    "GitHub": "github.com/johndoe" in latex_source,
    "Summary": "Experienced software engineer" in latex_source,
    "Education": "University of California, Berkeley" in latex_source,
    "Experience - Position 1": "Senior Software Engineer" in latex_source,
    "Experience - Company 1": "Tech Corp" in latex_source,
    "Experience - Position 2": "Software Engineer" in latex_source,
    "Experience - Company 2": "StartupXYZ" in latex_source,
    "Project 1": "Open Source Project" in latex_source,
    "Project 2": "Personal Portfolio Website" in latex_source,
    "Skills - Category 1": "Programming Languages" in latex_source,
    "Skills - Python": "Python" in latex_source,
    "Skills - JavaScript": "JavaScript" in latex_source,
    "Certification 1": "AWS Certified Solutions Architect" in latex_source,
    "Certification 2": "Certified Kubernetes Administrator" in latex_source,
    "Language 1": "English" in latex_source,
    "Language 2": "Spanish" in latex_source,
    "Achievement": "Best Innovation Award" in latex_source,
    "No unreplaced VAR tags": "\\VAR{" not in latex_source,
    "No unreplaced BLOCK tags": "\\BLOCK{" not in latex_source,
}

passed = 0
failed = 0
for check_name, result in checks.items():
    status = "✅ PASS" if result else "❌ FAIL"
    print(f"{status}: {check_name}")
    if result:
        passed += 1
    else:
        failed += 1

print("="*80)
print(f"RESULTS: {passed} passed, {failed} failed out of {len(checks)} checks")
print("="*80)

if failed > 0:
    print("\n❌ VERIFICATION FAILED - Some data is missing from the rendered template")
    sys.exit(1)
else:
    print("\n✅ ALL CHECKS PASSED - Preview data flow is working correctly!")
    print(f"\nRendered LaTeX length: {len(latex_source)} characters")
    sys.exit(0)
