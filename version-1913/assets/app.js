(function () {
    var body = document.body;
    var toggle = document.querySelector('.menu-toggle');

    if (toggle) {
        toggle.addEventListener('click', function () {
            var opened = body.classList.toggle('mobile-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var active = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === active);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide(active + 1);
        }, 5000);
    }

    setSlide(0);

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        var empty = document.querySelector('.empty-state');

        if (!input && !typeSelect && !yearSelect) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        function apply() {
            var text = normalize(input ? input.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.keywords
                ].join(' '));
                var matchText = !text || haystack.indexOf(text) > -1;
                var matchType = !type || normalize(card.dataset.type).indexOf(type) > -1;
                var matchYear = !year || normalize(card.dataset.year) === year;
                var show = matchText && matchType && matchYear;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }

        apply();
    }

    setupFilters();
})();
