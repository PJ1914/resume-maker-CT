from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class QuestionType(str):
    TECHNICAL = "technical"
    HR = "hr"
    BOTH = "both"

class QAPair(BaseModel):
    q: str
    a: str

class InterviewGenerateRequest(BaseModel):
    resume_id: str
    role: str
    experience_level: str
    question_types: List[str] = Field(default=["technical", "hr"])

class InterviewSession(BaseModel):
    id: Optional[str] = None
    user_id: str
    resume_id: str
    role: str
    experience_level: str
    technical_questions: List[QAPair] = []
    hr_questions: List[QAPair] = []
    created_at: datetime
    credits_used: int
