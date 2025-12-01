"""
Local ATS scoring engine - deterministic, offline scoring system.
Works without Gemini API as fallback or primary scorer.
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone


class KeywordMatcher:
    """Match keywords and calculate relevance scores."""
    
    # Common ATS keywords by category
    TECHNICAL_KEYWORDS = {
        'programming': ['python', 'java', 'javascript', 'c++', 'sql', 'react', 'node', 'django', 'flask'],
        'data': ['machine learning', 'data analysis', 'sql', 'tableau', 'power bi', 'excel', 'statistics'],
        'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins'],
        'soft_skills': ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical'],
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
        
        # Count technical keywords
        tech_count = 0
        tech_found = []
        
        for category, keywords in KeywordMatcher.TECHNICAL_KEYWORDS.items():
            for keyword in keywords:
                if keyword.lower() in resume_text_lower:
                    tech_count += 1
                    tech_found.append(keyword)
        
        # Score: 0-30 points based on technical keywords
        keyword_score = min(30, tech_count * 2)
        
        return {
            'score': keyword_score,
            'total_keywords': tech_count,
            'keywords_found': tech_found[:20],  # Top 20
            'categories_covered': len(set(tech_found)) // 3,  # Rough estimate
        }


class SectionAnalyzer:
    """Analyze presence and quality of resume sections."""
    
    REQUIRED_SECTIONS = ['experience', 'education', 'skills']
    RECOMMENDED_SECTIONS = ['summary', 'projects', 'certifications']
    
    @staticmethod
    def analyze_sections(sections: Dict[str, str]) -> Dict:
        """
        Analyze section presence and content quality.
        
        Args:
            sections: Dict of section_name -> content OR list of section objects
            
        Returns:
            Analysis with scores
        """
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
        
        # Required sections (20 points max)
        required_present = sum(1 for s in SectionAnalyzer.REQUIRED_SECTIONS if s in section_names)
        required_score = (required_present / len(SectionAnalyzer.REQUIRED_SECTIONS)) * 20
        
        # Recommended sections (10 points max)
        recommended_present = sum(1 for s in SectionAnalyzer.RECOMMENDED_SECTIONS if s in section_names)
        recommended_score = (recommended_present / len(SectionAnalyzer.RECOMMENDED_SECTIONS)) * 10
        
        # Content quality - check if sections have substantial content
        quality_bonus = 0
        for section in SectionAnalyzer.REQUIRED_SECTIONS:
            if section in sections:
                content = sections[section]
                if len(content) > 100:  # At least 100 chars
                    quality_bonus += 2
        
        total_score = required_score + recommended_score + quality_bonus
        
        return {
            'score': min(35, total_score),  # Max 35 points
            'required_sections': list(SectionAnalyzer.REQUIRED_SECTIONS),
            'required_present': required_present,
            'recommended_sections': list(SectionAnalyzer.RECOMMENDED_SECTIONS),
            'recommended_present': recommended_present,
            'missing_required': [s for s in SectionAnalyzer.REQUIRED_SECTIONS if s not in section_names],
            'missing_recommended': [s for s in SectionAnalyzer.RECOMMENDED_SECTIONS if s not in section_names],
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
        
        # 1. Length check (5 points)
        word_count = len(text.split())
        if 300 <= word_count <= 800:
            score += 5
        elif 200 <= word_count <= 1000:
            score += 3
        else:
            issues.append(f"Resume length not optimal ({word_count} words). Aim for 300-800.")
        
        # 2. Bullet points (5 points)
        bullet_pattern = r'[•●○■□▪▫-]\s'
        bullets = len(re.findall(bullet_pattern, text))
        if bullets >= 5:
            score += 5
        elif bullets >= 3:
            score += 3
        else:
            issues.append("Few or no bullet points found. Use bullets for achievements.")
        
        # 3. Consistent formatting (5 points)
        lines = text.split('\n')
        consistent_lines = sum(1 for line in lines if line.strip())
        if consistent_lines > 20:
            score += 5
        else:
            score += 2
        
        # 4. Layout penalty for complex multi-column
        if layout_type == 'complex':
            score -= 2
            issues.append("Complex layout may not parse well in ATS systems.")
        elif layout_type == 'single_column':
            score += 2  # Bonus for simple layout
        
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
        # Patterns for quantified achievements
        number_pattern = r'\b\d+[.,]?\d*\s*[%kKmMbB]?\b'
        percentage_pattern = r'\b\d+\.?\d*\s*%'
        money_pattern = r'[\$€£]\s*\d+[.,]?\d*[kKmMbB]?'
        
        numbers = len(re.findall(number_pattern, text))
        percentages = len(re.findall(percentage_pattern, text))
        money = len(re.findall(money_pattern, text))
        
        total_quantified = numbers + percentages + money
        
        # Score: 0-10 points
        score = min(10, total_quantified)
        
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
