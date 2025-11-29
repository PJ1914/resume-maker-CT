"""
Firebase Storage Bucket Setup Script
Creates the Firebase Storage bucket if it doesn't exist
"""

import firebase_admin
from firebase_admin import credentials, storage
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings

def setup_storage_bucket():
    """Initialize Firebase Storage bucket"""
    
    print("🔧 Setting up Firebase Storage...")
    print(f"Project: resume-maker-ct")
    print(f"Bucket: {settings.STORAGE_BUCKET_NAME}")
    print()
    
    # Check if service account exists
    if not os.path.exists(settings.RESUME_MAKER_SERVICE_ACCOUNT_PATH):
        print(f"❌ Service account not found: {settings.RESUME_MAKER_SERVICE_ACCOUNT_PATH}")
        return False
    
    try:
        # Initialize Firebase Admin
        cred = credentials.Certificate(settings.RESUME_MAKER_SERVICE_ACCOUNT_PATH)
        
        # Don't specify storageBucket in options initially
        app = firebase_admin.initialize_app(cred)
        
        print("✅ Firebase Admin initialized")
        
        # Try to access the bucket
        try:
            bucket = storage.bucket(settings.STORAGE_BUCKET_NAME, app=app)
            
            # Test if bucket exists by trying to list files
            blobs = list(bucket.list_blobs(max_results=1))
            print(f"✅ Storage bucket exists: {settings.STORAGE_BUCKET_NAME}")
            print(f"   Bucket is accessible and ready to use")
            return True
            
        except Exception as e:
            if "404" in str(e) or "not found" in str(e).lower():
                print(f"❌ Bucket does not exist: {settings.STORAGE_BUCKET_NAME}")
                print()
                print("📋 To create the bucket, follow these steps:")
                print()
                print("1. Go to Firebase Console:")
                print(f"   https://console.firebase.google.com/project/resume-maker-ct/storage")
                print()
                print("2. Click 'Get Started' button")
                print()
                print("3. Choose 'Start in production mode'")
                print()
                print("4. Select a location (choose closest region):")
                print("   - us-central1 (Iowa)")
                print("   - us-east1 (South Carolina)")
                print("   - europe-west1 (Belgium)")
                print("   - asia-southeast1 (Singapore)")
                print()
                print("5. Click 'Done'")
                print()
                print("The bucket will be created automatically with name:")
                print(f"   {settings.STORAGE_BUCKET_NAME}")
                print()
                return False
            else:
                print(f"❌ Error accessing bucket: {e}")
                return False
                
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")
        return False
    finally:
        # Clean up
        try:
            firebase_admin.delete_app(app)
        except:
            pass

if __name__ == "__main__":
    print("=" * 60)
    print("Firebase Storage Setup")
    print("=" * 60)
    print()
    
    success = setup_storage_bucket()
    
    print()
    print("=" * 60)
    
    if success:
        print("✅ Setup complete! Storage is ready to use.")
        sys.exit(0)
    else:
        print("⚠️  Manual setup required. Follow the instructions above.")
        sys.exit(1)
