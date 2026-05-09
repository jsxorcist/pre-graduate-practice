"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CLEAR_NEED = 72;

type Phase = "intro" | "calibrate" | "question" | "done" | "failed";

interface TransparencyMissionOverlayProps {
  active: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const QUESTION = {
  text: "Релиз сдвинули на неделю. Что публикуешь в общий канал?",
  good:
    "Факт задержки, причина в двух строках и новая целевая дата — без оптимистичных «ещё чуть-чуть».",
  bad: "«Всё под контролем», пока команда сама не найдёт правду в логах.",
};

function GlassPanel({
  label,
  hint,
  value,
  onChange,
  accentClass,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  accentClass: string;
}) {
  const veilAlpha = 1 - value / 100;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-slate-900/60 shadow-inner">
      <div className="relative px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </span>
          <span
            className={`tabular-nums text-[12px] font-black ${value >= CLEAR_NEED ? "text-emerald-400" : "text-slate-400"}`}
          >
            {value}%
          </span>
        </div>
        <p className="relative z-[1] mt-3 min-h-[2.6rem] text-[13px] leading-snug text-slate-100">
          {hint}
        </p>

        <div
          className="pointer-events-none absolute inset-0 z-[2] rounded-2xl transition-[opacity,backdrop-filter] duration-300"
          style={{
            opacity: veilAlpha,
            backdropFilter: `blur(${8 + veilAlpha * 12}px) saturate(${0.55 + value / 220})`,
            background: `linear-gradient(145deg, rgba(15,23,42,${0.55 + veilAlpha * 0.35}), rgba(30,27,75,${0.35 + veilAlpha * 0.25}))`,
          }}
          aria-hidden
        />

        <div className="relative z-[3] mt-4">
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-emerald-400 ${accentClass}`}
          />
        </div>
      </div>
    </div>
  );
}

export default function TransparencyMissionOverlay({
  active,
  onClose,
  onSuccess,
}: TransparencyMissionOverlayProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [metrics, setMetrics] = useState(24);
  const [risks, setRisks] = useState(22);
  const [roadmap, setRoadmap] = useState(26);
  const [feedback, setFeedback] = useState<null | "ok" | "bad">(null);
  const [locked, setLocked] = useState(false);
  const successRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    successRef.current = false;
    setPhase("intro");
    setMetrics(24);
    setRisks(22);
    setRoadmap(26);
    setFeedback(null);
    setLocked(false);
  }, [active]);

  useEffect(() => {
    if (phase === "done" && !successRef.current) {
      successRef.current = true;
      onSuccess?.();
    }
  }, [phase, onSuccess]);

  const weakest = Math.min(metrics, risks, roadmap);
  const calibrateReady =
    metrics >= CLEAR_NEED && risks >= CLEAR_NEED && roadmap >= CLEAR_NEED;

  /** Пока хоть один слой ниже порога — общий «туман» (самое слабое звено). Без отдельной кнопки. */
  const stackFogStyle = useMemo(() => {
    if (calibrateReady) {
      return {
        filter: "none" as const,
        opacity: 1,
        transition: "filter 0.35s ease, opacity 0.35s ease",
      };
    }
    const t = Math.min(1, weakest / CLEAR_NEED);
    const blurPx = (1 - t) * 9;
    const dim = 0.72 + t * 0.28;
    return {
      filter: `blur(${blurPx.toFixed(2)}px)`,
      opacity: dim,
      transition: "filter 0.35s ease, opacity 0.35s ease",
    };
  }, [calibrateReady, weakest]);

  const handleAnswer = (good: boolean) => {
    if (!active || phase !== "question" || locked) return;
    setLocked(true);
    setFeedback(good ? "ok" : "bad");
    window.setTimeout(() => {
      setFeedback(null);
      setLocked(false);
      if (good) setPhase("done");
      else setPhase("failed");
    }, 560);
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white backdrop-blur-sm">
      {phase === "done" && (
        <div
          className="pointer-events-none absolute inset-0 z-[51] animate-mission-victory-flash"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-black/74" />

      <div
        className={`relative z-[52] w-full max-w-md overflow-hidden rounded-3xl border border-white/18 bg-slate-950/96 shadow-[0_0_88px_-24px_rgba(167,139,250,0.45)] sm:max-w-lg md:max-w-xl ${
          phase === "failed" ? "animate-mission-fail-shake" : ""
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(167,139,250,0.15),transparent_52%)]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-500 via-fuchsia-400 to-cyan-400" />

        <div className="relative px-5 py-6 md:px-6 md:py-8">
          {phase === "intro" && (
            <div className="animate-mission-panel-enter space-y-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-300/95">
                Прозрачность
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">
                Три слоя стекла
              </h1>
              <p className="mx-auto max-w-[21rem] text-[14px] leading-relaxed text-slate-400">
                Три панели закрыты матовым стеклом: метрики, риски, планы. Прозрачность целиком
                упирается в{" "}
                <span className="font-semibold text-slate-200">самый закрытый слой</span> — пока он
                ниже <span className="font-semibold text-slate-200">{CLEAR_NEED}%</span>, картинка
                остаётся мутной. Подтяни каждый ползунок, пока текст не станет читаемым и общий туман
                не рассеется.
              </p>
              <button
                type="button"
                onClick={() => setPhase("calibrate")}
                className="inline-flex w-full justify-center rounded-xl bg-violet-400 py-3 text-sm font-bold text-slate-950 shadow-[0_24px_60px_-28px_rgba(167,139,250,0.95)] transition hover:bg-violet-300 sm:w-auto sm:min-w-[168px]"
              >
                К калибровке
              </button>
            </div>
          )}

          {phase === "calibrate" && (
            <div className="animate-mission-panel-enter space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <span>Калибровка видимости</span>
                  <span className="tabular-nums text-slate-400">
                    мин. слой{" "}
                    <span
                      className={
                        weakest >= CLEAR_NEED ? "font-bold text-emerald-400" : "font-bold text-amber-200/90"
                      }
                    >
                      {weakest}%
                    </span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/90">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-400 to-cyan-400 transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.min(100, (weakest / CLEAR_NEED) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-2" style={stackFogStyle}>
                <div className="space-y-3">
                  <GlassPanel
                    label="Метрики сервиса"
                    hint="p95 задержка 840 мс — очередь инцидента #4421 не drainится."
                    value={metrics}
                    onChange={setMetrics}
                    accentClass="accent-fuchsia-400"
                  />
                  <GlassPanel
                    label="Риски и долги"
                    hint="Два критичных CVE в базовом образе; патч запланирован на пятницу."
                    value={risks}
                    onChange={setRisks}
                    accentClass="accent-cyan-400"
                  />
                  <GlassPanel
                    label="Дорожная карта"
                    hint="Оптимизация отменена в пользу стабилизации — это сознательный trade-off."
                    value={roadmap}
                    onChange={setRoadmap}
                    accentClass="accent-violet-400"
                  />
                </div>
              </div>

              <p className="text-center text-[12px] leading-snug text-slate-500">
                Один низкий ползунок держит весь дашборд в тумане — как один закрытый канал связи для
                всей команды.
              </p>

              <button
                type="button"
                disabled={!calibrateReady}
                onClick={() => setPhase("question")}
                className="w-full rounded-2xl bg-linear-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-bold text-white shadow-[0_24px_48px_-28px_rgba(139,92,246,0.85)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {calibrateReady
                  ? "Дальше — решение в канале"
                  : `Нужно ≥ ${CLEAR_NEED}% на каждой панели (сейчас минимум ${weakest}%)`}
              </button>
            </div>
          )}

          {phase === "question" && (
            <div className="animate-mission-panel-enter space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
                Один выбор
              </p>
              <div className="rounded-2xl border border-white/12 bg-slate-900/75 p-4">
                <p className="text-center text-[15px] font-semibold leading-snug text-white md:text-[16px]">
                  {QUESTION.text}
                </p>
                {feedback && (
                  <p
                    className={`animate-mission-panel-enter mt-4 text-center text-[13px] font-semibold ${
                      feedback === "ok" ? "text-emerald-400" : "text-amber-300"
                    }`}
                  >
                    {feedback === "ok"
                      ? "Так держать: видимость без маскировки"
                      : "Маскировка под контролем редко стареет хорошо"}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  disabled={locked || !!feedback}
                  onClick={() => handleAnswer(true)}
                  className="rounded-xl border-2 border-white/14 bg-slate-900/85 px-4 py-3 text-left transition hover:border-emerald-400/45 hover:bg-slate-800/90 disabled:opacity-55"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Честный статус
                  </span>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-100">
                    {QUESTION.good}
                  </p>
                </button>
                <button
                  type="button"
                  disabled={locked || !!feedback}
                  onClick={() => handleAnswer(false)}
                  className="rounded-xl border-2 border-white/14 bg-slate-900/85 px-4 py-3 text-left transition hover:border-amber-500/35 hover:bg-slate-800/90 disabled:opacity-55"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Спокойный фасад
                  </span>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-100">
                    {QUESTION.bad}
                  </p>
                </button>
              </div>
            </div>
          )}

          {phase === "done" && (
            <div className="animate-mission-panel-enter space-y-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-violet-400/20 text-5xl font-black text-violet-100 shadow-[0_0_56px_-10px_rgba(167,139,250,0.75)] ring-2 ring-violet-400/50">
                ◎
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white md:text-3xl">
                  Стекло снято
                </h2>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-slate-400">
                  Прозрачность тут — не про «красивый UI», а про то, что команда видит те же цифры,
                  что и ты, без слоя магического тумана.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-violet-400 py-4 text-base font-bold text-slate-950 shadow-[0_28px_64px_-40px_rgba(167,139,250,1)] hover:bg-violet-300"
              >
                Назад в комнату
              </button>
            </div>
          )}

          {phase === "failed" && (
            <div className="animate-mission-panel-enter space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 text-4xl font-black text-amber-200 ring-2 ring-amber-500/40">
                ?
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Попробуй иначе</h2>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-slate-400">
                  Прозрачность — когда статус можно проверить, а не «ощутить по атмосфере».
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPhase("question");
                    setFeedback(null);
                    setLocked(false);
                  }}
                  className="w-full rounded-2xl bg-violet-400 py-4 text-base font-bold text-slate-950 hover:bg-violet-300"
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
