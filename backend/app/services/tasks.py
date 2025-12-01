"""
Background task processing for resume parsing and scoring.
"""

import asyncio
from typing import Optional
from app.services.extractor import ResumeExtractor
from app.services.gemini_parser import HybridResumeParser
from app.services.gemini_scorer import HybridScorer
from app.services.firestore import (
    get_resume_metadata,
    update_resume_status,
    update_resume_parsed_data_sync,
    update_resume_score_data_sync
)
from app.services.storage import get_file_content
from app.schemas.resume import ResumeStatus
import logging

logger = logging.getLogger(__name__)


def process_resume_parsing(
    resume_id: str,
    uid: str,
    storage_path: str,
    content_type: str,
    filename: str = ''
):
    """
    Background task to parse uploaded resume.
    
    Steps:
    1. Update status to PARSING
    2. Download file from storage
    3. Extract text (with LaTeX detection)
    4. Parse and normalize
    5. Update Firestore with parsed data
    6. Update status to PARSED
    
    Args:
        resume_id: Resume ID
        uid: User ID
        storage_path: Firebase Storage path
        content_type: File MIME type
        filename: Original filename (for format detection)
    """
    try:
        logger.info(f"Starting parsing for resume {resume_id}")
        
        # Update status to PARSING
        update_resume_status(resume_id, uid, ResumeStatus.PARSING)
        
        # Download file content from storage (sync version)
        from app.services.storage import get_file_content_sync
        file_content = get_file_content_sync(storage_path)
        
        if not file_content:
            raise Exception("Failed to download file from storage")
        
        # Extract text from file with LaTeX detection
        extractor = ResumeExtractor()
        
        # Use extract_with_latex_detection for better format handling
        extraction_result = extractor.extract_with_latex_detection(
            file_content, 
            content_type,
            filename=filename
        )
        
        raw_text = extraction_result.get('text', '')
        structured_data = extraction_result.get('structured_data')  # From LaTeX parser
        is_latex = extraction_result.get('is_latex', False)
        hyperlinks = extraction_result.get('hyperlinks', [])  # From PDF extraction
        
        if not raw_text or len(raw_text.strip()) < 50:
            raise Exception("Extracted text is too short or empty")
        
        logger.info(f"Resume {resume_id}: Extracted {len(raw_text)} chars, LaTeX: {is_latex}, Hyperlinks: {len(hyperlinks)}")
        
        # Parse text using Gemini AI (with fallback)
        parser = HybridResumeParser()
        parsed_data = parser.parse(
            raw_text,
            metadata={
                'content_type': content_type,
                'filename': filename,
                'extraction_metadata': extraction_result.get('metadata', {}),
                'extraction_method': extraction_result.get('extraction_method'),
                'num_pages': extraction_result.get('num_pages'),
                'is_latex': is_latex,
            },
            structured_data=structured_data,
            hyperlinks=hyperlinks
        )
        
        # Debug: Log what Gemini returned
        logger.info(f"🤖 Gemini parsed data for {resume_id}:")
        logger.info(f"   contact_info: {parsed_data.get('contact_info', {}).get('name', 'N/A')}")
        logger.info(f"   experience: {len(parsed_data.get('experience', []))} items")
        logger.info(f"   projects: {len(parsed_data.get('projects', []))} items")
        logger.info(f"   education: {len(parsed_data.get('education', []))} items")
        logger.info(f"   sections: {len(parsed_data.get('sections', []))} items")
        logger.info(f"   parsing_method: {parsed_data.get('parsing_method', 'unknown')}")
        
        # Update Firestore with parsed data (sync version)
        update_resume_parsed_data_sync(resume_id, uid, parsed_data)
        
        # Update status to PARSED
        update_resume_status(resume_id, uid, ResumeStatus.PARSED)
        
        logger.info(f"Parsing completed for resume {resume_id}")
        
        # Continue with scoring
        process_resume_scoring(resume_id, uid, parsed_data)
        
    except Exception as e:
        logger.error(f"Parsing failed for resume {resume_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Update status to ERROR
        try:
            update_resume_status(
                resume_id,
                uid,
                ResumeStatus.ERROR,
                error_message=f"Parsing failed: {str(e)}"
            )
        except Exception as update_error:
            logger.error(f"Failed to update error status: {str(update_error)}")


def process_resume_scoring(
    resume_id: str,
    uid: str,
    parsed_data: dict,
    job_description: Optional[str] = None
):
    """
    Background task to score parsed resume.
    
    Steps:
    1. Update status to SCORING
    2. Run hybrid scorer (Gemini + local fallback)
    3. Update Firestore with score data
    4. Update status to SCORED
    
    Args:
        resume_id: Resume ID
        uid: User ID
        parsed_data: Parsed resume data
        job_description: Optional job description for matching
    """
    try:
        logger.info(f"Starting scoring for resume {resume_id}")
        
        # Update status to SCORING
        update_resume_status(resume_id, uid, ResumeStatus.SCORING)
        
        # Score resume using hybrid scorer
        scorer = HybridScorer()
        score_data = scorer.score_resume(parsed_data, job_description)
        
        # Log to audit (sync version)
        from app.services.audit import log_scoring_request_sync
        try:
            log_scoring_request_sync(
                resume_id=resume_id,
                user_id=uid,
                scoring_method=score_data.get('scoring_method', 'local'),
                job_description_provided=job_description is not None,
                cache_hit=False,
                total_score=score_data.get('total_score'),
                rating=score_data.get('rating'),
                tokens_used=score_data.get('tokens_used'),
                model_used=score_data.get('model_name'),
                success=True
            )
        except Exception as audit_error:
            logger.warning(f"Failed to log audit: {audit_error}")
        
        # Update Firestore with score data (sync version)
        update_resume_score_data_sync(resume_id, uid, score_data)
        
        # Update status to SCORED
        update_resume_status(resume_id, uid, ResumeStatus.SCORED)
        
        logger.info(f"Scoring completed for resume {resume_id}. Score: {score_data.get('total_score')}")
        
    except Exception as e:
        logger.error(f"Scoring failed for resume {resume_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Log error to audit (sync version)
        from app.services.audit import log_scoring_request_sync
        try:
            log_scoring_request_sync(
                resume_id=resume_id,
                user_id=uid,
                scoring_method='unknown',
                job_description_provided=job_description is not None,
                cache_hit=False,
                success=False,
                error_message=str(e)
            )
        except Exception as audit_error:
            logger.warning(f"Failed to log audit error: {audit_error}")
        
        # Don't mark as ERROR - parsing succeeded
        # Just log the scoring failure
        try:
            update_resume_status(
                resume_id,
                uid,
                ResumeStatus.PARSED,  # Keep as PARSED since scoring is optional
                error_message=f"Scoring failed: {str(e)}"
            )
        except Exception as update_error:
            logger.error(f"Failed to update status: {str(update_error)}")

