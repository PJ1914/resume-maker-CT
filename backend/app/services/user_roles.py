"""
User roles and permissions management
"""
from typing import Optional, List
from datetime import datetime
import logging

# Admin email list - configure via environment or database
# For now, we'll use Firestore to store admin list
SYSTEM_ADMINS = [
    # Add system admin emails here as fallback
    # "admin@codetapasya.com",
]

def is_user_admin(user_email: str, user_id: str) -> bool:
    """
    Check if a user is an admin.
    
    Args:
        user_email: User's email address
        user_id: User's Firebase UID
        
    Returns:
        True if user is admin, False otherwise
    """
    from app.firebase import resume_maker_app
    
    # Check system admin list first
    if user_email.lower() in SYSTEM_ADMINS:
        return True
    
    if not resume_maker_app:
        logging.info("[DEV] Admin check for %s: False (Firebase not configured)", user_email)
        return False
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Check if user is in admins collection
        admin_doc = db.collection('admins').document(user_id).get()
        
        if admin_doc.exists:
            data = admin_doc.to_dict()
            return data.get('is_admin', False) and data.get('active', True)
        
        return False
    except Exception as e:
        logging.exception("Error checking admin status")
        return False


def add_admin(user_id: str, user_email: str, added_by: str = "system") -> bool:
    """
    Add a user to the admins list.
    
    Args:
        user_id: User's Firebase UID
        user_email: User's email address
        added_by: UID of admin who added this user
        
    Returns:
        Success boolean
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        logging.info("[DEV] Would add admin: %s", user_email)
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        admin_data = {
            'user_id': user_id,
            'email': user_email,
            'is_admin': True,
            'active': True,
            'added_by': added_by,
            'added_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        
        db.collection('admins').document(user_id).set(admin_data)
        
        logging.info("Added admin: %s (%s)", user_email, user_id)
        return True
    except Exception as e:
        logging.exception("Error adding admin")
        return False


def remove_admin(user_id: str) -> bool:
    """
    Remove a user from the admins list.
    
    Args:
        user_id: User's Firebase UID
        
    Returns:
        Success boolean
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        logging.info("[DEV] Would remove admin: %s", user_id)
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Soft delete - set active to False
        db.collection('admins').document(user_id).update({
            'active': False,
            'updated_at': datetime.utcnow(),
        })
        
        logging.info("Removed admin: %s", user_id)
        return True
    except Exception as e:
        logging.exception("Error removing admin")
        return False


def list_admins() -> List[dict]:
    """
    List all active admins.
    
    Returns:
        List of admin user dicts
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return []
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        docs = db.collection('admins').where('active', '==', True).stream()
        
        admins = []
        for doc in docs:
            data = doc.to_dict()
            admins.append({
                'user_id': data.get('user_id'),
                'email': data.get('email'),
                'added_at': data.get('added_at'),
                'added_by': data.get('added_by'),
            })
        
        return admins
    except Exception as e:
        logging.exception("Error listing admins")
        return []
