"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "./GameContext";
import {
  ACHIEVEMENT_ORDER,
  ACHIEVEMENTS,
} from "./achievementMeta";
import { HUD_MISSIONS, MISSION_TOTAL } from "./missionMeta";

type MissionHudProps = {
  missionPanelOpen?: boolean;
};

type HudBodyProps = {
  missionPanelOpen: boolean;
  doneCount: number;
  pct: number;
  achievementCount: number;
  completedMissions: boolean[];
  unlockedAchievementIds: string[];
};

function HudBody({
  missionPanelOpen,
  doneCount,
  pct,
  achievementCount,
  completedMissions,
  unlockedAchievementIds,
}: HudBodyProps) {
  const activeMissionIndex = completedMissions.findIndex((done) => !done);

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
            Кампания
          </p>
          <h2 className="mt-1 text-base font-bold tracking-tight text-white lg:text-lg">
            Dopamine Office
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            прогресс
          </p>
          <p className="text-2xl font-black tabular-nums text-yellow-300">
            {doneCount}/{MISSION_TOTAL}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900/90 ring-1 ring-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-fuchsia-500 via-cyan-400 to-amber-400 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2 lg:space-y-2.5">
        {HUD_MISSIONS.map((m, idx) => {
          const completed = completedMissions[idx];
          let stateLabel = "";
          let ring = "border-white/10 bg-white/5";

          const blocked = !completed && idx > 0 && !completedMissions[idx - 1];
          const isCurrentQuest =
            !completed && !blocked && idx === activeMissionIndex;

          if (missionPanelOpen && isCurrentQuest) {
            return null;
          }

          if (completed) {
            stateLabel = "Сдано";
            ring =
              "border-emerald-400/65 bg-emerald-500/10 shadow-[0_0_20px_-6px_rgba(52,211,153,0.85)]";
          } else if (blocked) {
            stateLabel = "Заблокировано";
            ring = "border-slate-600/50 bg-black/35 opacity-88";
          } else if (isCurrentQuest) {
            stateLabel = "Активна";
            ring =
              "border-cyan-400/55 bg-cyan-500/10 shadow-[0_0_22px_-8px_rgba(34,211,238,0.55)]";
          }

          return (
            <li
              key={m.id}
              className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-colors duration-300 sm:gap-3 sm:px-3 sm:py-2 ${ring}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black sm:h-8 sm:w-8 sm:text-xs ${
                  completed
                    ? "bg-emerald-400 text-slate-950"
                    : blocked
                      ? "bg-slate-700 text-slate-300"
                      : "bg-linear-to-br from-fuchsia-500 to-cyan-400 text-slate-950"
                }`}
              >
                {completed ? "✓" : idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white sm:text-sm">
                  {m.title}
                </p>
                <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">
                  {completed ? "Ценность зафиксирована." : m.flavor}
                </p>
              </div>
              {stateLabel && (
                <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-slate-300 sm:text-[10px]">
                  {stateLabel}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 border-t border-white/10 pt-3 lg:mt-5 lg:pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/85">
            Достижения
          </p>
          <span className="text-[11px] font-black tabular-nums text-amber-300/95">
            {achievementCount}/{ACHIEVEMENT_ORDER.length}
          </span>
        </div>
        <ul className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2 lg:mt-3">
          {ACHIEVEMENT_ORDER.map((id) => {
            const def = ACHIEVEMENTS[id];
            if (!def) return null;
            const unlocked = unlockedAchievementIds.includes(id);
            return (
              <li key={id}>
                <div
                  title={`${def.title} — ${def.description}`}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg border px-0.5 py-1.5 text-center transition sm:rounded-xl sm:px-1 sm:py-2 ${
                    unlocked
                      ? "border-amber-400/45 bg-amber-500/12 shadow-[0_0_16px_-6px_rgba(251,191,36,0.35)]"
                      : "border-white/10 bg-black/30 opacity-75"
                  }`}
                >
                  <span
                    className={`text-lg leading-none sm:text-xl ${unlocked ? "" : "grayscale opacity-45"}`}
                    aria-hidden
                  >
                    {unlocked ? def.icon : "◇"}
                  </span>
                  <span
                    className={`mt-0.5 line-clamp-2 text-[8px] font-semibold leading-tight sm:mt-1 sm:text-[9px] ${
                      unlocked ? "text-amber-100/95" : "text-slate-500"
                    }`}
                  >
                    {def.title}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default function MissionHud({
  missionPanelOpen = false,
}: MissionHudProps) {
  const { completedMissions, unlockedAchievementIds } = useGame();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const doneCount = useMemo(
    () => completedMissions.filter(Boolean).length,
    [completedMissions],
  );

  const pct = (doneCount / MISSION_TOTAL) * 100;

  const achievementCount = useMemo(
    () => unlockedAchievementIds.length,
    [unlockedAchievementIds],
  );

  const bodyProps: HudBodyProps = {
    missionPanelOpen,
    doneCount,
    pct,
    achievementCount,
    completedMissions,
    unlockedAchievementIds,
  };

  useEffect(() => {
    if (!mobileSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSheetOpen]);

  useEffect(() => {
    if (missionPanelOpen) setMobileSheetOpen(false);
  }, [missionPanelOpen]);

  return (
    <>
      {/* Десктоп: прежняя панель справа */}
      <div className="pointer-events-none absolute top-4 right-4 z-40 hidden max-h-[min(92vh,calc(100vh-2rem))] w-[min(22rem,calc(100vw-2rem))] select-none overflow-y-auto rounded-2xl border border-white/25 bg-black/55 p-4 shadow-[0_0_40px_-8px_rgba(56,189,248,0.45)] backdrop-blur-md lg:block">
        <div className="pointer-events-auto">
          <HudBody {...bodyProps} />
        </div>
      </div>

      {/* Мобилка: компактная кнапка — не закрывает D-pad; лист ограничен по высоте */}
      <div className="pointer-events-none lg:hidden">
        {!missionPanelOpen && (
          <div
            className="pointer-events-auto fixed left-3 right-3 z-[42]"
            style={{
              top: "max(0.75rem, env(safe-area-inset-top))",
            }}
          >
            <button
              type="button"
              aria-expanded={mobileSheetOpen}
              aria-controls="mobile-mission-sheet"
              onClick={() => setMobileSheetOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/25 bg-black/60 px-3 py-2.5 shadow-lg backdrop-blur-md"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
                Кампания
              </span>
              <span className="text-sm font-black tabular-nums text-yellow-300">
                {doneCount}/{MISSION_TOTAL}
              </span>
              <span className="ml-auto text-slate-400" aria-hidden>
                {mobileSheetOpen ? "▲" : "▼"}
              </span>
            </button>
          </div>
        )}

        {mobileSheetOpen && !missionPanelOpen && (
          <>
            <button
              type="button"
              aria-label="Закрыть панель кампании"
              className="pointer-events-auto fixed inset-0 z-[43] bg-black/35 backdrop-blur-[2px]"
              onClick={() => setMobileSheetOpen(false)}
            />
            <div
              id="mobile-mission-sheet"
              role="dialog"
              aria-modal="false"
              className="pointer-events-auto fixed left-3 right-3 z-[44] overflow-y-auto overscroll-contain rounded-2xl border border-white/25 bg-black/72 p-3 shadow-xl backdrop-blur-md"
              style={{
                top: "calc(max(env(safe-area-inset-top), 0.75rem) + 4.125rem)",
                bottom: "calc(12rem + env(safe-area-inset-bottom))",
              }}
            >
              <div className="mb-3 flex justify-end lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  className="rounded-lg border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300"
                >
                  Свернуть
                </button>
              </div>
              <HudBody {...bodyProps} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
