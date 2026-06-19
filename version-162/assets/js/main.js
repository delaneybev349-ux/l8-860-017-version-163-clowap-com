(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function() {
        showHero(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showHero(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showHero(current + 1);
        startHero();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();

    document.querySelectorAll('.rail-section').forEach(function(section) {
      var rail = section.querySelector('[data-rail]');
      var left = section.querySelector('[data-scroll-left]');
      var right = section.querySelector('[data-scroll-right]');

      if (rail && left) {
        left.addEventListener('click', function() {
          rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }

      if (rail && right) {
        right.addEventListener('click', function() {
          rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterInput && filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
      filterInput.addEventListener('input', function() {
        var keyword = filterInput.value.trim().toLowerCase();
        cards.forEach(function(card) {
          var haystack = card.getAttribute('data-search') || '';
          card.classList.toggle('is-filtered-out', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    }

    var searchForm = document.querySelector('[data-search-page-form]');
    var searchResults = document.querySelector('[data-search-results]');

    if (searchForm && searchResults && window.SITE_MOVIES) {
      var input = searchForm.querySelector('input[name="q"]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';

      if (input) {
        input.value = initial;
      }

      function renderSearch(query) {
        var keyword = query.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (!keyword) {
          var idle = document.createElement('div');
          idle.className = 'empty-state';
          idle.textContent = '输入关键词即可查找片库内容。';
          searchResults.appendChild(idle);
          return;
        }

        var matches = window.SITE_MOVIES.filter(function(movie) {
          return movie.search.indexOf(keyword) !== -1;
        }).slice(0, 80);

        if (!matches.length) {
          var empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.textContent = '没有找到匹配内容，可尝试更换片名、类型或年份。';
          searchResults.appendChild(empty);
          return;
        }

        matches.forEach(function(movie) {
          var card = document.createElement('article');
          card.className = 'search-result-card';

          var imageLink = document.createElement('a');
          imageLink.href = movie.url;
          var image = document.createElement('img');
          image.src = movie.cover;
          image.alt = movie.title;
          image.loading = 'lazy';
          imageLink.appendChild(image);

          var body = document.createElement('div');
          var title = document.createElement('h2');
          var titleLink = document.createElement('a');
          titleLink.href = movie.url;
          titleLink.textContent = movie.title;
          title.appendChild(titleLink);

          var desc = document.createElement('p');
          desc.textContent = movie.oneLine || movie.genre;

          var meta = document.createElement('div');
          meta.className = 'card-meta';
          [movie.category, movie.type, movie.year].forEach(function(item) {
            var span = document.createElement('span');
            span.textContent = item;
            meta.appendChild(span);
          });

          body.appendChild(title);
          body.appendChild(desc);
          body.appendChild(meta);
          card.appendChild(imageLink);
          card.appendChild(body);
          searchResults.appendChild(card);
        });
      }

      searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var value = input ? input.value : '';
        var url = './search.html?q=' + encodeURIComponent(value);
        window.history.replaceState({}, '', url);
        renderSearch(value);
      });

      renderSearch(initial);
    }
  });
}());
