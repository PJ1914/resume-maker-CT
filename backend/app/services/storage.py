"""
Storage service for handling Firebase Storage operations.
Generates presigned URLs for uploads and manages file access.
"""
from typing import Optional
from datetime import datetime, timedelta
import uuid
from app.config import settings

def generate_resume_id() -> str:
    """Generate a unique resume ID"""
    return str(uuid.uuid4())

def get_storage_path(user_id: str, resume_id: str, filename: str) -> str:
    """
    Generate storage path for resume file.
    Format: resumes/{uid}/{resumeId}/{filename}
    """
    # Sanitize filename
    safe_filename = filename.replace(" ", "_").replace("/", "_")
    return f"resumes/{user_id}/{resume_id}/{safe_filename}"

def generate_signed_upload_url(
    storage_path: str,
    content_type: str,
    expires_minutes: int = 60
) -> str:
    """
    Generate a signed URL for uploading to Firebase Storage.
    
    Note: In development mode without Firebase, returns a mock URL.
    In production, this would use Firebase Admin SDK to generate real signed URLs.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        # Development mode - return mock URL
        return f"http://localhost:8000/api/mock-upload/{storage_path}"
    
    try:
        from firebase_admin import storage
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        
        # Generate signed URL for PUT operation
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expires_minutes),
            method="PUT",
            content_type=content_type,
        )
        return url
    except Exception as e:
        print(f"Error generating signed URL: {e}")
        raise

def generate_signed_download_url(
    storage_path: str,
    expires_minutes: int = 60
) -> Optional[str]:
    """
    Generate a signed URL for downloading from Firebase Storage.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        # Development mode
        return f"http://localhost:8000/api/mock-download/{storage_path}"
    
    try:
        from firebase_admin import storage
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        
        if not blob.exists():
            return None
        
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expires_minutes),
            method="GET",
        )
        return url
    except Exception as e:
        print(f"Error generating download URL: {e}")
        return None

def delete_file(storage_path: str) -> bool:
    """Delete a file from Firebase Storage"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would delete: {storage_path}")
        return True
    
    try:
        from firebase_admin import storage
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        blob.delete()
        return True
    except Exception as e:
        print(f"Error deleting file: {e}")
        return False


async def get_file_content(storage_path: str) -> Optional[bytes]:
    """
    Download file content from Firebase Storage.
    
    Args:
        storage_path: Path to file in storage
        
    Returns:
        File bytes or None if error
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would download: {storage_path}")
        # Return empty bytes in dev mode
        return b"Mock file content for development"
    
    try:
        from firebase_admin import storage
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        
        if not blob.exists():
            print(f"File not found: {storage_path}")
            return None
        
        # Download file content
        content = blob.download_as_bytes()
        return content
        
    except Exception as e:
        print(f"Error downloading file: {e}")
        return None


async def upload_resume_pdf(
    user_id: str,
    resume_id: str,
    pdf_content: bytes,
    filename: str
) -> str:
    """
    Upload generated PDF to Firebase Storage.
    
    Args:
        user_id: User ID
        resume_id: Resume ID
        pdf_content: PDF file content as bytes
        filename: PDF filename
        
    Returns:
        Storage path of uploaded PDF
    """
    from firebase_admin import storage
    from app.firebase import resume_maker_app
    
    # Storage path
    storage_path = f"users/{user_id}/resumes/{resume_id}/pdfs/{filename}"
    
    try:
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        
        # Upload PDF
        blob.upload_from_string(
            pdf_content,
            content_type='application/pdf'
        )
        
        print(f"✅ PDF uploaded: {storage_path}")
        return storage_path
        
    except Exception as e:
        print(f"Error uploading PDF: {e}")
        raise


async def get_signed_url(
    storage_path: str,
    expiration: timedelta = timedelta(hours=1)
) -> str:
    """
    Generate signed URL for secure file access.
    
    Args:
        storage_path: Path to file in storage
        expiration: URL expiration time
        
    Returns:
        Signed URL
    """
    from firebase_admin import storage
    from app.firebase import resume_maker_app
    from datetime import datetime, timezone
    
    try:
        bucket = storage.bucket(app=resume_maker_app)
        blob = bucket.blob(storage_path)
        
        if not blob.exists():
            raise FileNotFoundError(f"File not found: {storage_path}")
        
        # Generate signed URL
        url = blob.generate_signed_url(
            expiration=datetime.now(timezone.utc) + expiration,
            method='GET'
        )
        
        return url
        
    except Exception as e:
        print(f"Error generating signed URL: {e}")
        raise
