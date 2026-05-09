/** Три ключевые миссии (совпадают с README / концепцией). */
export const HUD_MISSIONS = [
  {
    id: "m1",
    title: "Ответственность",
    flavor: "5 ситуаций — выбор из двух",
  },
  { id: "m2", title: "Прозрачность", flavor: "Три слоя стекла и честный статус" },
  {
    id: "m3",
    title: "Скорость",
    flavor: "Мини-игра «окно поставки» — лови зелёную зону",
  },
] as const;

export const MISSION_TOTAL = HUD_MISSIONS.length;
