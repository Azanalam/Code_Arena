export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("codearena_muted") === "1";
}

export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("codearena_muted", muted ? "1" : "0");
}

let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine") {
  if (isMuted()) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {}
}

export function playSubmit() {
  playTone(660, 0.08, "square");
}

export function playPass() {
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 120);
  setTimeout(() => playTone(784, 0.2), 240);
}

export function playFail() {
  playTone(400, 0.2, "sawtooth");
}

export function playGameOver() {
  playTone(440, 0.3);
  setTimeout(() => playTone(349, 0.3), 300);
  setTimeout(() => playTone(262, 0.5), 600);
}
