/** Достижения в тематике ценностей и офиса — разблокируются по ходу игры. */

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  "values-responsibility": {
    id: "values-responsibility",
    title: "Якорь включён",
    description: "Первая опора — ответственность: решения приняты, не спрятаны.",
    icon: "📌",
  },
  "values-transparency": {
    id: "values-transparency",
    title: "Видно насквозь",
    description: "Прозрачность не для отчёта: слой стекла снят, статус честный.",
    icon: "🔭",
  },
  "values-velocity": {
    id: "values-velocity",
    title: "Окно поймано",
    description: "Скорость как ритм: попал в устойчивое окно поставки.",
    icon: "⚡",
  },
  "campaign-trinity": {
    id: "campaign-trinity",
    title: "Три опоры офиса",
    description: "Ответственность, прозрачность и скорость — кампания закрыта.",
    icon: "🏢",
  },
  "epic-reactor": {
    id: "epic-reactor",
    title: "Реактор на минималках",
    description: "Турбо-режим запущен. Отдел кадров пока не в курсе.",
    icon: "🚀",
  },
  "culture-overclock": {
    id: "culture-overclock",
    title: "Дофамин на всех этажах",
    description: "Ценности не просто прочитаны — прожиты в мини-играх.",
    icon: "✨",
  },
};

/** Порядок отображения в панели. */
export const ACHIEVEMENT_ORDER: string[] = [
  "values-responsibility",
  "values-transparency",
  "values-velocity",
  "campaign-trinity",
  "culture-overclock",
  "epic-reactor",
];

/** Автоматически при сдаче миссии по индексу. */
export const MISSION_INDEX_TO_ACHIEVEMENT: (string | null)[] = [
  "values-responsibility",
  "values-transparency",
  "values-velocity",
];
