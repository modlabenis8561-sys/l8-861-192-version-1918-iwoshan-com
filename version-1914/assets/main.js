(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");

        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });

            if (slides.length > 1) {
                setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var activeFilter = "all";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : "");
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search") + " " + card.textContent);
                var filterMatched = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
                var queryMatched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle("is-hidden", !(filterMatched && queryMatched));
            });
        }

        if (input && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var queryParam = params.get("q");
            if (queryParam) {
                input.value = queryParam;
            }
            input.addEventListener("input", applyFilter);
            applyFilter();
        }

        if (filterButtons.length) {
            filterButtons.forEach(function (button, index) {
                if (index === 0) {
                    button.classList.add("is-active");
                }
                button.addEventListener("click", function () {
                    filterButtons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    activeFilter = button.getAttribute("data-filter-value") || "all";
                    applyFilter();
                });
            });
        }

        var backTop = document.querySelector("[data-back-top]");
        if (backTop) {
            backTop.addEventListener("click", function (event) {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    });
})();
