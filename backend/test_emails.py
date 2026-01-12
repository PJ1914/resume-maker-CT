"""
Email Testing Script - Run this to test all email triggers
Usage: python test_emails.py
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_EMAIL = "test@example.com"  # Replace with your email for testing

# You'll need a valid Firebase ID token for authentication
# Get this from the frontend after logging in
AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiUHJhbmF5IEp1bWJhcnRoaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJX3IybW9yRTNlYkNJVUV5cDhFdURpbk1rYXJkSXN0MWx2T1Bza0tJQlExZkZBMjJnYkpBPXM5Ni1jIiwicm9sZSI6ImFkbWluIiwiYWRtaW4iOnRydWUsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS92cHNoYXJlLTQ5NWVjIiwiYXVkIjoidnBzaGFyZS00OTVlYyIsImF1dGhfdGltZSI6MTc2NzM2ODIwMiwidXNlcl9pZCI6InpJblZqcDBzMXVNVlJuWnZQT2t2UE5mNzIwTDIiLCJzdWIiOiJ6SW5WanAwczF1TVZSblp2UE9rdlBOZjcyMEwyIiwiaWF0IjoxNzY4MTQ5MTIzLCJleHAiOjE3NjgxNTI3MjMsImVtYWlsIjoicHJhbmF5Lmp1bWJhcnRoaTE5MDVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDgwMzM5NTU1MjM5NjY2ODk0ODQiXSwiZ2l0aHViLmNvbSI6WyIxNTI1OTA5NDUiXSwiZW1haWwiOlsicHJhbmF5Lmp1bWJhcnRoaTE5MDVAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.IIwTJMS5gFmUhZF7YFpfMEunSUXdscy3Nmy5SuObJHUW28nanOzXutdbOfhIzu7Jnqx1NH6S9-XQ8dIyq0TdN8Ft7p6QP2eEmrp2XIYDJqaPJOsovbohCb6RJA7hOlj7TAFtoSLRNIb59e9SYxAHzfJ73s6ezHtnBuY7AFYgQ03XcervadeKYwa973YMRuUEwc3Ix4Xtb3iNMx6MbqJ8b6nfQfPjBPAC1-D-Ku2SvtiJcFIxjBEjdOV9vdOuj3xn4QtxaXicKG3zBT4MwvQSvt7rIB3FOta7qNgL8SH8W1N6o03e6-C2eG_51a-c7DN5K3L2RjzlPj83IZMsaltiAg"  # Replace with actual token

def test_all_emails():
    """Test all 15 email triggers"""
    
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print("=" * 80)
    print("📧 EMAIL TRIGGER TESTING - DEV MODE")
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
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("\n⚠️  Make sure the backend server is running:")
        print("   cd backend")
        print("   uvicorn app.main:app --reload")
        return
    
    # Test all emails
    print("\n📨 Testing all email triggers...")
    print("-" * 80)
    
    try:
        response = requests.post(
            f"{BASE_URL}/test-emails/all",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n{data['message']}")
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
                print(f"\n💡 Note: {data['note']}")
                print("   All emails are logged to the terminal/console output.")
                print("   Check your backend server logs to see the email previews!")
            
            print("\n" + "=" * 80)
            print("✅ EMAIL TESTING COMPLETE")
            print("=" * 80)
            
        elif response.status_code == 401:
            print("\n❌ Authentication failed!")
            print("   Please update AUTH_TOKEN in this script with a valid Firebase ID token.")
            print("   You can get this from the frontend after logging in.")
        else:
            print(f"\n❌ Test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")


def test_single_email(email_type):
    """Test a single email type"""
    
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print(f"\n📧 Testing {email_type} email...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/test-emails/single/{email_type}",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data['message']}")
            print(f"   Recipient: {data['recipient']}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║                   EMAIL TRIGGER TEST SUITE                          ║
║                   Prativeda Resume Maker                            ║
╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    print("⚠️  BEFORE RUNNING THIS SCRIPT:")
    print("1. Make sure backend server is running (uvicorn app.main:app --reload)")
    print("2. Make sure EMAIL_DEV_MODE=True in your .env file")
    print("3. Update AUTH_TOKEN in this script with a valid Firebase ID token")
    print("4. You can get the token from frontend localStorage after logging in")
    print()
    
    # Check if token is set
    if AUTH_TOKEN == "YOUR_FIREBASE_ID_TOKEN_HERE":
        print("❌ ERROR: Please set AUTH_TOKEN before running!")
        print("   1. Log in to your app in the browser")
        print("   2. Open browser console (F12)")
        print("   3. Run: localStorage.getItem('idToken')")
        print("   4. Copy the token and paste it in this script")
        print()
        
        # Offer to test without auth (will show how to get auth)
        response = input("Do you want to test the health endpoint (no auth required)? (y/n): ")
        if response.lower() == 'y':
            try:
                resp = requests.get(f"{BASE_URL}/test-emails/health")
                if resp.status_code == 200:
                    print("\n✅ Server is running!")
                    print(f"   Response: {json.dumps(resp.json(), indent=2)}")
                else:
                    print(f"\n❌ Server responded with: {resp.status_code}")
            except Exception as e:
                print(f"\n❌ Cannot connect to server: {e}")
    else:
        # Run the tests
        test_all_emails()
        
        print("\n" + "=" * 80)
        print("💡 WHAT TO CHECK:")
        print("=" * 80)
        print("1. All email previews should appear in your backend terminal")
        print("2. Each preview shows email type, recipient, and metadata")
        print("3. If EMAIL_DEV_MODE=True, emails are NOT sent (only logged)")
        print("4. If EMAIL_DEV_MODE=False, emails are sent via AWS SES")
        print()
        print("📝 TO ENABLE REAL EMAIL SENDING IN PRODUCTION:")
        print("   Set EMAIL_DEV_MODE=False in your production .env file")
        print("=" * 80)
