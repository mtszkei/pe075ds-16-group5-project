document.addEventListener("DOMContentLoaded", () => {

    initRegister();
    initRegisterAutofill();

})

//======function=====
function initRegister() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        window.showLoader();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;

        // ===== 基本驗證 =====
        if (!name || !email || !password) {
            window.hideLoader();
            return;
        }

        // ===== optimistic local login =====
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

            // ===== Name 重覆 =====
            if (!result.success && result.reason === "DUPLICATE_NAME") {
                // 🔥 必須清走 local login
                sessionStorage.removeItem("user");

                window.hideLoader();

                const dupModal = document.querySelector(".register-name-reminder-modal");
                if (dupModal) {
                    dupModal.style.display = "block";
                }

                return; // ❌ 停止後續流程
            }

            // ===== 其他 GAS 錯誤（不阻登入）=====
            if (!result.success) {
                console.error("Sheet write failed:", result.error);
            }

        } catch (err) {
            console.error("GAS request error:", err);
            // network error 不影響 local login
        }

        // ===== 成功流程 =====
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

