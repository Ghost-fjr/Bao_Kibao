@echo off
echo ========================================
echo Starting Bao Kibao Backend Server
echo ========================================
echo.

cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please create a virtual environment first:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if migrations are needed
echo.
echo Checking for pending migrations...
python manage.py makemigrations --check --dry-run >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: There are pending migrations!
    echo Running migrations...
    python manage.py makemigrations
    python manage.py migrate
) else (
    echo No pending migrations found.
)

REM Start the development server
echo.
echo ========================================
echo Starting Django development server...
echo Server will be available at: http://localhost:8000
echo Admin interface: http://localhost:8000/admin
echo API endpoints: http://localhost:8000/api
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver
