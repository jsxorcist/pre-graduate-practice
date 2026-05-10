"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "./GameContext";

/** Высота камеры над позицией героя (мировые единицы). */
const CAMERA_HEIGHT = 4.2;
/** Точка взгляда — чуть выше корня героя. */
const LOOK_HEIGHT_OFFSET = 1.25;
/**
 * Смещение камеры от героя ТОЛЬКО в мировых осях — не вращается вместе с моделью.
 * Диагональ «сзади-справа» (−X, −Z), расстояние по горизонтали ~7.3.
 */
const WORLD_OFFSET_XZ = new THREE.Vector3(-1, 0, -1)
  .normalize()
  .multiplyScalar(7.35);
const POS_SMOOTH = 8;
const LOOK_SMOOTH = 10;

const scratchTargetPos = new THREE.Vector3();
const scratchLookTarget = new THREE.Vector3();

/**
 * Камера следует за героем с фиксированным мировым смещением — орбита не крутится с поворотом модели.
 */
export default function GameCameraRig() {
  const { camera } = useThree();
  const { playerWorldPositionRef, turboCameraShakeRef } = useGame();
  const lookCurrent = useRef(new THREE.Vector3(0, 1.35, 0));
  const shakeSmoothed = useRef(0);
  const initialized = useRef(false);

  useFrame((state, delta) => {
    const px = playerWorldPositionRef.current.x;
    const py = playerWorldPositionRef.current.y;
    const pz = playerWorldPositionRef.current.z;

    const targetShake = turboCameraShakeRef.current;
    shakeSmoothed.current +=
      (targetShake - shakeSmoothed.current) * (1 - Math.exp(-14 * delta));
    const s = shakeSmoothed.current;
    const t = state.clock.elapsedTime;
    const ox =
      Math.sin(t * 73) * 0.2 * s +
      Math.sin(t * 137 + 0.4) * 0.09 * s +
      Math.cos(t * 59) * 0.05 * s;
    const oy =
      Math.sin(t * 89 + 1.1) * 0.13 * s +
      Math.cos(t * 101) * 0.07 * s;
    const oz = Math.cos(t * 67) * 0.11 * s;

    scratchTargetPos.set(
      px + WORLD_OFFSET_XZ.x + ox,
      py + CAMERA_HEIGHT + oy,
      pz + WORLD_OFFSET_XZ.z + oz,
    );

    const kPos = 1 - Math.exp(-POS_SMOOTH * delta);
    if (!initialized.current) {
      camera.position.copy(scratchTargetPos);
      scratchLookTarget.set(px, py + LOOK_HEIGHT_OFFSET, pz);
      lookCurrent.current.copy(scratchLookTarget);
      camera.lookAt(lookCurrent.current);
      initialized.current = true;
      return;
    }

    camera.position.lerp(scratchTargetPos, kPos);

    scratchLookTarget.set(px, py + LOOK_HEIGHT_OFFSET, pz);
    const kLook = 1 - Math.exp(-LOOK_SMOOTH * delta);
    lookCurrent.current.lerp(scratchLookTarget, kLook);
    camera.lookAt(lookCurrent.current);
  });

  return null;
}
