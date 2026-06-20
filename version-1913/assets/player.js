(function () {
    function startPlayback(video, button, source) {
        if (!video || !source) {
            return;
        }

        if (video.dataset.ready !== '1') {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                });
                video.hlsController = hls;
            } else {
                video.src = source;
            }
            video.dataset.ready = '1';
        }

        video.controls = true;
        if (button) {
            button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    window.setupMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;

        if (!video) {
            return;
        }

        if (button) {
            button.addEventListener('click', function () {
                startPlayback(video, button, source);
            });
        }

        video.addEventListener('click', function () {
            if (video.dataset.ready !== '1') {
                startPlayback(video, button, source);
            }
        });
    };
})();
