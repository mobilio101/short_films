// 한걸음: 10-second format test (vertical Short). Rules in HANGEOLEUM.md.
// 0–2 s: three fast cuts (alarm, phone glow, tired face) with the camera pushing in.
// 2–6 s: split screen, 게으른 나 (top) vs 한걸음 나 (bottom). 6–8 s: the step. 8–10 s: title.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { noise2D } from "@remotion/noise";
import { loadFont } from "@remotion/google-fonts/Jua";
import { LINE_STARTS, WORDS } from "./words";

export const TEST_HANGEOLEUM_DURATION = 300;

const JUA = loadFont("normal", { weights: ["400"] }).fontFamily;

const COL = {
  bg: "#0B0B10",
  bg2: "#15151D",
  floor: "#8A8A94",
  line: "#8A8A94",
  hero: "#F5A623",
  face: "#1A1A1A",
  shadow: "#000000",
  violet: "#8B6CFF",
  white: "#FFFFFF",
  prop: "#1E1E28",
  prop2: "#262632",
  blanket: "#23233A",
  phone: "#CFE3FF",
  clock: "#FF9A4D",
  lamp: "#FFD58A",
};

const W = 1080;
const PH = 960; // one panel of the room (half the screen)
const FLOOR = 800;
const R = 60; // hero head radius
const BODY_H = 120;
const BODY_W = 90;

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const tween = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- hand-drawn wobble (lines "boil" a little, stepped every 3 frames) ----------
type Pt = [number, number];
const wobble = (pts: Pt[], seed: string, frame: number, amp = 1.6, closed = true) => {
  const t = Math.floor(frame / 3) * 0.7;
  const dense: Pt[] = [];
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 28));
    for (let s = 0; s < steps; s++) dense.push([lerp(a[0], b[0], s / steps), lerp(a[1], b[1], s / steps)]);
  }
  if (!closed) dense.push(pts[pts.length - 1]);
  const d = dense
    .map(([x, y], i) => {
      const jx = noise2D(seed + "x", i * 0.31, t) * amp;
      const jy = noise2D(seed + "y", i * 0.31, t) * amp;
      return `${i ? "L" : "M"}${(x + jx).toFixed(1)},${(y + jy).toFixed(1)}`;
    })
    .join(" ");
  return closed ? d + " Z" : d;
};
const rrPts = (x: number, y: number, w: number, h: number, r: number): Pt[] => {
  const out: Pt[] = [];
  const corners: [number, number, number][] = [
    [x + w - r, y + r, -90],
    [x + w - r, y + h - r, 0],
    [x + r, y + h - r, 90],
    [x + r, y + r, 180],
  ];
  corners.forEach(([cx, cy, a0]) => {
    for (let k = 0; k <= 4; k++) {
      const a = ((a0 + k * 22.5) * Math.PI) / 180;
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  });
  return out;
};
const Shape: React.FC<{ pts: Pt[]; seed: string; f: number; fill?: string; stroke?: string; sw?: number; closed?: boolean; opacity?: number }> = ({
  pts, seed, f, fill = COL.prop, stroke = COL.line, sw = 2.2, closed = true, opacity,
}) => <path d={wobble(pts, seed, f, 1.6, closed)} fill={closed ? fill : "none"} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" opacity={opacity} />;

// ---------- glow ----------
const Glow: React.FC<{ id: string; x: number; y: number; r: number; color: string; o: number }> = ({ id, x, y, r, color, o }) =>
  o <= 0.001 ? null : (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={0.55 * o} />
          <stop offset="0.35" stopColor={color} stopOpacity={0.22 * o} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </g>
  );

// ---------- the hero ----------
type Face = { brow: number; browY: number; mouth: number; lid: number; gazeX: number; gazeY: number };
type HeroPose = {
  hip: Pt; rot: number; // rot in degrees, -90 = lying with the head to the left
  feet: [Pt, Pt]; hands: [Pt, Pt]; face: Face;
};
const toWorld = (hip: Pt, rot: number, lx: number, ly: number): Pt => {
  const a = (rot * Math.PI) / 180;
  return [hip[0] + lx * Math.cos(a) - ly * Math.sin(a), hip[1] + lx * Math.sin(a) + ly * Math.cos(a)];
};
const noodle = (a: Pt, b: Pt, bend: number) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return `M${a[0]},${a[1]} Q${mx - (dy / len) * bend},${my + (dx / len) * bend} ${b[0]},${b[1]}`;
};

const Hero: React.FC<{ p: HeroPose; f: number; legsOnTop?: boolean }> = ({ p, f }) => {
  const breathe = 1 + 0.018 * Math.sin(f * 0.16);
  const { face } = p;
  const shoulder = toWorld(p.hip, p.rot, 0, -BODY_H * 0.72);
  const limb = { stroke: COL.hero, strokeWidth: 15, strokeLinecap: "round" as const, fill: "none" };
  const hy = -BODY_H - R * 0.55; // head centre, local
  return (
    <g>
      {p.feet.map((ft, i) => <path key={"l" + i} d={noodle(toWorld(p.hip, p.rot, i ? 10 : -10, -6), ft, i ? 14 : -14)} {...limb} />)}
      <g transform={`translate(${p.hip[0]},${p.hip[1]}) rotate(${p.rot}) scale(1,${breathe})`}>
        <rect x={-BODY_W / 2} y={-BODY_H} width={BODY_W} height={BODY_H} rx={BODY_W * 0.45} fill={COL.hero} />
        <circle cx={0} cy={hy} r={R} fill={COL.hero} />
        {[-1, 1].map((d) => (
          <g key={d}>
            <ellipse cx={d * R * 0.36 + face.gazeX * R * 0.08} cy={hy + R * 0.02 + face.gazeY * R * 0.06} rx={R * 0.095} ry={R * 0.095 * face.lid} fill={COL.face} />
            <line
              x1={d * R * 0.54} y1={hy - R * (0.3 + face.browY) - face.brow * R * 0.45}
              x2={d * R * 0.16} y2={hy - R * (0.3 + face.browY) + face.brow * R * 0.45}
              stroke={COL.face} strokeWidth={R * 0.075} strokeLinecap="round"
            />
          </g>
        ))}
        <path d={`M${-R * 0.2},${hy + R * 0.4} Q0,${hy + R * 0.4 + face.mouth * R * 0.22} ${R * 0.2},${hy + R * 0.4}`} stroke={COL.face} strokeWidth={R * 0.065} strokeLinecap="round" fill="none" />
      </g>
      {p.hands.map((h, i) => <path key={"a" + i} d={noodle(shoulder, h, i ? 18 : -18)} {...limb} />)}
    </g>
  );
};

// ---------- 게으른 나 ----------
const Shadow: React.FC<{ x: number; floor: number; s: number; f: number; id: string }> = ({ x, floor, s, f, id }) => {
  if (s <= 0.02) return null;
  const sway = Math.sin(f * 0.07) * 4;
  const r = 78, bh = 200, bw = 130;
  return (
    <g transform={`translate(${x + sway},${floor}) scale(${s})`}>
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} opacity={0.9}>
        <rect x={-bw / 2} y={-bh - 40} width={bw} height={bh + 40} rx={bw * 0.45} fill="none" stroke={COL.violet} strokeWidth={14} />
        <circle cx={0} cy={-bh - 40 - r * 0.6} r={r} fill="none" stroke={COL.violet} strokeWidth={14} />
      </g>
      <rect x={-bw / 2} y={-bh - 40} width={bw} height={bh + 40} rx={bw * 0.45} fill={COL.shadow} stroke={COL.violet} strokeWidth={4} />
      <circle cx={0} cy={-bh - 40 - r * 0.6} r={r} fill={COL.shadow} stroke={COL.violet} strokeWidth={4} />
      {[-1, 1].map((d) => (
        <path key={d} d={`M${d * 48},${-bh - 40 - r * 0.62} q${-d * 18},9 ${-d * 36},1`} stroke={COL.violet} strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

// ---------- the room (one panel, 1080×960) ----------
type RoomState = {
  hero: HeroPose; blanketOff: number; phone: { pos: Pt; rot: number; on: number; buzz: boolean };
  clockGlow: number; lamp: number; shadow: { x: number; s: number }; zz: number; say: number; ringing: boolean;
};
const Room: React.FC<{ st: RoomState; f: number; id: string }> = ({ st, f, id }) => {
  const shake = st.ringing ? Math.sin(f * 2.3) * 4 : 0;
  const buzz = st.phone.buzz ? Math.sin(f * 3.1) * 3 : 0;
  const [px, py] = st.phone.pos;
  const head = toWorld(st.hero.hip, st.hero.rot, 0, -BODY_H - R * 0.55);
  return (
    <g>
      <rect x={0} y={0} width={W} height={PH} fill={COL.bg} />
      {/* light sources first, so they light what is near them */}
      <Glow id={`${id}-cg`} x={835} y={600} r={260} color={COL.clock} o={st.clockGlow} />
      <Glow id={`${id}-pg`} x={px} y={py} r={330} color={COL.phone} o={st.phone.on} />
      <Glow id={`${id}-lg`} x={890} y={560} r={760} color={COL.lamp} o={st.lamp} />
      <Shadow x={st.shadow.x} floor={FLOOR} s={st.shadow.s} f={f} id={`${id}-sh`} />
      {/* floor */}
      <Shape pts={[[-20, FLOOR], [W + 20, FLOOR]]} closed={false} seed={`${id}fl`} f={f} stroke={COL.floor} sw={2.5} />
      {/* bed */}
      <Shape pts={rrPts(225, 540, 26, 260, 8)} seed={`${id}hb`} f={f} fill={COL.prop2} />
      <Shape pts={rrPts(240, 655, 520, 60, 10)} seed={`${id}bf`} f={f} />
      <Shape pts={rrPts(258, 715, 18, 85, 4)} seed={`${id}bl1`} f={f} />
      <Shape pts={rrPts(724, 715, 18, 85, 4)} seed={`${id}bl2`} f={f} />
      <Shape pts={rrPts(250, 605, 505, 52, 16)} seed={`${id}mt`} f={f} fill={COL.prop2} />
      <Shape pts={rrPts(262, 568, 120, 42, 20)} seed={`${id}pl`} f={f} fill="#2E2E3C" />
      {/* bedside table, clock, lamp */}
      <Shape pts={rrPts(790, 640, 160, 160, 8)} seed={`${id}tb`} f={f} />
      <Shape pts={[[812, 718], [928, 718]]} closed={false} seed={`${id}tbd`} f={f} />
      <g transform={`translate(${shake},0)`}>
        <Shape pts={rrPts(800, 592, 70, 48, 10)} seed={`${id}ck`} f={f} fill="#15151D" />
        <text x={835} y={627} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={28} fill={COL.clock} opacity={0.5 + 0.5 * st.clockGlow}>7:00</text>
      </g>
      <Shape pts={[[905, 640], [905, 585]]} closed={false} seed={`${id}ls`} f={f} />
      <Shape pts={[[878, 590], [932, 590], [945, 545], [865, 545]]} seed={`${id}lp`} f={f} fill={st.lamp > 0.5 ? "#6B5530" : COL.prop2} />
      {/* phone (drawn before the hero so his hands hold it) */}
      <g transform={`translate(${px + buzz},${py}) rotate(${st.phone.rot})`}>
        <Shape pts={rrPts(-20, -36, 40, 72, 8)} seed={`${id}ph`} f={f} fill={st.phone.on > 0.2 ? COL.phone : "#20202A"} />
      </g>
      <Hero p={st.hero} f={f} />
      {/* blanket over the lying body, slides off */}
      <g transform={`translate(${st.blanketOff * 160},${st.blanketOff * 190}) rotate(${st.blanketOff * 10} 590 590)`} opacity={1 - st.blanketOff}>
        <Shape pts={[[420, 548], [520, 528], [640, 534], [758, 552], [770, 640], [430, 640]]} seed={`${id}bk`} f={f} fill={COL.blanket} />
      </g>
      {/* sleepy Zz and the lazy voice */}
      {st.zz > 0 && (
        <g opacity={st.zz} fontFamily={JUA} fill={COL.violet}>
          <text x={head[0] + 70} y={head[1] - 90 - Math.sin(f * 0.1) * 6} fontSize={40}>z</text>
          <text x={head[0] + 105} y={head[1] - 135 - Math.sin(f * 0.1 + 1) * 6} fontSize={56}>Z</text>
        </g>
      )}
    </g>
  );
};

// ---------- poses ----------
const sleepy: Face = { brow: -0.18, browY: -0.04, mouth: -0.25, lid: 0.45, gazeX: 0.6, gazeY: -0.6 };
const awake: Face = { brow: 0.16, browY: 0.06, mouth: 0.1, lid: 1, gazeX: 0.5, gazeY: 0 };
const proud: Face = { brow: 0.08, browY: 0.12, mouth: 0.7, lid: 1, gazeX: 0, gazeY: 0 };
const mixFace = (a: Face, b: Face, t: number): Face => ({
  brow: lerp(a.brow, b.brow, t), browY: lerp(a.browY, b.browY, t), mouth: lerp(a.mouth, b.mouth, t),
  lid: lerp(a.lid, b.lid, t), gazeX: lerp(a.gazeX, b.gazeX, t), gazeY: lerp(a.gazeY, b.gazeY, t),
});
const mixPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

const LYING_HIP: Pt = [492, 560];
const PHONE_HELD: Pt = [395, 440];
const lyingPose = (face: Face, f: number): HeroPose => ({
  hip: LYING_HIP, rot: -90,
  feet: [[700, 580], [712, 592]],
  hands: [[PHONE_HELD[0] - 12, PHONE_HELD[1] + 22 + Math.sin(f * 0.2) * 2], [PHONE_HELD[0] + 14, PHONE_HELD[1] + 24]],
  face,
});

/** 게으른 나: stays in bed with the phone; the shadow grows. */
const lazyState = (f: number): RoomState => {
  const twitch = f > 120 && f < 128 ? 0.08 : 0; // a flicker of "I should get up" that dies
  return {
    hero: lyingPose({ ...sleepy, brow: sleepy.brow + twitch }, f),
    blanketOff: 0,
    phone: { pos: PHONE_HELD, rot: 90, on: 1, buzz: false },
    clockGlow: 0.35, lamp: 0,
    shadow: { x: 565, s: tween(f, 62, 176, 0.95, 1.5) },
    zz: 0, say: tween(f, 100, 108, 0, 1), ringing: false,
  };
};

/** 한걸음 나: puts the phone down, sits up, feet to the floor, lamp on, stands. */
const stepState = (f: number): RoomState => {
  const phoneDown = tween(f, 96, 112, 0, 1);
  const up = tween(f, 128, 162, 0, 1); // lying -> sitting
  const dangle = tween(f, 160, 178, 0, 1);
  const reach = tween(f, 198, 213, 0, 1); // one foot to the floor
  const stand = tween(f, 222, 248, 0, 1);
  const decide = tween(f, 100, 112, 0, 1);
  let face = mixFace(sleepy, awake, decide);
  if (f > 213) face = mixFace(face, proud, tween(f, 213, 235, 0, 1));
  const sitHip: Pt = [690, 600];
  const hip = mixPt(mixPt(LYING_HIP, sitHip, up), [735, 660], stand);
  const rot = lerp(-90, 0, up);
  const footSit: [Pt, Pt] = [[840, 610], [852, 604]];
  const footHang: [Pt, Pt] = [[738, 748], [752, 740]];
  const footTouch: [Pt, Pt] = [[770, FLOOR - 4], [752, 742]];
  const footStand: [Pt, Pt] = [[722, FLOOR - 4], [752, FLOOR - 4]];
  const ly = lyingPose(face, f).feet;
  const feet = [0, 1].map((i) => {
    let p = mixPt(ly[i], footSit[i], up);
    p = mixPt(p, footHang[i], dangle);
    p = mixPt(p, footTouch[i], reach);
    return mixPt(p, footStand[i], stand);
  }) as [Pt, Pt];
  const held = lyingPose(face, f).hands;
  const rest: [Pt, Pt] = [toWorld(hip, rot, -40, -10), toWorld(hip, rot, 45, -10)];
  const cheer: [Pt, Pt] = [[hip[0] - 70, hip[1] - 300], [hip[0] + 75, hip[1] - 305]];
  const hands = [0, 1].map((i) => mixPt(mixPt(held[i], rest[i], phoneDown), cheer[i], tween(f, 258, 272, 0, 1))) as [Pt, Pt];
  const lamp = f >= 213 ? interpolate(f, [213, 216, 219, 224], [0, 1, 0.75, 1], { extrapolateRight: "clamp" }) : 0;
  return {
    hero: { hip, rot, feet, hands, face },
    blanketOff: tween(f, 112, 132, 0, 1),
    phone: { pos: mixPt(PHONE_HELD, [855, 632], phoneDown), rot: lerp(90, 90, phoneDown), on: 1 - phoneDown, buzz: false },
    clockGlow: 0.35 * (1 - lamp) + 0.15, lamp,
    shadow: { x: 520, s: interpolate(f, [62, 128, 200, 236], [0.95, 0.85, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) },
    zz: 0, say: 0, ringing: false,
  };
};

/** The shared morning before the split (used by the fast intro cuts). */
const introState = (f: number): RoomState => {
  const tap = tween(f, 6, 11, 0, 1);
  return {
    hero: {
      ...lyingPose(sleepy, f),
      face: { ...sleepy, lid: f < 40 ? 0.15 : 0.45 },
      hands: f < 17 ? [[lerp(560, 835, tap), lerp(520, 585, tap)], [400, 590]] : lyingPose(sleepy, f).hands,
    },
    blanketOff: 0,
    phone: f < 35 ? { pos: PHONE_HELD, rot: 90, on: f >= 19 ? 1 : 0, buzz: f >= 19 && f < 30 } : { pos: PHONE_HELD, rot: 90, on: 1, buzz: false },
    clockGlow: f < 11 ? 1 : 0.35, lamp: 0,
    shadow: { x: 520, s: 0 }, zz: f < 11 ? 0.8 : 0, say: 0, ringing: f < 11,
  };
};

// ---------- camera ----------
const Cam: React.FC<{ fx: number; fy: number; s: number; children: React.ReactNode }> = ({ fx, fy, s, children }) => (
  <g transform={`translate(540,960) scale(${s}) translate(${-fx},${-fy})`}>{children}</g>
);

// ---------- captions (white, word by word, broken at punctuation) ----------
const Captions: React.FC<{ f: number; y: number }> = ({ f, y }) => {
  const ms = (f / 30) * 1000;
  const pages: (typeof WORDS)[] = [];
  let cur: typeof WORDS = [];
  WORDS.filter((w) => w.line < 4).forEach((w) => {
    cur.push(w);
    if (/[.,?!]$/.test(w.text) || cur.length === 3) { pages.push(cur); cur = []; }
  });
  if (cur.length) pages.push(cur);
  const page = pages.find((p, i) => {
    const next = pages[i + 1];
    const end = next && next[0].line === p[0].line ? next[0].startMs - 60 : p[p.length - 1].endMs + 350;
    return ms >= p[0].startMs - 60 && ms < end;
  });
  if (!page) return null;
  const pop = tween(f, (page[0].startMs / 1000) * 30 - 2, (page[0].startMs / 1000) * 30 + 3, 0.88, 1);
  return (
    <div style={{ position: "absolute", left: 60, width: W - 60 - 160, top: y, transform: `translateY(-50%) scale(${pop})`, textAlign: "center", fontFamily: JUA, fontSize: 92, lineHeight: 1.15 }}>
      {page.map((w, i) => {
        const active = ms >= w.startMs - 40;
        return (
          <span key={i} style={{ color: COL.white, opacity: active ? 1 : 0.45, WebkitTextStroke: `12px ${COL.bg}`, paintOrder: "stroke fill", margin: "0 14px", display: "inline-block" }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

const Sfx: React.FC<{ name: string; at: number; len: number; vol?: number; rate?: number }> = ({ name, at, len, vol = 0.4, rate }) => (
  <Sequence from={at} durationInFrames={len} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} playbackRate={rate} />
  </Sequence>
);

// ---------- the film ----------
export const TestHangeoleum: React.FC = () => {
  const f = useCurrentFrame();

  // Fast intro: three cuts under 1 s each, the camera pushing in on each subject.
  let intro: React.ReactNode = null;
  if (f < 62) {
    const st = introState(f);
    const cam =
      f < 17 ? { fx: 835, fy: 612, s: tween(f, 0, 17, 3.6, 4.3) } // the alarm clock
        : f < 35 ? { fx: 392, fy: 455, s: tween(f, 17, 35, 4.6, 5.6) } // the phone lights up
          : { fx: 330, fy: 548, s: tween(f, 35, 62, 3.3, 4.1) }; // the tired face
    intro = (
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <rect width={W} height={1920} fill={COL.bg} />
        <Cam {...cam}><Room st={st} f={f} id="intro" /></Cam>
      </svg>
    );
  }

  // Split screen, then the bottom panel grows to fill the screen.
  const grow = tween(f, 176, 200, 0, 1);
  const split = f >= 62 ? (
    <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
      <rect width={W} height={1920} fill={COL.bg} />
      <defs>
        <clipPath id="topclip"><rect x={0} y={0} width={W} height={lerp(958, 0, grow)} /></clipPath>
        <clipPath id="botclip"><rect x={0} y={lerp(962, 0, grow)} width={W} height={1920} /></clipPath>
      </defs>
      {grow < 1 && (
        <g clipPath="url(#topclip)">
          <g transform={`translate(0,${lerp(40, -500, grow)})`}>
            <Room st={lazyState(f)} f={f} id="lazy" />
          </g>
        </g>
      )}
      <g clipPath="url(#botclip)">
        <g transform={`translate(${lerp(0, 540 - 600 * 1.45, grow)},${lerp(962 - 150, 1000 - 480 * 1.45, grow)}) scale(${lerp(1, 1.45, grow)})`}>
          <Room st={stepState(f)} f={f} id="step" />
        </g>
      </g>
      {grow < 1 && <line x1={0} x2={W} y1={lerp(960, 0, grow)} y2={lerp(960, 0, grow)} stroke={COL.floor} strokeWidth={3} />}
    </svg>
  ) : null;

  const lazy = lazyState(f);
  const labelsO = f >= 62 ? tween(f, 62, 70, 0, 1) * (1 - grow) : 0;
  const title = tween(f, 254, 262, 0, 1);
  const underline = tween(f, 264, 280, 0, 1);

  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      {intro}
      {split}
      {/* panel labels */}
      {labelsO > 0 && (
        <>
          <div style={{ position: "absolute", left: 70, top: 230, fontFamily: JUA, fontSize: 64, color: COL.violet, opacity: labelsO }}>게으른 나</div>
          <div style={{ position: "absolute", left: 70, top: 1035, fontFamily: JUA, fontSize: 64, color: COL.hero, opacity: labelsO }}>한걸음 나</div>
        </>
      )}
      {/* the lazy voice, beside the shadow's head */}
      {f >= 100 && grow < 1 && (
        <div style={{ position: "absolute", left: 690, top: 40 + 800 - 287 * lazy.shadow.s - 110, fontFamily: JUA, fontSize: 54, color: COL.violet, opacity: lazy.say * (1 - grow) }}>
          5분만 더…
        </div>
      )}
      {/* captions: low in the intro, on the seam in the split, low again after */}
      {f < 254 && <Captions f={f} y={f < 62 ? 1480 : f < 188 ? 960 : 1560} />}
      {/* title */}
      {title > 0 && (
        <div style={{ position: "absolute", left: 60, width: W - 220, top: 470, textAlign: "center", opacity: title, transform: `scale(${0.9 + 0.1 * title})` }}>
          <div style={{ fontFamily: JUA, fontSize: 150, color: COL.white, display: "inline-block", position: "relative" }}>
            일단 일어나.
            <div style={{ position: "absolute", left: 0, bottom: -6, height: 14, borderRadius: 7, background: COL.violet, width: `${underline * 100}%` }} />
          </div>
        </div>
      )}

      {/* voice */}
      {LINE_STARTS.map((at, i) => (
        <Sequence key={i} from={at} layout="none">
          <Audio src={staticFile(`voice/test-hangeoleum/line${i + 1}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {/* sound: quiet room, the alarm cut off by a tap, phone buzz, clock tick, the step, the lamp */}
      <Audio src={staticFile("sfx/roomtone.wav")} volume={0.18} />
      <Sfx name="alarm" at={0} len={11} vol={0.35} />
      <Sfx name="click" at={11} len={6} vol={0.5} />
      <Sfx name="hum" at={19} len={16} vol={0.35} rate={2.6} />
      <Sfx name="tick" at={35} len={60} vol={0.25} />
      <Sfx name="tick" at={120} len={60} vol={0.2} />
      <Sfx name="whoosh" at={58} len={18} vol={0.18} />
      <Sfx name="whoosh" at={176} len={18} vol={0.18} />
      <Sfx name="step" at={213} len={8} vol={0.6} />
      <Sfx name="click" at={214} len={6} vol={0.45} />
      <Sfx name="hum" at={216} len={60} vol={0.08} />
    </AbsoluteFill>
  );
};
