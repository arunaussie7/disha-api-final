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
from .models.assignment import Assignment
from .schemas import assignment as assignment_schemas
from .schemas import student as student_schemas
from .schemas import attendance as attendance_schemas
from .utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .utils.face_detection import compare_image_names

# Create database tables
models.student.Base.metadata.create_all(bind=engine)
models.attendance.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8082", "http://172.20.10.2:8082"],  # Updated frontend URLs
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

    # Compare image names
    result = compare_image_names(photo1.filename, photo2.filename)
    
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )

    # Verify that the image name matches the student's name
    student_name = student.name.lower().replace(" ", "")  # Remove spaces and convert to lowercase
    if result["student_name"] != student_name:
        raise HTTPException(
            status_code=400,
            detail="Image names don't match student name"
        )

    # Save photos
    os.makedirs("uploads", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save with original filenames to preserve student name
    photo1_path = f"uploads/{photo1.filename}"
    photo2_path = f"uploads/{photo2.filename}"

    # Read and save photos
    photo1_contents = await photo1.read()
    photo2_contents = await photo2.read()
    
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
        face_matched=result["success"],
        face_confidence=result["confidence"]
    )
    
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@app.get("/attendance/student/{student_id}", response_model=List[attendance_schemas.Attendance])
def get_student_attendance(
    student_id: int,
    db: Session = Depends(get_db)
):
    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).all()
    return attendance_records

@app.post("/assignments/", response_model=assignment_schemas.Assignment)
def create_assignment(
    assignment: assignment_schemas.AssignmentCreate,
    db: Session = Depends(get_db)
):
    db_assignment = Assignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@app.get("/assignments/", response_model=List[assignment_schemas.Assignment])
def get_assignments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    assignments = db.query(Assignment).offset(skip).limit(limit).all()
    return assignments

@app.get("/assignments/{assignment_id}", response_model=assignment_schemas.Assignment)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment