document.addEventListener("DOMContentLoaded", () => {

    let carouselItems = [];
    let carouselItemsAll = [];
    let currentIndex = 0;

    //prev / next carousel
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const carouselContainer = document.querySelector(".carousel-contanier");
    let isFading = false;

    prevBtn.addEventListener("click", () => {
        if (isFading || carouselItems.length === 0) return;

        isFading = true;
        carouselContainer.classList.add("fading");

        setTimeout(() => {
            currentIndex =
                (currentIndex - 1 + carouselItems.length) % carouselItems.length;

            renderCarousel();
            carouselContainer.classList.remove("fading");
            isFading = false;
        }, 400);
    });

    nextBtn.addEventListener("click", () => {
        if (isFading || carouselItems.length === 0) return;

        isFading = true;
        carouselContainer.classList.add("fading");

        setTimeout(() => {
            currentIndex =
                (currentIndex + 1) % carouselItems.length;

            renderCarousel();
            carouselContainer.classList.remove("fading");
            isFading = false;
        }, 400);
    });

    //Random btn
    const randomBtn = document.querySelector(".carousel-random-btn");

    randomBtn.addEventListener("click", () => {
        if (isFading) return;

        isFading = true;
        randomBtn.classList.add("spin");
        carouselContainer.classList.add("fading");

        setTimeout(() => {
            carouselItems = pickRandomItems(carouselItemsAll, 5);
            currentIndex = 0;
            renderCarousel();
            carouselContainer.classList.remove("fading");
            randomBtn.classList.remove("spin");
            isFading = false;
        }, 400);
    });
    //=====function=====
    //fetch data
    async function fetchCarouselItems() {
        try {
            const res = await fetch("/src/data/items.json");
            if (!res.ok) throw new Error("Failed to fetch items");

            const items = await res.json();

            carouselItemsAll = items;
            carouselItems = pickRandomItems(items, 5);
            currentIndex = 0;

            renderCarousel();
        } catch (err) {
            console.error(err);
        }
    }

    //render carousel
    function renderCarousel() {
        if (carouselItems.length === 0) return;

        const total = carouselItems.length;

        const prevIndex = (currentIndex - 1 + total) % total;
        const nextIndex = (currentIndex + 1) % total;

        const prevItem = carouselItems[prevIndex];
        const currentItem = carouselItems[currentIndex];
        const nextItem = carouselItems[nextIndex];

        /* before */
        document.querySelector(".item-carousel.before img").src =
            prevItem.image[0];

        /* now */
        document.querySelector(".item-carousel.now .item-img-carousel-main").src =
            currentItem.image[0];

        document.querySelector(".carousel-brand").textContent =
            currentItem.brand;

        document.querySelector(".carousel-name").textContent =
            currentItem.name;

        document.querySelector(".buy-link").href =
            `/shop/item.html?id=${currentItem.id}`;

        /* after */
        document.querySelector(".item-carousel.after img").src =
            nextItem.image[0];
    }

    function pickRandomItems(items, count) {
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    fetchCarouselItems()
});