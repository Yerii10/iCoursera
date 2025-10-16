const base = "http://127.0.0.1:8000";

// 注册
const regBtn = document.getElementById("registerBtn");
if (regBtn) {
  regBtn.onclick = async () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) return alert("注册失败");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    window.location.href = "courses.html";
  };
}

// 登录
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return alert("登录失败");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    window.location.href = "courses.html";
  };
}
