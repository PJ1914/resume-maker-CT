import json
import logging
import google.generativeai as genai
from datetime import datetime, timezone
from app.config import settings
from app.services.firestore import get_merged_resume_data
from app.schemas.interview import InterviewSession, QAPair

logger = logging.getLogger(__name__)

# Configure Gemini
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    logger.error(f"Failed to configure Gemini: {e}")

class InterviewService:
    @staticmethod
    async def generate_session(user_id: str, resume_id: str, role: str, exp_level: str, q_types: list) -> InterviewSession:
        """
        Generate an interview Q&A session using Gemini AI.
        """
        # 1. Fetch Resume Data
        resume_data = get_merged_resume_data(resume_id, user_id)
        if not resume_data:
            raise ValueError("Resume not found")
        
        # Prepare resume JSON string (prune if too large, but typically resume JSON is small enough)
        # We might want to remove strict PII if needed, but for interview prep it might be useful.
        resume_json = json.dumps(resume_data, default=str)
        if len(resume_json) > 50000:
             resume_json = resume_json[:50000] + "...(truncated)"
        
        # 2. Build Prompt
        prompt = f"""
You are an AI Interview Coach.

Use the following resume data to generate role-specific and personalized interview Q&A:

Resume:
{resume_json}

User Role: {role}
Experience Level: {exp_level}

Generate:
"""
        include_tech = "technical" in q_types or "both" in q_types
        include_hr = "hr" in q_types or "both" in q_types

        if include_tech:
            prompt += "1. 10 Technical Questions with answers.\n"
        if include_hr:
            prompt += "2. 10 HR Questions with answers.\n"

        prompt += """
Answers must use:
- User’s projects
- User’s skills
- User’s experience

Respond in JSON ONLY with this structure:
{
 "technical": [
   {"q": "...", "a": "..."}
 ],
 "hr": [
   {"q": "...", "a": "..."}
 ]
}
"""

        # 3. Call Gemini
        # Using the configured model from settings, or fallback to 1.5-flash if appropriate
        model_name = settings.GEMINI_MODEL if hasattr(settings, 'GEMINI_MODEL') else "gemini-1.5-flash"
        model = genai.GenerativeModel(model_name)
        
        logger.info(f"Generating interview Q&A for user {user_id}, role {role}")
        
        try:
            response = model.generate_content(
                prompt, 
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.7
                )
            )
            text = response.text
            # Parse JSON
            data = json.loads(text)
        except Exception as e:
            logger.error(f"Gemini Generation Error: {e}")
            raise RuntimeError(f"AI Generation failed: {str(e)}")

        # 4. Construct Session Object
        technical_qs = [QAPair(**q) for q in data.get("technical", [])] if include_tech else []
        hr_qs = [QAPair(**q) for q in data.get("hr", [])] if include_hr else []
        
        session = InterviewSession(
            user_id=user_id,
            resume_id=resume_id,
            role=role,
            experience_level=exp_level,
            technical_questions=technical_qs,
            hr_questions=hr_qs,
            created_at=datetime.now(timezone.utc),
            credits_used=3
        )
        
        return session

    @staticmethod
    def save_session(session: InterviewSession) -> str:
        """
        Save the interview session to Firestore and return the new Session ID.
        """
        from app.firebase import resume_maker_app
        from firebase_admin import firestore
        
        if not resume_maker_app:
            return f"mock-session-{int(datetime.now().timestamp())}"

        try:
            db = firestore.client(app=resume_maker_app)
            # Store in users/{userId}/interviewPrep/{sessionId}
            doc_ref = db.collection('users').document(session.user_id)\
                        .collection('interviewPrep').document()
            
            data = session.model_dump()
            # Ensure session ID is set in the returned object if you want, but typically it is the doc ID
            # We can update the model with the ID if we want to store it inside too
            data['id'] = doc_ref.id
            session.id = doc_ref.id
            
            doc_ref.set(data)
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error saving interview session: {e}")
            raise e

    @staticmethod
    def get_session(user_id: str, session_id: str) -> dict:
        """
        Retrieve a specific interview session.
        """
        from app.firebase import resume_maker_app
        from firebase_admin import firestore
        
        if not resume_maker_app:
            return None

        try:
            db = firestore.client(app=resume_maker_app)
            doc = db.collection('users').document(user_id)\
                    .collection('interviewPrep').document(session_id).get()
            
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error fetching session: {e}")
            return None

    @staticmethod
    def get_user_sessions(user_id: str) -> list:
        """
        Retrieve all interview sessions for a user, ordered by creation date descending.
        """
        from app.firebase import resume_maker_app
        from firebase_admin import firestore
        
        if not resume_maker_app:
            return []

        try:
            db = firestore.client(app=resume_maker_app)
            docs = db.collection('users').document(user_id)\
                    .collection('interviewPrep')\
                    .order_by('created_at', direction=firestore.Query.DESCENDING)\
                    .stream()
            
            sessions = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                sessions.append(data)
            
            return sessions
        except Exception as e:
            logger.error(f"Error fetching user sessions: {e}")
            return []
