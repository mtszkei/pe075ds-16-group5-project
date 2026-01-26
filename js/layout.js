document.addEventListener("DOMContentLoaded", () => {

    //=====Function=====
    //load layout
    async function loadLayout(id, file) {
        const res = await fetch(file);
        const html = await res.text();
        document.getElementById(id).innerHTML = html;
    }

    async function initLayout() {
        await loadLayout('header', '/layout/header.html');
        initHeader();
        await loadLayout('footer', '/layout/footer.html');

        const savedLang = localStorage.getItem("lang") || "en";
        await setLanguage(savedLang);
    }

    //navbar and responscive
    function initHeader() {
        const toggleBtn = document.querySelector(".navbar-toggle");
        const mobileMenu = document.querySelector(".mobile-menu");
        const navActions = document.querySelector(".nav-actions");

        if (!toggleBtn || !mobileMenu || !navActions) {
            return;
        }

        const overlay = document.querySelector(".menu-overlay");

        toggleBtn.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");

            navActions.classList.toggle("shift-left", isOpen);
            toggleBtn.classList.toggle("active", isOpen);
            overlay.classList.toggle("active", isOpen);
            document.body.classList.toggle("menu-open", isOpen);
        });

        overlay.addEventListener("click", () => {
            mobileMenu.classList.remove("open");
            navActions.classList.remove("shift-left");
            toggleBtn.classList.remove("active");
            overlay.classList.remove("active");
            document.body.classList.remove("menu-open");
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth >= 769) {
                mobileMenu.classList.remove("open");
                navActions.classList.remove("shift-left");
                toggleBtn.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("menu-open");
            }
        });

        document.querySelectorAll(".lang-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const lang = btn.textContent === "繁" ? "zh" : "en";

                showLoader();

                await withMinLoading(setLanguage(lang), 500);

                hideLoader();

                document.querySelectorAll(".lang-btn").forEach(b =>
                    b.classList.remove("active")
                );
                btn.classList.add("active");
            });
        });
    }

    //loading display
    function showLoader() {
        document.querySelector(".page-loader")?.classList.add("active");
        document.body.classList.add("loading");
    }

    function hideLoader() {
        document.querySelector(".page-loader")?.classList.remove("active");
        document.body.classList.remove("loading");
    }

    async function withMinLoading(promise, minTime = 1000) {
        const start = Date.now();

        const result = await promise;

        const elapsed = Date.now() - start;
        const remaining = minTime - elapsed;

        if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
        }

        return result;
    }

    //language switch
    async function setLanguage(lang) {
        const res = await fetch(`src/data/${lang}.json`);
        const dict = await res.json();

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        localStorage.setItem("lang", lang);
    }

    //=====run function=====
    initLayout();

    window.showLoader = showLoader;
    window.hideLoader = hideLoader;
    window.withMinLoading = withMinLoading;

})