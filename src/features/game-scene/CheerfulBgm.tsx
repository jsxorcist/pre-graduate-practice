"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { primeUiAudioContext } from "@/shared/audio/uiClickSfx";
import { primeTurboAudioContext } from "./rocketTurboSfx";

const BPM = 126;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.1;

function sixteenthSec() {
  return (60 / BPM) / 4;
}

const MELODY_HZ: number[] = [
  523.25, 587.33, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25,
  523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
];

const BASS_HZ: number[] = [
  130.81, 130.81, 98.0, 130.81, 130.81, 146.83, 130.81, 98.0,
  130.81, 130.81, 98.0, 130.81, 174.61, 164.81, 146.83, 130.81,
];

function scheduleNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  type: OscillatorType,
  peakGain: number,
  startTime: number,
  duration: number,
) {
  if (freq <= 0) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  const eps = 0.02;
  g.gain.setValueAtTime(0.0001, startTime);
  g.gain.exponentialRampToValueAtTime(peakGain, startTime + eps);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(g).connect(dest);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.03);
}

function primeAllGameAudio(): void {
  primeUiAudioContext();
  primeTurboAudioContext();
}

export default function CheerfulBgm() {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const nextTimeRef = useRef(0);
  const runningRef = useRef(false);
  const startInFlightRef = useRef(false);

  const stopLoop = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    runningRef.current = false;
  }, []);

  const schedulerTick = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || !runningRef.current) return;

    const stepDur = sixteenthSec();
    while (nextTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      const t = nextTimeRef.current;
      const i = stepRef.current % 16;
      scheduleNote(ctx, master, MELODY_HZ[i]!, "triangle", 0.11, t, stepDur * 0.92);
      scheduleNote(ctx, master, BASS_HZ[i]!, "sine", 0.065, t, stepDur * 0.95);
      stepRef.current += 1;
      nextTimeRef.current += stepDur;
    }

    timerRef.current = window.setTimeout(schedulerTick, LOOKAHEAD_MS);
  }, []);

  const startLoop = useCallback(() => {
    if (runningRef.current || startInFlightRef.current) return;
    startInFlightRef.current = true;
    primeAllGameAudio();

    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      startInFlightRef.current = false;
      return;
    }

    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    if (!masterRef.current) {
      const master = ctx.createGain();
      master.gain.value = 0.14;
      master.connect(ctx.destination);
      masterRef.current = master;
    }

    void ctx
      .resume()
      .then(() => {
        startInFlightRef.current = false;
        if (runningRef.current) return;
        runningRef.current = true;
        stepRef.current = 0;
        nextTimeRef.current = ctx.currentTime + 0.06;
        schedulerTick();
        setStarted(true);
      })
      .catch(() => {
        startInFlightRef.current = false;
      });
  }, [schedulerTick]);

  /** После любого жеста в игре включаются музыка и уже открытые Web Audio контексты (ограничение браузера). */
  useEffect(() => {
    const onFirstGesture = () => {
      startLoop();
    };
    window.addEventListener("pointerdown", onFirstGesture, {
      passive: true,
      capture: true,
    });
    window.addEventListener("keydown", onFirstGesture, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture, { capture: true });
      window.removeEventListener("keydown", onFirstGesture, { capture: true });
    };
  }, [startLoop]);

  useEffect(() => {
    const g = masterRef.current?.gain;
    if (g) {
      g.value = muted ? 0 : 0.14;
    }
  }, [muted, started]);

  useEffect(() => {
    return () => {
      stopLoop();
      try {
        void ctxRef.current?.close();
      } catch {
        /* noop */
      }
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, [stopLoop]);

  const handleClick = () => {
    if (!started) {
      primeAllGameAudio();
      startLoop();
      return;
    }
    setMuted((m) => !m);
  };

  /** До первого запуска петли показываем динамик: музыка задумана включённой сразу после жеста. */
  const label = !started ? "🔊" : muted ? "🔇" : "🔊";

  return (
    <button
      type="button"
      aria-label={
        !started
          ? "Фоновая музыка (включится при первом касании или клавише)"
          : muted
            ? "Включить музыку"
            : "Выключить музыку"
      }
      aria-pressed={started && !muted}
      title={
        !started
          ? "Тихая музыка включится при первом касании экрана или нажатии клавиши — так требует браузер"
          : muted
            ? "Включить музыку"
            : "Выключить музыку"
      }
      className="fixed bottom-[calc(12.75rem+env(safe-area-inset-bottom))] right-4 z-[52] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/40 text-lg shadow-lg backdrop-blur-md transition hover:bg-black/55 lg:bottom-6 lg:right-6"
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
