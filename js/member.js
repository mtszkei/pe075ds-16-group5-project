document.addEventListener("DOMContentLoaded", () => {
    if (isUserLoggedIn()) {
        memberLogout();
    }

    //=====run function=====
    (async function () {
        await initMembers();
        await initSubmitAction();
    })();

});
async function initSubmitAction() {
    // ===== Selector & EventListener =====
    const forms = document.querySelectorAll("form");
    forms.forEach(form =>
        form.addEventListener("submit", async (e) => {
            if (form.id === "loginForm") {
                e.preventDefault(); // Prevent form submission
                const email = document.getElementById("login-email").value;
                const password = document.getElementById("login-password").value;
                userLogin(email, password);
            } else {
                e.preventDefault(); // Prevent form submission
                const name = document.getElementById("register-name").value;
                const email = document.getElementById("register-email").value;
                const password = document.getElementById("register-password").value;
                userRegister(name, email, password);
            }
        })
    );
}

async function initMembers() {
    //    console.log("Initializing members data...");
    let members = getMembers() || [];
    if (members.length === 0) {
        fetch("../src/data/dummyMembers.json")
            .then(response => response.json())
            .then(data => {
                members = JSON.stringify(data);
                localStorage.setItem("members", members);
                //                console.log("Members data initialized.");
                //                console.log( getMembers() );
            })
            .catch(err => console.error("Failed to load members.json:", err));
    }
}

function getMembers() {
    return JSON.parse(localStorage.getItem("members")) || [];
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("user")) || null;
}

function isUserLoggedIn() {
    const user = getCurrentUser();
    return user && user["email"] !== null;
}

function userLogin(email, password) {
    const members = getMembers();

    const user = members.find(
        mem => mem.email === email && mem.password === password
    );

    const loginErrorText = document.getElementById("loginError");

    if (user) {
        user["password"] = undefined; // Remove password before storing
        sessionStorage.setItem("user", JSON.stringify(user));
        //        console.log("Login successful:", user);
        if (loginErrorText && loginErrorText.style.visibility === "visible")
            loginErrorText.style.visibility = "hidden";

        //        console.log( JSON.parse(sessionStorage.getItem("user")) );
        clearLoginForm();
        loginLogoutHandler(showLogin = false);
        delayAndRedirectPage();
    } else {
        if (loginErrorText && loginErrorText.style.visibility === "hidden")
            loginErrorText.style.visibility = "visible";
    }
}

function userRegister(name, email, password) {
    const members = getMembers();

    const existingUser = members.find(mem => mem.email === email);
    const regErrorText = document.getElementById("registerError");

    if (existingUser) {
        //        console.log("Registration failed: Email already in use.");

        if (regErrorText && regErrorText.style.visibility === "hidden")
            regErrorText.style.visibility = "visible";
    } else {
        const newUser = { name, email, password };
        members.push(newUser);
        localStorage.setItem("members", JSON.stringify(members));
        //        console.log("Registration successful:", newUser);

        if (regErrorText && regErrorText.style.visibility === "visible")
            regErrorText.style.visibility = "hidden";

        clearRegisterForm();

        userLogin(email, password);
    }
}

function loginLogoutHandler(showLogin = true) {
    const memberSpans = document.querySelectorAll('span[name="memberLoginSpan"]');

    if (memberSpans && memberSpans.length == 2) {
        memberSpans[0].style.display = showLogin ? "inline" : "none";
        memberSpans[1].style.display = showLogin ? "none" : "inline";
    }

    //    delayAndRedirectPage(targetPage="index");
}

function memberLogout() {
    sessionStorage.setItem("user", JSON.stringify(null));

    loginLogoutHandler(showLogin = true);
}

function clearLoginForm() {
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
}

function clearRegisterForm() {
    document.getElementById("register-name").value = "";
    document.getElementById("register-email").value = "";
    document.getElementById("register-password").value = "";
}

function delayAndRedirectPage(targetPage = "shop") {
    const delayMs = 1500; // 1.5 second delay
    document.querySelectorAll("[type=submit]").forEach(btn => btn.disabled = true);

    setTimeout(() => {
        window.location.href = `./${targetPage}.html`;
    }, delayMs);
}


function clearMember() {
    localStorage.removeItem("members");
    sessionStorage.setItem("user", JSON.stringify(null));
    console.log("Member data cleared from localStorage.");
}
