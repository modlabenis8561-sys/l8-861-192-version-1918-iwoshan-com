(function () {
  var prepare = function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.player-start');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;
    var load = function () {
      if (ready || !stream) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    };
    var start = function () {
      load();
      if (button) {
        button.classList.add('is-hidden');
      }
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    };
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
  document.querySelectorAll('[data-player]').forEach(prepare);
})();
