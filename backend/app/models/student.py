from sqlalchemy import Column, Integer, String, Boolean
from ..database.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    class_name = Column(String)
    section = Column(String)
    semester = Column(Integer)
    is_active = Column(Boolean, default=True)
