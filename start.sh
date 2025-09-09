#!/bin/bash

# 🚀 Attendancify Startup Script
# This script starts both frontend and backend servers

echo "🎓 Starting Attendancify - Smart School Attendance System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.9+ first."
    echo "Download from: https://python.org/downloads/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Setup backend virtual environment if needed
if [ ! -d "backend/venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "🔧 Setting up backend environment..."
cd backend
source venv/bin/activate

# Install Python dependencies if needed
if [ ! -f "venv/pyvenv.cfg" ] || [ ! -d "venv/lib" ]; then
    echo "📦 Installing backend dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating default .env file..."
    cat > .env << EOF
DATABASE_URL=sqlite:///./student_credentials.db
SECRET_KEY=your_secret_key_here_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_API_KEY=your_google_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
EOF
    echo "📝 Please update backend/.env with your API keys"
fi

# Start backend server in background
echo "🚀 Starting backend server on port 8000..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Go back to root directory
cd ..

# Start frontend server
echo "🚀 Starting frontend server on port 3000..."
echo "=================================================="
echo "✅ Backend: http://localhost:8000"
echo "✅ Frontend: http://localhost:3000"
echo "=================================================="
echo "🎓 Attendancify is now running!"
echo "Press Ctrl+C to stop both servers"
echo "=================================================="

# Start frontend (this will block)
npm run dev

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM
