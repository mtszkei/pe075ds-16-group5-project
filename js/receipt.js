document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order");

    let order = null;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (orderId && Array.isArray(orders)) {
        order = orders.find(o => String(o.id) === String(orderId));
    }

    if (!order) {
        const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
        if (lastOrder) {
            order = lastOrder;
        }
    }

    if (!order) {
        showEmptyReceipt();
        return;
    }

    renderReceipt(order);
});

function renderReceipt(order) {
    setText("receipt-order-id", order.id || "—");
    setText("receipt-order-time", formatTime(order.time));
    setText("receipt-payment", formatPayment(order.payment));
    setText("receipt-total", `$${Number(order.total).toLocaleString()}`);
    setText("receipt-products", `$${Number(order.productsTotal || 0).toLocaleString()}`);
    setText("receipt-shipping", `$${Number(order.deliveryFee || 0).toLocaleString()}`);
    setText("receipt-assembly", `$${Number(order.assemblyFee || 0).toLocaleString()}`);
    setText(
        "receipt-discount",
        order.discount > 0
            ? `-$${Number(order.discount).toLocaleString()}`
            : "$0"
    );

    const itemsEl = document.getElementById("receipt-items");
    if (!itemsEl) return;

    itemsEl.innerHTML = "";

    if (!Array.isArray(order.items) || order.items.length === 0) {
        itemsEl.innerHTML = `<p>No items.</p>`;
        return;
    }

    order.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "receipt-item";

        const brand = item.brand || "";
        const name = item.name || item.title || "Item";
        const fullName = brand ? `${brand} ${name}` : name;
        const qty = item.quantity || item.qty || 1;
        const price = item.price || 0;

        div.innerHTML = `
            <span class="item-name">${fullName}</span>
            <span class="item-qty">×${qty}</span>
            <span class="item-price">$${Number(price * qty).toLocaleString()}</span>
        `;

        itemsEl.appendChild(div);
    });
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
}

function formatPayment(method) {
    if (!method) return "—";
    return method
        .replace("-", " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

function showEmptyReceipt() {
    const page = document.querySelector(".receipt-page");
    if (!page) return;

    page.innerHTML = `
        <h1 class="receipt-title" data-i18n="receipt.orderNotFound">Order Not Found</h1>
        <div class="receipt-card">
            <p data-i18n="receipt.orderNotFoundDesc">This order cannot be found.</p>
            <div class="receipt-actions">
                <a href="/member/orders.html" class="receipt-btn primary" data-i18n="viewOrders">View Orders</a>
                <a href="/index.html" class="receipt-btn secondary" data-i18n="receipt.backToHome">Back to Home</a>
            </div>
        </div>
    `;
}

document.getElementById("download-receipt-btn")
  ?.addEventListener("click", async () => {

    const receipt = document.querySelector(".receipt-card");
    if (!receipt) return;

    const canvas = await html2canvas(receipt, {
        scale: 2,
        backgroundColor: "#ffffff"
    });

    const link = document.createElement("a");
    link.download = `receipt-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
});
