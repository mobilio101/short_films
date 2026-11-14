import React from "react";
import { AbsoluteFill } from "remotion";
import { noise2D } from "@remotion/noise";
import { loadFont as loadPatrick } from "@remotion/google-fonts/PatrickHand";
import { loadFont as loadAudiowide } from "@remotion/google-fonts/Audiowide";
import { loadFont as loadCabin } from "@remotion/google-fonts/CabinSketch";
import { loadFont as loadLimelight } from "@remotion/google-fonts/Limelight";
import { loadFont as loadBungee } from "@remotion/google-fonts/Bungee";
import { HERO_SKIN, SHADOW_SKIN } from "../../components/Character";
import { C, DEFAULT_UI, FLOOR_Y, H, W } from "../../components/theme";
import { FilmStyle } from "./StyledTest";
import { BULB_Y, LAMP_X, WINDOW, getState } from "./timeline";

const PATRICK = loadPatrick("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const AUDIOWIDE = loadAudiowide("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const CABIN = loadCabin("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
const LIMELIGHT = loadLimelight("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

// ---------------------------------------------------------------------------
// 0. Channel style (the original test film)
// ---------------------------------------------------------------------------
export const CHANNEL: FilmStyle = {
  ui: DEFAULT_UI,
  bg: C.bg,
  floor: { color: C.line, width: 2 },
  prop: { stroke: C.line, strokeWidth: 2.2, wobble: 1.6, dark: "#1E1E26", metal: "#24242C", bar: "#3A3A44", glass: "#12141E", shade: "#2A2420" },
  moon: C.moon,
  lamp: C.lamp,
  bulb: "#FFE2A8",
  glow: 1,
  heroSkin: HERO_SKIN,
  shadowSkin: SHADOW_SKIN,
  heroLit: true,
  flashColor: "#FFFFFF",
  sound: { kit: "default" },
};

// ---------------------------------------------------------------------------
// 1. Paper cut-out stop-motion: construction paper, hard drop shadows,
//    held for 2 frames ("on twos") with a little boil, like hand-moved paper.
// ---------------------------------------------------------------------------
const PaperGrain: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.85, pointerEvents: "none" }}>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={4} seed={4} />
      <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.56  0 0 0 0 0.5  0 0 0 1.4 -0.1" />
    </filter>
    <rect width={W} height={H} filter="url(#paper)" />
  </svg>
);
const torn = (y: number, seed: string, amp: number) =>
  Array.from({ length: 49 }, (_, i) => `L${i * 40},${(y + noise2D(seed, i * 0.9, 0) * amp).toFixed(1)}`).join(" ");
const PaperBackdrop: React.FC = () => (
  // layered sheets of torn construction paper: wall, skirting strip, floor
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.35))" }}>
    <path d={`M0,150 ${torn(150, "wall", 10)} L${W},150 L${W},${FLOOR_Y} L0,${FLOOR_Y} Z`} fill="#2C3A58" />
    <path d={`M0,${FLOOR_Y - 46} ${torn(FLOOR_Y - 46, "skirt", 4)} L${W},${FLOOR_Y - 46} L${W},${FLOOR_Y} L0,${FLOOR_Y} Z`} fill="#3A2F2A" />
    <path
      d={`M0,${FLOOR_Y} ${Array.from({ length: 49 }, (_, i) => `L${i * 40},${FLOOR_Y + noise2D("tear", i, 0) * 5}`).join(" ")} L${W},${FLOOR_Y} L${W},${H} L0,${H} Z`}
      fill="#141A26"
    />
  </svg>
);
export const PAPER: FilmStyle = {
  ui: { font: PATRICK, white: "#F3EBDD", accent: "#A48BFF", titleBg: "#141A26", textScale: 1.15, letterSpacing: 0 },
  bg: "#1A2238",
  floor: { color: "#C9BBA4", width: 3 },
  prop: { stroke: "#F3E6CC", strokeWidth: 2.5, wobble: 3, dark: "#6B4A2E", metal: "#4A4F63", bar: "#A9ACB8", glass: "#3E5A86", shade: "#C9772F" },
  moon: "#F3EBDD",
  lamp: "#FFB45C",
  bulb: "#FFF0C8",
  glow: 0.8,
  heroSkin: { body: "#F2A33A", outline: "#FFF1D6", outlineWidth: 3, face: "#2A1D12", filter: "drop-shadow(10px 12px 0 rgba(0,0,0,0.5))" },
  shadowSkin: { body: "#0B0B0F", outline: "#A48BFF", outlineWidth: 4, face: "#C9B8FF", filter: "drop-shadow(10px 12px 0 rgba(0,0,0,0.55))" },
  heroLit: true,
  hold: 2,
  worldFilter: () => "drop-shadow(9px 11px 0 rgba(0,0,0,0.45))",
  Backdrop: PaperBackdrop,
  Overlay: PaperGrain,
  flashColor: "#FFF6E6",
  sound: { kit: "default" },
};

// ---------------------------------------------------------------------------
// 2. Neon: everything is a glowing tube outline on black, a retro perspective
//    grid under the floor and soft scanlines.
// ---------------------------------------------------------------------------
const NeonGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const lines: React.ReactNode[] = [];
  const vx = W / 2;
  for (let i = -14; i <= 14; i++) {
    lines.push(<line key={`v${i}`} x1={vx + i * 40} y1={FLOOR_Y} x2={vx + i * 260} y2={H} stroke="#FF3FB4" strokeWidth={1.5} opacity={0.45} />);
  }
  for (let j = 0; j < 8; j++) {
    const t = ((j + (frame * 0.02) % 1) / 8) ** 2;
    const y = FLOOR_Y + t * (H - FLOOR_Y);
    lines.push(<line key={`h${j}`} x1={0} y1={y} x2={W} y2={y} stroke="#FF3FB4" strokeWidth={1.5} opacity={0.2 + 0.4 * t} />);
  }
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 6px #FF3FB4)" }}>
      {lines}
    </svg>
  );
};
const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)",
      pointerEvents: "none",
    }}
  />
);
export const NEON: FilmStyle = {
  ui: { font: AUDIOWIDE, white: "#E9FBFF", accent: "#B49CFF", titleBg: "#030308", textScale: 0.85, letterSpacing: 2 },
  bg: "#04040A",
  floor: { color: "#3CF0FF", width: 3 },
  prop: { stroke: "#3CF0FF", strokeWidth: 3, wobble: 0.6, dark: "#04040A", metal: "#04040A", bar: "#04040A", glass: "#04040A", shade: "#04040A" },
  moon: "#CFE8FF",
  lamp: "#FFB347",
  bulb: "#FFE2A8",
  glow: 1.3,
  heroSkin: { body: "#04040A", outline: "#FFB02E", outlineWidth: 3.5, face: "#FFB02E", glow: "#FF9F1A" },
  shadowSkin: { body: "#04040A", outline: "#9B7BFF", outlineWidth: 3.5, face: "#C9B8FF", glow: "#8B6CFF" },
  heroLit: false,
  worldFilter: () => "drop-shadow(0 0 4px #3CF0FF) drop-shadow(0 0 12px rgba(60,240,255,0.5))",
  Backdrop: NeonGrid,
  Overlay: Scanlines,
  flashColor: "#BFF8FF",
  sound: { kit: "default" },
};

// ---------------------------------------------------------------------------
// 3. Chalkboard: white and coloured chalk on a slate board; every line
//    "boils" (redrawn slightly differently every 3 frames).
// ---------------------------------------------------------------------------
const ChalkDefs: React.FC<{ frame: number }> = ({ frame }) => (
  <defs>
    <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={Math.floor(frame / 3)} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={7} result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 1.6" result="mask" />
      <feComposite in="d" in2="mask" operator="in" />
    </filter>
  </defs>
);
const ChalkSmudges: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.05), transparent 40%), radial-gradient(ellipse at 75% 70%, rgba(255,255,255,0.04), transparent 45%), radial-gradient(ellipse at 55% 20%, rgba(255,255,255,0.035), transparent 35%)",
    }}
  />
);
export const CHALK: FilmStyle = {
  ui: { font: CABIN, white: "#F1F1EA", accent: "#B9A6FF", titleBg: "#1B2420", textScale: 1, letterSpacing: 1 },
  bg: "#1F2925",
  floor: { color: "#E8E8DE", width: 4 },
  prop: { stroke: "#E8E8DE", strokeWidth: 4, wobble: 1, dark: "rgba(232,232,222,0.12)", metal: "rgba(232,232,222,0.2)", bar: "rgba(232,232,222,0.1)", glass: "rgba(140,170,220,0.12)", shade: "rgba(255,190,110,0.3)" },
  moon: "#F4F4EC",
  lamp: "#FFD9A0",
  bulb: "#FFF4DC",
  glow: 0.45,
  heroSkin: { body: "rgba(245,166,35,0.55)", outline: "#FFD27A", outlineWidth: 3.5, face: "#F1F1EA" },
  shadowSkin: { body: "#0E1311", outline: "#D2C4FF", outlineWidth: 6, face: "#E2D8FF", glow: "#8B6CFF" },
  heroLit: false,
  worldFilter: () => "url(#chalk)",
  Defs: ChalkDefs,
  Backdrop: ChalkSmudges,
  flashColor: "#F1F1EA",
  sound: { kit: "default" },
};

// ---------------------------------------------------------------------------
// 4. Vintage 1930s cartoon reel: black and white, thick rubber-hose outlines,
//    film grain, flicker, gate weave, dust, scratches and a projector rattle.
// ---------------------------------------------------------------------------
const FilmDamage: React.FC<{ frame: number }> = ({ frame }) => {
  const scratches = [0, 1, 2].filter((i) => noise2D("scr" + i, frame * 0.15, 0) > 0.35);
  const dust = Array.from({ length: 6 }, (_, i) => ({
    on: noise2D("dust" + i, frame * 0.9, 1) > 0.55,
    x: ((noise2D("dx" + i, frame, 0) + 1) / 2) * W,
    y: ((noise2D("dy" + i, frame, 0) + 1) / 2) * H,
    r: 2 + Math.abs(noise2D("dr" + i, frame, 0)) * 5,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.55 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {scratches.map((i) => {
          const x = ((noise2D("sx" + i, Math.floor(frame / 3), 0) + 1) / 2) * W;
          return <line key={i} x1={x} y1={0} x2={x + 6} y2={H} stroke="#EDEDED" strokeWidth={1.4} opacity={0.5} />;
        })}
        {dust.filter((d) => d.on).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={i % 2 ? "#111" : "#EEE"} opacity={0.7} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};
export const VINTAGE: FilmStyle = {
  ui: { font: LIMELIGHT, white: "#F2F2F2", accent: "#BDBDBD", titleBg: "#0A0A0A", textScale: 0.9, letterSpacing: 2 },
  bg: "#2A2A2A",
  floor: { color: "#DADADA", width: 4 },
  prop: { stroke: "#0A0A0A", strokeWidth: 5, wobble: 1.2, dark: "#4A4A4A", metal: "#1E1E1E", bar: "#8A8A8A", glass: "#151515", shade: "#D8D8D8" },
  moon: "#F5F5F5",
  lamp: "#FFFFFF",
  bulb: "#FFFFFF",
  glow: 0.8,
  heroSkin: { body: "#E8E8E8", outline: "#0A0A0A", outlineWidth: 4.5, face: "#0A0A0A" },
  shadowSkin: { body: "#050505", outline: "#BDBDBD", outlineWidth: 3, face: "#F2F2F2", glow: "#9A9A9A" },
  heroLit: true,
  pictureFilter: (f) => `grayscale(1) sepia(0.18) contrast(1.15) brightness(${0.95 + 0.08 * noise2D("flick", f * 0.8, 0)})`,
  weave: (f) => [noise2D("wx", f * 0.3, 0) * 3, noise2D("wy", f * 0.5, 0) * 4],
  Overlay: FilmDamage,
  flashColor: "#FFFFFF",
  sound: { kit: "default", projector: true },
};

// ---------------------------------------------------------------------------
// 5. Memphis: 1980s Memphis design at night. Flat bold colours, thick black
//    outlines, hard pink offset shadows, flat rings of light instead of soft
//    glows, and geometric confetti (squiggles, triangles, zigzags, dots).
// ---------------------------------------------------------------------------
const BUNGEE = loadBungee("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const M = { pink: "#FF5FA2", teal: "#2EC4B6", yellow: "#FFD23F", lilac: "#9B8CFF", cream: "#FFF6E9", ink: "#0A0A0A", night: "#17134A" };

type Confetti = { kind: string; x: number; y: number; size: number; color: string; rot: number; seed: number };
const CONFETTI: Confetti[] = (() => {
  const kinds = ["squiggle", "triangle", "dot", "ring", "zigzag", "grid", "half", "cross"];
  const colors = [M.pink, M.teal, M.yellow, M.lilac];
  // hand-placed around the edges and upper wall, away from where the action happens
  const spots: [number, number][] = [
    [70, 260], [240, 720], [640, 250], [1000, 215], [1180, 190], [1500, 250],
    [1700, 170], [1840, 420], [1620, 610], [1480, 770], [1860, 740], [60, 470],
  ];
  return spots.map(([x, y], i) => ({
    kind: kinds[i % kinds.length],
    x,
    y,
    size: 34 + ((i * 37) % 30),
    color: colors[(i * 3) % colors.length],
    rot: (i * 47) % 360,
    seed: i,
  }));
})();

const ConfettiShape: React.FC<{ c: Confetti; frame: number }> = ({ c, frame }) => {
  const dx = Math.sin(frame / 40 + c.seed) * 6;
  const dy = Math.cos(frame / 33 + c.seed * 2) * 6;
  const rot = c.rot + Math.sin(frame / 50 + c.seed) * 12;
  const s = c.size;
  let el: React.ReactNode;
  switch (c.kind) {
    case "squiggle":
      el = <path d={`M${-s},0 q${s / 4},${-s / 2} ${s / 2},0 t${s / 2},0 t${s / 2},0 t${s / 2},0`} stroke={c.color} strokeWidth={9} fill="none" strokeLinecap="round" />;
      break;
    case "triangle":
      el = <path d={`M0,${-s * 0.6} L${s * 0.6},${s * 0.45} L${-s * 0.6},${s * 0.45} Z`} fill={c.color} stroke={M.ink} strokeWidth={4} />;
      break;
    case "dot":
      el = <circle r={s * 0.35} fill={c.color} stroke={M.ink} strokeWidth={4} />;
      break;
    case "ring":
      el = <circle r={s * 0.45} fill="none" stroke={c.color} strokeWidth={10} />;
      break;
    case "zigzag":
      el = <path d={`M${-s},0 l${s / 3},${-s / 3} l${s / 3},${s / 3} l${s / 3},${-s / 3} l${s / 3},${s / 3} l${s / 3},${-s / 3} l${s / 3},${s / 3}`} stroke={c.color} strokeWidth={8} fill="none" strokeLinejoin="round" />;
      break;
    case "grid":
      el = (
        <g>
          {[0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => <circle key={`${i}${j}`} cx={(i - 1) * s * 0.4} cy={(j - 1) * s * 0.4} r={4.5} fill={c.color} />))}
        </g>
      );
      break;
    case "half":
      el = <path d={`M${-s * 0.5},0 A${s * 0.5},${s * 0.5} 0 0 1 ${s * 0.5},0 Z`} fill={c.color} stroke={M.ink} strokeWidth={4} />;
      break;
    default:
      el = <path d={`M${-s * 0.4},0 H${s * 0.4} M0,${-s * 0.4} V${s * 0.4}`} stroke={c.color} strokeWidth={10} strokeLinecap="round" />;
  }
  return <g transform={`translate(${c.x + dx},${c.y + dy}) rotate(${rot})`}>{el}</g>;
};

const MemphisBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const st = getState(frame, 30);
  // Flat concentric rings of light: solid colour bands, no soft gradients.
  const rings = (cx: number, cy: number, radii: number[], colors: string[], on: number, key: string) => (
    <g opacity={on}>
      {radii.map((r, i) => (
        <circle key={`${key}${i}`} cx={cx} cy={cy} r={r * (0.97 + 0.03 * Math.sin(frame / 10 + i))} fill={colors[i]} />
      ))}
    </g>
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {rings(WINDOW.moonX, WINDOW.moonY, [230, 165, 105], ["#1F1A5A", "#28226E", "#332C85"], 1, "m")}
      {rings(LAMP_X, BULB_Y + 30, [560, 440, 330, 230, 140], ["#2A2270", "#43297E", "#713487", "#B8578A", "#F2957F"], st.lampOn, "l")}
      {/* dotted halo around the bulb */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + frame * 0.01;
        return <circle key={`h${i}`} cx={LAMP_X + Math.cos(a) * 150} cy={BULB_Y + 30 + Math.sin(a) * 150} r={5} fill={M.yellow} opacity={st.lampOn * 0.9} />;
      })}
      {CONFETTI.map((c) => <ConfettiShape key={c.seed} c={c} frame={frame} />)}
      {/* floor: black and white checker strip, then terrazzo flecks */}
      {Array.from({ length: Math.ceil(W / 28) + 1 }, (_, i) => (
        <rect key={`ck${i}`} x={i * 28} y={FLOOR_Y + 3} width={28} height={22} fill={i % 2 ? M.cream : M.ink} />
      ))}
      <rect x={0} y={FLOOR_Y + 25} width={W} height={H - FLOOR_Y - 25} fill="#221C5C" />
      {Array.from({ length: 70 }, (_, i) => (
        <rect
          key={`tz${i}`}
          x={(i * 271) % W}
          y={FLOOR_Y + 40 + ((i * 97) % (H - FLOOR_Y - 60))}
          width={6 + (i % 4) * 3}
          height={4 + (i % 3) * 2}
          fill={[M.pink, M.teal, M.yellow, M.cream][i % 4]}
          transform={`rotate(${(i * 53) % 180} ${(i * 271) % W} ${FLOOR_Y + 40 + ((i * 97) % (H - FLOOR_Y - 60))})`}
        />
      ))}
    </svg>
  );
};

export const MEMPHIS: FilmStyle = {
  ui: { font: BUNGEE, white: M.cream, accent: M.pink, titleBg: M.night, textScale: 0.8, letterSpacing: 1 },
  bg: M.night,
  floor: { color: M.cream, width: 5 },
  prop: { stroke: M.ink, strokeWidth: 5, wobble: 0, dark: M.teal, metal: M.pink, bar: M.yellow, glass: "#2B2580", shade: M.yellow },
  moon: M.cream,
  lamp: M.yellow,
  bulb: M.cream,
  glow: 0,
  heroSkin: { body: "#FFB627", outline: M.ink, outlineWidth: 5, face: M.ink },
  shadowSkin: { body: M.ink, outline: M.pink, outlineWidth: 5, face: M.yellow },
  heroLit: false,
  worldFilter: () => `drop-shadow(10px 10px 0 ${M.pink})`,
  Backdrop: MemphisBackdrop,
  flashColor: M.yellow,
  sound: { kit: "default" },
};
