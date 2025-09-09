# 🚀 Complete Setup Guide for Attendancify

This guide ensures your Attendancify project works perfectly on **any PC** (Windows, macOS, Linux).

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.9+** - [Download here](https://python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)
- **Webcam** - For face recognition features

### Verify Installation
```bash
# Check versions
node --version    # Should be 18+
python --version  # Should be 3.9+
git --version     # Any recent version
```

## 🎯 Quick Start (5 Minutes)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/arunaussie7/disha.git
cd disha

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### 2. Environment Setup
Create these files with your API keys:

**Frontend (.env)**
```env
VITE_COHERE_API_KEY=your_cohere_api_key_here
```

**Backend (backend/.env)**
```env
DATABASE_URL=sqlite:///./student_credentials.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_API_KEY=your_google_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
```

### 3. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd ..  # Back to root directory
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 🔧 Detailed Setup

### Frontend Setup
```bash
# Navigate to project root
cd attendancify-school-main

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8000
```

## 🎮 Testing the System

### 1. Teacher Login
- Go to http://localhost:3000
- Click "Teacher Login"
- Username: `teacher`
- Password: `password`

### 2. Student Registration
- Click "Student Signup"
- Fill in student details
- Register a new student

### 3. Test Face Recognition
- Login as teacher
- Click "Take Attendance"
- Select a student
- Upload reference photo
- Use live camera to capture photo
- Click "Analyze" to see AI results

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
# Kill processes on ports 3000 and 8000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

#### 2. Python Virtual Environment Issues
```bash
# Delete and recreate virtual environment
rm -rf venv  # or rmdir /s venv on Windows
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

#### 3. Node Modules Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules  # or rmdir /s node_modules on Windows
rm package-lock.json
npm install
```

#### 4. Database Issues
```bash
# Delete database and restart
rm student_credentials.db  # or del student_credentials.db on Windows
# Restart backend server
```

#### 5. API Key Issues
- Ensure `.env` files are in correct locations
- Check API keys are valid and active
- Restart both servers after adding API keys

## 🔑 API Keys Setup

### Google Generative AI (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Generative Language API"
4. Create API credentials
5. Add key to `backend/.env`:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

### Cohere AI (Optional)
1. Go to [Cohere Console](https://dashboard.cohere.ai/)
2. Create account and get API key
3. Add to both `.env` files:
   ```
   VITE_COHERE_API_KEY=your_cohere_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   ```

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 4GB
- **Storage**: 2GB free space
- **CPU**: Dual-core 2GHz
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### Recommended Requirements
- **RAM**: 8GB+
- **Storage**: 5GB+ free space
- **CPU**: Quad-core 3GHz+
- **Webcam**: 720p or higher
- **Internet**: For AI API features

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting service
```

### Backend (Railway/Heroku)
```bash
# Add Procfile
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy to your hosting service
```

## 📞 Support

If you encounter any issues:

1. **Check this guide** for common solutions
2. **Verify prerequisites** are installed correctly
3. **Check API keys** are valid and active
4. **Restart both servers** after any changes
5. **Create an issue** in the GitHub repository

## ✅ Verification Checklist

Before reporting issues, ensure:
- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Virtual environment activated
- [ ] All dependencies installed
- [ ] API keys configured
- [ ] Both servers running
- [ ] Webcam working
- [ ] No port conflicts

---

**Your Attendancify system will work perfectly on any PC following this guide!** 🎓✨
