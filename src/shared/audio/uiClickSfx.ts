/**
 * Короткий отклик по нажатию UI (Web Audio, без файлов).
 */

let uiAudioCtx: AudioContext | null = null;

/** Снять suspend с контекста UI после жеста (браузеры). */
export function primeUiAudioContext(): void {
  const ctx = getUiCtx();
  if (!ctx) return;
  try {
    void ctx.resume();
  } catch {
    /* noop */
  }
}

function getUiCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  uiAudioCtx = uiAudioCtx ?? new Ctor();
  return uiAudioCtx;
}

/** Тихий «щёлк» под кнопки и role="button". */
export function playUiClick(): void {
  const ctx = getUiCtx();
  if (!ctx) return;
  primeUiAudioContext();

  const t0 = ctx.currentTime;
  const freqStart = 380 + Math.random() * 45;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freqStart, t0);
  osc.frequency.exponentialRampToValueAtTime(128, t0 + 0.045);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0008, t0);
  g.gain.exponentialRampToValueAtTime(0.055, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.068);

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 90;

  osc.connect(hp).connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.075);
}
