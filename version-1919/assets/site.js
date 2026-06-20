(() => {
    const header = document.querySelector("[data-site-header]");
    const toggle = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", () => {
            panel.classList.toggle("open");
        });
    }

    if (header) {
        const updateHeader = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 12);
        };
        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;
        let timer = null;

        const showSlide = index => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        const startTimer = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(current + 1), 5200);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    const filters = Array.from(document.querySelectorAll("[data-movie-filter]"));
    filters.forEach(panel => {
        const search = panel.querySelector("[data-filter-search]");
        const genre = panel.querySelector("[data-filter-genre]");
        const region = panel.querySelector("[data-filter-region]");
        const year = panel.querySelector("[data-filter-year]");
        const sort = panel.querySelector("[data-filter-sort]");
        const count = panel.querySelector("[data-visible-count]");
        const list = document.querySelector("[data-card-list]");
        const empty = document.querySelector("[data-empty-state]");

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll(".movie-card"));
        const params = new URLSearchParams(window.location.search);
        const queryValue = params.get("q") || "";

        if (search && queryValue) {
            search.value = queryValue;
        }

        const normalize = value => (value || "").toString().trim().toLowerCase();

        const applyFilters = () => {
            const q = normalize(search ? search.value : "");
            const g = normalize(genre ? genre.value : "");
            const r = normalize(region ? region.value : "");
            const y = normalize(year ? year.value : "");
            const sorted = [...cards];

            sorted.sort((a, b) => {
                const mode = sort ? sort.value : "default";
                const yearA = parseInt(a.dataset.year || "0", 10) || 0;
                const yearB = parseInt(b.dataset.year || "0", 10) || 0;
                if (mode === "year-desc") {
                    return yearB - yearA;
                }
                if (mode === "year-asc") {
                    return yearA - yearB;
                }
                if (mode === "title") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }
                return cards.indexOf(a) - cards.indexOf(b);
            });

            sorted.forEach(card => list.appendChild(card));

            let visible = 0;
            cards.forEach(card => {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.innerText
                ].join(" "));
                const matched = (!q || text.includes(q)) &&
                    (!g || normalize(card.dataset.genre) === g) &&
                    (!r || normalize(card.dataset.region) === r) &&
                    (!y || normalize(card.dataset.year) === y);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        };

        [search, genre, region, year, sort].forEach(element => {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });
})();
