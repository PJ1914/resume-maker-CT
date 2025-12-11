from fastapi import APIRouter, HTTPException
from app.schemas.contact import ContactMessage
from app.services.contact_service import save_contact_message

router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("/", status_code=200)
async def submit_contact_form(contact_data: ContactMessage):
    """
    Submit a contact form message.
    """
    success = save_contact_message(contact_data.model_dump())
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save message")
    return {"message": "Message sent successfully"}
