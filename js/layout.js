document.addEventListener("DOMContentLoaded", () => {

    if (!localStorage.getItem("cart")) {
        localStorage.setItem("cart", JSON.stringify([]));
    }

    if (!sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(null));
    }

    let cachedItems = null;

    //update cart item info
    window.addEventListener("cartUpdated", () => {
        updateCartCount();
        renderCartDropdown();
    });

    //=====Function=====
    //load layout
    async function loadLayout(id, file) {
        const container = document.getElementById(id);
        if (!container) return;

        const res = await fetch(file);
        const html = await res.text();
        container.innerHTML = html;
    }

    async function initLayout() {
        await loadLayout('header', '/layout/header.html');
        initHeader();
        await loadLayout('footer', '/layout/footer.html');

        const savedLang = localStorage.getItem("lang") || "en";
        await setLanguage(savedLang);
    }

    async function getItems() {
        if (cachedItems) return cachedItems;

        const res = await fetch("/src/data/items.json");
        cachedItems = await res.json();
        return cachedItems;
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
        setLoginLogoutDisplay();
    }

    //set login/logout display
    function setLoginLogoutDisplay() {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const isLoggedIn = user && user["email"] !== null;
        const memberSpans = document.querySelectorAll('span[name="memberSpan"]');
        if(memberSpans && memberSpans.length == 2) {
            memberSpans[0].style.display = isLoggedIn ? "none" : "inline";
            memberSpans[1].style.display = isLoggedIn ? "inline" : "none";
        }
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
        try {
            const res = await fetch(`/src/data/${lang}.json`);
            if (!res.ok) throw new Error("Language file not found");

            const dict = await res.json();

            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.dataset.i18n;
                if (dict[key]) {
                    el.textContent = dict[key];
                }
            });

            document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (dict[key]) {
                    el.placeholder = dict[key];
                }
            });

            localStorage.setItem("lang", lang);
        } catch (err) {
            console.error("setLanguage error:", err);
        }
    }

    //add to cart
    function addToCart(itemId, qty = 1) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find(i => i.id === itemId);

        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push({ id: itemId, quantity: qty });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        clearCheckoutDraft();
        updateCartCount();
        renderCartDropdown();

        const cartBtn = document.querySelector(".cart-btn");
        const cartCount = document.querySelector(".cart-count");
        if (cartBtn) {
            cartBtn.classList.remove("animate");
            void cartBtn.offsetWidth;
            cartBtn.classList.add("animate");
        }

        if (cartCount) {
            cartCount.classList.remove("animate");
            void cartCount.offsetWidth;
            cartCount.classList.add("animate");
        }
    }

    //update cart qty
    function updateCartCount() {
        const countEl = document.querySelector(".cart-count");
        if (!countEl) return;

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

        countEl.textContent = totalQty;
        countEl.style.display = "block";
    }

    //render cart dropdown
    async function renderCartDropdown() {
        const dropdown = document.querySelector(".cart-dropdown");
        if (!dropdown) return;

        const emptyEl = dropdown.querySelector(".cart-empyt");
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        const itemsContainer = dropdown.querySelector(".cart-items");
        if (!itemsContainer) return;

        itemsContainer.querySelectorAll(".cart-item").forEach(el => el.remove());

        if (cart.length === 0) {
            itemsContainer.querySelectorAll(".cart-item").forEach(el => el.remove());

            if (emptyEl) {
                emptyEl.style.display = "flex";
            }

            dropdown.querySelector(".cart-subtotal")?.remove();
            updateCartCount();
            return;
        }

        if (emptyEl) {
            emptyEl.style.display = "none";
        }

        const items = await getItems();
        let subtotal = 0;

        cart.forEach(ci => {
            const product = items.find(p => p.id === ci.id);
            if (!product) return;

            subtotal += product.price * ci.quantity;

            const div = document.createElement("div");
            div.className = "cart-item";

            div.innerHTML = `
                <img src="${product.image[0]}" alt="">
                <div class="cart-info">
                    <p>${product.brand} ${product.name}</p>

                    <div class="cart-qty">
                        <button
                            class="qty-btn minus"
                            data-id="${ci.id}"
                            ${ci.quantity <= 1 ? "disabled" : ""}
                        >−</button>

                        <span class="qty-num">${ci.quantity}</span>

                        <button
                            class="qty-btn plus"
                            data-id="${ci.id}"
                            ${ci.quantity >= 9 ? "disabled" : ""}
                        >+</button>
                    </div>

                    <span class="cart-price">$${product.price}</span>
                </div>
                <button class="cart-remove" data-id="${ci.id}">✕</button>
            `;

            itemsContainer.appendChild(div);
        });

        dropdown.querySelector(".cart-subtotal")?.remove();

        const subtotalEl = document.createElement("div");
        subtotalEl.className = "cart-subtotal";
        subtotalEl.innerHTML = `
            <span>Subtotal</span>
            <strong>$${subtotal.toLocaleString()}</strong>
            `;

        dropdown.insertBefore(
            subtotalEl,
            dropdown.querySelector(".go-to-cart-btn")
        );

        updateCartCount();
    }

    //remove cart item
    function removeFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        cart = cart.filter(item => item.id !== itemId);

        localStorage.setItem("cart", JSON.stringify(cart));
        clearCheckoutDraft();
        window.dispatchEvent(new Event("cartUpdated"));

        updateCartCount();
    }

    function changeCartQty(itemId, delta) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const item = cart.find(i => i.id === itemId);
        if (!item) return;

        const nextQty = item.quantity + delta;

        if (nextQty < 1 || nextQty > 9) return;

        item.quantity = nextQty;

        localStorage.setItem("cart", JSON.stringify(cart));
        clearCheckoutDraft();
        window.dispatchEvent(new Event("cartUpdated"));
    }

    function bindCartQtyButtons() {
        const dropdown = document.querySelector(".cart-dropdown");
        if (!dropdown) return;

        dropdown.addEventListener("click", e => {
            const btn = e.target.closest(".qty-btn");
            if (!btn) return;

            const itemId = Number(btn.dataset.id);
            const delta = btn.classList.contains("plus") ? 1 : -1;

            changeCartQty(itemId, delta);
        });
    }

    function bindCartRemove() {
        const dropdown = document.querySelector(".cart-dropdown");
        if (!dropdown) return;

        dropdown.addEventListener("click", e => {
            const btn = e.target.closest(".cart-remove");
            if (!btn) return;

            const itemId = Number(btn.dataset.id);
            const itemEl = btn.closest(".cart-item");

            if (itemEl) {
                itemEl.classList.add("removing");

                setTimeout(() => {
                    removeFromCart(itemId);
                }, 250);
            }
        });
    }

    //clear local storage checkoutDraf
    function clearCheckoutDraft() {
        localStorage.removeItem("checkoutDraft");
    }

    //=====run function=====
    (async function () {
        await initLayout();
        updateCartCount();
        renderCartDropdown();
        bindCartQtyButtons();
        bindCartRemove();
    })();

    //=====Global Functions=====
    window.showLoader = showLoader;
    window.hideLoader = hideLoader;
    window.withMinLoading = withMinLoading;
    window.addToCart = addToCart;
    window.updateCartCount = updateCartCount;
    window.renderCartDropdown = renderCartDropdown;
})
