const title = localStorage.getItem("videoTitle");
const url = localStorage.getItem("videoUrl");

document.getElementById("video-title").textContent = title || "课程标题";
document.getElementById("video-source").src = url || "";
document.getElementById("course-video").load();

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "courses.html";
});
