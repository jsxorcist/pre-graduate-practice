"use client";

import { useEffect, useReducer, useRef, useState } from "react";

const PASS_NEED = 4;
const TOTAL = 5;

type Phase = "intro" | "quiz" | "done" | "failed";

type Scenario = {
  situation: string;
  goodLabel: string;
  badLabel: string;
};

const SCENARIOS: Scenario[] = [
  {
    situation:
      "Ночью упала критичная алерта в мониторинге. Твой первый шаг?",
    goodLabel:
      "По ранбуку открыть инцидент: канал + дежурный",
    badLabel:
      "Отключить алерты и разобраться позже",
  },
  {
    situation:
      "Ты понял(а), что вчерашний деплой с твоего мержа бьёт по продакшену.",
    goodLabel:
      "Сразу писать в общий тред: факт, откат или хотфикс",
    badLabel:
      "Ждать, пока кто-то другой найдёт причину",
  },
  {
    situation:
      "Релиз горит по сроку, проверки ещё не зелёные.",
    goodLabel:
      "Озвучить риск лиду и зафиксировать решение текстом",
    badLabel:
      "Попросить смерджить без проверки «на этот раз»",
  },
  {
    situation:
      "Перед демо просят не подсвечивать найденный баг.",
    goodLabel:
      "Завести задачу и договориться о сроке после демо",
    badLabel:
      "Согласиться молчать — почините потом между собой",
  },
  {
    situation:
      "Инцидент потушен. Что перед закрытием темы?",
    goodLabel:
      "Короткий разбор: что случилось и что улучшаем в процессе",
    badLabel:
      "Написать «всё стабильно» и двигаться дальше без разборов",
  },
];

type MissionFields = {
  phase: Phase;
  step: number;
  correct: number;
};

const MISSION_INITIAL: MissionFields = {
  phase: "intro",
  step: 0,
  correct: 0,
};

type MissionAction = { type: "start_quiz" } | { type: "answer"; good: boolean };

function missionReducer(s: MissionFields, a: MissionAction): MissionFields {
  switch (a.type) {
    case "start_quiz":
      return { phase: "quiz", step: 0, correct: 0 };
    case "answer": {
      if (s.phase !== "quiz") return s;
      const nextCorrect = s.correct + (a.good ? 1 : 0);
      const isLastCard = s.step >= TOTAL - 1;
      if (isLastCard) {
        const won = nextCorrect >= PASS_NEED;
        return {
          phase: won ? "done" : "failed",
          step: s.step,
          correct: nextCorrect,
        };
      }
      return {
        ...s,
        correct: nextCorrect,
        step: s.step + 1,
      };
    }
    default:
      return s;
  }
}

const VICTORY_STARS_LAYOUT = Array.from({ length: 18 }, (_, i) => ({
  left: `${10 + ((i * 37) % 78)}%`,
  top: `${6 + ((i * 19) % 32)}%`,
  delay: `${(i * 0.09).toFixed(2)}s`,
  size: `${3 + (i % 4)}px`,
}));

interface MissionOverlayProps {
  active: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function MissionOverlay({
  active,
  onClose,
  onSuccess,
}: MissionOverlayProps) {
  const [mission, dispatchMission] = useReducer(missionReducer, MISSION_INITIAL);
  const { phase, step, correct } = mission;

  const [feedback, setFeedback] = useState<null | "ok" | "bad">(null);
  const [locked, setLocked] = useState(false);
  const [lastPick, setLastPick] = useState<null | "good" | "bad">(null);
  const successNotifiedRef = useRef(false);

  const [confettiItems, setConfettiItems] = useState<
    Array<{
      left: string;
      top: string;
      delay: string;
      duration: string;
      size: number;
      hue: number;
    }>
  >([]);

  useEffect(() => {
    if (phase === "done" && !successNotifiedRef.current) {
      successNotifiedRef.current = true;
      onSuccess?.();
      setConfettiItems(
        Array.from({ length: 48 }, () => ({
          left: `${4 + Math.random() * 92}%`,
          top: `${8 + Math.random() * 40}%`,
          delay: `${(Math.random() * 0.45).toFixed(2)}s`,
          duration: `${1.2 + Math.random() * 1.1}s`,
          size: 4 + Math.round(Math.random() * 10),
          hue: Math.floor(Math.random() * 320),
        })),
      );
    }
  }, [phase, onSuccess]);

  const current = SCENARIOS[step];
  const goodFirst = step % 2 === 0;

  const handlePick = (choice: "good" | "bad") => {
    if (!active || phase !== "quiz" || locked || current == null) return;
    const isGood = choice === "good";
    setLocked(true);
    setLastPick(choice);
    setFeedback(isGood ? "ok" : "bad");

    window.setTimeout(() => {
      setFeedback(null);
      setLastPick(null);
      setLocked(false);
      dispatchMission({ type: "answer", good: isGood });
    }, 520);
  };

  if (!active) return null;

  const optionTiles: Array<{ kind: "good" | "bad"; text: string; num: string }> =
    goodFirst
      ? [
          { kind: "good", text: current?.goodLabel ?? "", num: "1" },
          { kind: "bad", text: current?.badLabel ?? "", num: "2" },
        ]
      : [
          { kind: "bad", text: current?.badLabel ?? "", num: "1" },
          { kind: "good", text: current?.goodLabel ?? "", num: "2" },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white backdrop-blur-sm">
      {phase === "done" && (
        <div
          className="pointer-events-none absolute inset-0 z-[51] animate-mission-victory-flash"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-black/72" />

      <div
        className={`relative z-[52] w-full max-w-md overflow-hidden rounded-3xl border border-white/18 bg-slate-950/96 shadow-[0_0_80px_-20px_rgba(56,189,248,0.35)] sm:max-w-lg md:max-w-xl ${
          phase === "failed" ? "animate-mission-fail-shake" : ""
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.14),transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-fuchsia-500 via-cyan-400 to-amber-400" />

        <div className="relative px-5 py-6 md:px-6 md:py-8">
          {phase === "intro" && (
            <div className="animate-mission-panel-enter space-y-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
                Ответственность
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">
                Пять решений
              </h1>
              <p className="mx-auto max-w-[18rem] text-[14px] leading-relaxed text-slate-400">
                Одна короткая ситуация — два действия. Нужно{" "}
                <span className="font-semibold text-slate-200">{PASS_NEED}</span>{" "}
                верных из{" "}
                <span className="font-semibold text-slate-200">{TOTAL}</span>.
                Без таймера, порядок кнопок на шагах разный — читай текст.
              </p>
              <button
                type="button"
                onClick={() => dispatchMission({ type: "start_quiz" })}
                className="inline-flex w-full justify-center rounded-xl bg-cyan-400 py-3 text-sm font-bold text-slate-950 shadow-[0_24px_60px_-28px_rgba(56,189,248,1)] transition hover:bg-cyan-300 sm:w-auto sm:min-w-[160px]"
              >
                Начать
              </button>
            </div>
          )}

          {phase === "quiz" && current && (
            <div className="animate-mission-panel-enter space-y-4">
              <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                <span className="tabular-nums">
                  шаг {step + 1} / {TOTAL}
                </span>
                <span className="tabular-nums text-slate-300">
                  верно {correct}
                </span>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-slate-800/90">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 transition-[width] duration-500 ease-out"
                  style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
                />
              </div>

              <div className="relative min-h-[4rem] rounded-xl border border-white/10 bg-slate-900/75 p-4">
                <p className="text-center text-[15px] font-semibold leading-snug text-white md:text-[16px]">
                  {current.situation}
                </p>
                {feedback && (
                  <p
                    className={`animate-mission-panel-enter mt-4 text-center text-[13px] font-semibold ${
                      feedback === "ok"
                        ? "text-emerald-400"
                        : "text-amber-300"
                    }`}
                  >
                    {feedback === "ok"
                      ? "Верно: так обычно честнее для команды и сервиса"
                      : "Мимо: так часто экономят время сегодня и платят позже"}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                {optionTiles.map((tile) => {
                  const highlightedOk =
                    feedback === "ok" &&
                    lastPick === "good" &&
                    tile.kind === "good";
                  const highlightedBad =
                    feedback === "bad" &&
                    lastPick === "bad" &&
                    tile.kind === "bad";

                  return (
                    <button
                      key={`${step}-${tile.num}-${tile.kind}`}
                      type="button"
                      disabled={locked || !!feedback}
                      onClick={() => handlePick(tile.kind)}
                      className={`rounded-xl border-2 px-4 py-3 text-left transition disabled:opacity-55 ${
                        highlightedOk
                          ? "border-emerald-400 bg-emerald-500/15 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)]"
                          : highlightedBad
                            ? "border-amber-500 bg-amber-500/10 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.35)]"
                            : "border-white/12 bg-slate-900/80 hover:border-white/25 hover:bg-slate-800/90"
                      }`}
                    >
                      <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-slate-200 tabular-nums">
                          {tile.num}
                        </span>
                        действие
                      </span>
                      <span className="text-[14px] font-medium leading-snug text-slate-100">
                        {tile.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-[12px] text-slate-500">
                Два варианта на шаг — выбери один.
              </p>
            </div>
          )}

          {phase === "done" && (
            <div className="animate-mission-panel-enter relative space-y-6 overflow-hidden px-1 py-1 text-center">
              {VICTORY_STARS_LAYOUT.map((dot, index) => (
                <span
                  key={`${dot.left}-${index}`}
                  className="animate-mission-stars-twinkle pointer-events-none absolute rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.85)]"
                  style={{
                    left: dot.left,
                    top: dot.top,
                    width: dot.size,
                    height: dot.size,
                    animationDelay: dot.delay,
                  }}
                />
              ))}
              <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                <span
                  key={`ring-${correct}`}
                  className="animate-mission-success-ring pointer-events-none absolute inset-[-12px] rounded-full border-[3px] border-emerald-300/90"
                  aria-hidden
                />
                <div className="animate-mission-success-pop relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400/25 text-5xl font-black text-emerald-200 shadow-[0_0_56px_-8px_rgba(52,211,153,0.75)]">
                  ✓
                </div>
              </div>
              <div className="relative space-y-2">
                <h2 className="text-2xl font-black text-white md:text-3xl">
                  {correct}/{TOTAL} — зачёт
                </h2>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-slate-400">
                  Нормальный минимум есть. В жизни сложнее, но логика та же:
                  видимость, эскалация и разбор вместо «замета».
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="relative w-full rounded-2xl bg-emerald-400 py-4 text-base font-bold text-slate-950 shadow-[0_28px_64px_-40px_rgba(16,185,129,1)] hover:bg-emerald-300"
              >
                Назад в комнату
              </button>
            </div>
          )}

          {phase === "failed" && (
            <div className="animate-mission-panel-enter space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-4xl font-black text-red-200 ring-2 ring-red-500/40">
                ×
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">
                  Нужно {PASS_NEED} верных
                </h2>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-slate-400">
                  Сейчас {correct}/{TOTAL}. Повтори попытку или выйди в комнату.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    dispatchMission({ type: "start_quiz" });
                    setFeedback(null);
                    setLocked(false);
                    setLastPick(null);
                  }}
                  className="w-full rounded-2xl bg-cyan-400 py-4 text-base font-bold text-slate-950 hover:bg-cyan-300"
                >
                  Повторить
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

      {phase === "done" && confettiItems.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-[53] overflow-hidden">
          {confettiItems.map((drop, index) => (
            <span
              key={`${index}-${drop.left}`}
              className="absolute rounded-[2px] shadow-md"
              style={{
                left: drop.left,
                top: drop.top,
                width: `${drop.size}px`,
                height: `${Math.max(3, drop.size * 0.55)}px`,
                background: `linear-gradient(135deg, hsl(${drop.hue} 95% 62%), hsl(${drop.hue} 95% 45%))`,
                animationName: "mission-confetti-fall",
                animationDuration: drop.duration,
                animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                animationDelay: drop.delay,
                animationFillMode: "forwards",
                transform: `translate(-50%, 0) rotate(${index * 31}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
