@echo off
echo ========================================
echo    Resume Maker - Starting Servers
echo ========================================
echo.

:: Start Backend Server in a new window
echo Starting Backend Server (FastAPI)...
start "Backend - FastAPI" cmd /k "cd /d d:\client_projects\resume-maker-CT\backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend Server in a new window
echo Starting Frontend Server (Vite)...
start "Frontend - Vite" cmd /k "cd /d d:\client_projects\resume-maker-CT\frontend && npm run dev"

echo.
echo ========================================
echo    Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Close this window or press any key to exit.
pause > nul
