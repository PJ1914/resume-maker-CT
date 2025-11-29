# Resume Maker + ATS Score Checker

A secure, scalable SaaS resume builder and ATS-checker that uses CodeTapasya Firebase Auth (shared), stores files in a separate Firebase project, uses Gemini for scoring and suggestions, and generates production-quality PDFs from LaTeX templates.

**Live URL:** [resume-maker.codetapasya.com](https://resume-maker.codetapasya.com)

## 🏗️ Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Authentication:** Firebase Auth (CodeTapasya project - shared)
- **Database:** Firestore (resume-maker project)
- **Storage:** Firebase Storage (resume-maker project)
- **LLM:** Google Gemini API
- **PDF Generation:** LaTeX (tectonic)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.11+
- Firebase projects (CodeTapasya for Auth, resume-maker for Storage/Firestore)
- Gemini API key

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload
```

## 📁 Project Structure

```
resume-maker/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── context/         # React contexts (Auth)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API client, Firebase
│   │   └── utils/           # Helper functions
│   ├── public/
│   └── package.json
├── backend/                  # FastAPI app
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── auth/            # Token verification
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Gemini, LaTeX, parsing
│   │   ├── models/          # Pydantic schemas
│   │   └── templates/       # LaTeX templates
│   ├── requirements.txt
│   └── Dockerfile
├── firebase/                 # Firebase configs
│   ├── firestore.rules
│   ├── storage.rules
│   └── firebase.json
└── docker-compose.yml        # Local development
```

## 🔐 Firebase Setup

### 1. CodeTapasya Firebase Project (Auth)

- Used for: **Authentication only**
- Get Web config from Firebase Console → Project Settings
- Download service account JSON for backend verification

### 2. Resume-Maker Firebase Project (Data)

- Used for: **Firestore + Storage**
- Enable Firestore Database
- Enable Firebase Storage
- Download service account JSON
- Deploy security rules

## 🌟 Features

- ✅ Single Sign-On with CodeTapasya accounts
- ✅ Drag-and-drop resume upload (PDF, DOCX)
- ✅ AI-powered ATS scoring with Gemini
- ✅ Real-time keyword matching
- ✅ Smart suggestions and rewrites
- ✅ 4 professional LaTeX templates
- ✅ Production-quality PDF exports
- ✅ Secure file storage with Firebase
- ✅ Cost-controlled LLM usage

## 📊 Development Phases

- [x] **Phase 0:** Project setup, Firebase configuration
- [x] **Phase 1:** Frontend scaffold, Auth integration
- [ ] **Phase 2:** Upload flow and storage
- [ ] **Phase 3:** Resume parsing and basic scoring
- [ ] **Phase 4:** Gemini integration
- [ ] **Phase 5:** LaTeX templates and PDF generation
- [ ] **Phase 6:** UI polish and enhancements
- [ ] **Phase 7:** Security hardening and QA
- [ ] **Phase 8:** Production deployment
- [ ] **Phase 9:** Analytics and optimization

## 🔒 Security

- All Firebase tokens verified server-side
- Strict Firestore and Storage security rules
- Rate limiting on expensive endpoints
- Per-user Gemini usage quotas
- Secrets managed via Secret Manager
- LaTeX sanitization to prevent injection

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a private project. For questions, contact the CodeTapasya team.

---

**Built with ❤️ by CodeTapasya**
