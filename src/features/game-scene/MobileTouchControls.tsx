"use client";

import { useCallback, useEffect } from "react";
import { useGame } from "./GameContext";

type DigitalKey = "w" | "a" | "s" | "d";

function setPadKey(
  pad: { w: boolean; a: boolean; s: boolean; d: boolean },
  key: DigitalKey,
  value: boolean,
) {
  pad[key] = value;
}

interface MobileTouchControlsProps {
  /** Не принимать ввод (оверлей миссии, финал кампании и т.д.). */
  disabled?: boolean;
}

/**
 * Сенсорное управление для узкого экрана: D-pad, прыжок (удержание = как пробел), «как E».
 * На широких экранах скрыто — остаётся клавиатура.
 */
export default function MobileTouchControls({
  disabled = false,
}: MobileTouchControlsProps) {
  const { mobilePadRef, queueMobileJump, pulseInteractKeyE, jumpButtonHeldRef } =
    useGame();

  const clearPad = useCallback(() => {
    const p = mobilePadRef.current;
    p.w = false;
    p.a = false;
    p.s = false;
    p.d = false;
    jumpButtonHeldRef.current = false;
  }, [mobilePadRef, jumpButtonHeldRef]);

  useEffect(() => {
    if (disabled) clearPad();
  }, [disabled, clearPad]);

  const bindHold = (key: DigitalKey) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setPadKey(mobilePadRef.current, key, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      setPadKey(mobilePadRef.current, key, false);
    },
    onPointerCancel: () => {
      setPadKey(mobilePadRef.current, key, false);
    },
    onLostPointerCapture: () => {
      setPadKey(mobilePadRef.current, key, false);
    },
  });

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[48] flex items-end justify-between gap-3 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden ${
        disabled ? "pointer-events-none opacity-0" : "pointer-events-auto"
      }`}
      aria-hidden={disabled}
    >
      {/* D-pad */}
      <div className="flex select-none flex-col items-center gap-1">
        <TouchBtn
          label="Вперёд"
          className="h-14 w-14 rounded-2xl border border-white/25 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md active:bg-black/55"
          {...bindHold("w")}
        >
          ▲
        </TouchBtn>
        <div className="flex gap-1">
          <TouchBtn
            label="Влево"
            className="h-14 w-14 rounded-2xl border border-white/25 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md active:bg-black/55"
            {...bindHold("a")}
          >
            ◀
          </TouchBtn>
          <TouchBtn
            label="Назад"
            className="h-14 w-14 rounded-2xl border border-white/25 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md active:bg-black/55"
            {...bindHold("s")}
          >
            ▼
          </TouchBtn>
          <TouchBtn
            label="Вправо"
            className="h-14 w-14 rounded-2xl border border-white/25 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md active:bg-black/55"
            {...bindHold("d")}
          >
            ▶
          </TouchBtn>
        </div>
      </div>

      {/* Действия */}
      <div className="flex flex-col items-end gap-2">
        <TouchBtn
          label="Прыжок"
          className="h-16 min-w-[4.5rem] rounded-2xl border border-cyan-400/40 bg-cyan-950/55 px-4 text-sm font-bold text-cyan-100 shadow-[0_8px_28px_-8px_rgba(34,211,238,0.45)] backdrop-blur-md active:bg-cyan-900/65"
          onPointerDown={(e) => {
            if (disabled) return;
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            jumpButtonHeldRef.current = true;
            queueMobileJump();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            jumpButtonHeldRef.current = false;
          }}
          onPointerCancel={() => {
            jumpButtonHeldRef.current = false;
          }}
          onLostPointerCapture={() => {
            jumpButtonHeldRef.current = false;
          }}
        >
          Прыжок
        </TouchBtn>
        <TouchBtn
          label="Взаимодействие"
          className="h-14 min-w-[4.5rem] rounded-2xl border border-fuchsia-400/35 bg-fuchsia-950/45 px-3 text-sm font-bold text-fuchsia-100 shadow-lg backdrop-blur-md active:bg-fuchsia-900/55"
          onPointerDown={(e) => {
            if (disabled) return;
            e.preventDefault();
            pulseInteractKeyE();
          }}
        >
          Действие
        </TouchBtn>
      </div>
    </div>
  );
}

function TouchBtn({
  children,
  label,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`touch-manipulation cursor-pointer select-none disabled:cursor-not-allowed ${className}`}
      style={{ touchAction: "none" }}
      {...rest}
    >
      {children}
    </button>
  );
}
