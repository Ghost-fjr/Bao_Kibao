@echo off
echo ========================================
echo Starting Bao Kibao Frontend Server
echo ========================================
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    echo This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start the development server
echo.
echo ========================================
echo Starting Vite development server...
echo Server will be available at: http://localhost:5173
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
