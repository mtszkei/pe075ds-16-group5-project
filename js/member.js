document.addEventListener("DOMContentLoaded", () => {

    initRegister();
    initRegisterAutofill();
    initLogin();
    initLoginAutofill();
})

//======function=====
//register
function initRegister() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        window.showLoader();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;

        if (!name || !email || !password) {
            window.hideLoader();
            return;
        }

        try {
            const res = await fetch("/src/data/dummyMembers.json");
            const members = await res.json();

            const duplicate = members.some(
                u => u.name.toLowerCase() === name.toLowerCase()
            );

            if (duplicate) {
                window.hideLoader();

                const dupModal = document.querySelector(".register-name-reminder-modal");
                if (dupModal) {
                    dupModal.style.display = "block";
                }

                return;
            }
        } catch (err) {

            console.warn("Failed to check dummyMembers.json", err);
        }
        
        const user = {
            id: Date.now(),
            name,
            email
        };
        sessionStorage.setItem("user", JSON.stringify(user));

        try {
            const res = await fetch(
                "https://script.google.com/macros/s/AKfycbzZ0bNndTIpNMsVVeXboRlP7UC54i-vEJWOUH_lLBDMmh1jbzH7yDNKJe0WwzxOuVtx/exec",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const result = await res.json();

            if (!result.success && result.reason === "DUPLICATE_NAME") {
                sessionStorage.removeItem("user");

                window.hideLoader();

                const dupModal = document.querySelector(".register-name-reminder-modal");
                if (dupModal) {
                    dupModal.style.display = "block";
                }

                return;
            }

            if (!result.success) {
                console.error("Sheet write failed:", result.error);
            }

        } catch (err) {
            console.error("GAS request error:", err);
        }

        window.hideLoader();

        const modal = document.getElementById("registerSuccessModal");
        const nameSpan = document.getElementById("newMemberNameDisplay");

        if (modal && nameSpan) {
            nameSpan.textContent = name;
            modal.style.display = "block";
        }

        setTimeout(() => {
            window.location.href = "/shop.html";
        }, 2000);
    });
}
//register auto fill
function initRegisterAutofill() {
    const btn = document.querySelector(".auto-fill.reg-fill");
    if (!btn) return;

    btn.addEventListener("click", e => {
        e.preventDefault();

        document.getElementById("register-name").value = "Tester3";
        document.getElementById("register-email").value = "tester@example.com";
        document.getElementById("register-password").value = "12345678";
    });
}

//login
function initLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const errorModal = document.querySelector(".login-name-reminder-modal");

    function showLoginErrorModal() {
        if (errorModal) {
            errorModal.style.display = "block";
        }
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        window.showLoader();

        const name = document.getElementById("login-name").value.trim();
        const password = document.getElementById("login-password").value;

        if (!name || !password) {
            window.hideLoader();
            showLoginErrorModal();
            return;
        }

        let loggedInUser = null;

        try {
            const params = new URLSearchParams({ name, password });
            const res = await fetch(
                `https://script.google.com/macros/s/AKfycbzZ0bNndTIpNMsVVeXboRlP7UC54i-vEJWOUH_lLBDMmh1jbzH7yDNKJe0WwzxOuVtx/exec?${params.toString()}`
            );

            const result = await res.json();

            if (result.success && result.user) {
                loggedInUser = result.user;
            }
        } catch (err) {
            console.warn("GAS unavailable, fallback to local JSON", err);
        }

        if (!loggedInUser) {
            try {
                const res = await fetch("/src/data/dummyMembers.json");
                const members = await res.json();

                const user = members.find(
                    u =>
                        u.name.toLowerCase() === name.toLowerCase() &&
                        u.password === password
                );

                if (user) {
                    loggedInUser = {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    };
                }
            } catch (err) {
                console.error("Failed to load dummyMembers.json", err);
            }
        }

        window.hideLoader();

        if (loggedInUser) {
            sessionStorage.setItem("user", JSON.stringify(loggedInUser));
            window.location.href = "/index.html";
        } else {
            showLoginErrorModal();
        }
    });
}

//login auto fill
function initLoginAutofill() {
    const btn = document.querySelector(".auto-fill.login-fill");
    if (!btn) return;

    btn.addEventListener("click", e => {
        e.preventDefault();

        document.getElementById("login-name").value = "Tester2";
        document.getElementById("login-password").value = "12345678";
    });
}