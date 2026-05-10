"use client";

import { useEffect, useRef } from "react";
import { playEpicOverlayFanfare } from "@/features/game-scene/rocketTurboSfx";

interface EpicOverlayProps {
  active: boolean;
  onContinue?: () => void;
}

export default function EpicOverlay({ active, onContinue }: EpicOverlayProps) {
  const playedForSessionRef = useRef(false);

  useEffect(() => {
    if (!active) {
      playedForSessionRef.current = false;
      return;
    }
    if (playedForSessionRef.current) return;
    playedForSessionRef.current = true;
    void playEpicOverlayFanfare();
  }, [active]);

  const handleBackdropClick = () => {
    if (active) onContinue?.();
  };

  return (
    <div
      className={`epic-shell fixed inset-0 z-[54] flex flex-col justify-between transition-opacity duration-500 ${active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!active}
    >
      {/* Глубина + конфетти-блики */}
      <div
        role="presentation"
        className={`epic-parallax absolute inset-0 cursor-pointer bg-[radial-gradient(ellipse_at_25%_-10%,rgba(251,146,60,0.35),transparent_52%),radial-gradient(ellipse_at_80%_110%,rgba(236,72,153,0.28),transparent_46%),linear-gradient(to_bottom,rgba(2,8,26,0.88),rgba(10,22,54,0.52))]`}
        onClick={handleBackdropClick}
      />
      <div className="epic-spin-slow pointer-events-none absolute inset-0 opacity-[0.35] blur-3xl" />
      <div className="epic-spin-fast pointer-events-none absolute inset-[12%] opacity-45 blur-2xl" />

      <div className="pointer-events-none relative flex flex-1 flex-col items-center justify-center px-5 py-6 text-center sm:px-10 sm:py-10">
        <div className="epic-rays pointer-events-none absolute inset-x-[-20%] top-[-10%] h-[72%]" />
        <div className="relative z-[1] flex flex-col items-center gap-5 sm:gap-6 md:gap-8">
          <span className="epic-line-1 text-4xl font-black uppercase tracking-[-0.08em] text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.6)] sm:text-5xl md:text-6xl xl:text-7xl">
            what if i fall?
          </span>
          <span className="epic-line-2 bg-linear-to-br from-orange-400 via-pink-400 to-cyan-400 bg-clip-text text-5xl font-black uppercase tracking-[-0.08em] text-transparent drop-shadow-[0_0_36px_rgba(255,128,96,0.55)] sm:text-6xl md:text-7xl xl:text-8xl">
            bro what if you fly
          </span>
          <span className="epic-number bg-linear-to-r from-amber-300 via-white to-cyan-300 bg-clip-text font-black uppercase tracking-[-0.08em] text-transparent drop-shadow-[0_0_48px_rgba(255,200,120,0.65)] sm:text-7xl md:text-8xl xl:text-9xl">
            67
          </span>
        </div>
      </div>

      <div className="pointer-events-none relative z-[2] flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onContinue?.();
          }}
          className="pointer-events-auto cursor-pointer rounded-full border border-cyan-300/45 bg-slate-950/92 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_32px_-4px_rgba(34,211,238,0.45)] backdrop-blur-md transition hover:border-amber-300/50 hover:text-amber-100 sm:text-sm"
        >
          Вернуться в игру
        </button>
      </div>

      <style jsx>{`
        .epic-shell {
          perspective: 900px;
        }
        .epic-spin-slow {
          background: conic-gradient(
            from 0deg,
            rgba(251, 113, 133, 0.5),
            rgba(56, 189, 248, 0.45),
            rgba(251, 191, 36, 0.5),
            rgba(167, 139, 250, 0.45),
            rgba(251, 113, 133, 0.5)
          );
          animation: epicRot 14s linear infinite;
        }
        .epic-spin-fast {
          background: conic-gradient(
            from 90deg,
            rgba(34, 211, 238, 0.35),
            rgba(244, 114, 182, 0.35),
            rgba(251, 191, 36, 0.35),
            rgba(34, 211, 238, 0.35)
          );
          animation: epicRot 4.2s linear infinite reverse;
        }
        .epic-rays {
          background: repeating-conic-gradient(
            from 0deg at 50% 40%,
            transparent 0deg 6deg,
            rgba(255, 255, 255, 0.07) 6deg 9deg
          );
          mask-image: radial-gradient(
            circle at 50% 35%,
            black 0%,
            transparent 72%
          );
          animation: epicRayPulse 2.4s ease-in-out infinite;
        }
        .epic-line-1 {
          animation: epicScale 0.68s cubic-bezier(0.22, 1, 0.36, 1) both,
            epicGlowFlicker 2.6s ease-in-out infinite 0.72s;
        }
        .epic-line-2 {
          animation: epicPulse 1.18s ease-in-out infinite alternate 0.3s,
            epicGlitch 4.8s ease-in-out infinite;
        }
        .epic-number {
          animation: epicNumPop 0.75s cubic-bezier(0.22, 1, 0.36, 1.4) 0.08s both,
            epicNumFloat 2.2s ease-in-out infinite 0.85s;
        }

        @keyframes epicRot {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes epicRayPulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.04);
          }
        }
        @keyframes epicGlitch {
          0%,
          91%,
          100% {
            filter: hue-rotate(0deg) saturate(1);
          }
          92% {
            filter: hue-rotate(35deg) saturate(1.25);
          }
          94% {
            filter: hue-rotate(-22deg) saturate(1.15);
          }
        }
        @keyframes epicGlowFlicker {
          0%,
          100% {
            filter: drop-shadow(0 0 22px rgba(255, 255, 255, 0.55));
          }
          50% {
            filter: drop-shadow(0 0 38px rgba(255, 255, 255, 0.88));
          }
        }
        @keyframes epicNumPop {
          0% {
            transform: scale(0.2) rotate(-18deg);
            opacity: 0;
          }
          70% {
            transform: scale(1.12) rotate(8deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes epicNumFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.05);
          }
        }
        @keyframes epicScale {
          0% {
            transform: scale(0.65) translateZ(-80px);
            opacity: 0;
          }
          58% {
            transform: scale(1.08) translateZ(12px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateZ(0);
            opacity: 1;
          }
        }
        @keyframes epicPulse {
          from {
            transform: scale(1) translateZ(0);
            filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.22));
          }
          to {
            transform: scale(1.04) translateZ(8px);
            filter: drop-shadow(0 0 36px rgba(255, 255, 255, 0.42));
          }
        }
      `}</style>
    </div>
  );
}
