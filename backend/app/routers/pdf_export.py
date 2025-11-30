"""
PDF Export Router
Handles resume PDF generation and export
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
import io
from datetime import timedelta

from app.dependencies import get_current_user
from app.services.firestore import get_resume_data
from app.services.latex_compiler import latex_compiler, TemplateType
from app.services.storage import upload_resume_pdf, get_signed_url
from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS, get_user_credits

router = APIRouter(prefix="/api/resumes", tags=["PDF Export"])


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
        resume_data = get_resume_data(resume_id, user_id)
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume {resume_id} not found or has not been edited yet"
            )
        
        # Check if resume has contact info (minimum requirement)
        if "contact" not in resume_data or not resume_data["contact"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume data incomplete. Please fill in contact information."
            )
        
        # Generate PDF
        try:
            pdf_content = latex_compiler.generate_pdf(
                resume_data=resume_data,
                template_name=request.template
            )
        except Exception as e:
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
        resume_data = get_resume_data(resume_id, user_id)
        
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
    return {
        "templates": [
            {
                "name": "modern",
                "display_name": "Modern",
                "description": "Clean, ATS-friendly design with visual hierarchy and color accents"
            },
            {
                "name": "classic",
                "display_name": "Classic",
                "description": "Traditional, professional format with simple layout"
            },
            {
                "name": "minimalist",
                "display_name": "Minimalist",
                "description": "Clean, spacious design with minimal styling"
            }
        ]
    }
