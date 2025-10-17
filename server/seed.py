from .db import Base, engine, SessionLocal
from .models import User, Course
from .auth import hash_password

def seed():
    """初始化数据库，创建测试用户与课程"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 添加测试用户
    if not db.query(User).filter_by(email="test@example.com").first():
        user = User(name="Tester", email="test@example.com", password_hash=hash_password("123456"))
        db.add(user)

    # 添加课程
    courses = [
        {"title": "Python 入门", "description": "从零开始学 Python", "video_filename": "python_intro.mp4"},
        {"title": "Web 前端基础", "description": "HTML / CSS / JS 快速上手", "video_filename": "web_basic.mp4"},
        {"title": "数据结构与算法", "description": "掌握核心算法思想", "video_filename": "algo_ds.mp4"},
    ]
    for c in courses:
        if not db.query(Course).filter_by(title=c["title"]).first():
            db.add(Course(**c))

    db.commit()
    db.close()
    print("✅ 数据库初始化完成！")

if __name__ == "__main__":
    seed()
