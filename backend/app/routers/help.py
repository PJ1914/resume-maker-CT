from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.firebase import resume_maker_app
from firebase_admin import firestore
from app.dependencies import admin_only

router = APIRouter(prefix="/help", tags=["Help Center"])

# --- Schemas ---

class HelpCategory(BaseModel):
    id: str
    title: str
    order: int
    icon: str

class HelpArticleSummary(BaseModel):
    slug: str
    title: str
    order: int
    categoryId: str

class HelpArticleDetail(HelpArticleSummary):
    content: str
    updatedAt: Optional[datetime] = None

class HelpStructure(BaseModel):
    categories: List[HelpCategory]
    articles: Dict[str, List[HelpArticleSummary]] # grouped by categoryId

# --- Dependency ---
def get_db():
    if not resume_maker_app:
        raise HTTPException(503, "Firebase not initialized")
    return firestore.client(app=resume_maker_app)

# --- Endpoints ---

@router.get("/structure", response_model=HelpStructure)
async def get_help_structure():
    """Get all categories and article summaries for the sidebar"""
    db = get_db()
    
    # Fetch Categories
    cats_ref = db.collection('help_categories').order_by('order')
    categories = [HelpCategory(**doc.to_dict()) for doc in cats_ref.stream()]
    
    # Fetch All Articles (lightweight)
    arts_ref = db.collection('help_articles').order_by('order')
    # Projection: only fetch necessary fields
    # Note: select() might require an index for order_by, usually works for small collections
    # If error, remove select()
    articles_stream = arts_ref.select(['slug', 'title', 'order', 'categoryId']).stream()
    
    articles_by_cat = {}
    for doc in articles_stream:
        data = doc.to_dict()
        # Ensure slug is present (it's the doc ID usually, but we stored it in field too)
        if 'slug' not in data: data['slug'] = doc.id
            
        cat_id = data.get('categoryId')
        if not cat_id: continue
        
        if cat_id not in articles_by_cat:
            articles_by_cat[cat_id] = []
        
        articles_by_cat[cat_id].append(HelpArticleSummary(**data))
        
    return HelpStructure(categories=categories, articles=articles_by_cat)

@router.get("/article/{slug}", response_model=HelpArticleDetail)
async def get_article(slug: str):
    """Get full article content"""
    db = get_db()
    
    doc_ref = db.collection('help_articles').document(slug)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(404, "Article not found")
        
    data = doc.to_dict()
    # Handle timestamp conversion if needed (Pydantic usually handles datetime objects from Firestore)
    return HelpArticleDetail(**data)

@router.get("/search")
async def search_help(q: str = Query(..., min_length=2)):
    """Simple regex/substring search (inefficient for large data, ok for docs)"""
    db = get_db()
    
    # Firestore doesn't support full-text search natively without extensions (Algolia/Typesense)
    # Since docs are small (<100 articles), we can fetch all and filter in memory OR 
    # just rely on frontend filtering if we send `structure`.
    # For now, let's implement a basic title search in memory (fetching summaries).
    
    arts_ref = db.collection('help_articles')
    docs = arts_ref.select(['slug', 'title', 'categoryId']).stream()
    
    results = []
    query_lower = q.lower()
    
    for doc in docs:
        data = doc.to_dict()
        if query_lower in data.get('title', '').lower():
            results.append(data)
            
    return results

@router.post("/article", dependencies=[Depends(admin_only)])
async def update_article(article: HelpArticleDetail):
    """Admin: Create or Update an article"""
    db = get_db()
    data = article.dict(exclude_unset=True)
    data['updatedAt'] = firestore.SERVER_TIMESTAMP
    
    # Ensure slug matches id
    db.collection('help_articles').document(article.slug).set(data, merge=True)
    return {"status": "success", "slug": article.slug}

@router.delete("/article/{slug}", dependencies=[Depends(admin_only)])
async def delete_article(slug: str):
    """Admin: Delete an article"""
    db = get_db()
    db.collection('help_articles').document(slug).delete()
    return {"status": "deleted"}
