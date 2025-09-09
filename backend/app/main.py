from datetime import timedelta
from typing import Annotated, List
from fastapi import Depends, FastAPI, HTTPException, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from datetime import datetime

from .database.database import engine, get_db
from . import models
from .models.student import Student
from .models.attendance import Attendance
# from .models.assignment import Assignment  # Not used in current system
# from .schemas import assignment as assignment_schemas  # Not used in current system
from .schemas import student as student_schemas
from .schemas import attendance as attendance_schemas
from .utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .utils.deepface_recognition import deepface_recognizer
from .utils.google_face_recognition import google_face_recognizer
from .utils.simple_face_recognition import simple_face_recognizer

# Create database tables
models.student.Base.metadata.create_all(bind=engine)
models.attendance.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8082", "http://172.20.10.2:8082"],  # Updated frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get current user
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> Student:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user = db.query(Student).filter(Student.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=student_schemas.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = db.query(Student).filter(Student.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/attendance/", response_model=attendance_schemas.Attendance)
async def create_attendance(
    student_id: int = Form(...),
    subject: str = Form(...),
    status: str = Form(...),
    photo1: UploadFile = File(...),
    photo2: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Read photo contents
    photo1_contents = await photo1.read()
    photo2_contents = await photo2.read()
    
    # Convert to base64 for DeepFace
    import base64
    photo1_base64 = base64.b64encode(photo1_contents).decode('utf-8')
    photo2_base64 = base64.b64encode(photo2_contents).decode('utf-8')
    
    # Use DeepFace for face verification
    result = deepface_recognizer.verify_faces(photo1_base64, photo2_base64)
    
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result.get("message", "Face verification failed")
        )

    # Save photos
    os.makedirs("uploads", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save with original filenames
    photo1_path = f"uploads/{photo1.filename}"
    photo2_path = f"uploads/{photo2.filename}"
    
    with open(photo1_path, "wb") as f:
        f.write(photo1_contents)
    with open(photo2_path, "wb") as f:
        f.write(photo2_contents)

    # Create attendance record
    db_attendance = Attendance(
        student_id=student_id,
        subject=subject,
        status=status,
        photo1_path=photo1_path,
        photo2_path=photo2_path,
        face_matched=result["is_verified"],
        face_confidence=result["similarity_percentage"]
    )
    
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@app.post("/face-verify/")
async def verify_faces(
    reference_image: str = Form(...),  # Base64 encoded reference image
    live_image: str = Form(...),       # Base64 encoded live image
    student_id: int = Form(...)
):
    """
    Verify faces using DeepFace with ArcFace model, with Google AI fallback
    """
    try:
        # Try DeepFace first
        try:
            result = deepface_recognizer.verify_faces(reference_image, live_image)
            if result["success"]:
                return {
                    "success": result["success"],
                    "match_status": result.get("match_status", "ERROR"),
                    "is_verified": result.get("is_verified", False),
                    "similarity_percentage": result.get("similarity_percentage", 0),
                    "confidence_level": result.get("confidence_level", "LOW"),
                    "color": result.get("color", "red"),
                    "message": result.get("message", "Face verification completed"),
                    "model_used": result.get("model_used", "ArcFace"),
                    "detector_used": result.get("detector_used", "RetinaFace"),
                    "student_id": student_id
                }
        except Exception as deepface_error:
            print(f"DeepFace error: {deepface_error}")
        
        # Fallback to Google AI
        try:
            result = google_face_recognizer.verify_faces(reference_image, live_image)
            if result["success"]:
                return {
                    "success": result["success"],
                    "match_status": result.get("match_status", "ERROR"),
                    "is_verified": result.get("is_verified", False),
                    "similarity_percentage": result.get("similarity_percentage", 0),
                    "confidence_level": result.get("confidence_level", "LOW"),
                    "color": result.get("color", "red"),
                    "message": result.get("message", "Face verification completed"),
                    "model_used": result.get("model_used", "Google Gemini"),
                    "detector_used": result.get("detector_used", "Google Vision AI"),
                    "student_id": student_id
                }
        except Exception as google_error:
            print(f"Google AI error: {google_error}")
        
        # Fallback to simple image comparison
        try:
            result = simple_face_recognizer.verify_faces(reference_image, live_image)
            if result["success"]:
                return {
                    "success": result["success"],
                    "match_status": result.get("match_status", "ERROR"),
                    "is_verified": result.get("is_verified", False),
                    "similarity_percentage": result.get("similarity_percentage", 0),
                    "confidence_level": result.get("confidence_level", "LOW"),
                    "color": result.get("color", "red"),
                    "message": result.get("message", "Face verification completed"),
                    "model_used": result.get("model_used", "Simple Comparison"),
                    "detector_used": result.get("detector_used", "OpenCV"),
                    "student_id": student_id
                }
        except Exception as simple_error:
            print(f"Simple face recognition error: {simple_error}")
        
        # If all methods fail, return error
        return {
            "success": False,
            "match_status": "ERROR",
            "is_verified": False,
            "similarity_percentage": 0,
            "confidence_level": "LOW",
            "color": "red",
            "message": "All face verification methods failed. Please try again.",
            "model_used": "None",
            "detector_used": "None",
            "student_id": student_id
        }
        
    except Exception as e:
        return {
            "success": False,
            "match_status": "ERROR",
            "is_verified": False,
            "similarity_percentage": 0,
            "confidence_level": "LOW",
            "color": "red",
            "message": f"Error during face verification: {str(e)}",
            "student_id": student_id
        }

@app.get("/attendance/student/{student_id}", response_model=List[attendance_schemas.Attendance])
def get_student_attendance(
    student_id: int,
    db: Session = Depends(get_db)
):
    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).all()
    return attendance_records

# Assignment endpoints removed - not used in current system