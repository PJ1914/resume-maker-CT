import sys
import os
import asyncio

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.gemini_scorer import HybridScorer

async def test():
    print("Initializing HybridScorer...")
    try:
        scorer = HybridScorer()
        print("HybridScorer initialized.")
    except Exception as e:
        print(f"Failed to init HybridScorer: {e}")
        import traceback
        traceback.print_exc()
        return

    parsed_data = {
        'parsed_text': "Sample resume text. Experienced Python Developer.",
        'sections': {'experience': 'Worked at Google', 'education': 'BS CS', 'skills': 'Python, Java'},
        'contact_info': {'name': 'John Doe'},
        'skills': ['Python', 'Java'],
        'layout_type': 'single_column'
    }

    print("Scoring resume...")
    try:
        result = scorer.score_resume(parsed_data, prefer_gemini=False) # Force local first to test it
        print("Local Score Result:", result.get('total_score'))
        
        # Try Gemini if key exists (optional)
        # result = scorer.score_resume(parsed_data, prefer_gemini=True)
        # print("Gemini Score Result:", result.get('total_score'))
        
    except Exception as e:
        print(f"Scoring failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
