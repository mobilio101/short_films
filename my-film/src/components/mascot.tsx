// The channel's look for people ("ink blot") and its host mascot, a little walking ink drop.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Pose } from "./Character";
import { M } from "./memphis";

/** Ink-blot look shared by every character. Spread into <Character>. */
export const INK: Pose = { headShape: "drop", bigEyes: true };
/** Main character: ink-blot look plus the black neckerchief. */
export const INK_MAIN: Pose = { ...INK, neckerchief: M.ink };
/** Side characters with white bodies get a small red cheek mark. */
export const INK_SIDE: Pose = { ...INK, cheek: M.pink };

/** The host mascot. Bounces, blinks and reacts. Origin = between its feet. */
export const InkDrop: React.FC<{ x: number; y: number; s?: number; mood?: "happy" | "shock" | "cheer" | "sad"; seed?: number }> = ({
  x,
  y,
  s = 1,
  mood = "happy",
  seed = 0,
}) => {
  const f = useCurrentFrame();
  const bounce = mood === "cheer" ? Math.abs(Math.sin(f / 5)) * 30 : Math.abs(Math.sin(f / 9 + seed)) * 6;
  const squash = mood === "cheer" ? 1 + 0.08 * Math.sin(f / 2.5) : 1 + 0.03 * Math.sin(f / 9 + seed);
  const blink = (f + seed * 17) % 90 < 4;
  const eyeRy = mood === "shock" ? 20 : 16;
  return (
    <g transform={`translate(${x},${y - bounce * s}) scale(${s / Math.sqrt(squash)},${s * squash})`}>
      <line x1={-18} y1={-6} x2={-22} y2={0} stroke={M.ink} strokeWidth={8} strokeLinecap="round" />
      <line x1={18} y1={-6} x2={22} y2={0} stroke={M.ink} strokeWidth={8} strokeLinecap="round" />
      {mood === "cheer" && (
        <>
          <path d="M-52,-60 Q-80,-100 -70,-130" stroke={M.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M52,-60 Q80,-100 70,-130" stroke={M.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
        </>
      )}
      <path d="M0,-170 C22,-126 64,-96 64,-52 C64,-16 34,0 0,0 C-34,0 -64,-16 -64,-52 C-64,-96 -22,-126 0,-170 Z" fill={M.ink} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 19} cy={-60} rx={14} ry={blink ? 2 : eyeRy} fill="#FFFFFF" />
          {!blink && <circle cx={d * 19 + 3} cy={-56} r={mood === "shock" ? 5 : 6.5} fill={M.ink} />}
        </g>
      ))}
      <ellipse cx={41} cy={-34} rx={9} ry={5} fill={M.pink} />
      {mood === "shock" ? (
        <ellipse cx={0} cy={-26} rx={8} ry={11} fill="#FFFFFF" />
      ) : mood === "sad" ? (
        <path d="M-12,-24 Q0,-34 12,-24" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" />
      ) : (
        <path d={mood === "cheer" ? "M-14,-34 Q0,-14 14,-34 Z" : "M-12,-32 Q0,-20 12,-32"} stroke="#FFFFFF" strokeWidth={4} fill={mood === "cheer" ? "#FFFFFF" : "none"} strokeLinecap="round" />
      )}
      {mood === "shock" &&
        [-50, -20, 20, 50].map((a, i) => {
          const r = (a * Math.PI) / 180 - Math.PI / 2;
          return <line key={i} x1={Math.cos(r) * 110} y1={-80 + Math.sin(r) * 110} x2={Math.cos(r) * 140} y2={-80 + Math.sin(r) * 140} stroke={M.ink} strokeWidth={6} strokeLinecap="round" />;
        })}
    </g>
  );
};
