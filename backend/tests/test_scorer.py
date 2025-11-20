"""
Unit tests for local ATS scoring engine.
Tests all scoring components offline without external dependencies.
"""

import pytest
from app.services.scorer import (
    KeywordMatcher,
    SectionAnalyzer,
    FormattingAnalyzer,
    QuantificationDetector,
    ReadabilityAnalyzer,
    LocalATSScorer
)


class TestKeywordMatcher:
    """Test keyword matching functionality."""
    
    def test_calculate_keyword_score_with_keywords(self):
        """Test scoring with technical keywords present."""
        resume_text = """
        Senior Software Engineer with expertise in Python, JavaScript, React, and Node.js.
        Experience with AWS, Docker, and Kubernetes. Strong background in machine learning
        and data analysis using SQL and Tableau.
        """
        
        result = KeywordMatcher.calculate_keyword_score(resume_text)
        
        assert result['score'] > 0
        assert result['total_keywords'] > 5
        assert len(result['keywords_found']) > 0
        assert 'python' in result['keywords_found'] or 'javascript' in result['keywords_found']
    
    def test_calculate_keyword_score_empty(self):
        """Test scoring with no keywords."""
        resume_text = "Hello world."
        
        result = KeywordMatcher.calculate_keyword_score(resume_text)
        
        assert result['score'] >= 0
        assert result['total_keywords'] >= 0
    
    def test_extract_keywords(self):
        """Test keyword extraction."""
        text = "Python developer with React experience"
        
        keywords = KeywordMatcher.extract_keywords(text)
        
        assert len(keywords) > 0
        assert any('python' in k for k in keywords)


class TestSectionAnalyzer:
    """Test section analysis functionality."""
    
    def test_analyze_sections_all_required(self):
        """Test with all required sections present."""
        sections = {
            'experience': 'Work experience content here...',
            'education': 'Degree information...',
            'skills': 'Python, JavaScript, React...',
            'summary': 'Professional summary...',
        }
        
        result = SectionAnalyzer.analyze_sections(sections)
        
        assert result['score'] > 20  # Should get points for required sections
        assert result['required_present'] == 3
        assert len(result['missing_required']) == 0
    
    def test_analyze_sections_missing_required(self):
        """Test with missing required sections."""
        sections = {
            'summary': 'Just a summary...',
        }
        
        result = SectionAnalyzer.analyze_sections(sections)
        
        assert result['score'] < 20
        assert result['required_present'] < 3
        assert len(result['missing_required']) > 0
        assert 'experience' in result['missing_required']
    
    def test_analyze_sections_with_recommended(self):
        """Test scoring includes recommended sections."""
        sections = {
            'experience': 'Work experience...',
            'education': 'Degree...',
            'skills': 'Skills...',
            'projects': 'Project details...',
            'certifications': 'AWS Certified...',
        }
        
        result = SectionAnalyzer.analyze_sections(sections)
        
        assert result['score'] > 25  # Required + recommended bonus
        assert result['recommended_present'] > 0


class TestFormattingAnalyzer:
    """Test formatting analysis."""
    
    def test_analyze_formatting_good_length(self):
        """Test with optimal resume length."""
        # Generate text with ~500 words
        text = ' '.join(['word'] * 500)
        
        result = FormattingAnalyzer.analyze_formatting(text, 'single_column')
        
        assert result['score'] > 0
        assert result['word_count'] == 500
    
    def test_analyze_formatting_with_bullets(self):
        """Test detection of bullet points."""
        text = """
        Experience:
        • Developed web applications using React
        • Implemented RESTful APIs with FastAPI
        • Managed AWS infrastructure
        • Led team of 5 developers
        """
        
        result = FormattingAnalyzer.analyze_formatting(text, 'single_column')
        
        assert result['bullet_points'] >= 4
        assert result['score'] > 5
    
    def test_analyze_formatting_layout_penalty(self):
        """Test penalty for complex layouts."""
        text = ' '.join(['word'] * 400)
        
        result_complex = FormattingAnalyzer.analyze_formatting(text, 'complex')
        result_simple = FormattingAnalyzer.analyze_formatting(text, 'single_column')
        
        assert result_simple['score'] >= result_complex['score']
        assert 'Complex layout' in ' '.join(result_complex['issues'])


class TestQuantificationDetector:
    """Test quantification detection."""
    
    def test_detect_quantified_bullets_with_numbers(self):
        """Test detection of quantified achievements."""
        text = """
        • Increased sales by 45%
        • Managed team of 12 engineers
        • Reduced costs by $50K annually
        • Improved performance by 3x
        • Processed 1M+ transactions daily
        """
        
        result = QuantificationDetector.detect_quantified_bullets(text)
        
        assert result['score'] > 5
        assert result['total_quantified'] > 3
        assert result['percentages'] >= 1
    
    def test_detect_quantified_bullets_no_numbers(self):
        """Test with no quantification."""
        text = """
        • Developed web applications
        • Worked with clients
        • Improved processes
        """
        
        result = QuantificationDetector.detect_quantified_bullets(text)
        
        assert result['score'] >= 0
        assert 'Add more quantified' in result['recommendation']
    
    def test_detect_money_patterns(self):
        """Test money pattern detection."""
        text = "Saved $100K in costs, increased revenue by $2.5M"
        
        result = QuantificationDetector.detect_quantified_bullets(text)
        
        assert result['money_mentions'] >= 2


class TestReadabilityAnalyzer:
    """Test readability analysis."""
    
    def test_calculate_readability_good(self):
        """Test with good readability."""
        text = """
        I am a software engineer. I work with Python and React.
        I have five years of experience. I build web applications.
        """
        
        result = ReadabilityAnalyzer.calculate_readability(text)
        
        assert result['score'] > 0
        assert result['avg_sentence_length'] > 0
        assert result['readability_level'] in ['Good', 'Fair', 'Needs Improvement']
    
    def test_calculate_readability_long_sentences(self):
        """Test penalty for very long sentences."""
        # Create very long sentence
        text = "I am a " + " and ".join(['experienced'] * 30) + " software engineer."
        
        result = ReadabilityAnalyzer.calculate_readability(text)
        
        assert result['avg_sentence_length'] > 20
    
    def test_calculate_readability_empty(self):
        """Test with empty text."""
        result = ReadabilityAnalyzer.calculate_readability("")
        
        assert result['score'] == 0


class TestLocalATSScorer:
    """Test complete local ATS scorer."""
    
    @pytest.fixture
    def sample_parsed_data(self):
        """Sample parsed resume data."""
        return {
            'parsed_text': """
            John Doe
            Software Engineer
            
            EXPERIENCE:
            • Developed web applications using React and Node.js
            • Increased performance by 50%
            • Managed team of 5 developers
            • Reduced costs by $100K annually
            
            EDUCATION:
            Bachelor of Science in Computer Science
            University of Technology, 2018
            
            SKILLS:
            Python, JavaScript, React, Node.js, AWS, Docker, SQL
            
            PROJECTS:
            Built e-commerce platform serving 10K+ users
            """,
            'sections': {
                'experience': 'Work experience...',
                'education': 'Degree information...',
                'skills': 'Python, JavaScript...',
                'projects': 'Project details...',
            },
            'layout_type': 'single_column',
            'contact_info': {
                'email': 'john@example.com',
                'phone': '123-456-7890',
            },
            'skills': ['Python', 'JavaScript', 'React', 'Node.js'],
        }
    
    def test_score_resume_complete(self, sample_parsed_data):
        """Test complete resume scoring."""
        scorer = LocalATSScorer()
        
        result = scorer.score_resume(sample_parsed_data)
        
        assert 'total_score' in result
        assert 0 <= result['total_score'] <= 100
        assert 'rating' in result
        assert result['rating'] in ['Excellent', 'Good', 'Fair', 'Needs Improvement']
        assert 'breakdown' in result
        assert 'suggestions' in result
        assert 'scored_at' in result
        assert result['scoring_method'] == 'local'
    
    def test_score_resume_breakdown(self, sample_parsed_data):
        """Test scoring breakdown components."""
        scorer = LocalATSScorer()
        
        result = scorer.score_resume(sample_parsed_data)
        breakdown = result['breakdown']
        
        assert 'keywords' in breakdown
        assert 'sections' in breakdown
        assert 'formatting' in breakdown
        assert 'quantification' in breakdown
        assert 'readability' in breakdown
        
        # Each component should have a score
        assert breakdown['keywords']['score'] >= 0
        assert breakdown['sections']['score'] >= 0
        assert breakdown['formatting']['score'] >= 0
        assert breakdown['quantification']['score'] >= 0
        assert breakdown['readability']['score'] >= 0
    
    def test_score_resume_suggestions(self, sample_parsed_data):
        """Test suggestion generation."""
        scorer = LocalATSScorer()
        
        result = scorer.score_resume(sample_parsed_data)
        
        assert isinstance(result['suggestions'], list)
        assert len(result['suggestions']) > 0
    
    def test_score_resume_rating_thresholds(self):
        """Test rating thresholds."""
        scorer = LocalATSScorer()
        
        # High score data
        excellent_data = {
            'parsed_text': ' '.join(['python javascript react aws docker'] * 100),
            'sections': {
                'experience': 'x' * 200,
                'education': 'x' * 200,
                'skills': 'x' * 200,
                'summary': 'x' * 200,
                'projects': 'x' * 200,
            },
            'layout_type': 'single_column',
        }
        
        result = scorer.score_resume(excellent_data)
        
        # Should get a decent score with all sections + keywords
        assert result['total_score'] > 50
    
    def test_score_resume_with_job_description(self, sample_parsed_data):
        """Test scoring with job description."""
        scorer = LocalATSScorer()
        
        job_desc = "Looking for Python developer with React experience"
        
        result = scorer.score_resume(sample_parsed_data, job_description=job_desc)
        
        assert result['total_score'] >= 0
        # Job description currently not heavily weighted in local scorer
    
    def test_score_minimal_resume(self):
        """Test scoring minimal/poor resume."""
        scorer = LocalATSScorer()
        
        minimal_data = {
            'parsed_text': 'Just a name.',
            'sections': {},
            'layout_type': 'unknown',
        }
        
        result = scorer.score_resume(minimal_data)
        
        assert result['total_score'] < 40  # Should score poorly
        assert result['rating'] in ['Needs Improvement', 'Fair']
        assert len(result['suggestions']) > 0


class TestScorerEdgeCases:
    """Test edge cases and error handling."""
    
    def test_empty_parsed_data(self):
        """Test with empty parsed data."""
        scorer = LocalATSScorer()
        
        empty_data = {
            'parsed_text': '',
            'sections': {},
            'layout_type': '',
        }
        
        result = scorer.score_resume(empty_data)
        
        assert result['total_score'] >= 0
        assert isinstance(result['suggestions'], list)
    
    def test_missing_keys_in_parsed_data(self):
        """Test with missing keys in parsed data."""
        scorer = LocalATSScorer()
        
        incomplete_data = {
            'parsed_text': 'Some text',
        }
        
        # Should handle gracefully with defaults
        result = scorer.score_resume(incomplete_data)
        
        assert 'total_score' in result
        assert result['total_score'] >= 0
    
    def test_special_characters_in_text(self):
        """Test handling of special characters."""
        scorer = LocalATSScorer()
        
        data = {
            'parsed_text': '!@#$%^&*() Special chars everywhere! 😀 Unicode too!',
            'sections': {},
            'layout_type': 'single_column',
        }
        
        result = scorer.score_resume(data)
        
        assert 'total_score' in result
        # Should not crash on special chars
