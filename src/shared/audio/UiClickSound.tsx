"use client";

import { useEffect } from "react";
import { playUiClick } from "./uiClickSfx";

/** Глобальный звук короткого отклика для кнопок (см. `data-no-ui-click` для исключений). */
export function UiClickSound() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;

      const el = e.target;
      if (!(el instanceof Element)) return;

      if (el.closest("[data-no-ui-click]")) return;

      const host = el.closest("button, [role='button']");
      if (!host) return;

      if (
        host.getAttribute("aria-disabled") === "true" ||
        host.hasAttribute("disabled")
      ) {
        return;
      }
      if (host instanceof HTMLButtonElement && host.disabled) return;

      playUiClick();
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
  }, []);

  return null;
}
