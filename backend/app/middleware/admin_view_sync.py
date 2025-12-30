"""
Middleware to auto-sync users to admin view on first API request.

This ensures users_admin_view stays in sync even though Auth is in a different Firebase project.
"""

from fastapi import Request
from firebase_admin import auth, firestore
from app.firebase import codetapasya_app, resume_maker_app
from google.cloud.firestore_v1.base_query import FieldFilter
import logging

logger = logging.getLogger(__name__)


async def ensure_user_in_admin_view(request: Request, call_next):
    """
    Middleware that syncs authenticated users to users_admin_view collection.
    
    Flow:
    1. User logs in → Frontend sends request with auth token
    2. Middleware decodes token → Gets user UID
    3. Check if user exists in users_admin_view
    4. If not, create entry (new user auto-sync!)
    5. Continue with request
    
    Cost: 1 read + 1 write per new user (one-time)
    """
    response = await call_next(request)
    
    # Only sync on authenticated requests
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return response
    
    # Skip admin endpoints and static files
    if request.url.path.startswith("/api/admin") or request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
        return response
    
    try:
        # Decode token to get user UID
        token = auth_header.split(" ")[1]
        
        if codetapasya_app and resume_maker_app:
            # Verify token and get user info
            from app.firebase import verify_firebase_token
            decoded_token = await verify_firebase_token(token)
            
            if not decoded_token:
                return response
            
            user_id = decoded_token.get("uid")
            
            if user_id:
                db = firestore.client(app=resume_maker_app)
                
                # Check if user exists in admin view (1 read)
                admin_doc = db.collection('users_admin_view').document(user_id).get()
                
                if not admin_doc.exists:
                    # New user! Sync to admin view
                    logger.info(f"New user detected, syncing to admin view: {user_id}")
                    
                    # Get full user data from Auth
                    user = auth.get_user(user_id, app=codetapasya_app)
                    
                    # Get credits and resumes
                    credits_balance = 0
                    try:
                        balance_doc = db.collection('users').document(user_id).collection('credits').document('balance').get()
                        if balance_doc.exists:
                            credits_balance = int(balance_doc.to_dict().get('balance', 0))
                    except:
                        pass
                    
                    resumes_count = 0
                    try:
                        resumes_ref = db.collection('resumes').where(
                            filter=FieldFilter('user_id', '==', user_id)
                        ).select([]).stream()
                        resumes_count = sum(1 for _ in resumes_ref)
                    except:
                        pass
                    
                    # Create admin view entry (1 write)
                    admin_view_data = {
                        'uid': user_id,
                        'email': user.email,
                        'display_name': user.display_name,
                        'photo_url': user.photo_url,
                        'created_at': user.user_metadata.creation_timestamp,
                        'last_login_at': user.user_metadata.last_sign_in_timestamp or user.user_metadata.creation_timestamp,
                        'disabled': user.disabled,
                        'is_admin': user.custom_claims.get('admin', False) if user.custom_claims else False,
                        'credits_balance': credits_balance,
                        'resumes_count': resumes_count
                    }
                    
                    db.collection('users_admin_view').document(user_id).set(admin_view_data)
                    logger.info(f"✓ Synced new user to admin view: {user_id}")
                
                else:
                    # Existing user - update last_login_at if needed
                    try:
                        user = auth.get_user(user_id, app=codetapasya_app)
                        current_last_login = admin_doc.to_dict().get('last_login_at')
                        new_last_login = user.user_metadata.last_sign_in_timestamp
                        
                        # Update if login timestamp changed
                        if new_last_login and new_last_login != current_last_login:
                            db.collection('users_admin_view').document(user_id).update({
                                'last_login_at': new_last_login
                            })
                    except:
                        pass
                        
    except Exception as e:
        # Don't fail the request if sync fails
        logger.error(f"Error syncing user to admin view: {e}")
    
    return response
