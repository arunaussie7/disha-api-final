from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttendanceBase(BaseModel):
    subject: str
    status: str

class AttendanceCreate(AttendanceBase):
    student_id: int
    photo1_path: Optional[str] = None
    photo2_path: Optional[str] = None
    face_matched: bool = False
    face_confidence: float = 0.0

class Attendance(AttendanceBase):
    id: int
    timestamp: datetime
    photo1_path: Optional[str]
    photo2_path: Optional[str]
    face_matched: bool

    class Config:
        from_attributes = True
