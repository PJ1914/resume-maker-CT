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


def update_resume_parsed_data_sync(
    resume_id: str,
    user_id: str,
    parsed_data: Dict
) -> bool:
    """
    Update resume with parsed data (synchronous version).
    Also saves to resume_data collection in the format the editor expects.
    
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
        
        # Helper function to clean dict keys (remove empty strings)
        def clean_dict(d):
            """Remove empty string keys from dict"""
            if not isinstance(d, dict):
                return d
            return {k: v for k, v in d.items() if k and isinstance(k, str)}
        
        # Clean custom_sections if present
        custom_sections = parsed_data.get('custom_sections', {})
        if isinstance(custom_sections, dict):
            custom_sections = clean_dict(custom_sections)
        
        # Original parsed data for metadata - save ALL parsed fields
        update_data = {
            'parsed_text': parsed_data.get('parsed_text', ''),
            'contact_info': parsed_data.get('contact_info', {}),
            'professional_summary': parsed_data.get('professional_summary', ''),
            'skills': parsed_data.get('skills', {}),
            'sections': parsed_data.get('sections', []),  # Dynamic sections array from Gemini parser
            'experience': parsed_data.get('experience', []),
            'projects': parsed_data.get('projects', []),
            'education': parsed_data.get('education', []),
            'certifications': parsed_data.get('certifications', []),
            'hackathons_competitions': parsed_data.get('hackathons_competitions', []),
            'awards': parsed_data.get('awards', []),
            'publications': parsed_data.get('publications', []),
            'languages': parsed_data.get('languages', []),
            'volunteer': parsed_data.get('volunteer', []),
            'custom_sections': custom_sections,
            'layout_type': parsed_data.get('layout_type', 'unknown'),
            'parsing_method': parsed_data.get('parsing_method', 'unknown'),
            'parsed_at': parsed_data.get('parsed_at'),
            'updated_at': datetime.utcnow(),
        }
        
        # Update both locations for metadata
        db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .update(update_data)
        
        db.collection('resumes').document(resume_id).update(update_data)
        
        # Also save to resume_data collection in the format the frontend editor expects
        contact_info = parsed_data.get('contact_info', {})
        experience_list = parsed_data.get('experience', [])
        education_list = parsed_data.get('education', [])
        projects_list = parsed_data.get('projects', [])
        skills_dict = parsed_data.get('skills', {})
        certifications_list = parsed_data.get('certifications', [])
        achievements_list = parsed_data.get('achievements', [])
        
        # Transform contact info
        editor_contact = {
            'fullName': contact_info.get('name', ''),
            'email': contact_info.get('email', ''),
            'phone': contact_info.get('phone', ''),
            'location': contact_info.get('location', ''),
            'linkedin': contact_info.get('linkedin', ''),
            'github': contact_info.get('github', ''),
            'portfolio': contact_info.get('portfolio', ''),
        }
        
        # Transform experience (add id and map fields)
        import uuid
        editor_experience = []
        for exp in experience_list:
            editor_experience.append({
                'id': str(uuid.uuid4()),
                'company': exp.get('company', ''),
                'position': exp.get('position', ''),
                'title': exp.get('position', ''),  # Alias
                'location': exp.get('location', ''),
                'startDate': exp.get('startDate', ''),
                'endDate': exp.get('endDate', ''),
                'current': exp.get('endDate', '').lower() in ['present', 'current', 'now', ''],
                'description': exp.get('description', ''),
                'highlights': exp.get('highlights', []) if isinstance(exp.get('highlights'), list) else [],
            })
        
        # Transform education (add id and map fields)
        editor_education = []
        for edu in education_list:
            editor_education.append({
                'id': str(uuid.uuid4()),
                'institution': edu.get('school', ''),
                'degree': edu.get('degree', ''),
                'field': edu.get('field', ''),
                'location': edu.get('location', ''),
                'startDate': edu.get('startDate', ''),
                'endDate': edu.get('endDate', ''),
                'gpa': edu.get('gpa', ''),
                'honors': '',
            })
        
        # Transform projects (add id and fix technologies)
        editor_projects = []
        for proj in projects_list:
            tech = proj.get('technologies', '')
            # Ensure technologies is a list
            if isinstance(tech, str):
                tech = [t.strip() for t in tech.split(',') if t.strip()] if tech else []
            editor_projects.append({
                'id': str(uuid.uuid4()),
                'name': proj.get('name', ''),
                'description': proj.get('description', ''),
                'technologies': tech,
                'link': proj.get('link', ''),
                'highlights': [],
                'startDate': proj.get('startDate', ''),
                'endDate': proj.get('endDate', ''),
            })
        
        # Transform skills to editor format (list of categories)
        editor_skills = []
        if isinstance(skills_dict, dict):
            for category, items in skills_dict.items():
                if items:
                    editor_skills.append({
                        'category': category.replace('_', ' ').title(),
                        'items': items if isinstance(items, list) else [items],
                    })
        elif isinstance(skills_dict, list):
            # Already in list format
            editor_skills = skills_dict
        
        # Transform certifications
        editor_certifications = []
        for cert in certifications_list:
            editor_certifications.append({
                'name': cert.get('name', ''),
                'issuer': cert.get('issuer', ''),
                'date': cert.get('date', ''),
            })
        
        # Transform achievements
        editor_achievements = []
        for ach in achievements_list:
            editor_achievements.append({
                'title': ach.get('title', ''),
                'description': ach.get('description', ''),
                'date': ach.get('date', ''),
            })
        
        # Extract summary from sections array if available
        summary_text = ''
        sections = parsed_data.get('sections', [])
        if isinstance(sections, list):
            for section in sections:
                if isinstance(section, dict) and section.get('type') == 'summary':
                    items = section.get('items', [])
                    if items:
                        first_item = items[0]
                        summary_text = first_item.get('text', '') if isinstance(first_item, dict) else str(first_item)
                    break
        # Also check direct professional_summary field
        if not summary_text:
            summary_text = parsed_data.get('professional_summary', '')
        
        # Build editor data structure
        editor_data = {
            'id': resume_id,
            'userId': user_id,
            'contact': editor_contact,
            'summary': summary_text,
            'experience': editor_experience,
            'education': editor_education,
            'skills': editor_skills,
            'projects': editor_projects,
            'certifications': editor_certifications,
            'achievements': editor_achievements,
            'updatedAt': datetime.utcnow(),
        }
        
        # Save to resume_data collection
        db.collection('users').document(user_id)\
          .collection('resume_data').document(resume_id)\
          .set(editor_data, merge=True)
        
        print(f"✅ Saved parsed data to resume_data collection for {resume_id}")
        
        return True
    except Exception as e:
        print(f"Error updating parsed data: {e}")
        import traceback
        traceback.print_exc()
        return False


def update_resume_score_data_sync(
    resume_id: str,
    user_id: str,
    score_data: Dict
) -> bool:
    """
    Update resume with ATS score data (synchronous version).
    
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
            'latest_score': score_data.get('total_score', 0),  # Also update latest_score
            'score_rating': score_data.get('rating', 'Unknown'),
            'score_breakdown': score_data.get('breakdown', {}),
            'score_suggestions': score_data.get('recommendations', []),  # Use recommendations
            'scoring_method': score_data.get('scoring_method', 'local'),
            'scored_at': score_data.get('scored_at'),
            'updated_at': datetime.utcnow(),
        }
        
        # Add comprehensive fields if present
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
        import traceback
        traceback.print_exc()
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


def get_merged_resume_data(resume_id: str, user_id: str) -> Optional[Dict]:
    """
    Get resume data, preferring edited data from resume_data collection
    over the original parsed metadata.
    
    Returns a dictionary suitable for the frontend or scoring.
    """
    # 1. Get base metadata (status, original file info, etc.)
    metadata = get_resume_metadata(resume_id, user_id)
    if not metadata:
        return None
        
    # 2. Get edited data
    edited_data = get_resume_data(resume_id, user_id)
    
    # Start with metadata converted to dict
    result = metadata.model_dump()
    
    # Helper to check if a value has actual content
    def has_content(value):
        if value is None:
            return False
        if isinstance(value, list):
            return len(value) > 0
        if isinstance(value, dict):
            return bool(value)
        if isinstance(value, str):
            return bool(value.strip())
        return True
    
    # If we have edited data, override the content sections ONLY if they have content
    if edited_data:
        # Map edited data fields to metadata structure
        if has_content(edited_data.get('summary')):
            result['professional_summary'] = edited_data['summary']
            result['summary'] = edited_data['summary']  # Also set for templates
            
        if has_content(edited_data.get('contact')):
            result['contact_info'] = edited_data['contact']
            result['contact'] = edited_data['contact']  # Also set for templates
            
        # For arrays, only override if the edited version has actual items
        if has_content(edited_data.get('experience')):
            result['experience'] = edited_data['experience']
            
        if has_content(edited_data.get('education')):
            result['education'] = edited_data['education']
            
        if has_content(edited_data.get('projects')):
            result['projects'] = edited_data['projects']
            
        if has_content(edited_data.get('skills')):
            # Edited skills are usually a list of categories
            # Metadata skills are {technical: [], soft: []}
            # We need to adapt if structure differs, but for now let's assume
            # the consumer handles the structure or we map it here.
            # The editor uses {category: string, items: string[]}[]
            # The scorer expects {technical: [], soft: []}
            
            editor_skills = edited_data['skills']
            if isinstance(editor_skills, list):
                # Convert editor format to scorer format
                technical = []
                soft = []
                
                for cat in editor_skills:
                    if isinstance(cat, dict) and 'items' in cat and isinstance(cat['items'], list):
                        # Add all items to technical for now, or try to classify
                        # If category name contains "Soft", put in soft
                        cat_name = cat.get('category', '').lower()
                        if 'soft' in cat_name or 'personal' in cat_name:
                            soft.extend(cat['items'])
                        else:
                            technical.extend(cat['items'])
                            
                result['skills'] = {
                    'technical': technical,
                    'soft': soft
                }
        
        # Handle certifications from edited data
        if has_content(edited_data.get('certifications')):
            result['certifications'] = edited_data['certifications']
        
        # Handle languages from edited data
        if has_content(edited_data.get('languages')):
            result['languages'] = edited_data['languages']
        
        # Handle achievements from edited data
        if has_content(edited_data.get('achievements')):
            result['achievements'] = edited_data['achievements']
        
        # Preserve template from edited data if available
        if has_content(edited_data.get('template')):
            result['template'] = edited_data['template']
    
    # Ensure 'contact' and 'summary' keys exist for templates (even if not edited)
    if 'contact' not in result and 'contact_info' in result:
        result['contact'] = result['contact_info']
    if 'summary' not in result and 'professional_summary' in result:
        result['summary'] = result['professional_summary']
    
    return result

def save_resume_version(
    user_id: str,
    resume_id: str,
    version_data: dict,
    job_role: Optional[str] = None,
    company: Optional[str] = None
) -> Optional[dict]:
    """
    Save a new version of the resume.
    Returns the created version metadata.
    """
    from app.firebase import resume_maker_app
    import uuid
    
    # Logic to generate name
    # Default name
    version_name = f"Prativeda – {datetime.now().strftime('%Y-%m-%d %H:%M')} Version"
    
    if company and job_role:
        version_name = f"Prativeda – {company} {job_role} Version"
    elif job_role:
        version_name = f"Prativeda – {job_role} Version"
    elif company:
        version_name = f"Prativeda – {company} Version"
    
    version_id = str(uuid.uuid4())
    created_at = datetime.utcnow()
    
    doc_data = {
        "version_id": version_id,
        "version_name": version_name,
        "job_role": job_role,
        "company": company,
        "json": version_data,
        "created_at": created_at
    }

    if not resume_maker_app:
        print(f"[DEV] Would save version {version_id} for resume {resume_id}")
        return doc_data

    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Save to subcollection
        # users/{userId}/resumes/{resumeId}/versions/{versionId}
        db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .collection('versions').document(version_id)\
          .set(doc_data)
          
        # Update latest_version in main document
        try:
            db.collection('users').document(user_id)\
              .collection('resumes').document(resume_id)\
              .update({"latest_version": version_id})
        except Exception:
            # Main doc might not exist or other issue, logs warning but don't fail version creation
            print(f"Warning: Could not update latest_version on main resume document")
          
        return doc_data
    except Exception as e:
        print(f"Error saving resume version: {e}")
        return None

def list_resume_versions(user_id: str, resume_id: str) -> List[dict]:
    """
    List all versions of a resume from Firestore.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return []
        
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Query subcollection
        docs = db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .collection('versions')\
          .order_by('created_at', direction=firestore.Query.DESCENDING)\
          .stream()
          
        versions = []
        for doc in docs:
            data = doc.to_dict()
            # Convert timestamp
            if 'created_at' in data and data['created_at']:
                ts = data['created_at']
                if hasattr(ts, 'timestamp'):
                    data['created_at'] = datetime.utcfromtimestamp(ts.timestamp())
            versions.append(data)
            
        return versions
    except Exception as e:
        print(f"Error listing resume versions: {e}")
        return []

def get_resume_version(user_id: str, resume_id: str, version_id: str) -> Optional[dict]:
    """
    Get a specific version of a resume.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return None
        
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        doc_ref = db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .collection('versions').document(version_id)
          
        doc_snap = doc_ref.get()
        
        if not doc_snap.exists:
            return None
            
        data = doc_snap.to_dict()
        
        # Convert timestamp
        if 'created_at' in data and data['created_at']:
            ts = data['created_at']
            if hasattr(ts, 'timestamp'):
                data['created_at'] = datetime.utcfromtimestamp(ts.timestamp())
                
        return data
    except Exception as e:
        print(f"Error getting resume version: {e}")
        return None

def delete_resume_version(user_id: str, resume_id: str, version_id: str) -> bool:
    """
    Delete a specific version of a resume.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return False
        
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        doc_ref = db.collection('users').document(user_id)\
          .collection('resumes').document(resume_id)\
          .collection('versions').document(version_id)
          
        doc_ref.delete()
        return True
    except Exception as e:
        print(f"Error deleting resume version: {e}")
        return False
