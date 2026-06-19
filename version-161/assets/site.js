(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      target.classList.add("image-empty");
    }
  }, true);

  var menuButton = $("[data-menu-button]");
  var mobileMenu = $("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  $all("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (value) {
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      }
    });
  });

  var hero = $("[data-hero]");
  if (hero) {
    var slides = $all(".hero-slide", hero);
    var dots = $all("[data-hero-dot]", hero);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  $all("[data-local-filter]").forEach(function (form) {
    var input = form.querySelector("input");
    var list = $("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      $all(".movie-card", list).forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-genre") || "",
          item.textContent || ""
        ].join(" ").toLowerCase();
        item.style.display = haystack.indexOf(query) >= 0 ? "" : "none";
      });
    });
  });

  function createResult(movie) {
    var article = document.createElement("article");
    article.className = "movie-card movie-card-horizontal";
    article.innerHTML = "" +
      "<a class=\"movie-thumb\" href=\"" + movie.file + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>" +
      "<span class=\"movie-play\">▶</span>" +
      "</a>" +
      "<div class=\"movie-info\">" +
      "<a href=\"" + movie.file + "\"><h3>" + escapeHtml(movie.title) + "</h3></a>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
      "</div>";
    return article;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  var resultsBox = $("#search-results");
  if (resultsBox && window.movieIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var pageInput = $("[data-search-page-input]");
    if (pageInput) {
      pageInput.value = query;
    }
    if (!query) {
      resultsBox.innerHTML = "<div class=\"search-empty\">输入关键词查找影片。</div>";
    } else {
      var words = query.toLowerCase().split(/\s+/).filter(Boolean);
      var matches = window.movieIndex.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine].join(" ").toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) >= 0;
        });
      }).slice(0, 120);
      resultsBox.innerHTML = "";
      if (!matches.length) {
        resultsBox.innerHTML = "<div class=\"search-empty\">没有找到匹配影片，可尝试更换关键词。</div>";
      } else {
        matches.forEach(function (movie) {
          resultsBox.appendChild(createResult(movie));
        });
      }
    }
  }

  $all("[data-player]").forEach(function (box) {
    var video = $("video", box);
    var button = $("[data-play]", box);
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var prepared = false;
    var hls = null;

    function start() {
      if (!stream) {
        return;
      }
      box.classList.add("is-playing");
      if (!prepared) {
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
