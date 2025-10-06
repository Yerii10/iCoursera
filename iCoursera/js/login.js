document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email && password) {
    window.location.href = "courses.html";
  } else {
    alert("请输入邮箱和密码");
  }
});
