@echo off
title Resume Maker - Development Server
mode con: cols=70 lines=35
color 0A

cls
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║     ██████╗ ███████╗███████╗██╗   ██╗███╗   ███╗███████╗    ║
echo  ║     ██╔══██╗██╔════╝██╔════╝██║   ██║████╗ ████║██╔════╝    ║
echo  ║     ██████╔╝█████╗  ███████╗██║   ██║██╔████╔██║█████╗      ║
echo  ║     ██╔══██╗██╔══╝  ╚════██║██║   ██║██║╚██╔╝██║██╔══╝      ║
echo  ║     ██║  ██║███████╗███████║╚██████╔╝██║ ╚═╝ ██║███████╗    ║
echo  ║     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝    ║
echo  ║                     M A K E R                                ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo              [Development Environment Launcher]
echo.
echo  ════════════════════════════════════════════════════════════════
echo.

echo   [1/2] Starting Backend Server (FastAPI)...
echo         Port: 8000  ^|  Status: Initializing...
start "Resume Maker - Backend" cmd /k "cd /d d:\client_projects\resume-maker-CT\backend && color 0E && echo. && echo  ========================================= && echo       BACKEND SERVER - FastAPI && echo  ========================================= && echo. && echo  Starting uvicorn with hot-reload... && echo. && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to start
echo.
echo         Waiting for backend to initialize...
timeout /t 4 /nobreak > nul
echo         Status: RUNNING!
echo.

echo   [2/2] Starting Frontend Server (Vite)...
echo         Port: 5173  ^|  Status: Initializing...
start "Resume Maker - Frontend" cmd /k "cd /d d:\client_projects\resume-maker-CT\frontend && color 0B && echo. && echo  ========================================= && echo       FRONTEND SERVER - Vite && echo  ========================================= && echo. && npm run dev"

:: Wait a moment
timeout /t 2 /nobreak > nul
echo         Status: RUNNING!
echo.
echo  ════════════════════════════════════════════════════════════════
echo.

color 0A
echo   ╔═════════════════════════════════════════════════════════════╗
echo   ║                  SERVERS ARE RUNNING!                       ║
echo   ╠═════════════════════════════════════════════════════════════╣
echo   ║                                                             ║
echo   ║   Frontend:  http://localhost:5173                          ║
echo   ║   Backend:   http://localhost:8000                          ║
echo   ║   API Docs:  http://localhost:8000/docs                     ║
echo   ║                                                             ║
echo   ╠═════════════════════════════════════════════════════════════╣
echo   ║                                                             ║
echo   ║   TIP: Close this window to keep servers running.           ║
echo   ║        Close individual server windows to stop them.        ║
echo   ║                                                             ║
echo   ╚═════════════════════════════════════════════════════════════╝
echo.
echo   Press any key to close this launcher...
pause > nul
