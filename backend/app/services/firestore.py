"""
Firestore service for managing resume metadata.
"""
from typing import List, Optional, Dict
from datetime import datetime
from app.schemas.resume import ResumeMetadata, ResumeStatus, ResumeListItem

def save_resume_metadata(metadata: ResumeMetadata) -> bool:
    """Save resume metadata to Firestore"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would save resume metadata: {metadata.resume_id}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Convert to dict
        data = metadata.model_dump()
        # Convert datetime to timestamp
        data['created_at'] = metadata.created_at
        data['updated_at'] = metadata.updated_at
        
        # Save to both locations for easy querying
        # 1. In user's subcollection
        db.collection('users').document(metadata.owner_uid)\
          .collection('resumes').document(metadata.resume_id)\
          .set(data)
        
        # 2. In top-level resumes collection
        db.collection('resumes').document(metadata.resume_id).set(data)
        
        return True
    except Exception as e:
        print(f"Error saving resume metadata: {e}")
        return False

def get_resume_metadata(resume_id: str, user_id: str) -> Optional[ResumeMetadata]:
    """Get resume metadata from Firestore"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        # Return mock data in dev mode
        return ResumeMetadata(
            resume_id=resume_id,
            owner_uid=user_id,
            filename="sample-resume.pdf",
            original_filename="My Resume.pdf",
            content_type="application/pdf",
            file_size=1024000,
            storage_path=f"resumes/{user_id}/{resume_id}/sample-resume.pdf",
            status=ResumeStatus.UPLOADED,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        doc = db.collection('resumes').document(resume_id).get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        
        # Verify ownership
        if data.get('owner_uid') != user_id:
            return None
        
        # Convert Firestore timestamp objects to datetime
        # Firestore Timestamp objects have a .timestamp() method that returns Unix timestamp
        for date_field in ['created_at', 'updated_at', 'parsed_at']:
            if date_field in data and data[date_field] is not None:
                try:
                    ts = data[date_field]
                    # If it's a Firestore Timestamp object, convert it to datetime
                    if hasattr(ts, 'timestamp'):
                        # timestamp() returns Unix timestamp in seconds
                        data[date_field] = datetime.utcfromtimestamp(ts.timestamp())
                    elif isinstance(ts, datetime):
                        # Already a datetime object, keep as is
                        pass
                    elif isinstance(ts, str):
                        # Parse ISO format string (e.g., '2025-11-20T18:41:57.311298')
                        try:
                            data[date_field] = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                        except:
                            # Try parsing without microseconds
                            data[date_field] = datetime.fromisoformat(ts.split('.')[0])
                    else:
                        # Try to parse as Unix timestamp (float/int)
                        data[date_field] = datetime.utcfromtimestamp(float(ts))
                except Exception as e:
                    print(f"Warning: Could not convert {date_field}: {e}")
                    # If all conversions fail, set to None
                    data[date_field] = None
        
        # Convert skills from list to dict format if needed
        # This handles legacy data where skills were stored as a list
        if 'skills' in data and isinstance(data['skills'], list):
            # Convert list of skills to dict format: {"technical": [...], "soft": [...]}
            skills_list = data['skills']
            data['skills'] = {
                "technical": skills_list,
                "soft": []
            }
        
        return ResumeMetadata(**data)
    except Exception as e:
        print(f"Error getting resume metadata: {e}")
        import traceback
        traceback.print_exc()
        return None

def list_user_resumes(user_id: str, limit: int = 50) -> List[ResumeListItem]:
    """List all resumes for a user"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        # Return mock data in dev mode
        return [
            ResumeListItem(
                resume_id="mock-resume-1",
                filename="sample-resume.pdf",
                original_filename="sample-resume.pdf",
                file_size=1024000,
                status=ResumeStatus.UPLOADED,
                created_at=datetime.utcnow(),
                latest_score=None,
            )
        ]
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        docs = db.collection('users').document(user_id)\
                 .collection('resumes')\
                 .order_by('created_at', direction=firestore.Query.DESCENDING)\
                 .limit(limit)\
                 .stream()
        
        resumes = []
        for doc in docs:
            data = doc.to_dict()
            resumes.append(ResumeListItem(
                resume_id=data['resume_id'],
                filename=data['filename'],
                original_filename=data.get('original_filename', data['filename']),
                file_size=data['file_size'],
                status=ResumeStatus(data['status']),
                created_at=data['created_at'],
                latest_score=data.get('latest_score'),
            ))
        
        return resumes
    except Exception as e:
        print(f"Error listing resumes: {e}")
        return []

def update_resume_status(
    resume_id: str,
    user_id: str,
    status: ResumeStatus,
    error_message: Optional[str] = None
) -> bool:
    """Update resume processing status"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would update resume {resume_id} status to {status}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        update_data = {
            'status': status.value,
            'updated_at': datetime.utcnow(),
        }
        
        if error_message:
            update_data['error_message'] = error_message
        
        # Update both locations
        db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .update(update_data)
        
        db.collection('resumes').document(resume_id).update(update_data)
        
        return True
    except Exception as e:
        print(f"Error updating resume status: {e}")
        return False

def delete_resume_metadata(resume_id: str, user_id: str) -> bool:
    """Delete resume metadata from Firestore"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would delete resume metadata: {resume_id}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Delete from both locations
        db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .delete()
        
        db.collection('resumes').document(resume_id).delete()
        
        return True
    except Exception as e:
        print(f"Error deleting resume metadata: {e}")
        return False


async def update_resume_parsed_data(
    resume_id: str,
    user_id: str,
    parsed_data: Dict
) -> bool:
    """
    Update resume with parsed data.
    
    Args:
        resume_id: Resume ID
        user_id: User ID  
        parsed_data: Parsed resume data from parser
        
    Returns:
        Success boolean
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would update resume {resume_id} with parsed data")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        update_data = {
            'parsed_text': parsed_data.get('parsed_text', ''),
            'contact_info': parsed_data.get('contact_info', {}),
            'skills': parsed_data.get('skills', []),
            'sections': parsed_data.get('sections', {}),
            'experience': parsed_data.get('experience', []),
            'projects': parsed_data.get('projects', []),
            'education': parsed_data.get('education', []),
            'layout_type': parsed_data.get('layout_type', 'unknown'),
            'parsed_at': parsed_data.get('parsed_at'),
            'updated_at': datetime.utcnow(),
        }
        
        # Update both locations
        db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .update(update_data)
        
        db.collection('resumes').document(resume_id).update(update_data)
        
        return True
    except Exception as e:
        print(f"Error updating parsed data: {e}")
        return False


async def update_resume_score_data(
    resume_id: str,
    user_id: str,
    score_data: Dict
) -> bool:
    """
    Update resume with ATS score data.
    
    Args:
        resume_id: Resume ID
        user_id: User ID
        score_data: Score data from scorer
        
    Returns:
        Success boolean
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would update resume {resume_id} with score: {score_data.get('total_score')}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        update_data = {
            'ats_score': score_data.get('total_score', 0),
            'score_rating': score_data.get('rating', 'Unknown'),
            'score_breakdown': score_data.get('breakdown', {}),
            'score_suggestions': score_data.get('suggestions', []),
            'scoring_method': score_data.get('scoring_method', 'local'),
            'scored_at': score_data.get('scored_at'),
            'updated_at': datetime.utcnow(),
        }
        
        # Add Gemini-specific fields if present
        if 'strengths' in score_data:
            update_data['score_strengths'] = score_data['strengths']
        if 'weaknesses' in score_data:
            update_data['score_weaknesses'] = score_data['weaknesses']
        if 'keyword_matches' in score_data:
            update_data['keyword_matches'] = score_data['keyword_matches']
        if 'ats_compatibility' in score_data:
            update_data['ats_compatibility'] = score_data['ats_compatibility']
        
        # Update both locations
        db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .update(update_data)
        
        db.collection('resumes').document(resume_id).update(update_data)
        
        return True
    except Exception as e:
        print(f"Error updating score data: {e}")
        return False


def get_resume_data(resume_id: str, user_id: str) -> Optional[Dict]:
    """
    Get full resume data from resume_data collection.
    This includes all structured data: contact, experience, education, projects, skills, etc.
    
    Args:
        resume_id: Resume ID
        user_id: User ID (for ownership verification)
        
    Returns:
        Resume data dictionary or None if not found
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        # Return mock data in dev mode
        return {
            'contact': {
                'fullName': 'John Doe',
                'email': 'john.doe@example.com',
                'phone': '+1234567890',
                'location': 'San Francisco, CA'
            },
            'summary': 'Experienced software engineer',
            'experience': [],
            'education': [],
            'projects': [],
            'skills': []
        }
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Get from resume_data subcollection
        doc = db.collection('users').document(user_id)\
                .collection('resume_data').document(resume_id).get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        
        # Verify ownership (data should have userId field)
        if data.get('userId') != user_id:
            return None
        
        return data
    except Exception as e:
        print(f"Error getting resume data: {e}")
        return None


def update_resume_latest_score(
    resume_id: str,
    user_id: str,
    score: float
) -> bool:
    """
    Update the latest_score field in resume metadata for dashboard display.
    
    Args:
        resume_id: Resume ID
        user_id: User ID
        score: ATS score value (0-100)
        
    Returns:
        Success boolean
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would update resume {resume_id} latest_score to {score}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        update_data = {
            'latest_score': score,
            'updated_at': datetime.utcnow(),
        }
        
        # Update both locations
        db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .update(update_data)
        
        db.collection('resumes').document(resume_id)\
          .update(update_data)
        
        return True
    except Exception as e:
        print(f"Error updating latest_score: {e}")
        return False
