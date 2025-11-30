"""
Credit management service for Resume Maker
Handles credit balance, transactions, and feature access
"""
from typing import Optional, Dict, List
from datetime import datetime, timezone
from enum import Enum

class CreditTransactionType(str, Enum):
    """Types of credit transactions"""
    PURCHASE = "purchase"
    USAGE = "usage"
    GRANT = "grant"
    MONTHLY_RESET = "monthly_reset"
    REFUND = "refund"

class FeatureType(str, Enum):
    """Features that require credits"""
    ATS_SCORING = "ats_scoring"
    AI_REWRITE = "ai_rewrite"
    AI_SUGGESTION = "ai_suggestion"
    PDF_EXPORT = "pdf_export"

# Credit costs for each feature
FEATURE_COSTS = {
    FeatureType.ATS_SCORING: 5,
    FeatureType.AI_REWRITE: 3,
    FeatureType.AI_SUGGESTION: 3,
    FeatureType.PDF_EXPORT: 2,
}

# Free tier monthly credits
FREE_MONTHLY_CREDITS = 10

# Special December 2025 bonus
DECEMBER_2025_BONUS = 50


def should_give_december_bonus(user_id: str) -> bool:
    """
    Check if user should receive December 2025 bonus.
    Only given once per user during December 2025.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return False
    
    now = datetime.now(timezone.utc)
    # Only during December 2025
    if now.year != 2025 or now.month != 12:
        return False
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Check if bonus already given
        bonus_doc = db.collection('users').document(user_id)\
                      .collection('credits').document('december_2025_bonus').get()
        
        return not bonus_doc.exists
        
    except Exception as e:
        print(f"Error checking December bonus: {e}")
        return False


def give_december_bonus(user_id: str) -> bool:
    """
    Give December 2025 special bonus (50 credits).
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would give December bonus to {user_id}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Get current balance
        credits = get_user_credits(user_id)
        new_balance = credits["balance"] + DECEMBER_2025_BONUS
        new_earned = credits["total_earned"] + DECEMBER_2025_BONUS
        
        # Update balance
        balance_ref = db.collection('users').document(user_id)\
                       .collection('credits').document('balance')
        
        balance_ref.update({
            "balance": new_balance,
            "total_earned": new_earned,
            "updated_at": datetime.now(timezone.utc),
        })
        
        # Mark bonus as given
        db.collection('users').document(user_id)\
          .collection('credits').document('december_2025_bonus').set({
              "given_at": datetime.now(timezone.utc),
              "amount": DECEMBER_2025_BONUS,
          })
        
        # Record transaction
        transaction_data = {
            "type": "DECEMBER_BONUS",
            "amount": DECEMBER_2025_BONUS,
            "description": "🎄 December 2025 Special Bonus!",
            "balance_after": new_balance,
            "timestamp": datetime.now(timezone.utc),
        }
        
        db.collection('users').document(user_id)\
          .collection('credit_transactions').add(transaction_data)
        
        print(f"🎄 Gave December bonus ({DECEMBER_2025_BONUS} credits) to {user_id}")
        return True
        
    except Exception as e:
        print(f"Error giving December bonus: {e}")
        return False

def get_user_credits(user_id: str) -> Dict:
    """
    Get user's current credit balance and info.
    Automatically handles monthly reset and December bonus.
    
    Returns:
        Dict with balance, tier, last_reset, etc.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        # Dev mode
        return {
            "balance": 100,
            "total_earned": 100,
            "total_spent": 0,
            "subscription_tier": "free",
            "last_reset": datetime.now(timezone.utc),
        }
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        doc = db.collection('users').document(user_id)\
                .collection('credits').document('balance').get()
        
        now = datetime.now(timezone.utc)
        
        if doc.exists:
            data = doc.to_dict()
            
            # Check and apply monthly reset
            last_reset = data.get("last_reset")
            should_reset = False
            
            if last_reset:
                if hasattr(last_reset, 'timestamp'):
                    last_reset = datetime.fromtimestamp(last_reset.timestamp(), tz=timezone.utc)
                
                # Check if it's a new month (compare year and month)
                if (now.year > last_reset.year) or \
                   (now.year == last_reset.year and now.month > last_reset.month):
                    should_reset = True
            else:
                should_reset = True
            
            if should_reset and data.get("subscription_tier", "free") == "free":
                # Reset monthly credits
                balance_ref = db.collection('users').document(user_id)\
                               .collection('credits').document('balance')
                
                balance_ref.update({
                    "balance": firestore.Increment(FREE_MONTHLY_CREDITS),
                    "total_earned": firestore.Increment(FREE_MONTHLY_CREDITS),
                    "last_reset": now,
                    "updated_at": now,
                })
                
                # Record transaction
                new_balance = data.get("balance", 0) + FREE_MONTHLY_CREDITS
                transaction_data = {
                    "type": CreditTransactionType.MONTHLY_RESET.value,
                    "amount": FREE_MONTHLY_CREDITS,
                    "description": f"Monthly free credits ({now.strftime('%B %Y')})",
                    "balance_after": new_balance,
                    "timestamp": now,
                }
                
                db.collection('users').document(user_id)\
                  .collection('credit_transactions').add(transaction_data)
                
                print(f"✅ Reset monthly credits for {user_id}: +{FREE_MONTHLY_CREDITS} credits")
                
                # Update data for return
                data["balance"] = new_balance
                data["total_earned"] = data.get("total_earned", 0) + FREE_MONTHLY_CREDITS
                data["last_reset"] = now
            
            # Check and apply December 2025 bonus
            if should_give_december_bonus(user_id):
                give_december_bonus(user_id)
                # Refetch updated balance
                doc = db.collection('users').document(user_id)\
                        .collection('credits').document('balance').get()
                data = doc.to_dict()
            
            return {
                "balance": data.get("balance", 0),
                "total_earned": data.get("total_earned", 0),
                "total_spent": data.get("total_spent", 0),
                "subscription_tier": data.get("subscription_tier", "free"),
                "last_reset": data.get("last_reset"),
            }
        else:
            # Initialize new user with free credits + December bonus
            initial_balance = FREE_MONTHLY_CREDITS
            bonus_given = False
            
            # Check if December 2025
            if now.year == 2025 and now.month == 12:
                initial_balance += DECEMBER_2025_BONUS
                bonus_given = True
            
            initial_credits = {
                "balance": initial_balance,
                "total_earned": initial_balance,
                "total_spent": 0,
                "subscription_tier": "free",
                "last_reset": now,
                "created_at": now,
            }
            db.collection('users').document(user_id)\
              .collection('credits').document('balance').set(initial_credits)
            
            # Record initial transaction
            transaction_data = {
                "type": CreditTransactionType.GRANT.value,
                "amount": FREE_MONTHLY_CREDITS,
                "description": "Welcome! Initial free credits",
                "balance_after": initial_balance,
                "timestamp": now,
            }
            db.collection('users').document(user_id)\
              .collection('credit_transactions').add(transaction_data)
            
            # Record December bonus if applicable
            if bonus_given:
                db.collection('users').document(user_id)\
                  .collection('credits').document('december_2025_bonus').set({
                      "given_at": now,
                      "amount": DECEMBER_2025_BONUS,
                  })
                
                bonus_transaction = {
                    "type": "DECEMBER_BONUS",
                    "amount": DECEMBER_2025_BONUS,
                    "description": "🎄 December 2025 Special Bonus!",
                    "balance_after": initial_balance,
                    "timestamp": now,
                }
                db.collection('users').document(user_id)\
                  .collection('credit_transactions').add(bonus_transaction)
                
                print(f"🎄 New user {user_id} received December bonus!")
            
            return initial_credits
    except Exception as e:
        print(f"Error getting user credits: {e}")
        return {
            "balance": 0,
            "total_earned": 0,
            "total_spent": 0,
            "subscription_tier": "free",
            "last_reset": None,
        }


def has_sufficient_credits(user_id: str, feature: FeatureType) -> bool:
    """
    Check if user has enough credits for a feature.
    """
    credits = get_user_credits(user_id)
    required = FEATURE_COSTS.get(feature, 0)
    return credits["balance"] >= required


def deduct_credits(
    user_id: str,
    feature: FeatureType,
    description: Optional[str] = None
) -> bool:
    """
    Deduct credits for feature usage.
    
    Returns:
        True if successful, False if insufficient credits
    """
    from app.firebase import resume_maker_app
    
    cost = FEATURE_COSTS.get(feature, 0)
    
    if not resume_maker_app:
        print(f"[DEV] Would deduct {cost} credits from {user_id} for {feature}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Check balance
        credits = get_user_credits(user_id)
        if credits["balance"] < cost:
            return False
        
        # Deduct credits
        new_balance = credits["balance"] - cost
        new_spent = credits["total_spent"] + cost
        
        balance_ref = db.collection('users').document(user_id)\
                       .collection('credits').document('balance')
        
        balance_ref.update({
            "balance": new_balance,
            "total_spent": new_spent,
            "updated_at": datetime.now(timezone.utc),
        })
        
        # Record transaction
        transaction_data = {
            "type": CreditTransactionType.USAGE.value,
            "amount": -cost,
            "feature": feature.value,
            "description": description or f"Used {feature.value}",
            "balance_after": new_balance,
            "timestamp": datetime.now(timezone.utc),
        }
        
        db.collection('users').document(user_id)\
          .collection('credit_transactions').add(transaction_data)
        
        print(f"✅ Deducted {cost} credits from {user_id}. New balance: {new_balance}")
        return True
        
    except Exception as e:
        print(f"Error deducting credits: {e}")
        return False


def get_credit_history(user_id: str, limit: int = 50) -> List[Dict]:
    """
    Get user's credit transaction history.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return []
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        docs = db.collection('users').document(user_id)\
                 .collection('credit_transactions')\
                 .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                 .limit(limit)\
                 .stream()
        
        transactions = []
        for doc in docs:
            data = doc.to_dict()
            transactions.append({
                "id": doc.id,
                "type": data.get("type"),
                "amount": data.get("amount"),
                "feature": data.get("feature"),
                "description": data.get("description"),
                "balance_after": data.get("balance_after"),
                "timestamp": data.get("timestamp"),
            })
        
        return transactions
        
    except Exception as e:
        print(f"Error getting credit history: {e}")
        return []


def add_credits(
    user_id: str,
    amount: int,
    transaction_type: CreditTransactionType = CreditTransactionType.GRANT,
    description: str = None
) -> bool:
    """
    Add credits to user's account (for purchases, grants, etc.).
    
    Returns:
        True if successful, False otherwise
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        print(f"[DEV] Would add {amount} credits to {user_id}")
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Get current balance
        credits = get_user_credits(user_id)
        new_balance = credits["balance"] + amount
        new_earned = credits["total_earned"] + amount
        
        # Update balance
        balance_ref = db.collection('users').document(user_id)\
                       .collection('credits').document('balance')
        
        balance_ref.update({
            "balance": new_balance,
            "total_earned": new_earned,
            "updated_at": datetime.now(timezone.utc),
        })
        
        # Record transaction
        transaction_data = {
            "type": transaction_type.value,
            "amount": amount,
            "description": description or f"Added {amount} credits",
            "balance_after": new_balance,
            "timestamp": datetime.now(timezone.utc),
        }
        
        db.collection('users').document(user_id)\
          .collection('credit_transactions').add(transaction_data)
        
        print(f"✅ Added {amount} credits to {user_id}. New balance: {new_balance}")
        return True
        
    except Exception as e:
        print(f"Error adding credits: {e}")
        return False


def check_and_reset_monthly_credits(user_id: str) -> bool:
    """
    Check if it's time for monthly credit reset and reset if needed.
    Only for free tier users.
    
    Note: This is now automatically handled in get_user_credits(),
    but kept for backwards compatibility.
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return False
    
    try:
        credits = get_user_credits(user_id)
        
        # Only reset for free tier
        if credits.get("subscription_tier") != "free":
            return False
        
        last_reset = credits.get("last_reset")
        if not last_reset:
            return False
        
        # Check if a new month has started
        now = datetime.now(timezone.utc)
        if hasattr(last_reset, 'timestamp'):
            last_reset = datetime.fromtimestamp(last_reset.timestamp(), tz=timezone.utc)
        
        # Compare year and month
        if (now.year > last_reset.year) or \
           (now.year == last_reset.year and now.month > last_reset.month):
            # Reset is handled in get_user_credits()
            return True
        
        return False
        
    except Exception as e:
        print(f"Error checking monthly credits: {e}")
        return False

