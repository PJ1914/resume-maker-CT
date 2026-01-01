"""
Cloud Functions for Real-Time Admin Stats Updates

These functions automatically update admin_stats/global whenever users perform actions.
Deployed using Google Cloud Functions (2nd gen) with Python 3.11 runtime.
"""

import functions_framework
from firebase_admin import initialize_app, firestore
from datetime import datetime, timezone
from google.cloud.firestore_v1 import Increment

# Initialize Firebase Admin
try:
    app = initialize_app()
except ValueError:
    # Already initialized
    pass


@functions_framework.cloud_event
def on_credit_transaction(cloud_event):
    """
    Triggered when a credit transaction is created/updated.
    Updates aggregated stats in real-time.
    
    Firestore trigger: users/{userId}/credit_transactions/{txId}
    """
    # Get the new document data
    data = cloud_event.data.get("value", {}).get("fields", {})
    
    if not data:
        return
    
    # Extract transaction details
    txn_type = data.get("type", {}).get("stringValue", "")
    feature = data.get("feature", {}).get("stringValue", "")
    amount = int(data.get("amount", {}).get("integerValue", 0))
    
    # Only process usage transactions
    if txn_type != "usage":
        return
    
    # Check if transaction is from today
    timestamp_value = data.get("timestamp", {})
    if "timestampValue" not in timestamp_value:
        return
    
    txn_time = datetime.fromisoformat(timestamp_value["timestampValue"].replace("Z", "+00:00"))
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    if txn_time < today_start:
        return  # Not today's transaction
    
    # Update aggregated stats
    db = firestore.client()
    stats_ref = db.collection('admin_stats').document('global')
    
    updates = {
        'total_credits_used': Increment(abs(amount)),
        'last_updated': firestore.SERVER_TIMESTAMP
    }
    
    # Increment feature-specific counters
    if feature == 'ats_scoring':
        updates['ats_checks_today'] = Increment(1)
    elif feature in ['ai_rewrite', 'ai_suggestion', 'interview_generate_session', 'interview_regenerate_answer']:
        updates['ai_actions_today'] = Increment(1)
    
    stats_ref.update(updates)
    print(f"✓ Updated stats: {feature}, amount={amount}")


@functions_framework.cloud_event
def on_resume_created(cloud_event):
    """
    Triggered when a resume is created.
    Increments resume counter.
    
    Firestore trigger: resumes/{resumeId}
    """
    db = firestore.client()
    db.collection('admin_stats').document('global').update({
        'resumes_created': Increment(1),
        'last_updated': firestore.SERVER_TIMESTAMP
    })
    print("✓ Incremented resumes_created")


@functions_framework.cloud_event
def on_resume_deleted(cloud_event):
    """
    Triggered when a resume is deleted.
    Decrements resume counter.
    
    Firestore trigger: resumes/{resumeId}
    """
    db = firestore.client()
    db.collection('admin_stats').document('global').update({
        'resumes_created': Increment(-1),
        'last_updated': firestore.SERVER_TIMESTAMP
    })
    print("✓ Decremented resumes_created")


@functions_framework.cloud_event
def on_portfolio_updated(cloud_event):
    """
    Triggered when a portfolio is updated.
    Tracks deployed portfolios.
    
    Firestore trigger: portfolio_sessions/{sessionId}
    """
    # Get old and new data
    old_data = cloud_event.data.get("oldValue", {}).get("fields", {})
    new_data = cloud_event.data.get("value", {}).get("fields", {})
    
    old_deployed = old_data.get("deployed", {}).get("booleanValue", False)
    new_deployed = new_data.get("deployed", {}).get("booleanValue", False)
    
    # Only update if deployment status changed
    if old_deployed == new_deployed:
        return
    
    db = firestore.client()
    db.collection('admin_stats').document('global').update({
        'portfolios_deployed': Increment(1 if new_deployed else -1),
        'last_updated': firestore.SERVER_TIMESTAMP
    })
    print(f"✓ Updated portfolios_deployed: {1 if new_deployed else -1}")


@functions_framework.cloud_event  
def on_template_purchased(cloud_event):
    """
    Triggered when a template is purchased.
    Increments template purchase counter.
    
    Firestore trigger: unlocked_templates/{templateId}
    """
    db = firestore.client()
    db.collection('admin_stats').document('global').update({
        'templates_purchased': Increment(1),
        'last_updated': firestore.SERVER_TIMESTAMP
    })
    print("✓ Incremented templates_purchased")


@functions_framework.http
def reset_daily_stats(request):
    """
    HTTP function to reset daily counters.
    Called by Cloud Scheduler at midnight UTC.
    """
    db = firestore.client()
    db.collection('admin_stats').document('global').update({
        'ats_checks_today': 0,
        'ai_actions_today': 0,
        'credits_purchased_today': 0,
        'active_users_today': 0,
        'last_reset': firestore.SERVER_TIMESTAMP,
        'last_updated': firestore.SERVER_TIMESTAMP
    })
    print("✓ Reset daily stats at midnight UTC")
    return {"status": "success", "message": "Daily stats reset"}


@functions_framework.http
def update_user_count(request):
    """
    HTTP function to update total user count.
    Called by Cloud Scheduler every hour.
    """
    from firebase_admin import auth
    
    # Count total users
    page = auth.list_users()
    total = 0
    while page:
        total += len(page.users)
        page = page.get_next_page()
    
    # Update stats
    db = firestore.client()
    db.collection('admin_stats').document('global').update({
        'total_users': total,
        'last_updated': firestore.SERVER_TIMESTAMP
    })
    
    print(f"✓ Updated total_users: {total}")
    return {"status": "success", "total_users": total}
