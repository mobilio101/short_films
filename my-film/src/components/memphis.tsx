// The channel's Memphis look, shared by every Short.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBungee } from "@remotion/google-fonts/Bungee";
import { Skin } from "./Character";
import { Ui } from "./theme";

export const BUNGEE = loadBungee("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

export const M = {
  night: "#17134A",
  floor: "#221C5C",
  ink: "#0A0A0A",
  pink: "#FF5FA2",
  teal: "#2EC4B6",
  yellow: "#FFD23F",
  lilac: "#9B8CFF",
  cream: "#FFF6E9",
  amber: "#FFB627",
  grey: "#C9C2DA",
};

/** Vertical Short canvas and safe area. */
export const SW = 1080;
export const SH = 1920;
export const SAFE = { top: 200, bottom: 250, right: 160, left: 60 };

export const MEMPHIS_UI: Ui = {
  font: BUNGEE,
  white: M.cream,
  accent: M.pink,
  titleBg: M.night,
  textScale: 0.8,
  letterSpacing: 1,
};

/** Hard pink offset shadow used on every drawn thing. */
export const OFFSET = `drop-shadow(10px 10px 0 ${M.pink})`;

export const skin = (body: string): Skin => ({ body, outline: M.ink, outlineWidth: 5, face: M.ink });

/** Flat concentric rings of solid colour: the Memphis way of drawing light. */
export const LightRings: React.FC<{
  x: number;
  y: number;
  radii: number[];
  colors: string[];
  on?: number;
  dots?: { r: number; color: string };
}> = ({ x, y, radii, colors, on = 1, dots }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={on}>
      {radii.map((r, i) => (
        <circle key={i} cx={x} cy={y} r={r * (0.97 + 0.03 * Math.sin(frame / 10 + i))} fill={colors[i % colors.length]} />
      ))}
      {dots &&
        Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2 + frame * 0.01;
          return <circle key={`d${i}`} cx={x + Math.cos(a) * dots.r} cy={y + Math.sin(a) * dots.r} r={6} fill={dots.color} />;
        })}
    </g>
  );
};

/** The warm lamp / sunset ramp and the cool moon ramp. */
export const WARM = ["#2A2270", "#43297E", "#713487", "#B8578A", "#F2957F"];
export const MOON = ["#1F1A5A", "#28226E", "#332C85"];
export const GOLD = ["#2A2270", "#5A3A7A", "#B07A4A", "#E8B54A", "#FFD23F"];

type Spot = { x: number; y: number; kind: string; color: string; size?: number };

/** Small geometric shapes that drift and turn slowly. Keep them away from text and faces. */
export const Confetti: React.FC<{ spots: Spot[] }> = ({ spots }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {spots.map((c, i) => {
        const s = c.size ?? 40;
        const dx = Math.sin(frame / 40 + i) * 6;
        const dy = Math.cos(frame / 33 + i * 2) * 6;
        const rot = ((i * 47) % 360) + Math.sin(frame / 50 + i) * 12;
        let el: React.ReactNode;
        switch (c.kind) {
          case "squiggle":
            el = <path d={`M${-s},0 q${s / 4},${-s / 2} ${s / 2},0 t${s / 2},0 t${s / 2},0 t${s / 2},0`} stroke={c.color} strokeWidth={9} fill="none" strokeLinecap="round" />;
            break;
          case "triangle":
            el = <path d={`M0,${-s * 0.6} L${s * 0.6},${s * 0.45} L${-s * 0.6},${s * 0.45} Z`} fill={c.color} stroke={M.ink} strokeWidth={4} />;
            break;
          case "ring":
            el = <circle r={s * 0.45} fill="none" stroke={c.color} strokeWidth={10} />;
            break;
          case "zigzag":
            el = <path d={`M${-s},0 l${s / 3},${-s / 3} l${s / 3},${s / 3} l${s / 3},${-s / 3} l${s / 3},${s / 3} l${s / 3},${-s / 3} l${s / 3},${s / 3}`} stroke={c.color} strokeWidth={8} fill="none" strokeLinejoin="round" />;
            break;
          case "grid":
            el = <g>{[0, 1, 2].flatMap((a) => [0, 1, 2].map((b) => <circle key={`${a}${b}`} cx={(a - 1) * s * 0.4} cy={(b - 1) * s * 0.4} r={4.5} fill={c.color} />))}</g>;
            break;
          case "cross":
            el = <path d={`M${-s * 0.4},0 H${s * 0.4} M0,${-s * 0.4} V${s * 0.4}`} stroke={c.color} strokeWidth={10} strokeLinecap="round" />;
            break;
          default:
            el = <circle r={s * 0.35} fill={c.color} stroke={M.ink} strokeWidth={4} />;
        }
        return (
          <g key={i} transform={`translate(${c.x + dx},${c.y + dy}) rotate(${rot})`}>
            {el}
          </g>
        );
      })}
    </g>
  );
};

/** Cream ground line, black-and-white checker strip, then a floor with terrazzo flecks. */
export const CheckerFloor: React.FC<{ y: number; width?: number; height?: number }> = ({ y, width = SW, height = SH }) => (
  <g>
    <rect x={0} y={y} width={width} height={height - y} fill={M.floor} />
    {Array.from({ length: Math.ceil(width / 30) + 1 }, (_, i) => (
      <rect key={i} x={i * 30} y={y + 3} width={30} height={24} fill={i % 2 ? M.cream : M.ink} />
    ))}
    <line x1={0} y1={y} x2={width} y2={y} stroke={M.cream} strokeWidth={6} />
    {Array.from({ length: 60 }, (_, i) => {
      const fx = (i * 271) % width;
      const fy = y + 50 + ((i * 97) % Math.max(1, height - y - 70));
      return <rect key={`t${i}`} x={fx} y={fy} width={6 + (i % 4) * 3} height={4 + (i % 3) * 2} fill={[M.pink, M.teal, M.yellow, M.cream][i % 4]} transform={`rotate(${(i * 53) % 180} ${fx} ${fy})`} />;
    })}
  </g>
);

/** A short tag on the picture (place, date, number) that pops in and out. */
export const Label: React.FC<{ text: string; x: number; y: number; from: number; to: number; color?: string; size?: number }> = ({
  text,
  x,
  y,
  from,
  to,
  color = M.yellow,
  size = 50,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame > to) return null;
  const s = spring({ frame: frame - from, fps, config: { damping: 9, stiffness: 180 } });
  const out = interpolate(frame, [to - 6, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s * out}) rotate(${(1 - s) * -8}deg)`,
        fontFamily: BUNGEE,
        fontSize: size,
        color: M.ink,
        background: color,
        border: `5px solid ${M.ink}`,
        boxShadow: `8px 8px 0 ${M.pink}`,
        padding: "6px 18px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export type Word = { text: string; startMs: number; endMs: number };

/** Word-by-word captions synced to the voice: 1 to 3 words per page, current word in pink. */
export const Captions: React.FC<{ words: Word[]; y: number; hideAfterMs?: number }> = ({ words, y, hideAfterMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  if (hideAfterMs !== undefined && ms > hideAfterMs) return null;
  // Build pages: break after punctuation or every 3 words.
  const pages: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (/[.,:;!?]$/.test(w.text) || cur.length === 3) {
      pages.push(cur);
      cur = [];
    }
  });
  if (cur.length) pages.push(cur);
  const page = pages.find((p, i) => {
    const next = pages[i + 1];
    return ms >= p[0].startMs - 80 && (next ? ms < next[0].startMs - 80 : ms < p[p.length - 1].endMs + 400);
  });
  if (!page) return null;
  const pageStart = (page[0].startMs / 1000) * fps;
  const pop = spring({ frame: frame - pageStart + 2, fps, config: { damping: 12, stiffness: 260 } });
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SW - SAFE.left - SAFE.right,
        top: y,
        transform: `translateY(-50%) scale(${0.85 + 0.15 * pop})`,
        textAlign: "center",
        fontFamily: BUNGEE,
        fontSize: 84,
        lineHeight: 1.1,
        textTransform: "uppercase",
      }}
    >
      {page.map((w, i) => {
        const next = page[i + 1];
        const active = ms >= w.startMs - 40 && (next ? ms < next.startMs - 40 : true);
        return (
          <span
            key={i}
            style={{
              color: active ? M.pink : M.cream,
              WebkitTextStroke: `14px ${M.ink}`,
              paintOrder: "stroke fill",
              display: "inline-block",
              margin: "0 22px",
              transform: active ? "scale(1.08)" : undefined,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
