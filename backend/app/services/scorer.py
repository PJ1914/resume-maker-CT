"""
Local ATS scoring engine - deterministic, offline scoring system.
Works without Gemini API as fallback or primary scorer.
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone


class KeywordMatcher:
    """Match keywords and calculate relevance scores."""
    
    # Comprehensive ATS keywords by category - 100+ keywords
    TECHNICAL_KEYWORDS = {
        'programming': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'sql', 'nosql', 'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'dotnet', '.net', 'php', 'ruby', 'golang', 'rust', 'kotlin', 'swift'],
        'data': ['machine learning', 'deep learning', 'ai', 'artificial intelligence', 'data science', 'data analysis', 'analytics', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'tableau', 'power bi', 'excel', 'statistics', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'big data', 'spark', 'hadoop'],
        'cloud': ['aws', 'azure', 'gcp', 'google cloud', 'cloud computing', 'docker', 'kubernetes', 'k8s', 'terraform', 'jenkins', 'ci/cd', 'devops', 'microservices', 'serverless', 'lambda', 'ec2', 's3', 'cloudformation'],
        'web': ['html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'webpack', 'vite', 'rest api', 'graphql', 'json', 'xml', 'responsive design', 'ui/ux', 'frontend', 'backend', 'full stack'],
        'mobile': ['ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'mobile development', 'app development'],
        'soft_skills': ['leadership', 'communication', 'teamwork', 'collaboration', 'problem solving', 'analytical', 'critical thinking', 'agile', 'scrum', 'project management', 'stakeholder management', 'mentoring', 'training'],
        'tools': ['git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'vscode', 'intellij', 'eclipse', 'postman', 'figma', 'sketch'],
        'certifications': ['aws certified', 'azure certified', 'pmp', 'scrum master', 'certified', 'certification'],
    }
    
    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        """Extract potential keywords from text."""
        # Convert to lowercase
        text = text.lower()
        
        # Extract multi-word phrases (2-3 words)
        phrases = []
        words = re.findall(r'\b\w+\b', text)
        
        # Bigrams
        for i in range(len(words) - 1):
            phrases.append(f"{words[i]} {words[i+1]}")
        
        # Trigrams
        for i in range(len(words) - 2):
            phrases.append(f"{words[i]} {words[i+1]} {words[i+2]}")
        
        # Single words (filter short ones)
        keywords = [w for w in words if len(w) > 3]
        
        return keywords + phrases
    
    @staticmethod
    def calculate_keyword_score(resume_text: str, job_description: Optional[str] = None) -> Dict:
        """
        Calculate keyword matching score.
        
        Args:
            resume_text: Full resume text
            job_description: Optional job description for matching
            
        Returns:
            Score dict with keyword analysis
        """
        resume_text_lower = resume_text.lower()
        
        # Count technical keywords with scoring boost
        tech_count = 0
        tech_found = []
        category_coverage = set()
        
        for category, keywords in KeywordMatcher.TECHNICAL_KEYWORDS.items():
            category_hits = 0
            for keyword in keywords:
                if keyword.lower() in resume_text_lower:
                    tech_count += 1
                    tech_found.append(keyword)
                    category_hits += 1
            if category_hits > 0:
                category_coverage.add(category)
        
        # More generous scoring: 0-30 points
        # Award points for keyword diversity across categories
        base_score = min(25, tech_count * 1.5)  # More generous multiplier
        diversity_bonus = len(category_coverage) * 1.5  # Bonus for diverse skills
        keyword_score = min(30, base_score + diversity_bonus)
        
        return {
            'score': keyword_score,
            'total_keywords': tech_count,
            'keywords_found': tech_found[:20],  # Top 20
            'categories_covered': len(set(tech_found)) // 3,  # Rough estimate
        }


class SectionAnalyzer:
    """Analyze presence and quality of resume sections."""
    
    # Required sections with variations
    REQUIRED_SECTIONS = {
        'experience': ['experience', 'work experience', 'employment', 'work history', 'professional experience', 'career history'],
        'education': ['education', 'academic background', 'qualifications', 'academic history'],
        'skills': ['skills', 'technical skills', 'core competencies', 'expertise', 'proficiencies']
    }
    
    # Recommended sections with variations
    RECOMMENDED_SECTIONS = {
        'summary': ['summary', 'profile', 'objective', 'professional summary', 'about me', 'overview'],
        'projects': ['projects', 'key projects', 'notable projects', 'portfolio'],
        'certifications': ['certifications', 'certificates', 'licenses', 'credentials']
    }
    
    @staticmethod
    def analyze_sections(sections: Dict[str, str]) -> Dict:
        """
        Analyze section presence and content quality.
        
        Args:
            sections: Dict of section_name -> content OR list of section objects
            
        Returns:
            Analysis with scores
        """
        # Fuzzy match sections
        def has_section(required_key, section_names_lower):
            """Check if any variation of required section exists"""
            variations = SectionAnalyzer.REQUIRED_SECTIONS.get(required_key) or SectionAnalyzer.RECOMMENDED_SECTIONS.get(required_key, [])
            return any(var in section_names_lower for var in variations)
        
        # Handle both dict and list formats for sections
        if isinstance(sections, list):
            # Convert list format to dict format for scoring
            section_names = set()
            sections_dict = {}
            for section in sections:
                if isinstance(section, dict):
                    section_type = section.get('type', 'custom')
                    section_names.add(section_type)
                    sections_dict[section_type] = str(section.get('items', []))
            sections = sections_dict
        else:
            section_names = set(sections.keys()) if sections else set()
        
        # Create lowercase version for fuzzy matching
        section_names_lower = ' '.join(str(s).lower() for s in section_names)
        
        # Check required sections (25 points total) - use fuzzy matching
        required_score = 0
        missing_required = []
        
        for section_key in ['experience', 'education', 'skills']:
            if has_section(section_key, section_names_lower):
                required_score += 9  # More generous: 27 points if all 3 present
            else:
                missing_required.append(section_key)
        
        # Check recommended sections (10 points total) - use fuzzy matching
        recommended_score = 0
        missing_recommended = []
        
        for section_key in ['summary', 'projects', 'certifications']:
            if has_section(section_key, section_names_lower):
                recommended_score += 4  # 12 points if all 3 present
            else:
                missing_recommended.append(section_key)
        
        total_score = min(35, required_score + recommended_score)
        
        return {
            'score': min(35, total_score),  # Max 35 points
            'missing_required': missing_required,
            'missing_recommended': missing_recommended,
        }


class FormattingAnalyzer:
    """Analyze resume formatting and structure."""
    
    @staticmethod
    def analyze_formatting(text: str, layout_type: str) -> Dict:
        """
        Analyze formatting quality.
        
        Args:
            text: Resume text
                layout_type: Layout type from parser
            
        Returns:
            Formatting analysis
        """
        score = 0
        issues = []
        
        # 1. Length check (5 points) - more lenient
        word_count = len(text.split())
        if 250 <= word_count <= 1000:
            score += 5
        elif 150 <= word_count <= 1200:
            score += 4
        elif word_count > 100:
            score += 3
        else:
            issues.append(f"Resume is very short ({word_count} words). Add more details.")
        
        # 2. Bullet points (5 points) - detect more patterns
        bullet_pattern = r'[•●○■□▪▫➤►▸-]\s|^\s*[-*]\s'
        bullets = len(re.findall(bullet_pattern, text, re.MULTILINE))
        if bullets >= 3:
            score += 5
        elif bullets >= 1:
            score += 4
        else:
            score += 2  # Give partial credit even without bullets
        
        # 3. Consistent formatting (5 points) - more generous
        lines = text.split('\n')
        consistent_lines = sum(1 for line in lines if line.strip())
        if consistent_lines > 15:
            score += 5
        elif consistent_lines > 10:
            score += 4
        else:
            score += 3
        
        # 4. Layout - modern ATS handles complex layouts fine
        if layout_type == 'single_column':
            score += 1  # Small bonus for simple layout
        # Remove penalty for complex layouts - modern ATS can handle them
        
        return {
            'score': max(0, min(15, score)),  # 0-15 points
            'word_count': word_count,
            'bullet_points': bullets,
            'layout_type': layout_type,
            'issues': issues,
        }


class QuantificationDetector:
    """Detect quantified achievements in resume."""
    
    @staticmethod
    def detect_quantified_bullets(text: str) -> Dict:
        """
        Detect bullets with numbers/percentages/metrics.
        
        Args:
            text: Resume text
            
        Returns:
            Quantification analysis
        """
        # Enhanced patterns for quantified achievements
        number_pattern = r'\b\d+[.,]?\d*\s*[%kKmMbBtT+xX×]?\b'
        percentage_pattern = r'\b\d+\.?\d*\s*%'
        money_pattern = r'[\$€£¥₹]\s*\d+[.,]?\d*[kKmMbBtT]?'
        metric_words = r'\b(increased|decreased|improved|reduced|grew|saved|generated|achieved|delivered)\s+by\s+\d+'
        
        numbers = len(re.findall(number_pattern, text))
        percentages = len(re.findall(percentage_pattern, text))
        money = len(re.findall(money_pattern, text))
        metrics = len(re.findall(metric_words, text, re.IGNORECASE))
        
        total_quantified = numbers + percentages + money + (metrics * 2)  # Weight metric words higher
        
        # More generous scoring: 0-10 points
        score = min(10, total_quantified * 0.8)  # Easier to get high score
        
        return {
            'score': score,
            'total_quantified': total_quantified,
            'numbers': numbers,
            'percentages': percentages,
            'money_mentions': money,
            'recommendation': 'Add more quantified achievements' if total_quantified < 5 else 'Good use of metrics',
        }


class ReadabilityAnalyzer:
    """Analyze text readability and clarity."""
    
    @staticmethod
    def calculate_readability(text: str) -> Dict:
        """
        Calculate readability score using simplified metrics.
        
        Args:
            text: Resume text
            
        Returns:
            Readability analysis
        """
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return {'score': 0, 'avg_sentence_length': 0, 'complex_words': 0}
        
        words = text.split()
        total_words = len(words)
        total_sentences = len(sentences)
        
        # Average sentence length
        avg_sentence_length = total_words / total_sentences if total_sentences > 0 else 0
        
        # Complex words (>3 syllables - rough estimate)
        complex_words = sum(1 for word in words if len(word) > 12)
        complex_ratio = complex_words / total_words if total_words > 0 else 0
        
        # Score based on ideal metrics
        score = 10
        
        # Penalize very long sentences
        if avg_sentence_length > 25:
            score -= 3
        elif avg_sentence_length > 20:
            score -= 1
        
        # Penalize too many complex words
        if complex_ratio > 0.2:
            score -= 2
        
        # Bonus for clear writing
        if 10 <= avg_sentence_length <= 20 and complex_ratio < 0.15:
            score += 2
        
        return {
            'score': max(0, min(10, score)),
            'avg_sentence_length': round(avg_sentence_length, 1),
            'complex_words': complex_words,
            'complex_ratio': round(complex_ratio, 3),
            'readability_level': 'Good' if score >= 8 else 'Fair' if score >= 5 else 'Needs Improvement',
        }


class LocalATSScorer:
    """Main local ATS scoring engine combining all analyzers."""
    
    def __init__(self):
        self.keyword_matcher = KeywordMatcher()
        self.section_analyzer = SectionAnalyzer()
        self.formatting_analyzer = FormattingAnalyzer()
        self.quantification_detector = QuantificationDetector()
        self.readability_analyzer = ReadabilityAnalyzer()
    
    def score_resume(
        self,
        parsed_data: Dict,
        job_description: Optional[str] = None
    ) -> Dict:
        """
        Calculate comprehensive ATS score for resume.
        
        Scoring breakdown:
        - Keywords: 30 points
        - Sections: 35 points
        - Formatting: 15 points
        - Quantification: 10 points
        - Readability: 10 points
        Total: 100 points
        
        Args:
            parsed_data: Parsed resume data from parser
            job_description: Optional job description for keyword matching
            
        Returns:
            Complete scoring report
        """
        resume_text = parsed_data.get('parsed_text', '')
        sections = parsed_data.get('sections', {})
        layout_type = parsed_data.get('layout_type', 'unknown')
        
        # Run all analyzers
        keyword_analysis = self.keyword_matcher.calculate_keyword_score(resume_text, job_description)
        section_analysis = self.section_analyzer.analyze_sections(sections)
        formatting_analysis = self.formatting_analyzer.analyze_formatting(resume_text, layout_type)
        quantification_analysis = self.quantification_detector.detect_quantified_bullets(resume_text)
        readability_analysis = self.readability_analyzer.calculate_readability(resume_text)
        
        # Calculate total score
        total_score = (
            keyword_analysis['score'] +
            section_analysis['score'] +
            formatting_analysis['score'] +
            quantification_analysis['score'] +
            readability_analysis['score']
        )
        
        # Generate improvement suggestions
        suggestions = self._generate_suggestions(
            keyword_analysis,
            section_analysis,
            formatting_analysis,
            quantification_analysis,
            readability_analysis
        )
        
        # Determine overall rating
        if total_score >= 80:
            rating = 'Excellent'
        elif total_score >= 70:
            rating = 'Good'
        elif total_score >= 60:
            rating = 'Fair'
        else:
            rating = 'Needs Improvement'
        
        return {
            'total_score': round(total_score, 1),
            'rating': rating,
            'breakdown': {
                'keywords': keyword_analysis,
                'sections': section_analysis,
                'formatting': formatting_analysis,
                'quantification': quantification_analysis,
                'readability': readability_analysis,
            },
            'suggestions': suggestions,
            'scored_at': datetime.now(timezone.utc).isoformat(),
            'scoring_method': 'local',
        }
    
    def _generate_suggestions(
        self,
        keyword_analysis: Dict,
        section_analysis: Dict,
        formatting_analysis: Dict,
        quantification_analysis: Dict,
        readability_analysis: Dict
    ) -> List[str]:
        """Generate actionable improvement suggestions."""
        suggestions = []
        
        # Keyword suggestions
        if keyword_analysis['score'] < 20:
            suggestions.append("⚠️ Add more relevant technical keywords and skills to improve ATS matching.")
        
        # Section suggestions
        if section_analysis['missing_required']:
            suggestions.append(f"⚠️ Add required sections: {', '.join(section_analysis['missing_required'])}")
        
        if section_analysis['missing_recommended']:
            suggestions.append(f"💡 Consider adding: {', '.join(section_analysis['missing_recommended'])}")
        
        # Formatting suggestions
        for issue in formatting_analysis.get('issues', []):
            suggestions.append(f"📝 {issue}")
        
        # Quantification suggestions
        if quantification_analysis['score'] < 5:
            suggestions.append("📊 Add more quantified achievements (numbers, percentages, metrics).")
        
        # Readability suggestions
        if readability_analysis['score'] < 7:
            suggestions.append("✍️ Simplify language - use shorter sentences and common words.")
        
        # Positive feedback
        if not suggestions:
            suggestions.append("✅ Your resume looks great! It should perform well in ATS systems.")
        
        return suggestions
