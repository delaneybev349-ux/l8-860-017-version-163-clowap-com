(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        var button = document.querySelector(".js-menu-button");
        var menu = document.querySelector(".js-mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll(".js-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "search.html";
                if (query) {
                    window.location.href = target + "?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector(".js-hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".js-hero-prev");
        var next = hero.querySelector(".js-hero-next");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initCategoryFilter() {
        var input = document.querySelector(".js-filter-input");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var hay = (card.getAttribute("data-search") || "").toLowerCase();
                card.style.display = hay.indexOf(query) > -1 ? "" : "none";
            });
        });
    }

    function initPlayers() {
        document.querySelectorAll(".js-player").forEach(function (box) {
            var video = box.querySelector("video");
            var overlay = box.querySelector(".js-play-overlay");
            var error = box.querySelector(".js-player-error");
            var prepared = false;
            var preparing = false;
            var hlsInstance = null;

            function showError() {
                if (error) {
                    error.classList.add("is-visible");
                }
            }

            function prepare() {
                if (!video || prepared || preparing) {
                    return Promise.resolve();
                }
                preparing = true;
                var source = video.getAttribute("data-src");
                if (!source) {
                    showError();
                    return Promise.resolve();
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    prepared = true;
                    preparing = false;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        prepared = true;
                        preparing = false;
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError();
                            preparing = false;
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                        }
                    });
                    return Promise.resolve();
                }
                showError();
                preparing = false;
                return Promise.resolve();
            }

            function play() {
                prepare().then(function () {
                    var result = video.play();
                    if (result && typeof result.catch === "function") {
                        result.catch(function () {});
                    }
                });
            }

            if (overlay) {
                overlay.addEventListener("click", function () {
                    play();
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });
                video.addEventListener("pause", function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    function initSearchPage() {
        var root = document.querySelector(".js-search-page");
        if (!root || !window.SEARCH_DATA) {
            return;
        }
        var input = root.querySelector(".js-search-page-input");
        var results = root.querySelector(".js-search-results");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (input) {
            input.value = initialQuery;
        }

        function render() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var data = window.SEARCH_DATA.filter(function (movie) {
                if (!query) {
                    return movie.hot;
                }
                return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags]
                    .join(" ")
                    .toLowerCase()
                    .indexOf(query) > -1;
            }).slice(0, 96);

            if (!results) {
                return;
            }
            if (!data.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
                return;
            }
            results.innerHTML = data.map(function (movie) {
                return '<a class="movie-card" href="' + escapeHtml(movie.href) + '">' +
                    '<div class="poster-wrap">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.genreLabel) + '</span>' +
                    '<span class="poster-time">' + escapeHtml(movie.duration) + '</span>' +
                    '</div>' +
                    '<div class="movie-card-body">' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p>' + escapeHtml(movie.description) + '</p>' +
                    '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                    '</div>' +
                    '</a>';
            }).join("");
        }

        if (input) {
            input.addEventListener("input", render);
        }
        render();
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initCategoryFilter();
        initPlayers();
        initSearchPage();
    });
})();
