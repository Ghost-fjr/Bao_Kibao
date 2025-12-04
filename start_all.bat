@echo off
echo ========================================
echo Starting Bao Kibao Application
echo ========================================
echo.
echo This will start both backend and frontend servers
echo in separate windows.
echo.

cd /d "%~dp0"

REM Start backend server in new window
echo Starting backend server...
start "Bao Kibao Backend" cmd /k "cd backend && start_backend.bat"

REM Wait a moment before starting frontend
timeout /t 3 /nobreak >nul

REM Start frontend server in new window
echo Starting frontend server...
start "Bao Kibao Frontend" cmd /k "cd frontend && start_frontend.bat"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Close the server windows to stop the application.
echo.
pause
