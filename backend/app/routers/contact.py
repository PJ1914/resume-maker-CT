from fastapi import APIRouter, HTTPException
from app.schemas.contact import ContactMessage
from app.services.contact_service import save_contact_message
from app.services.email_service import EmailService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("/", status_code=200)
async def submit_contact_form(contact_data: ContactMessage):
    """
    Submit a contact form message.
    """
    success = save_contact_message(contact_data.model_dump())
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save message")
    
    # Send confirmation email to user
    try:
        await EmailService.send_contact_confirmation(
            user_email=contact_data.email,
            user_name=contact_data.name,
            subject=contact_data.subject,
            message=contact_data.message
        )
        logger.info(f"✅ Contact confirmation email sent to {contact_data.email}")
    except Exception as email_error:
        logger.error(f"❌ Contact confirmation email failed: {email_error}")
    
    return {"message": "Message sent successfully"}
