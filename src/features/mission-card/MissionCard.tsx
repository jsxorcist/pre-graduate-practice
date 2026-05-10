"use client";

import type { MissionOption } from "@/entities/mission";
import { Card } from "@/shared/ui/card";

type MissionCardProps = {
  option: MissionOption;
  onSelect?: () => void;
};

export function MissionCard({ option, onSelect }: MissionCardProps) {
  const interactive =
    typeof onSelect === "function"
      ? "cursor-pointer hover:-translate-y-1 hover:border-amber-300/50 hover:bg-slate-800/90 active:translate-y-0 "
      : "cursor-default ";
  return (
    <Card
      className={`${interactive}p-8 transition duration-300 md:p-10`}
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-300 md:text-sm">
          Вариант
        </div>
        <h3 className="text-xl font-semibold text-white md:text-2xl">{option.label}</h3>
        <p className="text-base leading-relaxed text-slate-300 md:text-[17px]">{option.description}</p>
      </div>
    </Card>
  );
}
