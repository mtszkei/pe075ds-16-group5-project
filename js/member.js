document.addEventListener("DOMContentLoaded", () => {

    initRegister();
    initRegisterAutofill();

})

//======function=====
function initRegister() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", e => {
        e.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();

        if (!name || !email) return;

        const user = {
            id: Date.now(),
            name,
            email
        };

        sessionStorage.setItem("user", JSON.stringify(user));

        const modal = document.getElementById("registerSuccessModal");
        const nameSpan = document.getElementById("newMemberNameDisplay");

        if (modal && nameSpan) {
            nameSpan.textContent = name;
            modal.style.display = "block";
        }

        setTimeout(() => {
            window.location.href = "/index.html";
        }, 3000);
    });
}

function initRegisterAutofill() {
    const btn = document.querySelector(".auto-fill.reg-fill");
    if (!btn) return;

    btn.addEventListener("click", e => {
        e.preventDefault();

        document.getElementById("register-name").value = "Tester";
        document.getElementById("register-email").value = "tester@example.com";
        document.getElementById("register-password").value = "12345678";
    });
}

