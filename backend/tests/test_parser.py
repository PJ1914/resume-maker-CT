"""Test the Gemini parser with a sample resume text."""
import sys
sys.path.insert(0, 'e:/my projects/resume-maker-CT/backend')

# Load environment variables BEFORE importing the parser
from dotenv import load_dotenv
load_dotenv()

from app.services.gemini_parser import GeminiResumeParser

# Sample resume text that mimics PDF extraction issues (concatenated text)
SAMPLE_RESUME = """
PRANAV KUMAR
pranav.kumar@email.com | +91-9876543210 | linkedin.com/in/pranavkumar | github.com/pranavkumar
Hyderabad, India

EDUCATION
Bachelor of Technology in Computer Science Engineering
XYZ Institute of Technology, Hyderabad
Aug2020 – May2024
GPA: 8.5/10

EXPERIENCE
Web Developer Intern
Calcitex, Hyderabad, India
May2024 – Aug2024
- Developed responsive web applications using React.js
- Implemented REST APIs with Node.js and Express
- Collaborated with design team for UI/UX improvements

Software Engineer Intern
TechCorp Solutions, Bangalore, India
Jan2024 – Apr2024
- Built microservices architecture using Python FastAPI
- Deployed applications on AWS EC2 and S3
- Wrote unit tests achieving 85% code coverage

PROJECTS
E-Commerce Platform | React, Node.js, MongoDB | github.com/pranavkumar/ecommerce
- Built full-stack e-commerce application with payment integration
- Implemented user authentication using JWT tokens

Resume Maker App | Python, FastAPI, Firebase | github.com/pranavkumar/resume-maker
- Created AI-powered resume parsing using Gemini API
- Designed responsive frontend with React and Tailwind CSS

SKILLS
Languages: Python, JavaScript, TypeScript, Java, C++
Frameworks: React.js, Node.js, FastAPI, Django, Express
Databases: PostgreSQL, MongoDB, Firebase, Redis
Tools: Git, Docker, AWS, Linux, VS Code

CERTIFICATIONS
AWS Certified Cloud Practitioner | Amazon Web Services | Dec2023
Google Cloud Professional Data Engineer | Google | Mar2024

ACHIEVEMENTS
- First place in University Hackathon 2023
- Published research paper on Machine Learning in IEEE Conference
- Open source contributor to popular React libraries
"""

def test_parser():
    """Test the Gemini parser."""
    print("=" * 60)
    print("TESTING GEMINI RESUME PARSER")
    print("=" * 60)
    
    parser = GeminiResumeParser()
    result = parser.parse(SAMPLE_RESUME)
    
    # Print raw result for debugging
    print("\n--- RAW RESULT ---")
    import json
    print(json.dumps(result, indent=2, default=str))
    
    # Check contact info
    print("\n--- CONTACT INFO ---")
    contact = result.get("contact_info", {})
    print(f"Name: {contact.get('name', 'NOT FOUND')}")
    print(f"Email: {contact.get('email', 'NOT FOUND')}")
    print(f"Phone: {contact.get('phone', 'NOT FOUND')}")
    print(f"Location: {contact.get('location', 'NOT FOUND')}")
    print(f"LinkedIn: {contact.get('linkedin', 'NOT FOUND')}")
    print(f"GitHub: {contact.get('github', 'NOT FOUND')}")
    
    # Check education
    print("\n--- EDUCATION ---")
    education = result.get("education", [])
    for i, edu in enumerate(education, 1):
        print(f"\nEducation #{i}:")
        print(f"  Degree: {edu.get('degree', 'NOT FOUND')}")
        print(f"  Institution: {edu.get('institution', 'NOT FOUND')}")
        print(f"  Location: {edu.get('location', 'NOT FOUND')}")
        print(f"  Dates: {edu.get('dates', 'NOT FOUND')}")
        print(f"  GPA: {edu.get('gpa', 'NOT FOUND')}")
        print(f"  Field: {edu.get('field', 'NOT FOUND')}")
        
        # VALIDATION: Check for field separation issues
        if edu.get('gpa') and '/' not in str(edu.get('gpa', '')) and 'GPA' not in str(edu.get('gpa', '')).upper():
            print(f"  ⚠️ WARNING: GPA might be incorrectly formatted: {edu.get('gpa')}")
        if edu.get('field') and any(x in str(edu.get('field', '')).lower() for x in ['gpa', '8.', '9.', '10', '/']):
            print(f"  ❌ ERROR: GPA leaked into field!")
    
    # Check experience
    print("\n--- EXPERIENCE ---")
    experience = result.get("experience", [])
    for i, exp in enumerate(experience, 1):
        print(f"\nExperience #{i}:")
        print(f"  Position: {exp.get('position', 'NOT FOUND')}")
        print(f"  Company: {exp.get('company', 'NOT FOUND')}")
        print(f"  Location: {exp.get('location', 'NOT FOUND')}")
        print(f"  Dates: {exp.get('dates', 'NOT FOUND')}")
        print(f"  Highlights: {len(exp.get('highlights', []))} items")
        
        # VALIDATION: Check for field separation issues
        position = str(exp.get('position', ''))
        company = str(exp.get('company', ''))
        
        if any(x in position.lower() for x in ['hyderabad', 'bangalore', 'india', 'mumbai', 'delhi']):
            print(f"  ❌ ERROR: Location leaked into position!")
        if any(x in company.lower() for x in ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', '2024', '2023']):
            print(f"  ❌ ERROR: Dates leaked into company!")
    
    # Check skills
    print("\n--- SKILLS ---")
    skills = result.get("skills", {})
    for category, items in skills.items():
        print(f"  {category}: {items}")
    
    # Check projects
    print("\n--- PROJECTS ---")
    projects = result.get("projects", [])
    for i, proj in enumerate(projects, 1):
        print(f"\nProject #{i}:")
        print(f"  Name: {proj.get('name', 'NOT FOUND')}")
        print(f"  Technologies: {proj.get('technologies', 'NOT FOUND')}")
        print(f"  Highlights: {len(proj.get('highlights', []))} items")
    
    # Check certifications
    print("\n--- CERTIFICATIONS ---")
    certs = result.get("certifications", [])
    for i, cert in enumerate(certs, 1):
        print(f"\nCertification #{i}:")
        print(f"  Name: {cert.get('name', 'NOT FOUND')}")
        print(f"  Issuer: {cert.get('issuer', 'NOT FOUND')}")
        print(f"  Date: {cert.get('date', 'NOT FOUND')}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    
    # Note: tests should not return values; PyTest will warn in future versions.
    # If you need the parsed result for interactive debugging, run this file as a script.

if __name__ == "__main__":
    test_parser()
