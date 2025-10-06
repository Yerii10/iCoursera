document.querySelectorAll(".btn-view").forEach(btn => {
  btn.addEventListener("click", e => {
    const card = e.target.closest(".course-card");
    const title = card.dataset.title;
    const url = card.dataset.url;

    localStorage.setItem("videoTitle", title);
    localStorage.setItem("videoUrl", url);
    window.location.href = "video.html";
  });
});

document.getElementById("logout-btn").addEventListener("click", () => {
  window.location.href = "login.html";
});
