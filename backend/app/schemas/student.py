from typing import Optional
from pydantic import BaseModel, EmailStr

class StudentBase(BaseModel):
    email: EmailStr
    name: str
    class_name: str
    section: str
    semester: int

class StudentCreate(StudentBase):
    password: str

class StudentLogin(BaseModel):
    email: EmailStr
    password: str

class Student(StudentBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
