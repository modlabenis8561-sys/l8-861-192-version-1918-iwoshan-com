(function () {
    var header = document.querySelector(".site-header");
    var menuButton = document.querySelector(".mobile-menu-button");

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (menuButton && header) {
        menuButton.addEventListener("click", function () {
            var opened = header.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(currentSlide - 1);
                startHeroTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(currentSlide + 1);
                startHeroTimer();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHeroTimer();
            });
        });
        startHeroTimer();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilter(bar) {
        var scope = bar.getAttribute("data-filter-scope");
        var list = document.querySelector('[data-filter-list="' + scope + '"]');
        if (!list) {
            return;
        }
        var queryInput = bar.querySelector(".filter-input");
        var selects = Array.prototype.slice.call(bar.querySelectorAll(".filter-select"));
        var query = normalize(queryInput ? queryInput.value : "");
        var selectedValues = selects.map(function (select) {
            return normalize(select.value);
        }).filter(Boolean);
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
            var haystack = normalize(card.textContent + " " + Object.values(card.dataset).join(" "));
            var queryMatched = !query || haystack.indexOf(query) !== -1;
            var selectedMatched = selectedValues.every(function (value) {
                return haystack.indexOf(value) !== -1;
            });
            card.classList.toggle("is-hidden", !(queryMatched && selectedMatched));
        });
    }

    document.querySelectorAll(".filter-bar").forEach(function (bar) {
        bar.addEventListener("input", function () {
            applyFilter(bar);
        });
        bar.addEventListener("change", function () {
            applyFilter(bar);
        });
    });

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var source = options.source;
        var hls = null;
        var started = false;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!started || video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("emptied", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
