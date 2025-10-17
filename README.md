# 🎓 iCoursera — 在线课程学习平台

> 基于 **FastAPI + HTML + TailwindCSS + SQLite** 的轻量级在线课程平台。  
> 实现了完整的用户注册登录、课程展示、视频播放、评论与点赞等功能。  

---

## 🧭 项目概述

**iCoursera** 是一个教学型的全栈 Web 应用项目，旨在帮助学习者掌握从前端到后端、从数据库到身份验证的完整流程。  
系统采用 **前后端分离架构**，前端使用原生 JavaScript 实现动态页面交互，后端使用 **FastAPI** 提供 RESTful 接口与静态资源服务。  

用户可以直接在本地运行项目，无需外部依赖，体验完整的注册、登录、课程浏览与视频学习交互逻辑。

---

## 📁 项目结构

```
iCoursera/
├── server/                # 后端 FastAPI 服务
│   ├── main.py            # 主应用入口（uvicorn 启动点）
│   ├── auth.py            # 用户注册、登录与 JWT 身份验证
│   ├── db.py              # 数据库连接配置与 Session 管理
│   ├── models.py          # SQLAlchemy ORM 模型定义
│   ├── schemas.py         # Pydantic 数据模型（请求/响应）
│   ├── seed.py            # 初始化数据库（测试数据）
│   └── __init__.py
│
├── js/                    # 前端逻辑脚本
│   ├── auth.js            # 登录/注册逻辑与 Token 检查
│   ├── video.js           # 视频播放页的评论、点赞交互
│   └── course.js          # 动态渲染课程卡片与跳转
│
├── image/                 # 课程封面图片（p1.jpg, p2.jpg, p3.jpg）
├── video/                 # 视频文件（v1.mp4, v2.mp4, v3.mp4）
├── data/                  # SQLite 数据库文件 icourse.db
│
├── css/                   # TailwindCSS 样式文件
├── .gitignore             # 忽略虚拟环境、缓存文件等
├── requirements.txt       # Python 依赖清单
├── login.html             # 登录页面
├── register.html          # 注册页面
├── courses.html           # 课程展示页
└── video.html             # 视频播放页
```

---

## 🚀 快速启动

### 1️⃣ 克隆项目
```bash
git clone https://github.com/Yerii10/iCoursera.git
cd iCoursera
```

### 2️⃣ 创建虚拟环境
```bash
python -m venv .venv
.venv\Scripts\activate
```

### 3️⃣ 安装依赖
```bash
pip install -r requirements.txt
```

### 4️⃣ 启动服务
```bash
uvicorn server.main:app --reload
```

访问接口文档 👉 **http://127.0.0.1:8000/docs**  
或直接打开 `login.html` 进入系统。

---

## 💡 功能详情

### 👤 用户系统
- **注册**：用户填写姓名、邮箱、密码完成注册；密码加密后写入数据库。  
- **登录**：输入邮箱与密码验证，成功后生成 JWT Token。  
- **自动登录校验**：前端在访问课程页时验证 Token 是否有效，无效则跳转登录页。  
📁 相关文件：`server/auth.py`, `js/auth.js`

---

### 📚 课程系统
- 从数据库加载课程信息（名称、简介、封面路径、视频路径）。  
- 自动渲染课程卡片，展示课程简介与点赞数。  
- 点击“查看课程”后跳转到视频播放页面。  
📁 相关文件：`server/main.py`, `js/course.js`, `courses.html`

---

### 🎥 视频播放系统
- 每门课程对应一个视频文件（例如 `video/v1.mp4`）。  
- 支持播放、暂停、进度拖动和全屏。  
- 若路径未指定课程 ID，则提示“未指定视频路径”。  
📁 相关文件：`video.html`, `video.js`

---

### 💬 评论系统
- 用户可在视频页下方发布评论。  
- 评论自动关联用户信息与课程 ID。  
- 评论内容实时更新，无需刷新页面即可显示。  
📁 相关文件：`video.js`, `server/main.py`

---

### ❤️ 点赞系统
- 登录用户可对课程点赞或取消点赞。  
- 点赞状态实时更新，点赞数动态展示。  
- 数据库自动记录用户与课程的点赞关系。  
📁 相关文件：`video.js`, `server/main.py`

---

### 🔐 权限与验证
- 所有课程、评论、点赞接口均需登录后访问。  
- FastAPI 中间件会自动验证 `Authorization: Bearer <token>`。  
- Token 无效时返回 401 状态并在前端提示重新登录。  
📁 相关文件：`auth.js`, `server/main.py`

---

### 🌐 静态资源
- `/image` 用于课程封面。  
- `/video` 用于教学视频播放。  
- 通过 FastAPI 的 `StaticFiles` 自动挂载。  
📁 相关文件：`server/main.py`

---

## 🛠️ 技术栈

| 层级 | 使用技术 |
|------|-----------|
| 前端 | HTML + TailwindCSS + JavaScript |
| 后端 | FastAPI |
| 数据库 | SQLite + SQLAlchemy ORM |
| 用户认证 | JWT（python-jose） + bcrypt（passlib） |
| 环境管理 | Python venv |
| 静态资源 | FastAPI `StaticFiles` 挂载 |
| 依赖管理 | `requirements.txt` |

---

## 🧰 API 示例

### 🔐 登录
```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "test@example.com",
  "password": "123456"
}
```
返回：
```json
{
  "access_token": "xxxxxx",
  "token_type": "bearer"
}
```

---

### 📚 获取课程
```http
GET /api/courses
Authorization: Bearer <token>
```

---

### 💬 获取评论
```http
GET /api/courses/{id}/comments
```

---

### 💬 发表评论
```http
POST /api/courses/{id}/comments
Authorization: Bearer <token>
Content-Type: application/json
{
  "content": "课程讲得很棒！"
}
```

---

### ❤️ 点赞课程
```http
POST /api/courses/{id}/like
Authorization: Bearer <token>
```

---

## 📸 前端界面预览

| 页面 | 功能描述 |
|------|-----------|
| **登录 / 注册页** | 用户通过邮箱和密码登录或注册账号。 |
| **课程页** | 展示课程卡片（封面、简介、点赞数），点击进入视频页。 |
| **视频页** | 支持视频播放、点赞、发表评论。 |
