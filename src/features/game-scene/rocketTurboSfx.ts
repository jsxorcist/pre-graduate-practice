/**
 * Синтез звука для скрытого турбо (Web Audio API, без внешних файлов).
 */

let audioCtxSingleton: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioCtxSingleton = audioCtxSingleton ?? new Ctor();
  return audioCtxSingleton;
}

async function resume(): Promise<AudioContext | null> {
  const ctx = getCtx();
  if (!ctx) return null;
  try {
    await ctx.resume();
  } catch {
    /* noop */
  }
  return ctx;
}

/** Разблокировать контекст после пользовательского жеста (браузеры блокируют до него автозапуск). */
export function primeTurboAudioContext(): void {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    void ctx.resume();
  } catch {
    /* noop */
  }
}

function getNoise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    const dur = 0.6;
    const len = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, Math.floor(len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
  }
  return noiseBuffer;
}

let chargeCleanup: (() => void) | null = null;

export function stopTurboChargeHum(): void {
  chargeCleanup?.();
  chargeCleanup = null;
}

/** Нарастающее «жужжание» зарядки (остановите через stopTurboChargeHum при смене стадии). */
export async function playTurboChargeHum(maxChargeSec = 3.2): Promise<void> {
  const ctx = await resume();
  if (!ctx) return;
  stopTurboChargeHum();
  const t0 = ctx.currentTime;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(180, t0);
  filter.frequency.exponentialRampToValueAtTime(1650, t0 + maxChargeSec);
  filter.Q.value = 0.75;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.11, t0 + 0.14);
  filter.connect(master);
  master.connect(ctx.destination);

  const low = ctx.createOscillator();
  low.type = "sawtooth";
  low.frequency.setValueAtTime(38, t0);
  low.frequency.exponentialRampToValueAtTime(95, t0 + maxChargeSec * 0.92);

  const mid = ctx.createOscillator();
  mid.type = "triangle";
  mid.frequency.setValueAtTime(120, t0);
  mid.frequency.exponentialRampToValueAtTime(230, t0 + maxChargeSec);

  const gLow = ctx.createGain();
  gLow.gain.value = 0.06;
  const gMid = ctx.createGain();
  gMid.gain.value = 0.036;

  low.connect(gLow).connect(filter);
  mid.connect(gMid).connect(filter);

  low.start(t0);
  mid.start(t0);
  low.stop(t0 + maxChargeSec + 0.32);
  mid.stop(t0 + maxChargeSec + 0.32);

  chargeCleanup = () => {
    try {
      low.stop();
      mid.stop();
    } catch {
      /* already stopped */
    }
    try {
      master.disconnect();
      filter.disconnect();
    } catch {
      /* noop */
    }
  };
}

/** Вихрь перед взлётом. */
export async function playTurboSpinWhoosh(): Promise<void> {
  const ctx = await resume();
  if (!ctx) return;
  stopTurboChargeHum();
  const t0 = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  src.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(400, t0);
  bp.frequency.exponentialRampToValueAtTime(3200, t0 + 0.35);
  bp.Q.value = 2.2;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.14, t0 + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05);

  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + 1.08);
}

/** Удар + шумовой «хлопок» взлёта. */
export async function playTurboLaunchBlast(): Promise<void> {
  const ctx = await resume();
  if (!ctx) return;
  const t0 = ctx.currentTime;

  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(95, t0);
  sub.frequency.exponentialRampToValueAtTime(28, t0 + 0.45);
  const gSub = ctx.createGain();
  gSub.gain.setValueAtTime(0.0001, t0);
  gSub.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
  gSub.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
  sub.connect(gSub).connect(ctx.destination);
  sub.start(t0);
  sub.stop(t0 + 0.58);

  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  const gN = ctx.createGain();
  gN.gain.setValueAtTime(0.0001, t0);
  gN.gain.exponentialRampToValueAtTime(0.22, t0 + 0.015);
  gN.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
  src.connect(hp).connect(gN).connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + 0.45);

  const shine = ctx.createOscillator();
  shine.type = "square";
  shine.frequency.setValueAtTime(660, t0);
  shine.frequency.exponentialRampToValueAtTime(1980, t0 + 0.08);
  const gS = ctx.createGain();
  gS.gain.setValueAtTime(0.0001, t0);
  gS.gain.exponentialRampToValueAtTime(0.04, t0 + 0.01);
  gS.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
  shine.connect(gS).connect(ctx.destination);
  shine.start(t0);
  shine.stop(t0 + 0.2);
}

/** Мягкий удар при приземлении турбо. */
export async function playTurboLandThud(): Promise<void> {
  const ctx = await resume();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(62, t0);
  sub.frequency.exponentialRampToValueAtTime(24, t0 + 0.22);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
  sub.connect(g).connect(ctx.destination);
  sub.start(t0);
  sub.stop(t0 + 0.32);
}

/** Короткий «фанфарный» аккорд при показе эпичного оверлея. */
export async function playEpicOverlayFanfare(): Promise<void> {
  const ctx = await resume();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, t0);
    const gj = ctx.createGain();
    const start = t0 + i * 0.065;
    gj.gain.setValueAtTime(0.0001, start);
    gj.gain.exponentialRampToValueAtTime(0.06, start + 0.04);
    gj.gain.exponentialRampToValueAtTime(0.0001, start + 0.55 + i * 0.06);
    osc.connect(gj).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.75);
  });

  const air = ctx.createOscillator();
  air.type = "sine";
  air.frequency.setValueAtTime(2349, t0);
  air.frequency.exponentialRampToValueAtTime(3520, t0 + 0.12);
  const gA = ctx.createGain();
  gA.gain.setValueAtTime(0.0001, t0 + 0.05);
  gA.gain.exponentialRampToValueAtTime(0.018, t0 + 0.09);
  gA.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
  air.connect(gA).connect(ctx.destination);
  air.start(t0 + 0.05);
  air.stop(t0 + 0.5);
}
