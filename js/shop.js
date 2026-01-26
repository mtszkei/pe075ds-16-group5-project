document.addEventListener("DOMContentLoaded", () => {

    // ===== Selector & EventListener =====
    const categoryCheckboxes = document.querySelectorAll(
        'input[name="category"]'
    );

    categoryCheckboxes.forEach(cb => {
        cb.checked = false;
    });

    categoryCheckboxes.forEach(cb => {
        cb.addEventListener("change", applyCategoryFilter);
    });

    const sortByNewestBtn = document.getElementById("sortByNewest");
    const sortByPriceBtn = document.getElementById("sortbyPrice");

    sortByNewestBtn.addEventListener("click", sortByNewestOrOldest);
    sortByPriceBtn.addEventListener("click", sortByPriceHighLow);

    //=====Function=====

    let allItems = [];
    let currentItems = [];

    let newestFirst = true;
    let priceHighFirst = true;

    //fetch data
    async function loadItems() {
        try {
            const res = await fetch("/src/data/items.json");
            if (!res.ok) throw new Error("Failed to load items.json");

            allItems = await res.json();
            currentItems = [...allItems];
            renderItems(currentItems);
        } catch (err) {
            console.error(err);
        }
    }

    //Filter
    async function applyCategoryFilter() {
        window.showLoader?.();
        try {
            const selectedCategories = Array.from(categoryCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            currentItems =
                selectedCategories.length === 0
                    ? [...allItems]
                    : allItems.filter(item =>
                        selectedCategories.includes(item.category)
                    );

            await window.withMinLoading?.(
                Promise.resolve(renderItems(currentItems)),
                300
            );
        } finally {
            window.hideLoader?.();
        }
    }

    //Stock 
    function getStockStatus(stock) {
        if (stock >= 6) {
            return {
                text: "In Stock",
                className: "stock-in"
            };
        }

        if (stock >= 1 && stock <= 5) {
            return {
                text: "Low Stock",
                className: "stock-low"
            };
        }

        return {
            text: "Out of Stock",
            className: "stock-out"
        };
    }

    //render item list
    function renderItems(items) {
        const itemList = document.querySelector(".item-list");
        itemList.innerHTML = "";

        items.forEach(item => {

            const stockInfo = getStockStatus(item.stock);
            const isOutOfStock = item.stock === 0;

            const itemHTML = `
            <div class="item">
                <div class="item-image-container">
                    <img src="${item.image[0]}" loading="lazy" />
                </div>

                <h3>${item.brand} ${item.name}</h3>

                <div class="price-stock">
                    <p class="price">Price : $${item.price}</p>
                    <p class="stock ${stockInfo.className}">${stockInfo.text}</p>
                </div>

                <a href="/shop/item.html?id=${item.id}" class="buy-link">
                    View detail
                </a>

                <button
                    ${isOutOfStock ? "disabled" : ""}
                    class="${isOutOfStock ? "btn-disabled" : ""}">
                    Add to cart
                </button>
            </div>
        `;

            itemList.insertAdjacentHTML("beforeend", itemHTML);
        });
    }
    //Sort
    async function sortByNewestOrOldest() {
        window.showLoader?.();
        try {
            currentItems = [...currentItems].sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return newestFirst ? dateB - dateA : dateA - dateB;
            });

            await window.withMinLoading?.(
                Promise.resolve(renderItems(currentItems)),
                300
            );

            newestFirst = !newestFirst;
        } finally {
            window.hideLoader?.();
        }
    }

    async function sortByPriceHighLow() {
        window.showLoader?.();
        try {
            currentItems = [...currentItems].sort((a, b) =>
                priceHighFirst ? b.price - a.price : a.price - b.price
            );

            await window.withMinLoading?.(
                Promise.resolve(renderItems(currentItems)),
                300
            );

            priceHighFirst = !priceHighFirst;
        } finally {
            window.hideLoader?.();
        }
    }

    //=====Run function=====
    loadItems();

})

