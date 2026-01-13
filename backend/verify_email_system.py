"""
Email System Verification Script
Checks if all email components are properly configured
"""

import os
import sys

def check_file_exists(filepath, description):
    """Check if a file exists"""
    exists = os.path.exists(filepath)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {filepath}")
    return exists

def check_imports():
    """Verify all email-related imports work"""
    print("\n🔍 Checking Python imports...")
    
    try:
        # Set minimal env vars for import testing
        if 'CORS_ORIGINS' not in os.environ:
            os.environ['CORS_ORIGINS'] = 'http://localhost:5173'
        
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))
        
        from app.services.email_service import EmailService
        print("✅ EmailService imported successfully")
        
        from app.routers.email_test import router
        print("✅ email_test router imported successfully")
        
        try:
            from app.config import settings
            print(f"✅ Config loaded - EMAIL_DEV_MODE: {settings.EMAIL_DEV_MODE}")
        except Exception as e:
            print(f"⚠️  Config warning: {e}")
            print("   (This is OK if CORS_ORIGINS not in .env)")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def main():
    print("=" * 80)
    print("📧 EMAIL SYSTEM VERIFICATION")
    print("=" * 80)
    
    base_dir = os.path.dirname(__file__)
    
    # Check critical files
    print("\n📁 Checking files...")
    
    files_to_check = [
        ("app/services/email_service.py", "Email service"),
        ("app/routers/email_test.py", "Email testing router"),
        ("app/config.py", "Configuration"),
        ("test_emails.py", "Test script"),
        (".env", ".env file (optional in dev)"),
    ]
    
    all_exist = True
    for filepath, description in files_to_check:
        full_path = os.path.join(base_dir, filepath)
        exists = check_file_exists(full_path, description)
        if not exists and filepath != ".env":
            all_exist = False
    
    # Check imports
    imports_ok = check_imports()
    
    # Check email functions
    print("\n📨 Checking email functions...")
    try:
        # Set minimal env for imports
        if 'CORS_ORIGINS' not in os.environ:
            os.environ['CORS_ORIGINS'] = 'http://localhost:5173'
            
        from app.services.email_service import EmailService
        
        email_functions = [
            "send_welcome_email",
            "send_billing_receipt",
            "send_resume_ready_notification",
            "send_interview_complete_notification",
            "send_portfolio_deployed_notification",
            "send_support_confirmation",
            "send_security_alert",
            "send_contact_confirmation",
            "send_low_credit_warning",
            "send_high_ats_score_notification",
            "send_payment_failed_notification",
            "send_pdf_export_success",
            "send_monthly_credit_reset",
            "send_platform_connected",
            "send_template_unlock_notification",
        ]
        
        missing_functions = []
        for func_name in email_functions:
            if hasattr(EmailService, func_name):
                print(f"✅ {func_name}")
            else:
                print(f"❌ {func_name} - MISSING!")
                missing_functions.append(func_name)
        
        functions_ok = len(missing_functions) == 0
        
    except Exception as e:
        print(f"❌ Could not check functions: {e}")
        functions_ok = False
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 80)
    
    if all_exist and imports_ok and functions_ok:
        print("✅ All checks passed! Email system is ready.")
        print("\n📝 Next steps:")
        print("   1. Start backend: uvicorn app.main:app --reload")
        print("   2. Get auth token from browser after login")
        print("   3. Run: python test_emails.py")
        return 0
    else:
        print("❌ Some checks failed. Please review the errors above.")
        if not all_exist:
            print("   - Missing files detected")
        if not imports_ok:
            print("   - Import errors found")
        if not functions_ok:
            print("   - Missing email functions")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
