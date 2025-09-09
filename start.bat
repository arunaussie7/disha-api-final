@echo off
REM 🚀 Attendancify Startup Script for Windows
REM This script starts both frontend and backend servers

echo 🎓 Starting Attendancify - Smart School Attendance System
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9+ first.
    echo Download from: https://python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Setup backend virtual environment if needed
if not exist "backend\venv" (
    echo 🐍 Creating Python virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

REM Activate virtual environment and install dependencies
echo 🔧 Setting up backend environment...
cd backend
call venv\Scripts\activate.bat

REM Install Python dependencies if needed
if not exist "venv\Scripts\python.exe" (
    echo 📦 Installing backend dependencies...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Creating default .env file...
    (
        echo DATABASE_URL=sqlite:///./student_credentials.db
        echo SECRET_KEY=your_secret_key_here_change_this_in_production
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo GOOGLE_API_KEY=your_google_api_key_here
        echo COHERE_API_KEY=your_cohere_api_key_here
    ) > .env
    echo 📝 Please update backend\.env with your API keys
)

REM Start backend server in background
echo 🚀 Starting backend server on port 8000...
start /B uvicorn app.main:app --reload --port 8000

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Go back to root directory
cd ..

REM Start frontend server
echo 🚀 Starting frontend server on port 3000...
echo ==================================================
echo ✅ Backend: http://localhost:8000
echo ✅ Frontend: http://localhost:3000
echo ==================================================
echo 🎓 Attendancify is now running!
echo Press Ctrl+C to stop both servers
echo ==================================================

REM Start frontend (this will block)
npm run dev

echo.
echo 🛑 Stopping servers...
echo ✅ Servers stopped
pause
