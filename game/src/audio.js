// The game's sounds, synthesized so the entry ships no audio file and loads nothing over the
// network. One job: a short cue for each thing that happens in play.
let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  const Ctor = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  return ctx;
}

function tone(freq, start, length, type = 'triangle', gain = 0.5, slideTo = null) {
  const audio = ensure();
  if (!audio || muted) return;
  const at = audio.currentTime + start;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + length);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(env);
  env.connect(master);
  osc.start(at);
  osc.stop(at + length + 0.03);
}

export const audio = {
  resume() {
    const audio = ensure();
    if (audio && audio.state === 'suspended') audio.resume();
  },
  toggle() {
    muted = !muted;
    return muted;
  },
  isMuted: () => muted,
  found(step = 0) {
    const base = 660 * 2 ** (step / 12);
    tone(base, 0, 0.16, 'triangle', 0.5);
    tone(base * 1.5, 0.07, 0.22, 'sine', 0.35);
  },
  hint() {
    tone(420, 0, 0.3, 'sine', 0.3, 720);
  },
  miss() {
    tone(180, 0, 0.16, 'square', 0.18, 120);
  },
  clear() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.42));
  },
  timeout() {
    [392, 311, 233].forEach((f, i) => tone(f, i * 0.16, 0.42, 'sawtooth', 0.25));
  },
  tick() {
    tone(880, 0, 0.06, 'sine', 0.14);
  },
};
