(function () {
  function setupPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var cover = box.querySelector('[data-player-cover]');
    var status = box.querySelector('[data-player-status]');
    var source = video ? video.getAttribute('data-source') : '';
    var hlsReady = false;

    if (!video || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function loadSource() {
      if (hlsReady) {
        return Promise.resolve();
      }
      hlsReady = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('视频加载异常，请刷新重试');
          }
        });
        box._hls = hls;
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      setStatus('播放环境暂不可用');
      return Promise.reject(new Error('playback unavailable'));
    }

    function play() {
      loadSource().then(function () {
        return video.play();
      }).then(function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      }).catch(function () {
        setStatus('点击播放器可再次尝试');
      });
    }

    button && button.addEventListener('click', play);
    cover && cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && cover) {
        cover.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
