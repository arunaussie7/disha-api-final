from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssignmentBase(BaseModel):
    title: str
    description: str
    subject: str
    due_date: datetime

class AssignmentCreate(AssignmentBase):
    teacher_id: int

class Assignment(AssignmentBase):
    id: int
    created_at: datetime
    teacher_id: int

    class Config:
        from_attributes = True
