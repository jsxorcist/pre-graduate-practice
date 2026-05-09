"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "./GameContext";
import { ClerkSquareGlasses } from "./QuestGiverNpc";

/** Совпадает с QuestGiverNpc — не менять без синхронизации. */
const GROUND_Y = 1.545;
const INTERACT_RADIUS = 2.85;
const FEET_BOTTOM_LOCAL = -0.96;
const NPC_BODY_SCALE = 1.38;
const FOOT_ALIGN_Y = -GROUND_Y - FEET_BOTTOM_LOCAL * NPC_BODY_SCALE;

/** Типаж «аналитик»: жилет, буфер у мониторов. */
const DESK_PALETTE = {
  shirt: "#fafafa",
  vest: "#616161",
  pants: "#37474f",
  hair: "#ffe082",
  skin: "#d7ccc8",
  shoes: "#263238",
};

/** Только пока миссия «Прозрачность» — текущая по кампании. */
function DeskBubbleHtml() {
  return (
    <div className="relative w-[min(13rem,calc(100vw-1.5rem))] select-none font-sans">
      <div className="relative rounded-xl border border-indigo-400/35 bg-linear-to-br from-indigo-950/92 via-slate-900/94 to-slate-950/96 px-3 py-2 shadow-[0_18px_44px_-14px_rgba(129,140,248,0.35)] backdrop-blur-md">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-indigo-300/85">
          Миссия 2
        </p>
        <p className="text-[12px] font-bold leading-tight text-white">За стойкой</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
          Три слоя матового стекла — сними маску и выбери честный статус.
        </p>
        <p className="mt-1.5 border-t border-white/10 pt-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-indigo-200/90">
          E — начать миссию
        </p>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2"
        aria-hidden
      >
        <div className="h-2 w-2 -translate-y-px rotate-45 border-b border-r border-indigo-400/35 bg-indigo-950/92" />
      </div>
    </div>
  );
}

interface DeskWorkerNpcProps {
  /** Открыт любой оверлей миссии — попап над этим NPC скрыт */
  missionPanelOpen?: boolean;
  onStartMission?: () => void;
  position?: [number, number, number];
  rotationY?: number;
}

/**
 * Второй офисный NPC — стоит у игрового стола (за монитором со стороны стены).
 */
export default function DeskWorkerNpc({
  missionPanelOpen = false,
  onStartMission,
  position = [5.65, GROUND_Y, -4.05],
  rotationY = -1.05,
}: DeskWorkerNpcProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoBobRef = useRef<THREE.Group>(null);
  const interactWorld = useRef(new THREE.Vector3());
  const p = DESK_PALETTE;
  const shirtMat = { roughness: 0.48, metalness: 0.04 };

  const { playerWorldPositionRef, completedMissions } = useGame();
  const activeMissionIndex = completedMissions.findIndex((done) => !done);
  /** Облако только пока миссия «Прозрачность» — текущая и не сдана. */
  const showBubble = activeMissionIndex === 1;

  const activate = useCallback(() => {
    if (activeMissionIndex !== 1) return;
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
      torsoBobRef.current.position.y = Math.sin(t * 1.6) * 0.01;
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
            style={{ pointerEvents: "none" }}
          >
            <DeskBubbleHtml />
          </Html>
        </Billboard>
      )}

      <group position={[0, FOOT_ALIGN_Y, 0]}>
        <group ref={torsoBobRef} scale={NPC_BODY_SCALE}>
          <mesh position={[0, 0.06, 0.02]} castShadow>
            <boxGeometry args={[0.52, 0.62, 0.38]} />
            <meshStandardMaterial color={p.vest} roughness={0.55} metalness={0.08} />
          </mesh>

          <mesh position={[0, -0.02, 0]} castShadow scale={[1.02, 1, 1.05]}>
            <cylinderGeometry args={[0.26, 0.3, 0.95, 14]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>

          <mesh position={[0, 0.06, 0.305]} castShadow>
            <boxGeometry args={[0.07, 0.62, 0.025]} />
            <meshStandardMaterial color="#e8eaf0" roughness={0.52} metalness={0} />
          </mesh>
          {[0.22, 0.08, -0.06, -0.2].map((py, i) => (
            <mesh key={i} position={[0, py, 0.318]} castShadow>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color="#cfd8dc" roughness={0.35} metalness={0.2} />
            </mesh>
          ))}

          <mesh position={[-0.09, 0.44, 0.26]} rotation={[0.08, -0.35, 0]} castShadow>
            <boxGeometry args={[0.14, 0.06, 0.04]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>
          <mesh position={[0.09, 0.44, 0.26]} rotation={[0.08, 0.35, 0]} castShadow>
            <boxGeometry args={[0.14, 0.06, 0.04]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
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

          <mesh position={[0.38, 0.02, 0.12]} rotation={[0.2, 0, -0.15]} castShadow>
            <boxGeometry args={[0.26, 0.34, 0.02]} />
            <meshStandardMaterial color="#cfd8dc" roughness={0.45} metalness={0.2} />
          </mesh>

          <mesh position={[-0.34, 0.08, 0]} castShadow rotation={[0.28, 0, 0.12]}>
            <capsuleGeometry args={[0.045, 0.36, 6, 8]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>
          <mesh position={[0.34, 0.08, 0]} castShadow rotation={[0.35, 0, -0.12]}>
            <capsuleGeometry args={[0.045, 0.36, 6, 8]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>

          <mesh position={[-0.34, -0.14, 0]} castShadow>
            <boxGeometry args={[0.055, 0.08, 0.055]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>
          <mesh position={[0.34, -0.14, 0]} castShadow>
            <boxGeometry args={[0.055, 0.08, 0.055]} />
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
