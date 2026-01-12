"""
Simple Email Testing Script - No Authentication Required
Works in development mode only
Usage: python test_emails_simple.py
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"

def main():
    print("=" * 80)
    print("📧 EMAIL TRIGGER TESTING - SIMPLE MODE (No Auth Required)")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    print("=" * 80)
    
    # Test health check first
    print("\n🔍 Testing email test endpoint health...")
    try:
        response = requests.get(f"{BASE_URL}/test-emails/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed")
            print(f"   Email Dev Mode: {data.get('email_dev_mode')}")
            print(f"   Environment: {data.get('environment')}")
            
            if data.get('environment') != 'development':
                print(f"\n❌ ERROR: This test only works in development mode!")
                print(f"   Current environment: {data.get('environment')}")
                return
                
            if not data.get('email_dev_mode'):
                print(f"\n⚠️  WARNING: EMAIL_DEV_MODE is False!")
                print(f"   Emails will be sent via AWS SES (not just logged)")
                response = input("\nDo you want to continue? (y/n): ")
                if response.lower() != 'y':
                    print("Test cancelled.")
                    return
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("\n⚠️  Make sure the backend server is running:")
        print("   cd backend")
        print("   uvicorn app.main:app --reload")
        return
    
    # Test all emails (no authentication required)
    print("\n📨 Testing all email triggers (no auth required)...")
    print("-" * 80)
    
    try:
        response = requests.post(f"{BASE_URL}/test-emails/dev/all")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n✅ {data['message']}")
            print(f"\n📊 Summary:")
            print(f"   Total Tests: {data['summary']['total_tests']}")
            print(f"   Successful: {data['summary']['successful']}")
            print(f"   Failed: {data['summary']['failed']}")
            print(f"   Email Dev Mode: {data['summary']['email_dev_mode']}")
            
            print(f"\n📋 Individual Results:")
            for email_type, result in data['results'].items():
                status_emoji = "✅" if "✅" in result['status'] else "❌"
                email_name = email_type.replace("_", " ").title()
                print(f"   {status_emoji} {email_name}: {result['status']}")
            
            if data['summary']['email_dev_mode']:
                print(f"\n💡 {data['note']}")
                print("\n" + "=" * 80)
                print("🎯 WHAT TO CHECK IN YOUR BACKEND TERMINAL:")
                print("=" * 80)
                print("You should see 15 email previews that look like this:")
                print()
                print("=" * 80)
                print("📧 [DEV MODE] Email Preview:")
                print("   Type: welcome")
                print("   To: test@example.com")
                print("   Metadata: {'name': 'Test User', 'app_name': '...'}")
                print("=" * 80)
                print("⚠️  EMAIL_DEV_MODE is ON - Email not actually sent!")
                print("=" * 80)
                print()
                print("👆 Look for these in your backend server terminal!")
            
            print("\n" + "=" * 80)
            print("✅ EMAIL TESTING COMPLETE")
            print("=" * 80)
            
        elif response.status_code == 403:
            data = response.json()
            print(f"\n❌ Access denied: {data.get('detail')}")
            print("\n💡 This endpoint only works when:")
            print("   1. ENVIRONMENT=development")
            print("   2. EMAIL_DEV_MODE=True")
            print("\nCheck your backend/.env file")
        else:
            print(f"\n❌ Test failed: {response.status_code}")
            try:
                print(f"   Response: {response.json()}")
            except:
                print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║              SIMPLE EMAIL TRIGGER TEST SUITE                        ║
║              No Authentication Required                             ║
║              Prativeda Resume Maker                                 ║
╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    print("✅ REQUIREMENTS:")
    print("1. Backend server running (uvicorn app.main:app --reload)")
    print("2. EMAIL_DEV_MODE=True in .env file")
    print("3. ENVIRONMENT=development in .env file")
    print()
    print("🚀 Starting tests...\n")
    
    main()
    
    print("\n" + "=" * 80)
    print("💡 NEXT STEPS:")
    print("=" * 80)
    print("1. Check your backend terminal for 15 email previews")
    print("2. Each preview shows the email type, recipient, and all data")
    print("3. If all previews appear, email system is working perfectly!")
    print("4. For production: Set EMAIL_DEV_MODE=False to send real emails")
    print("=" * 80)
