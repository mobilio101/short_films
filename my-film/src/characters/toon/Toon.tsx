// Modern comic character for the new channel: bold black outlines, bright flat colours,
// three head shapes (round, square, inverted triangle), a triangle shirt with a line pattern,
// thin arms spread away from the body, chunky eyebrows and hats. Original design.
// Origin = between the feet. About 680 px tall at scale 1.
import React from "react";
import { useCurrentFrame } from "remotion";

export const INK = "#141414";
const OW = 8;
const ol = { stroke: INK, strokeWidth: OW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Bright, clean palette. */
export const POP = {
  yellow: "#FFC928",
  blue: "#2D7FF9",
  sky: "#7CC8FF",
  pink: "#FF4F7B",
  red: "#F2363B",
  green: "#2BC46B",
  teal: "#1FC2B0",
  purple: "#8B5CF6",
  orange: "#FF8A1F",
  white: "#FFFFFF",
  skin: "#FFE1CB",
  skin2: "#F5C7A1",
  skin3: "#C98E62",
};

export type HeadShape = "round" | "square" | "triangle";
export type Pattern = "stripes" | "wavy" | "pinstripe" | "zigzag" | "none";
export type HatKind = "cap" | "captain" | "beanie" | "tophat" | "hardhat" | "bucket" | "none";
export type Expr = "neutral" | "smug" | "shock" | "panic" | "grin" | "angry" | "happy";

export type Look = {
  head: HeadShape;
  skin: string;
  hair: string;
  hairStyle: "flat" | "spiky" | "curly" | "none";
  shirt: string;
  pattern: Pattern;
  patternColor: string;
  tie?: string;
  shoes: string;
  hat: HatKind;
  hatColor: string;
  hatColor2?: string;
};

// ---- Head geometry: centre (0, -470) ----
const HEAD_Y = -470;
const headPath = (h: HeadShape) => {
  switch (h) {
    case "square":
      return "M-140,-600 L140,-600 Q158,-600 158,-582 L158,-372 Q158,-345 130,-345 L-130,-345 Q-158,-345 -158,-372 L-158,-582 Q-158,-600 -140,-600 Z";
    case "triangle": // wide forehead, narrow chin
      return "M-170,-590 Q0,-640 170,-590 Q185,-520 112,-400 Q60,-330 0,-330 Q-60,-330 -112,-400 Q-185,-520 -170,-590 Z";
    default:
      return "M0,-612 C88,-612 152,-552 152,-470 C152,-392 88,-332 0,-332 C-88,-332 -152,-392 -152,-470 C-152,-552 -88,-612 0,-612 Z";
  }
};
const headTop = (h: HeadShape) => (h === "square" ? -600 : h === "triangle" ? -612 : -612);

const Hair: React.FC<{ l: Look }> = ({ l }) => {
  const t = headTop(l.head);
  if (l.hairStyle === "spiky")
    return <path d={`M-130,${t + 30} L-110,${t - 40} L-70,${t} L-40,${t - 60} L0,${t - 5} L40,${t - 62} L70,${t} L112,${t - 38} L132,${t + 30} Z`} fill={l.hair} {...ol} />;
  if (l.hairStyle === "curly")
    return (
      <g>
        {[-120, -70, -20, 30, 80, 125].map((x, i) => (
          <circle key={x} cx={x} cy={t + 10 - (i % 2) * 14} r={42} fill={l.hair} {...ol} />
        ))}
      </g>
    );
  if (l.hairStyle === "flat") return <path d={`M-150,${t + 60} Q-150,${t - 20} 0,${t - 22} Q150,${t - 20} 150,${t + 60} Q40,${t + 20} -150,${t + 60} Z`} fill={l.hair} {...ol} />;
  return null;
};

const Hat: React.FC<{ l: Look }> = ({ l }) => {
  const t = headTop(l.head) + 22;
  const c = l.hatColor;
  const c2 = l.hatColor2 ?? POP.white;
  switch (l.hat) {
    case "cap":
      return (
        <g>
          <path d={`M-150,${t + 18} C-150,${t - 120} 150,${t - 120} 150,${t + 18} Z`} fill={c} {...ol} />
          <path d={`M60,${t + 10} Q190,${t - 4} 240,${t + 26} Q170,${t + 44} 60,${t + 30} Z`} fill={c} {...ol} />
          <circle cx={0} cy={t - 92} r={12} fill={c2} {...ol} strokeWidth={5} />
          <path d={`M-110,${t - 30} Q0,${t - 70} 110,${t - 30}`} fill="none" stroke={c2} strokeWidth={14} />
        </g>
      );
    case "captain":
      return (
        <g>
          <path d={`M-175,${t - 4} C-175,${t - 130} 175,${t - 130} 175,${t - 4} Z`} fill={c2} {...ol} />
          <rect x={-150} y={t - 18} width={300} height={40} rx={10} fill={c} {...ol} />
          <path d={`M-130,${t + 22} Q0,${t + 70} 130,${t + 22} Z`} fill={INK} {...ol} strokeWidth={5} />
          <circle cx={0} cy={t - 2} r={16} fill={POP.yellow} {...ol} strokeWidth={5} />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d={`M-155,${t + 20} C-160,${t - 140} 160,${t - 140} 155,${t + 20} Z`} fill={c} {...ol} />
          <rect x={-162} y={t - 8} width={324} height={46} rx={18} fill={c2} {...ol} />
          <circle cx={0} cy={t - 124} r={30} fill={c2} {...ol} />
        </g>
      );
    case "tophat":
      return (
        <g>
          <rect x={-100} y={t - 190} width={200} height={190} rx={12} fill={c} {...ol} />
          <rect x={-100} y={t - 60} width={200} height={34} fill={c2} {...ol} strokeWidth={5} />
          <ellipse cx={0} cy={t + 4} rx={180} ry={26} fill={c} {...ol} />
        </g>
      );
    case "hardhat":
      return (
        <g>
          <path d={`M-150,${t + 10} C-150,${t - 140} 150,${t - 140} 150,${t + 10} Z`} fill={c} {...ol} />
          <rect x={-185} y={t - 4} width={370} height={30} rx={14} fill={c} {...ol} />
          <rect x={-18} y={t - 132} width={36} height={130} rx={10} fill={c} {...ol} strokeWidth={5} />
        </g>
      );
    case "bucket":
      return (
        <g>
          <path d={`M-200,${t + 26} L-130,${t - 90} L130,${t - 90} L200,${t + 26} Q0,${t + 52} -200,${t + 26} Z`} fill={c} {...ol} />
          <path d={`M-148,${t - 50} L148,${t - 50}`} stroke={c2} strokeWidth={16} />
        </g>
      );
    default:
      return null;
  }
};

const Face: React.FC<{ l: Look; e: Expr; look: number; blink: boolean; frame: number }> = ({ l, e, look, blink, frame }) => {
  const L = look;
  const ey = HEAD_Y - 6;
  const ex = l.head === "triangle" ? 56 : 52;
  // ---- Eyes ----
  const eye = (d: number) => {
    const cx = d * ex + L;
    if ((blink && e !== "shock" && e !== "panic") || e === "happy" || e === "grin")
      return <path key={d} d={`M${cx - 24},${ey + 6} Q${cx},${ey - 22} ${cx + 24},${ey + 6}`} fill="none" {...ol} strokeWidth={10} />;
    const big = e === "shock" || e === "panic";
    const rx = big ? 34 : 24;
    const ry = big ? 40 : 30;
    const pr = big ? 7 : 11;
    const jitter = e === "panic" ? Math.sin(frame * 1.9 + d) * 4 : 0;
    return (
      <g key={d}>
        <ellipse cx={cx} cy={ey} rx={rx} ry={ry} fill={POP.white} {...ol} strokeWidth={6} />
        <circle cx={cx + L * 0.2 + jitter + (e === "smug" ? 6 : 0)} cy={ey + (e === "smug" || e === "neutral" ? 6 : 2)} r={pr} fill={INK} />
        {(e === "smug" || e === "neutral" || e === "angry") && (
          // Lids: flat for deadpan, tilted for smug, slanted in for angry.
          <g>
            <path
              d={`M${cx - rx - 4},${ey - (e === "angry" ? (d < 0 ? 18 : -6) : e === "smug" ? (d < 0 ? -2 : -14) : -4)} L${cx + rx + 4},${ey - (e === "angry" ? (d < 0 ? -6 : 18) : e === "smug" ? (d < 0 ? -14 : -2) : -4)} L${cx + rx + 4},${ey - ry - 8} L${cx - rx - 4},${ey - ry - 8} Z`}
              fill={l.skin}
            />
            <path
              d={`M${cx - rx - 2},${ey - (e === "angry" ? (d < 0 ? 18 : -6) : e === "smug" ? (d < 0 ? -2 : -14) : -4)} L${cx + rx + 2},${ey - (e === "angry" ? (d < 0 ? -6 : 18) : e === "smug" ? (d < 0 ? -14 : -2) : -4)}`}
              {...ol}
              strokeWidth={8}
            />
          </g>
        )}
      </g>
    );
  };
  // ---- Chunky brows: thick black slabs ----
  const brow = (d: number) => {
    const by = ey - 58;
    let inner = 0;
    let outer = 0;
    if (e === "angry") (inner = 20), (outer = -12);
    if (e === "panic") (inner = -18), (outer = 10);
    if (e === "shock") (inner = -30), (outer = -30);
    if (e === "smug") d > 0 ? ((inner = -18), (outer = -26)) : ((inner = 6), (outer = 4));
    if (e === "neutral") (inner = 6), (outer = 6);
    if (e === "grin" || e === "happy") (inner = -10), (outer = -14);
    return <path key={d} d={`M${d * 18 + L},${by + inner} L${d * 84 + L},${by + outer}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />;
  };
  // ---- Mouth ----
  const my = HEAD_Y + 70;
  let mouth: React.ReactNode;
  switch (e) {
    case "shock":
      mouth = <ellipse cx={L} cy={my + 8} rx={26} ry={34} fill={INK} />;
      break;
    case "panic":
      mouth = (
        <g>
          <rect x={L - 44} y={my - 10} width={88} height={34} rx={14} fill={POP.white} {...ol} strokeWidth={6} />
          <path d={`M${L - 44},${my + 7} L${L + 44},${my + 7}`} stroke={INK} strokeWidth={4} />
          {[-22, 0, 22].map((x) => (
            <line key={x} x1={L + x} y1={my - 10} x2={L + x} y2={my + 24} stroke={INK} strokeWidth={4} />
          ))}
        </g>
      );
      break;
    case "grin":
    case "happy":
      mouth = (
        <g>
          <path d={`M${L - 62},${my - 16} Q${L},${my + 72} ${L + 62},${my - 16} Z`} fill={INK} />
          <path d={`M${L - 56},${my - 12} L${L + 56},${my - 12} L${L + 48},${my + 8} L${L - 48},${my + 8} Z`} fill={POP.white} />
          <ellipse cx={L} cy={my + 34} rx={22} ry={10} fill={POP.pink} />
        </g>
      );
      break;
    case "angry":
      mouth = <path d={`M${L - 34},${my + 14} Q${L},${my - 10} ${L + 34},${my + 14}`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />;
      break;
    case "smug":
      mouth = <path d={`M${L - 30},${my + 6} Q${L + 14},${my + 18} ${L + 44},${my - 18}`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />;
      break;
    default:
      mouth = <path d={`M${L - 24},${my + 4} L${L + 24},${my + 2}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />;
  }
  return (
    <g>
      {eye(-1)}
      {eye(1)}
      {brow(-1)}
      {brow(1)}
      {mouth}
      {(e === "panic" || e === "shock") && (
        <path transform={`translate(${130 + L},${-560 + (frame % 24) * 1.2})`} d="M0,0 C-16,26 -16,44 0,46 C16,44 16,26 0,0 Z" fill={POP.sky} {...ol} strokeWidth={5} />
      )}
      {e === "angry" && <path d="M108,-590 l16,-16 m-16,16 l-16,-16 m16,16 l16,16 m-16,-16 l-16,16" stroke={POP.red} strokeWidth={9} strokeLinecap="round" />}
      {e === "shock" &&
        [-1, 1].map((d) => [0, 1, 2].map((i) => <line key={`${d}${i}`} x1={d * (185 + i * 6)} y1={-590 + i * 40} x2={d * (235 + i * 10)} y2={-612 + i * 36} stroke={INK} strokeWidth={9} strokeLinecap="round" />))}
    </g>
  );
};

const SHIRT = "M-52,-342 Q0,-352 52,-342 L104,-158 Q0,-136 -104,-158 Z";

const ShirtPattern: React.FC<{ p: Pattern; color: string; id: string }> = ({ p, color, id }) => {
  if (p === "none") return null;
  let lines: React.ReactNode = null;
  if (p === "stripes") lines = [-310, -270, -230, -190].map((y) => <rect key={y} x={-120} y={y} width={240} height={16} fill={color} />);
  if (p === "pinstripe") lines = [-75, -45, -15, 15, 45, 75].map((x) => <line key={x} x1={x * 0.55} y1={-350} x2={x * 1.25} y2={-140} stroke={color} strokeWidth={6} />);
  if (p === "wavy")
    lines = [-305, -260, -215, -175].map((y) => (
      <path key={y} d={`M-130,${y} Q-97,${y - 16} -65,${y} T0,${y} T65,${y} T130,${y}`} fill="none" stroke={color} strokeWidth={10} />
    ));
  if (p === "zigzag")
    lines = [-290, -220].map((y) => <path key={y} d={`M-130,${y} L-100,${y - 22} L-70,${y} L-40,${y - 22} L-10,${y} L20,${y - 22} L50,${y} L80,${y - 22} L110,${y} L140,${y - 22}`} fill="none" stroke={color} strokeWidth={10} />);
  return (
    <g>
      <clipPath id={id}>
        <path d={SHIRT} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{lines}</g>
    </g>
  );
};

export const Toon: React.FC<{
  x: number;
  y: number;
  scale?: number;
  look: Look;
  expr?: Expr;
  /** Where the eyes look, px. */
  gaze?: number;
  /** 0 = arms spread down, 1 = both arms up. */
  armsUp?: number;
  id: string;
  seed?: number;
  flip?: boolean;
}> = ({ x, y, scale = 1, look: l, expr = "neutral", gaze = 0, armsUp = 0, id, seed = 0, flip = false }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 12 + seed) * 3;
  const blink = (f + seed * 29) % 100 < 4;
  const hand = (d: number): [number, number] => {
    const down: [number, number] = [d * 150, -205];
    const up: [number, number] = [d * 235, -520];
    return [down[0] + (up[0] - down[0]) * armsUp, down[1] + (up[1] - down[1]) * armsUp + Math.sin(f / 9 + d + seed) * 4];
  };
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * scale},${scale})`}>
      {/* Thin stick legs and chunky shoes */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 30},-160 L${d * 34},-18`} stroke={INK} strokeWidth={11} strokeLinecap="round" />
          <ellipse cx={d * 46} cy={-14} rx={34} ry={17} fill={l.shoes} {...ol} strokeWidth={6} />
        </g>
      ))}
      <g transform={`translate(0,${bob})`}>
        {/* Thin arms spread away from the body, round hands */}
        {[-1, 1].map((d) => {
          const [hx, hy] = hand(d);
          return (
            <g key={`a${d}`}>
              <path d={`M${d * 50},-320 Q${d * 110},${(-320 + hy) / 2 - 10} ${hx},${hy}`} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />
              <circle cx={hx} cy={hy} r={17} fill={l.skin} {...ol} strokeWidth={6} />
            </g>
          );
        })}
        {/* Triangle shirt with a line pattern */}
        <path d={SHIRT} fill={l.shirt} />
        <ShirtPattern p={l.pattern} color={l.patternColor} id={`shirt-${id}`} />
        <path d={SHIRT} fill="none" {...ol} />
        {l.tie && <path d="M-14,-340 L14,-340 L22,-250 L0,-222 L-22,-250 Z" fill={l.tie} {...ol} strokeWidth={6} />}
        {/* Head */}
        <g>
          {l.hat === "none" && <Hair l={l} />}
          <path d={headPath(l.head)} fill={l.skin} {...ol} />
          <Face l={l} e={expr} look={gaze} blink={blink} frame={f} />
          <Hat l={l} />
        </g>
      </g>
    </g>
  );
};

/** Six example characters: three head shapes, two each. */
export const CAST: Record<string, Look> = {
  roundCap: { head: "round", skin: POP.skin, hair: "#2A1B12", hairStyle: "flat", shirt: POP.yellow, pattern: "stripes", patternColor: POP.orange, tie: POP.blue, shoes: POP.blue, hat: "cap", hatColor: POP.red },
  squareHard: { head: "square", skin: POP.skin2, hair: "#3B2618", hairStyle: "flat", shirt: POP.blue, pattern: "pinstripe", patternColor: "#5AA0FF", shoes: INK, hat: "hardhat", hatColor: POP.yellow },
  triTop: { head: "triangle", skin: POP.skin, hair: "#1B1B1B", hairStyle: "spiky", shirt: POP.purple, pattern: "wavy", patternColor: "#B394FF", tie: POP.yellow, shoes: INK, hat: "tophat", hatColor: INK, hatColor2: POP.red },
  roundBeanie: { head: "round", skin: POP.skin3, hair: "#1B1B1B", hairStyle: "curly", shirt: POP.green, pattern: "zigzag", patternColor: POP.yellow, shoes: POP.orange, hat: "beanie", hatColor: POP.pink, hatColor2: POP.white },
  squareCaptain: { head: "square", skin: POP.skin, hair: "#E0E0E0", hairStyle: "flat", shirt: POP.white, pattern: "stripes", patternColor: POP.blue, shoes: INK, hat: "captain", hatColor: POP.blue },
  triBucket: { head: "triangle", skin: POP.skin2, hair: "#D2652D", hairStyle: "spiky", shirt: POP.teal, pattern: "stripes", patternColor: "#7FE3D6", tie: POP.red, shoes: POP.purple, hat: "bucket", hatColor: POP.orange, hatColor2: POP.yellow },
};
