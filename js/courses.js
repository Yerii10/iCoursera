// 检查是否登录（如未登录则跳转到登录页）
checkLogin();

const API_BASE = "http://127.0.0.1:8000/api";

async function loadCourses() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "加载课程失败");
      return;
    }

    const container = document.getElementById("courseList");
    container.innerHTML = "";

    // 遍历课程列表
    for (const course of data) {
      // 获取点赞数
      const likeRes = await fetch(`${API_BASE}/courses/${course.id}/likes`);
      const likeData = await likeRes.json();

      // 课程卡片
      const card = document.createElement("div");
      card.className =
        "bg-white p-4 shadow rounded-lg hover:shadow-lg transition flex flex-col justify-between";

      // 渲染卡片 HTML
      card.innerHTML = `
        <div>
          <img src="http://127.0.0.1:8000${course.cover_image}"
               alt="${course.title}"
               class="rounded-lg mb-3 w-full h-40 object-cover shadow-sm">
          <h3 class="text-lg font-semibold mb-1">${course.title}</h3>
          <p class="text-sm text-gray-600 mb-3">${course.description}</p>
        </div>

        <div class="flex items-center justify-between mt-2">
          <button onclick="location.href='video.html?courseId=${course.id}'"
            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
            查看课程
          </button>
          <span id="like-count-${course.id}" class="text-gray-700 text-sm">
            👍 ${likeData.count ?? 0}
          </span>
        </div>
      `;

      container.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    alert("网络错误，请检查后端是否运行中。");
  }
}

// 页面加载后执行
loadCourses();
