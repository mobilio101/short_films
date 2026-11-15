// Building blocks shared by every vertical Short: timing from the voice, the stage, camera,
// flashes and speed lines. Colours come from the active palette in memphis.tsx.
import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { CheckerFloor, Confetti, LightRings, M, MOON, OFFSET, SH, SW, Word } from "./memphis";

export const SHORT_FPS = 30;
export const GROUND = 1150;

export const STROKE = { stroke: M.ink, strokeWidth: 6, strokeLinejoin: "round" as const };

/** Turns a narration's word timings into a `cue("phrase")` → start-frame lookup. */
export const makeCues = (words: Word[], fps = SHORT_FPS) => {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
  const cue = (phrase: string, afterFrame = 0): number => {
    const target = phrase.split(" ").map(norm);
    for (let i = 0; i + target.length <= words.length; i++) {
      const f = Math.round((words[i].startMs / 1000) * fps);
      if (f < afterFrame) continue;
      if (target.every((t, j) => norm(words[i + j].text) === t)) return f;
    }
    throw new Error(`Phrase not found in narration: "${phrase}"`);
  };
  const end = Math.round((words[words.length - 1].endMs / 1000) * fps);
  return { cue, end };
};

export type Spot = { x: number; y: number; kind: string; color: string; size?: number };
const DEFAULT_SPOTS: Spot[] = [
  { x: 110, y: 560, kind: "squiggle", color: M.pink },
  { x: 300, y: 260, kind: "triangle", color: M.lilac },
  { x: 960, y: 900, kind: "ring", color: M.ink },
  { x: 150, y: 900, kind: "grid", color: M.pink },
];

/** A side-on stage on paper: optional moon/lamp rings, background marks, floor; children get the offset shadow. */
export const Stage: React.FC<{
  children: React.ReactNode;
  cam?: { s: number; x: number; y: number };
  floor?: boolean;
  moon?: boolean | { x: number; y: number };
  spots?: Spot[] | false;
  back?: React.ReactNode;
}> = ({ children, cam = { s: 1, x: SW / 2, y: SH / 2 }, floor = true, moon = true, spots, back }) => {
  const m = moon === true ? { x: 780, y: 520 } : moon || null;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <AbsoluteFill style={{ transform: `translate(${SW / 2 - cam.x * cam.s}px, ${SH / 2 - cam.y * cam.s}px) scale(${cam.s})`, transformOrigin: "0 0" }}>
        <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} style={{ overflow: "visible" }}>
          {m && <LightRings x={m.x} y={m.y} radii={[300, 210, 130]} colors={MOON} />}
          {m && <circle cx={m.x} cy={m.y} r={70} fill={M.cream} stroke={M.ink} strokeWidth={6} />}
          {spots !== false && <Confetti spots={spots ?? DEFAULT_SPOTS} />}
          {back}
          {floor && <CheckerFloor y={GROUND} />}
          <g style={{ filter: OFFSET }}>{children}</g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Local frame plus a spring helper for pop-ins. */
export const useLocal = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return {
    f: frame,
    fps,
    dur: durationInFrames,
    pop: (at: number, damping = 9) => spring({ frame: frame - at, fps, config: { damping, stiffness: 200 } }),
  };
};

export const Flash: React.FC<{ at: number; color?: string }> = ({ at, color = "#FFFFFF" }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 1, at + 7], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

export const SpeedLines: React.FC<{ at: number; dir?: 1 | -1 }> = ({ at, dir = -1 }) => {
  const f = useCurrentFrame();
  const t = (f - at) / 10;
  if (t < 0 || t > 1) return null;
  return (
    <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 16 }, (_, i) => {
        const y = 250 + i * 95 + ((i * 37) % 40);
        const len = 300 + ((i * 131) % 300);
        const x = dir < 0 ? SW - t * (SW + len) : t * (SW + len) - len;
        return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke={M.ink} strokeWidth={8} strokeLinecap="round" opacity={1 - t} />;
      })}
    </svg>
  );
};

export const Paper: React.FC<{ w: number; h: number; children?: React.ReactNode }> = ({ w, h, children }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={M.cream} {...STROKE} />
    {children}
  </g>
);

/** A code-made sound effect placed at a frame. */
export const Sfx: React.FC<{ name: string; at: number; vol?: number; len?: number; rate?: number }> = ({ name, at, vol = 0.4, len = 60, rate }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={len} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} playbackRate={rate} />
  </Sequence>
);
