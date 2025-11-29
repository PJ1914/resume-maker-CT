"""
Advanced ATS Resume Evaluation Engine
Evaluates resumes based on industry-standard ATS parameters
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime


class ATSScorer:
    """
    Comprehensive ATS Resume Scorer with weighted evaluation categories.
    Total score: 100 points distributed across 6 categories.
    """
    
    # Weights for each category (must sum to 100)
    WEIGHTS = {
        'format_ats_compatibility': 20,
        'keyword_match': 25,
        'skills_relevance': 15,
        'experience_quality': 20,
        'achievements_impact': 10,
        'grammar_clarity': 10,
    }
    
    # Common ATS-friendly section headers
    STANDARD_SECTIONS = [
        'summary', 'objective', 'profile',
        'experience', 'work history', 'employment',
        'education', 'academic',
        'skills', 'technical skills', 'core competencies',
        'projects', 'certifications', 'achievements', 'awards'
    ]
    
    # Strong action verbs for bullet points
    ACTION_VERBS = [
        'achieved', 'accomplished', 'improved', 'increased', 'reduced',
        'developed', 'created', 'designed', 'implemented', 'launched',
        'managed', 'led', 'directed', 'coordinated', 'executed',
        'optimized', 'streamlined', 'automated', 'built', 'deployed',
        'analyzed', 'evaluated', 'assessed', 'researched', 'investigated',
        'established', 'initiated', 'founded', 'pioneered', 'spearheaded',
        'delivered', 'completed', 'solved', 'resolved', 'enhanced',
        'generated', 'drove', 'boosted', 'accelerated', 'transformed'
    ]
    
    # Technical skill categories
    COMMON_TECH_SKILLS = {
        'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin'],
        'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'fastapi'],
        'data': ['sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'],
        'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins'],
        'ml_ai': ['tensorflow', 'pytorch', 'scikit-learn', 'keras', 'opencv', 'nlp', 'machine learning', 'deep learning'],
    }
    
    def __init__(self):
        self.results = {}
    
    def score_resume(
        self,
        parsed_data: Dict,
        job_description: Optional[str] = None
    ) -> Dict:
        """
        Main scoring function.
        
        Args:
            parsed_data: Parsed resume data from parser
            job_description: Optional job description for keyword matching
            
        Returns:
            Comprehensive scoring results
        """
        resume_text = parsed_data.get('parsed_text', '')
        contact_info = parsed_data.get('contact_info', {})
        skills = parsed_data.get('skills', {})
        experience = parsed_data.get('experience', [])
        education = parsed_data.get('education', [])
        projects = parsed_data.get('projects', [])
        sections = parsed_data.get('sections', {})
        
        # Score each category
        format_score = self._score_format_ats_compatibility(parsed_data)
        keyword_score = self._score_keyword_match(resume_text, skills, job_description)
        skills_score = self._score_skills_relevance(skills, job_description)
        experience_score = self._score_experience_quality(experience)
        achievements_score = self._score_achievements_impact(experience, projects)
        grammar_score = self._score_grammar_clarity(resume_text, experience)
        
        # Calculate total score
        total_score = round(
            format_score['score'] +
            keyword_score['score'] +
            skills_score['score'] +
            experience_score['score'] +
            achievements_score['score'] +
            grammar_score['score'],
            1
        )
        
        # Determine rating
        rating = self._get_rating(total_score)
        
        # Generate comprehensive feedback
        strengths = self._generate_strengths(
            format_score, keyword_score, skills_score,
            experience_score, achievements_score, grammar_score
        )
        
        weaknesses = self._generate_weaknesses(
            format_score, keyword_score, skills_score,
            experience_score, achievements_score, grammar_score
        )
        
        missing_keywords = keyword_score.get('missing_keywords', [])
        
        section_feedback = self._generate_section_feedback(
            contact_info, sections, skills, experience, education, projects
        )
        
        recommendations = self._generate_recommendations(
            format_score, keyword_score, skills_score,
            experience_score, achievements_score, grammar_score
        )
        
        improved_bullets = self._generate_improved_bullets(experience)
        
        # Build final result
        result = {
            'total_score': total_score,
            'rating': rating,
            'breakdown': {
                'format_ats_compatibility': {
                    'score': format_score['score'],
                    'max_score': self.WEIGHTS['format_ats_compatibility'],
                    'percentage': round((format_score['score'] / self.WEIGHTS['format_ats_compatibility']) * 100, 1)
                },
                'keyword_match': {
                    'score': keyword_score['score'],
                    'max_score': self.WEIGHTS['keyword_match'],
                    'percentage': round((keyword_score['score'] / self.WEIGHTS['keyword_match']) * 100, 1) if self.WEIGHTS['keyword_match'] > 0 else 0
                },
                'skills_relevance': {
                    'score': skills_score['score'],
                    'max_score': self.WEIGHTS['skills_relevance'],
                    'percentage': round((skills_score['score'] / self.WEIGHTS['skills_relevance']) * 100, 1)
                },
                'experience_quality': {
                    'score': experience_score['score'],
                    'max_score': self.WEIGHTS['experience_quality'],
                    'percentage': round((experience_score['score'] / self.WEIGHTS['experience_quality']) * 100, 1)
                },
                'achievements_impact': {
                    'score': achievements_score['score'],
                    'max_score': self.WEIGHTS['achievements_impact'],
                    'percentage': round((achievements_score['score'] / self.WEIGHTS['achievements_impact']) * 100, 1)
                },
                'grammar_clarity': {
                    'score': grammar_score['score'],
                    'max_score': self.WEIGHTS['grammar_clarity'],
                    'percentage': round((grammar_score['score'] / self.WEIGHTS['grammar_clarity']) * 100, 1)
                },
            },
            'strengths': strengths,
            'weaknesses': weaknesses,
            'missing_keywords': missing_keywords,
            'section_feedback': section_feedback,
            'recommendations': recommendations,
            'improved_bullets': improved_bullets,
            'scored_at': datetime.utcnow().isoformat(),
            'job_description_provided': job_description is not None,
        }
        
        return result
    
    def _score_format_ats_compatibility(self, parsed_data: Dict) -> Dict:
        """Score format and ATS compatibility (20 points)"""
        score = 0
        details = []
        issues = []
        
        layout_type = parsed_data.get('layout_type', 'unknown')
        sections = parsed_data.get('sections', {})
        parsed_text = parsed_data.get('parsed_text', '')
        
        # Check layout (5 points)
        if layout_type == 'single_column':
            score += 5
            details.append("Clean single-column layout detected")
        elif layout_type == 'two_column':
            score += 3
            issues.append("Two-column layout may cause parsing issues in some ATS")
        else:
            score += 2
            issues.append("Complex layout detected - simplify for better ATS compatibility")
        
        # Check standard section headers (5 points)
        found_sections = [s.lower() for s in sections.keys()]
        standard_count = sum(1 for std in self.STANDARD_SECTIONS if any(std in fs for fs in found_sections))
        if standard_count >= 4:
            score += 5
            details.append(f"Uses {standard_count} standard section headers")
        elif standard_count >= 2:
            score += 3
            issues.append("Some non-standard section headers detected")
        else:
            score += 1
            issues.append("Use standard section headers (Experience, Education, Skills, etc.)")
        
        # Check text readability (5 points)
        if len(parsed_text) > 200:
            score += 5
            details.append("Text extracted successfully with good length")
        elif len(parsed_text) > 100:
            score += 3
            issues.append("Resume seems short - add more detail")
        else:
            score += 1
            issues.append("Resume text very short or poorly extracted")
        
        # Check contact information (5 points)
        contact_info = parsed_data.get('contact_info', {})
        contact_fields = sum(1 for v in contact_info.values() if v)
        if contact_fields >= 4:
            score += 5
            details.append("Complete contact information provided")
        elif contact_fields >= 2:
            score += 3
            issues.append("Add more contact details (phone, email, LinkedIn, location)")
        else:
            score += 1
            issues.append("Missing critical contact information")
        
        return {
            'score': score,
            'details': details,
            'issues': issues
        }
    
    def _score_keyword_match(self, resume_text: str, skills: Dict, job_description: Optional[str]) -> Dict:
        """Score keyword match (25 points)"""
        score = 0
        details = []
        issues = []
        missing_keywords = []
        
        resume_lower = resume_text.lower()
        
        if job_description:
            # Extract keywords from job description
            jd_lower = job_description.lower()
            jd_keywords = self._extract_keywords(jd_lower)
            
            # Check for keyword matches
            matched = []
            for keyword in jd_keywords:
                if keyword.lower() in resume_lower:
                    matched.append(keyword)
                else:
                    missing_keywords.append(keyword)
            
            match_rate = len(matched) / len(jd_keywords) if jd_keywords else 0
            score = round(match_rate * 25, 1)
            
            if match_rate >= 0.7:
                details.append(f"Strong keyword match: {len(matched)}/{len(jd_keywords)} keywords found")
            elif match_rate >= 0.4:
                details.append(f"Moderate keyword match: {len(matched)}/{len(jd_keywords)} keywords found")
                issues.append(f"Missing {len(missing_keywords)} important keywords from job description")
            else:
                issues.append(f"Weak keyword match: only {len(matched)}/{len(jd_keywords)} keywords found")
                issues.append("Tailor your resume to include more job-specific keywords")
        else:
            # Generic keyword evaluation (no job description)
            # Check for action verbs (10 points)
            action_verb_count = sum(1 for verb in self.ACTION_VERBS if verb in resume_lower)
            if action_verb_count >= 10:
                score += 10
                details.append(f"Uses {action_verb_count} strong action verbs")
            elif action_verb_count >= 5:
                score += 6
                details.append(f"Uses {action_verb_count} action verbs - add more")
            else:
                score += 3
                issues.append("Add more strong action verbs (achieved, developed, managed, etc.)")
            
            # Check for technical skills (15 points)
            all_tech_skills = [skill for category in self.COMMON_TECH_SKILLS.values() for skill in category]
            tech_skill_count = sum(1 for skill in all_tech_skills if skill in resume_lower)
            if tech_skill_count >= 8:
                score += 15
                details.append(f"Contains {tech_skill_count} technical skills/tools")
            elif tech_skill_count >= 4:
                score += 10
                details.append(f"Contains {tech_skill_count} technical skills - add more if relevant")
            else:
                score += 5
                issues.append("Add more specific technical skills and tools")
        
        return {
            'score': score,
            'details': details,
            'issues': issues,
            'missing_keywords': missing_keywords[:20]  # Limit to top 20
        }
    
    def _score_skills_relevance(self, skills: Dict, job_description: Optional[str]) -> Dict:
        """Score skills relevance (15 points)"""
        score = 0
        details = []
        issues = []
        
        if not skills or len(skills) == 0:
            issues.append("No skills section found or parsed")
            return {'score': 0, 'details': details, 'issues': issues}
        
        # Count total skills
        total_skills = sum(len(v) if isinstance(v, list) else 1 for v in skills.values())
        
        # Check skills quantity (5 points)
        if total_skills >= 15:
            score += 5
            details.append(f"{total_skills} skills listed - excellent variety")
        elif total_skills >= 8:
            score += 3
            details.append(f"{total_skills} skills listed - consider adding more")
        else:
            score += 1
            issues.append(f"Only {total_skills} skills listed - add more relevant skills")
        
        # Check skills organization (5 points)
        if len(skills) >= 3:
            score += 5
            details.append(f"Skills organized into {len(skills)} categories")
        elif len(skills) >= 2:
            score += 3
            details.append("Skills somewhat organized - group into clear categories")
        else:
            score += 1
            issues.append("Organize skills into categories (Languages, Frameworks, Tools, etc.)")
        
        # Check for technical depth (5 points)
        has_tech_skills = any(
            cat.lower() in ['languages', 'frameworks', 'tools', 'technologies', 'programming', 'technical']
            for cat in skills.keys()
        )
        if has_tech_skills:
            score += 5
            details.append("Clear technical skills categories present")
        else:
            score += 2
            issues.append("Add clear technical skills categories")
        
        return {
            'score': score,
            'details': details,
            'issues': issues
        }
    
    def _score_experience_quality(self, experience: List[Dict]) -> Dict:
        """Score experience quality (20 points)"""
        score = 0
        details = []
        issues = []
        
        if not experience or len(experience) == 0:
            issues.append("No work experience found")
            return {'score': 0, 'details': details, 'issues': issues}
        
        # Check number of experiences (5 points)
        if len(experience) >= 3:
            score += 5
            details.append(f"{len(experience)} work experiences listed")
        elif len(experience) >= 2:
            score += 3
            details.append(f"{len(experience)} work experiences - good")
        else:
            score += 2
            details.append(f"Only {len(experience)} work experience")
        
        # Check for complete information (5 points)
        complete_count = sum(
            1 for exp in experience
            if exp.get('company') and exp.get('position') and exp.get('startDate')
        )
        if complete_count == len(experience):
            score += 5
            details.append("All experiences have complete information (company, title, dates)")
        else:
            score += 2
            issues.append(f"Some experiences missing company, title, or dates")
        
        # Check for descriptions with bullet points (5 points)
        exp_with_desc = sum(1 for exp in experience if exp.get('description'))
        if exp_with_desc == len(experience):
            score += 5
            details.append("All experiences include detailed descriptions")
        elif exp_with_desc >= len(experience) / 2:
            score += 3
            issues.append("Some experiences lack detailed descriptions")
        else:
            score += 1
            issues.append("Add detailed bullet-point descriptions for each role")
        
        # Check for action verbs in descriptions (5 points)
        descriptions = ' '.join([exp.get('description', '') for exp in experience]).lower()
        action_verb_count = sum(1 for verb in self.ACTION_VERBS if verb in descriptions)
        if action_verb_count >= 8:
            score += 5
            details.append(f"Uses {action_verb_count} strong action verbs in descriptions")
        elif action_verb_count >= 4:
            score += 3
            details.append(f"Uses {action_verb_count} action verbs - add more")
        else:
            score += 1
            issues.append("Start bullet points with strong action verbs")
        
        return {
            'score': score,
            'details': details,
            'issues': issues
        }
    
    def _score_achievements_impact(self, experience: List[Dict], projects: List[Dict]) -> Dict:
        """Score achievements and measurable impact (10 points)"""
        score = 0
        details = []
        issues = []
        
        # Combine all text
        all_text = ''
        for exp in experience:
            all_text += ' ' + exp.get('description', '')
        for proj in projects:
            all_text += ' ' + proj.get('description', '')
        
        # Check for numbers and metrics
        numbers = re.findall(r'\b\d+[\d,]*(?:\.\d+)?%?\b', all_text)
        metric_keywords = ['increased', 'decreased', 'reduced', 'improved', 'saved', 'generated', 
                          'grew', 'achieved', 'exceeded', 'delivered', 'accelerated']
        metrics_count = sum(1 for kw in metric_keywords if kw in all_text.lower())
        
        # Score based on quantifiable achievements (7 points)
        if len(numbers) >= 8:
            score += 7
            details.append(f"Excellent use of metrics: {len(numbers)} quantifiable results")
        elif len(numbers) >= 4:
            score += 4
            details.append(f"Good use of metrics: {len(numbers)} quantifiable results")
        elif len(numbers) >= 1:
            score += 2
            issues.append("Add more quantifiable metrics and numbers to show impact")
        else:
            score += 0
            issues.append("No quantifiable achievements found - add numbers, percentages, metrics")
        
        # Score based on impact keywords (3 points)
        if metrics_count >= 5:
            score += 3
            details.append(f"Strong impact language used ({metrics_count} impact keywords)")
        elif metrics_count >= 2:
            score += 2
            issues.append("Add more impact-focused language")
        else:
            score += 0
            issues.append("Use impact-focused verbs (increased, reduced, improved, etc.)")
        
        return {
            'score': score,
            'details': details,
            'issues': issues
        }
    
    def _score_grammar_clarity(self, resume_text: str, experience: List[Dict]) -> Dict:
        """Score grammar and clarity (10 points)"""
        score = 10  # Start with perfect, deduct for issues
        details = []
        issues = []
        
        # Check for common grammar issues
        text_lower = resume_text.lower()
        
        # Check average sentence length (should be concise)
        sentences = re.split(r'[.!?]+', resume_text)
        avg_length = sum(len(s.split()) for s in sentences if s.strip()) / len([s for s in sentences if s.strip()]) if sentences else 0
        
        if avg_length <= 20:
            details.append("Concise, clear sentences")
        else:
            score -= 2
            issues.append("Some sentences are too long - keep bullet points concise")
        
        # Check for passive voice indicators
        passive_indicators = ['was', 'were', 'been', 'being']
        passive_count = sum(text_lower.count(f' {word} ') for word in passive_indicators)
        if passive_count > 10:
            score -= 2
            issues.append("Reduce passive voice - use active voice (e.g., 'Led team' not 'Team was led')")
        
        # Check for vague words
        vague_words = ['various', 'several', 'many', 'responsible for', 'worked on', 'helped with']
        vague_count = sum(1 for word in vague_words if word in text_lower)
        if vague_count > 5:
            score -= 2
            issues.append("Avoid vague language - be specific about your contributions")
        
        # Check for professional tone
        informal_words = ['stuff', 'things', 'got', 'gonna', 'kinda', 'lots']
        informal_count = sum(1 for word in informal_words if word in text_lower)
        if informal_count > 0:
            score -= 3
            issues.append("Maintain professional language throughout")
        
        if score == 10:
            details.append("Excellent grammar and professional tone")
        elif score >= 7:
            details.append("Good grammar with minor improvements needed")
        
        return {
            'score': max(score, 0),
            'details': details,
            'issues': issues
        }
    
    def _get_rating(self, total_score: float) -> str:
        """Convert score to rating"""
        if total_score >= 90:
            return "Excellent"
        elif total_score >= 80:
            return "Very Good"
        elif total_score >= 70:
            return "Good"
        elif total_score >= 60:
            return "Fair"
        elif total_score >= 50:
            return "Needs Improvement"
        else:
            return "Poor"
    
    def _generate_strengths(self, *score_dicts) -> List[str]:
        """Aggregate strengths from all categories"""
        strengths = []
        for score_dict in score_dicts:
            if 'details' in score_dict:
                strengths.extend(score_dict['details'])
        return strengths[:10]  # Top 10 strengths
    
    def _generate_weaknesses(self, *score_dicts) -> List[str]:
        """Aggregate weaknesses from all categories"""
        weaknesses = []
        for score_dict in score_dicts:
            if 'issues' in score_dict:
                weaknesses.extend(score_dict['issues'])
        return weaknesses[:10]  # Top 10 weaknesses
    
    def _generate_section_feedback(
        self, contact_info, sections, skills, experience, education, projects
    ) -> Dict[str, Dict[str, str]]:
        """Generate feedback for each resume section"""
        feedback = {}
        
        # Contact Information
        contact_fields = sum(1 for v in contact_info.values() if v)
        feedback['contact_information'] = {
            'good': f"Has {contact_fields} contact fields" if contact_fields > 0 else "",
            'missing': "Email, phone, location recommended" if contact_fields < 3 else "",
            'improve': "Add LinkedIn and GitHub profiles" if not contact_info.get('linkedin') else ""
        }
        
        # Skills
        feedback['skills'] = {
            'good': f"Lists {sum(len(v) if isinstance(v, list) else 1 for v in skills.values())} skills" if skills else "",
            'missing': "No skills section found" if not skills else "",
            'improve': "Organize into categories (Languages, Frameworks, Tools)" if len(skills) < 3 else ""
        }
        
        # Experience
        feedback['work_experience'] = {
            'good': f"Has {len(experience)} work experiences" if experience else "",
            'missing': "No work experience found" if not experience else "",
            'improve': "Add bullet points with quantifiable achievements" if experience else ""
        }
        
        # Education
        feedback['education'] = {
            'good': f"Has {len(education)} education entries" if education else "",
            'missing': "No education found" if not education else "",
            'improve': "Include degree, institution, graduation date, and GPA (if strong)" if education else ""
        }
        
        # Projects
        feedback['projects'] = {
            'good': f"Lists {len(projects)} projects" if projects else "",
            'missing': "Consider adding projects section" if not projects else "",
            'improve': "Include technologies used and measurable outcomes" if projects else ""
        }
        
        return feedback
    
    def _generate_recommendations(self, *score_dicts) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Collect all issues
        all_issues = []
        for score_dict in score_dicts:
            if 'issues' in score_dict:
                all_issues.extend(score_dict['issues'])
        
        # Deduplicate and prioritize
        unique_issues = list(dict.fromkeys(all_issues))
        
        # Add general recommendations
        recommendations.extend([
            "Use standard section headers (Experience, Education, Skills, Projects)",
            "Start each bullet point with a strong action verb",
            "Add quantifiable metrics and numbers to show impact",
            "Keep formatting simple - avoid tables, columns, and graphics",
            "Tailor keywords to match the target job description",
            "Use consistent date formatting (MM/YYYY or Month YYYY)",
            "Proofread for grammar and spelling errors",
            "Keep bullet points concise (1-2 lines maximum)",
        ])
        
        recommendations.extend(unique_issues)
        
        return list(dict.fromkeys(recommendations))[:12]  # Top 12 unique recommendations
    
    def _generate_improved_bullets(self, experience: List[Dict]) -> List[Dict[str, str]]:
        """Generate improved versions of experience bullet points"""
        improved = []
        
        for exp in experience[:3]:  # First 3 experiences
            desc = exp.get('description', '')
            if not desc:
                continue
            
            # Split into bullets
            bullets = [b.strip() for b in desc.split('\n') if b.strip()]
            
            for bullet in bullets[:2]:  # First 2 bullets per experience
                # Check if it needs improvement
                has_action_verb = any(bullet.lower().startswith(verb) for verb in self.ACTION_VERBS)
                has_metric = bool(re.search(r'\d+', bullet))
                
                if not has_action_verb or not has_metric:
                    improved.append({
                        'original': bullet,
                        'suggestion': f"Add action verb and quantifiable metric. Example: 'Developed X feature that increased Y by Z%'"
                    })
                
                if len(improved) >= 6:
                    break
            
            if len(improved) >= 6:
                break
        
        return improved
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from job description"""
        # Remove common words
        stop_words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                         'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during'])
        
        # Split into words
        words = re.findall(r'\b[a-z]+\b', text.lower())
        
        # Filter and count
        word_freq = {}
        for word in words:
            if len(word) > 3 and word not in stop_words:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        # Return top keywords
        return [word for word, freq in sorted_words[:30]]
