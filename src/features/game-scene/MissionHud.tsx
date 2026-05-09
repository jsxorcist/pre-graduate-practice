"use client";

import { useMemo } from "react";
import { useGame } from "./GameContext";
import {
  ACHIEVEMENT_ORDER,
  ACHIEVEMENTS,
} from "./achievementMeta";
import { HUD_MISSIONS, MISSION_TOTAL } from "./missionMeta";

type MissionHudProps = {
  /** Пока открыт экран миссии — текущий квест не подсвечивается как «Активна». */
  missionPanelOpen?: boolean;
};

export default function MissionHud({ missionPanelOpen = false }: MissionHudProps) {
  const { completedMissions, unlockedAchievementIds } = useGame();

  const doneCount = useMemo(
    () => completedMissions.filter(Boolean).length,
    [completedMissions],
  );

  /** Одна текущая миссия — первая несданная по порядку. */
  const activeMissionIndex = completedMissions.findIndex((done) => !done);

  const pct = (doneCount / MISSION_TOTAL) * 100;

  const achievementCount = useMemo(
    () => unlockedAchievementIds.length,
    [unlockedAchievementIds],
  );

  return (
    <div className="pointer-events-none absolute top-4 right-4 z-40 max-h-[min(92vh,calc(100vh-2rem))] w-[min(22rem,calc(100vw-2rem))] select-none overflow-y-auto rounded-2xl border border-white/25 bg-black/55 p-4 shadow-[0_0_40px_-8px_rgba(56,189,248,0.45)] backdrop-blur-md">
      <div className="pointer-events-auto">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
              Кампания
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-white">
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

        <ul className="mt-4 space-y-2.5">
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
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors duration-300 ${ring}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
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
                  <p className="truncate text-sm font-semibold text-white">
                    {m.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {completed ? "Ценность зафиксирована." : m.flavor}
                  </p>
                </div>
                {stateLabel && (
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    {stateLabel}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/85">
              Достижения
            </p>
            <span className="text-[11px] font-black tabular-nums text-amber-300/95">
              {achievementCount}/{ACHIEVEMENT_ORDER.length}
            </span>
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {ACHIEVEMENT_ORDER.map((id) => {
              const def = ACHIEVEMENTS[id];
              if (!def) return null;
              const unlocked = unlockedAchievementIds.includes(id);
              return (
                <li key={id}>
                  <div
                    title={`${def.title} — ${def.description}`}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition ${
                      unlocked
                        ? "border-amber-400/45 bg-amber-500/12 shadow-[0_0_16px_-6px_rgba(251,191,36,0.35)]"
                        : "border-white/10 bg-black/30 opacity-75"
                    }`}
                  >
                    <span
                      className={`text-xl leading-none ${unlocked ? "" : "grayscale opacity-45"}`}
                      aria-hidden
                    >
                      {unlocked ? def.icon : "◇"}
                    </span>
                    <span
                      className={`mt-1 line-clamp-2 text-[9px] font-semibold leading-tight ${
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
      </div>
    </div>
  );
}
