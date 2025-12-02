"""Generate actual PDF from resume template locally"""
import sys
sys.path.insert(0, 'backend')

from app.services.latex_compiler import LaTeXCompiler

# Comprehensive sample data
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
    "summary": "Experienced software engineer with 5+ years of expertise in full-stack development and cloud technologies. Passionate about building scalable systems and mentoring junior developers.",
    "education": [{
        "institution": "University of California, Berkeley",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "startDate": "2015-09",
        "endDate": "2019-05",
        "gpa": "3.8",
        "location": "Berkeley, CA"
    }],
    "experience": [
        {
            "position": "Senior Software Engineer",
            "company": "Tech Corp",
            "location": "San Francisco, CA",
            "startDate": "2020-01",
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
            "startDate": "2019-06",
            "endDate": "2019-12",
            "description": "Full-stack developer building web applications",
            "highlights": [
                "Developed RESTful APIs serving 100K+ daily requests",
                "Built responsive frontend using React and TypeScript"
            ]
        }
    ],
    "projects": [
        {
            "name": "Open Source Cloud Platform",
            "startDate": "2021-03",
            "endDate": "2023-06",
            "description": "Contributed to major open source initiative for cloud-native applications",
            "technologies": ["Python", "Docker", "Kubernetes", "Terraform"],
            "link": "https://github.com/example/project"
        },
        {
            "name": "Personal Portfolio Website",
            "startDate": "2022-01",
            "endDate": "",
            "description": "Built modern portfolio site with blog functionality and CMS integration",
            "technologies": ["Next.js", "TypeScript", "Tailwind CSS", "Sanity"],
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
            "name": "AWS Certified Solutions Architect - Professional",
            "issuer": "Amazon Web Services",
            "date": "2022-08",
            "credentialId": "AWS-123456",
            "url": "https://aws.amazon.com/certification/"
        },
        {
            "name": "Certified Kubernetes Administrator (CKA)",
            "issuer": "Cloud Native Computing Foundation",
            "date": "2021-11"
        }
    ],
    "languages": [
        {"language": "English", "proficiency": "Native"},
        {"language": "Spanish", "proficiency": "Intermediate"}
    ],
    "achievements": [
        {
            "title": "Best Innovation Award 2022",
            "date": "2022-12",
            "description": "Recognized for outstanding contribution to product development and innovation"
        }
    ]
}

print("Generating full resume PDF locally with MiKTeX...")
print("=" * 80)

compiler = LaTeXCompiler()

try:
    # Generate PDF using the complete pipeline
    pdf_content = compiler.generate_pdf(sample_resume_data, "resume_1")
    
    print(f"✅ SUCCESS! Generated resume PDF of {len(pdf_content):,} bytes")
    
    # Save to file
    output_file = "john_doe_resume_local.pdf"
    with open(output_file, "wb") as f:
        f.write(pdf_content)
    
    print(f"✅ Saved to {output_file}")
    print(f"\n🎉 Open {output_file} to see your complete resume!")
    print("\nThe PDF includes:")
    print("  • Contact information with icons")
    print("  • Professional summary")
    print("  • 2 work experiences with highlights")
    print("  • 2 projects with technologies")
    print("  • 4 skill categories")
    print("  • 2 certifications")
    print("  • 2 languages")
    print("  • 1 achievement")
    print("  • Education")
    
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
