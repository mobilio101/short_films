// "Acoustic Kitty" (SMIRKMAN): the CIA's 1960s spy cat. 3D worlds (Three.js) with flat 2D Toon
// characters, cut to the ElevenLabs Brian voice-over. Plan and sources: STORY.md in this folder.
// The cat's fate is never said or shown (user's decision): the cat is only seen during the project.
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
import * as THREE from "three";
import { makeCues } from "../../components/shortkit";
import { INK, Look, MAIN, POP, Toon } from "../../characters/toon/Toon";
import { Cam, ContactShadow, Daylight, Project, World3D, lerpCam, placeToon, v3 } from "../../world3d/kit";
import { CatExpr } from "../../characters/toon/ToonCat";
import { CAT_SPOTS, Cat, CatPose, placeCat } from "./Cat";
import { Bush, DESK_TOP, Folder, Lab, LampPost, Office, Park, TABLE, Van, paperTexture } from "./sets";
import { WORDS } from "./words";

const { fontFamily: LILITA } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

const FPS = 30;
const { cue, end } = makeCues(WORDS, FPS);
export const ACOUSTIC_KITTY_DURATION = end + 30;
const DIS = 8; // dissolve length in frames

// ---- Shot boundaries, cut to the voice ----
const S = {
  s0a: 0,
  s0b: 22,
  s0c: 44,
  s1: 70,
  s2: cue("But a cat"),
  s3: cue("Years"),
  s4a: cue("Then came"),
  s4b: cue("The cat had"),
  s5a: cue("But the cat"),
  s5b: cue("care"),
  s6: cue("train"),
  s7a: cue("So the agents"),
  s7b: cue("In nineteen sixty-seven"),
  s8: cue("The CIA built"),
};

// ---- Cast ----
/** Smirkman as the CIA agent: tan trench coat, dark hat with a red band, red tie. */
const AGENT: Look = { ...MAIN, shirt: "#D9B072", pattern: "buttons", patternColor: "#8A5A34", tie: POP.red, shoes: "#5A3A22", hat: "bucket", hatColor: "#3A3F45", hatColor2: POP.red };
const AGENT_BARE: Look = { ...AGENT, sunglasses: false };
const BOSS: Look = { head: "square", skin: POP.skin2, hair: "#9AA0A6", hairStyle: "flat", shirt: "#6B7480", pattern: "pinstripe", patternColor: "#8D97A3", tie: POP.blue, shoes: INK, hat: "none", hatColor: INK, stubble: "#7F95B0" };
const SCI: Look = { head: "triangle", skin: POP.skin, hair: "#1B1B1B", hairStyle: "spiky", shirt: POP.white, pattern: "buttons", patternColor: POP.teal, tie: POP.purple, shoes: POP.teal, hat: "none", hatColor: INK };
const MAN1: Look = { head: "square", skin: POP.skin, hair: "#3B2618", hairStyle: "flat", shirt: "#7A828C", pattern: "pinstripe", patternColor: "#99A1AA", shoes: INK, hat: "bucket", hatColor: "#4B5058", hatColor2: "#2B2F33", stubble: "#8FA0B5" };
const MAN2: Look = { head: "square", skin: POP.skin2, hair: "#1B1B1B", hairStyle: "flat", shirt: "#8A6E52", pattern: "stripes", patternColor: "#A88A6C", shoes: INK, hat: "cap", hatColor: "#3A3F45", hatColor2: "#3A3F45", beard: "#3B2618" };

// ---- Helpers ----
const useLocal = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { f, pop: (at: number, damping = 9) => spring({ frame: f - at, fps, config: { damping, stiffness: 220 } }) };
};
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
const clamp01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** A shot that dissolves in over the previous one (or cuts hard). Frames inside are local to the shot. */
const Shot: React.FC<{ from: number; to: number; hard?: boolean; children: React.ReactNode }> = ({ from, to, hard, children }) => {
  const Inner: React.FC = () => {
    const f = useCurrentFrame();
    const o = hard ? 1 : interpolate(f, [0, DIS], [0, 1], { extrapolateRight: "clamp" });
    return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
  };
  return (
    <Sequence from={from} durationInFrames={to - from + DIS}>
      <Inner />
    </Sequence>
  );
};

/** A pop-up tag (white card, black outline) at a screen position. */
const Tag: React.FC<{ text: string; x: number; y: number; at: number; out?: number; color?: string; size?: number; rotate?: number }> = ({ text, x, y, at, out = 9999, color = POP.white, size = 70, rotate = -4 }) => {
  const { f, pop } = useLocal();
  if (f < at || f > out) return null;
  const s = pop(at, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${s}) rotate(${rotate}deg)`,
        background: color,
        border: `8px solid ${INK}`,
        borderRadius: 22,
        padding: "10px 30px 6px",
        fontFamily: LILITA,
        fontSize: size,
        color: color === POP.white || color === POP.yellow ? INK : POP.white,
        boxShadow: `10px 10px 0 ${INK}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** A rubber stamp that slams onto the screen (big, tilted, red outline). */
const Stamp: React.FC<{ text: string; sub?: string; x: number; y: number; at: number; rotate?: number; size?: number }> = ({ text, sub, x, y, at, rotate = -12, size = 120 }) => {
  const { f } = useLocal();
  if (f < at) return null;
  const s = interpolate(f - at, [0, 5, 9], [2.2, 0.94, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const o = interpolate(f - at, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${s})`, opacity: o, textAlign: "center" }}>
      <div style={{ border: `14px solid ${POP.red}`, borderRadius: 18, padding: "6px 34px 0", background: "rgba(255,255,255,0.88)", boxShadow: `8px 8px 0 ${INK}` }}>
        <div style={{ fontFamily: LILITA, fontSize: size, color: POP.red, letterSpacing: 4, lineHeight: 1.05 }}>{text}</div>
        {sub && <div style={{ fontFamily: LILITA, fontSize: size * 0.55, color: INK, marginTop: -6, paddingBottom: 6 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Captions: one or two words at a time, white with a thick black outline, in the middle of the screen. */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const ms = (f / FPS) * 1000;
  const chunks: { text: string; start: number; end: number }[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const brk = /[.,?!:"]$/.test(w.text) || cur.length >= 2 || i === WORDS.length - 1;
    if (brk) {
      chunks.push({ text: cur.map((c) => c.text).join(" "), start: cur[0].startMs, end: cur[cur.length - 1].endMs });
      cur = [];
    }
  });
  const idx = chunks.findIndex((c, i) => ms >= c.start && (i === chunks.length - 1 ? ms <= c.end + 400 : ms < chunks[i + 1].start));
  if (idx < 0) return null;
  const c = chunks[idx];
  const age = ms - c.start;
  const s = interpolate(age, [0, 90], [0.85, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1400, display: "flex", justifyContent: "center", transform: `scale(${s})` }}>
      <span
        style={{
          fontFamily: LILITA,
          fontSize: 104,
          color: POP.white,
          WebkitTextStroke: `16px ${INK}`,
          paintOrder: "stroke fill",
          textTransform: "uppercase",
          letterSpacing: 2,
          textShadow: `0 8px 0 ${INK}`,
        }}
      >
        {c.text.replace(/[.,:]$/, "").replace(/"/g, "")}
      </span>
    </div>
  );
};

const Sparkle: React.FC<{ x: number; y: number; at: number; size?: number }> = ({ x, y, at, size = 40 }) => {
  const f = useCurrentFrame();
  const t = (f - at) / 14;
  if (t < 0 || t > 1) return null;
  const s = Math.sin(t * Math.PI) * size;
  return <path d={`M${x},${y - s} L${x + s * 0.25},${y - s * 0.25} L${x + s},${y} L${x + s * 0.25},${y + s * 0.25} L${x},${y + s} L${x - s * 0.25},${y + s * 0.25} L${x - s},${y} L${x - s * 0.25},${y - s * 0.25} Z`} fill={POP.white} stroke={INK} strokeWidth={4} />;
};

/** The view through a spy lens: black mask with a round window, crosshair and range marks. */
const SpyLens: React.FC = () => {
  const f = useCurrentFrame();
  const cx = 540 + Math.sin(f / 9) * 8, cy = 820 + Math.cos(f / 11) * 6, r = 430;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <path d={`M0,0 H1080 V1920 H0 Z M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`} fill="#0B0F12" fillRule="evenodd" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1FC2B0" strokeWidth={14} />
        <circle cx={cx} cy={cy} r={r - 22} fill="none" stroke={INK} strokeWidth={6} opacity={0.5} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={POP.red} strokeWidth={4} opacity={0.8} />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={POP.red} strokeWidth={4} opacity={0.8} />
        <circle cx={cx} cy={cy} r={70} fill="none" stroke={POP.red} strokeWidth={4} opacity={0.8} />
        <text x={cx + r - 170} y={cy - r + 120} fontFamily={LILITA} fontSize={44} fill="#1FC2B0">
          REC ●
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/** Draw a Toon standing at a 3D spot. */
const At: React.FC<{ project: Project; at: THREE.Vector3; look: Look; id: string; h?: number; phones?: boolean } & Omit<React.ComponentProps<typeof Toon>, "x" | "y" | "scale" | "look" | "id">> = ({
  project,
  at,
  look,
  id,
  h = 1.6,
  phones,
  ...rest
}) => {
  const p = placeToon(project, at, h);
  return (
    <>
      <GroundShadow project={project} at={at} id={`t-${id}`} />
      <Toon id={id} x={p.x} y={p.y} scale={p.scale} look={look} {...rest} />
      {phones && <Headphones x={p.x} y={p.y} s={p.scale} />}
    </>
  );
};

/** A soft dark ellipse on the ground under a character, projected with the shot's camera, so feet touch the floor. */
const GroundShadow: React.FC<{ project: Project; at: THREE.Vector3; rx?: number; rz?: number; id: string; dark?: number }> = ({ project, at, rx = 0.36, rz = 0.2, id, dark = 0.34 }) => {
  const c = project(at);
  const a = project(at.clone().add(v3(rx, 0, 0))), b = project(at.clone().add(v3(-rx, 0, 0)));
  const n = project(at.clone().add(v3(0, 0, rz))), fz = project(at.clone().add(v3(0, 0, -rz)));
  const RX = Math.hypot(a.x - b.x, a.y - b.y) / 2;
  const RY = Math.max(4, Math.abs(n.y - fz.y) / 2);
  return (
    <g>
      <defs>
        <radialGradient id={`gs-${id}`}>
          <stop offset="0%" stopColor="#1a0f08" stopOpacity={dark} />
          <stop offset="60%" stopColor="#1a0f08" stopOpacity={dark * 0.75} />
          <stop offset="100%" stopColor="#1a0f08" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={c.x} cy={c.y} rx={RX} ry={RY} fill={`url(#gs-${id})`} />
    </g>
  );
};

/** Big headphones over the hat (Smirkman listening in the van), in Toon units. */
const Headphones: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 12) * 3;
  return (
    <g transform={`translate(${x},${y}) scale(${s}) translate(0,${bob})`}>
      <path d="M-176,-450 C-196,-800 196,-800 176,-450" fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d="M-176,-450 C-196,-800 196,-800 176,-450" fill="none" stroke={POP.red} strokeWidth={14} strokeLinecap="round" />
      {[-1, 1].map((d) => (
        <rect key={d} x={d > 0 ? 150 : -206} y={-530} width={56} height={120} rx={24} fill={POP.red} stroke={INK} strokeWidth={8} />
      ))}
      <path d="M200,-430 C260,-380 230,-300 290,-250" fill="none" stroke={INK} strokeWidth={6} />
    </g>
  );
};

/** Draw the cat sitting/walking at a 3D spot. */
const CatAt: React.FC<{ project: Project; at: THREE.Vector3; pose?: CatPose; expr?: CatExpr; mic?: boolean; antenna?: boolean; flip?: boolean }> = ({ project, at, ...rest }) => {
  const p = placeCat(project, at);
  const walk = rest.pose === "walk";
  return (
    <>
      <GroundShadow project={project} at={walk ? at.clone().add(v3(0, 0, 0)) : at} rx={walk ? 0.3 : 0.2} rz={walk ? 0.1 : 0.13} id={`c-${at.x.toFixed(2)}-${at.z.toFixed(2)}`} dark={0.4} />
      <Cat x={p.x} y={p.y} scale={p.scale} {...rest} />
    </>
  );
};

/** A man sitting on the park bench reading a newspaper: the Toon above the hem, with sitting legs drawn in 3D. */
const Sitter: React.FC<{ project: Project; at: THREE.Vector3; look: Look; id: string; expr?: React.ComponentProps<typeof Toon>["expr"]; gaze?: number; paper?: boolean }> = ({ project, at, look, id, expr = "neutral", gaze = 0, paper = true }) => {
  // Seat top 0.32 m: the Toon's shirt hem (0.35 m above its feet) rests on it.
  const origin = at.clone().add(v3(0, SEAT - 0.35, 0));
  const p = placeToon(project, origin);
  const legs = [-1, 1].map((d) => {
    const hip = project(at.clone().add(v3(d * 0.06, SEAT + 0.02, 0)));
    const knee = project(at.clone().add(v3(d * 0.1, SEAT + 0.03, 0.26)));
    const foot = project(at.clone().add(v3(d * 0.11, 0.0, 0.3)));
    return { d, hip, knee, foot };
  });
  const w = 11 * p.scale;
  return (
    <g>
      <defs>
        <clipPath id={`sit-${id}`}>
          <rect x={p.x - 1000} y={p.y - 2000} width={2000} height={2000 - 150 * p.scale} />
        </clipPath>
      </defs>
      <GroundShadow project={project} at={at.clone().add(v3(0, 0, 0.28))} rx={0.3} rz={0.14} id={`sit-sh-${id}`} />
      {legs.map(({ d, hip, knee, foot }) => (
        <g key={d}>
          <path d={`M${hip.x},${hip.y} L${knee.x},${knee.y} L${foot.x},${foot.y - 12 * p.scale}`} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={foot.x + d * 12 * p.scale} cy={foot.y - 12 * p.scale} rx={34 * p.scale} ry={17 * p.scale} fill={look.shoes} stroke={INK} strokeWidth={6 * p.scale} />
        </g>
      ))}
      <g clipPath={`url(#sit-${id})`}>
        <Toon id={id} x={p.x} y={p.y} scale={p.scale} look={look} expr={expr} gaze={gaze} handL={paper ? [-90, -250] : undefined} handR={paper ? [90, -250] : undefined} holding={paper ? <Newspaper /> : undefined} />
      </g>
    </g>
  );
};

/** Bench seat height in the park (see `Bench` in sets.tsx). */
const SEAT = 0.32;

/** A folded newspaper held at the chest (centred on the right hand). */
const Newspaper: React.FC = () => (
  <g transform="translate(-90,0)">
    <rect x={-120} y={-150} width={240} height={170} fill="#FFFDF4" stroke={INK} strokeWidth={7} />
    <rect x={-100} y={-132} width={200} height={26} fill={INK} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-100 + (i % 2) * 108} y={-92 + Math.floor(i / 2) * 50} width={92} height={10} fill="#9AA0A6" />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <rect key={`b${i}`} x={-100 + (i % 2) * 108} y={-72 + Math.floor(i / 2) * 50} width={70} height={10} fill="#9AA0A6" />
    ))}
  </g>
);

/** The closed file Smirkman holds at the end: a manila folder with a clipped photo of the cat. */
const CatFile: React.FC = () => (
  <g transform="translate(-120,60) rotate(-8)">
    <rect x={-130} y={-120} width={260} height={190} rx={8} fill="#F0C878" stroke={INK} strokeWidth={8} />
    <path d="M-130,-120 L-130,-150 L-40,-150 L-20,-120" fill="#F0C878" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <text x={-10} y={40} fontFamily={LILITA} fontSize={60} fill={INK} textAnchor="middle">
      KITTY
    </text>
    <rect x={20} y={-112} width={100} height={110} fill={POP.white} stroke={INK} strokeWidth={6} transform="rotate(6 70 -57)" />
    <rect x={30} y={-102} width={80} height={76} fill="#BFE6F2" transform="rotate(6 70 -57)" />
    <g transform="rotate(6 70 -57)">
      <Cat x={70} y={-20} scale={0.22} pose="sit" />
    </g>
    <path d="M60,-126 L60,-96" stroke="#9AA6B2" strokeWidth={8} strokeLinecap="round" />
  </g>
);

// =========================== OFFICE ===========================
const OfficeLight: React.FC = () => <Daylight sun={[3.5, 7, -12]} sunColor="#FFE7B8" amb={1.05} sunI={3.0} />;
const OFFICE_BG = "#F2C14E";
const OFFICE_FOG: [string, number, number] = ["#F6DDA0", 5, 18];

/** Blurred front props for office shots: a lamp shade and a plant leaf near the frame edges. */
const OfficeFront: React.FC<{ side?: number }> = ({ side = 1 }) => (
  <>
    <group position={[side * 1.9, 0, 2.2]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 1.0, 16]} />
        <meshStandardMaterial color="#F2363B" />
      </mesh>
    </group>
    <group position={[-side * 2.0, 1.85, 2.0]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.3, 0.3, 18]} />
        <meshStandardMaterial color="#1FC2B0" />
      </mesh>
    </group>
  </>
);

const BOSS_SPOT = v3(-0.55, 0, -0.05);
const AGENT_SPOT = v3(0.8, 0, 0.3);

/** 0c · Intro cut 3: Smirkman's raised eyebrow and smirk, fast push-in. */
const Shot0c: React.FC = () => {
  const { f } = useLocal();
  const k = ease(f, 0, S.s1 - S.s0c);
  const cam = lerpCam({ pos: v3(0.45, 1.35, 2.3), target: v3(0.8, 1.2, 0.3), fov: 44 }, { pos: v3(0.65, 1.38, 1.6), target: v3(0.8, 1.22, 0.3), fov: 42 }, k);
  return (
    <World3D
      cam={cam}
      bg={OFFICE_BG}
      fog={OFFICE_FOG}
      focus={1.6}
      back={
        <>
          <OfficeLight />
          <Office frame={f} />
        </>
      }
      chars={(p) => {
        const a = placeToon(p, AGENT_SPOT);
        return (
          <>
            <At project={p} at={AGENT_SPOT} look={AGENT} id="a0" expr="sneaky" gaze={-6} />
            <Sparkle x={a.x - 50 * a.scale} y={a.y - 490 * a.scale} at={8} size={70} />
          </>
        );
      }}
    />
  );
};

/** 1 · The office: the boss slides a file marked CAT across the desk to Smirkman. */
const Shot1: React.FC = () => {
  const { f } = useLocal();
  const len = S.s2 - S.s1;
  const cam = lerpCam({ pos: v3(1.5, 1.35, 3.9), target: v3(0.2, 1.0, -0.9), fov: 58 }, { pos: v3(-0.6, 1.25, 3.4), target: v3(0.2, 1.0, -0.9), fov: 58 }, ease(f, 0, len + DIS));
  const slide = ease(f, cue("Soviets") - S.s1, cue("close") - S.s1);
  return (
    <World3D
      cam={cam}
      bg={OFFICE_BG}
      fog={OFFICE_FOG}
      focus={4.2}
      back={
        <>
          <OfficeLight />
          <Office frame={f}>
            <Folder position={[-0.45 + slide * 0.95, DESK_TOP + 0.002, 0.2]} rotation={[0, -0.3 + slide * 0.5, 0]} word="CAT" />
          </Office>
          <ContactShadow at={BOSS_SPOT} />
          <ContactShadow at={AGENT_SPOT} />
        </>
      }
      front={<OfficeFront />}
      chars={(p) => (
        <>
          <At project={p} at={BOSS_SPOT} look={BOSS} id="b1" expr={f > cue("close") - S.s1 ? "smug" : "neutral"} gaze={10} />
          <At project={p} at={AGENT_SPOT} look={AGENT} id="a1" expr="sneaky" gaze={-10} />
        </>
      )}
    />
  );
};

/** 3 · "Years of work. Millions of dollars." Piles of files and cash grow on the desk; the boss despairs. */
const Shot3: React.FC = () => {
  const { f } = useLocal();
  const len = S.s4a - S.s3;
  const cam = lerpCam({ pos: v3(0.7, 1.2, 2.7), target: v3(0.05, 1.0, -0.9), fov: 56 }, { pos: v3(0.25, 1.18, 2.1), target: v3(0.05, 1.0, -0.9), fov: 56 }, ease(f, 0, len + DIS));
  const mil = cue("Millions") - S.s3;
  const folders = 2 + Math.floor(clamp01(f, 0, mil) * 10);
  const cash = Math.floor(clamp01(f, mil, mil + 30) * 9);
  const boss = v3(0.72, 0, 0.0);
  return (
    <World3D
      cam={cam}
      bg={OFFICE_BG}
      fog={OFFICE_FOG}
      focus={2.9}
      back={
        <>
          <OfficeLight />
          <Office frame={f} folders={folders} cash={cash} />
          <ContactShadow at={boss} />
        </>
      }
      chars={(p) => <At project={p} at={boss} look={BOSS} id="b3" expr={f > mil ? "panic" : "neutral"} gaze={12} armsUp={f > mil ? 0.6 : 0} />}
    />
  );
};

/** 7a · The final report on the desk: the camera rises off the paper to the boss and Smirkman. */
const Report: React.FC = () => {
  const map = React.useMemo(() => paperTexture("FINAL REPORT", "PROJECT: KITTY"), []);
  return (
    <mesh position={[0, DESK_TOP + 0.004, 0.15]} rotation={[-Math.PI / 2, 0, 0.08]} receiveShadow>
      <planeGeometry args={[0.42, 0.56]} />
      <meshStandardMaterial map={map} roughness={1} />
    </mesh>
  );
};
const Shot7a: React.FC = () => {
  const { f } = useLocal();
  const len = S.s7b - S.s7a;
  const cam = lerpCam({ pos: v3(0.05, 1.7, 0.2), target: v3(0, 0.78, -0.72), fov: 48 }, { pos: v3(0.05, 1.3, 4.8), target: v3(0.0, 0.95, -0.9), fov: 58 }, ease(f, 30, len - 20));
  // Standing at the two ends of the desk, out of the way of the camera that rises off the report.
  const boss = v3(-1.2, 0, -0.45);
  const agent = v3(1.2, 0, -0.4);
  return (
    <World3D
      cam={cam}
      bg={OFFICE_BG}
      fog={OFFICE_FOG}
      focus={3.6}
      back={
        <>
          <OfficeLight />
          <Office frame={f}>
            <Report />
          </Office>
          <ContactShadow at={boss} />
          <ContactShadow at={agent} />
        </>
      }
      chars={(p) => (
        <>
          <At project={p} at={boss} look={BOSS} id="b7" expr={f > cue("practical") - S.s7a ? "smug" : "neutral"} gaze={10} />
          <At project={p} at={agent} look={AGENT} id="a7" expr="sneaky" gaze={-10} />
        </>
      )}
    />
  );
};

/** 7b · Cancelled: the CAT file slides into the filing cabinet and the drawer slams shut. */
const Shot7b: React.FC = () => {
  const { f } = useLocal();
  const len = S.s8 - S.s7b;
  const cam = lerpCam({ pos: v3(1.2, 1.55, 0.6), target: v3(3.1, 1.0, -2.3), fov: 52 }, { pos: v3(1.6, 1.45, 0.2), target: v3(3.1, 1.05, -2.3), fov: 50 }, ease(f, 0, len + DIS));
  const slam = len - 34;
  const open = f < slam ? 1 : interpolate(f, [slam, slam + 5], [1, 0], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const fk = ease(f, 6, slam - 6);
  // The file glides from the desk side into the open drawer.
  const from = new THREE.Vector3(3.05, 1.95, -1.4), into = new THREE.Vector3(3.17, 1.3, -1.85);
  const pos = from.clone().lerp(into, fk);
  const shake = f >= slam && f < slam + 8 ? Math.sin(f * 3) * 0.02 : 0;
  cam.pos.y += shake;
  return (
    <World3D
      cam={cam}
      bg={OFFICE_BG}
      fog={OFFICE_FOG}
      focus={3.2}
      back={
        <>
          <OfficeLight />
          <Office frame={f} drawer={open} />
          {f < slam && <Folder position={pos.toArray() as [number, number, number]} rotation={[Math.PI / 2 - 0.25, -0.1, 0]} word="CAT" />}
        </>
      }
    />
  );
};

/** 8 · Payoff: Smirkman by the striped window, holding the closed file, smirks to camera. */
const Shot8: React.FC = () => {
  const { f } = useLocal();
  const len = ACOUSTIC_KITTY_DURATION - S.s8;
  const spot = v3(1.2, 0, -1.6);
  const cam = lerpCam({ pos: v3(0.2, 1.3, 2.6), target: v3(1.2, 1.25, -1.6), fov: 56 }, { pos: v3(1.0, 1.25, 0.6), target: v3(1.2, 1.05, -1.6), fov: 54 }, ease(f, 0, len));
  return (
    <World3D
      cam={cam}
      bg={OFFICE_BG}
      fog={OFFICE_FOG}
      focus={3.0}
      back={
        <>
          <OfficeLight />
          <Office frame={f} />
          <ContactShadow at={spot} />
        </>
      }
      front={<OfficeFront side={-1} />}
      chars={(p) => {
        const a = placeToon(p, spot);
        return (
          <>
            <At project={p} at={spot} look={AGENT} id="a8" expr="sneaky" gaze={0} holding={<CatFile />} handR={[120, -270]} />
            <Sparkle x={a.x + 55 * a.scale} y={a.y - 490 * a.scale} at={cue("agree") - S.s8} size={70} />
          </>
        );
      }}
    />
  );
};

// =========================== LAB ===========================
const LabLight: React.FC = () => <Daylight sun={[4, 9, 6]} sunColor="#FFFFFF" amb={1.25} sunI={1.6} />;
const CAT_TABLE = v3(0, TABLE + 0.07, 0.05);

/** 0b · Intro cut 2: a tiny microphone in the cat's ear. */
const Shot0b: React.FC = () => {
  const { f } = useLocal();
  const k = ease(f, 0, S.s0c - S.s0b);
  const cam = lerpCam({ pos: v3(-0.35, 1.3, 1.05), target: v3(-0.04, 1.24, 0.05), fov: 42 }, { pos: v3(-0.2, 1.3, 0.75), target: v3(-0.04, 1.26, 0.05), fov: 40 }, k);
  return (
    <World3D
      cam={cam}
      bg="#D8F3EC"
      fog={["#E6F7F2", 3, 14]}
      focus={1.2}
      back={
        <>
          <LabLight />
          <Lab frame={f} />
        </>
      }
      chars={(p) => <CatAt project={p} at={CAT_TABLE} mic antenna={false} />}
    />
  );
};

const labCam = (f: number, len: number) =>
  lerpCam({ pos: v3(-0.1, 1.3, 3.6), target: v3(0.45, 0.9, 0.1), fov: 56 }, { pos: v3(0.9, 1.25, 3.0), target: v3(0.45, 0.92, 0.1), fov: 56 }, ease(f, 0, len + DIS));

/** 2 · The lab: the cat on the table, the scientist with tiny tools; the three spy parts pop up. */
const Shot2: React.FC = () => {
  const { f } = useLocal();
  const len = S.s3 - S.s2;
  const cam = labCam(f, len);
  const sci = v3(0.95, 0, 0.45);
  const mic = f >= cue("microphone") - S.s2;
  const ant = f >= cue("antenna") - S.s2;
  return (
    <World3D
      cam={cam}
      bg="#D8F3EC"
      fog={["#E6F7F2", 4, 16]}
      focus={3.6}
      back={
        <>
          <LabLight />
          <Lab frame={f} />
          <ContactShadow at={sci} />
        </>
      }
      front={
        <mesh position={[-1.0, 0.6, 1.9]}>
          <cylinderGeometry args={[0.12, 0.12, 1.2, 14]} />
          <meshStandardMaterial color="#8B5CF6" />
        </mesh>
      }
      chars={(p) => (
        <>
          <At project={p} at={sci} look={SCI} id="s2" expr={mic ? "grin" : "sneaky"} gaze={-12} handL={[-170, -330]} handR={[120, -300]} />
          <CatAt project={p} at={CAT_TABLE} mic={mic} antenna={ant} />
        </>
      )}
    />
  );
};

/** Screen spots of the cat's parts in shot 2, for the pop-up labels (computed with the same camera). */
const LabLabels: React.FC = () => {
  const { f } = useLocal();
  const len = S.s3 - S.s2;
  const cam = labCam(f, len);
  const p = placeCat((q) => {
    const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 400);
    c.position.copy(cam.pos);
    c.lookAt(cam.target);
    c.updateMatrixWorld();
    c.updateProjectionMatrix();
    const v = q.clone().project(c);
    return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920 };
  }, CAT_TABLE);
  const at = (ux: number, uy: number) => ({ x: p.x + ux * p.scale, y: p.y + uy * p.scale });
  const ear = at(CAT_SPOTS.ear.x, CAT_SPOTS.ear.y), skull = at(CAT_SPOTS.skull.x, CAT_SPOTS.skull.y), fur = at(CAT_SPOTS.antenna.x, CAT_SPOTS.antenna.y);
  const Line: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; from: number }> = ({ a, b, from }) =>
    f >= from ? <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={7} strokeDasharray="14 10" /> : null;
  const tMic = cue("microphone") - S.s2, tTx = cue("transmitter") - S.s2, tAnt = cue("antenna") - S.s2;
  return (
    <>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <Line a={ear} b={{ x: 230, y: 560 }} from={tMic} />
          <Line a={skull} b={{ x: 830, y: 1180 }} from={tTx} />
          <Line a={fur} b={{ x: 820, y: 470 }} from={tAnt} />
          {[
            [ear, tMic],
            [skull, tTx],
            [fur, tAnt],
          ].map(([q, t], i) => (f >= (t as number) ? <circle key={i} cx={(q as { x: number }).x} cy={(q as { y: number }).y} r={16} fill={POP.yellow} stroke={INK} strokeWidth={6} /> : null))}
        </svg>
      </AbsoluteFill>
      <Tag text="MIC" x={230} y={560} at={tMic} color={POP.yellow} size={66} />
      <Tag text="TRANSMITTER" x={760} y={1180} at={tTx} color={POP.white} size={58} rotate={3} />
      <Tag text="ANTENNA" x={800} y={470} at={tAnt} color={POP.red} size={62} rotate={5} />
    </>
  );
};

/** 6 · Split screen. Left: the cat CAN walk to the X. Right: it won't listen, it just yawns at the scientist. */
const Half: React.FC<{ side: "L" | "R"; children: React.ReactNode }> = ({ side, children }) => (
  <div style={{ position: "absolute", top: 0, left: side === "L" ? 0 : 540, width: 540, height: 1920, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: -270, width: 1080, height: 1920 }}>{children}</div>
  </div>
);
const Shot6: React.FC = () => {
  const { f } = useLocal();
  const walkEnd = cue("distances") - S.s6 + 12;
  const wk = clamp01(f, 0, walkEnd);
  const catL = v3(-0.5 + wk * 2.1, 0, 1.0);
  const camL: Cam = { pos: v3(catL.x - 0.05, 0.6, 2.5), target: v3(catL.x + 0.02, 0.25, 1.0), fov: 50 };
  const camR: Cam = { pos: v3(0.02 - f * 0.001, 1.0, 3.2 - f * 0.002), target: v3(0.02, 0.38, 0.8), fov: 60 };
  const catR = v3(0.1, 0, 1.3), sci = v3(-0.14, 0, 0.55);
  const nope = cue("It could not") - S.s6;
  const wants = cue("A cat does") - S.s6;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Half side="L">
        <World3D
          cam={camL}
          bg="#D8F3EC"
          fog={["#E6F7F2", 4, 16]}
          back={
            <>
              <LabLight />
              <Lab frame={f} tape />
              <ContactShadow at={catL} size={0.5} />
            </>
          }
          chars={(p) => <CatAt project={p} at={catL} pose={wk < 1 ? "walk" : "sit"} />}
        />
      </Half>
      <Half side="R">
        <World3D
          cam={camR}
          bg="#D8F3EC"
          fog={["#E6F7F2", 4, 16]}
          back={
            <>
              <LabLight />
              <Lab frame={f} tape />
              <ContactShadow at={catR} size={0.5} />
              <ContactShadow at={sci} />
            </>
          }
          chars={(p) => (
            <>
              <At project={p} at={sci} look={SCI} id="s6" expr={f > nope ? "angry" : "neutral"} gaze={12} handR={[200, -230 + Math.sin(f / 4) * 20]} />
              <CatAt project={p} at={catR} expr={f > nope + 6 && f < wants ? "yawn" : "neutral"} />
            </>
          )}
        />
      </Half>
      <div style={{ position: "absolute", left: 532, top: 0, width: 16, height: 1920, background: POP.yellow, borderLeft: `6px solid ${INK}`, borderRight: `6px solid ${INK}` }} />
      <Tag text="CAN WALK" x={270} y={330} at={cue("walk") - S.s6} color={POP.yellow} size={60} />
      <Tag text="WON'T LISTEN" x={810} y={330} at={nope} color={POP.red} size={54} rotate={4} />
    </AbsoluteFill>
  );
};

// =========================== PARK ===========================
const ParkLight: React.FC = () => <Daylight sun={[6, 10, 5]} sunColor="#FFF1D2" amb={1.15} sunI={2.6} />;
const PARK_BG = "#CFEBFF";
const PARK_FOG: [string, number, number] = ["#CFEBFF", 6, 45];
const CAT_PARK = v3(0.25, 0, -0.3);
const MEN = [v3(-0.45, 0, -1.02), v3(0.5, 0, -1.02)];

/** 0a · Intro cut 1: the cat's eye through a spy lens, pushing in. */
const Shot0a: React.FC = () => {
  const { f } = useLocal();
  const k = ease(f, 0, S.s0b);
  const cam = lerpCam({ pos: v3(0.25, 0.38, 0.85), target: v3(0.25, 0.27, -0.3), fov: 44 }, { pos: v3(0.25, 0.36, 0.55), target: v3(0.25, 0.27, -0.3), fov: 40 }, k);
  return (
    <AbsoluteFill>
      <World3D
        cam={cam}
        bg={PARK_BG}
        fog={PARK_FOG}
        focus={1.0}
        back={
          <>
            <ParkLight />
            <Park frame={f} />
          </>
        }
        chars={(p) => <CatAt project={p} at={CAT_PARK} />}
      />
      <SpyLens />
    </AbsoluteFill>
  );
};

/** Blurred front props for park shots: a flower bush and the lamp post near the frame edges. */
const ParkFront: React.FC = () => (
  <>
    <Bush position={[-1.6, 0, 2.3]} s={1.3} flowers="#FF4F7B" />
    <LampPost position={[1.7, 0, 2.6]} />
  </>
);

/** 4a · The first mission: the park, two men on a bench, the compound far behind; the cat walks in. */
const Shot4a: React.FC = () => {
  const { f } = useLocal();
  const len = S.s4b - S.s4a;
  const cam = lerpCam({ pos: v3(-2.2, 1.15, 4.4), target: v3(0, 0.9, -1.2), fov: 58 }, { pos: v3(1.3, 1.0, 3.5), target: v3(0, 0.85, -1.0), fov: 58 }, ease(f, 0, len + DIS));
  const walkIn = cue("Two men") - S.s4a;
  const wk = ease(f, walkIn - 10, len - 6);
  const cat = v3(-1.6 + wk * 1.85, 0, -0.3 + (1 - wk) * 0.3);
  return (
    <World3D
      cam={cam}
      bg={PARK_BG}
      fog={PARK_FOG}
      focus={5.0}
      back={
        <>
          <ParkLight />
          <Park frame={f} />
          {f >= walkIn - 10 && <ContactShadow at={cat} size={0.5} />}
        </>
      }
      front={<ParkFront />}
      chars={(p) => (
        <>
          <Sitter project={p} at={MEN[0]} look={MAN1} id="m1" gaze={6} />
          <Sitter project={p} at={MEN[1]} look={MAN2} id="m2" gaze={-6} />
          {f >= walkIn - 10 && <CatAt project={p} at={cat} pose={wk < 1 ? "walk" : "sit"} />}
        </>
      )}
    />
  );
};

/** Screen spot of the compound for its label in shot 4a. */
const Shot4aTags: React.FC = () => (
  <>
    <Tag text="WASHINGTON, D.C." x={540} y={300} at={cue("Washington") - S.s4a} size={58} />
    <Tag text="SOVIET COMPOUND" x={560} y={420} at={cue("compound") - S.s4a} color={POP.red} size={50} rotate={3} />
    <Tag text="2 MEN, 1 BENCH" x={540} y={560} at={cue("Two men") - S.s4a} color={POP.yellow} size={52} rotate={-3} />
  </>
);

/** 5a · Hard cut: the cat gives the mission one big yawn. */
const Shot5a: React.FC = () => {
  const { f } = useLocal();
  const cam: Cam = { pos: v3(0.3, 0.5, 1.45 - f * 0.008), target: v3(0.22, 0.42, -0.6), fov: 50 };
  return (
    <World3D
      cam={cam}
      bg={PARK_BG}
      fog={PARK_FOG}
      focus={2.2}
      back={
        <>
          <ParkLight />
          <Park frame={f} />
          <ContactShadow at={CAT_PARK} size={0.5} />
        </>
      }
      chars={(p) => (
        <>
          <Sitter project={p} at={MEN[0]} look={MAN1} id="m5a" gaze={8} />
          <Sitter project={p} at={MEN[1]} look={MAN2} id="m5b" gaze={-8} />
          <CatAt project={p} at={CAT_PARK} expr={f < 18 ? "yawn" : "neutral"} />
        </>
      )}
    />
  );
};

// =========================== VAN ===========================
const VanLight: React.FC = () => (
  <>
    <ambientLight color="#DCE8FF" intensity={1.0} />
    <hemisphereLight color="#EAF6FF" groundColor="#3C4652" intensity={0.7} />
    <directionalLight color="#FFF1D2" intensity={1.4} position={[1, 3, -4]} castShadow />
  </>
);
const VAN_SPOT = v3(0.2, 0, -0.35);

/** 4b · The listening van: Smirkman in headphones, smirking. "The cat had one job: listen." */
const Shot4b: React.FC = () => {
  const { f } = useLocal();
  const len = S.s5a - S.s4b;
  const cam = lerpCam({ pos: v3(0.75, 1.35, 2.4), target: v3(0.1, 1.15, -0.6), fov: 56 }, { pos: v3(0.45, 1.4, 1.75), target: v3(0.15, 1.2, -0.6), fov: 54 }, ease(f, 0, len));
  return (
    <World3D
      cam={cam}
      bg="#3E5670"
      fog={["#3E5670", 3, 12]}
      focus={2.0}
      back={
        <>
          <VanLight />
          <Van frame={f} />
          <ContactShadow at={VAN_SPOT} />
        </>
      }
      chars={(p) => <At project={p} at={VAN_SPOT} look={AGENT} id="a4" expr="sneaky" gaze={-8} phones handL={[-170, -480]} />}
    />
  );
};

/** 5b · Smirkman's running gag: shades fly off, a deadpan look around, they drop back with a clink. */
const SHADES_BACK = 34;
const Shot5b: React.FC = () => {
  const { f } = useLocal();
  const shake = f < 8 ? Math.sin(f * 2.7) * 0.03 : 0;
  const cam: Cam = { pos: v3(0.35 + shake, 1.2 + shake, 1.35), target: v3(0.2, 0.92, -0.35), fov: 50 };
  const phase = f < 12 ? "shock" : f < SHADES_BACK ? "bare" : "back";
  return (
    <World3D
      cam={cam}
      bg="#3E5670"
      fog={["#3E5670", 3, 12]}
      focus={1.6}
      back={
        <>
          <VanLight />
          <Van frame={f} />
        </>
      }
      chars={(p) => {
        const a = placeToon(p, VAN_SPOT);
        const drop = clamp01(f, SHADES_BACK - 8, SHADES_BACK);
        return (
          <>
            <At
              project={p}
              at={VAN_SPOT}
              look={phase === "bare" ? AGENT_BARE : AGENT}
              id="a5"
              expr={phase === "shock" ? "shock" : phase === "bare" ? "neutral" : "sneaky"}
              gaze={phase === "bare" ? (f < 23 ? -14 : 14) : 0}
              phones
            />
            {phase === "bare" && drop > 0 && (
              // The shades falling back down onto his nose.
              <g transform={`translate(${a.x},${a.y - (480 + (1 - drop) * 420) * a.scale}) scale(${a.scale})`}>
                {[-1, 1].map((d) => (
                  <circle key={d} cx={d * 56} cy={0} r={40} fill="#1E1E1E" stroke={INK} strokeWidth={9} />
                ))}
                <path d="M-16,-6 Q0,-16 16,-6" fill="none" stroke={INK} strokeWidth={10} />
              </g>
            )}
            {phase === "back" && <Sparkle x={a.x + 60 * a.scale} y={a.y - 500 * a.scale} at={SHADES_BACK} size={60} />}
          </>
        );
      }}
    />
  );
};

// =========================== SOUND ===========================
const Sfx: React.FC<{ at: number; name: string; vol?: number; len?: number; rate?: number }> = ({ at, name, vol = 0.4, len = 60, rate }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={len} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} playbackRate={rate} />
  </Sequence>
);
const Bed: React.FC<{ from: number; to: number; name: string; vol: number }> = ({ from, to, name, vol }) => (
  <Sequence from={from} durationInFrames={to - from + DIS} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} loop volume={vol} />
  </Sequence>
);

const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("voice/acoustic-kitty.mp3")} volume={0.92} />
    {/* Ambience beds */}
    <Bed from={S.s0a} to={S.s0b} name="roomtone" vol={0.12} />
    <Bed from={S.s0b} to={S.s0c} name="hum" vol={0.06} />
    <Bed from={S.s0c} to={S.s2} name="roomtone" vol={0.14} />
    <Bed from={S.s2} to={S.s3} name="hum" vol={0.06} />
    <Bed from={S.s3} to={S.s4a} name="roomtone" vol={0.14} />
    <Bed from={S.s4a} to={S.s4b} name="roomtone" vol={0.14} />
    <Bed from={S.s4b} to={S.s5a} name="static" vol={0.05} />
    <Bed from={S.s5a} to={S.s5b} name="roomtone" vol={0.14} />
    <Bed from={S.s5b} to={S.s6} name="static" vol={0.04} />
    <Bed from={S.s6} to={S.s7a} name="hum" vol={0.06} />
    <Bed from={S.s7a} to={ACOUSTIC_KITTY_DURATION - DIS} name="roomtone" vol={0.14} />
    {/* Intro cuts */}
    <Sfx at={2} name="click" vol={0.4} len={10} />
    <Sfx at={S.s0b} name="pop" vol={0.35} len={15} />
    <Sfx at={S.s0c + 8} name="shimmer" vol={0.2} len={30} />
    <Sfx at={S.s1} name="whoosh" vol={0.22} len={20} />
    {/* Office */}
    <Sfx at={cue("sixties")} name="pop" vol={0.4} len={15} />
    <Sfx at={cue("Soviets")} name="whoosh" vol={0.18} len={20} rate={1.3} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} at={S.s1 + 20 + i * 30} name="tick" vol={0.12} len={10} />
    ))}
    {/* Lab */}
    <Sfx at={S.s2} name="whoosh" vol={0.22} len={20} />
    <Sfx at={cue("surgeons")} name="hiss" vol={0.08} len={30} />
    {["microphone", "transmitter", "antenna"].map((w) => (
      <Sfx key={w} at={cue(w)} name="pop" vol={0.45} len={15} />
    ))}
    {/* Money */}
    <Sfx at={cue("Years")} name="stamp" vol={0.3} len={20} />
    <Sfx at={cue("Millions")} name="coins" vol={0.35} len={45} />
    {/* Park */}
    <Sfx at={S.s4a} name="whoosh" vol={0.22} len={20} />
    <Sfx at={cue("Washington")} name="pop" vol={0.35} len={15} />
    <Sfx at={cue("compound")} name="pop" vol={0.35} len={15} />
    <Sfx at={cue("Two men")} name="pop" vol={0.35} len={15} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Sfx key={`st${i}`} at={cue("Two men") - 6 + i * 8} name="step" vol={0.08} len={8} rate={1.6} />
    ))}
    {/* Van */}
    <Sfx at={cue("listen")} name="static" vol={0.18} len={25} />
    {/* The cat doesn't care; the shades gag */}
    <Sfx at={S.s5a} name="boing" vol={0.3} len={25} rate={0.8} />
    <Sfx at={S.s5b} name="whoosh" vol={0.3} len={20} />
    <Sfx at={S.s5b + SHADES_BACK} name="clink" vol={0.45} len={12} />
    {/* Split screen */}
    <Sfx at={cue("walk")} name="pop" vol={0.4} len={15} />
    <Sfx at={cue("It could not")} name="boing" vol={0.3} len={25} />
    {/* Report and cancel */}
    <Sfx at={S.s7a} name="whoosh" vol={0.22} len={20} />
    <Sfx at={cue("wrote")} name="type" vol={0.22} len={45} />
    <Sfx at={cue("practical")} name="stamp" vol={0.5} len={20} />
    <Sfx at={cue("cancelled")} name="stamp" vol={0.5} len={20} />
    <Sfx at={S.s8 - 34} name="slam" vol={0.4} len={30} />
    {/* Payoff */}
    <Sfx at={cue("agree")} name="shimmer" vol={0.25} len={30} />
  </>
);

// =========================== FILM ===========================
export const AcousticKitty: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Shot from={S.s0a} to={S.s0b} hard>
      <Shot0a />
    </Shot>
    <Shot from={S.s0b} to={S.s0c} hard>
      <Shot0b />
    </Shot>
    <Shot from={S.s0c} to={S.s1} hard>
      <Shot0c />
    </Shot>
    <Shot from={S.s1} to={S.s2} hard>
      <Shot1 />
      <Tag text="1960s" x={540} y={330} at={cue("sixties") - S.s1} />
      <Tag text="TARGET: SOVIETS" x={540} y={460} at={cue("Soviets") - S.s1} color={POP.red} size={54} rotate={3} />
    </Shot>
    <Shot from={S.s2} to={S.s3}>
      <Shot2 />
      <LabLabels />
    </Shot>
    <Shot from={S.s3} to={S.s4a}>
      <Shot3 />
      <Tag text="YEARS" x={300} y={340} at={0} color={POP.yellow} size={70} />
      <Tag text="$ MILLIONS" x={700} y={470} at={cue("Millions") - S.s3} color={POP.green} size={70} rotate={5} />
    </Shot>
    <Shot from={S.s4a} to={S.s4b}>
      <Shot4a />
      <Shot4aTags />
    </Shot>
    <Shot from={S.s4b} to={S.s5a}>
      <Shot4b />
      <Tag text="ONE JOB: LISTEN" x={540} y={330} at={cue("listen") - S.s4b} color={POP.yellow} size={60} />
    </Shot>
    <Shot from={S.s5a} to={S.s5b} hard>
      <Shot5a />
    </Shot>
    <Shot from={S.s5b} to={S.s6} hard>
      <Shot5b />
    </Shot>
    <Shot from={S.s6} to={S.s7a} hard>
      <Shot6 />
    </Shot>
    <Shot from={S.s7a} to={S.s7b}>
      <Shot7a />
      <Tag text="FINAL REPORT" x={540} y={320} at={cue("report") - S.s7a} size={62} />
      <Tag text={'"NOT PRACTICAL."'} x={540} y={520} at={cue("quote") - S.s7a} out={cue("practical") - S.s7a - 1} color={POP.white} size={56} rotate={-2} />
      <Stamp text="NOT PRACTICAL" x={540} y={560} at={cue("practical") - S.s7a} size={96} />
    </Shot>
    <Shot from={S.s7b} to={S.s8}>
      <Shot7b />
      <Stamp text="CANCELLED" sub="1967" x={540} y={520} at={cue("cancelled") - S.s7b} size={118} rotate={-10} />
    </Shot>
    <Shot from={S.s8} to={ACOUSTIC_KITTY_DURATION}>
      <Shot8 />
    </Shot>
    <Captions />
    <Soundtrack />
  </AbsoluteFill>
);
