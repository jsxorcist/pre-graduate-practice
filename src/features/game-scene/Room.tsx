import * as THREE from "three";

/** Мебель и реквизит относительно героя (~3 ед. роста): без этого всё выглядит как миниатюра. */
export const ROOM_PROP_SCALE = 1.52;

/** Половина комнаты по X/Z; пол 18×18, стены на ±ROOM_HALF. */
const ROOM_HALF = 9;
const FLOOR_SIZE = ROOM_HALF * 2;
const WALL_T = 0.22;
/** Яркий круглый ковёр (увеличен относительно старого ~4.3). */
const CARPET_RADIUS = 6.45;

const GLASS = {
  color: "#90caf9",
  transparent: true,
  opacity: 0.38,
  roughness: 0.16,
  metalness: 0.42,
  emissive: "#4fc3f7",
  emissiveIntensity: 0.14,
  side: THREE.DoubleSide,
} as const;

/**
 * Сплошная штукатурка оранжевой/зелёной стены снаружи не нужна — только проёмы и рамы.
 * meshStandardMaterial с низкой opacity на ярком небе всё равно выглядит «как стена», поэтому
 * панели выключены через visible (полная невидимость), стекло и обрамление остаются.
 */
const SHOW_ORANGE_GREEN_FILLS = false;

/** Запасной материал, если снова включить заливку (прозрачное стекло-эффект). */
const ORANGE_WALL_MAT = {
  color: "#ff9800",
  transparent: true,
  opacity: 0.08,
  roughness: 0.48,
  metalness: 0.18,
  depthWrite: false,
} as const;

const GREEN_WALL_MAT = {
  color: "#4caf50",
  transparent: true,
  opacity: 0.08,
  roughness: 0.42,
  metalness: 0.12,
  depthWrite: false,
} as const;

const TRIM = "#37474f";

/**
 * Юг (#e91e63) и восток (#2196f3) — только непрозрачная штукатурка.
 * Отдельный объект, чтобы нигде не смешать со стеклом GLASS и полупрозрачными оранж./зел.
 */
const PINK_SOUTH_WALL = {
  color: "#e91e63",
  roughness: 0.48,
  metalness: 0.2,
  transparent: false,
  opacity: 1,
  depthWrite: true,
  depthTest: true,
} as const;

const BLUE_EAST_WALL = {
  color: "#2196f3",
  roughness: 0.38,
  metalness: 0.28,
  transparent: false,
  opacity: 1,
  depthWrite: true,
  depthTest: true,
} as const;

/** Мат у ткани: высокая шероховатость, слабый sheen без «игрушечного» блика */
function FabricBagMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.94}
      metalness={0}
      clearcoat={0}
      sheen={0.35}
      sheenRoughness={0.9}
      sheenColor={color}
    />
  );
}

/**
 * Бин-бэг как один «пухлый» мешок: только сферы, без палок/ручек/дисков.
 * Три объёма одинакового материала сливаются в мягкий силуэт (широкий низ, спинка, передний валик).
 */
function BeanBag({
  x,
  z,
  color,
  seamColor,
  rotationY = 0,
}: {
  x: number;
  z: number;
  color: string;
  seamColor?: string;
  rotationY?: number;
}) {
  const stitchColor = seamColor ?? color;

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <group scale={ROOM_PROP_SCALE}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow scale={[1.28, 0.38, 1.22]}>
        <sphereGeometry args={[0.36, 48, 36]} />
        <FabricBagMaterial color={color} />
      </mesh>

      <mesh position={[0, 0.33, -0.14]} castShadow receiveShadow scale={[1, 0.82, 0.95]}>
        <sphereGeometry args={[0.34, 48, 36]} />
        <FabricBagMaterial color={color} />
      </mesh>

      <mesh position={[0, 0.2, 0.26]} rotation={[-0.28, 0, 0]} castShadow receiveShadow scale={[1.05, 0.48, 0.92]}>
        <sphereGeometry args={[0.3, 40, 32]} />
        <FabricBagMaterial color={color} />
      </mesh>

      {/* Тонкий горизонтальный стежок по «талии» — не кольцо-подставка */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0.02]} castShadow>
        <torusGeometry args={[0.4, 0.012, 8, 40]} />
        <meshPhysicalMaterial
          color={stitchColor}
          roughness={0.96}
          metalness={0}
          sheen={0.2}
          sheenRoughness={0.92}
          sheenColor={stitchColor}
        />
      </mesh>
      </group>
    </group>
  );
}

/** Мягкое кресло: сиденье, спинка, подлокотники. */
function LoungeChair({
  x,
  z,
  rotationY,
  fabric,
  accent,
}: {
  x: number;
  z: number;
  rotationY: number;
  fabric: string;
  accent: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <group scale={ROOM_PROP_SCALE}>
      {/* Основание */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.14, 20]} />
        <meshStandardMaterial color={accent} roughness={0.55} metalness={0.15} />
      </mesh>
      {/* Сиденье */}
      <mesh position={[0, 0.26, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.2, 0.68]} />
        <meshStandardMaterial color={fabric} roughness={0.88} metalness={0} />
      </mesh>
      {/* Спинка */}
      <mesh position={[0, 0.52, -0.28]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.72, 0.58, 0.14]} />
        <meshStandardMaterial color={fabric} roughness={0.88} metalness={0} />
      </mesh>
      {/* Подушка */}
      <mesh position={[0, 0.34, 0.08]} castShadow>
        <boxGeometry args={[0.58, 0.1, 0.48]} />
        <meshStandardMaterial color={accent} roughness={0.9} />
      </mesh>
      {/* Подлокотники */}
      <mesh position={[-0.38, 0.36, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.22, 6, 8]} />
        <meshStandardMaterial color={fabric} roughness={0.85} />
      </mesh>
      <mesh position={[0.38, 0.36, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.22, 6, 8]} />
        <meshStandardMaterial color={fabric} roughness={0.85} />
      </mesh>
      </group>
    </group>
  );
}

/** Стол + монитор + системник (игровой ПК). */
function Workstation({
  x,
  z,
  rotationY,
  deskColor,
}: {
  x: number;
  z: number;
  rotationY: number;
  deskColor: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <group scale={ROOM_PROP_SCALE}>
      {/* Столешница */}
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.055, 0.72]} />
        <meshStandardMaterial color={deskColor} roughness={0.45} metalness={0.12} />
      </mesh>
      {/* Ножки */}
      {(
        [
          [-0.58, 0.41, -0.3],
          [0.58, 0.41, -0.3],
          [-0.58, 0.41, 0.3],
          [0.58, 0.41, 0.3],
        ] as const
      ).map((p, i) => (
        <mesh key={i} position={[...p]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.82, 8]} />
          <meshStandardMaterial color="#eceff1" roughness={0.35} metalness={0.4} />
        </mesh>
      ))}
      {/* Монитор */}
      <group position={[0, 1.12, -0.22]}>
        <mesh castShadow>
          <boxGeometry args={[0.52, 0.34, 0.025]} />
          <meshStandardMaterial color="#263238" roughness={0.4} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.018]}>
          <planeGeometry args={[0.46, 0.28]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00b8d4"
            emissiveIntensity={0.55}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.06, 0.12, 12]} />
          <meshStandardMaterial color="#37474f" roughness={0.45} />
        </mesh>
      </group>
      {/* Клавиатура */}
      <mesh position={[0, 0.84, 0.18]} castShadow receiveShadow rotation={[-0.04, 0, 0]}>
        <boxGeometry args={[0.42, 0.025, 0.16]} />
        <meshStandardMaterial color="#fafafa" roughness={0.6} />
      </mesh>
      {/* Системный блок */}
      <mesh position={[0.4, 0.33, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.66, 0.48]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0.52, 0.38, 0.22]}>
        <boxGeometry args={[0.04, 0.25, 0.06]} />
        <meshStandardMaterial
          color="#ff00aa"
          emissive="#ff00aa"
          emissiveIntensity={0.35}
        />
      </mesh>
      </group>
    </group>
  );
}

/** Низкий столик + ноутбук. */
function CoffeeTableWithLaptop({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <group scale={ROOM_PROP_SCALE}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.58, 0.06, 24]} />
        <meshStandardMaterial color="#ffe082" roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.28, 10]} />
        <meshStandardMaterial color="#cfd8dc" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Ноутбук */}
      <group position={[0.08, 0.34, 0.05]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.09, -0.06]} rotation={[-0.55, 0, 0]} castShadow>
          <boxGeometry args={[0.38, 0.018, 0.26]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.35} metalness={0.45} />
        </mesh>
        <mesh position={[0, 0.17, 0.03]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.36, 0.22, 0.012]} />
          <meshStandardMaterial
            color="#7c4dff"
            emissive="#651fff"
            emissiveIntensity={0.4}
            roughness={0.4}
          />
        </mesh>
      </group>
      </group>
    </group>
  );
}

/** Внутренняя плоскость стены (чуть от наружного центра меша). */
const WALL_INSET = WALL_T * 0.5 + 0.06;
const SOUTH_FACE_Z = ROOM_HALF - WALL_INSET;
const EAST_FACE_X = ROOM_HALF - WALL_INSET;

const ART = {
  frame: "#4e342e",
  mat: "#fafafa",
} as const;

/**
 * Картина в раме: «абстракция» из перекрывающихся плоскостей (без текстур).
 */
function FramedArt({
  position,
  rotation,
  w,
  h,
  variant = 0,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  w: number;
  h: number;
  variant?: number;
}) {
  const d = 0.055;
  const band = 0.1;
  const outerW = w + band;
  const outerH = h + band;
  const palettes: [string, string, string][] = [
    ["#1a237e", "#7c4dff", "#ff6e40"],
    ["#1b5e20", "#00c853", "#ffea00"],
    ["#4a148c", "#e040fb", "#00e5ff"],
    ["#bf360c", "#ff9100", "#eceff1"],
    ["#263238", "#00897b", "#ffab00"],
  ];
  const [c0, c1, c2] = palettes[variant % palettes.length] ?? palettes[0];

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -d * 0.4]} castShadow>
        <boxGeometry args={[outerW, outerH, d]} />
        <meshStandardMaterial color={ART.frame} roughness={0.72} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[w * 0.92, h * 0.92]} />
        <meshStandardMaterial
          color={ART.mat}
          roughness={0.92}
          emissive="#eceff1"
          emissiveIntensity={0.04}
        />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={c0} roughness={0.85} emissive={c0} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[-w * 0.12, h * 0.08, 0.038]} rotation={[0, 0, 0.12]}>
        <planeGeometry args={[w * 0.42, h * 0.55]} />
        <meshStandardMaterial color={c1} roughness={0.88} emissive={c1} emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[w * 0.18, -h * 0.1, 0.042]} rotation={[0, 0, -0.18]}>
        <planeGeometry args={[w * 0.38, h * 0.28]} />
        <meshStandardMaterial color={c2} roughness={0.9} emissive={c2} emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

/** Настенные часы (плоский циферблат в плоскости XY, нормаль +Z — как у картин). */
function WallClock({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const r = 0.38;
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial color="#eceff1" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <ringGeometry args={[r * 0.88, r * 0.92, 48]} />
        <meshStandardMaterial color="#37474f" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, r * 0.18, 0.022]} rotation={[0, 0, Math.PI / 3]}>
        <boxGeometry args={[0.03, r * 0.42, 0.008]} />
        <meshStandardMaterial color="#212121" roughness={0.4} />
      </mesh>
      <mesh position={[r * 0.16, 0, 0.024]} rotation={[0, 0, Math.PI / 5]}>
        <boxGeometry args={[r * 0.28, 0.026, 0.008]} />
        <meshStandardMaterial color="#e53935" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial color="#37474f" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Бра — мягкий акцент без отдельного света (эмиссия). */
function WallSconce({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.2, 0.08]} />
        <meshStandardMaterial color="#37474f" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, -0.06, 0.05]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial
          color="#fff9c4"
          emissive="#ffecb3"
          emissiveIntensity={0.35}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

/** Картины и декор — без оранжевой (север) и зелёной (запад) стен. */
function WallArtAndDetails() {
  return (
    <group>
      {/* Юг (+Z) розовая — узкая типографика и бра */}
      <FramedArt
        position={[-5.8, 3.35, SOUTH_FACE_Z]}
        rotation={[0, Math.PI, 0]}
        w={1.25}
        h={0.38}
        variant={4}
      />
      <WallSconce
        position={[5.4, 2.45, SOUTH_FACE_Z]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Восток (+X) синяя — часы и пара работ */}
      <WallClock
        position={[EAST_FACE_X, 3.05, 2.4]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <FramedArt
        position={[EAST_FACE_X, 2.45, -3.6]}
        rotation={[0, -Math.PI / 2, 0]}
        w={0.88}
        h={0.66}
        variant={3}
      />
      <FramedArt
        position={[EAST_FACE_X, 2.35, 4.2]}
        rotation={[0, -Math.PI / 2, 0]}
        w={0.55}
        h={0.55}
        variant={0}
      />

      {/* Полоска только над южной стеной */}
      <mesh position={[6.4, 4.82, SOUTH_FACE_Z - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.1, 0.12]} />
        <meshStandardMaterial
          color="#f8bbd0"
          emissive="#e91e63"
          emissiveIntensity={0.12}
          roughness={0.65}
        />
      </mesh>
    </group>
  );
}

/** Неоновая «лента» на полу — зона chill. */
function NeonFloorAccent() {
  const s = ROOM_PROP_SCALE;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.4, 0.015, -3.4]} receiveShadow>
        <ringGeometry args={[1.05 * s, 1.38 * s, 48]} />
        <meshStandardMaterial
          color="#ff4081"
          emissive="#ff4081"
          emissiveIntensity={0.28}
          roughness={0.75}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.6, 0.016, 3.5]} receiveShadow>
        <ringGeometry args={[0.82 * s, 1.15 * s, 40]} />
        <meshStandardMaterial
          color="#00e676"
          emissive="#00e676"
          emissiveIntensity={0.24}
          roughness={0.75}
        />
      </mesh>
    </group>
  );
}

/** Стены с проёмами: панорама сзади, стеклянные двери спереди, боковые окна. */
function OfficeShell() {
  const Zn = -ROOM_HALF;
  const Zp = ROOM_HALF;
  const Xw = -ROOM_HALF;
  const Xe = ROOM_HALF;

  const sill = 1.05;
  const winH = 2.45;
  const winTop = sill + winH;
  const cyWin = (sill + winTop) / 2;

  const northWinHalfW = 2.15;

  const zw0 = 3;
  const ze0 = 5;

  return (
    <group>
      {/* --- Север (−Z): заливка оранжевая (опционально); окно убрано — открытый угол --- */}
      <mesh position={[0, sill / 2, Zn]} receiveShadow visible={SHOW_ORANGE_GREEN_FILLS}>
        <boxGeometry args={[FLOOR_SIZE, sill, WALL_T]} />
        <meshStandardMaterial {...ORANGE_WALL_MAT} />
      </mesh>
      <mesh position={[0, (winTop + 6) / 2, Zn]} receiveShadow visible={SHOW_ORANGE_GREEN_FILLS}>
        <boxGeometry args={[FLOOR_SIZE, 6 - winTop, WALL_T]} />
        <meshStandardMaterial {...ORANGE_WALL_MAT} />
      </mesh>
      <mesh
        position={[(-northWinHalfW + (-FLOOR_SIZE / 2)) / 2, cyWin, Zn]}
        receiveShadow
        visible={SHOW_ORANGE_GREEN_FILLS}
      >
        <boxGeometry args={[FLOOR_SIZE / 2 - northWinHalfW, winH, WALL_T]} />
        <meshStandardMaterial {...ORANGE_WALL_MAT} />
      </mesh>
      <mesh
        position={[(northWinHalfW + FLOOR_SIZE / 2) / 2, cyWin, Zn]}
        receiveShadow
        visible={SHOW_ORANGE_GREEN_FILLS}
      >
        <boxGeometry args={[FLOOR_SIZE / 2 - northWinHalfW, winH, WALL_T]} />
        <meshStandardMaterial {...ORANGE_WALL_MAT} />
      </mesh>

      {/* --- Юг (+Z): розовая стена + двойные стеклянные двери --- */}
      <mesh position={[(-0.75 + (-FLOOR_SIZE / 2)) / 2, 3, Zp]} castShadow receiveShadow>
        <boxGeometry args={[FLOOR_SIZE / 2 - 0.75, 6, WALL_T]} />
        <meshStandardMaterial {...PINK_SOUTH_WALL} />
      </mesh>
      <mesh position={[(0.75 + FLOOR_SIZE / 2) / 2, 3, Zp]} castShadow receiveShadow>
        <boxGeometry args={[FLOOR_SIZE / 2 - 0.75, 6, WALL_T]} />
        <meshStandardMaterial {...PINK_SOUTH_WALL} />
      </mesh>
      <mesh position={[0, (2.65 + 6) / 2, Zp]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 6 - 2.65, WALL_T]} />
        <meshStandardMaterial {...PINK_SOUTH_WALL} />
      </mesh>
      <mesh position={[-0.38, 1.325, Zp + WALL_T / 2 + 0.025]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.72, 2.65]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[0.38, 1.325, Zp + WALL_T / 2 + 0.025]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.72, 2.65]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[0, 1.325, Zp + 0.06]} castShadow>
        <boxGeometry args={[1.58, 2.78, 0.08]} />
        <meshStandardMaterial color="#5d4037" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* --- Запад (−X): заливка зелёная (опционально); окно убрано --- */}
      <mesh position={[Xw, sill / 2, 0]} receiveShadow visible={SHOW_ORANGE_GREEN_FILLS}>
        <boxGeometry args={[WALL_T, sill, FLOOR_SIZE]} />
        <meshStandardMaterial {...GREEN_WALL_MAT} />
      </mesh>
      <mesh position={[Xw, (winTop + 6) / 2, 0]} receiveShadow visible={SHOW_ORANGE_GREEN_FILLS}>
        <boxGeometry args={[WALL_T, 6 - winTop, FLOOR_SIZE]} />
        <meshStandardMaterial {...GREEN_WALL_MAT} />
      </mesh>
      <mesh
        position={[Xw, cyWin, (-zw0 + (-ROOM_HALF)) / 2]}
        receiveShadow
        visible={SHOW_ORANGE_GREEN_FILLS}
      >
        <boxGeometry args={[WALL_T, winH, ROOM_HALF - zw0]} />
        <meshStandardMaterial {...GREEN_WALL_MAT} />
      </mesh>
      <mesh position={[Xw, cyWin, (zw0 + ROOM_HALF) / 2]} receiveShadow visible={SHOW_ORANGE_GREEN_FILLS}>
        <boxGeometry args={[WALL_T, winH, ROOM_HALF - zw0]} />
        <meshStandardMaterial {...GREEN_WALL_MAT} />
      </mesh>

      {/* --- Восток (+X): синяя + длинное горизонтальное окно (z ∈ [−5,5]) --- */}
      <mesh position={[Xe, sill / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, sill, FLOOR_SIZE]} />
        <meshStandardMaterial {...BLUE_EAST_WALL} />
      </mesh>
      <mesh position={[Xe, (winTop + 6) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, 6 - winTop, FLOOR_SIZE]} />
        <meshStandardMaterial {...BLUE_EAST_WALL} />
      </mesh>
      <mesh position={[Xe, cyWin, (-ze0 + (-ROOM_HALF)) / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, winH, ROOM_HALF - ze0]} />
        <meshStandardMaterial {...BLUE_EAST_WALL} />
      </mesh>
      <mesh position={[Xe, cyWin, (ze0 + ROOM_HALF) / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, winH, ROOM_HALF - ze0]} />
        <meshStandardMaterial {...BLUE_EAST_WALL} />
      </mesh>
      <mesh position={[Xe - WALL_T / 2 - 0.025, cyWin, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ze0 * 2, winH]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <mesh position={[Xe - 0.07, cyWin, 0]} castShadow>
        <boxGeometry args={[0.1, winH + 0.1, ze0 * 2 + 0.12]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} metalness={0.22} />
      </mesh>

      {/* Цоколь: север/запад скрыты вместе с цветной заливкой, чтобы не было «полоски» */}
      <mesh position={[0, 0.28, Zn + 0.02]} castShadow receiveShadow visible={SHOW_ORANGE_GREEN_FILLS}>
        <boxGeometry args={[FLOOR_SIZE + 0.04, 0.56, 0.14]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.28, Zp - 0.02]} castShadow receiveShadow>
        <boxGeometry args={[FLOOR_SIZE + 0.04, 0.56, 0.14]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[Xw + 0.02, 0.28, 0]} castShadow receiveShadow visible={SHOW_ORANGE_GREEN_FILLS}>
        <boxGeometry args={[0.14, 0.56, FLOOR_SIZE + 0.04]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[Xe - 0.02, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 0.56, FLOOR_SIZE + 0.04]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.65} metalness={0.05} />
      </mesh>
    </group>
  );
}

export default function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        <meshStandardMaterial color="#eceff1" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 0]}
        receiveShadow
      >
        <circleGeometry args={[CARPET_RADIUS]} />
        <meshStandardMaterial color="#fff3e0" roughness={0.92} metalness={0} />
      </mesh>

      <OfficeShell />

      <WallArtAndDetails />

      <mesh position={[7.5, 2.55, 8.92]} rotation={[0, Math.PI, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.42, 0.1]} />
        <meshStandardMaterial
          color="#e040fb"
          emissive="#e040fb"
          emissiveIntensity={0.42}
        />
      </mesh>

      <NeonFloorAccent />

      {/* --- Dopamine Office: мебель (не загромождаем проход к NPC с миссией z≈4) --- */}
      <BeanBag x={-3.6} z={-2.4} color="#00bcd4" seamColor="#00838f" rotationY={0.35} />
      <BeanBag x={3.5} z={-2.2} color="#ff4081" seamColor="#c51162" rotationY={-0.5} />
      <BeanBag x={-2.8} z={3} color="#ffd740" seamColor="#ffc107" rotationY={1.1} />

      <LoungeChair
        x={-4.35}
        z={1.5}
        rotationY={0.55}
        fabric="#ec407a"
        accent="#ab47bc"
      />
      <LoungeChair
        x={4.25}
        z={1.25}
        rotationY={-0.65}
        fabric="#26c6da"
        accent="#00838f"
      />

      <Workstation x={4.55} z={-4.35} rotationY={Math.PI * 0.82} deskColor="#eceff1" />
      <CoffeeTableWithLaptop x={1.85} z={-2.85} />

      {/* Горшок с «энергией» */}
      <group position={[-4.8, 0, -3.8]} scale={ROOM_PROP_SCALE}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.44, 16]} />
          <meshStandardMaterial color="#ff7043" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.35, 14, 12]} />
          <meshStandardMaterial color="#66bb6a" roughness={0.75} />
        </mesh>
      </group>
    </group>
  );
}
