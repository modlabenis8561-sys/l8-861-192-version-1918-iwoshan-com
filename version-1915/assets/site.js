(function() {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileNav() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function() {
      nav.classList.toggle('open');
      button.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function filterCards(term) {
    var query = normalize(term);
    selectAll('[data-movie-card]').forEach(function(card) {
      var text = normalize(card.getAttribute('data-search'));
      card.hidden = query && text.indexOf(query) === -1;
    });
  }

  function initSearchInputs() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    selectAll('[data-search-input]').forEach(function(input) {
      if (q && !input.value) {
        input.value = q;
      }
      input.addEventListener('input', function() {
        filterCards(input.value);
      });
    });
    if (q) {
      filterCards(q);
    }
  }

  function initFilterChips() {
    selectAll('[data-filter-bar]').forEach(function(bar) {
      var chips = selectAll('[data-filter]', bar);
      chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          chips.forEach(function(item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          var filter = chip.getAttribute('data-filter') || '';
          if (filter === '全部') {
            filterCards('');
          } else {
            filterCards(filter);
          }
        });
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  window.initMoviePlayer = function(videoUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var started = false;
    var hlsPlayer = null;

    if (!video) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsPlayer.loadSource(videoUrl);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function begin() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {});
      }
    }

    if (cover) {
      cover.addEventListener('click', begin);
    }

    video.addEventListener('click', function() {
      if (!started) {
        begin();
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hlsPlayer && typeof hlsPlayer.destroy === 'function') {
        hlsPlayer.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    initMobileNav();
    initSearchInputs();
    initFilterChips();
    initHero();
  });
})();
