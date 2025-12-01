from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Union
from datetime import datetime
from enum import Enum

class ResumeStatus(str, Enum):
    """Resume processing status"""
    UPLOADED = "uploaded"
    PARSING = "parsing"
    PARSED = "parsed"
    SCORING = "scoring"
    SCORED = "scored"
    ERROR = "error"

class ResumeFileType(str, Enum):
    """Supported resume file types"""
    PDF = "application/pdf"
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    DOC = "application/msword"
    TEX = "application/x-tex"
    TEX_ALT = "text/x-tex"
    PLAIN = "text/plain"  # For .tex files that might come as text/plain

class UploadUrlRequest(BaseModel):
    """Request for presigned upload URL"""
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., description="MIME type of the file")
    file_size: int = Field(..., gt=0, le=10_485_760, description="File size in bytes (max 10MB)")

class UploadUrlResponse(BaseModel):
    """Response with presigned upload URL"""
    upload_url: str
    resume_id: str
    storage_path: str
    expires_in: int = 3600  # seconds

class UploadCallbackRequest(BaseModel):
    """Notification that upload is complete"""
    resume_id: str
    storage_path: str

# New models for wizard resume creation
class ContactInfo(BaseModel):
    """Contact information"""
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None

class ExperienceEntry(BaseModel):
    """Work experience entry"""
    id: Optional[str] = None
    company: str
    position: str
    title: Optional[str] = None
    location: Optional[str] = None
    startDate: str
    endDate: Optional[str] = None
    description: Optional[str] = None

class EducationEntry(BaseModel):
    """Education entry"""
    id: Optional[str] = None
    school: str
    degree: str
    field: Optional[str] = None
    location: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    gpa: Optional[str] = None
    description: Optional[str] = None

class SkillsData(BaseModel):
    """Skills data"""
    technical: List[str] = []
    soft: List[str] = []

class ProjectEntry(BaseModel):
    """Project entry"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    url: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None

class CertificationEntry(BaseModel):
    """Certification entry"""
    id: Optional[str] = None
    name: str
    issuer: str
    date: Optional[str] = None
    credentialId: Optional[str] = None
    url: Optional[str] = None

class AchievementEntry(BaseModel):
    """Achievement entry"""
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    date: Optional[str] = None

class CreateResumeRequest(BaseModel):
    """Request to create resume from wizard data"""
    template: Optional[str] = "modern"  # Template ID: modern, classic, minimalist, or custom_xxxxx
    contact: ContactInfo
    summary: str
    experience: List[ExperienceEntry] = []
    education: List[EducationEntry] = []
    skills: SkillsData
    projects: List[ProjectEntry] = []
    certifications: List[CertificationEntry] = []
    achievements: List[AchievementEntry] = []

class ResumeMetadata(BaseModel):
    """Resume metadata stored in Firestore"""
    resume_id: str
    owner_uid: str
    filename: str
    original_filename: str
    content_type: str
    file_size: int
    storage_path: str
    storage_url: Optional[str] = None
    status: ResumeStatus = ResumeStatus.UPLOADED
    created_at: datetime
    updated_at: datetime
    template: Optional[str] = "modern"  # Template ID used for this resume
    
    # Parsing results (populated after parsing)
    parsed_text: Optional[str] = None
    contact_info: Optional[dict] = None
    skills: Optional[dict] = None  # Changed from Optional[list] to Optional[dict]
    sections: Optional[Any] = None  # Dynamic sections - can be list or dict for backwards compatibility
    experience: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None
    achievements: Optional[List[dict]] = None
    layout_type: Optional[str] = None
    parsed_at: Optional[datetime] = None
    
    # Scoring results (populated after scoring)
    latest_score: Optional[float] = None
    latest_score_id: Optional[str] = None
    
    # Error tracking
    error_message: Optional[str] = None
    
    @field_validator('sections', mode='before')
    @classmethod
    def convert_sections(cls, v):
        """Convert dict to list or keep as list for backwards compatibility"""
        if v is None:
            return []
        if isinstance(v, dict):
            # Old format was dict, convert to empty list
            return []
        if isinstance(v, list):
            return v
        return []

class ResumeListItem(BaseModel):
    """Resume item in list view"""
    resume_id: str
    filename: str
    original_filename: str
    file_size: int
    status: ResumeStatus
    created_at: datetime
    latest_score: Optional[float] = None
    
class ResumeListResponse(BaseModel):
    """List of user's resumes"""
    resumes: List[ResumeListItem]
    total: int

class ResumeDetailResponse(BaseModel):
    """Detailed resume information"""
    resume_id: str
    filename: str
    original_filename: str
    content_type: str
    file_size: int
    storage_url: Optional[str] = None
    status: ResumeStatus
    created_at: datetime
    updated_at: datetime
    parsed_text: Optional[str] = None
    contact_info: Optional[dict] = None
    skills: Optional[dict] = None  # Changed from Optional[list] to Optional[dict]
    sections: Optional[Any] = None  # Dynamic sections - can be list or dict for backwards compatibility
    experience: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None
    achievements: Optional[List[dict]] = None
    layout_type: Optional[str] = None
    parsed_at: Optional[datetime] = None
    latest_score: Optional[float] = None
    template: Optional[str] = "modern"
    error_message: Optional[str] = None
    
    @field_validator('sections', mode='before')
    @classmethod
    def convert_sections(cls, v):
        """Convert dict to list or keep as list for backwards compatibility"""
        if v is None:
            return []
        if isinstance(v, dict):
            # Old format was dict, convert to empty list
            return []
        if isinstance(v, list):
            return v
        return []
