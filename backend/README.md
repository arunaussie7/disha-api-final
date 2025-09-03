# Attendancify Backend

A FastAPI-based backend for the Attendancify student management system.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `POST /token` - Login and get access token
- `POST /students/` - Create new student
- `GET /students/me` - Get current student info
- `GET /students/{student_id}` - Get student by ID

## Database

Uses SQLite database (student_credentials.db) for development. For production, consider using PostgreSQL.

## Authentication

Uses JWT tokens for authentication. Access tokens expire after 30 minutes.
