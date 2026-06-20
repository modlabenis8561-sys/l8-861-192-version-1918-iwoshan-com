(function() {
    var navButton = document.querySelector('.nav-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (navButton && mobilePanel) {
        navButton.addEventListener('click', function() {
            var expanded = navButton.getAttribute('aria-expanded') === 'true';
            navButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    var topButton = document.querySelector('.back-to-top');

    if (topButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 320) {
                topButton.classList.add('is-visible');
            } else {
                topButton.classList.remove('is-visible');
            }
        });

        topButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        var showSlide = function(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(nextIndex);
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function() {
                    showSlide(current + 1);
                }, 5500);
            });
        });

        if (slides.length > 1) {
            timer = setInterval(function() {
                showSlide(current + 1);
            }, 5500);
        }
    }

    var searchGrid = document.querySelector('[data-search-grid]');

    if (searchGrid) {
        var searchInput = document.querySelector('[data-search-input]');
        var emptyState = document.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
        var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var params = new URLSearchParams(window.location.search);
        var activeFilter = 'all';

        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }

        var applySearch = function() {
            var value = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var visibleCount = 0;

            cards.forEach(function(card) {
                var text = card.getAttribute('data-search') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var matchedText = !value || text.indexOf(value) !== -1;
                var matchedCategory = activeFilter === 'all' || activeFilter === cardCategory;
                var visible = matchedText && matchedCategory;
                card.hidden = !visible;

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        };

        filters.forEach(function(button) {
            button.addEventListener('click', function() {
                activeFilter = button.getAttribute('data-filter') || 'all';
                filters.forEach(function(item) {
                    item.classList.toggle('is-active', item === button);
                });
                applySearch();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', applySearch);
        }

        applySearch();
    }
})();

function initMoviePlayer(url) {
    var video = document.querySelector('[data-player-video]');
    var layer = document.querySelector('[data-player-layer]');
    var hlsInstance = null;
    var ready = false;

    if (!video || !url) {
        return;
    }

    var attach = function() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            ready = true;
            return;
        }

        video.src = url;
        ready = true;
    };

    var play = function() {
        attach();
        video.controls = true;

        if (layer) {
            layer.classList.add('is-hidden');
        }

        var playTask = video.play();

        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function() {
                video.controls = true;
            });
        }
    };

    if (layer) {
        layer.addEventListener('click', play);
    }

    video.addEventListener('click', function() {
        if (video.paused) {
            play();
        }
    });

    window.addEventListener('beforeunload', function() {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
}
