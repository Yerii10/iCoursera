from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pathlib import Path
import os

from .db import Base, engine, get_db
from .models import User, Course, Comment, Like
from .schemas import RegisterReq, LoginReq, TokenResp
from .auth import hash_password, verify_password, create_access_token, decode_token

# 初始化数据库
Base.metadata.create_all(bind=engine)

app = FastAPI(title="iCoursera API", version="3.1")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# 静态目录设置
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
IMAGE_DIR = PROJECT_ROOT / "image"
VIDEO_DIR = PROJECT_ROOT / "video"
IMAGE_DIR.mkdir(exist_ok=True)
VIDEO_DIR.mkdir(exist_ok=True)

app.mount("/image", StaticFiles(directory=IMAGE_DIR), name="image")
app.mount("/video", StaticFiles(directory=VIDEO_DIR), name="video")


# 当前用户
def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = creds.credentials
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="无效登录凭证")
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


# 注册 / 登录
@app.post("/api/auth/register", response_model=TokenResp)
def register(body: RegisterReq, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="邮箱已注册")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="密码太短")
    user = User(name=body.name, email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    token = create_access_token({"sub": user.email})
    return TokenResp(access_token=token)


@app.post("/api/auth/login", response_model=TokenResp)
def login(body: LoginReq, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    token = create_access_token({"sub": user.email})
    return TokenResp(access_token=token)


# 获取课程（附封面 + 视频路径）
@app.get("/api/courses")
def list_courses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    courses = db.query(Course).all()
    results = []
    image_map = ["p1.jpg", "p2.jpg", "p3.jpg"]
    video_map = ["v1.mp4", "v2.mp4", "v3.mp4"]
    for idx, c in enumerate(courses):
        results.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "cover_image": f"/image/{image_map[idx % len(image_map)]}",
            "video_file": f"/video/{video_map[idx % len(video_map)]}"
        })
    return results


# 点赞
@app.post("/api/courses/{id}/like")
def toggle_like(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")
    like = db.query(Like).filter_by(user_id=user.id, course_id=id).first()
    if like:
        db.delete(like)
        db.commit()
        return {"liked": False}
    db.add(Like(user_id=user.id, course_id=id))
    db.commit()
    return {"liked": True}


@app.get("/api/courses/{id}/likes")
def like_count(id: int, db: Session = Depends(get_db)):
    count = db.query(Like).filter_by(course_id=id).count()
    return {"count": count}


# 评论
@app.get("/api/courses/{id}/comments")
def get_comments(id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter_by(course_id=id).order_by(Comment.created_at.desc()).all()
    return [
        {"user": c.user.name, "content": c.content, "created_at": c.created_at.isoformat()}
        for c in comments
    ]


@app.post("/api/courses/{id}/comments")
def add_comment(id: int, payload: dict = Body(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    content = payload.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="评论不能为空")
    db.add(Comment(content=content, user_id=user.id, course_id=id))
    db.commit()
    return {"message": "ok"}


@app.get("/")
def root():
    return {"status": "ok", "message": "iCoursera API running"}
