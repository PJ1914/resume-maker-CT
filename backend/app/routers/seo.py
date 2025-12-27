from fastapi import APIRouter, Response
from app.firebase import resume_maker_app
from firebase_admin import firestore
from datetime import datetime

router = APIRouter(tags=["SEO"])

BASE_URL = "https://prativeda.codetapasya.com"

@router.get("/sitemap.xml", include_in_schema=False)
async def get_sitemap():
    """Generates the sitemap.xml for search engines"""
    db = firestore.client(app=resume_maker_app)
    
    xml = []
    xml.append('<?xml version="1.0" encoding="UTF-8"?>')
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # 1. Static Routes
    static_routes = [
        "",
        "/pricing",
        "/features",
        "/documentation",
        "/help",
        "/contact",
        "/about",
        "/privacy-policy",
        "/terms",
        "/product/interview-prep",
        "/product/portfolio",
        "/cover-letter-tips",
        "/career-blog"
    ]
    
    date_now = datetime.now().strftime("%Y-%m-%d")
    
    for route in static_routes:
        xml.append('<url>')
        xml.append(f'<loc>{BASE_URL}{route}</loc>')
        xml.append(f'<lastmod>{date_now}</lastmod>')
        xml.append('<changefreq>weekly</changefreq>')
        xml.append('<priority>1.0</priority>' if route == "" else '<priority>0.8</priority>')
        xml.append('</url>')
        
    # 2. Dynamic Help Articles
    try:
        articles = db.collection('help_articles').stream()
        for doc in articles:
            data = doc.to_dict()
            slug = data.get('slug', doc.id)
            url = f"{BASE_URL}/documentation?slug={slug}"
            
            # Helper to get date string
            updated_at = data.get('updatedAt')
            last_mod_str = date_now
            if updated_at:
                try:
                    # Firestore timestamp to datetime
                    dt = updated_at
                    if hasattr(dt, 'date'):
                        last_mod_str = dt.strftime("%Y-%m-%d")
                    elif isinstance(dt, datetime):
                        last_mod_str = dt.strftime("%Y-%m-%d")
                except:
                    pass
            
            xml.append('<url>')
            xml.append(f'<loc>{url}</loc>')
            xml.append(f'<lastmod>{last_mod_str}</lastmod>')
            xml.append('<changefreq>monthly</changefreq>')
            xml.append('<priority>0.7</priority>')
            xml.append('</url>')
    except Exception as e:
        print(f"Error generating sitemap dynamic routes: {e}")

    xml.append('</urlset>')
    return Response(content="".join(xml), media_type="application/xml")

@router.get("/robots.txt", include_in_schema=False)
async def get_robots():
    """Serves robots.txt"""
    txt = f"""User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /resumes
Disallow: /profile

Sitemap: {BASE_URL}/sitemap.xml
"""
    return Response(content=txt, media_type="text/plain")
