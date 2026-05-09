"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Доля дорожки (0–100), где засчитывается попадание — «окно поставки». */
const GREEN_MIN = 40;
const GREEN_MAX = 60;
const HITS_TO_WIN = 3;
const MAX_ATTEMPTS = 5;

type Screen = "intro" | "play" | "done" | "failed";

interface SpeedMissionOverlayProps {
  active: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function SpeedMissionOverlay({
  active,
  onClose,
  onSuccess,
}: SpeedMissionOverlayProps) {
  const [screen, setScreen] = useState<Screen>("intro");
  /** Игровой этап: стрелка бежит или заморозка после «Стоп». */
  const [frozen, setFrozen] = useState(false);
  const [needlePct, setNeedlePct] = useState(50);
  const needleRef = useRef(50);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastHit, setLastHit] = useState<boolean | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const successRef = useRef(false);

  const resetGame = useCallback(() => {
    setScreen("intro");
    setFrozen(false);
    setNeedlePct(50);
    needleRef.current = 50;
    setHits(0);
    setAttempts(0);
    setLastHit(null);
    setRoundKey(0);
    successRef.current = false;
  }, []);

  useEffect(() => {
    if (!active) return;
    resetGame();
  }, [active, resetGame]);

  useEffect(() => {
    if (screen !== "play" || frozen || !active) return;

    const t0 = performance.now();
    const speedHz = 0.85 + Math.random() * 0.55;
    let raf = 0;

    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const n = 50 + 48 * Math.sin(t * speedHz * Math.PI * 2);
      needleRef.current = n;
      setNeedlePct(n);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen, frozen, roundKey, active]);

  const handleStop = () => {
    if (screen !== "play" || frozen || !active) return;

    const v = needleRef.current;
    const hit = v >= GREEN_MIN && v <= GREEN_MAX;
    setNeedlePct(v);
    setFrozen(true);
    setLastHit(hit);

    const nextHits = hits + (hit ? 1 : 0);
    const nextAttempts = attempts + 1;

    window.setTimeout(() => {
      setHits(nextHits);
      setAttempts(nextAttempts);

      if (nextHits >= HITS_TO_WIN) {
        setScreen("done");
        return;
      }

      if (nextAttempts >= MAX_ATTEMPTS && nextHits < HITS_TO_WIN) {
        setScreen("failed");
        return;
      }

      setFrozen(false);
      setLastHit(null);
      setRoundKey((k) => k + 1);
    }, 720);
  };

  useEffect(() => {
    if (screen === "done" && !successRef.current) {
      successRef.current = true;
      onSuccess?.();
    }
  }, [screen, onSuccess]);

  if (!active) return null;

  const attemptsRemaining = MAX_ATTEMPTS - attempts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white backdrop-blur-sm">
      {screen === "done" && (
        <div
          className="pointer-events-none absolute inset-0 z-[51] animate-mission-victory-flash"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-black/74" />

      <div
        className={`relative z-[52] w-full max-w-md overflow-hidden rounded-3xl border border-white/18 bg-slate-950/96 shadow-[0_0_88px_-24px_rgba(251,146,60,0.38)] sm:max-w-lg ${
          screen === "failed" ? "animate-mission-fail-shake" : ""
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_0%,rgba(251,146,60,0.12),transparent_48%)]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="relative px-5 py-6 md:px-6 md:py-8">
          {screen === "intro" && (
            <div className="animate-mission-panel-enter space-y-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300/95">
                Скорость
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">
                Окно поставки
              </h1>
              <p className="mx-auto max-w-[20rem] text-[14px] leading-relaxed text-slate-400">
                Стрелка — темп команды: не «как можно быстрее любой ценой», а попадание в устойчивое
                окно. Останови её в{" "}
                <span className="font-semibold text-emerald-300/95">зелёной зоне</span>{" "}
                <span className="font-semibold text-slate-200">{HITS_TO_WIN} раза</span>. Попыток не
                больше <span className="font-semibold text-slate-200">{MAX_ATTEMPTS}</span>.
              </p>
              <button
                type="button"
                onClick={() => setScreen("play")}
                className="inline-flex w-full justify-center rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 shadow-[0_24px_60px_-28px_rgba(251,191,36,0.85)] transition hover:bg-amber-300 sm:w-auto sm:min-w-[168px]"
              >
                Поехали
              </button>
            </div>
          )}

          {screen === "play" && (
            <div className="animate-mission-panel-enter space-y-5">
              <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                <span>
                  попадания{" "}
                  <span className="font-bold text-amber-200 tabular-nums">
                    {hits}/{HITS_TO_WIN}
                  </span>
                </span>
                <span>
                  попытка{" "}
                  <span className="tabular-nums text-slate-300">
                    {attempts + 1}/{MAX_ATTEMPTS}
                  </span>
                </span>
              </div>

              <div className="relative mx-auto max-w-sm pt-2">
                <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Зелёное — устойчивое окно · красное — перегруз или провал темпа
                </p>

                <div className="relative h-14 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-inner">
                  <div
                    className="absolute inset-y-0 bg-emerald-500/25"
                    style={{
                      left: `${GREEN_MIN}%`,
                      width: `${GREEN_MAX - GREEN_MIN}%`,
                    }}
                  />
                  <div
                    className="absolute bottom-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500/90 shadow-[0_0_24px_rgba(251,191,36,0.55)] transition-none"
                    style={{
                      left: `${needlePct}%`,
                      transform: "translateX(-50%)",
                      opacity: frozen ? 0.92 : 1,
                    }}
                    aria-hidden
                  >
                    <span className="text-lg leading-none">▼</span>
                  </div>
                </div>

                {/* Позиции подписей = те же %, что и на дорожке (не flex justify-between). */}
                <div className="relative mt-2 h-5 w-full px-0.5 text-[10px] tabular-nums text-slate-600">
                  <span className="absolute left-0 top-0">0</span>
                  <span className="absolute top-0 -translate-x-1/2 text-emerald-500/80" style={{ left: `${GREEN_MIN}%` }}>
                    {GREEN_MIN}%
                  </span>
                  <span className="absolute top-0 -translate-x-1/2 text-emerald-500/80" style={{ left: `${GREEN_MAX}%` }}>
                    {GREEN_MAX}%
                  </span>
                  <span className="absolute right-0 top-0">100</span>
                </div>
              </div>

              {frozen && lastHit !== null && (
                <p
                  className={`animate-mission-panel-enter text-center text-[14px] font-bold ${
                    lastHit ? "text-emerald-400" : "text-amber-300"
                  }`}
                >
                  {lastHit ? "В окне — темп устойчивый" : "Мимо окна — рывок или тормоз"}
                </p>
              )}

              <button
                type="button"
                disabled={frozen}
                onClick={handleStop}
                className="w-full rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 py-4 text-base font-black uppercase tracking-[0.15em] text-white shadow-[0_20px_48px_-24px_rgba(251,146,60,0.75)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
              >
                Стоп
              </button>

              <p className="text-center text-[11px] text-slate-500">
                Свободных нажатий «Стоп» ещё:{" "}
                <span className="font-semibold text-slate-400">{attemptsRemaining}</span> — каждый раунд
                новая скорость колебаний.
              </p>
            </div>
          )}

          {screen === "done" && (
            <div className="animate-mission-panel-enter space-y-6 text-center">
              <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                <span
                  className="animate-mission-success-ring pointer-events-none absolute inset-[-12px] rounded-full border-[3px] border-amber-300/90"
                  aria-hidden
                />
                <div className="animate-mission-success-pop relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-400/25 text-5xl font-black text-amber-100 shadow-[0_0_56px_-8px_rgba(251,191,36,0.65)]">
                  ⚡
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white md:text-3xl">
                  В нужном темпе
                </h2>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-slate-400">
                  Скорость без окна превращается в хаос; с окном — в предсказуемые поставки.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-amber-400 py-4 text-base font-bold text-slate-950 shadow-[0_28px_64px_-40px_rgba(251,191,36,1)] hover:bg-amber-300"
              >
                Назад в комнату
              </button>
            </div>
          )}

          {screen === "failed" && (
            <div className="animate-mission-panel-enter space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20 text-4xl font-black text-orange-200 ring-2 ring-orange-500/45">
                ×
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Нужно {HITS_TO_WIN} попадания</h2>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-slate-400">
                  Сейчас {hits} попаданий за {MAX_ATTEMPTS} попыток. Ещё раз — или выходи в комнату.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetGame();
                    setScreen("play");
                  }}
                  className="w-full rounded-2xl bg-amber-400 py-4 text-base font-bold text-slate-950 hover:bg-amber-300"
                >
                  Ещё раз
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl border border-white/20 bg-transparent py-4 text-base font-bold text-white transition hover:bg-white/10"
                >
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
