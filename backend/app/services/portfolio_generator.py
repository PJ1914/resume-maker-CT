"""
Portfolio HTML generation service with AI Enhancement
Converts resume JSON to HTML portfolio using templates
Enhanced with Gemini AI for better content
"""
import os
import zipfile
import tempfile
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import logging
from jinja2 import Template

from app.firebase import resume_maker_app
from firebase_admin import firestore, storage
from app.services.gemini_parser import GeminiResumeParser

logger = logging.getLogger(__name__)


class PortfolioGeneratorService:
    """Service for generating portfolio HTML from resume data with AI enhancement"""
    
    def __init__(self):
        self.gemini = GeminiResumeParser()
        logger.info("Portfolio generator initialized with AI support")
    
    async def generate(
        self,
        user_id: str,
        resume_id: str,
        template_id: str,
        theme: str = 'light',
        accent_color: str = None,
        font_style: str = None,
        use_ai_enhancement: bool = True
    ) -> Dict[str, Any]:
        """
        Generate portfolio HTML from resume JSON with AI enhancement
        
        Args:
            user_id: Firebase user ID
            resume_id: Resume document ID
            template_id: Portfolio template ID
            theme: Color theme (light/dark/minimal)
            accent_color: Custom accent color
            font_style: Font style choice
            use_ai_enhancement: Enable AI content enhancement (default: True)
        
        Returns:
            Dict with session_id, html_preview, zip_url, and ai_enhanced flag
        """
        if not resume_maker_app:
            raise ValueError("Firebase not configured")
        
        db = firestore.client(app=resume_maker_app)
        
        # Fetch resume data with timeout
        logger.info(f"📄 Fetching resume: {resume_id}")
        resume_doc = db.collection('resumes').document(resume_id).get(timeout=10.0)
        if not resume_doc.exists:
            logger.error(f"❌ Resume not found in Firestore: {resume_id}")
            raise ValueError(f"Resume not found: {resume_id}")
        
        resume_data = resume_doc.to_dict()
        
        # Check resume ownership (support multiple field names)
        resume_owner = resume_data.get('owner_uid') or resume_data.get('user_id') or resume_data.get('userId')
        logger.info(f"🔍 Resume owner: {resume_owner}, Current user: {user_id}")
        
        if not resume_owner:
            logger.warning(f"⚠️ Resume {resume_id} has no owner field! Resume data keys: {list(resume_data.keys())}")
            # Allow if no owner (backward compatibility)
        elif resume_owner != user_id:
            logger.error(f"❌ Ownership check failed: Resume owner={resume_owner}, User={user_id}")
            raise PermissionError("You don't own this resume")
        
        # Fetch template with timeout
        logger.info(f"📋 Fetching template: {template_id}")
        template_doc = db.collection('portfolio_templates').document(template_id).get(timeout=10.0)
        
        if not template_doc.exists:
            logger.error(f"❌ Template not found: {template_id}")
            raise ValueError(f"Template not found: {template_id}")
        
        template_data = template_doc.to_dict()
        
        # AI Enhancement (if enabled)
        if use_ai_enhancement and self.gemini.is_available():
            logger.info(f"Enhancing content with AI for resume {resume_id}")
            resume_data = await self._enhance_with_ai(resume_data, template_data)
        
        # Download template files from Firebase Storage
        
        # Download template files from Firebase Storage
        template_html = self._download_template_file(template_id, template_data, 'index.html')
        template_css = self._download_template_file(template_id, template_data, 'styles.css')
        
        # Inject resume data into template
        html_content = self._inject_resume_data(
            template_html=template_html,
            resume_data=resume_data,
            theme=theme
        )
        
        # Apply custom CSS settings
        css_content = self._apply_css_settings(template_css, theme, accent_color, font_style)
        
        # Create ZIP package
        session_id = str(uuid.uuid4())
        zip_path = await self._create_zip_package(
            session_id=session_id,
            html_content=html_content,
            css_content=css_content,
            template_data=template_data
        )
        
        # Upload ZIP to Firebase Storage
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(f"portfolios/{user_id}/{session_id}.zip")
        blob.upload_from_filename(zip_path)
        
        # Generate signed URL (valid for 24 hours) - better than public URL
        from datetime import timedelta
        zip_url = blob.generate_signed_url(
            expiration=timedelta(hours=24),
            method='GET',
            version='v4'
        )
        
        logger.info(f"✅ Portfolio ZIP uploaded with signed URL (24h expiry)")
        
        # Save session to Firestore
        session_ref = db.collection('portfolio_sessions').document(session_id)
        session_ref.set({
            'user_id': user_id,
            'resume_id': resume_id,
            'template_id': template_id,
            'deployed': False,
            'theme': theme,
            'accent_color': accent_color,
            'font_style': font_style,
            'ai_enhanced': use_ai_enhancement and self.gemini.is_available(),
            'created_at': firestore.SERVER_TIMESTAMP,
            'html_preview': '',
            'zip_url': zip_url,
            'repo_url': None,
            'pages_url': None,
            'deployed_at': None
        })
        
        # Clean up temp file
        os.unlink(zip_path)
        
        return {
            'session_id': session_id,
            'html_preview': html_content,
            'zip_url': zip_url,
            'ai_enhanced': use_ai_enhancement and self.gemini.is_available()
        }
    
    def _download_template_file(self, template_id: str, template_data: Dict[str, Any], filename: str) -> str:
        """Download template file from Firebase Storage"""
        bucket = storage.bucket(app=resume_maker_app)
        
        # Get tier from template_data
        tier = template_data.get('tier', 'basic')
        
        # Map template IDs to actual folder names in storage
        template_folder_map = {
            'modern': 'modern-portfolio',
            'modern-portfolio': 'modern-portfolio',
            'minimalist': 'minimalist-portfolio',
            'minimalist-portfolio': 'minimalist-portfolio',
            'clean-professional': 'clean-professional',
            'corporate-executive': 'corporate-executive',
            'gradient-modern': 'gradient-modern',
            'creative-portfolio': 'creative-portfolio',
            'developer-advanced': 'developer-advanced',
            'premium-executive': 'premium-executive'
        }
        
        folder_name = template_folder_map.get(template_id, template_id)
        blob_path = f"templates/portfolio/{tier}/{folder_name}/{filename}"
        logger.info(f"📂 Downloading from Storage: {blob_path}")
        
        blob = bucket.blob(blob_path)
        return blob.download_as_text()
    
    async def _enhance_with_ai(self, resume_data: Dict[str, Any], template_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Gemini AI to enhance resume content for portfolio.
        
        Enhancements:
        - Rewrite summary to be more engaging
        - Generate compelling tagline if missing
        - Polish achievement descriptions
        - Improve project descriptions
        """
        enhanced_data = resume_data.copy()
        template_name = template_data.get('name', '').lower()
        
        try:
            # 1. Enhance Summary
            summary = enhanced_data.get('professional_summary', enhanced_data.get('summary', ''))
            if summary:
                enhanced_summary = await self._enhance_summary(summary, template_name)
                if enhanced_summary:
                    enhanced_data['professional_summary'] = enhanced_summary
                    logger.info("Summary enhanced with AI")
            
            # 2. Generate Tagline
            contact_info = enhanced_data.get('contact_info', {})
            if not contact_info.get('headline'):
                tagline = await self._generate_tagline(enhanced_data)
                if tagline:
                    contact_info['headline'] = tagline
                    enhanced_data['contact_info'] = contact_info
                    logger.info(f"Generated tagline: {tagline}")
            
            # 3. Enhance Top 3 Achievements
            if enhanced_data.get('experience'):
                enhanced_data['experience'] = await self._enhance_achievements(enhanced_data['experience'])
            
            # 4. Enhance Top 3 Projects
            if enhanced_data.get('projects'):
                enhanced_data['projects'] = await self._enhance_projects(enhanced_data['projects'])
            
        except Exception as e:
            logger.warning(f"AI enhancement failed, using original content: {str(e)}")
            return resume_data
        
        return enhanced_data
    
    async def _enhance_summary(self, summary: str, template_style: str) -> Optional[str]:
        """Enhance professional summary with AI."""
        try:
            style_map = {
                'minimalist': 'concise, impactful, and distilled to essentials',
                'modern': 'engaging, dynamic, and achievement-focused',
                'clean': 'clear, professional, and structured',
                'gradient': 'creative, bold, and personality-driven'
            }
            style = next((v for k, v in style_map.items() if k in template_style), 'professional and compelling')
            
            prompt = f"""Transform this professional summary into an engaging portfolio introduction.

Original: {summary}

Requirements:
- Make it {style}
- 2-3 sentences maximum
- Start with strong action words
- Highlight key expertise and impact
- Sound natural and conversational
- Maintain professional tone

Return ONLY the enhanced summary, no explanations."""

            response = self.gemini.model.generate_content(prompt)
            enhanced = response.text.strip().strip('"').strip("'")
            
            if enhanced and 20 < len(enhanced) < 500:
                return enhanced
        except Exception as e:
            logger.warning(f"Summary enhancement failed: {str(e)}")
        return None
    
    async def _generate_tagline(self, content: Dict[str, Any]) -> Optional[str]:
        """Generate professional tagline from resume data."""
        try:
            experience = content.get('experience', [])
            skills = content.get('skills', [])
            
            positions = [exp.get('position', '') for exp in experience[:2] if exp.get('position')]
            top_skills = skills[:5] if isinstance(skills, list) else []
            
            context = f"""Position(s): {', '.join(positions)}
Top Skills: {', '.join(top_skills) if top_skills else 'Not specified'}"""

            prompt = f"""Create a concise professional tagline for a portfolio website.

Context:
{context}

Requirements:
- One line only (5-10 words)
- Format: "Role | Specialization" or "Role & Expertise"
- Be specific and impactful
- No fluff words

Return ONLY the tagline."""

            response = self.gemini.model.generate_content(prompt)
            tagline = response.text.strip().strip('"').strip("'")
            
            if tagline and 10 < len(tagline) < 100:
                return tagline
        except Exception as e:
            logger.warning(f"Tagline generation failed: {str(e)}")
        return None
    
    async def _enhance_achievements(self, experience: list) -> list:
        """Enhance achievement descriptions."""
        enhanced = []
        for i, exp in enumerate(experience):
            if i < 3:  # Top 3 positions
                enhanced_exp = exp.copy()
                achievements = exp.get('achievements', [])
                if achievements:
                    try:
                        enhanced_achievements = []
                        for achievement in achievements[:4]:
                            prompt = f"""Rewrite this achievement to be more impactful.

Original: {achievement}

Requirements:
- Start with action verb
- Include metrics if present
- One sentence max
- Sound impressive

Return ONLY the enhanced achievement."""

                            response = self.gemini.model.generate_content(prompt)
                            enhanced_text = response.text.strip().strip('"').strip("'").strip('- ')
                            enhanced_achievements.append(enhanced_text if len(enhanced_text) > 15 else achievement)
                        
                        enhanced_exp['achievements'] = enhanced_achievements
                    except Exception as e:
                        logger.warning(f"Achievement enhancement failed: {str(e)}")
                enhanced.append(enhanced_exp)
            else:
                enhanced.append(exp)
        return enhanced
    
    async def _enhance_projects(self, projects: list) -> list:
        """Enhance project descriptions."""
        enhanced = []
        for i, project in enumerate(projects):
            if i < 3:  # Top 3 projects
                enhanced_proj = project.copy()
                description = project.get('description', '')
                if description and len(description) > 20:
                    try:
                        prompt = f"""Rewrite this project description to be more compelling.

Original: {description}

Requirements:
- Highlight features and impact
- 2-3 sentences max
- Focus on outcomes

Return ONLY the enhanced description."""

                        response = self.gemini.model.generate_content(prompt)
                        enhanced_text = response.text.strip().strip('"').strip("'")
                        enhanced_proj['description'] = enhanced_text if len(enhanced_text) > 30 else description
                    except Exception as e:
                        logger.warning(f"Project enhancement failed: {str(e)}")
                enhanced.append(enhanced_proj)
            else:
                enhanced.append(project)
        return enhanced
    
    def _inject_resume_data(
        self,
        template_html: str,
        resume_data: Dict[str, Any],
        theme: str
    ) -> str:
        """
        Inject resume data into HTML template using Jinja2
        
        Template variables available:
        - personal: { name, email, phone, location, linkedin, github, website }
        - summary: Professional summary text
        - experience: List of work experiences
        - education: List of education entries
        - skills: List of skills
        - projects: List of projects
        - certifications: List of certifications
        - theme: Color theme setting
        """
        template = Template(template_html)
        
        # Extract data - resume_data from Firestore has flat structure
        contact_info = resume_data.get('contact_info', {})
        
        # Parse projects to ensure technologies is an array
        projects = resume_data.get('projects', [])
        for project in projects:
            if isinstance(project, dict):
                # Parse technologies from string to array if needed
                techs = project.get('technologies', project.get('tech_stack', []))
                if isinstance(techs, str):
                    # Split by common delimiters
                    project['technologies'] = [t.strip() for t in techs.replace(',', '|').replace(';', '|').replace('+', '|').split('|') if t.strip()]
                elif isinstance(techs, list):
                    project['technologies'] = techs
                else:
                    project['technologies'] = []
        
        # Parse skills to ensure proper format
        skills = resume_data.get('skills', [])
        parsed_skills = []
        for skill in skills:
            if isinstance(skill, dict):
                parsed_skills.append(skill.get('name', str(skill)))
            elif isinstance(skill, str):
                # Split if it's a comma-separated string
                if ',' in skill:
                    parsed_skills.extend([s.strip() for s in skill.split(',') if s.strip()])
                else:
                    parsed_skills.append(skill)
            else:
                parsed_skills.append(str(skill))
        
        # Debug log
        logger.info(f"📋 Resume data keys: {list(resume_data.keys())[:10]}")
        logger.info(f"👤 Contact info: {contact_info}")
        logger.info(f"💼 Experience count: {len(resume_data.get('experience', []))}")
        logger.info(f"🎓 Education count: {len(resume_data.get('education', []))}")
        logger.info(f"📁 Projects count: {len(projects)}")
        if projects:
            logger.info(f"🔧 First project techs: {projects[0].get('technologies', [])}")
        
        context = {
            'personal': {
                'name': contact_info.get('name', contact_info.get('full_name', 'Professional')),
                'email': contact_info.get('email', ''),
                'phone': contact_info.get('phone', contact_info.get('phone_number', '')),
                'location': contact_info.get('location', contact_info.get('address', '')),
                'linkedin': contact_info.get('linkedin', contact_info.get('linkedin_url', '')),
                'github': contact_info.get('github', contact_info.get('github_url', '')),
                'website': contact_info.get('website', contact_info.get('portfolio_url', '')),
                'headline': contact_info.get('headline', contact_info.get('title', ''))
            },
            'summary': resume_data.get('professional_summary', resume_data.get('summary', '')),
            'experience': resume_data.get('experience', []),
            'education': resume_data.get('education', []),
            'skills': parsed_skills,
            'projects': projects,
            'certifications': resume_data.get('certifications', []),
            'achievements': resume_data.get('achievements', []),
            'theme': theme
        }
        
        logger.info(f"✅ Context prepared: {context['personal']['name']} with {len(context['experience'])} jobs, {len(context['projects'])} projects, {len(context['skills'])} skills")
        
        return template.render(**context)
    
    def _extract_personal_info(self, content: Dict[str, Any]) -> Dict[str, str]:
        """Extract personal information from resume content"""
        personal = content.get('personalInfo', {})
        
        return {
            'name': personal.get('name', ''),
            'email': personal.get('email', ''),
            'phone': personal.get('phone', ''),
            'location': personal.get('location', ''),
            'linkedin': personal.get('linkedin', ''),
            'github': personal.get('github', ''),
            'website': personal.get('website', ''),
            'portfolio': personal.get('portfolio', '')
        }
    
    def _apply_css_settings(self, css_content: str, theme: str, accent_color: str = None, font_style: str = None) -> str:
        """
        Apply custom CSS settings to template stylesheet
        
        Settings can include:
        - theme: light/dark/minimal
        - accent_color: Custom color hex code
        - font_style: Typography choice
        """
        # Simple CSS variable replacement
        if accent_color:
            css_content = css_content.replace(
                'var(--primary-color)',
                accent_color
            )
        
        if font_style:
            css_content = css_content.replace(
                'var(--font-family)',
                font_style
            )
        
        return css_content
    
    async def _create_zip_package(
        self,
        session_id: str,
        html_content: str,
        css_content: str,
        template_data: Dict[str, Any]
    ) -> str:
        """
        Create ZIP package with HTML, CSS, and assets
        
        Returns:
            Path to temporary ZIP file
        """
        # Create temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write HTML
            html_path = os.path.join(temp_dir, 'index.html')
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            # Write CSS
            css_path = os.path.join(temp_dir, 'styles.css')
            with open(css_path, 'w', encoding='utf-8') as f:
                f.write(css_content)
            
            # Create ZIP
            zip_path = os.path.join(tempfile.gettempdir(), f'{session_id}.zip')
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(html_path, 'index.html')
                zipf.write(css_path, 'styles.css')
                
                # Add README
                readme_content = self._generate_readme(template_data)
                zipf.writestr('README.md', readme_content)
            
            return zip_path
    
    def _generate_readme(self, template_data: Dict[str, Any]) -> str:
        """Generate README for portfolio ZIP"""
        return f"""# Portfolio Website

This portfolio was generated using Resume Maker CT.

## Template: {template_data.get('name', 'Unknown')}
{template_data.get('description', '')}

## Deployment Instructions

### Option 1: GitHub Pages (Recommended)
1. Create a new repository on GitHub
2. Upload these files to the repository
3. Go to Settings > Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/" (root)
6. Save and wait for deployment
7. Your site will be live at: https://username.github.io/repo-name

### Option 2: Netlify
1. Drag and drop this folder to Netlify
2. Your site will be deployed instantly

### Option 3: Vercel
1. Import this folder to Vercel
2. Deploy with one click

## Customization
- Edit `index.html` to update content
- Edit `styles.css` to change colors and fonts
- Add your own images to the assets folder

## Support
For questions or issues, visit: https://resumemakerct.com/support

---
Generated with ❤️ by Resume Maker CT
"""
