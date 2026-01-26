document.addEventListener("DOMContentLoaded", () => {

    // ===== Selector & EventListener =====
    document.getElementById("prev-btn")?.addEventListener("click", () => {
        showImage(currentIndex - 1);
    });

    document.getElementById("next-btn")?.addEventListener("click", () => {
        showImage(currentIndex + 1);
    });


    //=====function=====

    let currentIndex = 0;
    let imageList = [];

    //set url
    function getItemIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    //init html
    async function initItemPage() {
        const itemId = getItemIdFromUrl();
        if (!itemId) return;

        const item = await fetchItemById(itemId);
        if (!item) return;

        renderItem(item);
        initCarousel(item.image);
        initThumbnailClick();
    }

    //fetch data
    async function fetchItemById(id) {
        try {
            const res = await fetch("/src/data/items.json");
            if (!res.ok) throw new Error("Failed to load items.json");

            const items = await res.json();
            return items.find(item => item.id === Number(id));

        } catch (err) {
            console.error(err);
            return null;
        }
    }

    //render item-buy
    function renderItem(item) {
        document.getElementById("item-brand").textContent = item.brand;
        document.getElementById("item-name").textContent = item.name;
        document.getElementById("item-price").textContent = `$${item.price}`;

        const reviewEl = document.getElementById("review");

        if (reviewEl) {
            const maxStars = 5;
            const rating = Number(item.review) || 0;

            reviewEl.innerHTML = "";

            for (let i = 1; i <= maxStars; i++) {
                const star = document.createElement("span");
                star.className = "review-star";

                star.innerHTML =
                    i <= rating
                        ? `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>`
                        : `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
                        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
                        </svg>`;

                reviewEl.appendChild(star);
            };
            
            const scoreText = document.createElement("span");
            scoreText.className = "review-score";
            scoreText.textContent = `${rating} / ${maxStars}`;

            reviewEl.appendChild(scoreText);
        }

        const mainImg = document.querySelector(".item-img-carousel-main");
        if (mainImg && item.image?.length) {
            mainImg.src = item.image[0];
        }

        const imgList = document.querySelector(".item-img-list");
        if (imgList && item.image?.length) {
            imgList.innerHTML = "";
            item.image.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.dataset.index = index;
                img.className = "item-img-carousel-sub";
                img.loading = "lazy";
                imgList.appendChild(img);
            });
        }

        const addToCartBtn = document.getElementById("add-to-cart-btn");

        if (addToCartBtn && item.stock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = "Out of Stock";
            addToCartBtn.classList.add("btn-disabled");
        }

        const specEl = document.querySelector(".item-spec");
        if (specEl) {
            specEl.innerHTML = `
            <div class="spec-block">
                <h4>Description</h4>
                <p class="spec-desc">${item.description}</p>
            </div>

            <div class="spec-block">
                <h4>Measurements</h4>
                <ul class="spec-measure">
                    <li><span>Width</span><span>${item.measurements[0].max_width} mm</span></li>
                    <li><span>Depth</span><span>${item.measurements[0].max_depth} mm</span></li>
                    <li><span>Height</span><span>${item.measurements[0].max_height} mm</span></li>
                </ul>
            </div>
        `;
        }
    }

    function initCarousel(images) {
        imageList = images || [];
        currentIndex = 0;

        const mainImg = document.querySelector(".item-img-carousel-main");
        if (mainImg && imageList.length > 0) {
            mainImg.src = imageList[currentIndex];
        }

        initCarouselControls();
    }

    function initCarouselControls() {
        document.getElementById("prev-btn")?.addEventListener("click", () => {
            showImage(currentIndex - 1);
        });

        document.getElementById("next-btn")?.addEventListener("click", () => {
            showImage(currentIndex + 1);
        });
    }

    function showImage(index) {
        const mainImg = document.querySelector(".item-img-carousel-main");
        if (!mainImg || imageList.length === 0) return;

        const nextIndex = (index + imageList.length) % imageList.length;

        if (nextIndex === currentIndex) return;

        mainImg.classList.add("is-fading");

        setTimeout(() => {
            currentIndex = nextIndex;
            mainImg.src = imageList[currentIndex];

            mainImg.classList.remove("is-fading");
        }, 200);
    }

    function initThumbnailClick() {
        document.querySelector(".item-img-list")?.addEventListener("click", (e) => {
            if (e.target.classList.contains("item-img-carousel-sub")) {
                const index = Number(e.target.dataset.index);
                showImage(index);
            }
        });
    }

    //=====Run function=====
    initItemPage();

})