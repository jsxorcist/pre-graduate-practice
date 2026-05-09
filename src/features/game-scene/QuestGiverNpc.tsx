"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "./GameContext";

/** Совпадает с корнем игрока на полу — те же масштабы тела. */
const GROUND_Y = 1.545;
const INTERACT_RADIUS = 2.85;
/**
 * Герой визуально ~в 1.5× выше старого NPC (длинный торс + ноги). Масштабируем тело целиком.
 * Нижняя точка обуви в несжатых локальных координатах (~−0.96).
 */
const FEET_BOTTOM_LOCAL = -0.96;
/** Подгон под рост героя (~макушка world y≈2.85 при тех же «ступнях» y=0). */
const NPC_BODY_SCALE = 1.38;
/** После scale ступни на полу: worldY = GROUND_Y + align + FEET_BOTTOM_LOCAL * scale = 0 */
const FOOT_ALIGN_Y = -GROUND_Y - FEET_BOTTOM_LOCAL * NPC_BODY_SCALE;

const FRAME_BLACK = "#0a0a0a";

export type QuestGiverVariant = 0 | 1 | 2;

export const QUEST_GIVER_VARIANT_COUNT = 3 as const;

type Palette = {
  /** Светлая офисная рубашка */
  shirt: string;
  pants: string;
  tie?: string;
  vest?: string;
  hair: string;
  skin: string;
  shoes: string;
  skirt: boolean;
};

/** Три типажа: всегда рубашка + брюки/юбка; отличаются галстук / жилет / волосы. */
const PALETTES: Palette[] = [
  {
    shirt: "#f5f5f5",
    pants: "#263238",
    tie: "#b71c1c",
    hair: "#4e342e",
    skin: "#eecab0",
    shoes: "#1a1a1a",
    skirt: false,
  },
  {
    shirt: "#fafafa",
    vest: "#616161",
    pants: "#37474f",
    hair: "#a1887f",
    skin: "#d7ccc8",
    shoes: "#263238",
    skirt: false,
  },
  {
    shirt: "#eceff1",
    pants: "#263238",
    hair: "#3e2723",
    skin: "#ffccbc",
    shoes: "#4e342e",
    skirt: true,
  },
];

/** Чёрные квадратные очки: замкнутая рамка (не «скобки») + лёгкие зрачки за прорезями. */
export function ClerkSquareGlasses({ offsetY }: { offsetY: number }) {
  const z = 0.175;
  const y = offsetY;
  const eyeCx = 0.076;
  const barT = 0.012;
  const barD = 0.018;
  /** Полуось «дыры» под глаз */
  const innerHalf = 0.027;
  /** Внешний край рамки */
  const outerHalf = innerHalf + barT;

  const EyeRing = ({ cx }: { cx: number }) => (
    <group position={[cx, y, z]}>
      <mesh position={[0, outerHalf - barT / 2, 0]} castShadow>
        <boxGeometry args={[outerHalf * 2, barT, barD]} />
        <meshStandardMaterial color={FRAME_BLACK} roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh position={[0, -outerHalf + barT / 2, 0]} castShadow>
        <boxGeometry args={[outerHalf * 2, barT, barD]} />
        <meshStandardMaterial color={FRAME_BLACK} roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh position={[-outerHalf + barT / 2, 0, 0]} castShadow>
        <boxGeometry args={[barT, outerHalf * 2, barD]} />
        <meshStandardMaterial color={FRAME_BLACK} roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh position={[outerHalf - barT / 2, 0, 0]} castShadow>
        <boxGeometry args={[barT, outerHalf * 2, barD]} />
        <meshStandardMaterial color={FRAME_BLACK} roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0, -0.004]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshStandardMaterial color="#3e2723" roughness={0.65} />
      </mesh>
    </group>
  );

  return (
    <group>
      <EyeRing cx={-eyeCx} />
      <EyeRing cx={eyeCx} />
      {/* Перемычка между оправами (~расстояние между внутренними краями) */}
      <mesh position={[0, y, z]} castShadow>
        <boxGeometry args={[0.066, barT, barD]} />
        <meshStandardMaterial color={FRAME_BLACK} roughness={0.5} metalness={0.12} />
      </mesh>
    </group>
  );
}

interface QuestGiverNpcProps {
  onActivateMission?: () => void;
  variant?: QuestGiverVariant;
  position?: [number, number, number];
  /** Фиксированный поворот в плане (радианы); по умолчанию — лицом к центру комнаты (−Z). */
  rotationY?: number;
  /** Открыт любой оверлей миссии — попап над NPC не показывается. */
  missionPanelOpen?: boolean;
}

/** Только пока миссия 1 — текущая по кампании (родитель не монтирует облако иначе). */
function MissionBubbleHtml() {
  const shell =
    "border-white/20 bg-linear-to-br from-slate-800/94 via-slate-900/96 to-slate-950/98 shadow-[0_24px_60px_-18px_rgba(56,189,248,0.35)]";

  return (
    <div className="relative w-[min(14rem,calc(100vw-1.5rem))] select-none font-sans">
      <div className={`relative rounded-xl border px-3 py-2 backdrop-blur-md ${shell}`}>
        <div className="mb-0.5 flex items-start gap-1.5">
          <span
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300/20 text-[10px] font-bold text-amber-100 ring-1 ring-amber-300/35"
            aria-hidden
          >
            !
          </span>
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Квест
            </p>
            <p className="text-[12px] font-bold leading-tight tracking-tight text-white">
              Активное задание
            </p>
          </div>
        </div>
        <p className="pl-[1.625rem] text-[11px] leading-snug text-slate-300/95">
          Пять решений об ответственности
        </p>
        <p className="mt-1.5 border-t border-white/10 pl-[1.625rem] pt-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-cyan-200/85">
          E — начать
        </p>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2"
        aria-hidden
      >
        <div className="h-2 w-2 -translate-y-px rotate-45 border-b border-r border-white/18 bg-slate-900/96" />
      </div>
    </div>
  );
}

export default function QuestGiverNpc({
  onActivateMission,
  variant: variantProp,
  position = [0, GROUND_Y, 4],
  rotationY = Math.PI,
  missionPanelOpen = false,
}: QuestGiverNpcProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoBobRef = useRef<THREE.Group>(null);
  const interactWorld = useRef(new THREE.Vector3());

  const [resolvedVariant] = useState<QuestGiverVariant>(() =>
    variantProp !== undefined
      ? variantProp
      : (Math.floor(Math.random() * 3) as QuestGiverVariant),
  );
  const variant = variantProp ?? resolvedVariant;
  const p = PALETTES[variant];

  const { playerWorldPositionRef, completedMissions } = useGame();
  const activeMissionIndex = completedMissions.findIndex((done) => !done);
  /** Облако только пока миссия «Ответственность» — текущая и не сдана. */
  const showBubble = activeMissionIndex === 0;

  const activate = useCallback(() => {
    if (activeMissionIndex !== 0) return;
    onActivateMission?.();
  }, [activeMissionIndex, onActivateMission]);

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
      torsoBobRef.current.position.y = Math.sin(t * 1.8) * 0.012;
    }
  });

  const shirtMat = { roughness: 0.48, metalness: 0.04 };

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} castShadow>
      {!missionPanelOpen && showBubble && (
        <Billboard
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[0, 2.38, 0]}
        >
          <Html
            center
            distanceFactor={7}
            transform
            style={{ pointerEvents: "none" }}
          >
            <MissionBubbleHtml />
          </Html>
        </Billboard>
      )}
      <group position={[0, FOOT_ALIGN_Y, 0]}>
        <group ref={torsoBobRef} scale={NPC_BODY_SCALE}>
          {p.vest && (
            <mesh position={[0, 0.06, 0.02]} castShadow>
              <boxGeometry args={[0.52, 0.62, 0.38]} />
              <meshStandardMaterial color={p.vest} roughness={0.55} metalness={0.08} />
            </mesh>
          )}

          {/* Рубашка (торс) */}
          <mesh position={[0, -0.02, 0]} castShadow scale={[1.02, 1, 1.05]}>
            <cylinderGeometry args={[0.26, 0.3, 0.95, 14]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>

          {/* Планка с пуговицами */}
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

          {/* Воротник рубашки — два лепестка */}
          <mesh position={[-0.09, 0.44, 0.26]} rotation={[0.08, -0.35, 0]} castShadow>
            <boxGeometry args={[0.14, 0.06, 0.04]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>
          <mesh position={[0.09, 0.44, 0.26]} rotation={[0.08, 0.35, 0]} castShadow>
            <boxGeometry args={[0.14, 0.06, 0.04]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>

          {p.tie && (
            <mesh position={[0, 0.08, 0.318]} castShadow>
              <boxGeometry args={[0.12, 0.38, 0.028]} />
              <meshStandardMaterial color={p.tie} roughness={0.38} metalness={0.12} />
            </mesh>
          )}

          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.18, 12]} />
            <meshStandardMaterial color={p.skin} roughness={0.48} />
          </mesh>

          <mesh position={[0, 0.78, 0]} castShadow>
            <sphereGeometry args={[0.2, 18, 16]} />
            <meshStandardMaterial color={p.skin} roughness={0.45} />
          </mesh>

          {/* Волосы — один сплющенный объём (как у героя), без кольца «лысины» */}
          <mesh position={[0, 0.97, 0]} castShadow scale={[1.02, 0.56, 1.02]}>
            <sphereGeometry args={[0.23, 22, 18]} />
            <meshStandardMaterial color={p.hair} roughness={0.82} metalness={0} />
          </mesh>

          <ClerkSquareGlasses offsetY={0.82} />

          {variant === 1 && (
            <mesh position={[0.38, 0.02, 0.12]} rotation={[0.2, 0, -0.15]} castShadow>
              <boxGeometry args={[0.26, 0.34, 0.02]} />
              <meshStandardMaterial color="#cfd8dc" roughness={0.45} metalness={0.2} />
            </mesh>
          )}

          <mesh position={[-0.34, 0.08, 0]} castShadow rotation={[0.12, 0, 0.08]}>
            <capsuleGeometry args={[0.045, 0.36, 6, 8]} />
            <meshStandardMaterial color={p.shirt} {...shirtMat} />
          </mesh>
          <mesh position={[0.34, 0.08, 0]} castShadow rotation={[0.12, 0, -0.08]}>
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

          {p.skirt ? (
            <>
              <mesh position={[0, -0.62, 0]} castShadow>
                <cylinderGeometry args={[0.28, 0.32, 0.55, 16]} />
                <meshStandardMaterial color={p.pants} roughness={0.48} />
              </mesh>
              <mesh position={[-0.12, -0.92, 0.04]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.22]} />
                <meshStandardMaterial color={p.shoes} roughness={0.5} />
              </mesh>
              <mesh position={[0.12, -0.92, 0.04]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.22]} />
                <meshStandardMaterial color={p.shoes} roughness={0.5} />
              </mesh>
            </>
          ) : (
            <>
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
            </>
          )}
        </group>
      </group>
    </group>
  );
}
