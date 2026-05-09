"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import { MISSION_INDEX_TO_ACHIEVEMENT } from "./achievementMeta";
import { MISSION_TOTAL } from "./missionMeta";

interface GameContextType {
  playerWorldPositionRef: MutableRefObject<THREE.Vector3>;
  completedMissions: boolean[];
  completeMission: (index: number) => void;
  unlockedAchievementIds: string[];
  /** Очередь id для тостов (по одному за раз). */
  achievementToastQueue: string[];
  unlockAchievement: (id: string, opts?: { silent?: boolean }) => void;
  /** Вынести отложенные тосты в очередь (после «Назад в комнату»). */
  flushDeferredAchievementToasts: () => void;
  dismissAchievementToast: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const playerWorldPositionRef = useRef(new THREE.Vector3(0, 1.545, 0));
  const [completedMissions, setCompletedMissions] = useState<boolean[]>(() =>
    Array.from({ length: MISSION_TOTAL }, () => false),
  );
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [achievementToastQueue, setAchievementToastQueue] = useState<string[]>([]);
  const unlockedIdsRef = useRef<Set<string>>(new Set());
  const deferredToastIdsRef = useRef<string[]>([]);

  const completeMission = useCallback((index: number) => {
    setCompletedMissions((prev) => {
      if (index < 0 || index >= MISSION_TOTAL) return prev;
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  const unlockAchievement = useCallback((id: string, opts?: { silent?: boolean }) => {
    if (unlockedIdsRef.current.has(id)) return;
    unlockedIdsRef.current.add(id);
    setUnlockedAchievementIds((prev) => [...prev, id]);
    const silent = opts?.silent ?? false;
    if (silent) {
      deferredToastIdsRef.current.push(id);
    } else {
      setAchievementToastQueue((q) => [...q, id]);
    }
  }, []);

  const flushDeferredAchievementToasts = useCallback(() => {
    const ids = deferredToastIdsRef.current;
    if (ids.length === 0) return;
    deferredToastIdsRef.current = [];
    setAchievementToastQueue((q) => [...q, ...ids]);
  }, []);

  const dismissAchievementToast = useCallback(() => {
    setAchievementToastQueue((q) => q.slice(1));
  }, []);

  useEffect(() => {
    completedMissions.forEach((done, i) => {
      if (!done) return;
      const aid = MISSION_INDEX_TO_ACHIEVEMENT[i];
      if (aid) unlockAchievement(aid, { silent: true });
    });
    if (
      completedMissions.length === MISSION_TOTAL &&
      completedMissions.every(Boolean)
    ) {
      unlockAchievement("campaign-trinity", { silent: true });
      unlockAchievement("culture-overclock", { silent: true });
    }
  }, [completedMissions, unlockAchievement]);

  return (
    <GameContext.Provider
      value={{
        playerWorldPositionRef,
        completedMissions,
        completeMission,
        unlockedAchievementIds,
        achievementToastQueue,
        unlockAchievement,
        flushDeferredAchievementToasts,
        dismissAchievementToast,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
