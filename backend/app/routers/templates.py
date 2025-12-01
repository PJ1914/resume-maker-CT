"""
Template management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from datetime import datetime
from app.dependencies import get_current_user
from app.dependencies_admin import get_current_admin
from app.services.user_roles import is_user_admin
from app.services.templates import (
    Template,
    save_template,
    get_template,
    list_user_templates,
    delete_template,
    update_template,
)
from pydantic import BaseModel
import uuid
import logging

router = APIRouter()

class TemplateCreate(BaseModel):
    """Request to create a template"""
    name: str
    type: str  # 'html' or 'latex'
    content: str
    description: str = ""
    template_id: str = None  # Optional custom ID (for default templates)

class TemplateUpdate(BaseModel):
    """Request to update a template"""
    name: str
    content: str
    description: str = ""

class TemplateResponse(BaseModel):
    """Template response"""
    id: str
    name: str
    type: str
    description: str
    content: str
    created_at: str
    updated_at: str

@router.post("/templates", response_model=TemplateResponse)
async def create_template(
    request: TemplateCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new custom template"""
    user_id = current_user["uid"]
    # Use provided ID or generate a new UUID
    template_id = request.template_id if request.template_id else str(uuid.uuid4())
    
    logging.info("[API] Creating template for user %s: %s (ID: %s)", user_id, request.name, template_id)
    
    try:
        # Validate template type
        if request.type not in ['html', 'latex']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template type must be 'html' or 'latex'"
            )
        
        # Validate content is not empty
        if not request.content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template content cannot be empty"
            )
        
        # Create template
        template = Template(
            id=template_id,
            name=request.name,
            type=request.type,
            content=request.content,
            owner_uid=user_id,
            description=request.description,
        )
        
        logging.debug("[API] Template object created: %s", template.id)
        
        # Save to Firestore
        if not save_template(template):
            logging.error("[API] Failed to save template %s", template_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save template to database"
            )
        
        logging.info("[API] Successfully created template %s", template_id)
        
        return TemplateResponse(
            id=template.id,
            name=template.name,
            type=template.type,
            description=template.description,
            content=template.content,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("[API ERROR] Error creating template: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template: {str(e)}"
        )

@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates(
    current_user: dict = Depends(get_current_user)
):
    """List all custom templates for the user"""
    user_id = current_user["uid"]
    
    logging.info("[API] Listing templates for user %s", user_id)
    
    try:
        templates = list_user_templates(user_id)
        
        logging.info("[API] Found %s templates for user %s", len(templates), user_id)
        
        return [
            TemplateResponse(
                id=t.id,
                name=t.name,
                type=t.type,
                description=t.description,
                content=t.content,
                created_at=t.created_at.isoformat(),
                updated_at=t.updated_at.isoformat(),
            )
            for t in templates
        ]
    except Exception as e:
        logging.exception("[API ERROR] Error listing templates: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list templates"
        )

@router.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template_detail(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific template"""
    user_id = current_user["uid"]
    
    logging.info("[API] Getting template %s for user %s", template_id, user_id)
    
    try:
        template = get_template(template_id, user_id)
        
        if not template:
            logging.info("[API] Template %s not found for user %s", template_id, user_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        logging.debug("[API] Retrieved template %s", template_id)
        
        return TemplateResponse(
            id=template.id,
            name=template.name,
            type=template.type,
            description=template.description,
            content=template.content,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("[API ERROR] Error getting template: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )

@router.put("/templates/{template_id}", response_model=TemplateResponse)
async def update_template_detail(
    template_id: str,
    request: TemplateUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a custom template"""
    user_id = current_user["uid"]
    
    logging.info("[API] Updating template %s for user %s", template_id, user_id)
    
    try:
        # Get existing template
        template = get_template(template_id, user_id)
        
        if not template:
            logging.info("[API] Template %s not found for user %s", template_id, user_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Update fields
        template.name = request.name
        template.content = request.content
        template.description = request.description
        
        logging.debug("[API] Updated template object %s", template_id)
        
        # Save updated template
        if not update_template(template):
            logging.error("[API] Failed to save updated template %s", template_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update template"
            )
        
        logging.info("[API] Successfully updated template %s", template_id)
        
        return TemplateResponse(
            id=template.id,
            name=template.name,
            type=template.type,
            description=template.description,
            content=template.content,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("[API ERROR] Error updating template: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update template"
        )

@router.delete("/templates/{template_id}")
async def delete_template_detail(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a custom template"""
    user_id = current_user["uid"]
    
    logging.info("[API] Deleting template %s for user %s", template_id, user_id)
    
    try:
        # Verify template exists and belongs to user
        template = get_template(template_id, user_id)
        
        if not template:
            logging.info("[API] Template %s not found for user %s", template_id, user_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Delete template
        if not delete_template(template_id, user_id):
            logging.error("[API] Failed to delete template %s", template_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete template"
            )
        
        logging.info("[API] Successfully deleted template %s", template_id)
        return {"status": "success", "message": "Template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("[API ERROR] Error deleting template: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template"
        )

@router.get("/admin/check")
async def check_admin_status(
    current_user: dict = Depends(get_current_user)
):
    """Check if current user is an admin"""
    user_id = current_user["uid"]
    user_email = current_user.get("email", "")
    
    is_admin = is_user_admin(user_email, user_id)
    
    return {
        "is_admin": is_admin,
        "user_id": user_id,
        "email": user_email
    }

@router.post("/templates/upload")
async def upload_template(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_admin)
):
    """Upload a template file (Admin only)"""
    user_id = current_user["uid"]
    
    logging.info("[API] Uploading template file for user %s: %s", user_id, file.filename)
    
    try:
        # Validate file type
        allowed_types = ['.html', '.htm', '.tex', '.latex']
        file_ext = None
        for ext in allowed_types:
            if file.filename.lower().endswith(ext):
                file_ext = ext
                break
        
        if not file_ext:
            logging.info("[API] Invalid file type: %s", file.filename)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only HTML and LaTeX files are supported"
            )
        
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        logging.debug("[API] Read %s bytes from %s", len(content_str), file.filename)
        
        # Determine template type
        template_type = 'html' if file_ext in ['.html', '.htm'] else 'latex'
        
        # Create template
        template_id = str(uuid.uuid4())
        template = Template(
            id=template_id,
            name=file.filename,
            type=template_type,
            content=content_str,
            owner_uid=user_id,
            description=f"Uploaded from {file.filename}",
        )
        
        logging.debug("[API] Template object created: %s", template_id)
        
        # Save to Firestore
        if not save_template(template):
            logging.error("[API] Failed to save uploaded template %s", template_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save template"
            )
        
        logging.info("[API] Successfully uploaded template %s", template_id)
        
        return TemplateResponse(
            id=template.id,
            name=template.name,
            type=template.type,
            description=template.description,
            content=template.content,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("[API ERROR] Error uploading template: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload template: {str(e)}"
        )
