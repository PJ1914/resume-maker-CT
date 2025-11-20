"""
Resume upload and management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from datetime import datetime
from app.dependencies import get_current_user
from app.schemas.resume import (
    UploadUrlRequest,
    UploadUrlResponse,
    UploadCallbackRequest,
    ResumeListResponse,
    ResumeDetailResponse,
    ResumeMetadata,
    ResumeStatus,
    ResumeFileType,
    CreateResumeRequest,
)
from app.services.storage import (
    generate_resume_id,
    get_storage_path,
    generate_signed_upload_url,
    generate_signed_download_url,
    delete_file,
)
from app.services.firestore import (
    save_resume_metadata,
    get_resume_metadata,
    list_user_resumes,
    update_resume_status,
    delete_resume_metadata,
)
from app.services.tasks import process_resume_parsing, trigger_resume_parsing

router = APIRouter()

# File validation constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = [
    ResumeFileType.PDF.value,
    ResumeFileType.DOCX.value,
    ResumeFileType.DOC.value,
]

@router.get("/health")
async def resume_health_check():
    """Health check for resume router"""
    return {"status": "ok", "service": "resumes"}

@router.post("/upload-url", response_model=UploadUrlResponse)
async def request_upload_url(
    request: UploadUrlRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Request a presigned URL for uploading a resume file.
    
    This endpoint generates a secure, time-limited URL that the client
    can use to upload a file directly to Firebase Storage.
    """
    # Validate file type
    if request.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )
    
    # Validate file size
    if request.file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Generate resume ID and storage path
    user_id = current_user["uid"]
    resume_id = generate_resume_id()
    storage_path = get_storage_path(user_id, resume_id, request.filename)
    
    # Generate presigned upload URL
    try:
        upload_url = generate_signed_upload_url(
            storage_path=storage_path,
            content_type=request.content_type,
            expires_minutes=60
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate upload URL: {str(e)}"
        )
    
    # Create initial metadata (status: UPLOADED will be set after callback)
    metadata = ResumeMetadata(
        resume_id=resume_id,
        owner_uid=user_id,
        filename=request.filename,
        original_filename=request.filename,
        content_type=request.content_type,
        file_size=request.file_size,
        storage_path=storage_path,
        status=ResumeStatus.UPLOADED,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    # Save metadata to Firestore
    if not save_resume_metadata(metadata):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume metadata"
        )
    
    return UploadUrlResponse(
        upload_url=upload_url,
        resume_id=resume_id,
        storage_path=storage_path,
        expires_in=3600
    )

@router.post("/upload-callback")
async def upload_callback(
    request: UploadCallbackRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Callback after successful file upload.
    
    Triggers background processing: parsing, scoring, etc.
    """
    user_id = current_user["uid"]
    
    # Verify resume exists and belongs to user
    metadata = get_resume_metadata(request.resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Trigger parsing in background
    background_tasks.add_task(
        process_resume_parsing,
        resume_id=request.resume_id,
        uid=user_id,
        storage_path=request.storage_path,
        content_type=metadata.content_type
    )
    
    return {"message": "Upload confirmed, processing started", "resume_id": request.resume_id}


@router.post("/upload-direct")
async def upload_direct(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(get_current_user)
):
    """
    Direct file upload through backend (avoids CORS issues).
    
    This endpoint receives the file from the frontend and uploads it
    to Firebase Storage server-side, eliminating CORS complications.
    """
    # Validate file type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )
    
    # Read file content
    try:
        content = await file.read()
        file_size = len(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Generate resume ID and storage path
    user_id = current_user["uid"]
    resume_id = generate_resume_id()
    storage_path = get_storage_path(user_id, resume_id, file.filename or "resume.pdf")
    
    # Upload to Firebase Storage
    try:
        from app.firebase import resume_maker_app
        from firebase_admin import storage
        
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        blob.upload_from_string(
            content,
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
    
    # Create metadata
    metadata = ResumeMetadata(
        resume_id=resume_id,
        owner_uid=user_id,
        filename=file.filename or "resume.pdf",
        original_filename=file.filename or "resume.pdf",
        content_type=file.content_type or "application/pdf",
        file_size=file_size,
        storage_path=storage_path,
        status=ResumeStatus.UPLOADED,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    # Save metadata
    if not save_resume_metadata(metadata):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume metadata"
        )
    
    # Trigger parsing in background
    background_tasks.add_task(
        process_resume_parsing,
        resume_id=resume_id,
        uid=user_id,
        storage_path=storage_path,
        content_type=file.content_type or "application/pdf"
    )
    
    return {
        "message": "File uploaded successfully",
        "resume_id": resume_id,
        "storage_path": storage_path
    }


@router.post("/create")
async def create_resume(
    request: CreateResumeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new resume from wizard-entered data.
    
    This endpoint saves resume data entered through the wizard form
    directly to Firestore without file upload.
    """
    user_id = current_user["uid"]
    resume_id = generate_resume_id()
    
    try:
        print(f"Creating resume for user: {user_id}")
        print(f"Resume ID: {resume_id}")
        print(f"Contact name: {request.contact.name}")
        
        # Build sections dict safely
        sections = {
            'contact': {
                'name': request.contact.name,
                'email': request.contact.email,
                'phone': request.contact.phone,
                'location': request.contact.location,
                'linkedin': request.contact.linkedin,
                'website': request.contact.website,
            },
            'summary': request.summary,
            'experience': [
                {
                    'company': e.company,
                    'position': e.position,
                    'title': e.title,
                    'location': e.location,
                    'startDate': e.startDate,
                    'endDate': e.endDate,
                    'description': e.description,
                }
                for e in request.experience
            ],
            'education': [
                {
                    'school': e.school,
                    'degree': e.degree,
                    'field': e.field,
                    'location': e.location,
                    'startDate': e.startDate,
                    'endDate': e.endDate,
                    'gpa': e.gpa,
                    'description': e.description,
                }
                for e in request.education
            ],
            'projects': [
                {
                    'name': p.name,
                    'description': p.description,
                    'technologies': p.technologies,
                    'url': p.url,
                    'startDate': p.startDate,
                    'endDate': p.endDate,
                }
                for p in request.projects
            ],
        }
        
        # Create metadata for the new resume
        metadata = ResumeMetadata(
            resume_id=resume_id,
            owner_uid=user_id,
            filename=f"{request.contact.name}.json",
            original_filename=f"{request.contact.name}.json",
            content_type="application/json",
            file_size=0,
            storage_path="",
            status=ResumeStatus.PARSED,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            parsed_text=request.summary,
            contact_info={
                'name': request.contact.name,
                'email': request.contact.email,
                'phone': request.contact.phone,
                'location': request.contact.location,
                'linkedin': request.contact.linkedin,
                'website': request.contact.website,
            },
            skills={
                'technical': request.skills.technical,
                'soft': request.skills.soft,
            },
            sections=sections
        )
        
        print(f"Metadata created successfully")
        
        # Save metadata to Firestore
        if not save_resume_metadata(metadata):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save resume data to Firestore"
            )
        
        print(f"Resume saved successfully")
        
        return {
            "status": "success",
            "message": "Resume created successfully",
            "resume_id": resume_id
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error creating resume: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create resume: {str(e)}"
        )


@router.get("/resumes", response_model=ResumeListResponse)
async def list_resumes(
    current_user: dict = Depends(get_current_user),
    limit: int = 50
):
    """
    List all resumes for the current user.
    """
    user_id = current_user["uid"]
    resumes = list_user_resumes(user_id, limit=limit)
    
    return ResumeListResponse(
        resumes=resumes,
        total=len(resumes)
    )

@router.get("/resumes/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific resume.
    """
    user_id = current_user["uid"]
    
    try:
        metadata = get_resume_metadata(resume_id, user_id)
        
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Generate download URL if needed
        storage_url = None
        if metadata.storage_path:
            storage_url = generate_signed_download_url(metadata.storage_path)
        
        return ResumeDetailResponse(
            resume_id=metadata.resume_id,
            filename=metadata.filename,
            original_filename=metadata.original_filename,
            content_type=metadata.content_type,
            file_size=metadata.file_size,
            storage_url=storage_url,
            status=metadata.status,
            created_at=metadata.created_at,
            updated_at=metadata.updated_at,
            parsed_text=metadata.parsed_text,
            contact_info=metadata.contact_info,
            skills=metadata.skills,
            sections=metadata.sections,
            layout_type=metadata.layout_type,
            parsed_at=metadata.parsed_at,
            latest_score=metadata.latest_score,
            error_message=metadata.error_message,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting resume: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get resume: {str(e)}"
        )

@router.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a resume and all associated data.
    """
    user_id = current_user["uid"]
    
    # Get metadata to verify ownership and get storage path
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete file from storage
    if metadata.storage_path:
        delete_file(metadata.storage_path)
    
    # Delete metadata from Firestore
    if not delete_resume_metadata(resume_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume metadata"
        )
    
    return {
        "status": "success",
        "message": "Resume deleted successfully"
    }
