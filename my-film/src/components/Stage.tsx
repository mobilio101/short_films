import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { BAR, C, FLOOR_Y, H, W } from "./theme";

/** Thin black bars top and bottom. Always render last. */
export const Letterbox: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: 0, left: 0, width: W, height: BAR, background: "#000" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, width: W, height: BAR, background: "#000" }} />
  </AbsoluteFill>
);

export const Background: React.FC<{ color?: string }> = ({ color = C.bg }) => (
  <AbsoluteFill style={{ background: color }} />
);

/** Big soft light glow. Light only ever comes from objects, so place one per light source. */
export const Glow: React.FC<{
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity?: number;
}> = ({ x, y, radius, color, intensity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - radius,
      top: y - radius,
      width: radius * 2,
      height: radius * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, ${color}55 25%, ${color}18 55%, transparent 72%)`,
      opacity: Math.max(0, intensity),
      mixBlendMode: "screen",
      pointerEvents: "none",
    }}
  />
);

type Pt = [number, number];

/** Subdivide a closed polygon so the wobble looks hand drawn, not jagged. */
const subdivide = (pts: Pt[], step = 18): Pt[] => {
  const out: Pt[] = [];
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const n = Math.max(1, Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) / step));
    for (let k = 0; k < n; k++) out.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
  });
  return out;
};

/** A flat prop shape with a thin, gently wobbling grey outline (moves every frame). */
export const WobblyShape: React.FC<{
  points: Pt[];
  fill: string;
  seed: string;
  stroke?: string;
  amount?: number;
  closed?: boolean;
}> = ({ points, fill, seed, stroke = C.line, amount = 1.6, closed = true }) => {
  const frame = useCurrentFrame();
  const pts = closed ? subdivide(points) : points;
  const d =
    pts
      .map((p, i) => {
        const dx = noise2D(seed + "x", i * 0.6, frame * 0.07) * amount;
        const dy = noise2D(seed + "y", i * 0.6, frame * 0.07) * amount;
        return `${i === 0 ? "M" : "L"}${(p[0] + dx).toFixed(1)},${(p[1] + dy).toFixed(1)}`;
      })
      .join(" ") + (closed ? " Z" : "");
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={2.2} strokeLinejoin="round" />;
};

export const rect = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

/** Full-width SVG layer in stage coordinates. */
export const Layer: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);

/** The thin grey floor line. */
export const Floor: React.FC = () => {
  const frame = useCurrentFrame();
  const pts: Pt[] = [];
  for (let x = -40; x <= W + 40; x += 40) pts.push([x, FLOOR_Y + noise2D("floor", x * 0.01, frame * 0.05) * 1.2]);
  return (
    <path
      d={pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1].toFixed(1)}`).join(" ")}
      fill="none"
      stroke={C.line}
      strokeWidth={2}
      opacity={0.8}
    />
  );
};
