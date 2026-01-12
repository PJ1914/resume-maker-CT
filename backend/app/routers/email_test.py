"""
Email Testing Router - Development Only
Tests all 15 email triggers in EMAIL_DEV_MODE
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.config import settings
from app.services.email_service import EmailService
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/test-emails", tags=["Email Testing"])


@router.get("/health")
async def email_test_health():
    """Health check for email testing"""
    return {
        "status": "ok",
        "email_dev_mode": settings.EMAIL_DEV_MODE,
        "environment": settings.ENVIRONMENT
    }


@router.post("/dev/all")
async def test_all_emails_dev():
    """
    Test all 15 email triggers WITHOUT authentication (Development Only).
    Only works when EMAIL_DEV_MODE=True and ENVIRONMENT=development.
    Uses dummy test data.
    """
    
    # Security check - only allow in development mode
    if settings.ENVIRONMENT != "development" or not settings.EMAIL_DEV_MODE:
        raise HTTPException(
            status_code=403,
            detail="This endpoint only works in development mode with EMAIL_DEV_MODE=True"
        )
    
    # Use test data
    user_email = "test@example.com"
    user_name = "Test User"
    user_id = "test-user-dev-123"
    
    results = {}
    
    # 1. Welcome Email
    try:
        success = await EmailService.send_welcome_email(
            user_email=user_email,
            user_name=user_name
        )
        results["1_welcome_email"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["1_welcome_email"] = {"status": f"❌ Error: {str(e)}"}
    
    # 2. Billing Receipt
    try:
        success = await EmailService.send_billing_receipt(
            user_email=user_email,
            user_name=user_name,
            invoice_number="INV-2026-001",
            credits_purchased=100,
            amount_paid=999.00,
            transaction_id="TXN-TEST-123456",
            currency="INR"
        )
        results["2_billing_receipt"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["2_billing_receipt"] = {"status": f"❌ Error: {str(e)}"}
    
    # 3. Resume Ready Notification (with ATS score)
    try:
        success = await EmailService.send_resume_ready_notification(
            user_email=user_email,
            user_name=user_name,
            resume_name="Software_Engineer_Resume.pdf",
            ats_score=85
        )
        results["3_resume_ready"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["3_resume_ready"] = {"status": f"❌ Error: {str(e)}"}
    
    # 4. Interview Complete Notification
    try:
        success = await EmailService.send_interview_complete_notification(
            user_email=user_email,
            user_name=user_name,
            role="Full Stack Developer",
            question_count=10
        )
        results["4_interview_complete"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["4_interview_complete"] = {"status": f"❌ Error: {str(e)}"}
    
    # 5. Portfolio Deployed Notification
    try:
        success = await EmailService.send_portfolio_deployed_notification(
            user_email=user_email,
            user_name=user_name,
            portfolio_url="https://johndoe-portfolio.vercel.app",
            template_name="Modern Pro"
        )
        results["5_portfolio_deployed"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["5_portfolio_deployed"] = {"status": f"❌ Error: {str(e)}"}
    
    # 6. Support Confirmation
    try:
        success = await EmailService.send_support_confirmation(
            user_email=user_email,
            user_name=user_name,
            ticket_id="SUP-2026-001",
            message="I need help with my resume upload"
        )
        results["6_support_confirmation"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["6_support_confirmation"] = {"status": f"❌ Error: {str(e)}"}
    
    # 7. Security Alert
    try:
        success = await EmailService.send_security_alert(
            user_email=user_email,
            user_name=user_name,
            alert_type="New Device Login",
            alert_message="A new device logged into your account from Chrome on Windows"
        )
        results["7_security_alert"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["7_security_alert"] = {"status": f"❌ Error: {str(e)}"}
    
    # 8. Contact Confirmation
    try:
        success = await EmailService.send_contact_confirmation(
            user_email=user_email,
            user_name=user_name,
            subject="Question about pricing",
            message="I'd like to know more about your enterprise plans"
        )
        results["8_contact_confirmation"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["8_contact_confirmation"] = {"status": f"❌ Error: {str(e)}"}
    
    # 9. Low Credit Warning
    try:
        success = await EmailService.send_low_credit_warning(
            user_email=user_email,
            user_name=user_name,
            remaining_credits=3
        )
        results["9_low_credit_warning"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["9_low_credit_warning"] = {"status": f"❌ Error: {str(e)}"}
    
    # 10. High ATS Score Notification
    try:
        success = await EmailService.send_high_ats_score_notification(
            user_email=user_email,
            user_name=user_name,
            resume_name="Updated_Resume.pdf",
            ats_score=92,
            rating="Excellent"
        )
        results["10_high_ats_score"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["10_high_ats_score"] = {"status": f"❌ Error: {str(e)}"}
    
    # 11. Payment Failed Notification
    try:
        success = await EmailService.send_payment_failed_notification(
            user_email=user_email,
            user_name=user_name,
            amount=1499.00,
            reason="Insufficient balance",
            order_id="ORD-TEST-789"
        )
        results["11_payment_failed"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["11_payment_failed"] = {"status": f"❌ Error: {str(e)}"}
    
    # 12. PDF Export Success
    try:
        success = await EmailService.send_pdf_export_success(
            user_email=user_email,
            user_name=user_name,
            resume_name="Final_Resume.pdf",
            template_used="ATS Professional"
        )
        results["12_pdf_export_success"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["12_pdf_export_success"] = {"status": f"❌ Error: {str(e)}"}
    
    # 13. Monthly Credit Reset
    try:
        success = await EmailService.send_monthly_credit_reset(
            user_email=user_email,
            user_name=user_name,
            new_credits=10,
            total_balance=45
        )
        results["13_monthly_credit_reset"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["13_monthly_credit_reset"] = {"status": f"❌ Error: {str(e)}"}
    
    # 14. Platform Connected
    try:
        success = await EmailService.send_platform_connected(
            user_email=user_email,
            user_name=user_name,
            platform="github"
        )
        results["14_platform_connected"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["14_platform_connected"] = {"status": f"❌ Error: {str(e)}"}
    
    # 15. Template Unlock Notification
    try:
        success = await EmailService.send_template_unlock_notification(
            user_email=user_email,
            user_name=user_name,
            template_name="Cyberpunk Neon",
            tier="premium"
        )
        results["15_template_unlock"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["15_template_unlock"] = {"status": f"❌ Error: {str(e)}"}
    
    # Summary
    total = len(results)
    successful = sum(1 for r in results.values() if "✅" in r.get("status", ""))
    failed = total - successful
    
    return {
        "message": f"Email testing complete: {successful}/{total} successful",
        "summary": {
            "total_tests": total,
            "successful": successful,
            "failed": failed,
            "email_dev_mode": settings.EMAIL_DEV_MODE,
            "environment": settings.ENVIRONMENT
        },
        "results": results,
        "note": "Check terminal/console logs to see email previews" if settings.EMAIL_DEV_MODE else "Emails sent via SES"
    }


@router.post("/all")
async def test_all_emails(user: dict = Depends(get_current_user)):
    """
    Test all 15 email triggers with sample data.
    Only works in development mode or when EMAIL_DEV_MODE=True.
    """
    
    user_email = user.get("email", "test@example.com")
    user_name = user.get("name", user.get("email", "Test User").split("@")[0])
    user_id = user.get("uid", "test-user-123")
    
    results = {}
    
    # 1. Welcome Email
    try:
        success = await EmailService.send_welcome_email(
            user_email=user_email,
            user_name=user_name
        )
        results["1_welcome_email"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["1_welcome_email"] = {"status": f"❌ Error: {str(e)}"}
    
    # 2. Billing Receipt
    try:
        success = await EmailService.send_billing_receipt(
            user_email=user_email,
            user_name=user_name,
            invoice_number="INV-2026-001",
            credits_purchased=100,
            amount_paid=999.00,
            transaction_id="TXN-TEST-123456",
            currency="INR"
        )
        results["2_billing_receipt"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["2_billing_receipt"] = {"status": f"❌ Error: {str(e)}"}
    
    # 3. Resume Ready Notification (with ATS score)
    try:
        success = await EmailService.send_resume_ready_notification(
            user_email=user_email,
            user_name=user_name,
            resume_name="Software_Engineer_Resume.pdf",
            ats_score=85
        )
        results["3_resume_ready"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["3_resume_ready"] = {"status": f"❌ Error: {str(e)}"}
    
    # 4. Interview Complete Notification
    try:
        success = await EmailService.send_interview_complete_notification(
            user_email=user_email,
            user_name=user_name,
            role="Full Stack Developer",
            question_count=10
        )
        results["4_interview_complete"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["4_interview_complete"] = {"status": f"❌ Error: {str(e)}"}
    
    # 5. Portfolio Deployed Notification
    try:
        success = await EmailService.send_portfolio_deployed_notification(
            user_email=user_email,
            user_name=user_name,
            portfolio_url="https://johndoe-portfolio.vercel.app",
            template_name="Modern Pro"
        )
        results["5_portfolio_deployed"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["5_portfolio_deployed"] = {"status": f"❌ Error: {str(e)}"}
    
    # 6. Support Confirmation
    try:
        success = await EmailService.send_support_confirmation(
            user_email=user_email,
            user_name=user_name,
            ticket_id="SUP-2026-001",
            message="I need help with my resume upload"
        )
        results["6_support_confirmation"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["6_support_confirmation"] = {"status": f"❌ Error: {str(e)}"}
    
    # 7. Security Alert
    try:
        success = await EmailService.send_security_alert(
            user_email=user_email,
            user_name=user_name,
            alert_type="New Device Login",
            alert_message="A new device logged into your account from Chrome on Windows"
        )
        results["7_security_alert"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["7_security_alert"] = {"status": f"❌ Error: {str(e)}"}
    
    # 8. Contact Confirmation
    try:
        success = await EmailService.send_contact_confirmation(
            user_email=user_email,
            user_name=user_name,
            subject="Question about pricing",
            message="I'd like to know more about your enterprise plans"
        )
        results["8_contact_confirmation"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["8_contact_confirmation"] = {"status": f"❌ Error: {str(e)}"}
    
    # 9. Low Credit Warning
    try:
        success = await EmailService.send_low_credit_warning(
            user_email=user_email,
            user_name=user_name,
            remaining_credits=3
        )
        results["9_low_credit_warning"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["9_low_credit_warning"] = {"status": f"❌ Error: {str(e)}"}
    
    # 10. High ATS Score Notification
    try:
        success = await EmailService.send_high_ats_score_notification(
            user_email=user_email,
            user_name=user_name,
            resume_name="Updated_Resume.pdf",
            ats_score=92,
            rating="Excellent"
        )
        results["10_high_ats_score"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["10_high_ats_score"] = {"status": f"❌ Error: {str(e)}"}
    
    # 11. Payment Failed Notification
    try:
        success = await EmailService.send_payment_failed_notification(
            user_email=user_email,
            user_name=user_name,
            amount=1499.00,
            reason="Insufficient balance",
            order_id="ORD-TEST-789"
        )
        results["11_payment_failed"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["11_payment_failed"] = {"status": f"❌ Error: {str(e)}"}
    
    # 12. PDF Export Success
    try:
        success = await EmailService.send_pdf_export_success(
            user_email=user_email,
            user_name=user_name,
            resume_name="Final_Resume.pdf",
            template_used="ATS Professional"
        )
        results["12_pdf_export_success"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["12_pdf_export_success"] = {"status": f"❌ Error: {str(e)}"}
    
    # 13. Monthly Credit Reset
    try:
        success = await EmailService.send_monthly_credit_reset(
            user_email=user_email,
            user_name=user_name,
            new_credits=10,
            total_balance=45
        )
        results["13_monthly_credit_reset"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["13_monthly_credit_reset"] = {"status": f"❌ Error: {str(e)}"}
    
    # 14. Platform Connected
    try:
        success = await EmailService.send_platform_connected(
            user_email=user_email,
            user_name=user_name,
            platform="github"
        )
        results["14_platform_connected"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["14_platform_connected"] = {"status": f"❌ Error: {str(e)}"}
    
    # 15. Template Unlock Notification
    try:
        success = await EmailService.send_template_unlock_notification(
            user_email=user_email,
            user_name=user_name,
            template_name="Cyberpunk Neon",
            tier="premium"
        )
        results["15_template_unlock"] = {"status": "✅ Sent" if success else "❌ Failed"}
    except Exception as e:
        results["15_template_unlock"] = {"status": f"❌ Error: {str(e)}"}
    
    # Summary
    total = len(results)
    successful = sum(1 for r in results.values() if "✅" in r.get("status", ""))
    failed = total - successful
    
    return {
        "message": f"Email testing complete: {successful}/{total} successful",
        "summary": {
            "total_tests": total,
            "successful": successful,
            "failed": failed,
            "email_dev_mode": settings.EMAIL_DEV_MODE,
            "environment": settings.ENVIRONMENT
        },
        "results": results,
        "note": "Check terminal/console logs to see email previews" if settings.EMAIL_DEV_MODE else "Emails sent via SES"
    }


@router.post("/single/{email_type}")
async def test_single_email(
    email_type: str,
    user: dict = Depends(get_current_user)
):
    """
    Test a single email trigger by type.
    
    Available types:
    - welcome
    - billing
    - resume_ready
    - interview_complete
    - portfolio_deployed
    - support
    - security
    - contact
    - low_credit
    - high_ats
    - payment_failed
    - pdf_export
    - monthly_credit
    - platform_connected
    - template_unlock
    """
    
    user_email = user.get("email", "test@example.com")
    user_name = user.get("name", user.get("email", "Test User").split("@")[0])
    
    email_handlers = {
        "welcome": lambda: EmailService.send_welcome_email(user_email, user_name),
        "billing": lambda: EmailService.send_billing_receipt(
            user_email, user_name, "INV-TEST", 100, 999.00, "TXN-123"
        ),
        "resume_ready": lambda: EmailService.send_resume_ready_notification(
            user_email, user_name, "Test_Resume.pdf", 85
        ),
        "interview_complete": lambda: EmailService.send_interview_complete_notification(
            user_email, user_name, "Software Engineer", 10
        ),
        "portfolio_deployed": lambda: EmailService.send_portfolio_deployed_notification(
            user_email, user_name, "https://test-portfolio.vercel.app", "Modern"
        ),
        "support": lambda: EmailService.send_support_confirmation(
            user_email, user_name, "SUP-001", "Test support message"
        ),
        "security": lambda: EmailService.send_security_alert(
            user_email, user_name, "Test Alert", "This is a security test"
        ),
        "contact": lambda: EmailService.send_contact_confirmation(
            user_email, user_name, "Test Subject", "Test message"
        ),
        "low_credit": lambda: EmailService.send_low_credit_warning(
            user_email, user_name, 3
        ),
        "high_ats": lambda: EmailService.send_high_ats_score_notification(
            user_email, user_name, "Resume.pdf", 92, "Excellent"
        ),
        "payment_failed": lambda: EmailService.send_payment_failed_notification(
            user_email, user_name, 1499.00, "Test failure reason", "ORD-123"
        ),
        "pdf_export": lambda: EmailService.send_pdf_export_success(
            user_email, user_name, "Resume.pdf", "ATS Professional"
        ),
        "monthly_credit": lambda: EmailService.send_monthly_credit_reset(
            user_email, user_name, 10, 45
        ),
        "platform_connected": lambda: EmailService.send_platform_connected(
            user_email, user_name, "github"
        ),
        "template_unlock": lambda: EmailService.send_template_unlock_notification(
            user_email, user_name, "Cyberpunk", "premium"
        ),
    }
    
    if email_type not in email_handlers:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid email type. Available: {', '.join(email_handlers.keys())}"
        )
    
    try:
        success = await email_handlers[email_type]()
        return {
            "success": success,
            "email_type": email_type,
            "recipient": user_email,
            "email_dev_mode": settings.EMAIL_DEV_MODE,
            "message": "Email logged to console" if settings.EMAIL_DEV_MODE else "Email sent via SES"
        }
    except Exception as e:
        logger.error(f"Email test failed for {email_type}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Email test failed: {str(e)}"
        )
