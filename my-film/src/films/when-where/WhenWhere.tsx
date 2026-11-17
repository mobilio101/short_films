// 한걸음: "언제, 어디서, 정해." (vertical Short, about 51 s). Rules in HANGEOLEUM.md, plan in STORY.md.
// The hero, the shadow and the drawing style follow the approved test (src/films/test-hangeoleum);
// the flat, the props, the study scene and the park are this film's own.
//   0–62     fast intro: shoes by the door, the reminder swiped away, the tired face
//   62–540   split: 게으른 나 grows (top) / the hero on the couch, the week passes (bottom)
//   540–1128 the study: two groups, only the one with a written plan gets up and goes
//   1128–1335 split: the lamp, the sticky note "화 7시, 공원", "나중에" crumbles
//   1335–1530 Tuesday 7 pm: the door opens, the park under the streetlight, the title
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { noise2D } from "@remotion/noise";
import { loadFont } from "@remotion/google-fonts/Jua";
import { LINE_STARTS, WORDS } from "./words";

export const WHEN_WHERE_DURATION = 1530;

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
  phone: "#CFE3FF",
  lamp: "#FFD58A",
  hall: "#FFC978",
  note: "#FFE066",
  shoe: "#9FB4D8",
  street: "#FFCF8A",
  tree: "#14141B",
};

const W = 1080;
const FLOOR = 800;
const R = 60;
const BODY_H = 120;
const BODY_W = 90;

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const tween = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------- hand-drawn wobble (same feel as the test) ----------
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
const circlePts = (cx: number, cy: number, r: number, n = 14): Pt[] =>
  Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as Pt);
const Shape: React.FC<{ pts: Pt[]; seed: string; f: number; fill?: string; stroke?: string; sw?: number; closed?: boolean; opacity?: number }> = ({
  pts, seed, f, fill = COL.prop, stroke = COL.line, sw = 2.2, closed = true, opacity,
}) => <path d={wobble(pts, seed, f, 1.6, closed)} fill={closed ? fill : "none"} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" opacity={opacity} />;

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

// ---------- the hero (same build as the approved test) ----------
type Face = { brow: number; browY: number; mouth: number; lid: number; gazeX: number; gazeY: number };
type HeroPose = { hip: Pt; rot: number; feet: [Pt, Pt]; hands: [Pt, Pt]; face: Face };
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
const ShoeAt: React.FC<{ p: Pt; f: number; seed: string; dir?: number }> = ({ p, f, seed, dir = 1 }) => (
  <g>
    <Shape pts={rrPts(p[0] - 18 * dir - (dir < 0 ? 40 : 0), p[1] - 14, 40, 20, 9)} seed={seed} f={f} fill={COL.shoe} sw={2} />
    <line x1={p[0] - 18} x2={p[0] + 22} y1={p[1] + 5} y2={p[1] + 5} stroke={COL.white} strokeWidth={4} strokeLinecap="round" />
  </g>
);
const Hero: React.FC<{ p: HeroPose; f: number; shoes?: boolean; id?: string }> = ({ p, f, shoes, id = "h" }) => {
  const breathe = 1 + 0.018 * Math.sin(f * 0.16);
  const { face } = p;
  const shoulder = toWorld(p.hip, p.rot, 0, -BODY_H * 0.72);
  const limb = { stroke: COL.hero, strokeWidth: 15, strokeLinecap: "round" as const, fill: "none" };
  const hy = -BODY_H - R * 0.55;
  return (
    <g>
      {p.feet.map((ft, i) => <path key={"l" + i} d={noodle(toWorld(p.hip, p.rot, i ? 10 : -10, -6), ft, i ? 14 : -14)} {...limb} />)}
      {shoes && p.feet.map((ft, i) => <ShoeAt key={"s" + i} p={[ft[0] + 6, ft[1] + 4]} f={f} seed={`${id}sh${i}`} />)}
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

// ---------- 게으른 나 (same build as the approved test) ----------
const Shadow: React.FC<{ x: number; floor: number; s: number; f: number; id: string; squint?: number }> = ({ x, floor, s, f, id, squint = 0 }) => {
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
        <path key={d} d={`M${d * 48},${-bh - 40 - r * 0.62 - squint * 4} q${-d * 18},${9 - squint * 14} ${-d * 36},${1 + squint * 6}`} stroke={COL.violet} strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};
const SHADOW_HEAD = 287; // head centre above the floor at scale 1

// ---------- faces ----------
const tired: Face = { brow: -0.16, browY: -0.04, mouth: -0.25, lid: 0.55, gazeX: 0.3, gazeY: 0.5 };
const neutral: Face = { brow: 0, browY: 0, mouth: 0, lid: 1, gazeX: 0, gazeY: 0 };
const fired: Face = { brow: 0.22, browY: 0.1, mouth: 0.45, lid: 1, gazeX: 0, gazeY: -0.2 };
const unsure: Face = { brow: -0.12, browY: 0.08, mouth: -0.1, lid: 1, gazeX: 1, gazeY: 0.2 };
const focus: Face = { brow: 0.1, browY: 0, mouth: 0.05, lid: 1, gazeX: 0.9, gazeY: 0.7 };
const proud: Face = { brow: 0.08, browY: 0.12, mouth: 0.7, lid: 1, gazeX: 0, gazeY: 0 };
const mixFace = (a: Face, b: Face, t: number): Face => ({
  brow: lerp(a.brow, b.brow, t), browY: lerp(a.browY, b.browY, t), mouth: lerp(a.mouth, b.mouth, t),
  lid: lerp(a.lid, b.lid, t), gazeX: lerp(a.gazeX, b.gazeX, t), gazeY: lerp(a.gazeY, b.gazeY, t),
});
const mixPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// ---------- the flat (one panel, 1080×960) ----------
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
type FlatState = {
  hero: HeroPose | null; heroShoes: boolean;
  phone: { pos: Pt; on: number; banner: number; bannerX: number };
  lamp: number; hall: number; doorOpen: number;
  dust: number; shoesOnFloor: boolean; tag: boolean;
  day: number; dayO: number; circleTue: number; cal: boolean;
  note: { at: Pt; o: number; text: number; onDoor: boolean; glow: number } | null;
  shadow: { x: number; s: number; squint?: number };
};
const NOTE_TEXT = ["화 7시,", "공원"];
const Note: React.FC<{ at: Pt; text: number; f: number; id: string; glow: number }> = ({ at, text, f, id, glow }) => {
  const shown = Math.floor(text * 8); // 8 visible characters, written one by one
  let left = shown;
  return (
    <g>
      <Glow id={`${id}-ng`} x={at[0]} y={at[1]} r={180} color={COL.note} o={glow} />
      <g transform={`translate(${at[0]},${at[1]}) rotate(-4)`}>
        <Shape pts={rrPts(-65, -55, 130, 110, 4)} seed={`${id}nt`} f={f} fill={COL.note} stroke="#B89A2A" sw={2} />
        {NOTE_TEXT.map((ln, i) => {
          const n = Math.max(0, Math.min(ln.replace(/ /g, "").length, left));
          left -= ln.replace(/ /g, "").length;
          let c = 0;
          const vis = ln.split("").map((ch) => (ch === " " ? " " : c++ < n ? ch : "")).join("");
          return <text key={i} x={-48} y={-12 + i * 40} fontFamily={JUA} fontSize={34} fill={COL.face}>{vis}</text>;
        })}
      </g>
    </g>
  );
};
const Flat: React.FC<{ st: FlatState; f: number; id: string }> = ({ st, f, id }) => {
  const [px, py] = st.phone.pos;
  const doorW = 180 * (1 - st.doorOpen * 0.85);
  const phoneFront = !!st.hero && px < 500; // held in the hands, not lying on the armrest
  const sitting = !!st.hero && st.hero.hip[1] <= 645;
  const phone = (
    <g transform={`translate(${px},${py})`}>
      <Shape pts={rrPts(-20, -36, 40, 72, 8)} seed={`${id}ph`} f={f} fill={st.phone.on > 0.2 ? COL.phone : "#20202A"} />
      {st.phone.banner > 0 && (
        <g opacity={st.phone.banner} transform={`translate(${st.phone.bannerX},0)`}>
          <rect x={-17} y={-30} width={34} height={14} rx={3} fill={COL.white} />
          <text x={0} y={-20} textAnchor="middle" fontFamily={JUA} fontSize={7.2} fill={COL.face}>이번 주 운동!</text>
        </g>
      )}
    </g>
  );
  return (
    <g>
      <rect x={-400} y={-400} width={W + 800} height={1760} fill={COL.bg} />
      {/* light sources first */}
      <Glow id={`${id}-hall`} x={880} y={790} r={lerp(170, 700, st.doorOpen)} color={COL.hall} o={st.hall} />
      <Glow id={`${id}-pg`} x={px} y={py} r={330} color={COL.phone} o={st.phone.on} />
      <Glow id={`${id}-lg`} x={645} y={600} r={720} color={COL.lamp} o={st.lamp} />
      {/* wall calendar: one week, no marks */}
      {st.cal && <g>
      <Shape pts={rrPts(560, 250, 200, 150, 6)} seed={`${id}cal`} f={f} fill={COL.prop2} />
      <Shape pts={rrPts(560, 250, 200, 36, 6)} seed={`${id}calh`} f={f} fill="#33334A" />
      {DAYS.map((d, i) => {
        const x = 572 + i * 26.5;
        const on = i === st.day ? st.dayO : 0;
        return (
          <g key={d}>
            <rect x={x} y={300} width={22} height={60} rx={4} fill={on > 0 ? `rgba(255,255,255,${0.12 * on})` : "none"} stroke={COL.line} strokeWidth={1.2} />
            <text x={x + 11} y={322} textAnchor="middle" fontFamily={JUA} fontSize={15} fill={COL.line}>{d}</text>
          </g>
        );
      })}
      {st.circleTue > 0 && (
        <circle cx={572 + 26.5 + 11} cy={340} r={17} fill="none" stroke={COL.hero} strokeWidth={3.5} strokeDasharray={110} strokeDashoffset={110 * (1 - st.circleTue)} strokeLinecap="round" />
      )}
      </g>}
      {/* door, with the hallway light through the crack and when it opens */}
      <rect x={790} y={400} width={180} height={400} fill={st.doorOpen > 0 ? COL.hall : "none"} opacity={st.doorOpen > 0 ? 0.9 * st.hall : 0} />
      <Shape pts={rrPts(970 - doorW, 400, doorW, 400, 6)} seed={`${id}door`} f={f} fill="#1A1A24" />
      {st.doorOpen < 0.6 && <circle cx={970 - doorW + 22} cy={615} r={7} fill={COL.prop2} stroke={COL.line} strokeWidth={2} />}
      <line x1={792} x2={968} y1={798} y2={798} stroke={COL.hall} strokeWidth={3} opacity={0.6 * st.hall} />
      {/* floor */}
      <Shape pts={[[-420, FLOOR], [W + 420, FLOOR]]} closed={false} seed={`${id}fl`} f={f} stroke={COL.floor} sw={2.5} />
      {/* couch */}
      <Shape pts={rrPts(130, 520, 420, 130, 30)} seed={`${id}cb`} f={f} fill={COL.prop2} />
      <Shape pts={rrPts(120, 628, 440, 72, 16)} seed={`${id}cs`} f={f} />
      <Shape pts={rrPts(96, 570, 58, 150, 22)} seed={`${id}ca1`} f={f} fill={COL.prop2} />
      <Shape pts={rrPts(526, 570, 58, 150, 22)} seed={`${id}ca2`} f={f} fill={COL.prop2} />
      <Shape pts={rrPts(140, 720, 16, 80, 4)} seed={`${id}cl1`} f={f} />
      <Shape pts={rrPts(524, 720, 16, 80, 4)} seed={`${id}cl2`} f={f} />
      {/* side table and lamp */}
      <Shape pts={rrPts(605, 680, 90, 120, 6)} seed={`${id}tb`} f={f} />
      <Shape pts={[[650, 680], [650, 622]]} closed={false} seed={`${id}ls`} f={f} />
      <Shape pts={[[618, 626], [682, 626], [698, 578], [602, 578]]} seed={`${id}lp`} f={f} fill={st.lamp > 0.5 ? "#6B5530" : COL.prop2} />
      {/* running shoes by the door */}
      {st.shoesOnFloor && (
        <g>
          <ShoeAt p={[850, 796]} f={f} seed={`${id}s1`} />
          <ShoeAt p={[912, 796]} f={f} seed={`${id}s2`} />
          {st.tag && (
            <g>
              <line x1={890} y1={786} x2={900} y2={760} stroke={COL.line} strokeWidth={1.5} />
              <Shape pts={rrPts(893, 732, 26, 30, 3)} seed={`${id}tag`} f={f} fill="#E8E8EE" stroke={COL.line} sw={1.5} />
            </g>
          )}
          {st.dust > 0 && (
            <g opacity={st.dust} stroke={COL.line} strokeWidth={2} strokeLinecap="round">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line key={i} x1={834 + i * 22} x2={842 + i * 22} y1={770 - (i % 2) * 6} y2={770 - (i % 2) * 6} opacity={clamp01(st.dust * 6 - i)} />
              ))}
            </g>
          )}
        </g>
      )}
      {/* the note on the door */}
      {st.note && st.note.onDoor && <Note at={st.note.at} text={1} f={f} id={id} glow={st.note.glow} />}
      {/* 게으른 나 */}
      <Shadow x={st.shadow.x} floor={FLOOR} s={st.shadow.s} f={f} id={`${id}-shd`} squint={st.shadow.squint} />
      {!phoneFront && phone}
      {st.hero && <Hero p={st.hero} f={f} shoes={st.heroShoes} id={id} />}
      {sitting && <Shape pts={rrPts(116, 642, 448, 58, 16)} seed={`${id}cf`} f={f} />}
      {phoneFront && phone}
      {false && (
      <g>
        <Shape pts={rrPts(-20, -36, 40, 72, 8)} seed={`${id}ph`} f={f} fill={st.phone.on > 0.2 ? COL.phone : "#20202A"} />
        {st.phone.banner > 0 && (
          <g opacity={st.phone.banner} transform={`translate(${st.phone.bannerX},0)`}>
            <rect x={-17} y={-30} width={34} height={14} rx={3} fill={COL.white} />
            <text x={0} y={-20} textAnchor="middle" fontFamily={JUA} fontSize={7.2} fill={COL.face}>이번 주 운동!</text>
          </g>
        )}
      </g>
      )}
      {st.note && !st.note.onDoor && st.note.o > 0 && (
        <g opacity={st.note.o}><Note at={st.note.at} text={st.note.text} f={f} id={`${id}h`} glow={st.note.glow} /></g>
      )}
    </g>
  );
};

// ---------- poses in the flat ----------
const SIT_HIP: Pt = [330, 640];
const SIT_FEET: [Pt, Pt] = [[300, 796], [362, 796]];
const LAP: [Pt, Pt] = [[285, 600], [378, 602]];
const HOLD = (f: number): [Pt, Pt] => [[348, 618 + Math.sin(f * 0.2) * 2], [386, 620]];
const PHONE_HELD: Pt = [366, 590];
const PHONE_ARM: Pt = [552, 560];
const STAND_Y = 664;
const walkFeet = (hipX: number, moving: number): [Pt, Pt] => {
  const ph = hipX / 34;
  return [0, 1].map((i) => {
    const s = Math.sin(ph + i * Math.PI);
    return [hipX + s * 26 * moving - 12 + i * 24, FLOOR - 4 - Math.max(0, Math.cos(ph + i * Math.PI)) * 14 * moving] as Pt;
  }) as [Pt, Pt];
};

const emptyFlat = (): FlatState => ({
  hero: null, heroShoes: false,
  phone: { pos: PHONE_ARM, on: 0, banner: 0, bannerX: 0 },
  lamp: 0, hall: 1, doorOpen: 0, dust: 0, shoesOnFloor: true, tag: true,
  day: -1, dayO: 0, circleTue: 0, cal: true, note: null, shadow: { x: 330, s: 0 },
});

/** The intro: shoes, the reminder swiped away, the tired face. */
const introFlat = (f: number): FlatState => {
  const swipe = tween(f, 29, 37, 0, 1);
  return {
    ...emptyFlat(),
    hero: { hip: SIT_HIP, rot: 0, feet: SIT_FEET, hands: f < 29 || f >= 40 ? HOLD(f) : [[lerp(348, 338, swipe), 618], [lerp(386, 412, swipe), lerp(620, 586, swipe)]], face: f < 40 ? { ...neutral, gazeY: 0.7 } : mixFace({ ...neutral, brow: 0.12, browY: 0.1 }, tired, tween(f, 44, 60, 0, 1)) },
    phone: { pos: PHONE_HELD, on: f >= 21 ? 1 : 0.15, banner: f >= 21 ? tween(f, 21, 24, 0, 1) * (1 - swipe) : 0, bannerX: swipe * -30 },
  };
};

/** Bottom panel, 62–540: the resolution, the excuses, the week passing. */
const heroFlatA = (f: number): FlatState => {
  const down = tween(f, 122, 138, 0, 1); // phone down to the armrest
  const fist = tween(f, 128, 146, 0, 1) * (1 - tween(f, 262, 300, 0, 1));
  const pump = f > 184 && f < 200 ? Math.sin(((f - 184) / 16) * Math.PI) * 26 : 0;
  const pickUp = tween(f, 330, 350, 0, 1);
  let face = mixFace({ ...neutral, gazeY: 0.7 }, fired, tween(f, 120, 140, 0, 1));
  face = mixFace(face, unsure, tween(f, 262, 285, 0, 1));
  face = mixFace(face, { ...tired, gazeY: 0.7 }, tween(f, 330, 352, 0, 1));
  if (f > 400) face = mixFace(face, { ...tired, gazeX: 1, gazeY: 0.3, lid: 0.45 }, tween(f, 470, 500, 0, 1));
  const held = HOLD(f);
  const handsA: [Pt, Pt] = [mixPt(held[0], LAP[0], down), mixPt(held[1], [420, 450 + pump], fist > 0 ? 1 : 0)];
  const right = fist > 0 ? mixPt(LAP[1], [420, 450 + pump], fist) : LAP[1];
  const hands: [Pt, Pt] = f < 330
    ? [handsA[0], down < 1 ? mixPt(held[1], right, down) : right]
    : [mixPt(LAP[0], held[0], pickUp), mixPt(LAP[1], held[1], pickUp)];
  const phoneT = f < 330 ? down : 1 - pickUp;
  const week = f >= 410 ? Math.min(6, Math.floor((f - 410) / 14)) : -1;
  return {
    ...emptyFlat(),
    hero: { hip: SIT_HIP, rot: 0, feet: SIT_FEET, hands, face },
    phone: { pos: mixPt(PHONE_HELD, PHONE_ARM, phoneT), on: 1 - phoneT * 0.85, banner: 0, bannerX: 0 },
    day: week, dayO: week >= 0 ? 1 : 0,
    dust: tween(f, 430, 520, 0, 1),
  };
};

/** Top panel, 62–540 and 1128–1335: 게으른 나 in the same flat, the phone glowing on the couch. */
const lazyFlat = (f: number, s: number, squint = 0): FlatState => ({
  ...emptyFlat(),
  phone: { pos: [450, 615], on: 0.8, banner: 0, bannerX: 0 },
  hall: 0.35, cal: false,
  shadow: { x: 330, s, squint },
});
const shadowSizeA = (f: number) =>
  interpolate(f, [118, 134, 290, 345, 400, 520], [0, 0.95, 1.05, 1.2, 1.32, 1.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const shadowSizeB = (f: number) =>
  interpolate(f, [1128, 1200, 1225, 1250, 1300, 1320], [1.6, 1.6, 1.3, 1.0, 0.45, 0.38], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** Bottom panel, 1128–1335: the lamp, the note, the door. */
const heroFlatB = (f: number): FlatState => {
  const slide = tween(f, 1130, 1150, 0, 1); // slide along the couch to the lamp
  const lampOn = f >= 1158 ? interpolate(f, [1158, 1161, 1164, 1169], [0, 1, 0.7, 1], { extrapolateRight: "clamp" }) : 0;
  const hip = mixPt(SIT_HIP, [468, 640], slide);
  const stand = tween(f, 1252, 1266, 0, 1);
  const walk = tween(f, 1262, 1296, 0, 1);
  const standHip: Pt = [lerp(468, 760, walk), lerp(640, STAND_Y, stand) + Math.abs(Math.sin(walk * Math.PI * 4)) * -6 * (walk > 0 && walk < 1 ? 1 : 0)];
  const H: Pt = stand > 0 ? standHip : hip;
  const sitFeet: [Pt, Pt] = [[hip[0] - 30, 796], [hip[0] + 32, 796]];
  const feet = stand > 0 ? (walk > 0 && walk < 1 ? walkFeet(H[0], 1) : ([[H[0] - 14, FLOOR - 4], [H[0] + 16, FLOOR - 4]] as [Pt, Pt])) : sitFeet;
  const reachLamp = tween(f, 1150, 1158, 0, 1) * (1 - tween(f, 1162, 1172, 0, 1));
  const writing = f >= 1176 && f < 1252;
  const notePos: Pt = [560, 520];
  const scribble = writing ? Math.sin(f * 1.3) * 6 : 0;
  const stick = tween(f, 1290, 1300, 0, 1);
  let hands: [Pt, Pt] = [[hip[0] - 45, 602], [hip[0] + 48, 602]];
  if (reachLamp > 0) hands = [hands[0], mixPt(hands[1], [640, 640], reachLamp)];
  if (f >= 1172 && f < 1252) hands = [[notePos[0] - 50, notePos[1] + 40], [notePos[0] - 10 + scribble, notePos[1] + 8 + Math.cos(f * 1.1) * 4]];
  if (stand > 0) hands = [mixPt([H[0] - 40, H[1] - 20], [H[0] - 40, H[1] - 20], 1), mixPt([H[0] + 30, H[1] - 90], [868, 560], stick)];
  let face = mixFace(neutral, focus, tween(f, 1150, 1170, 0, 1));
  face = mixFace(face, { ...fired, gazeX: 1 }, tween(f, 1250, 1265, 0, 1));
  face = mixFace(face, proud, tween(f, 1300, 1318, 0, 1));
  const noteO = tween(f, 1172, 1180, 0, 1);
  const handNote: Pt = stand > 0 ? [H[0] + 30 + (868 - H[0] - 30) * stick, lerp(H[1] - 110, 560, stick)] : notePos;
  return {
    ...emptyFlat(),
    hero: { hip: H, rot: 0, feet, hands, face },
    phone: { pos: PHONE_ARM, on: 0, banner: 0, bannerX: 0 },
    lamp: lampOn,
    circleTue: tween(f, 1300, 1318, 0, 1),
    note: f >= 1300 ? { at: [868, 560], o: 1, text: 1, onDoor: true, glow: 0.5 } : { at: handNote, o: noteO, text: tween(f, 1198, 1246, 0, 1), onDoor: false, glow: 0.25 * noteO },
  };
};

/** Full screen, 1335–1380: Tuesday 7 pm, shoes on, the door opens. */
const doorFlat = (f: number): FlatState => {
  const open = tween(f, 1350, 1372, 0, 1);
  const go = tween(f, 1364, 1380, 0, 1);
  const H: Pt = [lerp(740, 830, go), STAND_Y];
  return {
    ...emptyFlat(),
    hero: { hip: H, rot: 0, feet: go > 0 ? walkFeet(H[0], 1) : [[H[0] - 14, FLOOR - 4], [H[0] + 16, FLOOR - 4]], hands: [[H[0] - 45, H[1] - 15], [H[0] + 50, H[1] - 25]], face: mixFace(proud, { ...fired, gazeX: 1 }, tween(f, 1340, 1350, 0, 1)) },
    heroShoes: true, shoesOnFloor: false,
    lamp: 1, hall: 1, doorOpen: open, day: 1, dayO: 1, circleTue: 1,
    note: { at: [868, 560], o: 1, text: 1, onDoor: open < 0.4, glow: 1 },
  };
};

// ---------- the study (two groups, simple figures, no numbers) ----------
const Heart: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <path d="M0,6 C-16,-8 -8,-22 0,-12 C8,-22 16,-8 0,6 Z" transform={`translate(${x},${y}) scale(${s})`} fill="#FFE3B0" stroke={COL.face} strokeWidth={1.5 / s} opacity={o} />
);
const SEATS = [190, 350, 510, 670, 830];
const Group: React.FC<{ f: number; id: string; plan: boolean; dim: number; heart: number; bubble: number; note: number; scrib: number; leave: number[]; shadowS: number; say: number }> = ({
  f, id, plan, dim, heart, bubble, note, scrib, leave, shadowS, say,
}) => (
  <g>
    <rect x={0} y={0} width={W} height={960} fill={COL.bg} />
    <Glow id={`${id}-lamp`} x={540} y={250} r={760} color={COL.lamp} o={0.85} />
    <line x1={540} x2={540} y1={0} y2={205} stroke={COL.line} strokeWidth={2} />
    <Shape pts={[[505, 240], [575, 240], [560, 205], [520, 205]]} seed={`${id}lamp`} f={f} fill="#6B5530" />
    {/* bench */}
    <Shape pts={rrPts(100, 700, 830, 26, 8)} seed={`${id}bench`} f={f} />
    <Shape pts={rrPts(120, 726, 14, 74, 3)} seed={`${id}bl1`} f={f} />
    <Shape pts={rrPts(900, 726, 14, 74, 3)} seed={`${id}bl2`} f={f} />
    <Shape pts={[[-20, FLOOR], [W + 20, FLOOR]]} closed={false} seed={`${id}fl`} f={f} stroke={COL.floor} sw={2.5} />
    {/* the talk everyone heard */}
    {bubble > 0 && (
      <g opacity={bubble} transform={`translate(540,380) scale(${0.8 + 0.2 * bubble})`}>
        <Shape pts={rrPts(-110, -62, 220, 110, 40)} seed={`${id}bub`} f={f} fill={COL.prop2} />
        <path d="M-12,46 L-34,80 L14,46 Z" fill={COL.prop2} stroke={COL.line} strokeWidth={2} />
        <Heart x={-38} y={-6} s={2.2} />
        <text x={30} y={10} fontFamily={JUA} fontSize={46} fill={COL.hero}>운동</text>
      </g>
    )}
    {SEATS.map((x, i) => {
      const lv = leave[i];
      const sx = x + lv * 900;
      const standing = lv > 0;
      const k = 0.64;
      const hip: Pt = standing ? [0, -140] : [0, -156];
      const walkPh = lv * 40;
      const feet: [Pt, Pt] = standing
        ? [[Math.sin(walkPh) * 30 - 10, -8 - Math.max(0, Math.cos(walkPh)) * 18], [Math.sin(walkPh + Math.PI) * 30 + 12, -8 - Math.max(0, Math.cos(walkPh + Math.PI)) * 18]]
        : [[-20, -8], [24, -8]];
      const hands: [Pt, Pt] = plan && note > 0
        ? [[-38, hip[1] - 22], [30, hip[1] - 60]]
        : [[-40, hip[1] - 18], [40, hip[1] - 18]];
      const face: Face = standing ? { ...proud, gazeX: 1 } : plan && note > 0 ? { ...focus, gazeX: 0.5 } : { ...neutral, brow: 0.05 * heart, mouth: 0.3 * heart };
      const sh = shadowS * (plan ? 1 - note : 1);
      return (
        <g key={i}>
          <Shadow x={sx + 34} floor={FLOOR} s={sh} f={f + i * 13} id={`${id}-s${i}`} squint={say} />
          <g transform={`translate(${sx},${FLOOR}) scale(${k})`}>
            <Hero p={{ hip, rot: 0, feet, hands, face }} f={f + i * 7} />
            <Glow id={`${id}-hg${i}`} x={0} y={hip[1] - 62} r={70 + 60 * heart} color="#FFE3B0" o={0.35 + 0.65 * heart} />
            <Heart x={0} y={hip[1] - 62} s={1.6 + heart * 1.6} o={0.95} />
            {plan && note > 0 && (
              <g opacity={note} transform={`translate(${34},${hip[1] - 96}) rotate(-6)`}>
                <Glow id={`${id}-n${i}`} x={0} y={0} r={110} color={COL.note} o={0.6 * scrib} />
                <rect x={-26} y={-26} width={52} height={52} rx={3} fill={COL.note} stroke="#B89A2A" strokeWidth={2} />
                {[0, 1, 2].map((r) => (
                  <line key={r} x1={-18} x2={-18 + 36 * clamp01(scrib * 3 - r)} y1={-12 + r * 13} y2={-12 + r * 13} stroke={COL.face} strokeWidth={3} strokeLinecap="round" />
                ))}
              </g>
            )}
          </g>
        </g>
      );
    })}
    <rect x={0} y={0} width={W} height={960} fill="#000" opacity={dim} />
  </g>
);

// ---------- the park (full screen, 1080×1920) ----------
const PARK_FLOOR = 1330;
const Park: React.FC<{ f: number }> = ({ f }) => {
  const t = f - 1380;
  const walk = tween(f, 1380, 1462, 0, 1);
  const hx = lerp(120, 560, walk);
  const moving = walk > 0 && walk < 1 ? 1 : 0;
  const k = 1.35;
  const hip: Pt = [hx, PARK_FLOOR - 136 * k + (moving ? -Math.abs(Math.sin(hx / 34)) * 6 : 0)];
  // draw the hero at scale k around his hip
  const feet = walkFeet(hx, moving).map(([x, y]) => [x, PARK_FLOOR - (FLOOR - y) * k]) as [Pt, Pt];
  const face = moving ? { ...fired, gazeX: 1 } : mixFace({ ...fired, gazeX: 1 }, proud, tween(f, 1462, 1478, 0, 1));
  const swing = Math.sin(hx / 34) * 24 * moving;
  const zoom = tween(f, 1380, 1530, 1, 1.08);
  return (
    <g transform={`translate(540,1100) scale(${zoom}) translate(-540,-1100)`}>
      <rect x={-200} y={-200} width={W + 400} height={2400} fill={COL.bg} />
      <Glow id="pk-light" x={700} y={760} r={1000} color={COL.street} o={1} />
      {/* trees */}
      <Shape pts={circlePts(130, 900, 170, 16)} seed="tr1" f={f} fill={COL.tree} />
      <Shape pts={rrPts(115, 1050, 30, 280, 6)} seed="tr1t" f={f} fill={COL.tree} />
      <Shape pts={circlePts(980, 960, 150, 16)} seed="tr2" f={f} fill={COL.tree} />
      <Shape pts={rrPts(966, 1090, 28, 240, 6)} seed="tr2t" f={f} fill={COL.tree} />
      {/* streetlight */}
      <Shape pts={rrPts(692, 760, 16, PARK_FLOOR - 760, 4)} seed="pole" f={f} fill={COL.prop2} />
      <Shape pts={[[650, 760], [750, 760], [732, 726], [668, 726]]} seed="lamphead" f={f} fill="#8A7040" />
      <ellipse cx={700} cy={765} rx={40} ry={8} fill={COL.street} opacity={0.9} />
      {/* bench under the light */}
      <Shape pts={rrPts(760, 1240, 150, 18, 5)} seed="pbench" f={f} />
      <Shape pts={rrPts(772, 1258, 10, 72, 3)} seed="pbl1" f={f} />
      <Shape pts={rrPts(888, 1258, 10, 72, 3)} seed="pbl2" f={f} />
      {/* path */}
      <rect x={-200} y={PARK_FLOOR} width={W + 400} height={60} fill="#17171F" />
      <Shape pts={[[-200, PARK_FLOOR], [W + 200, PARK_FLOOR]]} closed={false} seed="pfl" f={f} stroke={COL.floor} sw={2.5} />
      <Shape pts={[[-200, PARK_FLOOR + 60], [W + 200, PARK_FLOOR + 60]]} closed={false} seed="pfl2" f={f} stroke={COL.floor} sw={1.6} opacity={0.6} />
      {/* the shadow, now pebble-sized, trailing behind */}
      <Shadow x={hx - 150} floor={PARK_FLOOR} s={0.16} f={f} id="pk-sh" />
      <g transform={`translate(${hip[0]},${hip[1]}) scale(${k}) translate(${-hip[0]},${-hip[1]})`}>
        <Hero
          p={{
            hip,
            rot: 0,
            feet: feet.map(([x, y]) => [hip[0] + (x - hip[0]) / k, hip[1] + (y - hip[1]) / k]) as [Pt, Pt],
            hands: moving ? [[hip[0] - 40 + swing, hip[1] - 20], [hip[0] + 40 - swing, hip[1] - 22]] : [[hip[0] - 50, hip[1] - 12], [hip[0] + 60, hip[1] - 150 - Math.sin(t * 0.3) * 0]],
            face,
          }}
          f={f}
          shoes
          id="pk"
        />
      </g>
    </g>
  );
};

// ---------- camera ----------
const Cam: React.FC<{ fx: number; fy: number; s: number; children: React.ReactNode }> = ({ fx, fy, s, children }) => (
  <g transform={`translate(540,960) scale(${s}) translate(${-fx},${-fy})`}>{children}</g>
);
const Push: React.FC<{ fx: number; fy: number; s: number; tx?: number; ty?: number; children: React.ReactNode }> = ({ fx, fy, s, tx = fx, ty = fy, children }) => (
  <g transform={`translate(${tx},${ty}) scale(${s}) translate(${-fx},${-fy})`}>{children}</g>
);

// ---------- captions (white, two words at a time, broken at punctuation) ----------
const PAGES = (() => {
  const pages: (typeof WORDS)[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    if (/[.,?!]$/.test(w.text) || cur.length === 2 || !next || next.line !== w.line) { pages.push(cur); cur = []; }
  });
  return pages;
})();
const Captions: React.FC<{ f: number; y: number }> = ({ f, y }) => {
  const ms = (f / 30) * 1000;
  const page = PAGES.find((p, i) => {
    const next = PAGES[i + 1];
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

// the lazy voice: short violet lines beside the shadow's head (top panel, offset TOP_Y)
const TOP_Y = 20;
const BOT_Y = 812;
const LAZY_LINES: { text: string; from: number; to: number }[] = [
  { text: "그래, 나중에.", from: 150, to: 240 },
  { text: "내일 하자…", from: 288, to: 338 },
  { text: "주말에 몰아서.", from: 344, to: 398 },
  { text: "다음 주부터.", from: 440, to: 536 },
];

// ---------- the film ----------
export const WhenWhere: React.FC = () => {
  const f = useCurrentFrame();
  const panels = (top: React.ReactNode, bottom: React.ReactNode) => (
    <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
      <rect width={W} height={1920} fill={COL.bg} />
      <defs>
        <clipPath id="topclip"><rect x={0} y={0} width={W} height={958} /></clipPath>
        <clipPath id="botclip"><rect x={0} y={962} width={W} height={958} /></clipPath>
      </defs>
      <g clipPath="url(#topclip)">{top}</g>
      <g clipPath="url(#botclip)">{bottom}</g>
      <line x1={0} x2={W} y1={960} y2={960} stroke={COL.floor} strokeWidth={3} />
    </svg>
  );

  let scene: React.ReactNode = null;
  let labels: [string, string, string, string] | null = null; // top text, top colour, bottom text, bottom colour
  let lazy: { text: string; x: number; y: number; o: number; size: number }[] = [];
  let captionY = 1590; // below the bottom panel's floor, so the seam and the props stay clear

  if (f < 62) {
    // Fast intro: three cuts under 1 s each, the camera pushing in on each subject.
    const st = introFlat(f);
    const cam =
      f < 21 ? { fx: 882, fy: 768, s: tween(f, 0, 21, 3.4, 4.2) } // the shoes, tag still on
        : f < 40 ? { fx: 366, fy: 575, s: tween(f, 21, 40, 5.2, 6.2) } // the reminder, swiped away
          : { fx: 330, fy: 548, s: tween(f, 40, 62, 3.3, 4.1) }; // the tired face
    scene = (
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <rect width={W} height={1920} fill={COL.bg} />
        <Cam {...cam}><Flat st={{ ...st, dust: 0 }} f={f} id="intro" /></Cam>
      </svg>
    );
    captionY = 1480;
  } else if (f < 540) {
    const s = shadowSizeA(f);
    const push = tween(f, 470, 540, 1, 1.45);
    scene = panels(
      <g transform={`translate(0,${TOP_Y})`}><Flat st={lazyFlat(f, s)} f={f} id="lazyA" /></g>,
      <g transform={`translate(0,${BOT_Y - 150})`}><Push fx={900} fy={790} s={push} tx={lerp(900, 640, (push - 1) / 0.45)} ty={lerp(790, 700, (push - 1) / 0.45)}><Flat st={heroFlatA(f)} f={f} id="stepA" /></Push></g>,
    );
    labels = ["게으른 나", COL.violet, "한걸음 나", COL.hero];
    lazy = LAZY_LINES.filter((l) => f >= l.from && f < l.to).map((l) => ({
      text: l.text, x: 330 + 110 * s + 10, y: TOP_Y + FLOOR - SHADOW_HEAD * s - 30, size: 54,
      o: tween(f, l.from, l.from + 8, 0, 1) * tween(f, l.to - 8, l.to, 1, 0),
    }));
  } else if (f < 1128) {
    // The study. L5: everyone hears why exercise is good; only motivation. L6: the second group writes when and where.
    const bubble = tween(f, 568, 584, 0, 1) * tween(f, 680, 696, 1, 0);
    const heart = tween(f, 645, 690, 0, 1);
    const topDim = f < 783 ? 0 : f < 995 ? tween(f, 783, 795, 0, 0.55) : tween(f, 995, 1005, 0.55, 0);
    const botDim = f < 783 ? 0.55 : 0;
    const note = tween(f, 821, 836, 0, 1);
    const scrib = tween(f, 905, 955, 0, 1);
    const leave = SEATS.map((_, i) => tween(f, 1042 + (4 - i) * 9, 1110 + (4 - i) * 9, 0, 1));
    const grow = tween(f, 726, 745, 0.3, 0.36);
    const say = tween(f, 1072, 1080, 0, 1);
    scene = panels(
      <g transform={`translate(0,${TOP_Y - 20})`}>
        <Group f={f} id="ga" plan={false} dim={topDim} heart={heart} bubble={bubble} note={0} scrib={0} leave={[0, 0, 0, 0, 0]} shadowS={grow} say={say} />
      </g>,
      <g transform={`translate(0,${BOT_Y - 150})`}>
        <Group f={f} id="gb" plan dim={botDim} heart={heart} bubble={0} note={note} scrib={scrib} leave={leave} shadowS={0.3} say={0} />
      </g>,
    );
    labels = ["설명만 들은 사람들", "#C9C9D2", "언제·어디서도 적은 사람들", COL.hero];
    if (f >= 1072) lazy = [{ text: "나중에…?", x: 700, y: 180, o: say * tween(f, 1118, 1127, 1, 0), size: 54 }];
  } else if (f < 1335) {
    const s = shadowSizeB(f);
    const zoomNote = tween(f, 1170, 1186, 1, 1.55) * 1;
    const back = tween(f, 1246, 1262, 0, 1);
    const k = lerp(zoomNote, 1, back);
    scene = panels(
      <g transform={`translate(0,${TOP_Y})`}><Flat st={lazyFlat(f, s, tween(f, 1200, 1215, 0, 1))} f={f} id="lazyB" /></g>,
      <g transform={`translate(0,${BOT_Y - 150})`}><Push fx={560} fy={540} s={k}><Flat st={heroFlatB(f)} f={f} id="stepB" /></Push></g>,
    );
    labels = ["게으른 나", COL.violet, "한걸음 나", COL.hero];
    // his favourite word, crumbling one letter at a time as the note is written
    const word = ["나", "중", "에", "…"];
    const drops = [1214, 1234, 1254, 1262];
    lazy = word.map((ch, i) => {
      const d = tween(f, drops[i], drops[i] + 14, 0, 1);
      return { text: ch, x: 330 + 110 * s + 10 + i * 62, y: TOP_Y + FLOOR - SHADOW_HEAD * s - 50 + d * 260, size: 76, o: tween(f, 1142, 1150, 0, 1) * (1 - d) };
    });
  } else if (f < 1380) {
    const st = doorFlat(f);
    scene = (
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <rect width={W} height={1920} fill={COL.bg} />
        <Cam fx={tween(f, 1335, 1380, 800, 860)} fy={600} s={tween(f, 1335, 1380, 1.85, 2.15)}><Flat st={st} f={f} id="door" /></Cam>
      </svg>
    );
    captionY = 1560;
  } else {
    scene = (
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <Park f={f} />
      </svg>
    );
    captionY = 1560;
  }

  const title = tween(f, 1404, 1414, 0, 1);
  const underline = tween(f, 1422, 1442, 0, 1);
  // a short white flash on the cuts into the study and into Tuesday
  const flash = Math.max(f >= 540 && f < 546 ? 1 - (f - 540) / 6 : 0, f >= 1335 && f < 1341 ? 1 - (f - 1335) / 6 : 0) * 0.25;

  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      {scene}
      {labels && (
        <>
          <div style={{ position: "absolute", left: 70, top: 230, fontFamily: JUA, fontSize: 60, color: labels[1], opacity: tween(f, 62, 70, 0, 1) }}>{labels[0]}</div>
          <div style={{ position: "absolute", left: 70, top: 1050, fontFamily: JUA, fontSize: 60, color: labels[3], opacity: tween(f, 62, 70, 0, 1) }}>{labels[2]}</div>
        </>
      )}
      {lazy.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: l.x, top: l.y, fontFamily: JUA, fontSize: l.size, color: COL.violet, opacity: l.o, whiteSpace: "nowrap", transform: "translateY(-50%)" }}>
          {l.text}
        </div>
      ))}
      {f < 1404 && <Captions f={f} y={captionY} />}
      {title > 0 && (
        <div style={{ position: "absolute", left: 60, width: W - 220, top: 430, textAlign: "center", opacity: title, transform: `scale(${0.9 + 0.1 * title})` }}>
          <div style={{ fontFamily: JUA, fontSize: 132, color: COL.white, display: "inline-block", position: "relative", whiteSpace: "nowrap" }}>
            언제, 어디서, 정해.
            <div style={{ position: "absolute", left: 0, bottom: -6, height: 14, borderRadius: 7, background: COL.violet, width: `${underline * 100}%` }} />
          </div>
        </div>
      )}
      {flash > 0 && <AbsoluteFill style={{ background: COL.white, opacity: flash }} />}

      {/* voice */}
      {LINE_STARTS.map((at, i) => (
        <Sequence key={i} from={at} layout="none">
          <Audio src={staticFile(`voice/when-where/line${i + 1}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {/* sound: room tone, the clock, the phone, page flips, the pencil, the note, the door, the park */}
      <Sequence durationInFrames={1380} layout="none"><Audio src={staticFile("sfx/roomtone.wav")} volume={0.18} loop /></Sequence>
      <Sfx name="whoosh" at={0} len={12} vol={0.15} />
      <Sfx name="hum" at={21} len={10} vol={0.35} rate={2.6} />
      <Sfx name="whoosh" at={29} len={10} vol={0.12} rate={1.6} />
      <Sfx name="whoosh" at={40} len={12} vol={0.15} />
      <Sfx name="tick" at={62} len={110} vol={0.18} />
      <Sfx name="rumble" at={118} len={40} vol={0.18} />
      <Sfx name="tick" at={244} len={150} vol={0.16} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <Sfx key={i} name="whoosh" at={410 + i * 14} len={10} vol={0.08} rate={2.2} />)}
      <Sfx name="whoosh" at={538} len={18} vol={0.2} />
      <Sfx name="pop" at={570} len={10} vol={0.25} />
      <Sfx name="shimmer" at={648} len={40} vol={0.12} />
      <Sfx name="whoosh" at={783} len={14} vol={0.12} />
      <Sfx name="pop" at={821} len={10} vol={0.25} />
      <Sfx name="scribble" at={905} len={50} vol={0.35} />
      {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} name="step" at={1046 + (4 - i) * 9} len={8} vol={0.35} />)}
      <Sfx name="whoosh" at={1126} len={16} vol={0.18} />
      <Sfx name="click" at={1158} len={6} vol={0.5} />
      <Sfx name="hum" at={1161} len={160} vol={0.06} />
      <Sfx name="scribble" at={1198} len={48} vol={0.4} />
      {[1214, 1234, 1254].map((at) => <Sfx key={at} name="puff" at={at} len={14} vol={0.25} />)}
      <Sfx name="step" at={1268} len={8} vol={0.45} />
      <Sfx name="step" at={1282} len={8} vol={0.45} />
      <Sfx name="pop" at={1298} len={10} vol={0.35} />
      <Sfx name="shimmer" at={1300} len={30} vol={0.15} />
      <Sfx name="creak" at={1350} len={24} vol={0.3} />
      <Sfx name="whoosh" at={1378} len={16} vol={0.18} />
      <Sequence from={1380} layout="none"><Audio src={staticFile("sfx/cricket.wav")} volume={0.2} loop /></Sequence>
      {[0, 1, 2, 3, 4, 5].map((i) => <Sfx key={i} name="step" at={1386 + i * 13} len={8} vol={0.35} />)}
      <Sfx name="shimmer" at={1422} len={30} vol={0.18} />
    </AbsoluteFill>
  );
};
