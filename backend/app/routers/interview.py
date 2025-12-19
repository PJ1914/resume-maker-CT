from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.services.interview_service import InterviewService
from app.schemas.interview import InterviewGenerateRequest
from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, get_user_credits
import logging

router = APIRouter(prefix="/api/interview", tags=["Interview Prep"])
logger = logging.getLogger(__name__)

@router.post("/generate")
async def generate_interview(
    request: InterviewGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate interview questions and answers based on resume and role.
    """
    user_id = current_user['uid']
    
    # 1. Credit Check
    if not has_sufficient_credits(user_id, FeatureType.INTERVIEW_GENERATE_SESSION):
        balance_data = get_user_credits(user_id)
        balance = balance_data.get('balance', 0)
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED, 
            detail={
                "message": "Insufficient credits",
                "required": 3,
                "balance": balance
            }
        )

    try:
        # 2. Generation & Session Creation
        session = await InterviewService.generate_session(
            user_id=user_id, 
            resume_id=request.resume_id,
            role=request.role,
            exp_level=request.experience_level,
            q_types=request.question_types
        )
        
        # 3. Save Session
        session_id = InterviewService.save_session(session)
        
        # 4. Deduct Credits
        deduct_credits(user_id, FeatureType.INTERVIEW_GENERATE_SESSION, f"Generated Interview for {request.role}")
        
        return {
            "session_id": session_id,
            "technical": session.technical_questions,
            "hr": session.hr_questions,
            "credits_used": session.credits_used
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Interview generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.post("/deduct-export-credit")
async def deduct_export_credit(
    current_user: dict = Depends(get_current_user)
):
    """
    Deduct credit for client-side PDF export.
    """
    user_id = current_user['uid']
    if not has_sufficient_credits(user_id, FeatureType.INTERVIEW_EXPORT_PDF):
         raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Insufficient credits")
    
    deduct_credits(user_id, FeatureType.INTERVIEW_EXPORT_PDF, "Interview Q&A PDF Export")
    return {"success": True}

@router.get("/session/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve a past interview session.
    """
    user_id = current_user['uid']
    session_data = InterviewService.get_session(user_id, session_id)
    
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return session_data

@router.get("/history")
async def get_history(
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve all past interview sessions for the user.
    """
    user_id = current_user['uid']
    sessions = InterviewService.get_user_sessions(user_id)
    return sessions
