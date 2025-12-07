import sys
import os
import firebase_admin
from firebase_admin import credentials, auth

def add_admin(uid, email, service_account_path):
    if not os.path.exists(service_account_path):
        print(f"Error: Service account file not found at {service_account_path}")
        return

    cred = credentials.Certificate(service_account_path)
    try:
        app = firebase_admin.initialize_app(cred, name='admin_script')
    except ValueError:
        # App might already be initialized if this script is imported
        app = firebase_admin.get_app('admin_script')

    try:
        # Verify user exists
        try:
            user = auth.get_user(uid, app=app)
            if user.email != email:
                print(f"Warning: User email {user.email} does not match provided email {email}")
                confirm = input("Continue? (y/n): ")
                if confirm.lower() != 'y':
                    return
        except auth.UserNotFoundError:
            print(f"Error: User with UID {uid} not found.")
            return

        # Set custom claims
        current_claims = user.custom_claims or {}
        current_claims['admin'] = True
        
        auth.set_custom_user_claims(uid, current_claims, app=app)
        print(f"Success! User {email} ({uid}) is now an ADMIN (Custom Claims set).")

        # Also add to Firestore 'admins' collection for consistency
        try:
            from firebase_admin import firestore
            # We need to initialize the resume-maker app for Firestore if it's different
            # But here we might be using the same creds or need another one.
            # For simplicity in this script, we'll assume the same app has access or skip if not.
            # If the user provided a service account that has access to both Auth and Firestore, this works.
            # Usually they are different projects in this setup (codetapasya vs resume-maker).
            # If they are different, we need the resume-maker service account path too.
            
            # The user instructions said: python add_admin.py "<uid>" "<email>" "service-account.json"
            # This implies one service account.
            # If the architecture uses two different projects, this script might only handle Auth.
            # Let's just print a warning that they should ensure Firestore is updated if needed.
            print("Note: This script only updates Authentication Custom Claims.")
            print("If your system uses a separate Firestore 'admins' collection, please update it manually or ensure your service account has access.")
            
        except Exception as e:
            print(f"Firestore update skipped: {e}")

        print("They will need to sign out and sign back in for changes to take effect.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python add_admin.py <uid> <email> <service_account_path>")
        sys.exit(1)
    
    uid = sys.argv[1]
    email = sys.argv[2]
    service_account_path = sys.argv[3]
    
    add_admin(uid, email, service_account_path)
