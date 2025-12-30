from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.dependencies import admin_only
from app.schemas.admin import DashboardStats, AnalyticsData
from typing import List, Optional
from google.cloud.firestore_v1 import FieldFilter

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(admin_only)]
)

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """
    Get aggregated statistics for the admin dashboard with REAL DATA.
    Optimized for parallel fetching and minimal data transfer.
    """
    from firebase_admin import auth, firestore
    from app.firebase import codetapasya_app, resume_maker_app
    from datetime import datetime, timedelta, timezone
    import asyncio
    
    # Initialize default stats
    stats = {
        "total_users": 0,
        "active_users_today": 0,
        "credits_purchased_today": 0,
        "total_credits_used": 0,
        "resumes_created": 0,
        "ats_checks_today": 0,
        "ai_actions_today": 0,
        "templates_purchased": 0,
        "portfolios_deployed": 0
    }
    
    start_time = datetime.utcnow()
    today = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday = start_time - timedelta(days=1)
    yesterday_ts = int(yesterday.timestamp() * 1000)  # Firebase Auth timestamp in milliseconds
    
    try:
        loop = asyncio.get_running_loop()
        db = None
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)

        # --- Helper Functions for Parallel Execution ---

        def fetch_auth_stats():
            """Fetch user stats from Firebase Auth"""
            result = {"total": 0, "active": 0}
            if codetapasya_app:
                try:
                    # iterate all users with explicit batch size
                    page = auth.list_users(max_results=1000, app=codetapasya_app)
                    while page:
                        for user in page.users:
                           result["total"] += 1
                           if user.user_metadata.last_sign_in_timestamp and user.user_metadata.last_sign_in_timestamp >= yesterday_ts:
                               result["active"] += 1
                        page = page.get_next_page()
                    print(f"✓ Auth stats - Total users: {result['total']}, Active today: {result['active']}")
                except Exception as e:
                    print(f"✗ Auth fetch error: {e}")
            else:
                print("✗ CodeTapasya app not initialized")
            return result

        def fetch_resume_count():
            """Count total resumes"""
            if not db: return 0
            try:
                # Optimized: select([]) fetches only doc references, not data
                count = sum(1 for _ in db.collection('resumes').select([]).stream())
                print(f"✓ Resumes count: {count}")
                return count
            except Exception as e:
                print(f"✗ Error counting resumes: {e}")
                return 0

        def fetch_portfolio_count():
            """Count deployed portfolios"""
            if not db: return 0
            try:
                # First, let's check all portfolios and their statuses
                all_portfolios = list(db.collection('portfolio_sessions').limit(5).stream())
                print(f"🔍 Sample portfolio documents: {len(all_portfolios)}")
                for doc in all_portfolios[:3]:
                    data = doc.to_dict()
                    print(f"  - Portfolio {doc.id}: {data.get('deployment_status', 'NO STATUS')} | {list(data.keys())[:5]}")
                
                # Try different possible status values
                success_count = sum(1 for _ in db.collection('portfolio_sessions')
                          .where(filter=FieldFilter('deployment_status', '==', 'SUCCESS'))
                          .select([]).stream())
                
                # Also try lowercase and other variations
                all_count = sum(1 for _ in db.collection('portfolio_sessions').select([]).stream())
                
                print(f"✓ Portfolios - Total: {all_count}, SUCCESS status: {success_count}")
                return success_count if success_count > 0 else all_count
            except Exception as e:
                print(f"✗ Error counting portfolios: {e}")
                import traceback
                traceback.print_exc()
                return 0

        def fetch_templates_count():
            """Count templates purchased"""
            if not db: return 0
            try:
                count = sum(1 for _ in db.collection('unlocked_templates').select([]).stream())
                print(f"✓ Templates count: {count}")
                return count
            except Exception as e:
                print(f"✗ Error counting templates: {e}")
                return 0

        def fetch_transaction_stats():
            """Fetch credit transaction stats"""
            if not db: return 0
            try:
                # First check if collection exists
                sample_txns = list(db.collection('credit_transactions').limit(5).stream())
                print(f"🔍 Sample credit_transactions: {len(sample_txns)}")
                for doc in sample_txns[:3]:
                    data = doc.to_dict()
                    print(f"  - Type: {data.get('type', 'NO TYPE')} | Status: {data.get('status', 'NO STATUS')} | Credits: {data.get('credits', 0)}")
                
                # Fetch only necessary fields: created_at, credits
                txns = db.collection('credit_transactions')\
                    .where(filter=FieldFilter('type', '==', 'purchase'))\
                    .where(filter=FieldFilter('status', '==', 'success'))\
                    .select(['created_at', 'credits']).stream()
                
                total_today = 0
                total_all = 0
                txn_count = 0
                for doc in txns:
                    txn_count += 1
                    data = doc.to_dict()
                    credits = data.get('credits', 0)
                    total_all += credits
                    
                    created_at = data.get('created_at')
                    if created_at:
                        # Handle potential timestamp types safely
                        try:
                            if hasattr(created_at, 'timestamp'):
                                d = datetime.utcfromtimestamp(created_at.timestamp())
                            else:
                                d = datetime.fromisoformat(str(created_at).replace('Z', '+00:00'))
                            
                            if d.date() == today.date():
                                total_today += credits
                        except: pass
                print(f"✓ Transactions - Found {txn_count} | Total credits: {total_all} | Today: {total_today}")
                return total_today
            except Exception as e:
                print(f"✗ Error fetching transactions: {e}")
                import traceback
                traceback.print_exc()
                return 0

        def fetch_audit_stats():
            """Fetch usage stats from user credit_transactions subcollections"""
            if not db: 
                print("  ⚠️ No DB connection for credit stats")
                return {"total": 0, "ats": 0, "ai": 0}
            try:
                print("🔍 Fetching credit usage from user credit_transactions...")
                
                # For "today" - start of today UTC
                now = datetime.now(timezone.utc)
                today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                
                total_credits = 0
                ats_today = 0
                ai_today = 0
                sample_shown = 0
                users_checked = 0
                total_transactions = 0
                
                # Get list of all users
                user_docs = list(db.collection('users').limit(1000).stream())
                print(f"  📊 Checking {len(user_docs)} users for credit transactions...")
                
                for user_doc in user_docs:
                    user_id = user_doc.id
                    users_checked += 1
                    
                    # Get credit_transactions subcollection
                    transactions_ref = db.collection('users').document(user_id).collection('credit_transactions')
                    
                    try:
                        # Get all usage transactions
                        all_txns = list(transactions_ref.stream())
                        
                        for txn in all_txns:
                            data = txn.to_dict()
                            txn_type = data.get('type', '')
                            
                            # Only process USAGE transactions
                            if txn_type != 'usage':
                                continue
                            
                            total_transactions += 1
                            
                            # Show first 5 samples for debugging
                            if sample_shown < 5:
                                print(f"  📄 Sample: user={user_id[:8]}, type={txn_type}, amount={data.get('amount')}, feature={data.get('feature')}, timestamp={data.get('timestamp')}")
                                sample_shown += 1
                            
                            # Amount is negative for usage
                            amount = abs(data.get('amount', 0))
                            total_credits += amount
                            
                            # Check feature type and if it's today
                            feature = data.get('feature', '')
                            timestamp = data.get('timestamp')
                            
                            # Check if transaction is from today
                            is_today = False
                            if timestamp:
                                try:
                                    # Firestore timestamp object
                                    if hasattr(timestamp, 'timestamp'):
                                        txn_dt = datetime.fromtimestamp(timestamp.timestamp(), tz=timezone.utc)
                                        is_today = txn_dt >= today_start
                                    # Already datetime
                                    elif isinstance(timestamp, datetime):
                                        is_today = timestamp.replace(tzinfo=timezone.utc) >= today_start
                                except Exception as ts_err:
                                    if sample_shown < 2:
                                        print(f"  ⚠️ Timestamp parse error: {ts_err}")
                            
                            # Count today's activities
                            if is_today:
                                if feature == 'ats_scoring':
                                    ats_today += 1
                                elif feature in ['ai_rewrite', 'ai_suggestion', 'interview_generate_session', 'interview_regenerate_answer']:
                                    ai_today += 1
                                    
                    except Exception as user_err:
                        if sample_shown < 2:
                            print(f"  ⚠️ Error for user {user_id}: {user_err}")
                        continue
                
                print(f"  ✓ Credit stats - Users checked: {users_checked}, Usage transactions: {total_transactions}")
                print(f"  ✓ TOTAL credits used (all time): {total_credits}")
                print(f"  ✓ TODAY: ATS checks: {ats_today}, AI actions: {ai_today}")
                return {"total": total_credits, "ats": ats_today, "ai": ai_today}
                
            except Exception as e:
                print(f"  ✗ Error fetching credit stats: {e}")
                import traceback
                traceback.print_exc()
                return {"total": 0, "ats": 0, "ai": 0}

        # --- Execute in Parallel ---
        
        print("\n=== FETCHING ADMIN DASHBOARD STATS ===")
        print(f"CodeTapasya App: {'✓ Initialized' if codetapasya_app else '✗ Not initialized'}")
        print(f"Resume Maker App: {'✓ Initialized' if resume_maker_app else '✗ Not initialized'}")
        print(f"Firestore DB: {'✓ Connected' if db else '✗ Not connected'}")
        
        tasks = [
            loop.run_in_executor(None, fetch_auth_stats),
            loop.run_in_executor(None, fetch_resume_count),
            loop.run_in_executor(None, fetch_portfolio_count),
            loop.run_in_executor(None, fetch_templates_count),
            loop.run_in_executor(None, fetch_transaction_stats),
            loop.run_in_executor(None, fetch_audit_stats)
        ]

        results = await asyncio.gather(*tasks)
        
        # Unpack results
        auth_res = results[0]
        resume_count = results[1]
        portfolio_count = results[2]
        template_count = results[3]
        txn_stats = results[4]
        audit_res = results[5]

        # Populate stats object
        stats["total_users"] = auth_res["total"]
        stats["active_users_today"] = auth_res["active"]
        stats["resumes_created"] = resume_count
        stats["portfolios_deployed"] = portfolio_count
        stats["templates_purchased"] = template_count
        stats["credits_purchased_today"] = txn_stats
        stats["total_credits_used"] = audit_res["total"]
        stats["ats_checks_today"] = audit_res["ats"]
        stats["ai_actions_today"] = audit_res["ai"]
        
        print(f"\n=== FINAL STATS ===")
        print(f"Total Users: {stats['total_users']}")
        print(f"Active Today: {stats['active_users_today']}")
        print(f"Resumes: {stats['resumes_created']}")
        print(f"Portfolios: {stats['portfolios_deployed']}")
        print(f"Credits Purchased Today: {stats['credits_purchased_today']}")
        print(f"Credits Used: {stats['total_credits_used']}")
        print("=" * 40 + "\n")

    except Exception as e:
        print(f"✗ Error in optimized get_dashboard_stats: {e}")
        import traceback
        traceback.print_exc()
    
    return DashboardStats(**stats)

@router.get("/logs")
async def get_admin_logs():
    """
    Get recent admin activity logs from Firestore.
    """
    from firebase_admin import firestore
    from app.firebase import resume_maker_app
    from datetime import datetime
    
    logs = []
    
    try:
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)
            
            # Get recent audit logs (last 20) - CORRECT collection name is audit_logs
            audit_ref = db.collection('audit_logs')\
                .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                .limit(20)
            
            for doc in audit_ref.stream():
                data = doc.to_dict()
                timestamp = data.get('timestamp')
                
                # Convert timestamp to ISO string
                if timestamp:
                    if hasattr(timestamp, 'timestamp'):
                        iso_time = datetime.utcfromtimestamp(timestamp.timestamp()).isoformat() + 'Z'
                    else:
                        iso_time = str(timestamp)
                else:
                    iso_time = datetime.utcnow().isoformat() + 'Z'
                
                logs.append({
                    "action": data.get('action', 'Unknown Action'),
                    "timestamp": iso_time,
                    "details": f"{data.get('user_email', 'System')} - {data.get('details', 'No details')}"
                })
    except Exception as e:
        print(f"Error fetching admin logs: {e}")
        # Return some default logs
        logs = [
            {
                "action": "System Started",
                "timestamp": datetime.utcnow().isoformat() + 'Z',
                "details": "Admin dashboard initialized"
            }
        ]
    
    return logs

@router.get("/analytics", response_model=AnalyticsData)
async def get_analytics_data(days: int = 30):
    """
    Get comprehensive analytics data for charts and visualizations.
    Optimized for parallel fetching and minimal data transfer.
    """
    from firebase_admin import firestore, auth
    from app.firebase import resume_maker_app, codetapasya_app
    from datetime import datetime, timedelta
    from collections import defaultdict
    import asyncio
    
    analytics = {
        "user_growth": [],
        "revenue_trend": [],
        "credit_usage": [],
        "top_templates": [],
        "user_activity": {},
        "platform_stats": {}
    }
    
    try:
        loop = asyncio.get_running_loop()
        db = None
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)
            
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        start_date_ts = int(start_date.timestamp() * 1000)

        # --- Helper Functions for Parallel Execution ---

        def fetch_user_growth():
            """1. USER GROWTH (Daily signups)"""
            growth_data = []
            if codetapasya_app:
                try:
                    # Get users (Note: list_users is still synchronous/slow for huge datasets)
                    # Ideally we would limit this based on 'last_sign_in' or similar if possible via API, 
                    # but pure Auth API doesn't support query by date.
                    # We accept this cost for now but run it in parallel.
                    today_date = datetime.utcnow().date()
                    daily_signups = defaultdict(int)
                    
                    # Iterate all pages
                    page = auth.list_users(max_results=1000, app=codetapasya_app)
                    while page:
                        for user in page.users:
                            if user.user_metadata.creation_timestamp:
                                if user.user_metadata.creation_timestamp >= start_date_ts:
                                    signup_date = datetime.utcfromtimestamp(
                                        user.user_metadata.creation_timestamp / 1000
                                    ).date()
                                    daily_signups[signup_date.isoformat()] += 1
                        page = page.get_next_page()
                    
                    for date_str in sorted(daily_signups.keys()):
                        growth_data.append({
                            "date": date_str,
                            "count": daily_signups[date_str]
                        })
                except Exception as e:
                    print(f"Error getting user growth: {e}")
            return growth_data

        def fetch_revenue_trend():
            """2. REVENUE TREND (Daily credit purchases)"""
            revenue_data = []
            if not db: return revenue_data
            try:
                # Select only needed fields
                transactions = db.collection('credit_transactions')\
                    .where(filter=FieldFilter('type', '==', 'purchase'))\
                    .where(filter=FieldFilter('status', '==', 'success'))\
                    .select(['created_at', 'amount', 'credits']).stream()
                
                daily_revenue = defaultdict(lambda: {"amount": 0, "credits": 0, "count": 0})
                
                for doc in transactions:
                    data = doc.to_dict()
                    created_at = data.get('created_at')
                    if created_at:
                        try:
                            if hasattr(created_at, 'timestamp'):
                                doc_date = datetime.utcfromtimestamp(created_at.timestamp()).date()
                            else:
                                doc_date = datetime.fromisoformat(str(created_at).split('T')[0]).date()
                            
                            if doc_date >= start_date.date():
                                date_str = doc_date.isoformat()
                                daily_revenue[date_str]["amount"] += data.get('amount', 0)
                                daily_revenue[date_str]["credits"] += data.get('credits', 0)
                                daily_revenue[date_str]["count"] += 1
                        except: pass

                for date_str in sorted(daily_revenue.keys()):
                    revenue_data.append({
                        "date": date_str,
                        **daily_revenue[date_str]
                    })
            except Exception as e:
                print(f"Error getting revenue trend: {e}")
            return revenue_data

        def fetch_credit_usage():
            """3. CREDIT USAGE BY FEATURE - from user credit_transactions"""
            usage_data = []
            if not db: return usage_data
            try:
                # Query all users' credit_transactions subcollections
                users_ref = db.collection('users')
                
                feature_usage = defaultdict(lambda: {"count": 0, "credits": 0})
                
                for user_doc in users_ref.stream():
                    user_id = user_doc.id
                    
                    # Get credit_transactions for this user
                    transactions_ref = users_ref.document(user_id).collection('credit_transactions')
                    
                    # Filter for USAGE type
                    usage_txns = transactions_ref.where(
                        filter=FieldFilter('type', '==', 'usage')
                    ).stream()
                    
                    for txn in usage_txns:
                        data = txn.to_dict()
                        feature = data.get('feature', 'unknown')
                        # Amount is negative for usage
                        credits = abs(data.get('amount', 0))
                        
                        feature_usage[feature]["count"] += 1
                        feature_usage[feature]["credits"] += credits
                
                feature_names = {
                    'ats_scoring': 'ATS Score Check',
                    'ai_rewrite': 'AI Rewrite',
                    'ai_suggestion': 'AI Enhancement',
                    'pdf_export': 'PDF Export',
                    'portfolio_generate': 'Portfolio Generation',
                    'interview_generate_session': 'Interview Prep',
                    'deploy_ghpages': 'GitHub Pages Deploy',
                    'deploy_vercel': 'Vercel Deploy',
                    'deploy_netlify': 'Netlify Deploy'
                }
                
                for feature, data in feature_usage.items():
                    usage_data.append({
                        "feature": feature_names.get(feature, feature.replace('_', ' ').title()),
                        "count": data["count"],
                        "credits": data["credits"]
                    })
            except Exception as e:
                print(f"Error getting credit usage: {e}")
            return usage_data

        def fetch_top_templates():
            """4. TOP TEMPLATES"""
            templates_data = []
            if not db: return templates_data
            try:
                # Fetch ONLY template_id field
                resumes = db.collection('resumes').select(['template_id']).stream()
                template_usage = defaultdict(int)
                
                for doc in resumes:
                    data = doc.to_dict()
                    template = data.get('template_id', 'unknown')
                    template_usage[template] += 1
                
                sorted_templates = sorted(template_usage.items(), key=lambda x: x[1], reverse=True)[:10]
                
                for template, count in sorted_templates:
                    templates_data.append({
                        "template": template,
                        "count": count
                    })
            except Exception as e:
                print(f"Error getting top templates: {e}")
            return templates_data

        def fetch_user_activity():
            """5. USER ACTIVITY HEATMAP - from credit transactions"""
            activity_data = {"hourly": []}
            if not db: return activity_data
            try:
                # Collect recent activity from user credit_transactions
                hourly_activity = defaultdict(int)
                users_ref = db.collection('users')
                
                transaction_count = 0
                for user_doc in users_ref.stream():
                    user_id = user_doc.id
                    
                    # Get recent transactions (last 7 days worth)
                    transactions_ref = users_ref.document(user_id).collection('credit_transactions')
                    recent_txns = transactions_ref.order_by('timestamp', direction=firestore.Query.DESCENDING)\
                        .limit(100).stream()
                    
                    for txn in recent_txns:
                        data = txn.to_dict()
                        timestamp = data.get('timestamp')
                        if timestamp:
                            try:
                                if hasattr(timestamp, 'hour'):
                                    hour = timestamp.hour
                                else:
                                    hour = datetime.fromisoformat(str(timestamp).replace('Z', '+00:00')).hour
                                hourly_activity[hour] += 1
                                transaction_count += 1
                            except: 
                                pass
                    
                    # Limit total transactions processed for performance
                    if transaction_count >= 1000:
                        break
                
                activity_data["hourly"] = [{"hour": h, "count": hourly_activity.get(h, 0)} for h in range(24)]
            except Exception as e:
                print(f"Error getting user activity: {e}")
            return activity_data

        def fetch_platform_stats():
            """6. PLATFORM STATS"""
            stats = {"resumes": 0, "portfolios": 0, "interviews": 0, "total": 0}
            if not db: return stats
            try:
                # Use count via select([])
                t_resumes = sum(1 for _ in db.collection('resumes').select([]).stream())
                t_portfolios = sum(1 for _ in db.collection('portfolio_sessions').select([]).stream())
                t_interviews = sum(1 for _ in db.collection('interview_sessions').select([]).stream())
                
                stats = {
                    "resumes": t_resumes,
                    "portfolios": t_portfolios,
                    "interviews": t_interviews,
                    "total": t_resumes + t_portfolios + t_interviews
                }
            except Exception as e:
                print(f"Error getting platform stats: {e}")
            return stats

        # --- Execute in Parallel ---

        tasks = [
            loop.run_in_executor(None, fetch_user_growth),
            loop.run_in_executor(None, fetch_revenue_trend),
            loop.run_in_executor(None, fetch_credit_usage),
            loop.run_in_executor(None, fetch_top_templates),
            loop.run_in_executor(None, fetch_user_activity),
            loop.run_in_executor(None, fetch_platform_stats)
        ]

        results = await asyncio.gather(*tasks)

        analytics["user_growth"] = results[0]
        analytics["revenue_trend"] = results[1]
        analytics["credit_usage"] = results[2]
        analytics["top_templates"] = results[3]
        analytics["user_activity"] = results[4]
        analytics["platform_stats"] = results[5]

    except Exception as e:
        print(f"Error in optimized get_analytics_data: {e}")
    
    return AnalyticsData(**analytics)

# --- User Management ---

@router.get("/users", response_model=dict)
async def list_users(
    page: int = 1, 
    limit: int = 50,
    status: str = 'all',  # all, active, banned
    role: str = 'all',  # all, admin, user
    credits: str = 'all',  # all, low, medium, high
    joined: str = 'all',  # all, today, week, month
    search: str = ''
):
    """
    List all users with Firestore composite indexes (production-grade, scalable to 1M+ users).
    
    Architecture:
    - Denormalized collection: users_admin_view (synced by Cloud Functions)
    - Composite indexes for fast filtering (O(log n))
    - Only fetches the 50 users for current page
    - Cost: 50 reads/request vs 2,326 reads with old approach
    
    Filters:
    - status: all, active, banned
    - role: all, admin, user
    - credits: all, low (<20), medium (20-99), high (100+)
    - joined: all, today, week, month
    - search: search by email, name, or UID
    """
    from firebase_admin import firestore
    from app.firebase import resume_maker_app
    from datetime import datetime, timezone, timedelta
    from google.cloud.firestore_v1.base_query import FieldFilter
    
    if not resume_maker_app:
        return {
            "users": [{
                "uid": "dev-user-123",
                "email": "dev@example.com",
                "display_name": "Development User",
                "created_at": 1700000000000,
                "last_login_at": 1700000000000,
                "disabled": False,
                "credits_balance": 100,
                "resumes_count": 2
            }],
            "total": 1,
            "page": 1,
            "limit": 50,
            "total_pages": 1
        }

    try:
        db = firestore.client(app=resume_maker_app)
        
        # Build query on denormalized collection
        query = db.collection('users_admin_view')
        
        # Apply filters (Firestore uses indexes for fast filtering)
        now = datetime.now(timezone.utc)
        
        # If search is provided, skip other filters and search across all users
        if search:
            # Order by created_at for consistency
            query = query.order_by('created_at', direction=firestore.Query.DESCENDING)
            
            # Get ALL users (limited to reasonable amount for search)
            query = query.limit(500)  # Limit search to 500 most recent users
            
            # Execute query
            docs = query.stream()
            users_list = []
            
            search_lower = search.lower()
            for doc in docs:
                data = doc.to_dict()
                
                # Search by email, name, or UID
                matches = (
                    search_lower in (data.get('email') or '').lower() or
                    search_lower in (data.get('display_name') or '').lower() or
                    search_lower in data.get('uid', '')
                )
                
                if matches:
                    users_list.append({
                        "uid": data.get('uid'),
                        "email": data.get('email'),
                        "display_name": data.get('display_name'),
                        "photo_url": data.get('photo_url'),
                        "created_at": data.get('created_at'),
                        "last_login_at": data.get('last_login_at'),
                        "disabled": data.get('disabled', False),
                        "is_admin": data.get('is_admin', False),
                        "credits_balance": data.get('credits_balance', 0),
                        "resumes_count": data.get('resumes_count', 0)
                    })
            
            # Return search results (ignore pagination for search)
            return {
                "users": users_list,
                "total": len(users_list),
                "page": 1,
                "limit": len(users_list),
                "total_pages": 1
            }
        
        # No search - apply filters normally
        # Status filter
        if status == 'active':
            query = query.where(filter=FieldFilter('disabled', '==', False))
        elif status == 'banned':
            query = query.where(filter=FieldFilter('disabled', '==', True))
        
        # Role filter
        if role == 'admin':
            query = query.where(filter=FieldFilter('is_admin', '==', True))
        elif role == 'user':
            query = query.where(filter=FieldFilter('is_admin', '==', False))
        
        # Credits filter - TEMPORARILY disabled until indexes build
        # Will re-enable after indexes are ready (~10 minutes)
        # if credits == 'low':
        #     query = query.where(filter=FieldFilter('credits_balance', '<', 20))
        # elif credits == 'medium':
        #     query = query.where(filter=FieldFilter('credits_balance', '>=', 20))
        #     query = query.where(filter=FieldFilter('credits_balance', '<', 100))
        # elif credits == 'high':
        #     query = query.where(filter=FieldFilter('credits_balance', '>=', 100))
        
        # Date filter (uses composite index)
        if joined == 'today':
            start_of_day = int(datetime(now.year, now.month, now.day, tzinfo=timezone.utc).timestamp() * 1000)
            query = query.where(filter=FieldFilter('created_at', '>=', start_of_day))
        elif joined == 'week':
            week_ago = int((now - timedelta(days=7)).timestamp() * 1000)
            query = query.where(filter=FieldFilter('created_at', '>=', week_ago))
        elif joined == 'month':
            month_ago = int((now - timedelta(days=30)).timestamp() * 1000)
            query = query.where(filter=FieldFilter('created_at', '>=', month_ago))
        
        # Order by created_at (descending - newest first)
        query = query.order_by('created_at', direction=firestore.Query.DESCENDING)
        
        # Get total count for pagination (this is a count query, very cheap)
        count_query = query.count()
        total_count = count_query.get()[0][0].value
        
        # Apply pagination (only fetch 50 docs!)
        offset = (page - 1) * limit
        query = query.limit(limit).offset(offset)
        
        # Execute query
        docs = query.stream()
        users_list = []
        
        for doc in docs:
            data = doc.to_dict()
            
            # TEMPORARY: Apply credits filter client-side until indexes build
            if credits != 'all':
                user_credits = data.get('credits_balance', 0)
                if credits == 'low' and user_credits >= 20:
                    continue
                if credits == 'medium' and (user_credits < 20 or user_credits >= 100):
                    continue
                if credits == 'high' and user_credits < 100:
                    continue
            
            users_list.append({
                "uid": data.get('uid'),
                "email": data.get('email'),
                "display_name": data.get('display_name'),
                "photo_url": data.get('photo_url'),
                "created_at": data.get('created_at'),
                "last_login_at": data.get('last_login_at'),
                "disabled": data.get('disabled', False),
                "custom_claims": {"admin": data.get('is_admin', False)} if data.get('is_admin') else {},
                "credits_balance": data.get('credits_balance', 0),
                "resumes_count": data.get('resumes_count', 0)
            })
        
        # If search filter was applied, adjust total count
        total_filtered = len(users_list) if search else total_count
        total_pages = (total_filtered + limit - 1) // limit if total_filtered > 0 else 1
        
        print(f"✓ Query returned {len(users_list)} users (page {page}/{total_pages})")
        
        return {
            "users": users_list,
            "total": total_filtered,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
        
    except Exception as e:
        print(f"❌ Error querying users_admin_view: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{uid}", response_model=dict)
async def get_user_details(uid: str):
    """
    Get comprehensive user details including:
    - Basic info (email, name, photo)
    - Login history (last login, creation date, sign-in timestamps)
    - Credits (balance, transaction history)
    - Resumes (count, list with scores)
    - Portfolios (count)
    - Activity logs (AI usage, ATS checks)
    """
    from firebase_admin import auth, firestore
    from app.firebase import codetapasya_app, resume_maker_app
    from datetime import datetime, timezone
    
    if not codetapasya_app:
        return {
            "uid": uid,
            "email": "dev@example.com",
            "display_name": "Dev User",
            "credits_balance": 50,
            "resumes": [],
            "credit_history": [],
            "login_history": {}
        }

    try:
        user = auth.get_user(uid, app=codetapasya_app)
        
        # Initialize default values
        credits_balance = 0
        total_spent = 0
        total_earned = 0
        resumes_count = 0
        portfolios_count = 0
        credit_history = []
        resumes = []
        activity_logs = []
        ai_usage_count = 0
        ats_check_count = 0
        
        # Fetch real data from Firestore
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)
            
            try:
                # Get user's credit balance from subcollection
                balance_doc = db.collection('users').document(uid).collection('credits').document('balance').get(timeout=5.0)
                if balance_doc.exists:
                    balance_data = balance_doc.to_dict()
                    credits_balance = balance_data.get('balance', 0)
                    total_spent = balance_data.get('total_spent', 0)
                    total_earned = balance_data.get('total_earned', 0)
                
                # Get user's resumes
                resumes_snapshot = db.collection('resumes').where(filter=FieldFilter('user_id', '==', uid)).stream()
                resumes_count = 0
                for resume_doc in resumes_snapshot:
                    resumes_count += 1
                    resume_data = resume_doc.to_dict()
                    resumes.append({
                        "id": resume_doc.id,
                        "title": resume_data.get('title', 'Untitled Resume'),
                        "template": resume_data.get('template', 'unknown'),
                        "updated_at": resume_data.get('updated_at', datetime.now(timezone.utc)).isoformat() if hasattr(resume_data.get('updated_at'), 'isoformat') else str(resume_data.get('updated_at', '')),
                        "score": resume_data.get('ats_score', 0)
                    })
                
                # Count portfolios
                portfolios_snapshot = db.collection('portfolio_sessions').where(filter=FieldFilter('user_id', '==', uid)).stream()
                portfolios_count = sum(1 for _ in portfolios_snapshot)
                
                # Get credit transaction history from subcollection
                credit_transactions = db.collection('users').document(uid).collection('credit_transactions')\
                    .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                    .limit(50)\
                    .stream()
                
                for txn_doc in credit_transactions:
                    txn_data = txn_doc.to_dict()
                    timestamp = txn_data.get('timestamp')
                    
                    # Convert timestamp to ISO string
                    if timestamp:
                        if hasattr(timestamp, 'timestamp'):
                            iso_time = datetime.utcfromtimestamp(timestamp.timestamp()).isoformat() + 'Z'
                        elif hasattr(timestamp, 'isoformat'):
                            iso_time = timestamp.isoformat()
                        else:
                            iso_time = str(timestamp)
                    else:
                        iso_time = datetime.now(timezone.utc).isoformat() + 'Z'
                    
                    txn_type = txn_data.get('type', 'unknown')
                    feature = txn_data.get('feature', '')
                    amount = txn_data.get('amount', 0)
                    
                    # Count AI and ATS usage
                    if txn_type == 'usage':
                        if feature == 'ats_scoring':
                            ats_check_count += 1
                        elif feature in ['ai_rewrite', 'ai_suggestion']:
                            ai_usage_count += 1
                    
                    credit_history.append({
                        "timestamp": iso_time,
                        "type": txn_type,
                        "feature": feature,
                        "amount": amount,
                        "description": txn_data.get('description', ''),
                        "balance_after": txn_data.get('balance_after', 0)
                    })
                
                # Get recent activity logs
                activity_snapshot = db.collection('users').document(uid).collection('credit_transactions')\
                    .where(filter=FieldFilter('type', '==', 'usage'))\
                    .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                    .limit(20)\
                    .stream()
                
                for activity_doc in activity_snapshot:
                    activity_data = activity_doc.to_dict()
                    timestamp = activity_data.get('timestamp')
                    
                    if timestamp:
                        if hasattr(timestamp, 'isoformat'):
                            iso_time = timestamp.isoformat()
                        else:
                            iso_time = str(timestamp)
                    else:
                        iso_time = datetime.now(timezone.utc).isoformat()
                    
                    activity_logs.append({
                        "timestamp": iso_time,
                        "action": activity_data.get('feature', 'unknown'),
                        "credits_used": abs(activity_data.get('amount', 0)),
                        "description": activity_data.get('description', '')
                    })
                    
            except Exception as e:
                print(f"Error fetching Firestore data for user {uid}: {e}")
        
        # Build login history from Firebase Auth metadata
        login_history = {
            "last_sign_in": user.user_metadata.last_sign_in_timestamp,
            "creation_time": user.user_metadata.creation_timestamp,
            "last_refresh": user.user_metadata.last_refresh_timestamp if hasattr(user.user_metadata, 'last_refresh_timestamp') else None,
            "email_verified": user.email_verified,
            "provider": user.provider_id,
            "providers": [provider.provider_id for provider in user.provider_data]
        }
        
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
            "credits_balance": credits_balance,
            "total_spent": total_spent,
            "total_earned": total_earned,
            "resumes_count": resumes_count,
            "portfolios_count": portfolios_count,
            "ai_usage_count": ai_usage_count,
            "ats_check_count": ats_check_count,
            "credit_history": credit_history,
            "resumes": resumes,
            "activity_logs": activity_logs,
            "login_history": login_history
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"User not found: {str(e)}")

@router.post("/users/{uid}/ban")
async def ban_user(uid: str):
    from firebase_admin import auth, firestore
    from app.firebase import codetapasya_app, resume_maker_app
    if not codetapasya_app: return {"status": "success", "mock": True}
    
    try:
        # Update Firebase Auth
        auth.update_user(uid, disabled=True, app=codetapasya_app)
        
        # Sync to users_admin_view collection
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)
            db.collection('users_admin_view').document(uid).update({
                'disabled': True
            })
        
        return {"status": "success", "message": f"User {uid} banned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/{uid}/unban")
async def unban_user(uid: str):
    from firebase_admin import auth, firestore
    from app.firebase import codetapasya_app, resume_maker_app
    if not codetapasya_app: return {"status": "success", "mock": True}
    
    try:
        # Update Firebase Auth
        auth.update_user(uid, disabled=False, app=codetapasya_app)
        
        # Sync to users_admin_view collection
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)
            db.collection('users_admin_view').document(uid).update({
                'disabled': False
            })
        
        return {"status": "success", "message": f"User {uid} unbanned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/{uid}/make-admin")
async def make_admin(uid: str):
    from firebase_admin import auth, firestore
    from app.firebase import codetapasya_app, resume_maker_app
    if not codetapasya_app: return {"status": "success", "mock": True}
    
    try:
        # Update Firebase Auth custom claims
        auth.set_custom_user_claims(uid, {"admin": True}, app=codetapasya_app)
        
        # Sync to users_admin_view collection
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)
            db.collection('users_admin_view').document(uid).update({
                'is_admin': True
            })
        
        return {"status": "success", "message": f"User {uid} is now an admin"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/{uid}/remove-admin")
async def remove_admin(uid: str):
    from firebase_admin import auth, firestore
    from app.firebase import codetapasya_app, resume_maker_app
    if not codetapasya_app: return {"status": "success", "mock": True}
    
    try:
        # Update Firebase Auth custom claims
        auth.set_custom_user_claims(uid, {"admin": False}, app=codetapasya_app)
        
        # Sync to users_admin_view collection with REAL credits
        if resume_maker_app:
            db = firestore.client(app=resume_maker_app)
            
            # Fetch actual credits balance from user's credit balance document
            real_credits = 50  # Default to free tier if no balance exists
            try:
                balance_doc = db.collection('users').document(uid).collection('credits').document('balance').get()
                if balance_doc.exists:
                    balance_data = balance_doc.to_dict()
                    real_credits = int(balance_data.get('balance', 50))
                    
                    # If balance is the inflated admin amount (999999), reset to default
                    if real_credits >= 900000:
                        real_credits = 50
                else:
                    # No balance document exists, create one with default amount
                    from datetime import datetime, timezone
                    db.collection('users').document(uid).collection('credits').document('balance').set({
                        'balance': 50,
                        'total_spent': 0,
                        'total_earned': 50,
                        'last_updated': datetime.now(timezone.utc),
                        'created_at': datetime.now(timezone.utc)
                    })
            except Exception as e:
                print(f"Warning: Could not fetch real credits for {uid}: {e}")
            
            # Update admin view with real credits
            db.collection('users_admin_view').document(uid).update({
                'is_admin': False,
                'credits_balance': real_credits  # Restore real credits or default 50
            })
        
        return {"status": "success", "message": f"Admin role removed from user {uid}"}
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

