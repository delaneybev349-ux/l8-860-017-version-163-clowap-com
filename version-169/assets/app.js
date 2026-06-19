(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            menuButton.textContent = mobilePanel.classList.contains("is-open") ? "×" : "☰";
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const input = form.querySelector("input[name='q']");
            if (input && input.value.trim()) {
                form.action = "./search.html";
            } else {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const previous = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                showSlide(position);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const yearFilter = document.querySelector("[data-year-filter]");
    const regionFilter = document.querySelector("[data-region-filter]");
    const categoryFilter = document.querySelector("[data-category-filter]");
    const resetFilter = document.querySelector("[data-reset-filter]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const emptyState = document.querySelector("[data-empty-state]");

    function applyFilters() {
        const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
        const year = yearFilter ? yearFilter.value : "";
        const region = regionFilter ? regionFilter.value : "";
        const category = categoryFilter ? categoryFilter.value : "";
        let visible = 0;

        cards.forEach(function (card) {
            const text = card.getAttribute("data-title") || "";
            const cardYear = card.getAttribute("data-year") || "";
            const cardRegion = card.getAttribute("data-region") || "";
            const cardCategory = card.getAttribute("data-category") || "";
            const matched = (!query || text.includes(query)) &&
                (!year || cardYear === year) &&
                (!region || cardRegion === region) &&
                (!category || cardCategory === category);

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [filterInput, yearFilter, regionFilter, categoryFilter].forEach(function (element) {
        if (element) {
            element.addEventListener("input", applyFilters);
            element.addEventListener("change", applyFilters);
        }
    });

    if (resetFilter) {
        resetFilter.addEventListener("click", function () {
            [filterInput, yearFilter, regionFilter, categoryFilter].forEach(function (element) {
                if (element) {
                    element.value = "";
                }
            });
            applyFilters();
        });
    }

    const searchPageInput = document.querySelector("[data-search-page-input]");
    if (searchPageInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";
        if (query) {
            searchPageInput.value = query;
        }
        applyFilters();
    }
}());
