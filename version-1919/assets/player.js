import { H as Hls } from "./hls-vendor-dru42stk.js";

const roots = Array.from(document.querySelectorAll("[data-player]"));

roots.forEach(root => {
    const video = root.querySelector("video");
    const button = root.querySelector("#player-start");
    const message = root.querySelector("[data-player-message]");
    const source = root.dataset.source;
    let hls = null;
    let ready = false;

    const showMessage = text => {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add("show");
    };

    const prepareSource = () => {
        if (ready || !video || !source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            ready = true;
            return;
        }
        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    showMessage("播放暂时不可用，请稍后重试");
                    if (hls) {
                        hls.destroy();
                        hls = null;
                    }
                    ready = false;
                }
            });
            ready = true;
            return;
        }
        showMessage("当前浏览器暂不支持此播放格式");
    };

    const start = () => {
        prepareSource();
        if (!video || !ready) {
            return;
        }
        root.classList.add("is-playing");
        video.controls = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                showMessage("请再次点击播放按钮开始播放");
                root.classList.remove("is-playing");
            });
        }
    };

    if (button) {
        button.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            }
        });
    }
});
