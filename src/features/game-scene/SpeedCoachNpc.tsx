"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "./GameContext";
import { ClerkSquareGlasses } from "./QuestGiverNpc";

const GROUND_Y = 1.545;
const INTERACT_RADIUS = 2.85;
const FEET_BOTTOM_LOCAL = -0.96;
const NPC_BODY_SCALE = 1.38;
const FOOT_ALIGN_Y = -GROUND_Y - FEET_BOTTOM_LOCAL * NPC_BODY_SCALE;

const PALETTE = {
  shirt: "#fffde7",
  vest: "#ef6c00",
  pants: "#37474f",
  hair: "#212121",
  skin: "#ffccbc",
  shoes: "#263238",
};

function SpeedBubbleHtml() {
  return (
    <div className="relative w-[min(13rem,calc(100vw-1.5rem))] select-none font-sans">
      <div className="relative rounded-xl border border-amber-400/40 bg-linear-to-br from-amber-950/92 via-slate-900/94 to-slate-950/96 px-3 py-2 shadow-[0_18px_44px_-14px_rgba(251,191,36,0.4)] backdrop-blur-md">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-amber-300/90">
          Миссия 3
        </p>
        <p className="text-[12px] font-bold leading-tight text-white">У кресла</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
          Мини-игра «окно поставки»: останови стрелку в зелёной зоне.
        </p>
        <p className="mt-1.5 border-t border-white/10 pt-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-amber-200/90">
          E — начать миссию
        </p>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2"
        aria-hidden
      >
        <div className="h-2 w-2 -translate-y-px rotate-45 border-b border-r border-amber-400/40 bg-amber-950/92" />
      </div>
    </div>
  );
}

interface SpeedCoachNpcProps {
  missionPanelOpen?: boolean;
  onStartMission?: () => void;
  position?: [number, number, number];
  rotationY?: number;
}

/**
 * Третий NPC — миссия «Скорость» (устойчивый темп).
 */
export default function SpeedCoachNpc({
  missionPanelOpen = false,
  onStartMission,
  position = [-4.35, GROUND_Y, 2.85],
  rotationY = 0.55,
}: SpeedCoachNpcProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoBobRef = useRef<THREE.Group>(null);
  const interactWorld = useRef(new THREE.Vector3());
  const p = PALETTE;
  const shirtMat = { roughness: 0.48, metalness: 0.04 };

  const { playerWorldPositionRef, completedMissions } = useGame();
  const activeMissionIndex = completedMissions.findIndex((done) => !done);
  const showBubble = activeMissionIndex === 2;

  const activate = useCallback(() => {
    if (activeMissionIndex !== 2) return;
    onStartMission?.();
  }, [activeMissionIndex, onStartMission]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat) return;
      const g = groupRef.current;
      if (!g) return;
      g.getWorldPosition(interactWorld.current);
      interactWorld.current.y += 0.55;
      const distSq = playerWorldPositionRef.current.distanceToSquared(
        interactWorld.current,
      );
      if (distSq < INTERACT_RADIUS * INTERACT_RADIUS) {
        activate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activate, activeMissionIndex, playerWorldPositionRef]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (torsoBobRef.current) {
      torsoBobRef.current.position.y = Math.sin(t * 1.55) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} castShadow>
      {!missionPanelOpen && showBubble && (
        <Billboard follow position={[0, 2.38, 0]}>
          <Html
            center
            distanceFactor={7}
            transform
            zIndexRange={[8, 32]}
            style={{ pointerEvents: "none" }}
          >
            <SpeedBubbleHtml />
          </Html>
        </Billboard>
      )}

      <group position={[0, FOOT_ALIGN_Y, 0]}>
        <group ref={torsoBobRef} scale={NPC_BODY_SCALE}>
          <mesh position={[0, 0.06, 0.02]} castShadow>
            <boxGeometry args={[0.52, 0.62, 0.38]} />
            <meshStandardMaterial color={p.vest} roughness={0.52} metalness={0.1} />
          </mesh>

          <mesh position={[0, -0.02, 0]} castShadow scale={[1.02, 1, 1.05]}>
            <cylinderGeometry args={[0.26, 0.3, 0.95, 14]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>

          <mesh position={[0, 0.06, 0.305]} castShadow>
            <boxGeometry args={[0.07, 0.62, 0.025]} />
            <meshStandardMaterial color="#fff8e1" roughness={0.52} metalness={0} />
          </mesh>

          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.18, 12]} />
            <meshStandardMaterial color={p.skin} roughness={0.48} />
          </mesh>

          <mesh position={[0, 0.78, 0]} castShadow>
            <sphereGeometry args={[0.2, 18, 16]} />
            <meshStandardMaterial color={p.skin} roughness={0.45} />
          </mesh>

          <mesh position={[0, 0.97, 0]} castShadow scale={[1.02, 0.56, 1.02]}>
            <sphereGeometry args={[0.23, 22, 18]} />
            <meshStandardMaterial color={p.hair} roughness={0.82} metalness={0} />
          </mesh>

          <ClerkSquareGlasses offsetY={0.82} />

          <mesh position={[-0.34, 0.08, 0]} castShadow rotation={[0.28, 0, 0.12]}>
            <capsuleGeometry args={[0.045, 0.36, 6, 8]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>
          <mesh position={[0.34, 0.08, 0]} castShadow rotation={[0.35, 0, -0.12]}>
            <capsuleGeometry args={[0.045, 0.36, 6, 8]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>

          <mesh position={[-0.13, -0.58, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.52, 6, 8]} />
            <meshStandardMaterial color={p.pants} roughness={0.42} />
          </mesh>
          <mesh position={[0.13, -0.58, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.52, 6, 8]} />
            <meshStandardMaterial color={p.pants} roughness={0.42} />
          </mesh>
          <mesh position={[-0.13, -0.88, 0.05]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.26]} />
            <meshStandardMaterial color={p.shoes} roughness={0.55} />
          </mesh>
          <mesh position={[0.13, -0.88, 0.05]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.26]} />
            <meshStandardMaterial color={p.shoes} roughness={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
