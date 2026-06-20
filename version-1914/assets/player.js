(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var url = shell.getAttribute("data-video");
            var started = false;
            var hlsInstance = null;

            function playVideo() {
                if (!video || !url) {
                    return;
                }

                shell.classList.add("is-playing");

                if (!started) {
                    started = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = url;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(url);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = url;
                    }
                }

                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", playVideo);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        playVideo();
                    }
                });
                video.addEventListener("error", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            }
        });
    });
})();
