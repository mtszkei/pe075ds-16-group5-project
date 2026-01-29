document.addEventListener("DOMContentLoaded", () => {

    initCart();

    window.addEventListener("cartUpdated", () => {
        initCart();
        syncPromoUI();
    });

    //discount codes
    const DISCOUNT_CODES = [
        "SAVE100",
        "WELCOME100",
        "GROUP100"
    ];

    let appliedDiscount = 0;

    //match promotion code
    let promoApplied = false;
    const successMsg = document.querySelector(".promo-code-result.success");
    const failMsg = document.querySelector(".promo-code-result.fail");
    const applyBtn = document.querySelector(".code-apply");
    const codeInput = document.querySelector(".code-input");

    if (applyBtn && codeInput) {

        // refresh 時清空 input（需求 3）
        codeInput.value = "";

        applyBtn.addEventListener("click", () => {
            const code = codeInput.value.trim().toUpperCase();

            hidePromoMessages();

            if (!code) {
                showPromoFail();
                return;
            }

            if (promoApplied) {
                showPromoFail();
                return;
            }

            if (DISCOUNT_CODES.includes(code)) {
                appliedDiscount = 100;
                promoApplied = true;

                codeInput.disabled = true;
                applyBtn.disabled = true;

                showPromoSuccess();
            } else {
                appliedDiscount = 0;
                showPromoFail();
            }

            window.dispatchEvent(new Event("cartUpdated"));
        });
    }

    // listen how many assembly checkbox
    const assemblySelections = new Set(
        JSON.parse(localStorage.getItem("assemblySelections")) || []
    );

    document.addEventListener("change", (e) => {
        const checkbox = e.target.closest(
            '.assembly-option input[type="checkbox"]'
        );
        if (!checkbox) return;

        const itemId = Number(
            checkbox.id.replace("assembly-", "")
        );

        if (checkbox.checked) {
            assemblySelections.add(itemId);
        } else {
            assemblySelections.delete(itemId);
        }

        saveAssemblySelections();
        window.dispatchEvent(new Event("cartUpdated"));
    });

    document
        .querySelectorAll('input[name="method"]')
        .forEach(input => {
            input.addEventListener("change", () => {
                window.dispatchEvent(new Event("cartUpdated"));
            });
        });

    //promotion code and statement toggle
    const promoBtn = document.querySelector(".promo-code .toggle-btn");
    const promoCode = document.querySelector(".promo-code");

    if (promoBtn && promoCode) {
        bindToggle({
            button: promoBtn,
            target: promoCode
        });
    }

    document.querySelectorAll(".statement .toggle-btn").forEach(btn => {
        const statement = btn.closest(".statement");
        if (!statement) return;

        bindToggle({
            button: btn,
            target: statement
        });
    });

    //item + / - / del btn
    const cartItemsContainer = document.querySelector(".cartpage-items");

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", (e) => {
            const itemEl = e.target.closest(".cartpage-item");
            if (!itemEl) return;

            const itemId = Number(itemEl.dataset.id);
            if (!itemId) return;

            if (e.target.closest(".plus")) {
                updateQuantity(itemId, 1);
            }

            if (e.target.closest(".minus")) {
                updateQuantity(itemId, -1);
            }

            if (e.target.closest(".bi-trash")) {
                itemEl.classList.add("removing");

                setTimeout(() => {
                    removeItem(itemId);
                }, 250);
            }
        });
    }

    // ===== checkout =====
    const checkoutBtn = document.querySelector(".check-out-btn");

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", async () => {
            const cart = getCartFromStorage();
            if (!cart || cart.length === 0) return;

            const items = await fetchItems();
            const cartItems = mergeCartWithItems(cart, items);

            const deliveryFee = getDeliveryFee();

            const assemblyFee = getAssemblyFee(cartItems);

            const discount = getDiscountAmount();

            const productsTotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
            const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

            const total = productsTotal + deliveryFee + assemblyFee - discount;

            const delivery = document.getElementById("delivery");
            const pickup = document.getElementById("pickup");

            const shippingMethod =
                delivery?.checked ? "delivery" :
                    pickup?.checked ? "pickup" :
                        "not_selected";

            const checkoutDraft = {
                at: Date.now(),
                items: cartItems.map(i => ({
                    id: i.id,
                    brand: i.brand,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    subtotal: i.subtotal,
                    image: i.image?.[0] || ""
                })),
                totalQty,
                productsTotal,
                deliveryFee,
                assemblyFee,
                discount,
                total,
                shippingMethod,
                assemblyItemIds: [...assemblySelections],
            };

            localStorage.setItem("checkoutDraft", JSON.stringify(checkoutDraft));

            window.location.href = "/checkout.html";
        });
    }


    //=====function=====
    function bindToggle({ button, target, arrowSelector = ".toggle-arrow" }) {
        if (!button || !target) return;

        const arrow = button.querySelector(arrowSelector);

        button.addEventListener("click", () => {
            const isOpen = target.classList.toggle("open");
            if (arrow) {
                arrow.textContent = isOpen ? "▲" : "－";
            }
        });
    }

    //fetch data
    async function fetchItems() {
        const res = await fetch("/src/data/items.json");
        if (!res.ok) throw new Error("Failed to fetch items");
        return await res.json();
    }

    //fetch localstorage
    function getCartFromStorage() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    //merge cart with data
    function mergeCartWithItems(cart, items) {
        return cart
            .map(cartItem => {
                const product = items.find(
                    item => item.id === cartItem.id
                );

                if (!product) return null;

                return {
                    ...product,
                    quantity: cartItem.quantity,
                    subtotal: product.price * cartItem.quantity
                };
            })
            .filter(Boolean);
    }

    //init cart
    async function initCart() {
        try {
            const items = await fetchItems();
            const cart = getCartFromStorage();
            const cartItems = mergeCartWithItems(cart, items);

            const validIds = new Set(cart.map(i => i.id));
            assemblySelections.forEach(id => {
                if (!validIds.has(id)) {
                    assemblySelections.delete(id);
                }
            });

            saveAssemblySelections();
            renderCart(cartItems);
            renderOrderSummary(cartItems);
            renderServiceFee();
            updateCheckoutButtonState();
        } catch (err) {
            console.error(err);
        }
    }

    //render cart
    function renderCart(cartItems) {
        const container = document.querySelector(".cartpage-items");
        if (!container) return;

        if (!cartItems || cartItems.length === 0) {
            container.innerHTML = `
            <span class="cart-empyt">- Empty -</span>
            <a href="/shop.html" class="start-to-shop">Start to shop</a>
        `;
            return;
        }

        container.innerHTML = cartItems.map(item => `
            <div class="cartpage-item" data-id="${item.id}">
                <div class="cartpage-item-img-contanier">
                    <img
                        class="cartpage-item-img"
                        src="${item.image[0]}"
                        alt="${item.brand} ${item.name}"
                        loading="lazy"
                    />
                </div>

                <div class="cartpage-item-info">
                    <div class="cartpage-item-name">
                        <span class="brand">${item.brand}</span>
                        <span class="name">${item.name}</span>
                    </div>

                    <div class="cartpage-qty">
                            <button class="cartpage-qty-btn minus" ${item.quantity <= 1 ? "disabled" : ""}>
                                −                  
                            </button>
                        <span class="cartpage-qty-num">${item.quantity}</span>
                            <button class="cartpage-qty-btn plus" ${item.quantity >= 9 ? "disabled" : ""}>
                                +
                            </button>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                        </svg>
                    </div>

                    <div class="assembly-option">
                        <input
                            type="checkbox"
                            id="assembly-${item.id}"
                            data-price="200"
                            ${assemblySelections.has(item.id) ? "checked" : ""}
                        />
                        <label for="assembly-${item.id}" class="assembly-label">
                            Assembly service ($200/each)
                        </label>
                    </div>
                </div>

                <div class="cartpage-item-price">
                    <div class="cartpage-price">
                        $${item.price}
                    </div>
                    <div class="cartpage-subtotal">
                        $${item.subtotal}
                    </div>
                </div>
            </div>
        `).join("");
    }

    //update qty after + / - / del
    function updateQuantity(itemId, delta) {
        const cart = getCartFromStorage();
        const item = cart.find(i => i.id === itemId);
        if (!item) return;

        item.quantity += delta;

        if (item.quantity <= 0) {
            removeItem(itemId);
            return;
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
    }

    function removeItem(itemId) {
        const cart = getCartFromStorage().filter(i => i.id !== itemId);
        localStorage.setItem("cart", JSON.stringify(cart));
        assemblySelections.delete(itemId);
        window.dispatchEvent(new Event("cartUpdated"));
    }

    //render order summary
    function renderOrderSummary(cartItems) {
        const qtyEl = document.querySelector(".all-qty");
        const productsPriceEl = document.querySelector(".all-products-price");
        const totalPriceEl = document.querySelector(".total-price");
        const assemblyEl = document.querySelector(".assembly-price");
        const discountEl = document.querySelector(".discount-price");

        if (!qtyEl || !productsPriceEl || !totalPriceEl) return;

        if (!cartItems || cartItems.length === 0) {
            qtyEl.textContent = "0";
            productsPriceEl.textContent = "$0";
            totalPriceEl.textContent = "$0";

            if (assemblyEl) {
                assemblyEl.textContent = "$0";
            }

            if (discountEl) {
                discountEl.textContent = "$0";
                discountEl.classList.remove("have-discount");
            }

            return;
        }

        const totalQty = cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const productsTotal = cartItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        const deliveryFee = getDeliveryFee();
        const assemblyFee = getAssemblyFee(cartItems);
        const discount = getDiscountAmount();

        const total =
            productsTotal +
            deliveryFee +
            assemblyFee -
            discount;

        qtyEl.textContent = totalQty;
        productsPriceEl.textContent = `$${productsTotal.toLocaleString()}`;
        totalPriceEl.textContent = `$${total.toLocaleString()}`;

        if (assemblyEl) {
            assemblyEl.textContent = `$${assemblyFee.toLocaleString()}`;
        }

        if (discountEl) {
            if (discount > 0) {
                discountEl.textContent = `-$${discount.toLocaleString()}`;
                discountEl.classList.add("have-discount");
            } else {
                discountEl.textContent = "$0";
                discountEl.classList.remove("have-discount");
            }
        }
    }

    //render delivery service fee
    function renderServiceFee() {
        const serviceFeeBox = document.querySelector(".service-fee");
        if (!serviceFeeBox) return;

        const delivery = document.getElementById("delivery");
        const pickup = document.getElementById("pickup");

        serviceFeeBox.classList.remove(
            "show-not-select",
            "show-delivery",
            "show-pickup"
        );

        if (delivery?.checked) {
            serviceFeeBox.classList.add("show-delivery");
        } else if (pickup?.checked) {
            serviceFeeBox.classList.add("show-pickup");
        } else {
            serviceFeeBox.classList.add("show-not-select");
        }
    }

    //count delivery fee
    function getDeliveryFee() {
        const delivery = document.getElementById("delivery");
        const pickup = document.getElementById("pickup");

        if (delivery?.checked) return 500;
        if (pickup?.checked) return 0;

        return 0;
    }

    //count assembly fee
    function getAssemblyFee(cartItems = []) {
        return cartItems.reduce((sum, item) => {
            if (assemblySelections.has(item.id)) {
                return sum + item.quantity * 200;
            }
            return sum;
        }, 0);
    }

    //count discount fee
    function getDiscountAmount() {
        return appliedDiscount;
    }

    //save assembly in localstorage
    function saveAssemblySelections() {
        localStorage.setItem(
            "assemblySelections",
            JSON.stringify([...assemblySelections])
        );
    }

    //promotion msg
    function hidePromoMessages() {
        successMsg?.classList.remove("show");
        failMsg?.classList.remove("show");
    }

    function showPromoSuccess() {
        hidePromoMessages();
        successMsg?.classList.add("show");
    }

    function showPromoFail() {
        hidePromoMessages();
        failMsg?.classList.add("show");
    }

    //keep promotion when cart update
    function syncPromoUI() {
        if (!codeInput || !applyBtn) return;

        if (promoApplied) {
            codeInput.disabled = true;
            applyBtn.disabled = true;
        }
    }

    //check out btn able
    function updateCheckoutButtonState() {
        const checkoutBtn = document.querySelector(".check-out-btn");
        if (!checkoutBtn) return;

        const delivery = document.getElementById("delivery");
        const pickup = document.getElementById("pickup");

        const hasSelected =
            delivery?.checked || pickup?.checked;

        checkoutBtn.disabled = !hasSelected;
    }

});

