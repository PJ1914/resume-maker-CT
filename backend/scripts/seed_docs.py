
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import sys
import os

# Add parent directory to path to import app modules if needed
sys.path.append(str(Path(__file__).parent.parent))

def seed_docs():
    # Initialize Firebase similar to how app does it, or use default credential
    # Assuming local execution with credentials env var set
    if not firebase_admin._apps:
        cred_path = os.getenv('RESUME_MAKER_SERVICE_ACCOUNT_PATH')
        if not cred_path:
            # Fallback to searching in root/secrets
            secret_path = Path(__file__).parent.parent / "secrets" / "resume-maker-service-account.json"
            if secret_path.exists():
                cred_path = str(secret_path)
        
        if cred_path:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print("❌ No service account credentials found.")
            return

    db = firestore.client()
    
    # 1. Define Categories
    categories = [
        {"id": "introduction", "title": "Introduction", "order": 1, "icon": "Book"},
        {"id": "getting-started", "title": "Getting Started", "order": 2, "icon": "Rocket"},
        {"id": "core-features", "title": "Core Features", "order": 3, "icon": "Star"},
        {"id": "resume-builder", "title": "Resume Builder", "order": 4, "icon": "FileText"},
        {"id": "ats-checker", "title": "ATS Score Checker", "order": 5, "icon": "CheckCircle"},
        {"id": "ai-interview", "title": "AI Interview Prep", "order": 6, "icon": "Mic"},
        {"id": "portfolio", "title": "Portfolio Builder", "order": 7, "icon": "Globe"},
        {"id": "credits", "title": "Credits & Pricing", "order": 8, "icon": "CreditCard"},
        {"id": "advanced", "title": "Advanced Features", "order": 9, "icon": "Zap"},
        {"id": "tips", "title": "Tips & Best Practices", "order": 10, "icon": "Lightbulb"},
        {"id": "troubleshooting", "title": "Troubleshooting", "order": 11, "icon": "Wrench"},
        {"id": "faqs", "title": "FAQs", "order": 12, "icon": "HelpCircle"},
        {"id": "legal", "title": "Legal & Policies", "order": 13, "icon": "Shield"},
    ]

    print("Populating Categories...")
    batch = db.batch()
    for cat in categories:
        ref = db.collection('help_categories').document(cat['id'])
        batch.set(ref, cat)
    batch.commit()

    # 2. Define Articles
    articles = [
        # INTRODUCTION
        {
            "slug": "what-is-prativeda",
            "categoryId": "introduction",
            "title": "What is Prativeda?",
            "order": 1,
            "content": """# What is Prativeda?

Prativeda is an all-in-one career platform that helps job seekers, students, and professionals:

*   **Build ATS-optimized resumes** using professional LaTeX templates
*   **Score resumes in real-time** to pass Applicant Tracking Systems
*   **Prepare for interviews** with AI-powered Q&A sessions
*   **Create portfolio websites** in one click
*   **Track resume versions** for different job applications

## Why Choose Prativeda?

| Feature | Traditional Tools | Prativeda |
| :--- | :--- | :--- |
| **ATS Optimization** | Manual guessing | **AI-powered real-time scoring** |
| **Resume Quality** | Word templates | **Professional LaTeX PDFs** |
| **Interview Prep** | Generic questions | **AI-tailored to YOUR resume** |
| **Portfolio** | Code your own | **One-click deployment** |
| **Pricing** | Monthly subscriptions | **Pay-per-use credits (never expire)** |"""
        },

        # GETTING STARTED
        {
            "slug": "how-to-sign-up",
            "categoryId": "getting-started",
            "title": "Step 1: Sign Up",
            "order": 1,
            "content": """# Step 1: Sign Up

1.  Visit **Prativeda**
2.  Click **"Get Started"** or **"Sign In"**
3.  Choose your authentication method:
    *   **Google (Recommended)**
    *   **GitHub** (Auto-imports projects)
    *   Email/Password

> **Tip:** New users receive **10 free credits** immediately upon signup to explore all features."""
        },
        {
            "slug": "complete-profile",
            "categoryId": "getting-started",
            "title": "Step 2: Complete Your Profile",
            "order": 2,
            "content": """# Step 2: Complete Your Profile

After signing in:
1.  Go to **Profile** (top-right corner).
2.  Add your:
    *   Full Name
    *   Email
    *   Phone Number
    *   LinkedIn URL (optional)
    *   GitHub Username (optional)

Completing your profile allows our AI to better tailor suggestions for you."""
        },

        # CORE FEATURES
        {
            "slug": "ai-resume-parser",
            "categoryId": "core-features",
            "title": "1. AI-Powered Resume Parser",
            "order": 1,
            "content": """# AI-Powered Resume Parser

**What it does:**  
Upload your existing resume (PDF/DOCX), and our AI extracts all information automatically.

**How to use:**
1.  Click **"Upload Resume"** on Dashboard.
2.  Drag & drop your file or click to browse.
3.  Wait 10-15 seconds for AI parsing.
4.  Review extracted data.
5.  Edit and refine in the editor.

**Supported formats:**
*   PDF (.pdf)
*   Word Documents (.doc, .docx)
*   Text files (.txt)

**Cost:** 1 credit per upload"""
        },
        {
            "slug": "real-time-ats-scoring",
            "categoryId": "core-features",
            "title": "2. Real-Time ATS Scoring",
            "order": 2,
            "content": """# Real-Time ATS Scoring

**What is ATS?**  
ATS (Applicant Tracking System) is software used by 98% of Fortune 500 companies to filter resumes before human review.

**How Prativeda helps:**
*   Analyzes your resume against 50+ ATS criteria
*   Scores from **0-100**
*   Provides actionable recommendations
*   Highlights missing keywords

**Score interpretation:**
*   **0-49:** Needs major improvements
*   **50-69:** Fair, but improve keywords
*   **70-89:** Good, likely to pass
*   **90-100:** Excellent, optimized

**Cost:** 5 credits per ATS check"""
        },
        {
            "slug": "latex-templates",
            "categoryId": "core-features",
            "title": "3. Professional LaTeX Templates",
            "order": 3,
            "content": """# Professional LaTeX Templates

**Why LaTeX?**  
LaTeX produces pixel-perfect, professional documents that look identical on all devices and print beautifully.

**Available Templates:**
*   **Classic** - Traditional corporate look
*   **Modern** - Clean minimal design
*   **Technical** - Perfect for developers
*   **Creative** - Eye-catching for designers
*   **Minimalist** - Simple elegance
*   **Executive** - Senior leadership style

**Features:**
*   ATS-friendly formatting
*   Auto-adjusts spacing
*   Professional typography
*   Consistent layout"""
        },
        {
            "slug": "smart-resume-editor",
            "categoryId": "core-features",
            "title": "4. Smart Resume Editor",
            "order": 4,
            "content": """# Smart Resume Editor

**Features:**

### Live Preview
See changes instantly as you type in a side-by-side view.

### AI Content Enhancement
*   Click **"AI Suggest"** on any bullet point
*   Get professionally rewritten content
*   Improved action verbs and impact
*   **Cost:** 1 credit per enhancement

### Section Management
Add/remove/reorder sections dynamically:
*   Contact Information
*   Professional Summary
*   Work Experience
*   Education
*   Skills
*   Projects
*   Certifications
*   Achievements
*   And more...

### Auto-Save
Your work is automatically saved every 30 seconds."""
        },

        # RESUME BUILDER
        {
            "slug": "create-from-scratch",
            "categoryId": "resume-builder",
            "title": "Method 1: Create from Scratch",
            "order": 1,
            "content": """# Create from Scratch

**Best for:** First-time resume creators.

1.  Click **"Create New Resume"**
2.  Choose creation method: **Resume Wizard** (Guided) or **Blank Resume** (Direct)

### Using Resume Wizard:

**Step 1: Contact Info**
Full name, Email, Phone, Location.

**Step 2: Professional Summary**
Write 2-3 sentences about your role, experience, and goals.
*   *Example:* "Results-driven Software Engineer with 5+ years building scalable web applications..."

**Step 3: Work Experience**
For each job, bullet points (3-5 per job) using the **Action Verb + Task + Result** formula.
*   *Strong Example:* "Developed 5 new product features using React, increasing user engagement by 30%"

**Step 4: Education & Skills**
List Degree, University, and skills categorized (Languages, Tools, Soft Skills)."""
        },
        {
            "slug": "best-practices",
            "categoryId": "tips",
            "title": "Resume Best Practices",
            "order": 1,
            "content": """# Resume Best Practices

### 1. Quantification
Always include numbers to prove impact.
*   "Increased sales" → "Increased sales by **40%**"
*   "Managed team" → "Managed team of **12**"

### 2. Action Verbs
Use powerful verbs: *Achieved, Spearheaded, Optimized, Architected*.
Avoid weak verbs: *Responsible for, Worked on, Helped with*.

### 3. Keyword Optimization
Mirror the language of the job description.
If job says "React, TypeScript", your resume should say "Built APIs using **React** and **TypeScript**".

### 4. Length
*   **Entry-level:** 1 page
*   **Mid-level:** 1-2 pages
*   **Senior:** 2 pages max"""
        },

        # AI INTERVIEW PREP
        {
            "slug": "ai-interview-prep",
            "categoryId": "ai-interview",
            "title": "AI Interview Preparation",
            "order": 1,
            "content": """# AI Interview Preparation

**What is it?**  
Get AI-generated interview questions and answers tailored to **YOUR** resume.

**How it works:**
1.  Go to **Interview Prep** page.
2.  Select a resume.
3.  Click **"Generate Interview Session"**.

**AI creates 3 types of questions:**
1.  **Common Questions:** "Tell me about yourself", "Why do you want this job?"
2.  **Technical Questions:** Based on your specific skills (e.g., Python, AWS).
3.  **Behavioral Questions:** STAR format questions (e.g., "Tell me about a time you failed").

**Cost:** 5 credits per session"""
        },

        # PORTFOLIO
        {
            "slug": "portfolio-builder",
            "categoryId": "portfolio",
            "title": "Portfolio Builder: Resume to Website",
            "order": 1,
            "content": """# Portfolio Builder

Transform your resume into a stunning personal website in one click.

### Step 1: Generate Portfolio
1.  Go to **Portfolio** page.
2.  Select a resume.
3.  Choose a template tier (Basic, Standard, Premium).
4.  Click **"Generate Portfolio"** (3 credits).
5.  Preview and edit.

### Step 2: Deploy to Web

**Option A: GitHub Pages (Free Hosting)**
*   Link GitHub account.
*   Click "Deploy to GitHub".
*   **URL:** `username.github.io/repo-name`
*   **Cost:** 3 credits.

**Option B: Vercel/Netlify (Premium)**
*   Connect Vercel/Netlify account.
*   Supports **Custom Domains** (yourname.com).
*   **Cost:** 5-7 credits.

### Portfolio Templates
*   **Basic:** Single-page, clean. (Students)
*   **Standard:** Multi-section, contact forms. (Professionals)
*   **Premium:** Animations, blog integration. (Senior roles)"""
        },

        # CREDITS & PRICING
        {
            "slug": "pricing-model",
            "categoryId": "credits",
            "title": "Credit System Explained",
            "order": 1,
            "content": """# Credit System & Pricing

Prativeda uses a **pay-as-you-go** credit system.
*   **10 Free Credits** on sign up.
*   **Credits NEVER expire.**

### Credit Packs

| Pack | Credits | Price | Savings | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** | 50 | ₹89 | - | First-time users |
| **Standard** | 120 | ₹199 | 7% | Active job seekers |
| **Pro** | 220 | ₹349 | 11% | Professionals |
| **Ultimate** | 450 | ₹559 | 30% | Power users |

### Usage Costs

| Action | Cost |
| :--- | :--- |
| **Upload Resume** | 1 credit |
| **AI Enhancement (Bullet)** | 1 credit |
| **Export PDF** | 3 credits |
| **ATS Check** | 5 credits |
| **Interview Session** | 5 credits |
| **Deploy Portfolio (GitHub)** | 3 credits |"""
        },

        # TROUBLESHOOTING
        {
            "slug": "resume-upload-failed",
            "categoryId": "troubleshooting",
            "title": "Resume Upload Issues",
            "order": 1,
            "content": """# Resume Upload Failed

**Problem:** "Upload failed" error.

**Solutions:**
1.  Check file size (max **10MB**).
2.  Ensure format is **PDF** or **DOCX**.
3.  Try a different browser.
4.  Clear cache and retry.

**Problem:** "AI parsing incomplete"
**Solution:** The resume might have complex columns or graphics. Try exporting your original doc to plain text first, or manually add missing info in the editor."""
        },
        {
            "slug": "ats-score-low",
            "categoryId": "troubleshooting",
            "title": "ATS Score Lower Than Expected",
            "order": 2,
            "content": """# ATS Score Low?

**Reasons:**
*   Missing keywords from job description.
*   Complex formatting (columns, tables).
*   No quantified achievements.
*   Weird fonts or graphics.

**Fixes:**
1.  **Add Keywords:** Look at the "Missing Keywords" report and add them to Skills/Experience.
2.  **Use Numbers:** "Managed team" → "Managed team of 5".
3.  **Standard Headers:** Use "Work Experience" instead of "Professional Journey"."""
        },
        {
            "slug": "payment-failed",
            "categoryId": "troubleshooting",
            "title": "Payment Issues",
            "order": 3,
            "content": """# Payment Issues

**Problem:** "Credits not added after payment"

**Solutions:**
1.  Wait 2-3 minutes for processing.
2.  Refresh the page.
3.  Check **Credit History** page.
4.  Log out and log back in.
5.  If still missing, contact **support@codetapasya.com** with transaction ID."""
        },
        
        # FAQS
        {
            "slug": "general-faqs",
            "categoryId": "faqs",
            "title": "General FAQs",
            "order": 1,
            "content": """# General FAQs

**Q: Is Prativeda free?**
A: New users get 10 free credits. Additional features require purchasing credit packs (starting at ₹89).

**Q: Do credits expire?**
A: **No.** Credits never expire. Use them anytime.

**Q: Can I get a refund?**
A: Yes, unused credits can be refunded within 7 days. See Refund Policy.

**Q: Is my data secure?**
A: Yes. We use Google Cloud (Firebase) with enterprise encryption. Your data is private.

**Q: Can I delete my account?**
A: Yes, go to **Profile > Delete Account**."""
        },

        # CONTACT
        {
            "slug": "contact-support",
            "categoryId": "faqs",
            "title": "Contact Support",
            "order": 99,
            "content": """# Contact Support

**Email:** support@codetapasya.com  
**Response time:** Within 24 hours.

**Community:**
Join our [Discord](#) for tips and success stories.

**Report Bugs:**
Include:
*   What you were doing
*   Error message via screenshot
*   Browser/OS info"""
        }
    ]

    print(f"Populating {len(articles)} Articles...")
    batch = db.batch()
    for art in articles:
        # Create a deterministic ID based on slug
        ref = db.collection('help_articles').document(art['slug'])
        art['createdAt'] = firestore.SERVER_TIMESTAMP
        art['updatedAt'] = firestore.SERVER_TIMESTAMP
        batch.set(ref, art)
    
    batch.commit()
    print("✅ Documentation Seeded Successfully!")

if __name__ == "__main__":
    seed_docs()
