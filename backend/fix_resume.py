"""
Quick script to reset a resume status and trigger reparsing
"""
import sys
sys.path.insert(0, 'e:\\my projects\\resume-maker-CT\\backend')

from app.services.firestore import update_resume_status
from app.schemas.resume import ResumeStatus
from app.services.tasks import process_resume_parsing

# Resume ID from the logs
resume_id = "58639e0c-5de7-4fb5-b5be-4193a62243c2"
user_id = "harqygBlqod8QehlGVw31Xdr8mj2"
storage_path = "resumes/harqygBlqod8QehlGVw31Xdr8mj2/58639e0c-5de7-4fb5-b5be-4193a62243c2/Pranay-Jumbarthi-Resume.pdf"

print(f"Resetting resume {resume_id} to UPLOADED status...")
update_resume_status(resume_id, user_id, ResumeStatus.UPLOADED)

print("Triggering parsing...")
process_resume_parsing(
    resume_id=resume_id,
    uid=user_id,
    storage_path=storage_path,
    content_type="application/pdf"
)

print("Done! Check the backend logs for progress.")
