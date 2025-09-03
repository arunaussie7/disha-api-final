from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from ..database.database import Base
from datetime import datetime

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String)
    status = Column(String)  # Present/Absent
    timestamp = Column(DateTime, default=datetime.utcnow)
    photo1_path = Column(String)  # Path to first photo
    photo2_path = Column(String)  # Path to second photo
    face_matched = Column(Boolean, default=False)  # Whether faces matched
    face_confidence = Column(Float, default=0.0)  # Confidence score of face match
