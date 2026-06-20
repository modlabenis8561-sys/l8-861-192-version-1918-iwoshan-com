(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dots button'));
    var index = 0;
    var show = function (next) {
      slides[index].classList.remove('is-active');
      dots[index].classList.remove('is-active');
      index = next;
      slides[index].classList.add('is-active');
      dots[index].classList.add('is-active');
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5600);
    }
  }

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  document.querySelectorAll('.filter-scope').forEach(function (scope) {
    var input = scope.querySelector('.filter-input');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('.filter-select'));
    var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-item'));
    var empty = scope.querySelector('.empty-state');
    var apply = function () {
      var query = normalize(input ? input.value : '');
      var visible = 0;
      items.forEach(function (item) {
        var text = normalize(item.getAttribute('data-filter-text'));
        var ok = !query || text.indexOf(query) > -1;
        selects.forEach(function (select) {
          var selected = normalize(select.value);
          if (!selected) {
            return;
          }
          var field = select.getAttribute('data-filter-field');
          var current = normalize(item.getAttribute('data-' + field));
          if (current.indexOf(selected) === -1) {
            ok = false;
          }
        });
        item.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    apply();
  });
})();
