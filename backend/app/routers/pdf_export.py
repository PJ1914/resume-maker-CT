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
from app.services.rate_limiter import costly_limiter, standard_limiter

from app.dependencies import get_current_user
from app.services.firestore import get_merged_resume_data
from app.services.latex_compiler import latex_compiler, TemplateType
from app.services.storage import upload_resume_pdf, get_signed_url
from app.services.credits import has_sufficient_credits, deduct_credits, FeatureType, FEATURE_COSTS, get_user_credits

logger = logging.getLogger(__name__)
router = APIRouter(tags=["PDF Export"])


class ExportRequest(BaseModel):
    """PDF export request"""
    template: TemplateType = "resume_1"
    save_to_storage: bool = True


class ExportResponse(BaseModel):
    """PDF export response"""
    success: bool
    storage_url: str | None = None
    signed_url: str | None = None
    message: str


@router.post("/{resume_id}/export", response_model=ExportResponse, dependencies=[Depends(costly_limiter)])
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
            pdf_content = await latex_compiler.generate_pdf(
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
                
                # Send PDF export success notification
                try:
                    user_email = current_user.get('email')
                    user_name = current_user.get('name') or current_user.get('displayName') or user_email.split('@')[0] if user_email else 'User'
                    resume_name = resume_data.get('contact_info', {}).get('name', 'Your Resume')
                    
                    await EmailService.send_pdf_export_success(
                        user_email=user_email,
                        user_name=user_name,
                        resume_name=resume_name,
                        template_used=request.template
                    )
                    logger.info(f"✅ PDF export email sent to {user_email}")
                except Exception as email_error:
                    logger.error(f"❌ PDF export email failed: {email_error}")

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
    template: TemplateType = "resume_1",
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
        pdf_content = await latex_compiler.generate_pdf(
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

@router.get("/{resume_id}/preview/{template_name}", dependencies=[Depends(costly_limiter)])
async def preview_resume_with_template(
    resume_id: str,
    template_name: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a preview PDF for a resume with a specific template.
    Uses the user's actual resume data (not sample data).
    Generates PDF on-demand and returns it (no caching needed since frontend embeds it).
    
    Args:
        resume_id: Resume ID to preview
        template_name: Name of the template to use
        current_user: Authenticated user
        
    Returns:
        PDF file response
    """
    try:
        user_id = current_user["uid"]
        
        # Get user's resume data from Firestore
        resume_data = get_merged_resume_data(resume_id, user_id)
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume {resume_id} not found or has not been edited yet"
            )
        
        # Normalize contact field for template processing
        contact = resume_data.get("contact") or resume_data.get("contact_info")
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume data incomplete. Please fill in contact information."
            )
        
        if "contact" not in resume_data and "contact_info" in resume_data:
            resume_data["contact"] = resume_data["contact_info"]
        
        # Generate PDF with user's actual data
        logger.info(f"Generating preview for resume {resume_id} with template {template_name}")
        try:
            # Render template files (returns dict of {filename: content})
            rendered_files = latex_compiler.render_template(template_name, resume_data)
            
            # Extract main.tex content and any additional files
            latex_source = rendered_files.get('main.tex', '')
            additional_files = {k: v for k, v in rendered_files.items() if k != 'main.tex'}
            
            # Compile to PDF
            pdf_content = await latex_compiler.compile_pdf(latex_source, template_name, additional_files)
        except Exception as e:
            import traceback
            logger.error(f"PDF generation failed for preview: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"PDF generation failed: {str(e)}"
            )
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename={resume_id}_{template_name}_preview.pdf",
                "Cache-Control": "no-cache, no-store, must-revalidate"  # Don't cache preview
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Error generating resume preview: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preview generation failed: {str(e)}"
        )


@router.get("/template-preview/{template_name}", dependencies=[Depends(standard_limiter)])
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
        # Version the cache to invalidate when template logic changes
        PREVIEW_VERSION = "v6"  # Increment this when template data structure changes
        cache_dir = Path(__file__).parent.parent / "static" / "previews"
        cache_dir.mkdir(parents=True, exist_ok=True)
        cached_pdf_path = cache_dir / f"{template_name}_{PREVIEW_VERSION}.pdf"
        
        # Check if cached PDF exists
        if cached_pdf_path.exists():
            logger.info(f"Serving cached preview for {template_name} ({PREVIEW_VERSION})")
            pdf_content = cached_pdf_path.read_bytes()
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"inline; filename={template_name}_preview.pdf",
                    "Cache-Control": "public, max-age=86400" # Cache for 24 hours
                }
            )

        # Check if template exists
        template_dir = Path(__file__).parent.parent / "templates" / "latex" / template_name
        main_tex_path = template_dir / "main.tex"
        
        if not main_tex_path.exists():
            raise HTTPException(status_code=404, detail=f"Template '{template_name}' not found")
        
        # Create sample data for preview in Firestore format
        sample_resume_data = {
            "contact": {
                "fullName": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1 (555) 123-4567",
                "location": "San Francisco, CA",
                "linkedin": "https://linkedin.com/in/johndoe",
                "github": "https://github.com/johndoe",
                "portfolio": "https://johndoe.com"
            },
            "summary": "Experienced software engineer with expertise in full-stack development and cloud technologies. Passionate about building scalable systems and mentoring junior developers.",
            "education": [{
                "institution": "University of California, Berkeley",
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "startDate": "2015",
                "endDate": "2019",
                "gpa": "3.8",
                "location": "Berkeley, CA"
            }],
            "experience": [
                {
                    "position": "Senior Software Engineer",
                    "company": "Tech Corp",
                    "location": "San Francisco, CA",
                    "startDate": "2020",
                    "endDate": "Present",
                    "description": "Lead developer for cloud infrastructure projects",
                    "highlights": [
                        "Improved system performance by 40% through optimization",
                        "Led a team of 5 engineers in developing microservices architecture",
                        "Implemented CI/CD pipelines reducing deployment time by 60%"
                    ]
                },
                {
                    "position": "Software Engineer",
                    "company": "StartupXYZ",
                    "location": "San Francisco, CA",
                    "startDate": "2019",
                    "endDate": "2020",
                    "description": "Full-stack developer building web applications",
                    "highlights": [
                        "Developed RESTful APIs serving 100K+ daily requests",
                        "Built responsive frontend using React and TypeScript"
                    ]
                }
            ],
            "projects": [
                {
                    "name": "Open Source Project",
                    "startDate": "2021",
                    "endDate": "2023",
                    "description": "Contributed to major open source initiative for cloud-native applications",
                    "technologies": ["Python", "Docker", "Kubernetes", "Terraform"],
                    "link": "https://github.com/example/project"
                },
                {
                    "name": "Personal Portfolio Website",
                    "startDate": "2022",
                    "endDate": "",
                    "description": "Built modern portfolio site with blog functionality",
                    "technologies": ["Next.js", "TypeScript", "Tailwind CSS"],
                    "link": "https://johndoe.com"
                }
            ],
            "skills": [
                {"category": "Programming Languages", "items": ["Python", "JavaScript", "Java", "TypeScript", "Go"]},
                {"category": "Frameworks & Libraries", "items": ["React", "Node.js", "FastAPI", "Django", "Next.js"]},
                {"category": "Cloud & DevOps", "items": ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins"]},
                {"category": "Databases", "items": ["PostgreSQL", "MongoDB", "Redis", "DynamoDB"]}
            ],
            "certifications": [
                {
                    "name": "AWS Certified Solutions Architect",
                    "issuer": "Amazon Web Services",
                    "date": "2022",
                    "credentialId": "AWS-123456",
                    "url": "https://aws.amazon.com/certification/"
                },
                {
                    "name": "Certified Kubernetes Administrator",
                    "issuer": "Cloud Native Computing Foundation",
                    "date": "2021"
                }
            ],
            "languages": [
                {"language": "English", "proficiency": "Native"},
                {"language": "Spanish", "proficiency": "Intermediate"}
            ],
            "achievements": [
                {
                    "title": "Best Innovation Award",
                    "date": "2022",
                    "description": "Recognized for outstanding contribution to product development and innovation"
                }
            ]
        }
        
        # Render the template with Jinja2
        # Note: render_template will call prepare_template_data internally
        logger.info(f"Rendering preview for {template_name}")
        rendered_files = latex_compiler.render_template(template_name, sample_resume_data)
        
        # Extract main.tex and additional files
        latex_source = rendered_files.get('main.tex', '')
        additional_files = {k: v for k, v in rendered_files.items() if k != 'main.tex'}
        
        # Compile to PDF with error handling
        logger.info(f"Compiling preview for {template_name}")
        try:
            pdf_content = await latex_compiler.compile_pdf(latex_source, template_name, additional_files)
        except RuntimeError as e:
            logger.error(f"Failed to compile template {template_name}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to compile template {template_name}. Please try another template."
            )
        except Exception as e:
            logger.error(f"Unexpected error compiling template {template_name}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error compiling template {template_name}"
            )
        
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
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error generating preview for {template_name}: {e}")
        logger.error(f"Traceback: {error_trace}")
        raise HTTPException(
            status_code=500, 
            detail=f"Preview generation failed: {str(e)}\nTraceback: {error_trace}"
        )

@router.get("/debug/latex")
async def debug_latex_environment(
    current_user: dict = Depends(get_current_user)
):
    """
    Diagnostic endpoint to check LaTeX environment.
    """
    import shutil
    import subprocess
    import tempfile
    from pathlib import Path

    results = {
        "compilers": {},
        "test_compilation": {},
        "env": {}
    }

    # Check compilers
    for compiler in ['tectonic', 'xelatex', 'pdflatex']:
        path = shutil.which(compiler)
        results["compilers"][compiler] = {
            "found": bool(path),
            "path": path
        }
        if path:
            try:
                version = subprocess.check_output([compiler, '--version'], stderr=subprocess.STDOUT).decode()
                results["compilers"][compiler]["version"] = version.split('\n')[0]
            except Exception as e:
                results["compilers"][compiler]["version_error"] = str(e)

    # Test compilation
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        tex_file = temp_path / "test.tex"
        tex_file.write_text(r"\documentclass{article}\begin{document}Hello World\end{document}")
        
        for compiler in ['tectonic', 'xelatex', 'pdflatex']:
            if not results["compilers"][compiler]["found"]:
                continue
                
            try:
                cmd = [compiler, "test.tex"]
                if compiler != 'tectonic':
                    cmd.insert(1, '-interaction=nonstopmode')
                
                proc = subprocess.run(
                    cmd,
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                results["test_compilation"][compiler] = {
                    "success": proc.returncode == 0,
                    "stdout": proc.stdout[:200],
                    "stderr": proc.stderr[:200]
                }
            except Exception as e:
                results["test_compilation"][compiler] = {
                    "success": False,
                    "error": str(e)
                }

    return results
