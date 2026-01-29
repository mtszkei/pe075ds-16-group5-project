document.addEventListener("DOMContentLoaded", () => {

    const draft = getCheckoutDraft();
    if (!draft) {
        const expired = document.querySelector(".checkout-expired");
        const btn = document.querySelector(".expired-ok-btn");

        if (expired) {
            expired.classList.add("show");
        }

        btn?.addEventListener("click", () => {
            window.location.href = "/index.html";
        });

        return;
    }

    disableCartBtnWhenReady();
    renderCheckout(draft);
    bindModal();
    bindPaymentToggle();
    initCardNumberInput();
    initExpiryInput();
    bindCreditCardValidation();
    bindPlaceCardOrder();
    bindWalkInOrder();
    bindQRPlaceOrder();
    bindAutoFillCard();
});

//=====function=====

//render check out
function renderCheckout(draft) {
    renderItems(draft.items);
    renderSummary(draft);
}

// rnder your items
function renderItems(items = []) {
    const container = document.querySelector(".checkout-items");
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = "<p>No items</p>";
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <div class="name">${item.brand} ${item.name}</div>
                <div class="meta">
                    <span>Qty: ${item.quantity}</span>
                    <span>$${item.price}</span>
                </div>
            </div>
            <div class="sub">$${item.subtotal}</div>
        </div>
    `).join("");
}

// render summary
function renderSummary(draft) {
    setText(".sum-qty", draft.totalQty);
    setText(".sum-products", `$${draft.productsTotal}`);
    setText(".sum-shipping", `$${draft.deliveryFee}`);
    setText(".sum-assembly", `$${draft.assemblyFee}`);
    setText(".sum-discount", draft.discount > 0 ? `-$${draft.discount}` : "$0");
    setText(".sum-total-price", `$${draft.total}`);
}

//finish
function bindModal() {
    const modal = document.querySelector(".checkout-modal");
    const closeBtn = document.querySelector(".close-modal-btn");

    closeBtn?.addEventListener("click", () => {
        modal.classList.remove("open");
        window.location.href = "/index.html";
    });
}

//get check out items data from localstorage
function getCheckoutDraft() {
    return JSON.parse(localStorage.getItem("checkoutDraft"));
}

function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

//select payment toogle
function bindPaymentToggle() {
    const radios = document.querySelectorAll('input[name="payment"]');

    const creditCard = document.querySelector(".credit-card-payment");
    const qrCode = document.querySelector(".qr-code-payment");
    const walkIn = document.querySelector(".walk-in-payment");

    radios.forEach(radio => {
        radio.addEventListener("change", () => {

            creditCard.classList.remove("active");
            qrCode.classList.remove("active");
            walkIn.classList.remove("active");

            if (radio.value === "credit-card") {
                creditCard.classList.add("active");
            }

            if (radio.value === "qr-code") {
                qrCode.classList.add("active");
                requestAnimationFrame(() => {
                    initQRCodePayment();
                });
            }

            if (radio.value === "walk-in") {
                walkIn.classList.add("active");
            }
        });
    });
}

//disable cart btn after btn render
function disableCartBtnWhenReady() {
    const timer = setInterval(() => {
        const btn = document.querySelector(".cart-btn");

        if (btn) {
            btn.disabled = true;
            clearInterval(timer);
        }
    }, 50);
}

//credit card number input
function initCardNumberInput() {
    const input = document.getElementById("card-number");
    if (!input) return;

    input.addEventListener("input", () => {
        let value = input.value.replace(/\D/g, "");

        value = value.slice(0, 16);

        const groups = value.match(/.{1,4}/g);
        input.value = groups ? groups.join(" ") : "";
    });
}

//check credit card expiry input
function initExpiryInput() {
    const input = document.getElementById("card-expiry");
    if (!input) return;

    input.addEventListener("input", () => {
        let value = input.value.replace(/\D/g, "");

        value = value.slice(0, 4);

        if (value.length >= 3) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }

        input.value = value;
    });
}

//check credit card information
function isCreditCardFormValid() {
    const cardNumber = document.getElementById("card-number");
    const expiry = document.getElementById("card-expiry");
    const holder = document.querySelector('input[placeholder="JOHN WICK"]');
    const cvv = document.querySelector('input[type="password"]');

    if (!cardNumber || !expiry || !holder || !cvv) return false;

    const digits = cardNumber.value.replace(/\s/g, "");
    if (digits.length !== 16) return false;

    if (holder.value.trim().length === 0) return false;

    if (!/^\d{2}\/\d{2}$/.test(expiry.value)) return false;

    const month = Number(expiry.value.split("/")[0]);
    if (month < 1 || month > 12) return false;

    if (!/^\d{3}$/.test(cvv.value)) return false;

    return true;
}

// credit card place order active
function bindCreditCardValidation() {
    const btn = document.getElementById("place-card-order");
    if (!btn) return;

    const inputs = document.querySelectorAll(
        "#card-number, #card-expiry, input[type='password'], input[placeholder='JOHN WICK']"
    );

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            btn.disabled = !isCreditCardFormValid();
        });
    });
}

// credit card place order btn work
function bindPlaceCardOrder() {
    const btn = document.getElementById("place-card-order");
    const modal = document.querySelector(".checkout-modal");

    if (!btn || !modal) return;

    btn.addEventListener("click", () => {
        if (!isCreditCardFormValid()) return;
        completeOrder();
    });
}

//check walk in information
function isWalkInValid() {
    const day = document.getElementById("pickup-day");
    const time = document.getElementById("pickup-time");

    if (!day || !time) return false;

    return day.value !== "" && time.value !== "";
}

//walk in place order btn work
function bindWalkInOrder() {
    const btn = document.querySelector(".walk-in-payment .place-order-btn");
    const modal = document.querySelector(".checkout-modal");

    if (!btn || !modal) return;

    btn.addEventListener("click", () => {
        if (!isWalkInValid()) {
            alert("Please select pick-up date and time");
            return;
        }
        completeOrder();
    });
}

//init qr code
function initQRCodePayment() {
    const container = document.getElementById("qr-code-box");
    if (!container || typeof QRCode === "undefined") return;

    container.innerHTML = "";

    const paymentUrl = "https://upload.wikimedia.org/wikipedia/commons/1/16/Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg";

    new QRCode(container, {
        text: paymentUrl,
        width: 180,
        height: 180,
        colorDark: "#000",
        colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

//qr code place order
function bindQRPlaceOrder() {
    const btn = document.querySelector(".qr-code-payment .place-order-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        completeOrder();
    });
}

//place order
function completeOrder() {
    const modal = document.querySelector(".checkout-modal");
    if (!modal) return;

    localStorage.removeItem("cart");
    localStorage.removeItem("checkoutDraft");
    modal.classList.add("open");
}

//auto fill credit card info
function bindAutoFillCard() {
    const btn = document.querySelector(".auto-fill");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const cardNumber = document.getElementById("card-number");
        const expiry = document.getElementById("card-expiry");
        const holder = document.querySelector('input[placeholder="JOHN WICK"]');
        const cvv = document.querySelector('input[type="password"]');
        const placeBtn = document.getElementById("place-card-order");

        if (!cardNumber || !expiry || !holder || !cvv) return;

        cardNumber.value = "4242 4242 4242 4242";
        holder.value = "JOHN WICK";
        expiry.value = "12/29";
        cvv.value = "123";

        [cardNumber, holder, expiry, cvv].forEach(el => {
            el.dispatchEvent(new Event("input", { bubbles: true }));
        });

        if (placeBtn) {
            placeBtn.disabled = !isCreditCardFormValid();
        }
    });
}