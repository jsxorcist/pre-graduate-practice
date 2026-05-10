"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GameProvider, useGame } from "./GameContext";
import EpicOverlay from "../ui-epic-overlay/EpicOverlay";
import MissionOverlay from "../mission-overlay/MissionOverlay";
import TransparencyMissionOverlay from "../mission-overlay/TransparencyMissionOverlay";
import SpeedMissionOverlay from "../mission-overlay/SpeedMissionOverlay";
import MissionHud from "./MissionHud";
import AchievementToast from "./AchievementToast";
import Player from "./Player";
import Room from "./Room";
import QuestGiverNpc from "./QuestGiverNpc";
import DeskWorkerNpc from "./DeskWorkerNpc";
import SpeedCoachNpc from "./SpeedCoachNpc";
import GameCameraRig from "./GameCameraRig";
import CampaignVictoryOverlay from "./CampaignVictoryOverlay";
import MobileTouchControls from "./MobileTouchControls";
import CheerfulBgm from "./CheerfulBgm";

export default function GameScene() {
  return (
    <GameProvider>
      <GameSceneInner />
    </GameProvider>
  );
}

function GameSceneInner() {
  const {
    completeMission,
    unlockAchievement,
    flushDeferredAchievementToasts,
    resetCampaign,
    completedMissions,
  } = useGame();
  const [overlayActive, setOverlayActive] = useState(false);
  const [playerRespawnNonce, setPlayerRespawnNonce] = useState(0);
  const [missionActive, setMissionActive] = useState(false);
  const [transparencyMissionActive, setTransparencyMissionActive] = useState(false);
  const [speedMissionActive, setSpeedMissionActive] = useState(false);
  const [campaignVictoryOpen, setCampaignVictoryOpen] = useState(false);
  const overlayTimer = useRef<number | null>(null);
  const campaignVictoryShownRef = useRef(false);

  /** Закрыть эпичный оверлей турбо и зареспавнить героя в комнате (миссии и достижения не сбрасываются). */
  const finishEpicTurboExperience = useCallback(() => {
    if (overlayTimer.current != null) {
      window.clearTimeout(overlayTimer.current);
      overlayTimer.current = null;
    }
    setOverlayActive(false);
    setPlayerRespawnNonce((n) => n + 1);
  }, []);

  const handleEpicLaunch = useCallback(() => {
    unlockAchievement("epic-reactor");
    setOverlayActive(true);
    if (overlayTimer.current != null) {
      window.clearTimeout(overlayTimer.current);
    }
    overlayTimer.current = window.setTimeout(() => {
      finishEpicTurboExperience();
    }, 5000);
  }, [unlockAchievement, finishEpicTurboExperience]);

  useEffect(
    () => () => {
      if (overlayTimer.current != null) window.clearTimeout(overlayTimer.current);
    },
    [],
  );

  const handleActivateMission = useCallback(() => {
    setMissionActive(true);
  }, []);

  const handleCloseMission = useCallback(() => {
    setMissionActive(false);
    flushDeferredAchievementToasts();
  }, [flushDeferredAchievementToasts]);

  const handleMissionSuccess = useCallback(() => {
    completeMission(0);
  }, [completeMission]);

  const handleTransparencyMissionSuccess = useCallback(() => {
    completeMission(1);
  }, [completeMission]);

  const handleSpeedMissionSuccess = useCallback(() => {
    completeMission(2);
  }, [completeMission]);

  const hideNpcBubbles =
    missionActive ||
    transparencyMissionActive ||
    speedMissionActive ||
    campaignVictoryOpen;

  const allMissionsDone =
    completedMissions.length > 0 && completedMissions.every(Boolean);

  useEffect(() => {
    if (
      !allMissionsDone ||
      missionActive ||
      transparencyMissionActive ||
      speedMissionActive ||
      campaignVictoryShownRef.current
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      setCampaignVictoryOpen(true);
      campaignVictoryShownRef.current = true;
    }, 420);
    return () => window.clearTimeout(id);
  }, [
    allMissionsDone,
    missionActive,
    transparencyMissionActive,
    speedMissionActive,
  ]);

  const handleCampaignVictoryClose = useCallback(() => {
    setCampaignVictoryOpen(false);
  }, []);

  const handleCampaignRestart = useCallback(() => {
    resetCampaign();
    setCampaignVictoryOpen(false);
    campaignVictoryShownRef.current = false;
    flushDeferredAchievementToasts();
  }, [resetCampaign, flushDeferredAchievementToasts]);

  return (
    <div className="relative h-screen w-full touch-none overscroll-none bg-linear-to-b from-sky-200 to-yellow-200">
      <Canvas
        shadows
        camera={{ position: [0, 4, -6], fov: 60, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <hemisphereLight args={["#ffffff", "#b0bec5", 0.4]} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[0, 5, 0]} intensity={0.8} color="#ff9800" />
          <pointLight position={[4, 3, 4]} intensity={0.6} color="#e91e63" />
          <Player
            onEpicLaunch={handleEpicLaunch}
            movementLocked={hideNpcBubbles}
            respawnNonce={playerRespawnNonce}
          />
          <GameCameraRig />
          <Room />
          <QuestGiverNpc
            onActivateMission={handleActivateMission}
            missionPanelOpen={hideNpcBubbles}
          />
          <DeskWorkerNpc
            missionPanelOpen={hideNpcBubbles}
            onStartMission={() => setTransparencyMissionActive(true)}
          />
          <SpeedCoachNpc
            missionPanelOpen={hideNpcBubbles}
            onStartMission={() => setSpeedMissionActive(true)}
          />
        </Suspense>
      </Canvas>

      {missionActive && (
        <MissionOverlay
          active={missionActive}
          onClose={handleCloseMission}
          onSuccess={handleMissionSuccess}
        />
      )}
      {transparencyMissionActive && (
        <TransparencyMissionOverlay
          active={transparencyMissionActive}
          onClose={() => {
            setTransparencyMissionActive(false);
            flushDeferredAchievementToasts();
          }}
          onSuccess={handleTransparencyMissionSuccess}
        />
      )}
      {speedMissionActive && (
        <SpeedMissionOverlay
          active={speedMissionActive}
          onClose={() => {
            setSpeedMissionActive(false);
            flushDeferredAchievementToasts();
          }}
          onSuccess={handleSpeedMissionSuccess}
        />
      )}

      <MissionHud missionPanelOpen={hideNpcBubbles} />
      <AchievementToast />

      <CampaignVictoryOverlay
        active={campaignVictoryOpen}
        onClose={handleCampaignVictoryClose}
        onRestart={handleCampaignRestart}
      />

      <MobileTouchControls disabled={hideNpcBubbles} />

      <CheerfulBgm />

      <div className="absolute top-3 left-3 z-40 hidden max-w-[13rem] select-none rounded-lg border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white shadow-lg backdrop-blur-md lg:block">
        <h1 className="text-sm font-bold tracking-tight text-yellow-300 md:text-base">
          Ядро — комната
        </h1>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-300 md:text-xs">
          Прогресс миссий — панель справа; на телефоне — кнопка «Кампания» сверху
        </p>
        <p className="mt-2 text-[10px] leading-snug text-slate-200/95 md:text-xs">
          <span className="font-semibold text-cyan-200">WASD</span> — движение ·{" "}
          <span className="font-semibold text-cyan-200">Пробел</span> — прыжок ·{" "}
          <span className="font-semibold text-cyan-200">E</span> — взаимодействие
        </p>
      </div>

      <EpicOverlay active={overlayActive} onContinue={finishEpicTurboExperience} />
    </div>
  );
}
