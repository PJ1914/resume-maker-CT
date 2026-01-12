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

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger(__name__)


class AIEmailPersonalizer:
    """AI-powered email content personalization using Gemini."""
    
    _model = None
    
    @classmethod
    def _init_gemini(cls):
        """Initialize Gemini model if not already initialized."""
        if cls._model is None and GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            cls._model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    @classmethod
    async def personalize_resume_feedback(cls, resume_name: str, ats_score: Optional[int] = None) -> str:
        """Generate personalized resume feedback that emphasizes Prativeda's partnership."""
        cls._init_gemini()
        if cls._model is None:
            score_text = f" and scored {ats_score}/100 on ATS compatibility" if ats_score else ""
            return f"Your resume '{resume_name}' is ready{score_text}. Prativeda's AI has analyzed it - check your dashboard for detailed improvement suggestions."
        
        try:
            score_context = f" with an ATS score of {ats_score}/100" if ats_score else ""
            prompt = f"""Write 2-3 sentences about resume '{resume_name}'{score_context} being processed by Prativeda.
Tone: Supportive partner helping their career.
Mention: Prativeda's AI analyzed it, specific insights await in dashboard, next steps (improve score/download/create portfolio).
Keep under 60 words. No emojis. Personal and actionable."""
            
            response = cls._model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"AI personalization failed: {e}")
            score_text = f" and scored {ats_score}/100" if ats_score else ""
            return f"Your resume '{resume_name}' is ready{score_text}. Prativeda's AI has analyzed it - check your dashboard for detailed improvement suggestions."
    
    @classmethod
    async def personalize_interview_feedback(cls, role: str, question_count: int) -> str:
        """Generate interview feedback emphasizing Prativeda's support."""
        cls._init_gemini()
        if cls._model is None:
            return f"You've completed {question_count} {role} interview questions with Prativeda. Review your performance insights and keep practicing - we're here to help you ace that interview."
        
        try:
            prompt = f"""Write 2 sentences congratulating completion of {question_count} {role} interview prep questions on Prativeda.
Tone: Encouraging coach supporting interview success.
Mention: Performance analysis ready, keep practicing with Prativeda, confidence building.
Keep under 50 words. No emojis. Motivational and supportive."""
            
            response = cls._model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"AI personalization failed: {e}")
            return f"You've completed {question_count} {role} interview questions with Prativeda. Review your performance insights and keep practicing - we're here to help you ace that interview."
    
    @classmethod
    async def personalize_portfolio_tip(cls, template_name: str) -> str:
        """Generate portfolio success tip emphasizing Prativeda's platform."""
        cls._init_gemini()
        if cls._model is None:
            return f"Prativeda just deployed your portfolio with the {template_name} template. Share it on LinkedIn and let recruiters discover your professional brand."
        
        try:
            prompt = f"""Write 2 sentences celebrating portfolio deployment using '{template_name}' template on Prativeda.
Tone: Proud partner in their success.
Mention: Share on LinkedIn/social media, update resume with portfolio URL, Prativeda made it easy.
Keep under 50 words. No emojis. Encouraging and actionable."""
            
            response = cls._model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"AI personalization failed: {e}")
            return f"Prativeda just deployed your portfolio with the {template_name} template. Share it on LinkedIn and let recruiters discover your professional brand."
    
    @classmethod
    async def personalize_welcome_message(cls, user_name: str) -> str:
        """Generate personalized welcome message that builds relationship."""
        cls._init_gemini()
        if cls._model is None:
            return f"Hello {user_name}, Prativeda is your partner in building a standout career. Together, we'll craft resumes that open doors to your dream opportunities."
        
        try:
            prompt = f"""Write a warm, professional 2-sentence welcome for {user_name} joining Prativeda - an AI-powered resume builder, ATS scorer, and portfolio creator.
Tone: Build a partnership relationship. Emphasize we're here to support their career growth journey.
Services: Resume building, ATS optimization, AI interview prep, portfolio generation.
Keep under 50 words. No emojis. Make it personal and encouraging."""
            
            response = cls._model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"AI personalization failed: {e}")
            return f"Hello {user_name}, Prativeda is your partner in building a standout career. Together, we'll craft resumes that open doors to your dream opportunities."


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
            # Prepare payload - SINGLE EMAIL FORMAT (recipient as string, not array)
            payload = {
                "type": email_type,
                "recipient": recipient,  # Single recipient (not array)
                "metadata": metadata
            }
            
            # Wrap in 'body' to match Lambda's expected format
            lambda_payload = {
                "body": json.dumps(payload)  # Lambda expects body as JSON string
            }
            
            # Debug logging
            logger.info(f"📤 Sending SINGLE email request to Lambda:")
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
            # Prepare payload - BULK EMAIL FORMAT (recipients as array)
            payload = {
                "type": email_type,
                "recipients": recipients  # Array of {email, metadata} objects
            }
            
            # Wrap in 'body' to match Lambda's expected format
            lambda_payload = {
                "body": json.dumps(payload)
            }
            
            logger.info(f"📤 Sending BULK email request to Lambda:")
            logger.info(f"   URL: {settings.EMAIL_API_URL}")
            logger.info(f"   Recipients count: {len(recipients)}")
            
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
        # AI-personalized welcome message
        ai_message = await AIEmailPersonalizer.personalize_welcome_message(user_name)
        
        return await EmailService.send_email(
            email_type="welcome",
            recipient=user_email,
            metadata={
                "name": user_name,
                "ai_message": ai_message,
                "dashboard_url": "https://prativeda.codetapasya.com/dashboard",
                "current_year": str(datetime.now().year),
                "unsubscribe_url": "https://prativeda.codetapasya.com/profile",
                "privacy_url": "https://prativeda.codetapasya.com/privacy-policy",
                "help_url": "https://prativeda.codetapasya.com/help"
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
        # AI-personalized feedback
        body_text = await AIEmailPersonalizer.personalize_resume_feedback(resume_name, ats_score)
        
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "notification_type": "Resume Ready",
                "name": user_name,
                "body_text": body_text,
                "action_url": "https://prativeda.codetapasya.com/resumes",
                "action_text": "View Resume"
            }
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
        # AI-personalized feedback
        body_text = await AIEmailPersonalizer.personalize_interview_feedback(role, question_count)
        
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "notification_type": "Interview Complete",
                "name": user_name,
                "body_text": body_text,
                "action_url": "https://prativeda.codetapasya.com/interview-prep",
                "action_text": "View Results"
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
        # AI-personalized tip
        body_text = await AIEmailPersonalizer.personalize_portfolio_tip(template_name)
        
        return await EmailService.send_email(
            email_type="noreply",
            recipient=user_email,
            metadata={
                "notification_type": "Portfolio Deployed",
                "name": user_name,
                "body_text": body_text + f" Visit it at {portfolio_url}",
                "action_url": portfolio_url,
                "action_text": "Visit Portfolio"
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
                "ticket_status": "Received",
                "ticket_subject": "Support Request Received",
                "agent_response_body": f"We have received your support request. Our team will review your message and respond within 24-48 hours.\n\nYour message: {message[:200]}",
                "agent_name": "Prativeda Support Team"
            }
        )
    
    @staticmethod
    async def send_security_alert(
        user_email: str,
        user_name: str,
        device_name: str = "Unknown Device",
        location: str = "Unknown Location",
        ip_address: str = "Unknown IP"
    ) -> bool:
        """
        Triggered: Security events (new login detected)
        """
        return await EmailService.send_email(
            email_type="security",
            recipient=user_email,
            metadata={
                "device_name": device_name,
                "location": location,
                "ip_address": ip_address,
                "timestamp": datetime.now().strftime("%B %d, %Y at %H:%M:%S UTC"),
                "secure_account_url": "https://prativeda.codetapasya.com/profile"
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
                "ticket_id": f"TICK-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "ticket_status": "Open",
                "ticket_subject": subject,
                "agent_response_body": f"Thank you for contacting us. We have received your message and will respond within 24-48 hours.\n\nYour inquiry: {message[:500]}",
                "agent_name": "Prativeda Support Team"
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
                "notification_type": "Low Credit Warning",
                "name": user_name,
                "body_text": f"Your credit balance is low ({remaining_credits} credits remaining). Prativeda offers flexible credit packs to keep you moving forward - invest in your career success today.",
                "action_url": "https://prativeda.codetapasya.com/credits/purchase",
                "action_text": "View Credit Packs"
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
                "notification_type": "High ATS Score Achievement",
                "name": user_name,
                "body_text": f"Congratulations! Prativeda's AI scored your resume '{resume_name}' at {ats_score}/100 ({rating}). Your resume is now highly optimized - time to apply with confidence.",
                "action_url": "https://prativeda.codetapasya.com/resumes",
                "action_text": "Download Resume"
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
                "message": f"Your payment of ₹{amount:.2f} could not be processed: {reason}. Prativeda's support team is here to help resolve this.",
                "retry_url": "https://prativeda.codetapasya.com/credits/purchase",
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
                "notification_type": "PDF Export Complete",
                "name": user_name,
                "body_text": f"Prativeda generated your resume '{resume_name}' with pixel-perfect LaTeX quality using {template_used} template. Your professional document is ready to impress recruiters.",
                "action_url": "https://prativeda.codetapasya.com/resumes",
                "action_text": "Download Resume"
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
                "notification_type": "Monthly Credits Reset",
                "name": user_name,
                "body_text": f"Great news! Prativeda just refreshed your monthly credits. You now have {total_balance} credits to power your career growth - use them to optimize resumes, prep for interviews, or build portfolios.",
                "action_url": "https://prativeda.codetapasya.com/dashboard",
                "action_text": "Explore Features"
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
                "device_name": f"{platform.title()} Connection",
                "location": "Third-party Integration",
                "ip_address": "N/A",
                "timestamp": datetime.now().strftime("%B %d, %Y at %H:%M:%S UTC"),
                "secure_account_url": "https://prativeda.codetapasya.com/profile"
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
                "notification_type": "Template Unlocked",
                "name": user_name,
                "body_text": f"You've unlocked the {template_name} ({tier.upper()}) portfolio template on Prativeda. Create a stunning professional portfolio and let your work speak volumes.",
                "action_url": "https://prativeda.codetapasya.com/portfolio",
                "action_text": "Build Portfolio"
            }
        )
