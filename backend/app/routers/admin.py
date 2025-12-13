from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.dependencies import admin_only
from app.schemas.admin import DashboardStats
from typing import List, Optional

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(admin_only)]
)

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """
    Get aggregated statistics for the admin dashboard.
    """
    # TODO: Replace with real data fetching from services
    return DashboardStats(
        total_users=1250,
        active_users_today=45,
        credits_purchased_today=500,
        total_credits_used=12000,
        resumes_created=340,
        ats_checks_today=12,
        ai_actions_today=85,
        templates_purchased=5,
        portfolios_deployed=3
    )

@router.get("/logs")
async def get_admin_logs():
    """
    Get recent admin activity logs.
    """
    return [
        {"action": "System Update", "timestamp": "2025-12-07T10:00:00Z", "details": "Maintenance mode enabled"},
        {"action": "User Ban", "timestamp": "2025-12-06T14:30:00Z", "details": "Banned user user@example.com"}
    ]

# --- User Management ---

@router.get("/users", response_model=List[dict])
async def list_users(limit: int = 20, page_token: str = None):
    """
    List all users from Firebase Auth.
    """
    from firebase_admin import auth
    from app.firebase import codetapasya_app
    
    if not codetapasya_app:
        # Mock data for dev without service account
        return [
            {
                "uid": "dev-user-123",
                "email": "dev@example.com",
                "display_name": "Development User",
                "created_at": 1700000000000,
                "last_login_at": 1700000000000,
                "disabled": False,
                "credits_balance": 100,
                "resumes_count": 2
            }
        ]

    try:
        # List users from Firebase Auth
        page = auth.list_users(page_token=page_token, max_results=limit, app=codetapasya_app)
        
        users_list = []
        for user in page.users:
            # TODO: Fetch additional stats from Firestore (credits, etc.)
            # For now, we'll return basic auth info
            users_list.append({
                "uid": user.uid,
                "email": user.email,
                "display_name": user.display_name,
                "photo_url": user.photo_url,
                "created_at": user.user_metadata.creation_timestamp,
                "last_login_at": user.user_metadata.last_sign_in_timestamp,
                "disabled": user.disabled,
                "custom_claims": user.custom_claims,
                "credits_balance": 0, # Placeholder
                "resumes_count": 0    # Placeholder
            })
            
        return users_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{uid}", response_model=dict)
async def get_user_details(uid: str):
    """
    Get detailed user info including credits, resumes, etc.
    """
    from firebase_admin import auth
    from app.firebase import codetapasya_app
    
    if not codetapasya_app:
        return {
            "uid": uid,
            "email": "dev@example.com",
            "display_name": "Dev User",
            "credits_balance": 50,
            "resumes": [],
            "credit_history": []
        }

    try:
        user = auth.get_user(uid, app=codetapasya_app)
        
        # TODO: Fetch real data from Firestore
        # db = get_firestore_client()
        # credits_doc = db.collection('users').document(uid).collection('credits').document('balance').get()
        
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "provider_id": user.provider_id,
            "email_verified": user.email_verified,
            "created_at": user.user_metadata.creation_timestamp,
            "last_login_at": user.user_metadata.last_sign_in_timestamp,
            "disabled": user.disabled,
            "custom_claims": user.custom_claims,
            # Mock extended data for now
            "credits_balance": 120,
            "resumes_count": 3,
            "portfolios_count": 1,
            "credit_history": [
                {"timestamp": "2025-12-01T10:00:00Z", "action": "purchase", "amount": 100},
                {"timestamp": "2025-12-02T14:30:00Z", "action": "ats_check", "amount": -5}
            ],
            "resumes": [
                {"id": "res_1", "title": "Software Engineer", "updated_at": "2025-12-05T09:00:00Z", "score": 85}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="User not found")

@router.post("/users/{uid}/ban")
async def ban_user(uid: str):
    from firebase_admin import auth
    from app.firebase import codetapasya_app
    if not codetapasya_app: return {"status": "success", "mock": True}
    
    try:
        auth.update_user(uid, disabled=True, app=codetapasya_app)
        return {"status": "success", "message": f"User {uid} banned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/{uid}/unban")
async def unban_user(uid: str):
    from firebase_admin import auth
    from app.firebase import codetapasya_app
    if not codetapasya_app: return {"status": "success", "mock": True}
    
    try:
        auth.update_user(uid, disabled=False, app=codetapasya_app)
        return {"status": "success", "message": f"User {uid} unbanned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Resume Management ---

@router.get("/resumes", response_model=List[dict])
async def list_all_resumes(limit: int = 20, page_token: str = None):
    """
    List all resumes across all users.
    """
    # Mock data for now
    return [
        {
            "id": "res_123",
            "user_id": "user_456",
            "user_email": "john@example.com",
            "title": "Senior Frontend Developer",
            "created_at": "2025-12-01T10:00:00Z",
            "updated_at": "2025-12-06T15:30:00Z",
            "score": 85,
            "version": 3
        },
        {
            "id": "res_789",
            "user_id": "user_999",
            "user_email": "jane@example.com",
            "title": "Product Manager",
            "created_at": "2025-11-20T09:00:00Z",
            "updated_at": "2025-12-05T11:20:00Z",
            "score": 92,
            "version": 5
        },
        {
            "id": "res_456",
            "user_id": "user_456",
            "user_email": "john@example.com",
            "title": "Full Stack Engineer",
            "created_at": "2025-12-02T14:00:00Z",
            "updated_at": "2025-12-02T14:00:00Z",
            "score": 78,
            "version": 1
        }
    ]

@router.get("/resumes/{resume_id}", response_model=dict)
async def get_admin_resume_details(resume_id: str):
    """
    Get full details of a specific resume.
    """
    # Mock data
    return {
        "id": resume_id,
        "user_id": "user_456",
        "user_email": "john@example.com",
        "title": "Senior Frontend Developer",
        "created_at": "2025-12-01T10:00:00Z",
        "updated_at": "2025-12-06T15:30:00Z",
        "score": 85,
        "version": 3,
        "template_id": "modern_classic",
        "content_summary": {
            "experience_count": 4,
            "education_count": 2,
            "skills_count": 15,
            "projects_count": 3
        },
        "ai_enhancements": [
            {"type": "summary_generation", "timestamp": "2025-12-01T10:05:00Z"},
            {"type": "bullet_point_rewrite", "timestamp": "2025-12-01T10:15:00Z"}
        ],
        "ats_history": [
            {"score": 65, "timestamp": "2025-12-01T10:00:00Z"},
            {"score": 78, "timestamp": "2025-12-01T10:30:00Z"},
            {"score": 85, "timestamp": "2025-12-06T15:30:00Z"}
        ]
    }

@router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str):
    """
    Admin delete resume.
    """
    # In a real app, this would delete from Firestore/SQL
    return {"status": "success", "message": f"Resume {resume_id} deleted"}


# --- Template Management ---

@router.get("/templates", response_model=List[dict])
async def list_templates(type: str = None):
    """
    List all templates (resume/portfolio) from Firestore.
    """
    from firebase_admin import firestore
    from app.firebase import resume_maker_app
    
    try:
        db = firestore.client(app=resume_maker_app)
        
        # Get portfolio templates from Firestore
        portfolio_templates = []
        portfolio_collection = db.collection('portfolio_templates').stream()
        for doc in portfolio_collection:
            template_data = doc.to_dict()
            template_data['id'] = doc.id
            template_data['type'] = 'portfolio'
            portfolio_templates.append(template_data)
        
        # Mock resume templates (can be replaced with real data later)
        resume_templates = [
            {
                "id": "classic",
                "name": "Classic",
                "description": "A clean, professional design suitable for all industries.",
                "type": "resume",
                "thumbnail_url": "/previews/classic-preview.png",
                "is_premium": False,
                "price": 0,
                "active": True,
                "tier": "free",
                "features": ["ATS-friendly", "Clean layout", "Professional"]
            },
            {
                "id": "modern",
                "name": "Modern",
                "description": "Contemporary design with subtle accents.",
                "type": "resume",
                "thumbnail_url": "/previews/modern-preview.png",
                "is_premium": False,
                "price": 0,
                "active": True,
                "tier": "free",
                "features": ["Modern design", "Color accents", "Professional"]
            },
            {
                "id": "minimalist",
                "name": "Minimalist",
                "description": "Ultra-clean layout with focus on content.",
                "type": "resume",
                "thumbnail_url": "/previews/minimalist-preview.png",
                "is_premium": False,
                "price": 0,
                "active": True,
                "tier": "free",
                "features": ["Minimal design", "Content-focused", "Clean"]
            }
        ]
        
        all_templates = resume_templates + portfolio_templates
        
        if type:
            return [t for t in all_templates if t.get("type") == type]
        return all_templates
        
    except Exception as e:
        print(f"Error fetching templates: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch templates: {str(e)}")

@router.post("/templates")
async def create_template(template: dict):
    """
    Create a new portfolio template in Firestore.
    """
    from firebase_admin import firestore
    from app.firebase import resume_maker_app
    
    try:
        if template.get('type') != 'portfolio':
            raise HTTPException(status_code=400, detail="Only portfolio template creation is supported")
        
        db = firestore.client(app=resume_maker_app)
        template_id = template.get('id')
        
        if not template_id:
            raise HTTPException(status_code=400, detail="Template ID is required")
        
        # Check if template already exists
        existing = db.collection('portfolio_templates').document(template_id).get()
        if existing.exists:
            raise HTTPException(status_code=409, detail=f"Template with ID '{template_id}' already exists")
        
        # Remove 'id' and 'type' from template data before saving
        template_data = {k: v for k, v in template.items() if k not in ['id', 'type']}
        
        # Set created_at timestamp
        template_data['created_at'] = firestore.SERVER_TIMESTAMP
        template_data['updated_at'] = firestore.SERVER_TIMESTAMP
        
        # Save to Firestore
        db.collection('portfolio_templates').document(template_id).set(template_data)
        
        return {
            "status": "success",
            "message": "Portfolio template created successfully",
            "id": template_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating template: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@router.put("/templates/{template_id}")
async def update_template(template_id: str, template: dict):
    """
    Update an existing portfolio template in Firestore.
    """
    from firebase_admin import firestore
    from app.firebase import resume_maker_app
    
    try:
        db = firestore.client(app=resume_maker_app)
        
        # Check if template exists
        doc_ref = db.collection('portfolio_templates').document(template_id)
        existing = doc_ref.get()
        
        if not existing.exists:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        
        # Remove 'id' and 'type' from template data before updating
        template_data = {k: v for k, v in template.items() if k not in ['id', 'type']}
        
        # Update timestamp
        template_data['updated_at'] = firestore.SERVER_TIMESTAMP
        
        # Update in Firestore
        doc_ref.update(template_data)
        
        return {
            "status": "success",
            "message": f"Template '{template_id}' updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating template: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update template: {str(e)}")

@router.delete("/templates/{template_id}")
async def delete_template(template_id: str):
    """
    Delete a portfolio template from Firestore and Firebase Storage.
    """
    from firebase_admin import firestore, storage
    from app.firebase import resume_maker_app
    
    try:
        db = firestore.client(app=resume_maker_app)
        
        # Check if template exists
        doc_ref = db.collection('portfolio_templates').document(template_id)
        existing = doc_ref.get()
        
        if not existing.exists:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
        
        template_data = existing.to_dict()
        tier = template_data.get('tier', 'basic')
        
        # Delete from Firebase Storage
        try:
            bucket = storage.bucket(app=resume_maker_app)
            # Delete all files in the template folder
            blobs = bucket.list_blobs(prefix=f"templates/portfolio/{tier}/{template_id}/")
            for blob in blobs:
                blob.delete()
                print(f"Deleted: {blob.name}")
        except Exception as e:
            print(f"Warning: Could not delete files from Storage: {e}")
        
        # Delete from Firestore
        doc_ref.delete()
        
        return {
            "status": "success",
            "message": f"Template '{template_id}' deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting template: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete template: {str(e)}")

@router.post("/templates/{template_id}/upload")
async def upload_template_files(
    template_id: str,
    index_html: Optional[UploadFile] = File(None),
    styles_css: Optional[UploadFile] = File(None),
    script_js: Optional[UploadFile] = File(None),
    metadata_json: Optional[UploadFile] = File(None),
    preview_html: Optional[UploadFile] = File(None),
    readme_md: Optional[UploadFile] = File(None)
):
    """
    Upload template files to Firebase Storage.
    Files are uploaded to: templates/portfolio/{tier}/{template-id}/
    """
    from firebase_admin import firestore, storage
    from app.firebase import resume_maker_app
    
    try:
        db = firestore.client(app=resume_maker_app)
        
        # Get template metadata to determine tier
        doc_ref = db.collection('portfolio_templates').document(template_id)
        template_doc = doc_ref.get()
        
        if not template_doc.exists:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found. Create template metadata first.")
        
        template_data = template_doc.to_dict()
        tier = template_data.get('tier', 'basic')
        
        # Get Firebase Storage bucket
        bucket = storage.bucket(app=resume_maker_app)
        base_path = f"templates/portfolio/{tier}/{template_id}-portfolio"
        
        uploaded_files = []
        
        # Upload each file if provided
        files_to_upload = {
            'index.html': index_html,
            'styles.css': styles_css,
            'script.js': script_js,
            'metadata.json': metadata_json,
            'preview.html': preview_html,
            'README.md': readme_md
        }
        
        for filename, file in files_to_upload.items():
            if file:
                # Read file content
                content = await file.read()
                
                # Upload to Firebase Storage
                blob = bucket.blob(f"{base_path}/{filename}")
                blob.upload_from_string(
                    content,
                    content_type=file.content_type or 'text/plain'
                )
                
                # Make publicly accessible (optional)
                # blob.make_public()
                
                uploaded_files.append(filename)
                print(f"Uploaded: {base_path}/{filename}")
        
        if not uploaded_files:
            raise HTTPException(status_code=400, detail="No files provided for upload")
        
        return {
            "status": "success",
            "message": f"Uploaded {len(uploaded_files)} file(s) for template '{template_id}'",
            "uploaded_files": uploaded_files,
            "storage_path": base_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading template files: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {str(e)}")


# --- Portfolio Management ---

@router.get("/portfolios", response_model=List[dict])
async def list_portfolios(limit: int = 20):
    """
    List all user portfolios.
    """
    # Mock data
    return [
        {
            "id": "port_1",
            "user_id": "user_456",
            "user_email": "john@example.com",
            "slug": "john-doe",
            "title": "John's Dev Portfolio",
            "template_id": "dev_portfolio_v1",
            "status": "published",
            "views": 1250,
            "last_published_at": "2025-12-05T10:00:00Z",
            "created_at": "2025-11-01T00:00:00Z"
        },
        {
            "id": "port_2",
            "user_id": "user_999",
            "user_email": "jane@example.com",
            "slug": "jane-design",
            "title": "Jane Design Works",
            "template_id": "creative_pro",
            "status": "offline",
            "views": 450,
            "last_published_at": "2025-11-20T14:00:00Z",
            "created_at": "2025-11-15T00:00:00Z"
        }
    ]

@router.post("/portfolios/{portfolio_id}/status")
async def toggle_portfolio_status(portfolio_id: str, status: str):
    """
    Change portfolio status (published/offline).
    """
    # In a real app, update Firestore
    return {"status": "success", "message": f"Portfolio {portfolio_id} status set to {status}"}

@router.delete("/portfolios/{portfolio_id}")
async def delete_portfolio(portfolio_id: str):
    """
    Delete a portfolio.
    """
    # In a real app, delete from Firestore
    return {"status": "success", "message": f"Portfolio {portfolio_id} deleted"}


# --- Payments & Credits ---

@router.get("/transactions", response_model=List[dict])
async def list_transactions(limit: int = 20):
    """
    List all transactions.
    """
    # Mock data
    return [
        {
            "id": "txn_1",
            "user_id": "user_123",
            "user_email": "alice@example.com",
            "amount": 1000,
            "currency": "INR",
            "credits": 500,
            "status": "success",
            "type": "purchase",
            "created_at": "2025-12-01T10:00:00Z"
        },
        {
            "id": "txn_2",
            "user_id": "user_456",
            "user_email": "bob@example.com",
            "amount": 0,
            "currency": "INR",
            "credits": 50,
            "status": "success",
            "type": "bonus",
            "created_at": "2025-12-02T11:30:00Z"
        },
        {
            "id": "txn_3",
            "user_id": "user_789",
            "user_email": "charlie@example.com",
            "amount": 500,
            "currency": "INR",
            "credits": 200,
            "status": "failed",
            "type": "purchase",
            "created_at": "2025-12-03T09:15:00Z"
        }
    ]

@router.post("/credits/adjust")
async def adjust_credits(user_id: str, amount: int, reason: str):
    """
    Manually add or remove credits for a user.
    """
    # In a real app, update Firestore user credits
    return {"status": "success", "message": f"Adjusted {amount} credits for user {user_id}. Reason: {reason}"}


# --- AI Monitoring ---

@router.get("/ai-logs", response_model=List[dict])
async def list_ai_logs(limit: int = 50):
    """
    List AI usage logs.
    """
    # Mock data
    return [
        {
            "id": "ai_1",
            "user_id": "user_123",
            "user_email": "alice@example.com",
            "action": "resume_analysis",
            "model": "gemini-pro",
            "tokens_used": 1500,
            "cost": 0.002,
            "status": "success",
            "latency_ms": 1200,
            "created_at": "2025-12-07T10:00:00Z"
        },
        {
            "id": "ai_2",
            "user_id": "user_456",
            "user_email": "bob@example.com",
            "action": "content_generation",
            "model": "gpt-4",
            "tokens_used": 500,
            "cost": 0.015,
            "status": "success",
            "latency_ms": 800,
            "created_at": "2025-12-07T10:05:00Z"
        },
        {
            "id": "ai_3",
            "user_id": "user_789",
            "user_email": "charlie@example.com",
            "action": "resume_analysis",
            "model": "gemini-pro",
            "tokens_used": 0,
            "cost": 0,
            "status": "failed",
            "latency_ms": 5000,
            "created_at": "2025-12-07T10:10:00Z"
        }
    ]


# --- Announcements & Settings ---

@router.get("/announcements", response_model=List[dict])
async def list_announcements():
    """
    List all announcements.
    """
    # Mock data
    return [
        {
            "id": "ann_1",
            "title": "Maintenance Scheduled",
            "content": "We will be performing system maintenance on Sunday at 2 AM UTC.",
            "type": "warning", # info, warning, success, error
            "active": True,
            "created_at": "2025-12-06T10:00:00Z"
        },
        {
            "id": "ann_2",
            "title": "New Features Live!",
            "content": "Check out the new AI Resume Analysis tool.",
            "type": "success",
            "active": True,
            "created_at": "2025-12-05T14:00:00Z"
        }
    ]

@router.post("/announcements")
async def create_announcement(announcement: dict):
    """
    Create a new announcement.
    """
    # In a real app, save to Firestore
    return {"status": "success", "message": "Announcement created"}

@router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str):
    """
    Delete an announcement.
    """
    return {"status": "success", "message": f"Announcement {announcement_id} deleted"}

@router.get("/settings", response_model=dict)
async def get_system_settings():
    """
    Get current system settings.
    """
    return {
        "maintenance_mode": False,
        "allow_signups": True,
        "default_credits": 50,
        "announcement_banner": "Welcome to the new Admin Panel!",
        "version": "1.2.0"
    }

@router.put("/settings")
async def update_system_settings(settings: dict):
    """
    Update system settings.
    """
    # In a real app, update Firestore config
    return {"status": "success", "message": "System settings updated", "settings": settings}

