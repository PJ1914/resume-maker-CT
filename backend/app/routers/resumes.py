"""
Resume upload and management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from datetime import datetime
from typing import List
from pathlib import Path
from app.services.rate_limiter import strict_limiter
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
    CreateResumeVersionRequest,
    ResumeVersionResponse,
    ResumeVersionDetailResponse,
    TailorResumeRequest,
)
from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS, get_user_credits
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
    save_resume_version,
    save_resume_version,
    list_resume_versions,
    get_resume_version,
    delete_resume_version,
)
from app.services.tasks import process_resume_parsing
from app.config import settings
import logging

router = APIRouter(prefix="/resumes")

# File validation - use settings for security
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024  # Convert MB to bytes
ALLOWED_CONTENT_TYPES = [
    ResumeFileType.PDF.value,
    ResumeFileType.DOCX.value,
    ResumeFileType.DOC.value,
    ResumeFileType.TEX.value,
    ResumeFileType.TEX_ALT.value,
    ResumeFileType.PLAIN.value,  # For .tex files
]

def normalize_skills_to_list(skills):
    """Convert skills to list format [{category, items}]"""
    if skills is None:
        return []
    if isinstance(skills, list):
        # Already in list format, validate structure
        result = []
        for s in skills:
            # Handle dict format
            if isinstance(s, dict) and s.get('items'):
                result.append({'category': s.get('category', 'Technical'), 'items': s.get('items', [])})
            # Handle SkillCategory Pydantic model objects
            elif hasattr(s, 'category') and hasattr(s, 'items') and s.items:
                result.append({'category': s.category, 'items': list(s.items)})
        return result
    if isinstance(skills, dict):
        # Old format or SkillsData object
        result = []
        if hasattr(skills, 'categories') and skills.categories:
            result.extend([{'category': c.category, 'items': list(c.items)} for c in skills.categories])
        if hasattr(skills, 'technical') and skills.technical:
            result.append({'category': 'Technical', 'items': list(skills.technical)})
        elif 'technical' in skills and skills.get('technical'):
            result.append({'category': 'Technical', 'items': skills['technical']})
        if hasattr(skills, 'soft') and skills.soft:
            result.append({'category': 'Soft Skills', 'items': list(skills.soft)})
        elif 'soft' in skills and skills.get('soft'):
            result.append({'category': 'Soft Skills', 'items': skills['soft']})
        return result
    return []

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
    logging.info("Triggering background parsing for resume %s (storage_path=%s, filename=%s)", request.resume_id, request.storage_path, metadata.filename if metadata else '')
    background_tasks.add_task(
        process_resume_parsing,
        resume_id=request.resume_id,
        uid=user_id,
        storage_path=request.storage_path,
        content_type=metadata.content_type,
        filename=metadata.filename if metadata else ''
    )
    
    return {"message": "Upload confirmed, processing started", "resume_id": request.resume_id}


@router.post("/upload-direct", dependencies=[Depends(strict_limiter)])
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
    # Validate file type by extension and content-type
    allowed_extensions = {'.pdf', '.docx', '.doc', '.tex', '.txt'}
    file_ext = Path(file.filename).suffix.lower() if file.filename else ''
    
    if file_ext not in allowed_extensions:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed: {', '.join(allowed_extensions)}"
        )

    # Normalize content type based on extension (browsers send different MIME types)
    normalized_content_type = file.content_type
    if file_ext == '.docx':
        # DOCX files can come as application/octet-stream, application/x-zip-compressed, etc.
        normalized_content_type = ResumeFileType.DOCX.value
        logging.info(f"Normalized DOCX content type from {file.content_type} to {normalized_content_type}")
    elif file_ext == '.doc':
        normalized_content_type = ResumeFileType.DOC.value
        logging.info(f"Normalized DOC content type from {file.content_type} to {normalized_content_type}")
    elif file_ext == '.pdf':
        normalized_content_type = ResumeFileType.PDF.value
    elif file_ext in ['.tex', '.txt']:
        normalized_content_type = ResumeFileType.PLAIN.value
    
    # Validate normalized content type
    if normalized_content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )
    
    # Check file size without reading entirely into memory if possible
    # Starlette's UploadFile doesn't expose size until read/spooled.
    # We will rely on stream uploading, but we should check size if we can. 
    # For now, we'll check it after upload or trust the stream limit if we had one.
    # Actually, let's seek to end to get size, then seek back.
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Generate resume ID and storage path
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    # Check if user has sufficient credits
    if not has_sufficient_credits(user_id, FeatureType.UPLOAD_RESUME, user_email):
        user_credits = get_user_credits(user_id, user_email)
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "message": "Insufficient credits to upload resume",
                "current_balance": user_credits["balance"],
                "required": FEATURE_COSTS[FeatureType.UPLOAD_RESUME]
            }
        )
    
    resume_id = generate_resume_id()
    storage_path = get_storage_path(user_id, resume_id, file.filename or "resume.pdf")
    
    # Upload to Firebase Storage (Async Wrapper)
    import asyncio
    loop = asyncio.get_running_loop()

    def _upload_sync():
        try:
            from app.firebase import resume_maker_app
            from firebase_admin import storage
            
            bucket = storage.bucket(app=resume_maker_app)
            blob = bucket.blob(storage_path)
            
            # Use upload_from_file to stream directly
            blob.upload_from_file(
                file.file,
                content_type=file.content_type,
                size=file_size # strict checking by GCS
            )
        except Exception as e:
            logger.error(f"Firebase upload failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )

    await loop.run_in_executor(None, _upload_sync)
    
    # Create metadata with normalized content type
    metadata = ResumeMetadata(
        resume_id=resume_id,
        owner_uid=user_id,
        filename=file.filename or "resume.pdf",
        original_filename=file.filename or "resume.pdf",
        content_type=normalized_content_type,  # Use normalized content type
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
    logging.info("Triggering background parsing for resume %s (storage_path=%s, filename=%s, content_type=%s)", 
                 resume_id, storage_path, file.filename, normalized_content_type)
    background_tasks.add_task(
        process_resume_parsing,
        resume_id=resume_id,
        uid=user_id,
        storage_path=storage_path,
        content_type=normalized_content_type,  # Use normalized content type
        filename=file.filename or ''
    )
    logging.info("Background task added for resume %s", resume_id)
    
    # Deduct credits after successful upload
    deduct_credits(user_id, FeatureType.UPLOAD_RESUME, f"Uploaded resume {resume_id}", user_email)
    
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
    directly to Firestore without file upload. Includes template selection.
    """
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    # Check if user has sufficient credits
    if not has_sufficient_credits(user_id, FeatureType.CREATE_RESUME, user_email):
        user_credits = get_user_credits(user_id, user_email)
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "message": "Insufficient credits to create resume",
                "current_balance": user_credits["balance"],
                "required": FEATURE_COSTS[FeatureType.CREATE_RESUME]
            }
        )
    
    resume_id = generate_resume_id()
    
    try:
        logging.info("Creating resume for user: %s (resume_id=%s, template=%s)", user_id, resume_id, request.template)
        logging.info("Skills received: %s (type=%s)", request.skills, type(request.skills))
        normalized_skills = normalize_skills_to_list(request.skills)
        logging.info("Skills normalized: %s", normalized_skills)
        
        # Build sections dict safely
        sections = {
            'contact': {
                'name': request.contact.name,
                'email': request.contact.email,
                'phone': request.contact.phone,
                'location': request.contact.location,
                'linkedin': request.contact.linkedin,
                'github': request.contact.github,
                'leetcode': request.contact.leetcode,
                'codechef': request.contact.codechef,
                'hackerrank': request.contact.hackerrank,
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
            'certifications': [
                {
                    'name': c.name,
                    'issuer': c.issuer,
                    'date': c.date,
                    'credentialId': c.credentialId,
                    'url': c.url,
                }
                for c in request.certifications
            ],
            'languages': [
                {
                    'language': l.name,
                    'proficiency': l.proficiency,
                }
                for l in request.languages
            ],
            'achievements': [
                {
                    'title': a.title,
                    'description': a.description,
                    'date': a.date,
                }
                for a in request.achievements
            ],
        }
        
        # Create metadata for the new resume
        # Calculate file size from the data
        import json
        estimated_size = len(json.dumps(sections).encode('utf-8'))
        
        metadata = ResumeMetadata(
            resume_id=resume_id,
            owner_uid=user_id,
            filename=request.contact.name,
            original_filename=request.contact.name,
            content_type="application/json",
            file_size=estimated_size,
            storage_path="",
            status=ResumeStatus.PARSED,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            template=request.template,  # Store template ID
            parsed_text=request.summary,
            contact_info={
                'name': request.contact.name,
                'email': request.contact.email,
                'phone': request.contact.phone,
                'location': request.contact.location,
                'linkedin': request.contact.linkedin,
                'github': request.contact.github,
                'leetcode': request.contact.leetcode,
                'codechef': request.contact.codechef,
                'hackerrank': request.contact.hackerrank,
                'website': request.contact.website,
            },
            skills=normalize_skills_to_list(request.skills),
            sections=sections,
            # Also set individual fields for easier access
            experience=[
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
            education=[
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
            projects=[
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
            certifications=[
                {
                    'name': c.name,
                    'issuer': c.issuer,
                    'date': c.date,
                    'credentialId': c.credentialId,
                    'url': c.url,
                }
                for c in request.certifications
            ],
            languages=[
                {
                    'language': l.name,
                    'proficiency': l.proficiency,
                }
                for l in request.languages
            ],
            achievements=[
                {
                    'title': a.title,
                    'description': a.description,
                    'date': a.date,
                }
                for a in request.achievements
            ],
        )
        
        logging.debug("Metadata created successfully for resume %s", resume_id)
        
        # Save metadata to Firestore
        if not save_resume_metadata(metadata):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save resume data to Firestore"
            )
        
        # Also save to resume_data collection for consistency with editor format
        try:
            from app.firebase import resume_maker_app
            if resume_maker_app:
                from firebase_admin import firestore
                db = firestore.client(app=resume_maker_app)
                
                # Build resume_data format
                resume_data_doc = {
                    'id': resume_id,
                    'userId': user_id,
                    'contact': {
                        'fullName': request.contact.name,
                        'email': request.contact.email,
                        'phone': request.contact.phone,
                        'location': request.contact.location,
                        'linkedin': request.contact.linkedin,
                        'github': request.contact.github,
                        'portfolio': request.contact.website,
                    },
                    'summary': request.summary,
                    'experience': [
                        {
                            'id': f'exp-{i}',
                            'company': e.company,
                            'position': e.position,
                            'title': e.title or e.position,
                            'location': e.location,
                            'startDate': e.startDate,
                            'endDate': e.endDate,
                            'description': e.description,
                        }
                        for i, e in enumerate(request.experience)
                    ],
                    'education': [
                        {
                            'id': f'edu-{i}',
                            'institution': e.school,
                            'degree': e.degree,
                            'field': e.field,
                            'location': e.location,
                            'startDate': e.startDate,
                            'endDate': e.endDate,
                            'gpa': e.gpa,
                        }
                        for i, e in enumerate(request.education)
                    ],
                    'skills': normalize_skills_to_list(request.skills),
                    'projects': [
                        {
                            'id': f'proj-{i}',
                            'name': p.name,
                            'description': p.description,
                            'technologies': p.technologies.split(',') if isinstance(p.technologies, str) else (p.technologies or []),
                            'link': p.url,
                        }
                        for i, p in enumerate(request.projects)
                    ],
                    'certifications': [
                        {
                            'name': c.name,
                            'issuer': c.issuer,
                            'date': c.date,
                        }
                        for c in request.certifications
                    ],
                    'languages': [
                        {
                            'language': l.name,
                            'proficiency': l.proficiency,
                        }
                        for l in request.languages
                    ],
                    'achievements': [
                        {
                            'title': a.title,
                            'description': a.description,
                            'date': a.date,
                        }
                        for a in request.achievements
                    ],
                    'template': request.template,
                    'updatedAt': datetime.utcnow(),
                }
                
                # Save to resume_data collection
                db.collection('users').document(user_id)\
                  .collection('resume_data').document(resume_id)\
                  .set(resume_data_doc, merge=True)
                
                logging.info("Saved resume_data for wizard-created resume %s", resume_id)
        except Exception as e:
            logging.warning("Failed to save resume_data for %s: %s", resume_id, str(e))
        
        logging.info("Resume saved successfully: %s", resume_id)
        
        # Deduct credits after successful creation
        deduct_credits(user_id, FeatureType.CREATE_RESUME, f"Created resume {resume_id}", user_email)
        
        return {
            "status": "success",
            "message": "Resume created successfully",
            "resume_id": resume_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Error creating resume: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create resume: {str(e)}"
        )


@router.get("", response_model=ResumeListResponse)
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

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific resume.
    """
    user_id = current_user["uid"]
    
    try:
        from app.services.firestore import get_merged_resume_data
        resume_data = get_merged_resume_data(resume_id, user_id)
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Debug logging (safe access)
        logging.debug("API returning resume %s: experience=%s projects=%s education=%s sections=%s", resume_id, len(resume_data.get('experience') or []), len(resume_data.get('projects') or []), len(resume_data.get('education') or []), len(resume_data.get('sections') or []))
        
        # Generate download URL if needed
        storage_url = None
        if resume_data.get('storage_path'):
            storage_url = generate_signed_download_url(resume_data['storage_path'])
        
        return ResumeDetailResponse(
            resume_id=resume_data['resume_id'],
            filename=resume_data['filename'],
            original_filename=resume_data.get('original_filename'),
            content_type=resume_data['content_type'],
            file_size=resume_data['file_size'],
            storage_url=storage_url,
            status=resume_data['status'],
            created_at=resume_data['created_at'],
            updated_at=resume_data['updated_at'],
            parsed_text=resume_data.get('parsed_text'),
            contact_info=resume_data.get('contact_info'),
            skills=resume_data.get('skills'),
            sections=resume_data.get('sections'),
            experience=resume_data.get('experience'),
            projects=resume_data.get('projects'),
            education=resume_data.get('education'),
            layout_type=resume_data.get('layout_type'),
            parsed_at=resume_data.get('parsed_at'),
            latest_score=resume_data.get('latest_score'),
            template=resume_data.get('template'),
            error_message=resume_data.get('error_message'),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Error getting resume: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get resume: {str(e)}"
        )

@router.delete("/{resume_id}")
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

@router.post("/resumes/{resume_id}/reparse")
async def reparse_resume(
    resume_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Manually trigger re-parsing of an existing resume.
    Useful for testing parser updates without re-uploading.
    """
    user_id = current_user["uid"]
    
    # Get metadata
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Trigger parsing in background
    background_tasks.add_task(
        process_resume_parsing,
        resume_id=resume_id,
        uid=user_id,
        storage_path=metadata.storage_path,
        content_type=metadata.content_type,
        filename=metadata.filename if metadata else ''
    )
    
    return {
        "status": "success",
        "message": "Resume re-parsing triggered",
        "resume_id": resume_id
    }


@router.post("/{resume_id}/versions", response_model=ResumeVersionResponse)
async def create_version(
    resume_id: str,
    request: CreateResumeVersionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new version of the resume.
    """
    user_id = current_user["uid"]
    
    # Check if resume exists/belongs to user first?
    # get_resume_metadata verifies ownership
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    version = save_resume_version(
        user_id, 
        resume_id, 
        request.resume_json, 
        request.job_role, 
        request.company
    )
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume version"
        )
        
    return ResumeVersionResponse(
        version_id=version['version_id'],
        version_name=version['version_name'],
        created_at=version['created_at']
    )

@router.put("/{resume_id}/data")
async def save_resume_data(
    resume_id: str,
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Save resume editor data to Firestore.
    This allows the frontend editor to save data through the backend,
    ensuring it goes to the correct Firestore database.
    """
    from app.firebase import resume_maker_app
    
    user_id = current_user["uid"]
    
    # Verify resume ownership
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if not resume_maker_app:
        logging.warning("[DEV] Would save resume data for %s", resume_id)
        return {"status": "success", "message": "Resume data saved (dev mode)"}
    
    try:
        from firebase_admin import firestore
        from datetime import datetime
        
        db = firestore.client(app=resume_maker_app)
        
        # Prepare data for saving
        save_data = {
            **data,
            'id': resume_id,
            'userId': user_id,
            'updatedAt': datetime.utcnow(),
        }
        
        # Save to resume_data collection
        db.collection('users').document(user_id)\
          .collection('resume_data').document(resume_id)\
          .set(save_data, merge=True)
        
        logging.info(f"✅ Saved resume data for {resume_id}")
        
        return {
            "status": "success",
            "message": "Resume data saved",
            "resume_id": resume_id
        }
    except Exception as e:
        logging.error(f"Error saving resume data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save resume data: {str(e)}"
        )


@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
async def get_resume_versions(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all versions of a resume.
    """
    user_id = current_user["uid"]
    
    # Check existence
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    versions = list_resume_versions(user_id, resume_id)
    
    return [
        ResumeVersionResponse(
            version_id=v['version_id'],
            version_name=v['version_name'],
            created_at=v['created_at']
        )
        for v in versions
    ]

@router.get("/{resume_id}/versions/{version_id}", response_model=ResumeVersionDetailResponse)
async def get_resume_version_detail(
    resume_id: str,
    version_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific version of a resume including full content.
    """
    user_id = current_user["uid"]
    
    # Check existence of call to verify ownership
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    version = get_resume_version(user_id, resume_id, version_id)
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    return ResumeVersionDetailResponse(
        version_id=version['version_id'],
        version_name=version['version_name'],
        created_at=version['created_at'],
        resume_json=version.get('json', {})
    )

@router.delete("/{resume_id}/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_version(
    resume_id: str,
    version_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific resume version.
    """
    user_id = current_user["uid"]
    
    # Check existence
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    success = delete_resume_version(user_id, resume_id, version_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete version"
        )
    
    return None
@router.delete("/{resume_id}/versions/{version_id}")
async def delete_version(
    resume_id: str,
    version_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific resume version.
    """
    user_id = current_user["uid"]
    
    # Check existence
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    if not delete_resume_version(user_id, resume_id, version_id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume version"
        )
        
    return {"status": "success", "message": "Version deleted"}

@router.get("/public/testimonials")
async def get_testimonials(limit: int = 10):
    """
    Get top performing success stories (testimonials) from real users.
    Public endpoint.
    """
    from app.services.firestore import get_top_performing_resumes
    results = get_top_performing_resumes(limit=limit)
    return results

@router.get("/public/stats")
async def get_stats():
    """
    Get platform statistics.
    Public endpoint.
    """
    from app.services.firestore import get_platform_stats
    return get_platform_stats()
@router.post("/{resume_id}/tailor", response_model=ResumeVersionDetailResponse)
async def tailor_resume(
    resume_id: str,
    request: TailorResumeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Tailor a resume for a specific job description using AI.
    Creates a new version with the tailored content.
    """
    from app.services.firestore import get_merged_resume_data
    from app.services.ai_generator import resume_tailor
    from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS
    
    user_id = current_user["uid"]
    
    # 1. Verify existence & ownership
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    # 2. Check credits (AI tailoring cost)
    # Using 'ai_rewrite' cost or create a new one? Let's use AI_REWRITE (2 credits) or ATS_CHECK (5 credits)?
    # Since it's a full rewrite, let's assume it costs like an ATS check or similar.
    # For now, let's reuse ATS_CHECK cost (5 credits) as this is high value
    cost = FEATURE_COSTS.get(FeatureType.ATS_SCORING, 5)
    
    user_email = current_user.get("email", "")
    if not has_sufficient_credits(user_id, FeatureType.ATS_SCORING, user_email):
         raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={"message": "Insufficient credits for AI tailoring"}
        )
        
    # 3. Get current resume data (merged with edits)
    current_data = get_merged_resume_data(resume_id, user_id)
    if not current_data:
        raise HTTPException(status_code=404, detail="Could not retrieve resume data")

    # SAFETY: Save current state as a version before anything else
    try:
        current_role = current_data.get('contact_info', {}).get('role') or "Original"
        save_resume_version(
            user_id,
            resume_id,
            current_data,
            "Backup (Pre-Tailoring)",
            "Original State"
        )
    except Exception as e:
        print(f"Warning: Failed to create safety backup: {e}")
        
    # 4. Call AI Service
    try:
        tailored_json = resume_tailor.tailor_resume(current_data, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
        
    # 5. Save as new version
    company = request.company or "Tailored"
    job_role = request.job_role or "Target Job"
    
    # Prefix role with "Tailored: " to distinguish
    final_role = f"Tailored: {job_role}"
    
    version = save_resume_version(
        user_id, 
        resume_id, 
        tailored_json, 
        final_role, 
        company
    )
    
    if not version:
        raise HTTPException(status_code=500, detail="Failed to save tailored version")
        
    # 6. Deduct credits
    deduct_credits(user_id, FeatureType.ATS_SCORING, f"Resume Tailoring for {company}", user_email)

    return ResumeVersionDetailResponse(
        version_id=version['version_id'],
        version_name=version['version_name'],
        created_at=version['created_at'],
        resume_json=tailored_json
    )
