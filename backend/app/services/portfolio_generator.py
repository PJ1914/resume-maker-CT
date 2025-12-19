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
        use_ai_enhancement: bool = True,
        profile_photo: str = None,
        project_images: Dict[str, str] = None
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
            profile_photo: URL to uploaded profile photo
            project_images: Dict mapping project IDs to image URLs
        
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
            logger.info(f"🤖 AI Enhancement ENABLED - Enhancing content with AI for resume {resume_id}")
            resume_data = await self._enhance_with_ai(resume_data, template_data)
        elif use_ai_enhancement and not self.gemini.is_available():
            logger.warning(f"⚠️ AI Enhancement requested but Gemini is NOT available")
        else:
            logger.info(f"ℹ️ AI Enhancement DISABLED for resume {resume_id}")
        
        # Download template files from Firebase Storage
        template_html = self._download_template_file(template_id, template_data, 'index.html')
        
        # Try to download styles.css, use empty string if not found (Tailwind templates may not need it)
        try:
            template_css = self._download_template_file(template_id, template_data, 'styles.css')
        except Exception as e:
            logger.warning(f"styles.css not found for template {template_id}, using empty CSS (template may use Tailwind CDN): {e}")
            template_css = "/* Styles handled by Tailwind CDN in HTML */\n"
        
        # Inject resume data into template
        html_content = self._inject_resume_data(
            template_html=template_html,
            resume_data=resume_data,
            theme=theme,
            profile_photo=profile_photo,
            project_images=project_images or {}
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
        - Generate content for empty sections (languages, interests) if requested
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
                    logger.info("✨ Summary enhanced with AI")
            
            # 2. Generate Tagline - MUST HAVE TAGLINE
            contact_info = enhanced_data.get('contact_info', {})
            if not contact_info.get('headline'):
                tagline = await self._generate_tagline(enhanced_data)
                if tagline:
                    contact_info['headline'] = tagline
                    enhanced_data['contact_info'] = contact_info
                    logger.info(f"✨ Generated tagline: {tagline}")
                else:
                    # Fallback: Create from experience/skills
                    experiences = enhanced_data.get('experience', [])
                    skills = enhanced_data.get('skills', [])
                    if experiences:
                        position = experiences[0].get('position', experiences[0].get('title', ''))
                        if skills:
                            skill_name = skills[0].get('name', skills[0]) if isinstance(skills[0], dict) else skills[0]
                            contact_info['headline'] = f"{position} | {skill_name} Specialist"
                        else:
                            contact_info['headline'] = position
                        enhanced_data['contact_info'] = contact_info
                        logger.info(f"✨ Generated fallback tagline from experience")
            
            # 3. Enhance Top 3 Achievements
            if enhanced_data.get('experience'):
                enhanced_data['experience'] = await self._enhance_achievements(enhanced_data['experience'])
            
            # 4. Enhance Top 3 Projects
            if enhanced_data.get('projects'):
                enhanced_data['projects'] = await self._enhance_projects(enhanced_data['projects'])
            
            # 5. Generate Languages if empty (based on resume context) - MUST HAVE AT LEAST 1
            current_languages = enhanced_data.get('languages', [])
            logger.info(f"🗣️ Current languages in resume: {current_languages}")
            
            if not current_languages or len(current_languages) == 0:
                logger.info(f"🤖 Attempting to generate languages via AI...")
                languages = await self._generate_languages(enhanced_data)
                if languages:
                    enhanced_data['languages'] = languages
                    logger.info(f"✨ Generated {len(languages)} languages: {languages}")
                else:
                    # Default to English for professionals
                    logger.warning(f"⚠️ AI failed to generate languages, using default")
                    enhanced_data['languages'] = [{'name': 'English', 'level': 'Fluent'}]
            else:
                logger.info(f"ℹ️ Resume already has languages, skipping AI generation")
            
            # 6. Generate Interests if empty (based on resume context) - SHOULD HAVE INTERESTS
            current_interests = enhanced_data.get('interests', [])
            logger.info(f"🎯 Current interests in resume: {current_interests}")
            
            if not current_interests or len(current_interests) == 0:
                logger.info(f"🤖 Attempting to generate interests via AI...")
                interests = await self._generate_interests(enhanced_data)
                if interests:
                    enhanced_data['interests'] = interests
                    logger.info(f"✨ Generated {len(interests)} interests: {interests}")
                else:
                    # Generate from skills/experience domain
                    logger.warning(f"⚠️ AI failed to generate interests, inferring from skills")
                    skills = enhanced_data.get('skills', [])
                    if skills:
                        skill_names = [s.get('name', s) if isinstance(s, dict) else s for s in skills[:3]]
                        enhanced_data['interests'] = [f"Technology & Innovation", "Continuous Learning"] + skill_names[:1]
                    else:
                        enhanced_data['interests'] = ["Technology", "Innovation", "Problem Solving"]
            else:
                logger.info(f"ℹ️ Resume already has interests, skipping AI generation")
            
            # 7. Generate Professional Summary if empty - MUST HAVE SUMMARY
            if not enhanced_data.get('summary') and not enhanced_data.get('professional_summary'):
                logger.info(f"🤖 Attempting to generate professional summary via AI...")
                summary = await self._generate_summary(enhanced_data)
                if summary:
                    enhanced_data['summary'] = summary
                    enhanced_data['professional_summary'] = summary
                    logger.info(f"✨ Generated professional summary")
                else:
                    # Critical: Generate basic summary from experience
                    logger.warning(f"⚠️ AI summary generation failed, creating from experience...")
                    experiences = enhanced_data.get('experience', [])
                    contact = enhanced_data.get('contact_info', {})
                    if experiences:
                        exp = experiences[0]
                        position = exp.get('position', exp.get('title', ''))
                        company = exp.get('company', '')
                        name = contact.get('name', 'Professional')
                        enhanced_data['summary'] = f"{name} is an experienced {position} with a proven track record at {company}. Specialized in delivering high-impact solutions and driving innovation."
                        enhanced_data['professional_summary'] = enhanced_data['summary']
                        logger.info(f"✨ Generated fallback summary from experience")
            
            # 8. Enhance Skills organization
            if enhanced_data.get('skills'):
                logger.info(f"🤖 Organizing skills with AI...")
                organized_skills = await self._organize_skills(enhanced_data['skills'], enhanced_data)
                if organized_skills:
                    enhanced_data['skills'] = organized_skills
                    logger.info(f"✨ Organized {len(organized_skills)} skills into categories")
            
            # 9. Enhance Education descriptions if missing
            if enhanced_data.get('education'):
                logger.info(f"🤖 Enhancing education descriptions...")
                enhanced_education = await self._enhance_education(enhanced_data['education'])
                if enhanced_education:
                    enhanced_data['education'] = enhanced_education
                    logger.info(f"✨ Enhanced {len(enhanced_education)} education entries")
            
            # 10. Enhance Certification descriptions if missing
            if enhanced_data.get('certifications'):
                logger.info(f"🤖 Enhancing certification descriptions...")
                enhanced_certs = await self._enhance_certifications(enhanced_data['certifications'])
                if enhanced_certs:
                    enhanced_data['certifications'] = enhanced_certs
                    logger.info(f"✨ Enhanced {len(enhanced_certs)} certifications")
            
            # 11. Generate project descriptions if missing
            if enhanced_data.get('projects'):
                enhanced_projects = await self._enhance_project_descriptions(enhanced_data['projects'], enhanced_data)
                if enhanced_projects:
                    enhanced_data['projects'] = enhanced_projects
                    logger.info(f"✨ Enhanced project descriptions")
            
        except Exception as e:
            logger.warning(f"⚠️ AI enhancement failed, using original content: {str(e)}")
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
            contact = content.get('contact_info', {})
            
            positions = [exp.get('position', '') for exp in experience[:2] if exp.get('position')]
            companies = [exp.get('company', '') for exp in experience[:2] if exp.get('company')]
            skill_names = []
            
            for skill in skills[:8]:
                if isinstance(skill, dict):
                    skill_names.append(skill.get('name', ''))
                else:
                    skill_names.append(str(skill))
            
            context = f"""Name: {contact.get('name', 'Professional')}
Current/Recent Position: {positions[0] if positions else 'Not specified'}
Company: {companies[0] if companies else 'Not specified'}
Top Skills: {', '.join([s for s in skill_names if s])}
All Positions: {', '.join(positions)}"""

            prompt = f"""Create a SHORT, CATCHY professional tagline for this person's portfolio header.

{context}

CRITICAL REQUIREMENTS:
1. MAXIMUM 8 WORDS - keep it punchy and memorable
2. Use format: "[Role] | [Specialization]" OR "[Adjective] [Role] specializing in [Tech]"
3. Be SPECIFIC to their actual skills (not generic)
4. Make it sound CONFIDENT and IMPRESSIVE
5. This will be the BIG BOLD headline, NOT a full sentence

GOOD Examples:
- "Full-Stack Developer | React & Python Specialist"
- "Creative Frontend Developer | UI/UX Enthusiast"
- "AI Engineer | Machine Learning & Data Science"
- "Backend Developer specializing in Scalable Systems"

BAD Examples (avoid these):
- Long sentences that explain everything
- Generic phrases like "passionate developer"
- Anything over 8 words

Return ONLY the short tagline (max 8 words), no quotes or explanations."""

            response = self.gemini.model.generate_content(prompt)
            tagline = response.text.strip().strip('"').strip("'")
            
            if tagline and 10 < len(tagline) < 120:
                logger.info(f"✅ Generated tagline: {tagline}")
                return tagline
            
            # Fallback
            if positions and skill_names:
                return f"{positions[0]} | {skill_names[0]} Specialist"
                
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
    
    async def _generate_languages(self, resume_data: Dict[str, Any]) -> list:
        """Generate likely languages based on resume context using AI."""
        try:
            logger.info("🤖 _generate_languages: Starting AI language generation...")
            
            # Extract FULL resume context
            context = self._extract_full_resume_context(resume_data)
            
            if not context or len(context) < 50:
                logger.warning("⚠️ No sufficient context available for language generation")
                return []
            
            logger.info(f"📝 Full resume context for language generation ({len(context)} chars):\n{context[:500]}...")
            
            prompt = f"""Based on this professional's complete background, what languages do they likely speak?

{context}

Return a JSON array of 2-3 languages with proficiency levels in this exact format:
[{{"name": "English", "level": "Native"}}, {{"name": "Hindi", "level": "Professional"}}]

Rules:
- Include native language based on name/location
- Include English if location suggests it
- Include regional languages if applicable
- Use levels: Native, Professional, Conversational
- Return ONLY the JSON array, no explanations"""

            logger.info("🤖 Calling Gemini API for language generation...")
            response = self.gemini.model.generate_content(prompt)
            text = response.text.strip()
            logger.info(f"🤖 Gemini response: {text}")
            
            # Extract JSON from response
            import json
            import re
            
            # Try to find JSON array in response
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                languages_json = json_match.group(0)
                languages = json.loads(languages_json)
                
                # Validate format
                if isinstance(languages, list) and len(languages) > 0:
                    valid_languages = []
                    for lang in languages:
                        if isinstance(lang, dict) and 'name' in lang:
                            valid_languages.append(lang)
                    
                    if valid_languages:
                        logger.info(f"✅ Generated {len(valid_languages)} languages via AI")
                        return valid_languages
                    else:
                        logger.warning(f"⚠️ No valid languages in response")
            else:
                logger.warning(f"⚠️ No JSON array found in Gemini response")
            
        except Exception as e:
            logger.error(f"❌ Language generation failed: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
        
        return []
    
    def _extract_full_resume_context(self, resume_data: Dict[str, Any]) -> str:
        """Extract all text content from resume for comprehensive AI analysis."""
        context_parts = []
        
        # Contact info
        contact = resume_data.get('contact_info', {})
        if contact:
            context_parts.append(f"CONTACT: {contact.get('name', '')}, {contact.get('headline', '')}, {contact.get('location', '')}")
        
        # Summary/Objective
        if resume_data.get('summary'):
            context_parts.append(f"SUMMARY: {resume_data['summary']}")
        
        # Work Experience (full descriptions)
        experience = resume_data.get('experience', [])
        if experience:
            exp_text = []
            for exp in experience:
                exp_lines = [f"{exp.get('position', '')} at {exp.get('company', '')}"]
                if exp.get('description'):
                    exp_lines.append(exp['description'])
                if exp.get('responsibilities'):
                    exp_lines.extend(exp['responsibilities'])
                exp_text.append(' '.join(exp_lines))
            context_parts.append(f"EXPERIENCE:\n" + '\n'.join(exp_text[:5]))
        
        # Education (full details)
        education = resume_data.get('education', [])
        if education:
            edu_text = [f"{edu.get('degree', '')} in {edu.get('field_of_study', '')} from {edu.get('institution', '')}" 
                       for edu in education]
            context_parts.append(f"EDUCATION:\n" + '\n'.join(edu_text))
        
        # Skills (all)
        skills = resume_data.get('skills', [])
        if skills:
            skill_names = []
            for skill in skills:
                if isinstance(skill, dict):
                    skill_names.append(skill.get('name', ''))
                elif isinstance(skill, str):
                    skill_names.append(skill)
            context_parts.append(f"SKILLS: {', '.join(filter(None, skill_names))}")
        
        # Projects (full descriptions)
        projects = resume_data.get('projects', [])
        if projects:
            proj_text = []
            for proj in projects:
                if isinstance(proj, dict):
                    proj_lines = [f"{proj.get('name', '')}"]
                    if proj.get('description'):
                        proj_lines.append(proj['description'])
                    if proj.get('technologies'):
                        proj_lines.append(f"Tech: {', '.join(proj['technologies'])}")
                    proj_text.append(' - '.join(proj_lines))
            context_parts.append(f"PROJECTS:\n" + '\n'.join(proj_text[:5]))
        
        # Certifications
        certs = resume_data.get('certifications', [])
        if certs:
            cert_names = [cert.get('name', cert) if isinstance(cert, dict) else str(cert) for cert in certs]
            context_parts.append(f"CERTIFICATIONS: {', '.join(cert_names)}")
        
        # Publications
        pubs = resume_data.get('publications', [])
        if pubs:
            pub_names = [pub.get('title', pub) if isinstance(pub, dict) else str(pub) for pub in pubs]
            context_parts.append(f"PUBLICATIONS: {', '.join(pub_names[:3])}")
        
        # Hackathons/Competitions
        hackathons = resume_data.get('hackathons_competitions', [])
        if hackathons:
            hack_text = [h.get('name', h) if isinstance(h, dict) else str(h) for h in hackathons]
            context_parts.append(f"HACKATHONS: {', '.join(hack_text[:3])}")
        
        # Volunteer Work
        volunteer = resume_data.get('volunteer', [])
        if volunteer:
            vol_text = [f"{v.get('role', '')} at {v.get('organization', '')}" if isinstance(v, dict) else str(v) 
                       for v in volunteer]
            context_parts.append(f"VOLUNTEER: {', '.join(vol_text[:3])}")
        
        # Languages - handle typos
        languages = resume_data.get('languages', [])
        if languages:
            lang_names = []
            for lang in languages:
                if isinstance(lang, dict):
                    # Handle 'namme' typo
                    name = lang.get('name') or lang.get('namme') or lang.get('language')
                    if name:
                        lang_names.append(name)
                elif isinstance(lang, str):
                    lang_names.append(lang)
            if lang_names:
                context_parts.append(f"LANGUAGES: {', '.join(lang_names)}")
        
        result = '\n\n'.join(filter(None, context_parts))
        logger.info(f"📄 Extracted {len(result)} characters of resume context")
        return result
    
    async def _generate_interests(self, resume_data: Dict[str, Any]) -> list:
        """Generate professional interests based on resume field using AI."""
        try:
            logger.info("🤖 _generate_interests: Starting AI interest generation...")
            
            # Extract FULL resume context
            context = self._extract_full_resume_context(resume_data)
            
            if not context or len(context) < 50:
                logger.warning("⚠️ No sufficient context available for interest generation")
                return []
            
            logger.info(f"📝 Full resume context for interest generation ({len(context)} chars):\n{context[:500]}...")

            prompt = f"""Based on this professional's background, what are 4-6 relevant professional interests/hobbies?

{context}

Return a JSON array of interests in this exact format:
["Open Source Contribution", "Tech Blogging", "AI/ML Research", "Public Speaking"]

Rules:
- Mix professional and personal interests
- Keep them relevant to their field
- Make them specific and engaging
- 4-6 interests max
- Return ONLY the JSON array, no explanations"""

            logger.info("🤖 Calling Gemini API for interest generation...")
            response = self.gemini.model.generate_content(prompt)
            text = response.text.strip()
            logger.info(f"🤖 Gemini response: {text}")
            
            # Extract JSON from response
            import json
            import re
            
            # Try to find JSON array in response
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                interests_json = json_match.group(0)
                interests = json.loads(interests_json)
                
                # Validate format
                if isinstance(interests, list) and len(interests) > 0:
                    # Filter out non-string items
                    valid_interests = [i for i in interests if isinstance(i, str) and len(i) > 3]
                    
                    if valid_interests:
                        logger.info(f"✅ Generated {len(valid_interests)} interests via AI")
                        return valid_interests
                    else:
                        logger.warning(f"⚠️ No valid interests in response")
            else:
                logger.warning(f"⚠️ No JSON array found in Gemini response")
            
        except Exception as e:
            logger.error(f"❌ Interest generation failed: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
        
        return []
    
    def _inject_resume_data(
        self,
        template_html: str,
        resume_data: Dict[str, Any],
        theme: str,
        profile_photo: str = None,
        project_images: Dict[str, str] = None
    ) -> str:
        """
        Inject resume data into HTML template using Jinja2
        
        Template variables available:
        - personal: { name, email, phone, location, linkedin, github, website }
        - summary: Professional summary text
        - experience: List of work experiences
        - education: List of education entries
        - skills: List of skills
        - projects: List of projects (with optional images)
        - certifications: List of certifications
        - profile_photo: URL to profile photo
        - theme: Color theme setting
        """
        template = Template(template_html)
        
        # Extract data - resume_data from Firestore has flat structure
        contact_info = resume_data.get('contact_info', {})
        
        # Parse projects to ensure technologies is an array and normalize URLs
        projects = resume_data.get('projects', [])
        project_images = project_images or {}
        
        for i, project in enumerate(projects):
            if isinstance(project, dict):
                # Add image URL if available
                project_id = project.get('id', f'project-{i}')
                if project_id in project_images:
                    project['image'] = project_images[project_id]
                
                # Parse technologies from string to array if needed
                techs = project.get('technologies', project.get('tech_stack', []))
                if isinstance(techs, str):
                    # Split by common delimiters
                    project['technologies'] = [t.strip() for t in techs.replace(',', '|').replace(';', '|').replace('+', '|').split('|') if t.strip()]
                elif isinstance(techs, list):
                    project['technologies'] = techs
                else:
                    project['technologies'] = []
                
                # Normalize project URLs
                if 'url' in project:
                    project['url'] = self._normalize_url(project['url'])
                if 'link' in project:
                    project['link'] = self._normalize_url(project['link'])
                if 'github' in project:
                    project['github'] = self._normalize_url(project['github'])
                if 'demo' in project:
                    project['demo'] = self._normalize_url(project['demo'])
        
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
        
        # Filter out empty sections to avoid showing empty headings
        languages = resume_data.get('languages', [])
        if languages:
            # Filter out empty language entries - handle typos like 'namme'
            filtered_languages = []
            for lang in languages:
                if not lang:
                    continue
                if isinstance(lang, str):
                    filtered_languages.append(lang)
                elif isinstance(lang, dict):
                    # Check multiple possible keys (name, namme, language)
                    lang_name = lang.get('name') or lang.get('namme') or lang.get('language')
                    if lang_name:
                        # Normalize format
                        filtered_languages.append({'name': lang_name, 'level': lang.get('level', lang.get('proficiency', ''))})
            languages = filtered_languages
        
        interests = resume_data.get('interests', [])
        if interests:
            # Filter out empty interests
            interests = [interest for interest in interests if interest and (isinstance(interest, str) or (isinstance(interest, dict) and interest.get('name')))]
        
        certifications = resume_data.get('certifications', [])
        if certifications:
            # Filter out empty certifications
            certifications = [cert for cert in certifications if cert and (isinstance(cert, str) or (isinstance(cert, dict) and (cert.get('name') or cert.get('title'))))]
        
        achievements = resume_data.get('achievements', [])
        if achievements:
            # Filter out empty achievements
            achievements = [ach for ach in achievements if ach]
        
        volunteer = resume_data.get('volunteer', resume_data.get('volunteering', []))
        if volunteer:
            # Filter out empty volunteer entries
            volunteer = [vol for vol in volunteer if vol and (isinstance(vol, str) or (isinstance(vol, dict) and (vol.get('organization') or vol.get('role'))))]
        
        publications = resume_data.get('publications', [])
        if publications:
            # Filter out empty publications
            publications = [pub for pub in publications if pub and (isinstance(pub, str) or (isinstance(pub, dict) and (pub.get('title') or pub.get('name'))))]
        
        awards = resume_data.get('awards', [])
        if awards:
            # Filter out empty awards
            awards = [award for award in awards if award and (isinstance(award, str) or (isinstance(award, dict) and (award.get('title') or award.get('name'))))]
        
        references = resume_data.get('references', [])
        if references:
            # Filter out empty references
            references = [ref for ref in references if ref and (isinstance(ref, str) or (isinstance(ref, dict) and ref.get('name')))]
        
        # Debug log
        logger.info(f"📋 Resume data keys: {list(resume_data.keys())[:10]}")
        logger.info(f"👤 Contact info: {contact_info}")
        logger.info(f"💼 Experience count: {len(resume_data.get('experience', []))}")
        logger.info(f"🎓 Education count: {len(resume_data.get('education', []))}")
        logger.info(f"📁 Projects count: {len(projects)}")
        logger.info(f"🗣️ Languages count (filtered): {len(languages)}")
        if projects:
            logger.info(f"🔧 First project techs: {projects[0].get('technologies', [])}")
        
        context = {
            'personal': {
                'name': contact_info.get('name', contact_info.get('full_name', 'Professional')),
                'email': contact_info.get('email', ''),
                'phone': contact_info.get('phone', contact_info.get('phone_number', '')),
                'location': contact_info.get('location', contact_info.get('address', '')),
                'linkedin': self._normalize_url(contact_info.get('linkedin', contact_info.get('linkedin_url', ''))),
                'github': self._normalize_url(contact_info.get('github', contact_info.get('github_url', ''))),
                'instagram': self._normalize_url(contact_info.get('instagram', contact_info.get('instagram_url', ''))),
                'website': self._normalize_url(contact_info.get('website', contact_info.get('portfolio_url', ''))),
                'twitter': self._normalize_url(contact_info.get('twitter', contact_info.get('twitter_url', ''))),
                'leetcode': self._normalize_url(contact_info.get('leetcode', contact_info.get('leetcode_url', ''))),
                'codechef': self._normalize_url(contact_info.get('codechef', contact_info.get('codechef_url', ''))),
                'hackerrank': self._normalize_url(contact_info.get('hackerrank', contact_info.get('hackerrank_url', ''))),
                'codeforces': self._normalize_url(contact_info.get('codeforces', contact_info.get('codeforces_url', ''))),
                'kaggle': self._normalize_url(contact_info.get('kaggle', contact_info.get('kaggle_url', ''))),
                'medium': self._normalize_url(contact_info.get('medium', contact_info.get('medium_url', ''))),
                'stackoverflow': self._normalize_url(contact_info.get('stackoverflow', contact_info.get('stackoverflow_url', ''))),
                'behance': self._normalize_url(contact_info.get('behance', contact_info.get('behance_url', ''))),
                'dribbble': self._normalize_url(contact_info.get('dribbble', contact_info.get('dribbble_url', ''))),
                'tagline': contact_info.get('headline', contact_info.get('title', '')),
                'title': contact_info.get('title', ''),
                'position': contact_info.get('position', '')
            },
            'summary': resume_data.get('professional_summary', resume_data.get('summary', '')),
            'experience': resume_data.get('experience', []),
            'education': resume_data.get('education', []),
            'skills': parsed_skills,
            'projects': projects,
            'certifications': certifications if certifications else [],
            'achievements': achievements if achievements else [],
            'languages': languages if languages else [],
            'interests': interests if interests else [],
            'volunteer': volunteer if volunteer else [],
            'publications': publications if publications else [],
            'awards': awards if awards else [],
            'references': references if references else [],
            'profile_photo': profile_photo,  # Add profile photo URL
            'current_year': datetime.now().year,  # Dynamic year for copyright
            'theme': theme
        }
        
        logger.info(f"✅ Context prepared: {context['personal']['name']} with {len(context['experience'])} jobs, {len(context['projects'])} projects, {len(context['skills'])} skills, profile_photo={bool(profile_photo)}")
        
        return template.render(**context)
    
    def _normalize_url(self, url: str) -> str:
        """Ensure URL has proper protocol (https://)"""
        if not url:
            return ''
        
        url = url.strip()
        
        # If already has protocol, return as is
        if url.startswith('http://') or url.startswith('https://'):
            return url
        
        # If starts with //, add https:
        if url.startswith('//'):
            return 'https:' + url
        
        # Otherwise, add https://
        return 'https://' + url
    
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
1. Install Vercel CLI: npm i -g vercel
2. Run: vercel
3. Follow the prompts

## Customization
- Edit `index.html` to modify content
- Edit `styles.css` to change styling
- All colors and fonts can be customized in CSS

## Support
For issues or questions, visit: https://resumemakerct.com/support

---
Generated on {datetime.now().strftime('%Y-%m-%d')}
"""
    
    async def _generate_summary(self, resume_data: Dict[str, Any]) -> str:
        """Generate professional summary using AI based on full resume context."""
        try:
            logger.info("🤖 _generate_summary: Starting AI summary generation...")
            
            context = self._extract_full_resume_context(resume_data)
            
            if not context or len(context) < 50:
                logger.warning("⚠️ Insufficient context for summary generation")
                # Generate from minimal data
                contact = resume_data.get('contact_info', {})
                name = contact.get('name', 'Professional')
                title = contact.get('title', contact.get('position', 'Professional'))
                return f"{name} - {title} with expertise in technology and innovation."
            
            logger.info(f"📝 Context for summary generation ({len(context)} chars)")
            
            prompt = f"""Based on this person's complete background, write a natural, authentic 2-3 sentence professional summary for their portfolio.

{context}

CRITICAL REQUIREMENTS:
1. Write in FIRST PERSON - "I am..." NOT "Varsha is..." or third person
2. Sound HUMAN and AUTHENTIC - like the person actually wrote it themselves
3. Avoid corporate buzzwords like "highly motivated", "passionate", "driven", "user-centric", "versatile skillset"
4. Be SPECIFIC about their actual skills, projects, and experience
5. Use conversational but professional tone
6. Focus on what they DO and what they've BUILT, not generic qualities
7. Include real achievements with numbers/impact if available
8. Make it sound confident but natural

BAD Example (avoid this): "Varsha is a highly motivated developer passionate about user-centric applications..."
GOOD Example (aim for this): "I'm a web developer specializing in JavaScript and Python, with experience building secure authentication systems and AI-powered applications. I've worked on projects ranging from responsive calculators to machine learning tools, focusing on clean code and user experience."

Write naturally as if YOU are this person describing yourself to potential employers or clients.
Keep it concise (2-3 sentences max).

Return ONLY the summary text, no quotes or formatting."""

            logger.info("📤 Sending summary generation request to Gemini...")
            response = self.gemini.model.generate_content(prompt)
            summary = response.text.strip().strip('"').strip("'")
            
            # Ensure quality
            if summary and len(summary) > 50 and len(summary) < 600:
                logger.info(f"✅ Generated summary ({len(summary)} chars): {summary[:100]}...")
                return summary
            else:
                logger.warning(f"⚠️ Generated summary quality issue (length: {len(summary) if summary else 0})")
                # Fallback: Extract from experience
                experiences = resume_data.get('experience', [])
                if experiences:
                    exp = experiences[0]
                    position = exp.get('position', exp.get('title', ''))
                    company = exp.get('company', '')
                    return f"Accomplished {position} at {company}, specializing in driving innovation and delivering impactful results."
                
                return ""
                
        except Exception as e:
            logger.error(f"❌ Summary generation failed: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
        
        return ""
    
    async def _organize_skills(self, skills: list, resume_data: Dict[str, Any]) -> list:
        """Organize skills into logical categories using AI."""
        try:
            logger.info("🤖 _organize_skills: Organizing skills with AI...")
            
            if not skills or len(skills) == 0:
                return skills
            
            # Convert skills to list of strings
            skill_names = []
            for skill in skills:
                if isinstance(skill, dict):
                    skill_names.append(skill.get('name', str(skill)))
                elif isinstance(skill, str):
                    skill_names.append(skill)
            
            if len(skill_names) < 3:
                logger.info("ℹ️ Too few skills to organize, keeping original")
                return skills
            
            skills_text = ', '.join(skill_names[:20])  # Limit to top 20
            
            prompt = f"""Organize these skills into 4-5 logical categories.

Skills: {skills_text}

Return a JSON object with category names as keys and arrays of skills as values.
Categories should be: "Programming Languages", "Web Technologies", "Database Systems", "Tools & Frameworks", "Other"

Example format:
{{
  "Programming Languages": ["Python", "JavaScript"],
  "Web Technologies": ["HTML", "CSS", "React"],
  "Database Systems": ["MySQL", "MongoDB"]
}}

Return ONLY valid JSON, no markdown or explanations."""

            logger.info("🤖 Calling Gemini API for skill organization...")
            response = self.gemini.model.generate_content(prompt)
            text = response.text.strip()
            
            # Extract JSON
            import json
            import re
            
            # Remove markdown code blocks if present
            text = re.sub(r'```json\s*', '', text)
            text = re.sub(r'```\s*', '', text)
            
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                organized = json.loads(json_match.group(0))
                
                if isinstance(organized, dict):
                    # Convert back to flat list with categories
                    result = []
                    for category, category_skills in organized.items():
                        if isinstance(category_skills, list):
                            for skill in category_skills:
                                result.append({
                                    'name': skill,
                                    'category': category
                                })
                    
                    if result:
                        logger.info(f"✅ Organized {len(result)} skills into categories")
                        return result
            
            logger.warning("⚠️ Could not organize skills, keeping original")
            return skills
            
        except Exception as e:
            logger.error(f"❌ Skill organization failed: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
        
        return skills
    
    async def _enhance_education(self, education: list) -> list:
        """Enhance education entries with AI-generated descriptions."""
        try:
            enhanced = []
            for edu in education[:5]:  # Limit to top 5
                edu_copy = edu.copy() if isinstance(edu, dict) else {}
                
                # Skip if already has a good description
                if edu_copy.get('description') and len(edu_copy.get('description', '')) > 50:
                    enhanced.append(edu_copy)
                    continue
                
                # Generate description for this education
                degree = edu_copy.get('degree', '')
                institution = edu_copy.get('institution', '')
                field = edu_copy.get('field_of_study', edu_copy.get('field', ''))
                
                if degree and institution:
                    prompt = f"""Write a brief 1-2 sentence description for this education entry in a portfolio:

Degree: {degree}
Institution: {institution}
Field: {field if field else 'Not specified'}

Focus on: key achievements, specialization, relevant coursework, or honors.
Keep it professional and concise.
Return ONLY the description."""

                    response = self.gemini.model.generate_content(prompt)
                    description = response.text.strip().strip('"').strip("'")
                    
                    if description and len(description) > 10:
                        edu_copy['description'] = description
                        logger.info(f"✨ Generated description for {degree}")
                
                enhanced.append(edu_copy)
            
            return enhanced if enhanced else education
            
        except Exception as e:
            logger.error(f"❌ Education enhancement failed: {str(e)}")
        
        return education
    
    async def _enhance_certifications(self, certifications: list) -> list:
        """Enhance certification entries with AI-generated descriptions."""
        try:
            enhanced = []
            for cert in certifications[:10]:  # Limit to top 10
                cert_copy = cert.copy() if isinstance(cert, dict) else {}
                
                # Skip if already has description
                if cert_copy.get('description') and len(cert_copy.get('description', '')) > 30:
                    enhanced.append(cert_copy)
                    continue
                
                # Generate description
                name = cert_copy.get('name', cert_copy.get('title', ''))
                issuer = cert_copy.get('issuer', cert_copy.get('organization', ''))
                
                if name:
                    prompt = f"""Write a brief 1 sentence value statement for this certification in a portfolio:

Certification: {name}
Issuer: {issuer if issuer else 'Not specified'}

Focus on: what skills it validates, why it's valuable, or what it demonstrates.
Keep it professional and concise.
Return ONLY the description."""

                    response = self.gemini.model.generate_content(prompt)
                    description = response.text.strip().strip('"').strip("'")
                    
                    if description and len(description) > 10:
                        cert_copy['description'] = description
                        logger.info(f"✨ Generated description for certification: {name}")
                
                enhanced.append(cert_copy)
            
            return enhanced if enhanced else certifications
            
        except Exception as e:
            logger.error(f"❌ Certification enhancement failed: {str(e)}")
        
        return certifications
    
    async def _enhance_project_descriptions(self, projects: list, resume_data: Dict) -> list:
        """Enhance project descriptions with AI."""
        try:
            enhanced = []
            skills = resume_data.get('skills', [])
            skill_names = [s.get('name', s) if isinstance(s, dict) else s for s in skills[:10]]
            
            for project in projects[:6]:  # Limit to top 6
                proj_copy = project.copy() if isinstance(project, dict) else {}
                
                # Enhance description if missing or too short
                current_desc = proj_copy.get('description', '')
                if not current_desc or len(current_desc) < 50:
                    name = proj_copy.get('name', proj_copy.get('title', ''))
                    technologies = proj_copy.get('technologies', proj_copy.get('tech_stack', []))
                    
                    if name:
                        prompt = f"""Write a compelling 2-3 sentence project description for a portfolio:

Project: {name}
Technologies: {', '.join(technologies) if technologies else 'Not specified'}
Developer Skills: {', '.join(skill_names[:5])}

Focus on: problem solved, key features, impact/results, technical complexity.
Use active voice and quantify achievements when possible.
Return ONLY the description."""

                        response = self.gemini.model.generate_content(prompt)
                        description = response.text.strip().strip('"').strip("'")
                        
                        if description and 30 < len(description) < 500:
                            proj_copy['description'] = description
                            logger.info(f"✨ Enhanced description for project: {name}")
                
                enhanced.append(proj_copy)
            
            return enhanced if enhanced else projects
            
        except Exception as e:
            logger.error(f"❌ Project description enhancement failed: {str(e)}")
        
        return projects
