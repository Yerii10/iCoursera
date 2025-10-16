from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)
    password_hash = Column(String(255))

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    description = Column(Text)
    video_filename = Column(String(255))
    comments = relationship("Comment", back_populates="course")
    likes = relationship("Like", back_populates="course")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    user = relationship("User")
    course = relationship("Course", back_populates="comments")

class Like(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="_user_course_uc"),)
    user = relationship("User")
    course = relationship("Course", back_populates="likes")
