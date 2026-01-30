document.addEventListener("DOMContentLoaded", () => {
    if (isUserLoggedIn()) {
        memberLogout();
        displayEventMessage(eventType="logout");
    }

    //=====run function=====
    (async function () {
        await initMembers();
        await initSubmitAction();
    })();
<<<<<<< HEAD

=======
>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348
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
<<<<<<< HEAD
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
=======
    if(getMembers().length === 0) {
        fetch("../src/data/dummyMembers.json")
            .then(response => response.json())
            .then(data => addMember(data))
>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348
            .catch(err => console.error("Failed to load members.json:", err));
    }
}

<<<<<<< HEAD
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

=======
function userLogin(email, password, newMember=false) {
    const user = getMemberByEmailAndPassword(email, password);
    
>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348
    const loginErrorText = document.getElementById("loginError");

    if (user) {
        user["password"] = undefined; // Remove password before storing
<<<<<<< HEAD
        sessionStorage.setItem("user", JSON.stringify(user));
        //        console.log("Login successful:", user);
        if (loginErrorText && loginErrorText.style.visibility === "visible")
            loginErrorText.style.visibility = "hidden";

        //        console.log( JSON.parse(sessionStorage.getItem("user")) );
        clearLoginForm();
        loginLogoutHandler(showLogin = false);
=======
        putUserCache(user);

        if(loginErrorText && loginErrorText.style.visibility === "visible")
            loginErrorText.style.visibility = "hidden";

        clearLoginForm();
        loginLogoutHandler(isLoggedIn=true);

        if(!newMember)
            displayEventMessage(eventType="login");

>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348
        delayAndRedirectPage();
    } else {
        if (loginErrorText && loginErrorText.style.visibility === "hidden")
            loginErrorText.style.visibility = "visible";
    }
}

function userRegister(name, email, password) {
    const existingUser = getMemberByEmail(email);
    const regErrorText = document.getElementById("registerError");

<<<<<<< HEAD
    if (existingUser) {
        //        console.log("Registration failed: Email already in use.");

        if (regErrorText && regErrorText.style.visibility === "hidden")
            regErrorText.style.visibility = "visible";
    } else {
        const newUser = { name, email, password };
        members.push(newUser);
        localStorage.setItem("members", JSON.stringify(members));
        //        console.log("Registration successful:", newUser);
=======
    if (existingUser) {        
        if(regErrorText && regErrorText.style.visibility === "hidden")
            regErrorText.style.visibility = "visible";
    } else {
        const newUser = { name, email, password };
        addMember(newUser);
>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348

        if (regErrorText && regErrorText.style.visibility === "visible")
            regErrorText.style.visibility = "hidden";

        clearRegisterForm();

        // Auto login after registration
        userLogin(email, password, newMember=true);
        
        displayEventMessage(eventType="register");
    }
}

<<<<<<< HEAD
function loginLogoutHandler(showLogin = true) {
    const memberSpans = document.querySelectorAll('span[name="memberLoginSpan"]');

    if (memberSpans && memberSpans.length == 2) {
        memberSpans[0].style.display = showLogin ? "inline" : "none";
        memberSpans[1].style.display = showLogin ? "none" : "inline";
    }

    //    delayAndRedirectPage(targetPage="index");
=======
function hideAllEventMessages() {
    const msgBlockIds = [
        "successLoginDesc",
        "successRegisterDesc",
        "successLogoutDesc"
    ];
    msgBlockIds.forEach(id => {
        const msgBlock = document.getElementById(id);
        if(msgBlock) {
            msgBlock.style.display = "none";
        }
    });
}

function displayEventMessage(eventType="login") {
    let msgBlockId = "";

    hideAllEventMessages();
    
    switch(eventType) {
        case "login":
            msgBlockId = "successLoginDesc";
            break;
        case "register":
            msgBlockId = "successRegisterDesc";
            break;
        default:
            msgBlockId = "successLogoutDesc";
            break;
    }

    const msgBlock = document.getElementById(msgBlockId);
    if(msgBlock) {
        if(eventType === "login" || eventType === "register") {
            const memberNameBlockId = eventType === "login" ? "memberNameDisplay" : "newMemberNameDisplay";
            const memberNameSpan = document.getElementById(memberNameBlockId);
            if(memberNameSpan) {
                memberNameSpan.textContent = getCurrentUser().name;
            }
        }
        msgBlock.style.display = "inline";
    }
>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348
}

function loginLogoutHandler(isLoggedIn=true) {
    const memberSpans = document.querySelectorAll('span[name="memberSpan"]');

<<<<<<< HEAD
    loginLogoutHandler(showLogin = true);
=======
    if(memberSpans && memberSpans.length == 2) {
        memberSpans[0].style.display = isLoggedIn ? "none" : "inline";
        memberSpans[1].style.display = isLoggedIn ? "inline" : "none";        
    }

//    delayAndRedirectPage(targetPage="index");
>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348
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

<<<<<<< HEAD
function delayAndRedirectPage(targetPage = "shop") {
    const delayMs = 1500; // 1.5 second delay
=======

function getMembers() {
    const members = localStorage.getItem("members");
    return members ? JSON.parse(members) : [];
}

function getMemberByEmail(email) {
    return getMembers().find(mem => mem.email === email);
}

function getMemberByEmailAndPassword(email, password) {
    return getMembers().find( mem => mem.email === email && mem.password === password);
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("user"));
}

function isUserLoggedIn() {
    const user = getCurrentUser();
    return user && user["email"] !== null;
}

function memberLogout() {
    clearUserCache();
    loginLogoutHandler(isLoggedIn=false);
}

function putUserCache(user) {
    sessionStorage.setItem("user", JSON.stringify(user));
}

function clearUserCache() {
    sessionStorage.setItem("user", JSON.stringify(null));
}

function addMember(member) {
    let members = getMembers().concat(member);
    localStorage.setItem("members", JSON.stringify(members));
}

function delayAndRedirectPage(targetPage="shop") {
    const delayMs = 3000; // 3 second delay
>>>>>>> b02cefd814b1972be6e68ac9aa33b5360eda3348
    document.querySelectorAll("[type=submit]").forEach(btn => btn.disabled = true);

    setTimeout(() => {
        window.location.href = `./${targetPage}.html`;
    }, delayMs);
}

/*
function clearMembers() {
    localStorage.removeItem("members");
    clearUserCache();
    console.log("Member data cleared from localStorage.");
}
*/
