(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    const start = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
    const rail = wrap.querySelector('[data-rail]');
    const left = wrap.querySelector('[data-scroll-left]');
    const right = wrap.querySelector('[data-scroll-right]');

    if (!rail) {
      return;
    }

    if (left) {
      left.addEventListener('click', function () {
        rail.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        rail.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  const normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  const runFilter = function (root, query) {
    const grid = root.querySelector('[data-filter-grid]');
    const empty = root.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    const q = normalize(query);
    let visible = 0;

    grid.querySelectorAll('[data-search-item]').forEach(function (item) {
      const text = normalize([
        item.dataset.title,
        item.dataset.region,
        item.dataset.year,
        item.dataset.genre,
        item.dataset.tags,
        item.textContent
      ].join(' '));
      const matched = !q || text.indexOf(q) !== -1;
      item.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  document.querySelectorAll('[data-local-filter], [data-search-page]').forEach(function (form) {
    const root = form.closest('main') || document;
    const input = form.querySelector('[data-local-input]');

    if (!input) {
      return;
    }

    if (form.matches('[data-search-page]')) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q') || '';
      input.value = query;
      runFilter(root, query);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter(root, input.value);
    });

    input.addEventListener('input', function () {
      runFilter(root, input.value);
    });
  });

  document.querySelectorAll('[data-filter-token]').forEach(function (button) {
    button.addEventListener('click', function () {
      const root = button.closest('main') || document;
      const input = root.querySelector('[data-local-input]');
      const value = button.dataset.filterToken || '';

      root.querySelectorAll('[data-filter-token]').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      if (input) {
        input.value = value;
      }

      runFilter(root, value);
    });
  });

  const shell = document.querySelector('[data-player]');

  if (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    let initialized = false;
    let hlsInstance = null;

    const playVideo = function () {
      if (!video) {
        return;
      }

      const stream = video.dataset.stream;

      if (!stream) {
        return;
      }

      if (!initialized) {
        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      shell.classList.add('is-playing');
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
