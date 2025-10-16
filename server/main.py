from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from .db import Base, engine, get_db
from .models import User, Course, Comment, Like
from .schemas import RegisterReq, LoginReq, TokenResp, CourseOut
from .auth import hash_password, verify_password, create_access_token, decode_token

Base.metadata.create_all(bind=engine)

app = FastAPI(title="iCoursera API")

origins = [
    "http://127.0.0.1:5500",  # VSCode Live Server
    "http://localhost:5500",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

security = HTTPBearer()
VIDEOS_DIR = os.path.join(os.path.dirname(__file__), "videos")

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = creds.credentials
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- 用户注册与登录 ---
@app.post("/api/auth/register", response_model=TokenResp)
def register(body: RegisterReq, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(name=body.name, email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    token = create_access_token({"sub": user.email})
    return TokenResp(access_token=token)

@app.post("/api/auth/login", response_model=TokenResp)
def login(body: LoginReq, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return TokenResp(access_token=token)

# --- 课程 ---
@app.get("/api/courses", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Course).all()

# --- 视频流 ---
@app.get("/api/videos/{course_id}/stream")
def stream(course_id: int, request: Request, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")

    path = os.path.join(VIDEOS_DIR, course.video_filename)
    if not os.path.exists(path):
        raise HTTPException(404, "Video not found")

    file_size = os.path.getsize(path)
    range_header = request.headers.get("range")
    if range_header:
        start = int(range_header.replace("bytes=", "").split("-")[0])
    else:
        start = 0
    end = min(start + 1024 * 1024 - 1, file_size - 1)
    chunk_size = end - start + 1

    with open(path, "rb") as f:
        f.seek(start)
        data = f.read(chunk_size)

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(chunk_size),
        "Content-Type": "video/mp4",
    }
    return Response(data, status_code=206, headers=headers)

# --- 点赞 ---
@app.post("/api/courses/{id}/like")
def toggle_like(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    like = db.query(Like).filter_by(user_id=user.id, course_id=id).first()
    if like:
        db.delete(like)
        db.commit()
        return {"liked": False}
    else:
        db.add(Like(user_id=user.id, course_id=id))
        db.commit()
        return {"liked": True}

@app.get("/api/courses/{id}/likes")
def like_count(id: int, db: Session = Depends(get_db)):
    count = db.query(Like).filter_by(course_id=id).count()
    return {"count": count}

# --- 评论 ---
@app.get("/api/courses/{id}/comments")
def get_comments(id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter_by(course_id=id).order_by(Comment.created_at.desc()).all()
    return [{"user": c.user.name, "content": c.content} for c in comments]

@app.post("/api/courses/{id}/comments")
def add_comment(id: int, content: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not content.strip():
        raise HTTPException(400, "Empty comment")
    comment = Comment(content=content.strip(), user_id=user.id, course_id=id)
    db.add(comment)
    db.commit()
    return {"message": "ok"}
