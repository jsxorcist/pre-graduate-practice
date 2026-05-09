"use client";

import { useEffect } from "react";
import { useGame } from "./GameContext";
import { ACHIEVEMENTS } from "./achievementMeta";

const DISPLAY_MS = 5600;

/**
 * Баннер достижения в духе WoW: сверху по центру, золотая рама, «фанфара» входа.
 * Очередь из GameContext — по одному тосту; после закрытия миссии тосты попадают в очередь отдельно.
 */
export default function AchievementToast() {
  const { achievementToastQueue, dismissAchievementToast } = useGame();

  const currentId = achievementToastQueue[0];
  const def = currentId ? ACHIEVEMENTS[currentId] : null;

  useEffect(() => {
    if (!currentId) return;
    const t = window.setTimeout(() => dismissAchievementToast(), DISPLAY_MS);
    return () => window.clearTimeout(t);
  }, [currentId, dismissAchievementToast]);

  if (!def) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-1/2 z-[70] flex w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 justify-center px-3 pt-6 md:pt-8"
      role="status"
      aria-live="polite"
    >
      <div className="animate-achievement-earned-enter w-full">
        {/* Внешняя «орнаментальная» рамка */}
        <div className="relative overflow-visible rounded-sm shadow-[0_0_0_1px_rgba(251,191,36,0.55),0_22px_60px_-12px_rgba(0,0,0,0.85),0_0_48px_-8px_rgba(251,191,36,0.35)]">
          <div
            className="pointer-events-none absolute -inset-[3px] rounded-sm opacity-90"
            style={{
              background:
                "linear-gradient(135deg, rgba(180,130,40,0.95) 0%, rgba(90,55,15,1) 22%, rgba(251,191,36,0.55) 48%, rgba(90,55,15,1) 78%, rgba(180,130,40,0.9) 100%)",
            }}
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-sm border border-amber-200/25 bg-linear-to-b from-[#1c1410] via-[#120d0a] to-[#0a0706]">
            {/* Блик */}
            <div
              className="animate-achievement-banner-shimmer pointer-events-none absolute inset-y-0 left-0 w-[58%] opacity-[0.28]"
              aria-hidden
            />
            {/* Угловые акценты */}
            <div
              className="pointer-events-none absolute left-1 top-1 h-5 w-5 border-l-2 border-t-2 border-amber-400/70"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute right-1 top-1 h-5 w-5 border-r-2 border-t-2 border-amber-400/70"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-1 left-1 h-5 w-5 border-b-2 border-l-2 border-amber-500/45"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-1 right-1 h-5 w-5 border-b-2 border-r-2 border-amber-500/45"
              aria-hidden
            />

            <div className="relative flex items-stretch gap-0">
              {/* Герб с иконкой */}
              <div className="relative flex w-[4.25rem] shrink-0 items-center justify-center bg-linear-to-br from-amber-950/90 via-[#1a120c] to-black/80 md:w-[4.75rem]">
                <div
                  className="animate-achievement-crest-glow pointer-events-none absolute inset-2 rounded-full opacity-60 blur-md"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(251,191,36,0.55) 0%, transparent 70%)",
                  }}
                  aria-hidden
                />
                <div className="relative flex h-[3.35rem] w-[3.35rem] items-center justify-center rounded-full border-2 border-amber-500/55 bg-black/50 shadow-[inset_0_0_24px_rgba(251,191,36,0.15)] md:h-[3.6rem] md:w-[3.6rem]">
                  <span className="text-[2.15rem] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] md:text-[2.35rem]">
                    {def.icon}
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 py-3 pr-4 pl-3 md:py-3.5 md:pl-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-amber-200/95 drop-shadow-sm md:text-[11px]">
                  Достижение получено
                </p>
                <p className="mt-1.5 font-serif text-[1.05rem] font-bold leading-tight tracking-wide text-amber-50 drop-shadow-[0_2px_12px_rgba(251,191,36,0.25)] md:text-xl">
                  {def.title}
                </p>
                <p className="mt-1.5 text-[12px] leading-snug text-slate-400 md:text-[13px]">
                  {def.description}
                </p>
              </div>
            </div>

            {/* Нижняя золотая линия-акцент */}
            <div
              className="h-[2px] bg-linear-to-r from-transparent via-amber-400/55 to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
