"""
Template service for managing user templates
"""
from typing import List, Optional
from datetime import datetime
from app.schemas.resume import ResumeStatus
import logging

class Template:
    """Template model"""
    def __init__(
        self,
        id: str,
        name: str,
        type: str,  # 'html' or 'latex'
        content: str,
        owner_uid: str,
        description: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.type = type
        self.content = content
        self.owner_uid = owner_uid
        self.description = description or ""
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        """Convert to dictionary for Firestore"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'content': self.content,
            'owner_uid': self.owner_uid,
            'description': self.description,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }

def save_template(template: Template) -> bool:
    """Save template to Firestore"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        logging.info("[DEV] Would save template: %s", template.id)
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        template_data = template.to_dict()
        logging.info("Saving template %s for user %s", template.id, template.owner_uid)
        logging.debug("Template data: %s", template_data)
        
        # Save to user's templates collection
        db.collection('users').document(template.owner_uid)\
          .collection('templates').document(template.id)\
          .set(template_data)
        
        logging.info("Successfully saved template %s", template.id)
        return True
    except Exception as e:
        logging.exception("Error saving template: %s", str(e))
        return False

def get_template(template_id: str, user_id: str) -> Optional[Template]:
    """Get template from Firestore"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return None
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        logging.info("Getting template %s for user %s", template_id, user_id)
        doc = db.collection('users').document(user_id)\
               .collection('templates').document(template_id).get()
        
        if not doc.exists:
            logging.info("Template %s not found", template_id)
            return None
        
        data = doc.to_dict()
        logging.debug("Retrieved template data: %s", data)
        
        # Convert Firestore timestamp to datetime
        for date_field in ['created_at', 'updated_at']:
            if date_field in data and data[date_field] is not None:
                try:
                    ts = data[date_field]
                    if hasattr(ts, 'timestamp'):
                        data[date_field] = datetime.utcfromtimestamp(ts.timestamp())
                except Exception as e:
                    logging.exception("Could not convert %s: %s", date_field, str(e))
        
        return Template(**data)
    except Exception as e:
        logging.exception("Error getting template: %s", str(e))
        return None

def list_user_templates(user_id: str) -> List[Template]:
    """List all templates for a user"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return []
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        logging.info("Listing templates for user %s", user_id)
        docs = db.collection('users').document(user_id)\
               .collection('templates')\
               .order_by('created_at', direction=firestore.Query.DESCENDING)\
               .stream()
        
        templates = []
        for doc in docs:
            data = doc.to_dict()
            logging.debug("Processing template: %s", data.get('id'))
            
            # Convert Firestore timestamp to datetime
            for date_field in ['created_at', 'updated_at']:
                if date_field in data and data[date_field] is not None:
                    try:
                        ts = data[date_field]
                        if hasattr(ts, 'timestamp'):
                            data[date_field] = datetime.utcfromtimestamp(ts.timestamp())
                    except Exception as e:
                        logging.exception("Could not convert %s: %s", date_field, str(e))
            
            templates.append(Template(**data))
        
        logging.info("Found %s templates for user %s", len(templates), user_id)
        return templates
    except Exception as e:
        logging.exception("Error listing templates: %s", str(e))
        return []

def delete_template(template_id: str, user_id: str) -> bool:
    """Delete a template"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        logging.info("[DEV] Would delete template: %s", template_id)
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)

        logging.info("Deleting template %s for user %s", template_id, user_id)
        db.collection('users').document(user_id)\
          .collection('templates').document(template_id).delete()
        logging.info("Successfully deleted template %s", template_id)
        return True
    except Exception as e:
        logging.exception("Error deleting template: %s", str(e))
        return False

def update_template(template: Template) -> bool:
    """Update a template"""
    template.updated_at = datetime.utcnow()
    return save_template(template)
