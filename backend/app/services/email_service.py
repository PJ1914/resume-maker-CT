"""
Email Service - Production-Ready
Handles both automated and manual email sending via AWS SES API.
"""

import httpx
import json
from typing import Dict, List, Optional
from datetime import datetime
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """
    Production email service using AWS SES Lambda API.
    Handles single and bulk email sending.
    """
    
    @staticmethod
    async def send_email(
        email_type: str,
        recipient: str,
        metadata: Dict[str, str],
        timeout: float = 10.0
    ) -> bool:
        """
        Send single email via SES API.
        
        Args:
            email_type: Type of email (welcome, billing, noreply, etc.)
            recipient: Recipient email address
            metadata: Template variables (e.g., {name: "John", amount: "100"})
            timeout: Request timeout in seconds
            
        Returns:
            True if email sent successfully, False otherwise
        """
        # Development mode - just log the email instead of sending
        if settings.EMAIL_DEV_MODE:
            logger.info("=" * 80)
            logger.info("📧 [DEV MODE] Email Preview:")
            logger.info(f"   Type: {email_type}")
            logger.info(f"   To: {recipient}")
            logger.info(f"   Metadata: {metadata}")
            logger.info("=" * 80)
            logger.warning("⚠️  EMAIL_DEV_MODE is ON - Email not actually sent!")
            logger.info("   Set EMAIL_DEV_MODE=False in .env to send real emails")
            logger.info("=" * 80)
            return True
        
        try:
            # Prepare payload - Lambda expects 'body' key (API Gateway format)
            payload = {
                "type": email_type,
                "recipients": [{"email": recipient, "metadata": metadata}]
            }
            
            # Wrap in 'body' to match Lambda's expected format
            lambda_payload = {
                "body": json.dumps(payload)  # Lambda expects body as JSON string
            }
            
            # Debug logging
            logger.info(f"📤 Sending email request to Lambda:")
            logger.info(f"   URL: {settings.EMAIL_API_URL}")
            logger.info(f"   Payload: {payload}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    settings.EMAIL_API_URL,
                    json=lambda_payload,
                    timeout=timeout
                )
                
                if response.status_code == 200:
                    response_data = response.json() if response.text else {}
                    logger.info(f"✅ Email sent: {email_type} to {recipient}")
                    logger.info(f"   SES Response: {response_data}")
                    
                    # Check if email is in sandbox mode warning
                    if "MessageId" in response_data:
                        logger.info(f"   Message ID: {response_data['MessageId']}")
                    
                    return True
                else:
                    logger.error(f"❌ Email failed: {response.status_code} - {response.text}")
                    return False
                    
        except httpx.TimeoutException:
            logger.error(f"❌ Email timeout: {email_type} to {recipient}")
            return False
        except Exception as e:
            logger.error(f"❌ Email error: {str(e)}")
            return False
    
    @staticmethod
    async def send_bulk_email(
        email_type: str,
        recipients: List[Dict[str, any]],
        timeout: float = 30.0
    ) -> Dict[str, int]:
        """
        Send bulk emails via SES API.
        
        Args:
            email_type: Type of email
            recipients: List of {email: str, metadata: dict} dicts
            timeout: Request timeout in seconds
            
        Returns:
            Dict with success/failure counts
        """
        try:
            # Prepare payload
            payload = {
                "type": email_type,
                "recipients": recipients
            }
            
            # Wrap in 'body' to match Lambda's expected format
            lambda_payload = {
                "body": json.dumps(payload)
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    settings.EMAIL_API_URL,
                    json=lambda_payload,
                    timeout=timeout
                )
                
                if response.status_code == 200:
                    logger.info(f"✅ Bulk email sent: {len(recipients)} recipients")
                    return {
                        "sent": len(recipients),
                        "failed": 0,
                        "status": "success"
                    }
                else:
                    logger.error(f"❌ Bulk email failed: {response.status_code}")
                    return {
                        "sent": 0,
                        "failed": len(recipients),
                        "status": "failed"
                    }
                    
        except Exception as e:
            logger.error(f"❌ Bulk email error: {str(e)}")
            return {
                "sent": 0,
                "failed": len(recipients),
                "status": "error",
                "error": str(e)
            }
    
    # ==================== AUTOMATED EMAIL TRIGGERS ====================
    
    @staticmethod
    async def send_welcome_email(user_email: str, user_name: str) -> bool:
        """
        Triggered: After user signup.
        """
        return await EmailService.send_email(
            email_type="welcome",
            recipient=user_email,
            metadata={
                "name": user_name,
                "app_name": "Prativeda Resume Maker",
                "login_url": "https://prativeda.com/login",
                "support_email": "support-prativeda@codetapasya.com",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_billing_receipt(
        user_email: str,
        user_name: str,
        invoice_number: str,
        credits_purchased: int,
        amount_paid: float,
        transaction_id: str,
        currency: str = "INR"
    ) -> bool:
        """
        Triggered: After successful payment.
        """
        currency_symbol = "₹" if currency == "INR" else "$"
        
        return await EmailService.send_email(
            email_type="billing",
            recipient=user_email,
            metadata={
                "invoice_number": invoice_number,
                "date": datetime.now().strftime("%B %d, %Y"),
                "name": user_name,
                "user_email": user_email,
                "product_description": f"{credits_purchased} Credits Purchase",
                "currency_symbol": currency_symbol,
                "amount": f"{amount_paid:.2f}",
                "gstin_number": "29ABCDE1234F1Z5",  # Your company GSTIN
                "transaction_id": transaction_id
            }
        )
    
    @staticmethod
    async def send_resume_ready_notification(
        user_email: str,
        user_name: str,
        resume_name: str,
        ats_score: Optional[int] = None
    ) -> bool:
        """
        Triggered: After resume parsing completes.
        """
        metadata = {
            "name": user_name,
            "resume_name": resume_name,
            "dashboard_url": "https://prativeda.com/resumes",
            "date": datetime.now().strftime("%B %d, %Y")
        }
        
        if ats_score:
            metadata["ats_score"] = str(ats_score)
            metadata["message"] = f"Your resume '{resume_name}' has been processed with an ATS score of {ats_score}/100."
        else:
            metadata["message"] = f"Your resume '{resume_name}' has been processed successfully."
        
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata=metadata
        )
    
    @staticmethod
    async def send_interview_complete_notification(
        user_email: str,
        user_name: str,
        role: str,
        question_count: int
    ) -> bool:
        """
        Triggered: After interview session completes.
        """
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "name": user_name,
                "role": role,
                "question_count": str(question_count),
                "message": f"Your {role} interview prep session with {question_count} questions is complete!",
                "dashboard_url": "https://prativeda.com/interview-prep",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_portfolio_deployed_notification(
        user_email: str,
        user_name: str,
        portfolio_url: str,
        template_name: str
    ) -> bool:
        """
        Triggered: After portfolio deployment succeeds.
        """
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "name": user_name,
                "portfolio_url": portfolio_url,
                "template": template_name,
                "message": f"Your portfolio is now live at {portfolio_url}",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_support_confirmation(
        user_email: str,
        user_name: str,
        ticket_id: str,
        message: str
    ) -> bool:
        """
        Triggered: When user submits support request.
        """
        return await EmailService.send_email(
            email_type="support",
            recipient=user_email,
            metadata={
                "name": user_name,
                "ticket_id": ticket_id,
                "message": message[:200],  # Truncate long messages
                "support_url": "https://prativeda.com/support",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_security_alert(
        user_email: str,
        user_name: str,
        alert_type: str,
        alert_message: str
    ) -> bool:
        """
        Triggered: Security events (password change, suspicious login, etc.)
        """
        return await EmailService.send_email(
            email_type="security",
            recipient=user_email,
            metadata={
                "name": user_name,
                "alert_type": alert_type,
                "message": alert_message,
                "date": datetime.now().strftime("%B %d, %Y %H:%M:%S"),
                "support_email": "security-prativeda@codetapasya.com"
            }
        )
    
    # ==================== NEW EMAIL TRIGGERS (8) ====================
    
    @staticmethod
    async def send_contact_confirmation(
        user_email: str,
        user_name: str,
        subject: str,
        message: str
    ) -> bool:
        """
        Triggered: After user submits contact/support form.
        """
        return await EmailService.send_email(
            email_type="support",
            recipient=user_email,
            metadata={
                "name": user_name,
                "subject": subject,
                "message": message[:500],  # Truncate long messages
                "response_time": "24-48 hours",
                "support_email": "support-prativeda@codetapasya.com",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_low_credit_warning(
        user_email: str,
        user_name: str,
        remaining_credits: int
    ) -> bool:
        """
        Triggered: When user's credit balance drops below 5.
        """
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "name": user_name,
                "remaining_credits": str(remaining_credits),
                "message": f"Your credit balance is low ({remaining_credits} credits remaining). Top up to continue using premium features.",
                "purchase_url": "https://prativeda.com/credits",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_high_ats_score_notification(
        user_email: str,
        user_name: str,
        resume_name: str,
        ats_score: int,
        rating: str
    ) -> bool:
        """
        Triggered: When resume achieves ATS score >= 80.
        """
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "name": user_name,
                "resume_name": resume_name,
                "ats_score": str(ats_score),
                "rating": rating,
                "message": f"🎉 Congratulations! Your resume '{resume_name}' achieved an excellent ATS score of {ats_score}/100 ({rating})!",
                "share_url": "https://prativeda.com/resumes",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_payment_failed_notification(
        user_email: str,
        user_name: str,
        amount: float,
        reason: str,
        order_id: str
    ) -> bool:
        """
        Triggered: When payment verification fails.
        """
        return await EmailService.send_email(
            email_type="billing",
            recipient=user_email,
            metadata={
                "name": user_name,
                "amount": f"{amount:.2f}",
                "currency_symbol": "₹",
                "reason": reason,
                "order_id": order_id,
                "message": f"Your payment of ₹{amount:.2f} could not be processed: {reason}",
                "retry_url": "https://prativeda.com/credits",
                "support_email": "billing-prativeda@codetapasya.com",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_pdf_export_success(
        user_email: str,
        user_name: str,
        resume_name: str,
        template_used: str
    ) -> bool:
        """
        Triggered: After successful PDF export.
        """
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "name": user_name,
                "resume_name": resume_name,
                "template": template_used,
                "message": f"Your resume '{resume_name}' has been exported successfully using {template_used} template.",
                "download_url": "https://prativeda.com/resumes",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_monthly_credit_reset(
        user_email: str,
        user_name: str,
        new_credits: int,
        total_balance: int
    ) -> bool:
        """
        Triggered: After monthly free credits reset.
        """
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "name": user_name,
                "new_credits": str(new_credits),
                "total_balance": str(total_balance),
                "message": f"Your monthly free credits have been refreshed! {new_credits} new credits added. Total balance: {total_balance} credits.",
                "dashboard_url": "https://prativeda.com/dashboard",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_platform_connected(
        user_email: str,
        user_name: str,
        platform: str
    ) -> bool:
        """
        Triggered: After successfully linking GitHub/Vercel/Netlify.
        """
        return await EmailService.send_email(
            email_type="security",
            recipient=user_email,
            metadata={
                "name": user_name,
                "platform": platform.title(),
                "message": f"Your {platform.title()} account has been successfully connected to Prativeda Resume Maker.",
                "connected_at": datetime.now().strftime("%B %d, %Y %H:%M:%S"),
                "security_url": "https://prativeda.com/settings",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
    
    @staticmethod
    async def send_template_unlock_notification(
        user_email: str,
        user_name: str,
        template_name: str,
        tier: str
    ) -> bool:
        """
        Triggered: When user unlocks premium portfolio template.
        """
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "name": user_name,
                "template_name": template_name,
                "tier": tier.upper(),
                "message": f"🎨 You've unlocked the {template_name} ({tier.upper()}) portfolio template!",
                "portfolio_url": "https://prativeda.com/portfolio",
                "date": datetime.now().strftime("%B %d, %Y")
            }
        )
