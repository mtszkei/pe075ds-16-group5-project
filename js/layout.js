async function loadLayout(id, file) {
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}

function initHeader() {
    const toggleBtn = document.querySelector(".navbar-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const navActions = document.querySelector(".nav-actions");

    if (!toggleBtn || !mobileMenu || !navActions) return;

    toggleBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
        navActions.classList.toggle("shift-left");
        toggleBtn.classList.toggle("active")
    });
}

async function initLayout() {
    await loadLayout('header', '/layout/header.html');
    initHeader();
    await loadLayout('footer', '/layout/footer.html');
}

initLayout();