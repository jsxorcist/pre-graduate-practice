"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";

type ConfettiDrop = {
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  hue: number;
};

function buildConfetti(count: number): ConfettiDrop[] {
  return Array.from({ length: count }, () => ({
    left: `${2 + Math.random() * 96}%`,
    top: `${-12 + Math.random() * 28}%`,
    delay: `${(Math.random() * 0.55).toFixed(2)}s`,
    duration: `${2.4 + Math.random() * 2.2}s`,
    size: 5 + Math.round(Math.random() * 11),
    hue: Math.floor(Math.random() * 360),
  }));
}

const SPEECH_LINES = [
  {
    tag: "Трансляция из ядра",
    text: "Внимание, оператор этажной подстанции: голограмма стабильности только что переписала себя три раза подряд — и каждый раз честно.",
  },
  {
    tag: null,
    text: "Ответственность у тебя теперь не абстракция из слайда, а привычка. Прозрачность — не стекло для красоты, а окно, через которое видно статус. Скорость — не паническая кнопка, а ритм, когда ты попадаешь в зелёную зону, а не в оправдания.",
  },
  {
    tag: null,
    text: "Три опоры офиса подписаны, печать «культура» не отрывается от бумаги от счастья. Конфетти из бюджета «развитие» одобрено без тендера — просто потому что ты дошёл(ла) до конца.",
  },
  {
    tag: "Финал",
    text: "Лифт на все этажи открыт. Ценности перестали быть пунктом в презентации — они уже в продакшене, без очереди «потом разберём». Можно выдохнуть, закрыть окно и начать историю с чистого листа — если захочешь ещё один круг.",
  },
];

interface CampaignVictoryOverlayProps {
  active: boolean;
  /** Только закрыть оверлей, прогресс сохранить. */
  onClose: () => void;
  /** Сбросить миссии и достижения кампании, закрыть окно. */
  onRestart: () => void;
}

export default function CampaignVictoryOverlay({
  active,
  onClose,
  onRestart,
}: CampaignVictoryOverlayProps) {
  const [confetti, setConfetti] = useState<ConfettiDrop[]>([]);

  useEffect(() => {
    if (!active) {
      setConfetti([]);
      return;
    }
    setConfetti(buildConfetti(72));
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-victory-title"
    >
      <div
        className="pointer-events-none absolute inset-0 animate-mission-victory-flash z-[61]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-linear-to-b from-indigo-950/92 via-slate-950/94 to-black/96 backdrop-blur-md" />

      {/* Конфетти — длинное падение через весь экран */}
      <div className="pointer-events-none absolute inset-0 z-[62] overflow-hidden">
        {confetti.map((drop, index) => (
          <span
            key={`c-${index}-${drop.left}`}
            className="absolute rounded-[2px] shadow-md"
            style={{
              left: drop.left,
              top: drop.top,
              width: `${drop.size}px`,
              height: `${Math.max(4, drop.size * 0.55)}px`,
              background: `linear-gradient(135deg, hsl(${drop.hue} 95% 62%), hsl(${(drop.hue + 40) % 360} 90% 48%))`,
              animationName: "campaign-confetti-fall-screen",
              animationDuration: drop.duration,
              animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              animationDelay: drop.delay,
              animationIterationCount: "infinite",
              animationFillMode: "both",
            }}
          />
        ))}
      </div>

      <div className="relative z-[63] flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-36 pt-10 sm:px-8">
        <div className="pointer-events-none mb-6 flex h-20 w-20 animate-campaign-trophy items-center justify-center rounded-full border-2 border-amber-300/50 bg-linear-to-br from-amber-400/30 to-fuchsia-600/25 text-4xl shadow-[0_0_48px_-6px_rgba(251,191,36,0.55)]">
          <span aria-hidden>🏢</span>
        </div>

        <p className="animate-campaign-line-pop mb-2 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300/95">
          Кампания закрыта
        </p>
        <h1
          id="campaign-victory-title"
          className="animate-campaign-line-pop max-w-xl text-center text-2xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-3xl md:text-4xl"
          style={{ animationDelay: "0.08s" }}
        >
          Три опоры — одна команда
        </h1>

        <div className="mt-10 max-w-lg space-y-6 text-center">
          {SPEECH_LINES.map((block, i) => (
            <div
              key={i}
              className="animate-campaign-line-pop space-y-2"
              style={{ animationDelay: `${0.18 + i * 0.14}s` }}
            >
              {block.tag ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-300/90">
                  {block.tag}
                </p>
              ) : null}
              <p className="text-[15px] leading-relaxed text-slate-200/95 md:text-[16px]">
                {block.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Низ: закрыть / начать сначала */}
      <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[64] border-t border-white/10 bg-black/55 px-4 py-5 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full py-3.5 text-base"
            onClick={onClose}
          >
            Закрыть
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full py-4 text-base shadow-[0_8px_32px_-8px_rgba(249,115,22,0.55)]"
            onClick={onRestart}
          >
            Начать сначала
          </Button>
          <p className="text-center text-[11px] leading-snug text-slate-400">
            «Начать сначала» обнуляет три миссии и связанные достижения кампании.
          </p>
        </div>
      </div>
    </div>
  );
}
