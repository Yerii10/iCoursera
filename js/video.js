checkLogin();

const params = new URLSearchParams(window.location.search);
const courseId = params.get("courseId");
const token = localStorage.getItem("token");
const API_BASE = "http://127.0.0.1:8000/api";

// -------------------- 加载视频 --------------------
async function loadVideo() {
  const videoEl = document.getElementById("courseVideo");
  videoEl.src = `${API_BASE}/videos/${courseId}/stream`;
}

// -------------------- 加载评论 --------------------
async function loadComments() {
  const list = document.getElementById("commentsList");
  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}/comments`);
    const data = await res.json();

    list.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
      list.innerHTML = "<li class='text-gray-500 text-sm'>还没有评论，快来抢沙发吧～</li>";
      return;
    }

    data.forEach((c) => {
      const li = document.createElement("li");
      li.className = "border-b py-2";
      li.innerHTML = `
        <p class="font-semibold">${c.user || "匿名用户"}</p>
        <p class="text-gray-700">${c.content || "(无内容)"}</p>
        <p class="text-gray-400 text-xs">${c.created_at ? new Date(c.created_at).toLocaleString() : ""}</p>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li class='text-red-400'>加载评论失败。</li>";
  }
}

// -------------------- 提交评论 --------------------
async function postComment() {
  const content = document.getElementById("commentInput").value.trim();
  if (!content) return alert("请输入评论内容！");
  if (!token) {
    alert("请先登录！");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn("评论错误详情：", data);
      alert(data.detail || "评论失败，请检查内容。");
      return;
    }

    document.getElementById("commentInput").value = "";
    await loadComments();
  } catch (err) {
    console.error(err);
    alert("网络错误或后端未启动。");
  }
}

// -------------------- 点赞切换 --------------------
async function toggleLike() {
  if (!token) {
    alert("请先登录！");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}/like`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn("点赞错误详情：", data);
      alert(data.detail || "点赞失败");
      return;
    }

    document.getElementById("likeBtn").innerText = data.liked ? "❤️ 已点赞" : "🤍 点赞";
    loadLikeCount();
  } catch (err) {
    console.error("点赞失败：", err);
    alert("点赞失败，请检查登录状态。");
  }
}

// -------------------- 加载点赞数量 --------------------
async function loadLikeCount() {
  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}/likes`);
    const data = await res.json();
    document.getElementById("likeCount").innerText = data.count ?? 0;
  } catch (err) {
    console.error(err);
    document.getElementById("likeCount").innerText = "?";
  }
}

// -------------------- 页面初始化 --------------------
loadVideo();
loadComments();
loadLikeCount();
