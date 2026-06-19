(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var stream = options.stream;
    var hlsInstance = null;
    if (!video || !stream) {
      return;
    }
    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = stream;
        }
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = stream;
      }
      return Promise.resolve();
    }
    function play() {
      attach().then(function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            video.setAttribute("controls", "controls");
          });
        }
      });
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
  }
  window.initMoviePlayer = initMoviePlayer;
})();
