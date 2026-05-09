import type { MissionOption } from "@/entities/mission";
import { Card } from "@/shared/ui/card";

type MissionCardProps = {
  option: MissionOption;
  onSelect?: () => void;
};

export function MissionCard({ option, onSelect }: MissionCardProps) {
  return (
    <Card
      className="cursor-pointer p-8 transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-slate-800/90 md:p-10"
      onClick={onSelect}
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
