import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useGame } from "./GameContext";

/** Удерживать пробел столько секунд, чтобы начать заряд турбо (скрытая активация). */
const ROCKET_SPACE_HOLD_TO_CHARGE = 2;
const ROCKET_CHARGE_SEC = 3;
const ROCKET_SPIN_SEC = 1.05;
const ROCKET_TRAIL_MAX = 160;
/** Закрутка перед взлётом — вращается персонаж (как раньше). */
const ROCKET_HERO_SPIN_SPEED = 54;

/** Пол комнаты y≈0; стартовая высота группы героя (ноги у пола). */
const BASE_Y = 1.15;
const GRAVITY = 38;
const JUMP_VELOCITY = 10.2;
/** Чуть внутри стен ±9. */
const ROOM_XY_LIMIT = 8.35;

/**
 * Плечо / предплечье — позиции суставов (капсула плеча len 0.18, r 0.056 → низ ≈ −0.246;
 * слегка ниже — поворот вокруг «наружной» точки, меньше клип при сгибе).
 */
const UPPER_ARM_TO_ELBOW_Y = -0.254;
const FOREARM_CENTER_Y = -0.11;
const FOREARM_HALF_H = 0.113;
const HAND_LOCAL_Y = FOREARM_CENTER_Y - FOREARM_HALF_H - 0.024;

/** Качание рук — только через refs в useFrame (useState на каждый кадр даёт рассинхрон с Three). */
const WALK_SHOULDER_SWING = 0.54;
const WALK_ELBOW_BEND = 0.38;

/** Ноги: бедро → колено → голень (длины капсул). Суммарная длина подобрана под стопу у пола (корень героя BASE_Y). */
const THIGH_RADIUS = 0.08;
const THIGH_CYL_LEN = 0.22;
const THIGH_HALF_H = (THIGH_CYL_LEN + 2 * THIGH_RADIUS) / 2;
const THIGH_TO_KNEE_Y = -(THIGH_CYL_LEN + 2 * THIGH_RADIUS);
const SHIN_RADIUS = 0.068;
const SHIN_CYL_LEN = 0.18;
const SHIN_HALF_H = (SHIN_CYL_LEN + 2 * SHIN_RADIUS) / 2;
const SHIN_TOTAL_H = SHIN_CYL_LEN + 2 * SHIN_RADIUS;
/** Таз относительно корня героя — шорты ~−0.38, стопа у пола ≈ −1.15. */
const LEG_HIP_Y = -0.45;
const SHOE_LOCAL_Y = -SHIN_TOTAL_H - 0.04;

const LEG_HIP_SWING = 0.42;
const LEG_KNEE_BASE = 0.12;
const LEG_KNEE_SWING = 0.52;

/** Палитра «оранжевый спортивный костюм» (референс без реального меша — только примитивы). */
const SUIT_ORANGE = "#ff6f00";
const SUIT_DEEP = "#e65100";
const STRIPE_WHITE = "#fafafa";
const SKIN = "#ffccbc";
const HAIR_BROWN = "#4e342e";
const GLASSES_BLACK = "#1a1a1a";
const SHOE_WHITE = "#eceff1";

/** Линия в мировых координатах — след за ракетным импульсом. */
function RocketWorldTrail({
  pointsRef,
}: {
  pointsRef: MutableRefObject<THREE.Vector3[]>;
}) {
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#ffd699"),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    line.renderOrder = -2;
    return line;
  }, []);

  useFrame(() => {
    const pts = pointsRef.current;
    if (pts.length < 2) {
      lineObj.visible = false;
      return;
    }
    lineObj.visible = true;
    lineObj.geometry.setFromPoints(pts);
  });

  return <primitive object={lineObj} />;
}

interface PlayerProps {
  onEpicLaunch?: () => void;
  /** Не двигаться и не прыгать (открыт экран миссии и т.п.). */
  movementLocked?: boolean;
}

export default function Player({
  onEpicLaunch,
  movementLocked = false,
}: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const {
    playerWorldPositionRef,
    mobilePadRef,
    mobileJumpQueuedRef,
    jumpButtonHeldRef,
  } = useGame();
  const verticalVel = useRef(0);
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  });
  const rocketSpacePrimeRef = useRef(0);
  const jumpQueued = useRef(false);
  const spaceHoldTime = useRef(0);
  const rocketTimer = useRef(0);
  const launchVelocity = useRef(new THREE.Vector3());
  const rocketPlumeRootRef = useRef<THREE.Group>(null);
  const rocketExhaustLightRef = useRef<THREE.PointLight>(null);
  const trailWorldPointsRef = useRef<THREE.Vector3[]>([]);
  const exhaustTipScratch = useRef(new THREE.Vector3());
  const spinLaunchCommittedRef = useRef(false);
  const [rocketStage, setRocketStage] = useState<
    "idle" | "charging" | "spinning" | "launching"
  >("idle");
  const walkTimeRef = useRef(0);
  const leftShoulderGroupRef = useRef<THREE.Group>(null);
  const rightShoulderGroupRef = useRef<THREE.Group>(null);
  const leftElbowGroupRef = useRef<THREE.Group>(null);
  const rightElbowGroupRef = useRef<THREE.Group>(null);
  const leftLegGroupRef = useRef<THREE.Group>(null);
  const rightLegGroupRef = useRef<THREE.Group>(null);
  const leftKneeGroupRef = useRef<THREE.Group>(null);
  const rightKneeGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      switch (event.code) {
        case "KeyW":
          keys.current.w = true;
          break;
        case "KeyA":
          keys.current.a = true;
          break;
        case "KeyS":
          keys.current.s = true;
          break;
        case "KeyD":
          keys.current.d = true;
          break;
        case "Space":
          keys.current.space = true;
          jumpQueued.current = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          keys.current.w = false;
          break;
        case "KeyA":
          keys.current.a = false;
          break;
        case "KeyS":
          keys.current.s = false;
          break;
        case "KeyD":
          keys.current.d = false;
          break;
        case "Space":
          keys.current.space = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (mobileJumpQueuedRef.current) {
      jumpQueued.current = true;
      mobileJumpQueuedRef.current = false;
    }

    const locked = movementLocked;
    const camera = state.camera;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3()
      .crossVectors(direction, new THREE.Vector3(0, 1, 0))
      .normalize();

    const speed = 5;
    const moveDir = new THREE.Vector3(0, 0, 0);
    const k = keys.current;
    const pad = mobilePadRef.current;
    const spaceHeld = k.space || jumpButtonHeldRef.current;
    if (!locked) {
      if (k.w || pad.w) moveDir.add(direction);
      if (k.s || pad.s) moveDir.sub(direction);
      if (k.a || pad.a) moveDir.sub(right);
      if (k.d || pad.d) moveDir.add(right);
    }
    if (moveDir.lengthSq() > 1e-12) {
      moveDir.normalize();
    }
    moveDir.multiplyScalar(speed * delta);

    const movementLength = moveDir.length();
    const isCharging = rocketStage === "charging";
    const isSpinning = rocketStage === "spinning";
    const isLaunching = rocketStage === "launching";
    const canMove =
      !locked && (rocketStage === "idle" || isCharging) && !isLaunching;

    if (canMove) {
      groupRef.current.position.x += moveDir.x;
      groupRef.current.position.z += moveDir.z;
    }

    const grounded =
      groupRef.current.position.y <= BASE_Y + 0.06 && verticalVel.current <= 0.5;

    if (!locked && jumpQueued.current && grounded && rocketStage === "idle") {
      verticalVel.current = JUMP_VELOCITY;
      jumpQueued.current = false;
    }

    if (!isLaunching && rocketStage !== "spinning") {
      verticalVel.current -= GRAVITY * delta;
      groupRef.current.position.y += verticalVel.current * delta;
      if (groupRef.current.position.y < BASE_Y) {
        groupRef.current.position.y = BASE_Y;
        verticalVel.current = 0;
      }
    }

    if (movementLength > 0.01 && canMove) {
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      const ry = groupRef.current.rotation.y;
      let angleDiff = targetAngle - ry;
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      const turnSmooth = 22;
      const alpha = 1 - Math.exp(-turnSmooth * delta);
      groupRef.current.rotation.y = ry + angleDiff * alpha;
    }

    if (!locked && isCharging && spaceHeld) {
      spaceHoldTime.current += delta;
      if (spaceHoldTime.current >= ROCKET_CHARGE_SEC) {
        setRocketStage("spinning");
        rocketTimer.current = 0;
      }
    }

    /** Нарастание сопла при зарядке — только визуальный масштаб. */
    if (rocketPlumeRootRef.current) {
      if (isCharging) {
        const t = Math.min(1, spaceHoldTime.current / ROCKET_CHARGE_SEC);
        const s = 0.2 + t * 1.05;
        rocketPlumeRootRef.current.scale.setScalar(s);
      } else if (isSpinning || isLaunching) {
        rocketPlumeRootRef.current.scale.setScalar(1.18);
      } else {
        rocketPlumeRootRef.current.scale.setScalar(1);
      }
    }

    if (isSpinning) {
      rocketTimer.current += delta;
      const spinSpeed = ROCKET_HERO_SPIN_SPEED;
      groupRef.current.rotation.x += spinSpeed * delta;
      groupRef.current.rotation.y += spinSpeed * delta;
      groupRef.current.rotation.z += spinSpeed * delta;
      if (
        rocketTimer.current >= ROCKET_SPIN_SEC &&
        !spinLaunchCommittedRef.current
      ) {
        spinLaunchCommittedRef.current = true;
        const randomDirection = new THREE.Vector3(
          (Math.random() - 0.5) * 1.15,
          2.35,
          (Math.random() - 0.5) * 1.15,
        ).normalize();
        launchVelocity.current.copy(randomDirection.multiplyScalar(15.5));
        setRocketStage("launching");
        verticalVel.current = 0;
        onEpicLaunch?.();
      }
    }

    if (isLaunching) {
      launchVelocity.current.add(new THREE.Vector3(0, 22 * delta, 0));
      groupRef.current.position.add(
        launchVelocity.current.clone().multiplyScalar(delta),
      );

      /** Низ сопла под ступнями, чуть сзади — как источник следа. */
      const tip = exhaustTipScratch.current.set(0, -1.02, -0.14);
      groupRef.current.localToWorld(tip);
      const trail = trailWorldPointsRef.current;
      trail.push(tip.clone());
      while (trail.length > ROCKET_TRAIL_MAX) trail.shift();

      const flicker =
        1.4 +
        Math.sin(performance.now() * 0.018) * 0.55 +
        Math.sin(performance.now() * 0.041) * 0.35;
      if (rocketExhaustLightRef.current) {
        rocketExhaustLightRef.current.intensity = flicker * 2.4;
      }

      if (groupRef.current.position.y < BASE_Y + 0.05) {
        groupRef.current.position.y = BASE_Y;
        launchVelocity.current.set(0, 0, 0);
        setRocketStage("idle");
        groupRef.current.rotation.x = 0;
        groupRef.current.rotation.z = 0;
        trailWorldPointsRef.current.length = 0;
        spinLaunchCommittedRef.current = false;
        if (rocketExhaustLightRef.current) {
          rocketExhaustLightRef.current.intensity = 0;
        }
      }
    } else if (rocketExhaustLightRef.current) {
      if (isCharging) {
        const t = Math.min(1, spaceHoldTime.current / ROCKET_CHARGE_SEC);
        rocketExhaustLightRef.current.intensity = 0.45 + t * 2.1;
        rocketExhaustLightRef.current.color.set("#ffab40");
      } else if (isSpinning) {
        rocketExhaustLightRef.current.intensity =
          2.2 + Math.sin(performance.now() * 0.019) * 0.9;
        rocketExhaustLightRef.current.color.set("#ff9800");
      } else if (!isLaunching) {
        rocketExhaustLightRef.current.intensity = 0;
      }
    }

    if (
      !locked &&
      rocketStage === "idle" &&
      grounded &&
      spaceHeld
    ) {
      rocketSpacePrimeRef.current += delta;
      if (rocketSpacePrimeRef.current >= ROCKET_SPACE_HOLD_TO_CHARGE) {
        setRocketStage("charging");
        rocketSpacePrimeRef.current = 0;
        spaceHoldTime.current = 0;
        spinLaunchCommittedRef.current = false;
      }
    } else if (rocketStage === "idle") {
      rocketSpacePrimeRef.current = 0;
    }

    if ((!spaceHeld || locked) && rocketStage === "charging") {
      setRocketStage("idle");
      spaceHoldTime.current = 0;
      spinLaunchCommittedRef.current = false;
    }

    if (!isLaunching) {
      groupRef.current.position.x = Math.max(
        -ROOM_XY_LIMIT,
        Math.min(ROOM_XY_LIMIT, groupRef.current.position.x),
      );
      groupRef.current.position.z = Math.max(
        -ROOM_XY_LIMIT,
        Math.min(ROOM_XY_LIMIT, groupRef.current.position.z),
      );
    }

    const isMoving =
      movementLength > 0.01 && rocketStage === "idle" && grounded && !locked;
    if (isMoving) {
      walkTimeRef.current += delta * 8;
    } else {
      walkTimeRef.current *= 0.9;
    }

    const wt = walkTimeRef.current;
    const walkPhase = Math.sin(wt);
    const movingArms = Math.abs(wt) > 0.02;
    const leftShoulderRx = movingArms ? walkPhase * WALK_SHOULDER_SWING : 0;
    const rightShoulderRx = movingArms ? -walkPhase * WALK_SHOULDER_SWING : 0;
    /** Величина сгиба (положительное число); в Three для этой схемы сгиб «вперёд» = отрицательный rotation.x. */
    const leftElbowBendMag = movingArms
      ? 0.08 + Math.max(0, walkPhase) * WALK_ELBOW_BEND
      : 0.06;
    const rightElbowBendMag = movingArms
      ? 0.08 + Math.max(0, -walkPhase) * WALK_ELBOW_BEND
      : 0.06;

    if (leftShoulderGroupRef.current) {
      leftShoulderGroupRef.current.rotation.x = leftShoulderRx;
      leftShoulderGroupRef.current.rotation.z = 0.11;
    }
    if (rightShoulderGroupRef.current) {
      rightShoulderGroupRef.current.rotation.x = rightShoulderRx;
      rightShoulderGroupRef.current.rotation.z = -0.11;
    }
    if (leftElbowGroupRef.current) {
      leftElbowGroupRef.current.rotation.x = -leftElbowBendMag;
    }
    if (rightElbowGroupRef.current) {
      rightElbowGroupRef.current.rotation.x = -rightElbowBendMag;
    }

    const leftHipRx = movingArms ? walkPhase * LEG_HIP_SWING : 0;
    const rightHipRx = movingArms ? -walkPhase * LEG_HIP_SWING : 0;
    /** Колено сильнее согнуто на задней фазе шага (та же логика знака, что у локтя). */
    const leftKneeBendMag = movingArms
      ? LEG_KNEE_BASE + Math.max(0, -walkPhase) * LEG_KNEE_SWING
      : 0.05;
    const rightKneeBendMag = movingArms
      ? LEG_KNEE_BASE + Math.max(0, walkPhase) * LEG_KNEE_SWING
      : 0.05;

    if (leftLegGroupRef.current) {
      leftLegGroupRef.current.rotation.x = leftHipRx;
    }
    if (rightLegGroupRef.current) {
      rightLegGroupRef.current.rotation.x = rightHipRx;
    }
    /** Сгиб колена: знак противоположен локтю — у группы колена положительный rotation.x даёт сгиб «назад» анатомически. */
    if (leftKneeGroupRef.current) {
      leftKneeGroupRef.current.rotation.x = leftKneeBendMag;
    }
    if (rightKneeGroupRef.current) {
      rightKneeGroupRef.current.rotation.x = rightKneeBendMag;
    }

    playerWorldPositionRef.current.copy(groupRef.current.position);
  });

  const showRocketPlume =
    rocketStage === "charging" ||
    rocketStage === "spinning" ||
    rocketStage === "launching";

  return (
    <>
    <group ref={groupRef} position={[0, BASE_Y, 0]} castShadow>
      {/* Торс костюма + «круглый живот» */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.48, 8, 16]} />
        <meshStandardMaterial color={SUIT_ORANGE} roughness={0.5} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.02, 0.12]} castShadow scale={[1.15, 1.05, 0.95]}>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} metalness={0.04} />
      </mesh>
      {/* Высокий воротник */}
      <mesh position={[0, 0.38, -0.16]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.52, 0.14, 0.06]} />
        <meshStandardMaterial color={SUIT_DEEP} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.48, -0.2]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.1, 0.05]} />
        <meshStandardMaterial color={SUIT_ORANGE} roughness={0.5} />
      </mesh>

      {/* Руки: плечо → плечо+предплечье → ладонь; качание при ходьбе */}
      <group ref={leftShoulderGroupRef} position={[-0.38, 0.12, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.056, 0.18, 6, 10]} />
          <meshStandardMaterial color={SUIT_ORANGE} roughness={0.5} />
        </mesh>
        <mesh position={[0.07, -0.09, 0.05]} rotation={[0, 0, 0.12]} castShadow>
          <boxGeometry args={[0.042, 0.17, 0.032]} />
          <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
        </mesh>
        <group ref={leftElbowGroupRef} position={[0, UPPER_ARM_TO_ELBOW_Y, 0]}>
          <mesh position={[0, FOREARM_CENTER_Y, 0]} castShadow>
            <capsuleGeometry args={[0.048, 0.13, 6, 10]} />
            <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} />
          </mesh>
          <mesh position={[0.05, FOREARM_CENTER_Y - 0.02, 0.02]} castShadow>
            <boxGeometry args={[0.035, 0.11, 0.028]} />
            <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
          </mesh>
          <mesh position={[0, HAND_LOCAL_Y, 0.02]} castShadow>
            <sphereGeometry args={[0.052, 10, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.48} />
          </mesh>
        </group>
      </group>
      <group ref={rightShoulderGroupRef} position={[0.38, 0.12, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.056, 0.18, 6, 10]} />
          <meshStandardMaterial color={SUIT_ORANGE} roughness={0.5} />
        </mesh>
        <mesh position={[-0.07, -0.09, 0.05]} rotation={[0, 0, -0.12]} castShadow>
          <boxGeometry args={[0.042, 0.17, 0.032]} />
          <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
        </mesh>
        <group ref={rightElbowGroupRef} position={[0, UPPER_ARM_TO_ELBOW_Y, 0]}>
          <mesh position={[0, FOREARM_CENTER_Y, 0]} castShadow>
            <capsuleGeometry args={[0.048, 0.13, 6, 10]} />
            <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} />
          </mesh>
          <mesh position={[-0.05, FOREARM_CENTER_Y - 0.02, 0.02]} castShadow>
            <boxGeometry args={[0.035, 0.11, 0.028]} />
            <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
          </mesh>
          <mesh position={[0, HAND_LOCAL_Y, 0.02]} castShadow>
            <sphereGeometry args={[0.052, 10, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.48} />
          </mesh>
        </group>
      </group>

      {/* Шорты костюма */}
      <mesh position={[0, -0.38, 0]} castShadow>
        <boxGeometry args={[0.46, 0.28, 0.36]} />
        <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} />
      </mesh>
      <mesh position={[-0.18, -0.38, 0.14]} castShadow>
        <boxGeometry args={[0.05, 0.22, 0.04]} />
        <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
      </mesh>
      <mesh position={[0.18, -0.38, 0.14]} castShadow>
        <boxGeometry args={[0.05, 0.22, 0.04]} />
        <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
      </mesh>

      {/* Шея, голова, «боб», уши */}
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.12, 10]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.25, 18, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.48} />
      </mesh>
      <mesh position={[0, 1.07, -0.03]} castShadow scale={[1.05, 0.52, 1.02]}>
        <sphereGeometry args={[0.27, 14, 12]} />
        <meshStandardMaterial color={HAIR_BROWN} roughness={0.88} />
      </mesh>
      <mesh position={[-0.26, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>
      <mesh position={[0.26, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>

      {/* Квадратные очки */}
      <group position={[0, 0.9, 0.2]}>
        <mesh position={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.11, 0.09, 0.025]} />
          <meshStandardMaterial color={GLASSES_BLACK} roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh position={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.11, 0.09, 0.025]} />
          <meshStandardMaterial color={GLASSES_BLACK} roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 0.025, 0.02]} />
          <meshStandardMaterial color={GLASSES_BLACK} roughness={0.35} />
        </mesh>
        <mesh position={[-0.1, 0, 0.015]}>
          <planeGeometry args={[0.08, 0.07]} />
          <meshStandardMaterial
            color="#90caf9"
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0.1, 0, 0.015]}>
          <planeGeometry args={[0.08, 0.07]} />
          <meshStandardMaterial
            color="#90caf9"
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      </group>

      {showRocketPlume && (
        <group ref={rocketPlumeRootRef} position={[0, -1.05, -0.1]}>
          {/*
            Конус Three.js: ось Y, узкая точка (+Y/half), широкое основание (−Y/half).
            Без поворота −90° по X — иначе пламя «лежит» на полу. Смещаем центр вниз так,
            чтобы все узкие сходились у ступней, широкая часть — только ниже ног.
          */}
          <pointLight
            ref={rocketExhaustLightRef}
            position={[0, -0.05, 0.05]}
            distance={14}
            decay={2}
            intensity={0}
            color="#ffc082"
          />
          <mesh position={[0, -1.275, 0]} renderOrder={3}>
            <coneGeometry args={[0.42, 2.55, 28]} />
            <meshStandardMaterial
              color="#e65100"
              emissive="#ff6f00"
              emissiveIntensity={0.85}
              roughness={0.85}
              metalness={0}
              transparent
              opacity={0.38}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, -1.025, 0]} renderOrder={4}>
            <coneGeometry args={[0.28, 2.05, 24]} />
            <meshStandardMaterial
              color="#ffb300"
              emissive="#ff9800"
              emissiveIntensity={1.1}
              roughness={0.45}
              metalness={0.05}
              transparent
              opacity={0.52}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, -0.725, 0]} renderOrder={5}>
            <coneGeometry args={[0.13, 1.45, 20]} />
            <meshStandardMaterial
              color="#fff8e1"
              emissive="#ffe082"
              emissiveIntensity={1.65}
              roughness={0.35}
              metalness={0.12}
              transparent
              opacity={0.78}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* Ноги: бедро (таз) → колено → голень + кроссовки */}
      <group ref={leftLegGroupRef} position={[-0.13, LEG_HIP_Y, 0]}>
        <mesh position={[0, -THIGH_HALF_H, 0]} castShadow>
          <capsuleGeometry args={[THIGH_RADIUS, THIGH_CYL_LEN, 6, 10]} />
          <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} />
        </mesh>
        <mesh position={[0.06, -THIGH_HALF_H - 0.02, 0.03]} castShadow>
          <boxGeometry args={[0.038, 0.22, 0.032]} />
          <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
        </mesh>
        <group ref={leftKneeGroupRef} position={[0, THIGH_TO_KNEE_Y, 0]}>
          <mesh position={[0, -SHIN_HALF_H, 0]} castShadow>
            <capsuleGeometry args={[SHIN_RADIUS, SHIN_CYL_LEN, 6, 10]} />
            <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} />
          </mesh>
          <mesh position={[0.06, -SHIN_HALF_H, 0.03]} castShadow>
            <boxGeometry args={[0.034, 0.2, 0.028]} />
            <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
          </mesh>
          <mesh position={[0, SHOE_LOCAL_Y, 0.05]} castShadow>
            <boxGeometry args={[0.2, 0.12, 0.28]} />
            <meshStandardMaterial color={SHOE_WHITE} roughness={0.45} />
          </mesh>
          {[-0.06, 0, 0.06].map((oz) => (
            <mesh key={oz} position={[0.08, SHOE_LOCAL_Y, oz]} castShadow>
              <boxGeometry args={[0.03, 0.04, 0.24]} />
              <meshStandardMaterial color={SUIT_ORANGE} roughness={0.45} />
            </mesh>
          ))}
        </group>
      </group>
      <group ref={rightLegGroupRef} position={[0.13, LEG_HIP_Y, 0]}>
        <mesh position={[0, -THIGH_HALF_H, 0]} castShadow>
          <capsuleGeometry args={[THIGH_RADIUS, THIGH_CYL_LEN, 6, 10]} />
          <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} />
        </mesh>
        <mesh position={[-0.06, -THIGH_HALF_H - 0.02, 0.03]} castShadow>
          <boxGeometry args={[0.038, 0.22, 0.032]} />
          <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
        </mesh>
        <group ref={rightKneeGroupRef} position={[0, THIGH_TO_KNEE_Y, 0]}>
          <mesh position={[0, -SHIN_HALF_H, 0]} castShadow>
            <capsuleGeometry args={[SHIN_RADIUS, SHIN_CYL_LEN, 6, 10]} />
            <meshStandardMaterial color={SUIT_ORANGE} roughness={0.52} />
          </mesh>
          <mesh position={[-0.06, -SHIN_HALF_H, 0.03]} castShadow>
            <boxGeometry args={[0.034, 0.2, 0.028]} />
            <meshStandardMaterial color={STRIPE_WHITE} roughness={0.35} />
          </mesh>
          <mesh position={[0, SHOE_LOCAL_Y, 0.05]} castShadow>
            <boxGeometry args={[0.2, 0.12, 0.28]} />
            <meshStandardMaterial color={SHOE_WHITE} roughness={0.45} />
          </mesh>
          {[-0.06, 0, 0.06].map((oz) => (
            <mesh key={oz} position={[-0.08, SHOE_LOCAL_Y, oz]} castShadow>
              <boxGeometry args={[0.03, 0.04, 0.24]} />
              <meshStandardMaterial color={SUIT_ORANGE} roughness={0.45} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
    <RocketWorldTrail pointsRef={trailWorldPointsRef} />
    </>
  );
}
