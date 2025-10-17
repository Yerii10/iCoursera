// ======= 通用提示函数 =======
function showError(msg) {
  const box = document.getElementById("message");
  if (box) {
    box.innerText = msg;
    box.style.color = "#e74c3c";
  } else {
    alert(msg);
  }
}

function showSuccess(msg) {
  const box = document.getElementById("message");
  if (box) {
    box.innerText = msg;
    box.style.color = "#2ecc71"; 
  } else {
    alert(msg);
  }
}

function extractErrorMessage(data, fallback) {
  if (!data) return fallback;

  if (typeof data.detail === "string") return translateError(data.detail);

  if (Array.isArray(data) && data[0]?.msg)
    return translateError(data[0].msg);

  if (Array.isArray(data.detail) && data.detail[0]?.msg)
    return translateError(data.detail[0].msg);

  return fallback;
}

function translateError(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("email") && msg.includes("valid")) {
    return "请输入正确的邮箱格式，例如 example@qq.com";
  }
  if (msg.includes("password") && msg.includes("short")) {
    return "密码太短，请输入更长的密码。";
  }
  if (msg.includes("already exists")) {
    return "该邮箱已注册，请直接登录。";
  }
  if (msg.includes("invalid credentials")) {
    return "邮箱或密码错误。";
  }
  if (msg.includes("empty comment")) {
    return "评论内容不能为空。";
  }
  if (msg.includes("user not found")) {
    return "未找到用户，请重新登录。";
  }

  return msg; 
}

async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showError("请输入邮箱和密码。");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = extractErrorMessage(data, "登录失败，请检查输入。");
      showError(msg);
      return;
    }

    localStorage.setItem("token", data.access_token);
    showSuccess("✅ 登录成功！");
    setTimeout(() => (window.location.href = "courses.html"), 800);
  } catch (err) {
    console.error(err);
    showError("网络错误，请确认后端服务已启动。");
  }
}

// ======= 注册逻辑 =======
async function handleRegister() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    showError("请填写所有字段。");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = extractErrorMessage(data, "注册失败，请检查输入。");
      showError(msg);
      return;
    }

    localStorage.setItem("token", data.access_token);
    showSuccess("✅ 注册成功！");
    setTimeout(() => (window.location.href = "courses.html"), 800);
  } catch (err) {
    console.error(err);
    showError("网络错误，请确认后端服务已启动。");
  }
}

// ======= 检查登录状态 =======
function checkLogin() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }
}

// ======= 自动跳转（防止重复登录） =======
function redirectIfLoggedIn() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "courses.html";
  }
}

// ======= 退出登录 =======
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
