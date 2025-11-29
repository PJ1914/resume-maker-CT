"""
Template management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from datetime import datetime
from app.dependencies import get_current_user
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
    
    print(f"[API] Creating template for user {user_id}: {request.name} (ID: {template_id})")
    
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
        
        print(f"[API] Template object created: {template.id}")
        
        # Save to Firestore
        if not save_template(template):
            print(f"[API] Failed to save template {template_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save template to database"
            )
        
        print(f"[API] Successfully created template {template_id}")
        
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
        print(f"[API ERROR] Error creating template: {e}")
        import traceback
        traceback.print_exc()
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
    
    print(f"[API] Listing templates for user {user_id}")
    
    try:
        templates = list_user_templates(user_id)
        
        print(f"[API] Found {len(templates)} templates for user {user_id}")
        
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
        print(f"[API ERROR] Error listing templates: {e}")
        import traceback
        traceback.print_exc()
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
    
    print(f"[API] Getting template {template_id} for user {user_id}")
    
    try:
        template = get_template(template_id, user_id)
        
        if not template:
            print(f"[API] Template {template_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        print(f"[API] Retrieved template {template_id}")
        
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
        print(f"[API ERROR] Error getting template: {e}")
        import traceback
        traceback.print_exc()
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
    
    print(f"[API] Updating template {template_id} for user {user_id}")
    
    try:
        # Get existing template
        template = get_template(template_id, user_id)
        
        if not template:
            print(f"[API] Template {template_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Update fields
        template.name = request.name
        template.content = request.content
        template.description = request.description
        
        print(f"[API] Updated template object {template_id}")
        
        # Save updated template
        if not update_template(template):
            print(f"[API] Failed to save updated template {template_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update template"
            )
        
        print(f"[API] Successfully updated template {template_id}")
        
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
        print(f"[API ERROR] Error updating template: {e}")
        import traceback
        traceback.print_exc()
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
    
    print(f"[API] Deleting template {template_id} for user {user_id}")
    
    try:
        # Verify template exists and belongs to user
        template = get_template(template_id, user_id)
        
        if not template:
            print(f"[API] Template {template_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Delete template
        if not delete_template(template_id, user_id):
            print(f"[API] Failed to delete template {template_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete template"
            )
        
        print(f"[API] Successfully deleted template {template_id}")
        return {"status": "success", "message": "Template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[API ERROR] Error deleting template: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template"
        )

@router.post("/templates/upload")
async def upload_template(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a template file"""
    user_id = current_user["uid"]
    
    print(f"[API] Uploading template file for user {user_id}: {file.filename}")
    
    try:
        # Validate file type
        allowed_types = ['.html', '.htm', '.tex', '.latex']
        file_ext = None
        for ext in allowed_types:
            if file.filename.lower().endswith(ext):
                file_ext = ext
                break
        
        if not file_ext:
            print(f"[API] Invalid file type: {file.filename}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only HTML and LaTeX files are supported"
            )
        
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        print(f"[API] Read {len(content_str)} bytes from {file.filename}")
        
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
        
        print(f"[API] Template object created: {template_id}")
        
        # Save to Firestore
        if not save_template(template):
            print(f"[API] Failed to save uploaded template {template_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save template"
            )
        
        print(f"[API] Successfully uploaded template {template_id}")
        
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
        print(f"[API ERROR] Error uploading template: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload template: {str(e)}"
        )
