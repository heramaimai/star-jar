const audioCache = {};

export function playSound(name, options = {}) {
  const { volume = 0.4, restart = true } = options;

  const src = `/sounds/${name}.mp3`;

  if (!audioCache[name]) {
    audioCache[name] = new Audio(src);
  }

  const audio = audioCache[name];
  audio.volume = volume;

  if (restart) {
    audio.pause();
    audio.currentTime = 0;
  }

  audio.play().catch(() => {});
}
