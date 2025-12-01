"""Test parsing Vishnu's resume."""
import sys
sys.path.insert(0, 'e:/my projects/resume-maker-CT/backend')

from dotenv import load_dotenv
load_dotenv()

from app.services.gemini_parser import GeminiResumeParser
import json

VISHNU_RESUME = """
Vishnu Tej Ganneruvaram
vishnutej49@gmail.com | +91 9177210515 | LinkedIn | GitHub | LeetCode

Education
Sreenidhi Institute of Science and Technology, Hyderabad
Bachelor of Technology in Computer Science
CGPA: 9.28 / 10.0
2022 – 2026

Experience
Software Developer Intern, Inncircles July 2025 – Present
• Working on end-to-end web and mobile solutions integrating Flutter, Angular.js, and backend microservices.
• Developed scalable RESTful APIs using Node.js, Nest.js, and Express.js.
• Collaborating with design and data teams to deliver seamless user experiences across platforms.

Projects
CodeTapasya – Learning Management System for Students Live-Link
• Built a complete LMS platform to help students learn programming, track progress, and participate in hackathons.
• Designed user dashboards, course progress tracking, and integrated AI-based assessments.
• Developed using React.js, FastAPI, and AWS, with team collaboration across full stack.
• Organized CodeKurukshetra Hackathon under CodeTapasya, connecting 100+ participants across colleges.

Vision Talk – Assistive Web App for the Partially Blind GitHub
• Developed an AI-powered web app to help partially blind users identify objects in real time.
• Used React.js for the frontend and Django for backend services.
• Integrated Meta Vision API for image recognition and accessibility enhancements.

Knowledge Knest – AI & API Integrated Learning Platform Live-Link
• Developed an interactive e-learning web platform connecting AI models and user APIs.
• Used React.js for frontend, Flask for AI inference, and Node.js for backend integration.
• Deployed APIs and managed communication between multiple microservices efficiently.

Achievements & Certifications
• Founder Member of CodeTapasya, organized CodeKurukshetra Hackathon for 100+ students.
• Winner, Geethanjali College Hackathon.
• Finalist, IEEE National Level Hackathon (Guru Nanak Institutions).
• Participant, Hack Conquest (TKR Institute of Technology).
• Certified ServiceNow System Administrator – Credential ID verified through ServiceNow Global Certification.
• LeetCode: 400+ problems solved | Rating: 1750+.

Workshops
• Conducted "Introduction to AI & Engineering Fields" workshops for school students (Grades 8–10), guiding them in understanding emerging technologies and career options.

Technical Skills
Programming Languages: Java, C, Python, JavaScript, TypeScript
Frameworks: React.js, Django, Flask, Node.js, Nest.js, Express.js, Flutter
Cloud Services: AWS Lambda, API Gateway, DynamoDB
Version Control: Git, GitHub
"""

def test_vishnu_resume():
    print("=" * 70)
    print("TESTING VISHNU'S RESUME PARSING")
    print("=" * 70)
    
    parser = GeminiResumeParser()
    result = parser.parse(VISHNU_RESUME)
    
    print("\n--- CONTACT INFO ---")
    contact = result.get("contact_info", {})
    print(f"Name: {contact.get('name')}")
    print(f"Email: {contact.get('email')}")
    print(f"Phone: {contact.get('phone')}")
    print(f"LinkedIn: {contact.get('linkedin')}")
    print(f"GitHub: {contact.get('github')}")
    
    print("\n--- EDUCATION ---")
    for i, edu in enumerate(result.get("education", []), 1):
        print(f"\nEducation #{i}:")
        print(f"  School: {edu.get('school')}")
        print(f"  Degree: {edu.get('degree')}")
        print(f"  Field: {edu.get('field')}")
        print(f"  GPA: {edu.get('gpa')}")
        print(f"  Location: {edu.get('location')}")
        print(f"  Dates: {edu.get('startDate')} - {edu.get('endDate')}")
    
    print("\n--- EXPERIENCE ---")
    exp_list = result.get("experience", [])
    print(f"Total experience entries: {len(exp_list)}")
    for i, exp in enumerate(exp_list, 1):
        print(f"\nExperience #{i}:")
        print(f"  Position: {exp.get('position')}")
        print(f"  Company: {exp.get('company')}")
        print(f"  Location: {exp.get('location')}")
        print(f"  Dates: {exp.get('startDate')} - {exp.get('endDate')}")
        desc = exp.get('description', '')
        print(f"  Description preview: {desc[:100]}..." if len(desc) > 100 else f"  Description: {desc}")
        
        # Validation checks
        if 'Working on' in str(exp.get('company', '')):
            print("  ❌ ERROR: Description text in company field!")
        if 'July' in str(exp.get('company', '')) or '2025' in str(exp.get('company', '')):
            print("  ❌ ERROR: Date in company field!")
        if exp.get('position') and ('Working' in exp.get('position') or 'Developed' in exp.get('position')):
            print("  ❌ ERROR: Description text in position field!")
    
    print("\n--- PROJECTS ---")
    proj_list = result.get("projects", [])
    print(f"Total project entries: {len(proj_list)}")
    for i, proj in enumerate(proj_list, 1):
        print(f"\nProject #{i}:")
        print(f"  Name: {proj.get('name')}")
        print(f"  Technologies: {proj.get('technologies')}")
        print(f"  Link: {proj.get('link')}")
        desc = proj.get('description', '')
        print(f"  Description preview: {desc[:80]}..." if len(desc) > 80 else f"  Description: {desc}")
        
        # Validation
        if proj.get('name') and ('Built' in proj.get('name') or 'Developed' in proj.get('name')):
            print("  ❌ ERROR: Description text in project name!")
    
    print("\n--- SKILLS ---")
    skills = result.get("skills", {})
    for cat, items in skills.items():
        print(f"  {cat}: {items}")
    
    print("\n--- ACHIEVEMENTS/HACKATHONS ---")
    hacks = result.get("hackathons_competitions", [])
    for i, h in enumerate(hacks, 1):
        print(f"  {i}. {h.get('name')} - {h.get('achievement')}")
    
    print("\n--- CERTIFICATIONS ---")
    certs = result.get("certifications", [])
    for i, c in enumerate(certs, 1):
        print(f"  {i}. {c.get('name')} ({c.get('issuer')})")
    
    print("\n--- WORKSHOPS ---")
    workshops = result.get("workshops", [])
    for i, w in enumerate(workshops, 1):
        print(f"  {i}. {w.get('name')} - {w.get('role')}")
    
    print("\n" + "=" * 70)
    
    # Summary validation
    errors = []
    if len(exp_list) != 1:
        errors.append(f"Expected 1 experience entry, got {len(exp_list)}")
    if len(proj_list) != 3:
        errors.append(f"Expected 3 project entries, got {len(proj_list)}")
    if len(result.get("education", [])) != 1:
        errors.append(f"Expected 1 education entry, got {len(result.get('education', []))}")
    
    if errors:
        print("\n⚠️ VALIDATION ISSUES:")
        for e in errors:
            print(f"  - {e}")
    else:
        print("\n✅ ALL VALIDATIONS PASSED!")
    
    print("\n--- RAW JSON (for debugging) ---")
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    test_vishnu_resume()
