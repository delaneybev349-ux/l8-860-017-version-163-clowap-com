(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initLocalFilters() {
    var input = document.querySelector(".local-search");
    var select = document.querySelector(".type-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    if (!cards.length || (!input && !select)) {
      return;
    }
    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var type = select ? select.value.trim() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var typeOk = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type.toLowerCase()) !== -1;
        card.classList.toggle("hidden-by-filter", !(keywordOk && typeOk));
      });
    }
    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applyFilter);
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".watch-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var source = player.getAttribute("data-src");
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }
      function attachSource() {
        if (video.getAttribute("data-source-attached") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.setAttribute("data-source-attached", "1");
      }
      function startPlayback() {
        attachSource();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }
      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        startPlayback();
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.add("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function cardHtml(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.join(" ") : "";
    return "" +
      "<article class=\"movie-card searchable-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-tags=\"" + escapeHtml(tags) + "\">" +
      "<a href=\"" + escapeHtml(movie.href) + "\" class=\"card-link\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
      "<div class=\"card-cover\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"type-badge\">" + escapeHtml(movie.type) + "</span><span class=\"card-play\">▶</span></div>" +
      "<div class=\"card-content\"><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"card-meta\"><span>" + escapeHtml(movie.genre) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div></div>" +
      "</a></article>";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var container = document.getElementById("search-results");
    var input = document.getElementById("site-search-input");
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!container || !input || !data.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var query = input.value.trim().toLowerCase();
      var results = data.filter(function (movie) {
        if (!query) {
          return true;
        }
        var haystack = [
          movie.title,
          movie.oneLine,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          Array.isArray(movie.tags) ? movie.tags.join(" ") : ""
        ].join(" ").toLowerCase();
        return haystack.indexOf(query) !== -1;
      }).slice(0, 160);
      container.innerHTML = results.map(cardHtml).join("");
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });
})();
