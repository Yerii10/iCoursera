document.getElementById("register-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (name && email && password) {
    alert("注册成功！请登录。");
    window.location.href = "login.html";
  } else {
    alert("请填写完整信息！");
  }
});
