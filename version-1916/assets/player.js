import { H as Hls } from './hls.esm.js';

const m3u8Urls = [
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8"
];

const setStatus = (player, message) => {
  const status = player.querySelector('[data-player-status]');

  if (status) {
    status.textContent = message;
  }
};

const getSource = (player) => {
  const directSource = player.dataset.source;
  const index = Number.parseInt(player.dataset.m3u8Index || '0', 10);

  if (directSource) {
    return directSource;
  }

  if (!m3u8Urls.length) {
    return '';
  }

  return m3u8Urls[index % m3u8Urls.length];
};

const startPlayer = (player) => {
  const video = player.querySelector('video');
  const cover = player.querySelector('[data-play-button]');
  const source = getSource(player);

  if (!video || !source) {
    setStatus(player, '当前播放源暂不可用');
    return;
  }

  if (player.dataset.ready === 'true') {
    video.play().catch(() => setStatus(player, '请再次点击视频区域继续播放'));
    return;
  }

  player.dataset.ready = 'true';
  setStatus(player, '高清线路加载中');

  if (cover) {
    cover.classList.add('hidden');
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(() => setStatus(player, '点击视频区域继续播放'));
    }, { once: true });
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setStatus(player, '播放源已就绪');
      video.play().catch(() => setStatus(player, '点击视频区域继续播放'));
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data && data.fatal) {
        setStatus(player, '播放线路加载失败，请刷新后重试');
      }
    });
    return;
  }

  video.src = source;
  video.play().catch(() => setStatus(player, '当前浏览器需要手动点击播放'));
};

document.querySelectorAll('[data-player]').forEach((player) => {
  const button = player.querySelector('[data-play-button]');
  const video = player.querySelector('video');

  if (button) {
    button.addEventListener('click', () => startPlayer(player));
  }

  if (video) {
    video.addEventListener('click', () => startPlayer(player));
  }
});
