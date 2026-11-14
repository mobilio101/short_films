import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { BAR, C, COMIC, H, W, clamp01 } from "./theme";

/** Small DAY counter, top left. */
export const DayCounter: React.FC<{ day: number; from?: number }> = ({ day, from = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: BAR + 26,
        fontFamily: COMIC,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: 3,
        color: C.white,
        opacity: 0.85 * s,
        transform: `scale(${0.6 + 0.4 * s})`,
        transformOrigin: "left center",
      }}
    >
      DAY {day}
    </div>
  );
};

/** Narrator line: small, white, top centre, fades in and out. Max 8 words. */
export const Narrator: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const frame = useCurrentFrame();
  if (text.split(/\s+/).length > 8) throw new Error(`Narrator line over 8 words: "${text}"`);
  const o = interpolate(frame, [from, from + 12, to - 12, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: BAR + 34,
        width: W,
        textAlign: "center",
        fontFamily: COMIC,
        fontSize: 40,
        color: C.white,
        opacity: o,
        transform: `translateY(${(1 - o) * 6}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** Shadow's line: accent colour, placed beside the shadow, types on then fades. */
export const ShadowLine: React.FC<{ text: string; from: number; to: number; x: number; y: number }> = ({
  text,
  from,
  to,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const chars = Math.floor(clamp01((frame - from) / Math.max(8, text.length * 1.2)) * text.length);
  const o = interpolate(frame, [from, from + 4, to - 10, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jitter = noise2D("sl", frame * 0.3, 0) * 1.5;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + jitter,
        fontFamily: COMIC,
        fontWeight: 700,
        fontSize: 46,
        color: C.accent,
        opacity: o,
        textShadow: `0 0 18px ${C.accent}AA`,
        whiteSpace: "nowrap",
      }}
    >
      {text.slice(0, chars)}
    </div>
  );
};

/** Rep count pops on with an overshoot, then floats up and fades. */
export const RepPop: React.FC<{ n: number | string; at: number; x: number; y: number; big?: boolean }> = ({
  n,
  at,
  x,
  y,
  big,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > at + 30) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 7, stiffness: 220 } });
  const o = interpolate(frame, [at + 18, at + 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = big ? 130 : 90;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 150,
        width: 300,
        top: y - size / 2 - (frame - at) * 1.5,
        textAlign: "center",
        fontFamily: COMIC,
        fontWeight: 700,
        fontSize: size,
        color: C.white,
        opacity: o,
        transform: `scale(${s}) rotate(${(1 - s) * -12}deg)`,
        WebkitTextStroke: "3px #000",
      }}
    >
      {n}
    </div>
  );
};

/** Big-hit flash: a short white flash. */
export const Flash: React.FC<{ at: number; length?: number }> = ({ at, length = 8 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + length], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: C.white, opacity: o, pointerEvents: "none" }} />;
};

/** Big-hit speed lines bursting out from a point. */
export const SpeedLines: React.FC<{ at: number; x: number; y: number; length?: number }> = ({ at, x, y, length = 14 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / length;
  if (t < 0 || t > 1) return null;
  const lines = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2 + noise2D("sp", i, 0) * 0.15;
    const r1 = 180 + t * 260 + noise2D("sp1", i, 1) * 40;
    const r2 = r1 + 120 + noise2D("sp2", i, 2) * 80;
    return (
      <line
        key={i}
        x1={x + Math.cos(a) * r1}
        y1={y + Math.sin(a) * r1}
        x2={x + Math.cos(a) * r2}
        y2={y + Math.sin(a) * r2}
        stroke={C.white}
        strokeWidth={4 - t * 3}
        strokeLinecap="round"
        opacity={1 - t}
      />
    );
  });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {lines}
    </svg>
  );
};
