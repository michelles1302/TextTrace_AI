@echo off
setlocal enabledelayedexpansion

title TEXTTRACE AI - Launching Application
echo ========================================================
echo                 TEXTTRACE AI
echo    Plagiarism and Paraphrase Analyzer Setup and Startup
echo ========================================================
echo.

rem 1. Check or create Python virtual environment
if not exist ".venv" (
    echo [1/4] Creating Python virtual environment .venv...
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Failed to create Python virtual environment. Ensure Python 3.10+ is installed.
        pause
        exit /b 1
    )
) else (
    echo [1/4] Python virtual environment .venv already exists.
)

rem 2. Activate virtual environment and install backend requirements
echo [2/4] Installing or verifying Python backend dependencies...
call ".venv\Scripts\activate.bat"
pip install -r "backend\requirements.txt"
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)

rem 3. Install frontend dependencies
echo [3/4] Installing or verifying React frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install npm packages.
    cd /d "%~dp0"
    pause
    exit /b 1
)
cd /d "%~dp0"

rem 4. Launch Backend and Frontend concurrently
echo [4/4] Starting TextTrace AI Backend FastAPI and Frontend Vite...
echo.
echo FastAPI Backend URL: http://localhost:8000
echo React Frontend URL:  http://localhost:5173
echo.
echo Press Ctrl+C in server windows to stop servers.
echo ========================================================
echo.

start "TextTrace AI Backend" cmd /k ".venv\Scripts\activate.bat && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
start "TextTrace AI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Application processes started in background windows.
echo Opening browser to http://localhost:5173 ...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173
