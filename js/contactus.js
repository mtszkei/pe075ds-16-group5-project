document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.querySelector('input[type="submit"]');
    const modal = document.getElementById("contactModal");
    const okBtn = document.getElementById("contactModalOk");

    const nameInput = document.getElementById("fname");
    const emailInput = document.getElementById("lname");
    const subjectInput = document.getElementById("subject");

    const alertBox = document.getElementById("contactAlert");

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value.trim();

        if (!name || !email || !subject) {
            alertBox.classList.add("active");
            return;
        }

        alertBox.classList.remove("active");
        modal.classList.add("active");
    });

    okBtn.addEventListener("click", () => {
        window.location.href = "/index.html";
    });
});