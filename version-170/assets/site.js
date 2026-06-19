(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(nextSlide, 5600);
        }

        var prev = carousel.querySelector('[data-prev]');
        var next = carousel.querySelector('[data-next]');
        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                nextSlide();
                restart();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });
        restart();
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = (params.get('q') || '').trim();
    var pageSearch = document.querySelector('.page-search');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var status = document.querySelector('.search-status');
    var activeFilter = '';

    if (pageSearch && queryFromUrl) {
        pageSearch.value = queryFromUrl;
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = pageSearch ? normalizeText(pageSearch.value.trim()) : '';
        var matched = 0;

        cards.forEach(function(card) {
            var searchText = normalizeText(card.getAttribute('data-search'));
            var typeText = normalizeText(card.getAttribute('data-type'));
            var okKeyword = !keyword || searchText.indexOf(keyword) !== -1;
            var okType = !activeFilter || typeText.indexOf(normalizeText(activeFilter)) !== -1;
            var visible = okKeyword && okType;
            card.classList.toggle('is-hidden', !visible);
            if (visible) {
                matched += 1;
            }
        });

        if (status) {
            status.textContent = matched ? '已为你筛选出匹配内容' : '没有找到匹配内容';
        }
    }

    if (pageSearch) {
        pageSearch.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            filterButtons.forEach(function(item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            activeFilter = button.getAttribute('data-filter') || '';
            applyFilters();
        });
    });

    if (cards.length && (pageSearch || filterButtons.length)) {
        applyFilters();
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');
        var stream = shell.getAttribute('data-stream');
        var hlsInstance;

        function attach() {
            if (!video || !stream) {
                return;
            }
            if (video.getAttribute('data-ready') !== '1') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    shell._hls = hlsInstance;
                } else {
                    video.src = stream;
                }
                video.setAttribute('data-ready', '1');
            }
            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {});
            }
        }

        if (button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                attach();
            });
        }

        shell.addEventListener('click', function(event) {
            if (event.target === video && video.getAttribute('data-ready') === '1') {
                return;
            }
            attach();
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
})();
