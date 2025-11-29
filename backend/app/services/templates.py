"""
Template service for managing user templates
"""
from typing import List, Optional
from datetime import datetime
from app.schemas.resume import ResumeStatus

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
        print(f"[DEV] Would save template: {template.id}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        template_data = template.to_dict()
        print(f"[TEMPLATES] Saving template {template.id} for user {template.owner_uid}")
        print(f"[TEMPLATES] Template data: {template_data}")
        
        # Save to user's templates collection
        db.collection('users').document(template.owner_uid)\
          .collection('templates').document(template.id)\
          .set(template_data)
        
        print(f"[TEMPLATES] Successfully saved template {template.id}")
        return True
    except Exception as e:
        print(f"[ERROR] Error saving template: {e}")
        import traceback
        traceback.print_exc()
        return False

def get_template(template_id: str, user_id: str) -> Optional[Template]:
    """Get template from Firestore"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return None
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        print(f"[TEMPLATES] Getting template {template_id} for user {user_id}")
        doc = db.collection('users').document(user_id)\
               .collection('templates').document(template_id).get()
        
        if not doc.exists:
            print(f"[TEMPLATES] Template {template_id} not found")
            return None
        
        data = doc.to_dict()
        print(f"[TEMPLATES] Retrieved template data: {data}")
        
        # Convert Firestore timestamp to datetime
        for date_field in ['created_at', 'updated_at']:
            if date_field in data and data[date_field] is not None:
                try:
                    ts = data[date_field]
                    if hasattr(ts, 'timestamp'):
                        data[date_field] = datetime.utcfromtimestamp(ts.timestamp())
                except Exception as e:
                    print(f"[WARNING] Could not convert {date_field}: {e}")
        
        return Template(**data)
    except Exception as e:
        print(f"[ERROR] Error getting template: {e}")
        import traceback
        traceback.print_exc()
        return None

def list_user_templates(user_id: str) -> List[Template]:
    """List all templates for a user"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return []
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        print(f"[TEMPLATES] Listing templates for user {user_id}")
        docs = db.collection('users').document(user_id)\
               .collection('templates')\
               .order_by('created_at', direction=firestore.Query.DESCENDING)\
               .stream()
        
        templates = []
        for doc in docs:
            data = doc.to_dict()
            print(f"[TEMPLATES] Processing template: {data.get('id')}")
            
            # Convert Firestore timestamp to datetime
            for date_field in ['created_at', 'updated_at']:
                if date_field in data and data[date_field] is not None:
                    try:
                        ts = data[date_field]
                        if hasattr(ts, 'timestamp'):
                            data[date_field] = datetime.utcfromtimestamp(ts.timestamp())
                    except Exception as e:
                        print(f"[WARNING] Could not convert {date_field}: {e}")
            
            templates.append(Template(**data))
        
        print(f"[TEMPLATES] Found {len(templates)} templates for user {user_id}")
        return templates
    except Exception as e:
        print(f"[ERROR] Error listing templates: {e}")
        import traceback
        traceback.print_exc()
        return []

def delete_template(template_id: str, user_id: str) -> bool:
    """Delete a template"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would delete template: {template_id}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        print(f"[TEMPLATES] Deleting template {template_id} for user {user_id}")
        db.collection('users').document(user_id)\
          .collection('templates').document(template_id).delete()
        
        print(f"[TEMPLATES] Successfully deleted template {template_id}")
        return True
    except Exception as e:
        print(f"[ERROR] Error deleting template: {e}")
        import traceback
        traceback.print_exc()
        return False

def update_template(template: Template) -> bool:
    """Update a template"""
    template.updated_at = datetime.utcnow()
    return save_template(template)
