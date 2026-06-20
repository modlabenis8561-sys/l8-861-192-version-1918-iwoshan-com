(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dots] button'));
    let index = 0;

    const showSlide = (nextIndex) => {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => showSlide(dotIndex));
    });

    window.setInterval(() => showSlide(index + 1), 5600);
  }

  document.querySelectorAll('[data-home-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');

      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'search.html';
      }
    });
  });

  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    const scope = panel.parentElement;
    const grid = scope ? scope.querySelector('[data-filter-grid]') : null;

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const searchInput = panel.querySelector('[data-search-input]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const clearButton = panel.querySelector('[data-clear-filter]');

    const params = new URLSearchParams(window.location.search);
    const incomingQuery = params.get('q');

    if (incomingQuery && searchInput) {
      searchInput.value = incomingQuery;
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const applyFilter = () => {
      const keyword = normalize(searchInput ? searchInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');

      cards.forEach((card) => {
        const title = normalize(card.dataset.title);
        const region = normalize(card.dataset.region);
        const cardYear = normalize(card.dataset.year);
        const cardType = normalize(card.dataset.type);
        const genre = normalize(card.dataset.genre);
        const haystack = `${title} ${region} ${cardYear} ${cardType} ${genre}`;
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedYear = !year || cardYear.includes(year);
        const matchedType = !type || cardType.includes(type);

        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType));
      });
    };

    [searchInput, yearSelect, typeSelect].forEach((field) => {
      if (field) {
        field.addEventListener('input', applyFilter);
        field.addEventListener('change', applyFilter);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (yearSelect) yearSelect.value = '';
        if (typeSelect) typeSelect.value = '';
        applyFilter();
      });
    }

    applyFilter();
  });
})();
