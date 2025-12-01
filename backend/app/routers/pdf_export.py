"""
PDF Export Router
Handles resume PDF generation and export
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
import io
import logging
import json
from pathlib import Path
from datetime import timedelta

from app.dependencies import get_current_user
from app.services.firestore import get_merged_resume_data
from app.services.latex_compiler import latex_compiler, TemplateType
from app.services.storage import upload_resume_pdf, get_signed_url
from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS, get_user_credits

logger = logging.getLogger(__name__)
router = APIRouter(tags=["PDF Export"])


class ExportRequest(BaseModel):
    """PDF export request"""
    template: TemplateType = "modern"
    save_to_storage: bool = True


class ExportResponse(BaseModel):
    """PDF export response"""
    success: bool
    storage_url: str | None = None
    signed_url: str | None = None
    message: str


@router.post("/{resume_id}/export", response_model=ExportResponse)
async def export_resume_pdf(
    resume_id: str,
    request: ExportRequest,
    current_user: dict = Depends(get_current_user)
) -> ExportResponse:
    """
    Generate PDF from resume data using LaTeX templates.
    
    Args:
        resume_id: Resume ID to export
        request: Export configuration (template type, storage option)
        current_user: Authenticated user
        
    Returns:
        ExportResponse with storage URL and signed download URL
    """
    try:
        user_id = current_user["uid"]
        
        # Check credits
        if not has_sufficient_credits(user_id, FeatureType.PDF_EXPORT):
            user_credits = get_user_credits(user_id)
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "Insufficient credits for PDF export",
                    "current_balance": user_credits["balance"],
                    "required": FEATURE_COSTS[FeatureType.PDF_EXPORT]
                }
            )

        # Get resume data from Firestore
        resume_data = get_merged_resume_data(resume_id, user_id)
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume {resume_id} not found or has not been edited yet"
            )
        
        # Debug: log available data
        logger.info(f"PDF Export - Resume data keys: {list(resume_data.keys())}")
        logger.info(f"PDF Export - contact: {resume_data.get('contact')}")
        logger.info(f"PDF Export - contact_info: {resume_data.get('contact_info')}")
        logger.info(f"PDF Export - experience type: {type(resume_data.get('experience'))}")
        logger.info(f"PDF Export - education type: {type(resume_data.get('education'))}")
        logger.info(f"PDF Export - projects type: {type(resume_data.get('projects'))}")
        logger.info(f"PDF Export - skills type: {type(resume_data.get('skills'))}")
        
        # Check experience items
        if 'experience' in resume_data:
            exp_list = resume_data['experience']
            if isinstance(exp_list, list) and len(exp_list) > 0:
                logger.info(f"PDF Export - First experience item type: {type(exp_list[0])}")
                logger.info(f"PDF Export - First experience item: {exp_list[0]}")
        
        # Check projects items
        if 'projects' in resume_data:
            proj_list = resume_data['projects']
            if isinstance(proj_list, list) and len(proj_list) > 0:
                logger.info(f"PDF Export - First project item type: {type(proj_list[0])}")
                logger.info(f"PDF Export - First project item: {proj_list[0]}")
        
        # Check skills items
        if 'skills' in resume_data:
            skills_data = resume_data['skills']
            logger.info(f"PDF Export - Skills structure: {type(skills_data)}")
            logger.info(f"PDF Export - Skills content: {skills_data}")
        
        # Check if resume has contact info (minimum requirement)
        # Data can come as 'contact' (from editor) or 'contact_info' (from parser)
        contact = resume_data.get("contact") or resume_data.get("contact_info")
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume data incomplete. Please fill in contact information."
            )
        
        # Normalize contact field for template processing
        if "contact" not in resume_data and "contact_info" in resume_data:
            resume_data["contact"] = resume_data["contact_info"]
        
        # Generate PDF
        try:
            pdf_content = latex_compiler.generate_pdf(
                resume_data=resume_data,
                template_name=request.template
            )
        except Exception as e:
            import traceback
            logger.error(f"PDF generation failed: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"PDF generation failed: {str(e)}"
            )
        
        # Save to Firebase Storage if requested
        storage_url = None
        signed_url = None
        
        if request.save_to_storage:
            try:
                # Upload to Firebase Storage
                filename = f"{resume_id}_{request.template}.pdf"
                storage_url = await upload_resume_pdf(
                    user_id=current_user["uid"],
                    resume_id=resume_id,
                    pdf_content=pdf_content,
                    filename=filename
                )
                
                # Generate signed URL (valid for 7 days)
                signed_url = await get_signed_url(
                    storage_path=f"users/{current_user['uid']}/resumes/{resume_id}/pdfs/{filename}",
                    expiration=timedelta(days=7)
                )
                
                # Deduct credits
                deduct_credits(user_id, FeatureType.PDF_EXPORT, f"PDF Export for resume {resume_id}")

                return ExportResponse(
                    success=True,
                    storage_url=storage_url,
                    signed_url=signed_url,
                    message="PDF generated and saved to storage"
                )
            
            except Exception as e:
                # If storage fails, still return PDF but warn
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"PDF generated but storage upload failed: {str(e)}"
                )
        
        else:
            # Deduct credits
            deduct_credits(user_id, FeatureType.PDF_EXPORT, f"PDF Export for resume {resume_id}")

            # Return PDF directly without saving
            return ExportResponse(
                success=True,
                storage_url=None,
                signed_url=None,
                message="PDF generated (not saved to storage)"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.get("/{resume_id}/export/download")
async def download_resume_pdf(
    resume_id: str,
    template: TemplateType = "modern",
    current_user: dict = Depends(get_current_user)
):
    """
    Generate and directly download PDF (streaming response).
    
    Args:
        resume_id: Resume ID to export
        template: Template type to use
        current_user: Authenticated user
        
    Returns:
        StreamingResponse with PDF file
    """
    try:
        user_id = current_user["uid"]
        
        # Check credits
        if not has_sufficient_credits(user_id, FeatureType.PDF_EXPORT):
            user_credits = get_user_credits(user_id)
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "Insufficient credits for PDF export",
                    "current_balance": user_credits["balance"],
                    "required": FEATURE_COSTS[FeatureType.PDF_EXPORT]
                }
            )

        # Get resume data from Firestore
        resume_data = get_merged_resume_data(resume_id, user_id)
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume {resume_id} not found or has not been edited yet"
            )
        
        # Generate PDF
        pdf_content = latex_compiler.generate_pdf(
            resume_data=resume_data,
            template_name=template
        )
        
        # Create filename
        contact = resume_data.get("contact", {})
        name = contact.get("fullName", "Resume").replace(" ", "_")
        filename = f"{name}_{template}.pdf"
        
        # Deduct credits
        deduct_credits(user_id, FeatureType.PDF_EXPORT, f"PDF Download for resume {resume_id}")

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Download failed: {str(e)}"
        )


@router.get("/{resume_id}/download-original")
async def download_original_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Stream the original uploaded resume PDF from Firebase Storage via the backend.
    This avoids CORS issues when downloading from client-side storage URLs.
    """
    try:
        # Get resume metadata
        from app.services.firestore import get_resume_metadata
        meta = get_resume_metadata(resume_id, current_user["uid"])

        if not meta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume {resume_id} not found"
            )

        storage_path = getattr(meta, 'storage_path', None)
        if not storage_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No stored original file available for this resume"
            )

        # Download file content from storage
        from app.services.storage import get_file_content
        content = await get_file_content(storage_path)
        if content is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found in storage"
            )

        filename = meta.original_filename or meta.filename or f"{resume_id}.pdf"

        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download original file: {str(e)}"
        )




@router.get("/templates")
async def list_templates():
    """
    List available LaTeX templates.
    
    Returns:
        List of available template names with descriptions
    """
    try:
        return {
            "templates": [
                {
                    "name": "resume_1",
                    "display_name": "Resume 1",
                    "description": "Professional template with clean layout"
                },
                {
                    "name": "resume_2",
                    "display_name": "Resume 2",
                    "description": "Classic resume style"
                },
                {
                    "name": "resume_3",
                    "display_name": "Resume 3",
                    "description": "Clean and modern design"
                },
                {
                    "name": "resume_4",
                    "display_name": "Resume 4",
                    "description": "Structured professional layout"
                },
                {
                    "name": "resume_5",
                    "display_name": "Resume 5",
                    "description": "AltaCV style - Modern and colorful"
                },
                {
                    "name": "resume_6",
                    "display_name": "Resume 6",
                    "description": "Professional CV format"
                },
                {
                    "name": "resume_7",
                    "display_name": "Resume 7",
                    "description": "Comprehensive resume template"
                }
            ]
        }
    except Exception as e:
        import traceback
        logger.error(f"Error listing templates: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list templates: {str(e)}"
        )

@router.get("/templates/{template_name}/preview")
async def preview_template(template_name: str):
    """
    Generate a preview PDF for a specific template.
    Caches the result to avoid re-compilation.
    
    Args:
        template_name: Name of the template to preview
        
    Returns:
        PDF file response
    """
    try:
        # Define cache directory and file path
        cache_dir = Path(__file__).parent.parent / "static" / "previews"
        cache_dir.mkdir(parents=True, exist_ok=True)
        cached_pdf_path = cache_dir / f"{template_name}.pdf"
        
        # Check if cached PDF exists
        if cached_pdf_path.exists():
            logger.info(f"Serving cached preview for {template_name}")
            pdf_content = cached_pdf_path.read_bytes()
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"inline; filename={template_name}_preview.pdf",
                    "Cache-Control": "public, max-age=86400" # Cache for 24 hours
                }
            )

        # Path to the template's main.tex
        template_dir = Path(__file__).parent.parent / "templates" / "latex" / template_name
        main_tex_path = template_dir / "main.tex"
        
        if not main_tex_path.exists():
            raise HTTPException(status_code=404, detail=f"Template '{template_name}' not found")
            
        # Read the raw LaTeX content
        latex_source = main_tex_path.read_text(encoding="utf-8")
        
        # Compile to PDF
        logger.info(f"Compiling preview for {template_name}")
        pdf_content = latex_compiler.compile_pdf(latex_source, template_name)
        
        # Save to cache
        try:
            cached_pdf_path.write_bytes(pdf_content)
            logger.info(f"Cached preview for {template_name}")
        except Exception as e:
            logger.warning(f"Failed to cache preview for {template_name}: {e}")
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename={template_name}_preview.pdf",
                "Cache-Control": "public, max-age=86400"
            }
        )
    except Exception as e:
        logger.error(f"Error generating preview for {template_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
