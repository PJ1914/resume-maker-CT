"""
Service for handling contact form submissions.
"""
from datetime import datetime
from typing import Dict, Any

def save_contact_message(message_data: Dict[str, Any]) -> bool:
    """Save contact message to Firestore"""
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would save contact message: {message_data}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Add timestamp
        message_data['created_at'] = datetime.utcnow()
        message_data['status'] = 'new'
        
        # Save to 'contact_messages' collection
        db.collection('contact_messages').add(message_data)
        
        return True
    except Exception as e:
        print(f"Error saving contact message: {e}")
        return False
