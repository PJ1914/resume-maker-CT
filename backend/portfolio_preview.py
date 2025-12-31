"""
Portfolio Template Tester
Test portfolio templates with sample data and open in browser

Usage:
    cd backend
    python portfolio_preview.py
"""
import os
import webbrowser
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

# Sample data for testing
SAMPLE_DATA = {
    "personal": {
        "name": "Nadukula Hemanth",
        "title": "Full Stack Developer",
        "tagline": "Building the Future with Code",
        "email": "hemanth@example.com",
        "phone": "+91 7780658357",
        "location": "Hyderabad, Telangana, India"
    },
    "summary": "Passionate full-stack developer with expertise in Python, JavaScript, and modern web technologies. I love building innovative solutions that make a difference. With a strong foundation in machine learning and AI, I create intelligent applications that solve real-world problems.",
    "profile_photo": None,
    "social_links": {
        "linkedin": "linkedin.com/in/hemanth",
        "github": "github.com/hemanth"
    },
    "education": [
        {
            "degree": "Bachelor of Technology",
            "field": "Computer Science",
            "institution": "Anurag University",
            "location": "Hyderabad, India",
            "start_date": "2023",
            "end_date": "2027",
            "gpa": "8.5"
        }
    ],
    "experience": [
        {
            "position": "Software Developer Intern",
            "company": "Tech Solutions Pvt Ltd",
            "start_date": "Jun 2024",
            "end_date": "Present",
            "description": "Working on full-stack web applications using React and FastAPI",
            "responsibilities": [
                "Developed RESTful APIs using FastAPI and Python",
                "Built responsive UI components with React and Tailwind CSS",
                "Implemented authentication and authorization systems"
            ]
        },
        {
            "position": "ML Research Assistant",
            "company": "University AI Lab",
            "start_date": "Jan 2024",
            "end_date": "May 2024",
            "description": "Research on computer vision and deep learning models",
            "responsibilities": [
                "Trained CNN models for image classification",
                "Implemented OCR systems using TensorFlow"
            ]
        }
    ],
    "projects": [
        {
            "name": "Resume Maker Pro",
            "description": "AI-powered resume builder with ATS scoring, multiple templates, and PDF export functionality.",
            "technologies": ["React", "FastAPI", "Python", "LaTeX", "Firebase"],
            "url": "https://resume-maker.com",
            "github_url": "github.com/hemanth/resume-maker",
            "image": None
        },
        {
            "name": "CivicPulse",
            "description": "Citizen complaint management system with real-time tracking and analytics dashboard.",
            "technologies": ["MERN Stack", "MongoDB", "Express", "React", "Node.js"],
            "url": "https://civicpulse.com",
            "github_url": "github.com/hemanth/civicpulse",
            "image": None
        },
        {
            "name": "AI Interview Prep",
            "description": "AI-powered interview preparation tool with personalized questions and TTS feedback.",
            "technologies": ["Python", "Gemini AI", "React", "FastAPI"],
            "url": None,
            "github_url": "github.com/hemanth/interview-prep",
            "image": None
        }
    ],
    "skills": [
        {"name": "Python", "level": 90},
        {"name": "JavaScript", "level": 85},
        {"name": "React.js", "level": 85},
        {"name": "FastAPI", "level": 80},
        {"name": "Machine Learning", "level": 75},
        {"name": "TensorFlow", "level": 70},
        {"name": "MongoDB", "level": 75},
        {"name": "Git & GitHub", "level": 85}
    ],
    "certifications": [
        {"name": "AWS Cloud Practitioner", "issuer": "Amazon Web Services", "date": "2024"},
        {"name": "Python for Data Science", "issuer": "Coursera", "date": "2023"},
        {"name": "Full Stack Development", "issuer": "Udemy", "date": "2023"}
    ],
    "languages": [
        {"name": "English"},
        {"name": "Telugu"},
        {"name": "Hindi"}
    ],
    "theme": {
        "primary": "#8b5cf6",
        "accent": "#ec4899"
    }
}

def preview_template(template_name: str):
    """Render a template with sample data and open in browser"""
    
    templates_dir = Path(__file__).parent / "templates" / "portfolio" / "premium"
    template_path = templates_dir / template_name / "index.html"
    
    if not template_path.exists():
        print(f"Template not found: {template_path}")
        return
    
    env = Environment(loader=FileSystemLoader(str(templates_dir / template_name)))
    template = env.get_template("index.html")
    
    print(f"Rendering template: {template_name}")
    html_content = template.render(**SAMPLE_DATA)
    
    output_dir = Path(__file__).parent / "temp_previews"
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / f"{template_name}_preview.html"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"Saved preview to: {output_file}")
    webbrowser.open(f"file://{output_file.absolute()}")
    print(f"Opened in browser!")

def main():
    print("=" * 50)
    print("   Portfolio Template Tester")
    print("=" * 50)
    print()
    print("Available templates:")
    print("  1. neon-cyberpunk")
    print("  2. luxury-elegant")
    print("  3. gradient-modern")
    print("  4. Test all templates")
    print()
    
    choice = input("Enter template number (1-4): ").strip()
    
    templates = {
        "1": "neon-cyberpunk",
        "2": "tech-aurora",
        "3": "gradient-modern"
    }
    
    if choice == "4":
        for name in templates.values():
            preview_template(name)
    elif choice in templates:
        preview_template(templates[choice])
    else:
        print("Invalid choice")

if __name__ == "__main__":
    main()
