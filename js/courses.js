const base = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

async function loadCourses() {
  const res = await fetch(`${base}/api/courses`, {
    headers: { Authorization: "Bearer " + token }
  });
  if (!res.ok) {
    alert("请重新登录");
    window.location.href = "login.html";
    return;
  }
  const data = await res.json();
  const list = document.getElementById("list");
  list.innerHTML = data.map(c =>
    `<div class="course-card">
       <h3>${c.title}</h3>
       <p>${c.description || ""}</p>
       <button onclick="go(${c.id})">进入课程</button>
     </div>`
  ).join("");
}

function go(id) {
  window.location.href = `video.html?id=${id}`;
}

loadCourses();
