from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterReq(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginReq(BaseModel):
    email: EmailStr
    password: str

class TokenResp(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    class Config:
        from_attributes = True
