import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from app.config import settings
from typing import Optional
import os

# Check if service account files exist
codetapasya_exists = settings.CODETAPASYA_SERVICE_ACCOUNT_PATH and os.path.exists(settings.CODETAPASYA_SERVICE_ACCOUNT_PATH)
resume_maker_exists = settings.RESUME_MAKER_SERVICE_ACCOUNT_PATH and os.path.exists(settings.RESUME_MAKER_SERVICE_ACCOUNT_PATH)

# Initialize Firebase Admin SDK for CodeTapasya (Auth verification)
if codetapasya_exists:
    codetapasya_cred = credentials.Certificate(settings.CODETAPASYA_SERVICE_ACCOUNT_PATH)
    codetapasya_app = firebase_admin.initialize_app(
        codetapasya_cred,
        name="codetapasya"
    )
    print("✅ CodeTapasya Firebase initialized")
else:
    codetapasya_app = None
    print("⚠️  CodeTapasya service account not found. Auth verification disabled.")
    print(f"   Expected path: {settings.CODETAPASYA_SERVICE_ACCOUNT_PATH}")

# Initialize Firebase Admin SDK for Resume Maker (Firestore + Storage)
if resume_maker_exists:
    resume_maker_cred = credentials.Certificate(settings.RESUME_MAKER_SERVICE_ACCOUNT_PATH)
    resume_maker_app = firebase_admin.initialize_app(
        resume_maker_cred,
        {
            'storageBucket': settings.STORAGE_BUCKET_NAME
        },
        name="resume-maker"
    )
    print("✅ Resume-Maker Firebase initialized")
    print(f"   Storage bucket: {settings.STORAGE_BUCKET_NAME}")
else:
    resume_maker_app = None
    print("⚠️  Resume-Maker service account not found. Firestore/Storage disabled.")
    print(f"   Expected path: {settings.RESUME_MAKER_SERVICE_ACCOUNT_PATH}")

async def verify_firebase_token(id_token: str) -> Optional[dict]:
    """
    Verify Firebase ID token from CodeTapasya Auth project.
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        Decoded token dict with user info, or None if invalid
    """
    if not codetapasya_app:
        print("⚠️  Firebase Auth not initialized - returning mock user for development")
        # Return mock user for development when service account is not configured
        return {
            "uid": "dev-user-123",
            "email": "dev@example.com",
            "email_verified": True,
            "name": "Development User"
        }
    
    try:
        decoded_token = firebase_auth.verify_id_token(
            id_token,
            app=codetapasya_app
        )
        return decoded_token
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

def get_firestore_client():
    """Get Firestore client for Resume Maker project"""
    if not resume_maker_app:
        raise RuntimeError("Resume-Maker Firebase not initialized. Add service account file.")
    from firebase_admin import firestore
    return firestore.client(app=resume_maker_app)

def get_storage_bucket():
    """Get Storage bucket for Resume Maker project"""
    if not resume_maker_app:
        raise RuntimeError("Resume-Maker Firebase not initialized. Add service account file.")
    from firebase_admin import storage
    # Bucket is already configured in app initialization
    return storage.bucket(app=resume_maker_app)
