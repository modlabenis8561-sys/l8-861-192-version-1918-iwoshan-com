(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var topButton = document.querySelector('[data-back-top]');

    if (topButton) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                topButton.classList.add('is-visible');
            } else {
                topButton.classList.remove('is-visible');
            }
        });

        topButton.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');

    if (filterForm) {
        var searchInput = filterForm.querySelector('[data-filter-search]');
        var genreSelect = filterForm.querySelector('[data-filter-genre]');
        var yearSelect = filterForm.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function normalize(text) {
            return String(text || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var genre = normalize(genreSelect ? genreSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var region = normalize(card.getAttribute('data-region'));
                var tags = normalize(card.getAttribute('data-tags'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var text = title + ' ' + cardGenre + ' ' + region + ' ' + tags + ' ' + cardYear;
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedGenre = !genre || cardGenre.indexOf(genre) !== -1 || tags.indexOf(genre) !== -1;
                var matchedYear = !year || cardYear === year;
                var matched = matchedQuery && matchedGenre && matchedYear;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            filterForm.addEventListener(eventName, applyFilters);
        });

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });

        applyFilters();
    }
}());

function initMoviePlayer(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var attached = false;
    var hlsPlayer = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                maxBufferLength: 60,
                enableWorker: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
            attached = true;
            return;
        }

        video.src = streamUrl;
        attached = true;
    }

    function startPlayback() {
        attachStream();
        overlay.classList.add('is-hidden');
        video.controls = true;

        var playback = video.play();

        if (playback && typeof playback.catch === 'function') {
            playback.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
