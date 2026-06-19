(function () {
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $all(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = $all('[data-hero-slide]');
    var dots = $all('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 4800);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function uniqueSorted(values) {
    var map = {};
    values.forEach(function (value) {
      if (value) {
        map[value] = true;
      }
    });
    return Object.keys(map).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function setupLocalFilters() {
    $all('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-filter-input]', scope);
      var yearSelect = $('[data-filter-year]', scope);
      var genreSelect = $('[data-filter-genre]', scope);
      var cards = $all('[data-card]');
      if (!cards.length) {
        return;
      }

      uniqueSorted(cards.map(function (card) {
        return card.getAttribute('data-year');
      })).forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });

      uniqueSorted(cards.flatMap(function (card) {
        return String(card.getAttribute('data-genre') || '').split(/[、,，/\s]+/);
      })).slice(0, 80).forEach(function (genre) {
        var option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
      });

      function apply() {
        var keyword = normalize(input.value);
        var year = yearSelect.value;
        var genre = genreSelect.value;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.textContent
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          var matchGenre = !genre || String(card.getAttribute('data-genre') || '').indexOf(genre) !== -1;
          card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchGenre));
        });
      }

      input.addEventListener('input', apply);
      yearSelect.addEventListener('change', apply);
      genreSelect.addEventListener('change', apply);
    });
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + item.url + '">',
      '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
      '<span class="duration-badge">' + item.duration + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="card-meta-row"><a class="category-chip" href="' + item.categoryUrl + '">' + item.category + '</a><span>' + item.year + '</span></div>',
      '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
      '<p>' + item.description + '</p>',
      '<div class="mini-meta"><span>' + item.region + '</span><span>' + item.type + '</span><span>' + item.genre + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var form = $('[data-search-form]');
    var input = $('[data-search-input]');
    var results = $('[data-search-results]');
    var empty = $('[data-search-empty]');
    if (!form || !input || !results || typeof SITE_SEARCH_DATA === 'undefined') {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render() {
      var keyword = normalize(input.value);
      var list = SITE_SEARCH_DATA.filter(function (item) {
        if (!keyword) {
          return true;
        }
        return normalize([
          item.title,
          item.description,
          item.category,
          item.genre,
          item.region,
          item.type,
          item.year
        ].join(' ')).indexOf(keyword) !== -1;
      });
      results.innerHTML = list.slice(0, 240).map(cardTemplate).join('');
      empty.style.display = list.length ? 'none' : 'block';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      render();
    });
    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
})();
