document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    document.getElementById("profile-id").textContent = user.id ?? "—";
    document.getElementById("profile-name").textContent = user.name ?? "—";
    document.getElementById("profile-email").textContent = user.email ?? "—";

    const addressDisplay = document.getElementById("profile-address-display");
    const addressInput = document.getElementById("profile-address");
    const saveBtn = document.querySelector(".profile-save-btn");

    addressDisplay.textContent = user.address || "Not set";

    addressInput.value = "";

    saveBtn.disabled = true;

    addressInput.addEventListener("input", () => {
        saveBtn.disabled = addressInput.value.trim() === "";
    });

    saveBtn.addEventListener("click", async () => {
        const newAddress = addressInput.value.trim();
        if (!newAddress) return;

        user.address = newAddress;
        sessionStorage.setItem("user", JSON.stringify(user));

        addressDisplay.textContent = newAddress;
        saveBtn.disabled = true;
        addressInput.value = "";

        try {
            const res = await fetch(
                "https://script.google.com/macros/s/AKfycbzZ0bNndTIpNMsVVeXboRlP7UC54i-vEJWOUH_lLBDMmh1jbzH7yDNKJe0WwzxOuVtx/exec?action=updateAddress",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain" // 避免 CORS preflight
                    },
                    body: JSON.stringify({
                        id: user.id,
                        address: newAddress
                    })
                }
            );

            const result = await res.json();
            if (!result.success) {
                console.warn("GAS update failed, saved locally only", result);
            }
        } catch (err) {
            console.warn("GAS unreachable, saved locally only", err);
        }
    });
});