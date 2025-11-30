"""
CLI script to add an admin user to the system.

Usage:
    python add_admin.py <user_id> <user_email> <service_account_path>

Example:
    python add_admin.py "abc123xyz" "admin@example.com" "secrets/resume-maker-service-account.json"
"""

import sys
import os
from datetime import datetime

def add_admin_direct(user_id: str, user_email: str, service_account_path: str) -> bool:
    """
    Add admin directly using Firebase Admin SDK without importing app modules.
    """
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        # Check if Firebase app already exists
        try:
            app = firebase_admin.get_app('admin-cli')
        except ValueError:
            # Initialize Firebase Admin SDK
            if not os.path.exists(service_account_path):
                print(f"❌ Service account file not found: {service_account_path}")
                return False
            
            cred = credentials.Certificate(service_account_path)
            app = firebase_admin.initialize_app(cred, name='admin-cli')
        
        # Get Firestore client
        db = firestore.client(app=app)
        
        # Create admin document
        admin_data = {
            'user_id': user_id,
            'email': user_email,
            'is_admin': True,
            'active': True,
            'added_by': 'cli',
            'added_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        
        # Save to Firestore
        db.collection('admins').document(user_id).set(admin_data)
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    if len(sys.argv) < 3:
        print("\nUsage: python add_admin.py <user_id> <user_email> [service_account_path]")
        print("\nExample:")
        print("  python add_admin.py 'abc123xyz' 'admin@example.com' 'secrets/resume-maker-service-account.json'")
        print("\nIf service_account_path is not provided, it will try:")
        print("  - secrets/resume-maker-service-account.json")
        print("  - RESUME_MAKER_SERVICE_ACCOUNT_PATH from .env")
        sys.exit(1)
    
    user_id = sys.argv[1]
    user_email = sys.argv[2]
    
    # Try to get service account path
    service_account_path = None
    if len(sys.argv) >= 4:
        service_account_path = sys.argv[3]
    else:
        # Try default location
        default_path = "secrets/resume-maker-service-account.json"
        if os.path.exists(default_path):
            service_account_path = default_path
        else:
            # Try to read from .env
            try:
                from dotenv import load_dotenv
                load_dotenv()
                service_account_path = os.getenv('RESUME_MAKER_SERVICE_ACCOUNT_PATH')
            except:
                pass
    
    if not service_account_path:
        print("❌ Service account path not provided and not found in default locations.")
        print("\nPlease specify the path to your Firebase service account JSON file:")
        print("  python add_admin.py <user_id> <user_email> <path_to_service_account.json>")
        sys.exit(1)
    
    print(f"\n🔧 Adding admin user...")
    print(f"   User ID: {user_id}")
    print(f"   Email: {user_email}")
    print(f"   Service Account: {service_account_path}\n")
    
    if add_admin_direct(user_id, user_email, service_account_path):
        print("✅ Admin user added successfully!")
        print(f"\n{user_email} now has admin privileges.\n")
    else:
        print("❌ Failed to add admin user. Check the logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
