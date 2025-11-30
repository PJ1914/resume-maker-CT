# Deployment Guide

## Backend (Render)

### Option 1: Docker (Recommended for PDF Export)
Since the application requires `pdflatex` for PDF generation, using Docker is the best way to ensure all dependencies are installed.

1. **Create New Web Service** on Render.
2. Connect your GitHub repository.
3. Select **Docker** as the Runtime.
4. Configure the following:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile` (since we set Root Directory to `backend`, it looks for `backend/Dockerfile`)
   - **Environment Variables**:
     - `CORS_ORIGINS`: `https://your-frontend-domain.com`
     - `ENVIRONMENT`: `production`
     - `GEMINI_API_KEY`: Your API key
     - `CODETAPASYA_SERVICE_ACCOUNT_PATH`: `/etc/secrets/codetapasya-service-account.json`
     - `RESUME_MAKER_SERVICE_ACCOUNT_PATH`: `/etc/secrets/resume-maker-service-account.json`
5. **Secret Files**:
   - Upload your service account JSON files to `/etc/secrets/...` as defined in env vars.

### Option 2: Native Python (No PDF Export)
If you use the standard Python runtime, PDF export will **FAIL** because `pdflatex` is not installed.

## Frontend (Vercel)

1. **Import Project** in Vercel.
2. Select `frontend` as the root directory.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com`
   - `VITE_FIREBASE_...`: Your Firebase config vars.

## Troubleshooting

### PDF Export Fails
- Ensure you are using the **Docker** runtime on Render.
- Check logs for "pdflatex not found" errors.
- Ensure you have credits (if enabled).

### CORS Errors
- Check `CORS_ORIGINS` on Render matches your Vercel domain.
- Ensure `VITE_API_URL` on Vercel has no trailing slash (though the code handles it).
