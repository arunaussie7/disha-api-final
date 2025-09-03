# 🎓 Attendancify - Smart School Attendance System

A comprehensive attendance management system with AI-powered face recognition for schools, built with React, TypeScript, and Python FastAPI.

## ✨ Features

### 🎯 Core Features
- **Smart Face Recognition**: AI-powered attendance marking with confidence thresholds
- **Dual Dashboard System**: Separate interfaces for teachers and students
- **Real-time Camera Integration**: Live webcam capture for attendance verification
- **Subject-wise Attendance**: Track attendance across multiple subjects
- **Attendance Analytics**: Visual charts and statistics for attendance trends
- **Responsive Design**: Modern UI built with TailwindCSS and Shadcn UI

### 👨‍🏫 Teacher Features
- **Student Management**: View and manage registered students
- **Attendance Taking**: Mark attendance with face verification
- **Statistics Dashboard**: Real-time attendance statistics and analytics
- **Subject-wise Reports**: Detailed attendance reports by subject
- **Present/Absent Lists**: Quick view of student attendance status

### 👨‍🎓 Student Features
- **Personal Dashboard**: View individual attendance records
- **Attendance Trends**: Visual charts showing attendance patterns
- **Subject-wise View**: Detailed breakdown by subject
- **Overall Statistics**: Comprehensive attendance summary

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Shadcn UI** for component library
- **React Router** for navigation
- **Recharts** for data visualization
- **React Webcam** for camera integration

### Backend
- **Python 3.9+**
- **FastAPI** for REST API
- **SQLAlchemy** for database ORM
- **SQLite** for data storage
- **JWT** for authentication
- **Pydantic** for data validation
- **Uvicorn** for ASGI server

### AI & Face Detection
- **Custom Image Comparison Algorithm**: Pixel-based similarity analysis
- **Confidence Thresholds**: Smart matching with 50-60% inconclusive range
- **Fallback System**: Robust error handling and backup logic

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/arunaussie7/disha.git
cd disha

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 5000
```

## 🎮 Usage

### For Teachers
1. **Login** with teacher credentials
2. **View Dashboard** with student statistics
3. **Take Attendance**:
   - Select a student
   - Choose subject
   - Upload reference photo
   - Capture live photo via webcam
   - Analyze faces with AI
   - Mark present/absent based on confidence

### For Students
1. **Sign Up** with student details
2. **Login** to access dashboard
3. **View Attendance**:
   - Check overall attendance percentage
   - View subject-wise attendance
   - Analyze attendance trends
   - Monitor daily attendance patterns

## 🔧 Configuration

### Environment Variables
Create `.env` files in both root and backend directories:

**Frontend (.env)**
```
VITE_COHERE_API_KEY=your_cohere_api_key_here
```

**Backend (backend/.env)**
```
DATABASE_URL=sqlite:///./student_credentials.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
COHERE_API_KEY=your_cohere_api_key_here
```

## 🎯 Face Detection Logic

The system uses a sophisticated face detection algorithm with the following confidence thresholds:

- **Below 50%**: ❌ Not Matched → Mark Absent
- **50-60%**: ⚠️ Inconclusive → Manual Decision
- **Above 60%**: ✅ Matched → Mark Present

## 📊 Database Schema

### Students Table
- `id`: Primary key
- `name`: Student name
- `class`: Class/grade
- `section`: Section
- `attendance`: JSON array of attendance records

### Attendance Records
- `date`: Attendance date
- `status`: 'present' or 'absent'
- `subject`: Subject name
- `photo1_path`: Reference photo path
- `photo2_path`: Captured photo path
- `face_matched`: Boolean match result
- `face_confidence`: Confidence percentage

## 🛠️ Development

### Project Structure
```
attendancify-school-main/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions
│   └── hooks/             # Custom React hooks
├── backend/               # Backend source code
│   ├── app/               # FastAPI application
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── utils/         # Utility functions
│   └── requirements.txt   # Python dependencies
├── public/                # Static assets
└── package.json          # Frontend dependencies
```

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
uvicorn app.main:app --reload    # Start development server
uvicorn app.main:app --host 0.0.0.0 --port 5000  # Production server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn UI** for the beautiful component library
- **TailwindCSS** for the utility-first CSS framework
- **FastAPI** for the high-performance web framework
- **React** team for the amazing frontend library

## 📞 Support

For support, email support@attendancify.com or create an issue in the repository.

---

**Built with ❤️ for modern education**