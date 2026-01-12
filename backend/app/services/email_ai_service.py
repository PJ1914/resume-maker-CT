"""
Email AI Service - Production-Ready
AI-powered template variable extraction and auto-filling using Gemini.
"""

import google.generativeai as genai
import re
import json
from typing import Dict, List, Optional
from datetime import datetime
from firebase_admin import firestore
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class EmailAIService:
    """
    AI service for intelligent email template processing.
    Uses Gemini to auto-fill template variables based on context.
    """
    
    @staticmethod
    def extract_template_variables(html_template: str) -> List[str]:
        """
        Extract all {{variable}} placeholders from HTML template.
        
        Args:
            html_template: HTML template string
            
        Returns:
            List of variable names found in template
        """
        pattern = r'\{\{(\w+)\}\}'
        variables = re.findall(pattern, html_template)
        return list(set(variables))  # Remove duplicates
    
    @staticmethod
    async def auto_fill_template(
        template_type: str,
        variables: List[str],
        context: Dict,
        user_data: Optional[Dict] = None
    ) -> Dict[str, str]:
        """
        Use AI to intelligently fill template variables based on context.
        
        Args:
            template_type: "billing", "welcome", "support", etc.
            variables: List of template variables to fill
            context: Event context (payment data, resume data, etc.)
            user_data: Optional user profile data
            
        Returns:
            Dict mapping variable names to filled values
        """
        
        # Build AI prompt
        prompt = f"""
You are an intelligent email template filler for a professional SaaS application.

Template Type: {template_type}
Variables to Fill: {', '.join(variables)}

Context Data:
{json.dumps(context, indent=2)}

{f"User Profile: {json.dumps(user_data, indent=2)}" if user_data else ""}

Instructions:
1. Generate professional, accurate values for each variable
2. For invoice_number: Use format "INV-YYYY-NNNNN"
3. For date: Use format "Month DD, YYYY" (e.g., "January 11, 2026")
4. For amounts: Format with 2 decimals (e.g., "500.00")
5. For product descriptions: Be clear and professional
6. Use context data when available, generate reasonable values when not
7. Return ONLY valid JSON, no markdown formatting

Required Output Format:
{{
  "variable_name": "value",
  ...
}}
"""
        
        try:
            # Call Gemini API
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            # Parse JSON
            filled_data = json.loads(response_text)
            
            logger.info(f"✅ AI auto-filled {len(filled_data)} variables for {template_type}")
            return filled_data
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ AI response parsing failed: {e}")
            logger.error(f"Raw response: {response.text}")
            # Return empty dict on error
            return {}
        except Exception as e:
            logger.error(f"❌ AI auto-fill error: {str(e)}")
            return {}
    
    @staticmethod
    async def generate_invoice_number() -> str:
        """
        Generate sequential invoice number from Firestore counter.
        Format: INV-2026-00123
        
        Returns:
            Formatted invoice number string
        """
        try:
            db = firestore.client()
            counter_ref = db.collection('email_metadata').document('invoice_counter')
            
            # Use transaction for atomic increment
            @firestore.transactional
            def increment_counter(transaction, ref):
                snapshot = ref.get(transaction=transaction)
                if snapshot.exists:
                    current = snapshot.get('counter')
                else:
                    current = 0
                
                new_counter = current + 1
                transaction.set(ref, {
                    'counter': new_counter,
                    'updated_at': datetime.utcnow()
                })
                return new_counter
            
            transaction = db.transaction()
            counter = increment_counter(transaction, counter_ref)
            
            # Format: INV-YYYY-NNNNN
            year = datetime.now().year
            invoice_num = f"INV-{year}-{counter:05d}"
            
            logger.info(f"Generated invoice number: {invoice_num}")
            return invoice_num
            
        except Exception as e:
            logger.error(f"❌ Invoice number generation failed: {str(e)}")
            # Fallback to timestamp-based
            timestamp = int(datetime.now().timestamp())
            return f"INV-{datetime.now().year}-{timestamp}"
    
    @staticmethod
    async def smart_fill_billing_receipt(
        user_id: str,
        payment_id: str,
        amount: float,
        credits: int,
        currency: str = "INR"
    ) -> Dict[str, str]:
        """
        Auto-fill billing receipt template with payment data.
        
        Args:
            user_id: Firebase user ID
            payment_id: Razorpay payment ID
            amount: Payment amount
            credits: Credits purchased
            currency: Currency code
            
        Returns:
            Dict with all template variables filled
        """
        try:
            # Fetch user data
            db = firestore.client()
            user_doc = db.collection('users').document(user_id).get()
            
            if not user_doc.exists:
                logger.error(f"User not found: {user_id}")
                return {}
            
            user_data = user_doc.to_dict()
            
            # Generate invoice number
            invoice_number = await EmailAIService.generate_invoice_number()
            
            # Currency symbol
            currency_symbol = "₹" if currency == "INR" else "$"
            
            # Build filled data
            filled_data = {
                "invoice_number": invoice_number,
                "date": datetime.now().strftime("%B %d, %Y"),
                "name": user_data.get('displayName', 'Valued Customer'),
                "user_email": user_data.get('email', ''),
                "product_description": f"{credits} Credits Purchase",
                "currency_symbol": currency_symbol,
                "amount": f"{amount:.2f}",
                "gstin_number": "29ABCDE1234F1Z5",  # Your company GSTIN
                "transaction_id": payment_id
            }
            
            logger.info(f"✅ Billing receipt auto-filled for user {user_id}")
            return filled_data
            
        except Exception as e:
            logger.error(f"❌ Billing receipt auto-fill failed: {str(e)}")
            return {}
    
    @staticmethod
    async def personalize_bulk_email(
        template_type: str,
        template_variables: List[str],
        user_ids: List[str],
        base_context: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Generate personalized metadata for bulk email sending.
        Each user gets AI-personalized content.
        
        Args:
            template_type: Type of email template
            template_variables: Variables to fill
            user_ids: List of user IDs to send to
            base_context: Shared context for all emails
            
        Returns:
            List of {email: str, metadata: dict} for bulk API
        """
        db = firestore.client()
        recipients = []
        
        for user_id in user_ids:
            try:
                # Fetch user data
                user_doc = db.collection('users').document(user_id).get()
                if not user_doc.exists:
                    continue
                
                user_data = user_doc.to_dict()
                
                # Merge base context with user data
                context = {
                    **(base_context or {}),
                    "user": user_data
                }
                
                # AI personalize for this user
                metadata = await EmailAIService.auto_fill_template(
                    template_type=template_type,
                    variables=template_variables,
                    context=context,
                    user_data=user_data
                )
                
                # Add to recipients list
                recipients.append({
                    "email": user_data.get('email'),
                    "metadata": metadata
                })
                
            except Exception as e:
                logger.error(f"Failed to personalize for user {user_id}: {e}")
                continue
        
        logger.info(f"✅ Personalized bulk email for {len(recipients)} users")
        return recipients
