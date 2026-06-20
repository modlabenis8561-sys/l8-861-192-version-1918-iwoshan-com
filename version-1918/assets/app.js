(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initCardFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-card-filter]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var count = scope.querySelector("[data-filter-count]");
      var container = scope.parentElement;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

      function update() {
        var query = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.textContent
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var show = matchesQuery && matchesYear && matchesType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "显示 " + visible + " 部";
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });
      update();
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
      "  <a class=\"card-cover\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">" +
      "    <img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "    <span class=\"card-play\">▶</span>" +
      "    <span class=\"card-duration\">" + escapeHtml(item.duration) + "</span>" +
      "  </a>" +
      "  <div class=\"card-body\">" +
      "    <a class=\"card-category\" href=\"" + escapeHtml(item.categoryUrl) + "\">" + escapeHtml(item.categoryName) + "</a>" +
      "    <h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "    <p>" + escapeHtml(item.oneLine) + "</p>" +
      "    <div class=\"card-tags\">" + tags + "</div>" +
      "    <div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "  </div>" +
      "</article>";
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var category = page.querySelector("[data-search-category]");
    var summary = page.querySelector("[data-search-summary]");
    var results = page.querySelector("[data-search-results]");
    var initialQuery = getQueryParam("q");
    if (input) {
      input.value = initialQuery;
    }

    function render() {
      var query = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.categoryName,
          item.oneLine,
          (item.tags || []).join(" ")
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesCategory = !categoryValue || normalize(item.categorySlug) === categoryValue;
        return matchesQuery && matchesCategory;
      });
      var limited = matched.slice(0, 120);
      if (summary) {
        summary.textContent = "找到 " + matched.length + " 部影片" + (matched.length > limited.length ? "，当前展示前 " + limited.length + " 部" : "");
      }
      if (results) {
        results.innerHTML = limited.map(createSearchCard).join("");
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
        var params = new URLSearchParams(window.location.search);
        if (input && input.value) {
          params.set("q", input.value);
        } else {
          params.delete("q");
        }
        var nextUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
        window.history.replaceState({}, "", nextUrl);
      });
    }
    [input, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  function initPlayer() {
    var video = document.querySelector("[data-video-player]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-src");
    var frame = video.closest(".player-frame");
    var playButton = document.querySelector("[data-play-button]");
    var hls = null;

    function attachSource() {
      if (!source) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSourceOnce();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    var attached = false;
    function attachSourceOnce() {
      if (attached) {
        return;
      }
      attached = true;
      attachSource();
    }

    if (playButton) {
      playButton.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      attachSourceOnce();
    });
    video.addEventListener("play", function () {
      if (frame) {
        frame.classList.add("is-playing");
      }
    });
    video.addEventListener("pause", function () {
      if (frame) {
        frame.classList.remove("is-playing");
      }
    });
    video.addEventListener("loadedmetadata", function () {
      if (frame) {
        frame.classList.add("is-ready");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
    attachSourceOnce();
  }

  ready(function () {
    initNavigation();
    initHeroSlider();
    initCardFilters();
    initSearchPage();
    initPlayer();
  });
})();
