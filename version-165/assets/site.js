(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5200);
    show(0);
  }

  function setupSearchForms() {
    Array.prototype.slice
      .call(document.querySelectorAll("[data-search-form]"))
      .forEach(function (form) {
        form.addEventListener("submit", function (event) {
          var input = form.querySelector("input[name='q']");
          if (!input || !input.value.trim()) {
            event.preventDefault();
            return;
          }
        });
      });
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-title]"),
    );
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
        ]
          .join(" ")
          .toLowerCase();
        card.style.display =
          !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
      });
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
      '<img src="./' +
        escapeHtml(movie.cover) +
        '.jpg" alt="' +
        escapeHtml(movie.title) +
        '" loading="lazy">',
      '<span class="duration">' + escapeHtml(movie.duration) + "</span>",
      "</a>",
      '<div class="movie-info">',
      '<a class="movie-title" href="' +
        escapeHtml(movie.url) +
        '">' +
        escapeHtml(movie.title) +
        "</a>",
      "<p>" + escapeHtml(movie.description) + "</p>",
      '<div class="movie-meta"><span>' +
        escapeHtml(movie.year) +
        "</span><span>" +
        escapeHtml(movie.region) +
        "</span><span>" +
        escapeHtml(movie.type) +
        "</span></div>",
      '<div class="tag-row"><span>' + escapeHtml(movie.genre) + "</span></div>",
      "</div>",
      "</article>",
    ].join("");
  }

  function setupSearchPage() {
    var resultBox = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    if (!resultBox || !input || !window.SiteSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function run(keyword) {
      var text = keyword.trim().toLowerCase();
      if (!text) {
        resultBox.innerHTML =
          '<div class="empty-note">输入片名、类型、地区或年份即可查找内容。</div>';
        return;
      }
      var list = window.SiteSearchIndex.filter(function (movie) {
        return (
          [
            movie.title,
            movie.description,
            movie.genre,
            movie.region,
            movie.type,
            movie.year,
          ]
            .join(" ")
            .toLowerCase()
            .indexOf(text) !== -1
        );
      }).slice(0, 120);
      if (!list.length) {
        resultBox.innerHTML =
          '<div class="empty-note">没有找到匹配内容。</div>';
        return;
      }
      resultBox.innerHTML =
        '<div class="movie-grid">' + list.map(cardTemplate).join("") + "</div>";
    }
    input.addEventListener("input", function () {
      run(input.value);
    });
    run(initial);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupSearchPage();
  });
})();
