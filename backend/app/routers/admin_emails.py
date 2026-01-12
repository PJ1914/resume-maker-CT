"""
Admin Email Management Router - Production-Ready
Manual and bulk email sending with AI auto-fill.
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

from app.dependencies import admin_only
from app.services.email_service import EmailService
from app.services.email_ai_service import EmailAIService
from app.services.template_service import template_service
from firebase_admin import firestore
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/emails", tags=["Admin - Emails"])

# ==================== REQUEST MODELS ====================

class PreviewTemplateRequest(BaseModel):
    template_type: str
    user_id: Optional[str] = None
    custom_context: Optional[Dict] = None


class SendManualEmailRequest(BaseModel):
    template_type: str
    recipient: EmailStr
    metadata: Dict[str, str]


class SendBulkEmailRequest(BaseModel):
    template_type: str
    user_ids: List[str]
    use_ai_personalization: bool = True
    base_context: Optional[Dict] = None


# ==================== ENDPOINTS ====================

@router.get("/templates")
async def list_templates(admin: dict = Depends(admin_only)):
    """
    List all available email templates.
    
    Returns:
        List of template types with metadata
    """
    try:
        templates = await template_service.list_available_templates()
        return {
            "templates": templates,
            "count": len(templates)
        }
    except Exception as e:
        logger.error(f"Failed to list templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch templates")


@router.post("/preview")
async def preview_template(
    request: PreviewTemplateRequest,
    admin: dict = Depends(admin_only)
):
    """
    Preview email template with AI-generated field values.
    
    Admin can see how the email will look before sending.
    AI auto-fills all template variables intelligently.
    """
    try:
        # Fetch template HTML
        template_html = await template_service.get_template_by_type(request.template_type)
        
        if not template_html:
            raise HTTPException(
                status_code=404,
                detail=f"Template not found: {request.template_type}"
            )
        
        # Extract variables
        variables = EmailAIService.extract_template_variables(template_html)
        
        # Build context
        context = request.custom_context or {}
        
        # If user_id provided, fetch user data
        if request.user_id:
            db = firestore.client()
            user_doc = db.collection('users').document(request.user_id).get()
            
            if user_doc.exists:
                context['user'] = user_doc.to_dict()
        
        # AI auto-fill variables
        filled_data = await EmailAIService.auto_fill_template(
            template_type=request.template_type,
            variables=variables,
            context=context,
            user_data=context.get('user')
        )
        
        # Render preview
        preview_html = template_html
        for key, value in filled_data.items():
            preview_html = preview_html.replace(f"{{{{{key}}}}}", str(value))
        
        return {
            "template_type": request.template_type,
            "variables": variables,
            "filled_data": filled_data,
            "preview_html": preview_html
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Preview failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-manual")
async def send_manual_email(
    request: SendManualEmailRequest,
    admin: dict = Depends(admin_only)
):
    """
    Send single email manually.
    
    Admin can edit AI-generated values before sending.
    Logs all manual email actions.
    """
    try:
        # Send email via SES API
        success = await EmailService.send_email(
            email_type=request.template_type,
            recipient=request.recipient,
            metadata=request.metadata
        )
        
        # Log admin action
        db = firestore.client()
        db.collection('admin_actions').add({
            'admin_id': admin['uid'],
            'admin_email': admin.get('email'),
            'action': 'send_manual_email',
            'template_type': request.template_type,
            'recipient': request.recipient,
            'metadata': request.metadata,
            'success': success,
            'timestamp': datetime.utcnow()
        })
        
        # Log email sent
        db.collection('email_logs').add({
            'type': request.template_type,
            'recipient': request.recipient,
            'metadata': request.metadata,
            'sent_by': 'admin',
            'admin_id': admin['uid'],
            'status': 'sent' if success else 'failed',
            'sent_at': datetime.utcnow()
        })
        
        if success:
            return {
                "status": "success",
                "message": f"Email sent to {request.recipient}",
                "template_type": request.template_type
            }
        else:
            raise HTTPException(status_code=500, detail="Email sending failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Manual email failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-bulk")
async def send_bulk_emails(
    request: SendBulkEmailRequest,
    admin: dict = Depends(admin_only)
):
    """
    Send bulk emails to multiple users.
    
    AI personalizes each email based on user data.
    Supports up to 100 recipients per batch.
    """
    try:
        # Validate batch size
        if len(request.user_ids) > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum 100 recipients per batch"
            )
        
        # Fetch template to get variables
        template_html = await template_service.get_template_by_type(request.template_type)
        
        if not template_html:
            raise HTTPException(
                status_code=404,
                detail=f"Template not found: {request.template_type}"
            )
        
        # Extract variables
        variables = EmailAIService.extract_template_variables(template_html)
        
        # Prepare recipients list
        if request.use_ai_personalization:
            # AI personalizes for each user
            recipients = await EmailAIService.personalize_bulk_email(
                template_type=request.template_type,
                template_variables=variables,
                user_ids=request.user_ids,
                base_context=request.base_context
            )
        else:
            # Basic personalization (just name and email)
            db = firestore.client()
            recipients = []
            
            for user_id in request.user_ids:
                user_doc = db.collection('users').document(user_id).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    recipients.append({
                        "email": user_data.get('email'),
                        "metadata": {
                            "name": user_data.get('displayName', 'User'),
                            "user_email": user_data.get('email'),
                            "date": datetime.now().strftime("%B %d, %Y"),
                            **(request.base_context or {})
                        }
                    })
        
        if not recipients:
            raise HTTPException(
                status_code=400,
                detail="No valid recipients found"
            )
        
        # Send bulk email
        result = await EmailService.send_bulk_email(
            email_type=request.template_type,
            recipients=recipients
        )
        
        # Log admin action
        db = firestore.client()
        db.collection('admin_actions').add({
            'admin_id': admin['uid'],
            'admin_email': admin.get('email'),
            'action': 'send_bulk_email',
            'template_type': request.template_type,
            'recipient_count': len(recipients),
            'user_ids': request.user_ids,
            'ai_personalized': request.use_ai_personalization,
            'result': result,
            'timestamp': datetime.utcnow()
        })
        
        # Log each email
        for recipient in recipients:
            db.collection('email_logs').add({
                'type': request.template_type,
                'recipient': recipient['email'],
                'metadata': recipient['metadata'],
                'sent_by': 'admin_bulk',
                'admin_id': admin['uid'],
                'status': 'sent' if result['status'] == 'success' else 'failed',
                'sent_at': datetime.utcnow()
            })
        
        return {
            "status": result['status'],
            "sent_count": result['sent'],
            "failed_count": result.get('failed', 0),
            "total_recipients": len(recipients),
            "ai_personalized": request.use_ai_personalization
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk email failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs")
async def get_email_logs(
    limit: int = 50,
    email_type: Optional[str] = None,
    admin: dict = Depends(admin_only)
):
    """
    Get email sending logs.
    
    Useful for debugging and audit trail.
    """
    try:
        db = firestore.client()
        query = db.collection('email_logs').order_by('sent_at', direction=firestore.Query.DESCENDING).limit(limit)
        
        if email_type:
            query = query.where('type', '==', email_type)
        
        logs = []
        for doc in query.stream():
            log_data = doc.to_dict()
            log_data['id'] = doc.id
            # Convert timestamp to string
            if 'sent_at' in log_data:
                log_data['sent_at'] = log_data['sent_at'].isoformat() if hasattr(log_data['sent_at'], 'isoformat') else str(log_data['sent_at'])
            logs.append(log_data)
        
        return {
            "logs": logs,
            "count": len(logs)
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_email_stats(admin: dict = Depends(admin_only)):
    """
    Get email statistics.
    
    Shows total emails sent, success rate, etc.
    """
    try:
        db = firestore.client()
        
        # Get all logs
        logs = list(db.collection('email_logs').stream())
        
        total = len(logs)
        sent = sum(1 for log in logs if log.to_dict().get('status') == 'sent')
        failed = total - sent
        
        # Count by type
        by_type = {}
        for log in logs:
            log_type = log.to_dict().get('type', 'unknown')
            by_type[log_type] = by_type.get(log_type, 0) + 1
        
        return {
            "total_emails": total,
            "sent": sent,
            "failed": failed,
            "success_rate": round((sent / total * 100) if total > 0 else 0, 2),
            "by_type": by_type
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
