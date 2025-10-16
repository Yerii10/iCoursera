const base = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");
const id = new URLSearchParams(location.search).get("id");

const player = document.getElementById("player");
player.src = `${base}/api/videos/${id}/stream`;

async function loadLikes() {
  const res = await fetch(`${base}/api/courses/${id}/likes`);
  const data = await res.json();
  document.getElementById("like-count").innerText = data.count;
}

document.getElementById("like-btn").onclick = async () => {
  await fetch(`${base}/api/courses/${id}/like`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  loadLikes();
};

async function loadComments() {
  const res = await fetch(`${base}/api/courses/${id}/comments`);
  const data = await res.json();
  document.getElementById("comments").innerHTML =
    data.map(c => `<p><b>${c.user}</b>: ${c.content}</p>`).join("");
}

document.getElementById("send").onclick = async () => {
  const content = document.getElementById("content").value;
  await fetch(`${base}/api/courses/${id}/comments?content=${encodeURIComponent(content)}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  document.getElementById("content").value = "";
  loadComments();
};

loadLikes();
loadComments();
