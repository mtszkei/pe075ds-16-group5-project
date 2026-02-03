document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const listEl = document.querySelector(".orders-list");

    if (!listEl) return;

    if (!user) {
        listEl.innerHTML = `
            <div class="orders-empty">
                <p>Please login to view your orders.</p>
            </div>
        `;
        return;
    }

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (orders.length > 0) {
        renderOrders(orders);
    } else {
        fetchOrdersFromGAS(user.id);
    }
});

async function fetchOrdersFromGAS(userId) {
    const listEl = document.querySelector(".orders-list");
    if (!listEl) return;

    listEl.innerHTML = `
        <div class="orders-empty">
            <p>Loading orders...</p>
        </div>
    `;

    try {
        const res = await fetch(
            `https://script.google.com/macros/s/AKfycbzZ0bNndTIpNMsVVeXboRlP7UC54i-vEJWOUH_lLBDMmh1jbzH7yDNKJe0WwzxOuVtx/exec?action=getOrders&user_id=${userId}`
        );

        const data = await res.json();

        if (!data.success || !Array.isArray(data.orders)) {
            throw new Error("Invalid response");
        }

        // 儲存到 localStorage
        localStorage.setItem("orders", JSON.stringify(data.orders));

        renderOrders(data.orders);

    } catch (err) {
        console.warn("Unable to fetch orders from GAS", err);

        listEl.innerHTML = `
            <div class="orders-empty">
                <p>No orders found.</p>
            </div>
        `;
    }
}

function renderOrders(orders) {
    const listEl = document.querySelector(".orders-list");
    if (!listEl) return;

    if (orders.length === 0) {
        listEl.innerHTML = `
            <div class="orders-empty">
                <p>No orders yet.</p>
            </div>
        `;
        return;
    }

    // 最新訂單排前
    const sortedOrders = orders
        .slice()
        .sort((a, b) => new Date(b.time) - new Date(a.time));

    listEl.innerHTML = sortedOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.id}</span>
                <span class="order-time">${formatTime(order.time)}</span>
            </div>

            <div class="order-body">
                <div class="order-info">
                    <span class="label" data-i18n="orders.payment">Payment</span>
                    <span class="value">${formatPayment(order.payment)}</span>
                </div>

                <div class="order-info">
                    <span class="label" data-i18n="total">Total</span>
                    <span class="value">$${order.total}</span>
                </div>

                <div class="order-info">
                    <span class="label" data-i18n="orders.qty">Qty</span>
                    <span class="value">${order.qty}</span>
                </div>
            </div>

            <div class="order-footer">
                <button class="view-order-btn" data-id="${order.id}" data-i18n="orders.viewDetails">
                    View Details
                </button>
            </div>
        </div>
    `).join("");

    bindViewButtons();
}

function bindViewButtons() {
    document.querySelectorAll(".view-order-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const orderId = btn.dataset.id;
            window.location.href = `/receipt.html?order=${orderId}`;
        });
    });
}

function formatTime(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
}

function formatPayment(method) {
    if (!method) return "Unknown";
    return method
        .replace("-", " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}