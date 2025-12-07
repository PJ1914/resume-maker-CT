from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    total_users: int
    active_users_today: int
    credits_purchased_today: int
    total_credits_used: int
    resumes_created: int
    ats_checks_today: int
    ai_actions_today: int
    templates_purchased: int
    portfolios_deployed: int

class AdminLog(BaseModel):
    admin_email: str
    action: str
    details: dict
    timestamp: str

class Announcement(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    publish_time: str
    image_url: Optional[str] = None

class AdminUser(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: int
    last_login_at: int
    disabled: bool
    custom_claims: Optional[dict] = None
    # Extended stats (fetched from Firestore)
    credits_balance: int = 0
    resumes_count: int = 0
    portfolios_count: int = 0

class UserActionLog(BaseModel):
    action: str
    timestamp: datetime
    details: Optional[dict] = None

class AdminUserDetail(AdminUser):
    provider_id: str
    email_verified: bool
    credit_history: List[dict] = []
    purchases: List[dict] = []
    resumes: List[dict] = []
    ai_usage: List[dict] = []
    portfolios: List[dict] = []

class AdminTemplate(BaseModel):
    id: str
    name: str
    description: str
    type: str # 'resume' or 'portfolio'
    thumbnail_url: str
    is_premium: bool
    price: int = 0
    active: bool
    created_at: datetime
    tags: List[str] = []

class AdminPortfolio(BaseModel):
    id: str
    user_id: str
    user_email: str
    slug: str
    title: str
    template_id: str
    status: str # 'published', 'draft', 'offline'
    views: int = 0
    last_published_at: Optional[datetime] = None
    created_at: datetime

class AdminTransaction(BaseModel):
    id: str
    user_id: str
    user_email: str
    amount: int
    currency: str
    credits: int
    status: str # 'success', 'failed', 'pending'
    type: str # 'purchase', 'bonus', 'refund', 'usage'
    created_at: datetime

class AdminAILog(BaseModel):
    id: str
    user_id: str
    user_email: str
    action: str # 'resume_analysis', 'content_generation', 'chat'
    model: str # 'gemini-pro', 'gpt-4'
    tokens_used: int
    cost: float
    status: str # 'success', 'failed'
    latency_ms: int
    created_at: datetime

class AdminSystemSettings(BaseModel):
    maintenance_mode: bool
    allow_signups: bool
    default_credits: int
    announcement_banner: Optional[str] = None
    version: str






