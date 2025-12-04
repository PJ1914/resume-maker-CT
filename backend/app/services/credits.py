"""
Credit management service for Resume Maker
Handles credit balance, transactions, and feature access
Admins have unlimited credits
"""
from typing import Optional, Dict, List
from datetime import datetime, timezone
from enum import Enum
import logging

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

# Admin unlimited credits indicator
ADMIN_UNLIMITED_BALANCE = 999999


def is_admin_user(user_id: str, user_email: str = None) -> bool:
    """
    Check if a user is an admin (has unlimited credits).
    
    Args:
        user_id: User's Firebase UID
        user_email: Optional user email for additional check
        
    Returns:
        True if user is admin
    """
    from app.services.user_roles import is_user_admin
    
    # If we have email, use full check
    if user_email:
        return is_user_admin(user_email, user_id)
    
    # Otherwise check by user_id only in Firestore
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        return False
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Check if user is in admins collection
        admin_doc = db.collection('admins').document(user_id).get()
        
        if admin_doc.exists:
            data = admin_doc.to_dict()
            return data.get('is_admin', False) and data.get('active', True)
        
        return False
    except Exception as e:
        logging.exception("Error checking admin status for credits")
        return False


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
        logging.exception("Error checking December bonus")
        return False


def give_december_bonus(user_id: str) -> bool:
    """
    Give December 2025 special bonus (50 credits).
    """
    from app.firebase import resume_maker_app
    
    if not resume_maker_app:
        logging.info("[DEV] Would give December bonus to %s", user_id)
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        # Get current balance directly without calling get_user_credits to avoid recursion
        balance_doc = db.collection('users').document(user_id)\
                        .collection('credits').document('balance').get()
        
        if balance_doc.exists:
            current_data = balance_doc.to_dict()
            current_balance = current_data.get("balance", 0)
            current_earned = current_data.get("total_earned", 0)
        else:
            # User doesn't exist yet, use initial values
            current_balance = FREE_MONTHLY_CREDITS
            current_earned = FREE_MONTHLY_CREDITS
        
        new_balance = current_balance + DECEMBER_2025_BONUS
        new_earned = current_earned + DECEMBER_2025_BONUS
        
        # Update balance
        balance_ref = db.collection('users').document(user_id)\
                       .collection('credits').document('balance')
        
        if balance_doc.exists:
            balance_ref.update({
                "balance": new_balance,
                "total_earned": new_earned,
                "updated_at": datetime.now(timezone.utc),
            })
        else:
            balance_ref.set({
                "balance": new_balance,
                "total_earned": new_earned,
                "total_spent": 0,
                "subscription_tier": "free",
                "updated_at": datetime.now(timezone.utc),
                "created_at": datetime.now(timezone.utc),
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
        
        logging.info("🎄 Gave December bonus (%s credits) to %s", DECEMBER_2025_BONUS, user_id)
        return True
        
    except Exception as e:
        logging.warning("Error giving December bonus: %s", str(e))
        return False

def get_user_credits(user_id: str, user_email: str = None, _skip_bonus_check: bool = False) -> Dict:
    """
    Get user's current credit balance and info.
    Automatically handles monthly reset and December bonus.
    Admins get unlimited credits.
    
    Args:
        user_id: User's Firebase UID
        user_email: Optional email for admin check
        _skip_bonus_check: Internal flag to prevent circular recursion
    
    Returns:
        Dict with balance, tier, last_reset, etc.
    """
    from app.firebase import resume_maker_app
    
    # Check if user is admin - return unlimited credits
    if is_admin_user(user_id, user_email):
        return {
            "balance": ADMIN_UNLIMITED_BALANCE,
            "total_earned": ADMIN_UNLIMITED_BALANCE,
            "total_spent": 0,
            "subscription_tier": "admin",
            "is_admin": True,
            "last_reset": datetime.now(timezone.utc),
        }
    
    if not resume_maker_app:
        # Dev mode
        return {
            "balance": 100,
            "total_earned": 100,
            "total_spent": 0,
            "subscription_tier": "free",
            "is_admin": False,
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
                
                logging.info("Reset monthly credits for %s: +%s credits", user_id, FREE_MONTHLY_CREDITS)
                
                # Update data for return
                data["balance"] = new_balance
                data["total_earned"] = data.get("total_earned", 0) + FREE_MONTHLY_CREDITS
                data["last_reset"] = now
            
            # Check and apply December 2025 bonus (only if not already skipping to prevent recursion)
            if not _skip_bonus_check and should_give_december_bonus(user_id):
                try:
                    give_december_bonus(user_id)
                    # Refetch updated balance
                    doc = db.collection('users').document(user_id)\
                            .collection('credits').document('balance').get()
                    data = doc.to_dict()
                except Exception as e:
                    logging.warning("Failed to give December bonus: %s", str(e))
                    # Continue without bonus, don't crash
            
            return {
                "balance": data.get("balance", 0),
                "total_earned": data.get("total_earned", 0),
                "total_spent": data.get("total_spent", 0),
                "subscription_tier": data.get("subscription_tier", "free"),
                "is_admin": False,
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
                
                logging.info("New user %s received December bonus", user_id)
            
            initial_credits["is_admin"] = False
            return initial_credits
    except Exception as e:
        logging.exception("Error getting user credits")
        return {
            "balance": 0,
            "total_earned": 0,
            "total_spent": 0,
            "subscription_tier": "free",
            "is_admin": False,
            "last_reset": None,
        }


def has_sufficient_credits(user_id: str, feature: FeatureType, user_email: str = None) -> bool:
    """
    Check if user has enough credits for a feature.
    Admins always have sufficient credits.
    """
    # Admins have unlimited credits
    if is_admin_user(user_id, user_email):
        return True
    
    credits = get_user_credits(user_id)
    required = FEATURE_COSTS.get(feature, 0)
    return credits["balance"] >= required


def deduct_credits(
    user_id: str,
    feature: FeatureType,
    description: Optional[str] = None,
    user_email: str = None
) -> Dict:
    """
    Deduct credits for feature usage.
    Admins are not charged (unlimited credits).
    
    Returns:
        Dict with 'success' (bool), 'new_balance' (int), 'cost' (int)
        Returns {'success': False, 'new_balance': current_balance, 'cost': cost} if insufficient
    """
    from app.firebase import resume_maker_app
    
    cost = FEATURE_COSTS.get(feature, 0)
    
    # Admins have unlimited credits - don't deduct
    if is_admin_user(user_id, user_email):
        logging.info("Admin %s used %s - no credits deducted", user_id, feature.value)
        return {'success': True, 'new_balance': ADMIN_UNLIMITED_BALANCE, 'cost': 0}
    
    if not resume_maker_app:
        logging.info("[DEV] Would deduct %s credits from %s for %s", cost, user_id, feature)
        return {'success': True, 'new_balance': 100, 'cost': cost}
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)

        balance_ref = db.collection('users').document(user_id)\
                       .collection('credits').document('balance')

        @firestore.transactional
        def _tx_deduct(transaction, ref, amt, feature_val, desc):
            snapshot = ref.get(transaction=transaction)
            if not snapshot.exists:
                raise ValueError("Balance document does not exist")
            data = snapshot.to_dict()
            current_balance = data.get('balance', 0)
            if current_balance < amt:
                # Indicate insufficient funds
                raise ValueError("INSUFFICIENT_FUNDS")

            new_balance = current_balance - amt
            # Use transaction update
            transaction.update(ref, {
                'balance': new_balance,
                'total_spent': firestore.Increment(amt),
                'updated_at': datetime.now(timezone.utc),
            })

            # Create a new transaction doc with auto id
            txn_ref = db.collection('users').document(user_id)\
                       .collection('credit_transactions').document()
            transaction.set(txn_ref, {
                'type': CreditTransactionType.USAGE.value,
                'amount': -amt,
                'feature': feature_val,
                'description': desc or f"Used {feature_val}",
                'balance_after': new_balance,
                'timestamp': datetime.now(timezone.utc),
            })

            return new_balance

        try:
            transaction = db.transaction()
            new_balance = _tx_deduct(transaction, balance_ref, cost, feature.value, description)
            logging.info("Deducted %s credits from %s. New balance: %s", cost, user_id, new_balance)
            return {'success': True, 'new_balance': new_balance, 'cost': cost}
        except ValueError as ve:
            if str(ve) == "INSUFFICIENT_FUNDS":
                # Get current balance for response
                snapshot = balance_ref.get()
                current = snapshot.to_dict().get('balance', 0) if snapshot.exists else 0
                logging.warning("Insufficient credits for %s. Current: %s, Required: %s", user_id, current, cost)
                return {'success': False, 'new_balance': current, 'cost': cost}
            logging.exception("Error in credit deduction transaction")
            return {'success': False, 'new_balance': 0, 'cost': cost}

    except Exception as e:
        logging.exception("Error deducting credits")
        return {'success': False, 'new_balance': 0, 'cost': cost}


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
        logging.exception("Error getting credit history")
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
        logging.info("[DEV] Would add %s credits to %s", amount, user_id)
        return True
    
    try:
        from firebase_admin import firestore
        db = firestore.client(app=resume_maker_app)
        
        balance_ref = db.collection('users').document(user_id)\
                       .collection('credits').document('balance')

        @firestore.transactional
        def _tx_add(transaction, ref, amt, txn_type_val, desc):
            snapshot = ref.get(transaction=transaction)
            if not snapshot.exists:
                raise ValueError("Balance document does not exist")
            data = snapshot.to_dict()
            current_balance = data.get('balance', 0)
            new_balance = current_balance + amt
            transaction.update(ref, {
                'balance': new_balance,
                'total_earned': firestore.Increment(amt),
                'updated_at': datetime.now(timezone.utc),
            })

            txn_ref = db.collection('users').document(user_id)\
                       .collection('credit_transactions').document()
            transaction.set(txn_ref, {
                'type': txn_type_val,
                'amount': amt,
                'description': desc or f'Added {amt} credits',
                'balance_after': new_balance,
                'timestamp': datetime.now(timezone.utc),
            })

            return new_balance

        try:
            transaction = db.transaction()
            new_balance = _tx_add(transaction, balance_ref, amount, transaction_type.value, description)
            logging.info("Added %s credits to %s. New balance: %s", amount, user_id, new_balance)
            return True
        except ValueError:
            logging.exception("Error in credit add transaction")
            return False

    except Exception as e:
        logging.exception("Error adding credits")
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
        logging.exception("Error checking monthly credits")
        return False

