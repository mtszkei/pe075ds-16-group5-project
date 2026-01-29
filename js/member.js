document.addEventListener("DOMContentLoaded", () => {
    if(isUserLoggedIn()) {
        memberLogout();
        displayEventMessage(eventType="logout");
    }
    
    //=====run function=====
    (async function() {
        await initMembers();
        await initSubmitAction();
    })();
});

async function initSubmitAction() {
    // ===== Selector & EventListener =====
    const forms = document.querySelectorAll("form");
    forms.forEach(form => 
        form.addEventListener("submit", async (e) => {
            if(form.id === "loginForm") {
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
    if(getMembers().length === 0) {
        fetch("../src/data/dummyMembers.json")
            .then(response => response.json())
            .then(data => addMember(data))
            .catch(err => console.error("Failed to load members.json:", err));
    }
}

function userLogin(email, password, newMember=false) {
    const user = getMemberByEmailAndPassword(email, password);
    
    const loginErrorText = document.getElementById("loginError");

    if (user) {
        user["password"] = undefined; // Remove password before storing
        putUserCache(user);

        if(loginErrorText && loginErrorText.style.visibility === "visible")
            loginErrorText.style.visibility = "hidden";

        clearLoginForm();
        loginLogoutHandler(isLoggedIn=true);

        if(!newMember)
            displayEventMessage(eventType="login");

        delayAndRedirectPage();
    } else {
        if(loginErrorText && loginErrorText.style.visibility === "hidden")
            loginErrorText.style.visibility = "visible";
    }
}

function userRegister(name, email, password) {
    const existingUser = getMemberByEmail(email);
    const regErrorText = document.getElementById("registerError");

    if (existingUser) {        
        if(regErrorText && regErrorText.style.visibility === "hidden")
            regErrorText.style.visibility = "visible";
    } else {
        const newUser = { name, email, password };
        addMember(newUser);

        if(regErrorText && regErrorText.style.visibility === "visible")
            regErrorText.style.visibility = "hidden";

        clearRegisterForm();

        // Auto login after registration
        userLogin(email, password, newMember=true);
        
        displayEventMessage(eventType="register");
    }
}

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
}

function loginLogoutHandler(isLoggedIn=true) {
    const memberSpans = document.querySelectorAll('span[name="memberSpan"]');

    if(memberSpans && memberSpans.length == 2) {
        memberSpans[0].style.display = isLoggedIn ? "none" : "inline";
        memberSpans[1].style.display = isLoggedIn ? "inline" : "none";        
    }

//    delayAndRedirectPage(targetPage="index");
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
