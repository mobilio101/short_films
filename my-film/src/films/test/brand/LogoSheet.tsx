// Channel name and logo options for the two channels that have none yet:
// row 1 = the new 3D-world channel, row 2 = the late-night self-discipline channel.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
import { loadFont as loadComic } from "@remotion/google-fonts/ComicNeue";
import { INK, MAIN, POP, Toon } from "../../../characters/toon/Toon";

const { fontFamily: LILITA } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: COMIC } = loadComic("normal", { weights: ["700"], subsets: ["latin"] });

const R = 220; // avatar radius
const FACE = { ...MAIN, hat: "none" as const };

/** A round channel picture with its name underneath. */
const Avatar: React.FC<{ cx: number; cy: number; id: string; bg: string; name: string; font: string; nameColor: string; children: React.ReactNode }> = ({ cx, cy, id, bg, name, font, nameColor, children }) => (
  <g>
    <clipPath id={`av-${id}`}>
      <circle cx={cx} cy={cy} r={R} />
    </clipPath>
    <circle cx={cx} cy={cy} r={R} fill={bg} />
    <g clipPath={`url(#av-${id})`}>{children}</g>
    <circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeWidth={10} />
    <text x={cx} y={cy + R + 80} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={58} fill={nameColor}>
      {name}
    </text>
  </g>
);

const Glint: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path d={`M${x},${y - s} L${x + s * 0.25},${y - s * 0.25} L${x + s},${y} L${x + s * 0.25},${y + s * 0.25} L${x},${y + s} L${x - s * 0.25},${y + s * 0.25} L${x - s},${y} L${x - s * 0.25},${y - s * 0.25} Z`} fill="#fff" stroke={INK} strokeWidth={4} />
);

/** The self-discipline hero's head: amber, dot eyes, one line per brow, one line for the mouth. */
const Hero: React.FC<{ x: number; y: number; r: number; brow?: number }> = ({ x, y, r, brow = 0.12 }) => (
  <g>
    <rect x={x - r * 0.75} y={y + r * 0.7} width={r * 1.5} height={r * 2} rx={r * 0.5} fill="#F5A623" />
    <circle cx={x} cy={y} r={r} fill="#F5A623" />
    {[-1, 1].map((d) => (
      <g key={d}>
        <circle cx={x + d * r * 0.36} cy={y + r * 0.02} r={r * 0.09} fill="#1A1A1A" />
        <line x1={x + d * r * 0.52} y1={y - r * 0.28 - brow * r * 0.6} x2={x + d * r * 0.18} y2={y - r * 0.28 + brow * r * 0.6} stroke="#1A1A1A" strokeWidth={r * 0.07} strokeLinecap="round" />
      </g>
    ))}
    <line x1={x - r * 0.2} y1={y + r * 0.38} x2={x + r * 0.2} y2={y + r * 0.38} stroke="#1A1A1A" strokeWidth={r * 0.06} strokeLinecap="round" />
  </g>
);

export const LogoSheet: React.FC = () => {
  const xs = [330, 900, 1470];
  const y1 = 330, y2 = 1010;
  return (
    <AbsoluteFill style={{ background: "#EDEAE4" }}>
      <svg width={1800} height={1400} viewBox="0 0 1800 1400">
        <defs>
          <radialGradient id="lamp" cx="50%" cy="30%" r="60%">
            <stop offset="0" stopColor="#FFD58A" stopOpacity={0.95} />
            <stop offset="0.45" stopColor="#F5A623" stopOpacity={0.35} />
            <stop offset="1" stopColor="#0B0B10" stopOpacity={0} />
          </radialGradient>
          <filter id="vglow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* ---- New 3D channel ---- */}
        <Avatar cx={xs[0]} cy={y1} id="a1" bg={POP.yellow} name="1 · SHADY FACTS" font={LILITA} nameColor={INK}>
          <Toon id="l1" x={xs[0]} y={y1 + 560} scale={1.15} look={FACE} expr="smug" />
          <Glint x={xs[0] - 85} y={y1 - 5} s={30} />
        </Avatar>
        <Avatar cx={xs[1]} cy={y1} id="a2" bg={POP.red} name="2 · SMIRK" font={LILITA} nameColor={INK}>
          <Toon id="l2" x={xs[1] + 20} y={y1 + 860} scale={1.75} look={FACE} expr="sneaky" gaze={10} />
        </Avatar>
        <Avatar cx={xs[2]} cy={y1} id="a3" bg={POP.blue} name="3 · LOOPHOLE" font={LILITA} nameColor={INK}>
          <circle cx={xs[2]} cy={y1 - 10} r={150} fill="none" stroke="#fff" strokeWidth={34} />
          <Toon id="l3" x={xs[2] + 10} y={y1 + 520} scale={1.05} look={FACE} expr="smug" />
          <path d={`M${xs[2] - 150},${y1 - 10} A150,150 0 0 0 ${xs[2] + 150},${y1 - 10}`} fill="none" stroke="#fff" strokeWidth={34} />
        </Avatar>

        {/* ---- Self-discipline channel ---- */}
        <Avatar cx={xs[0]} cy={y2} id="b1" bg="#0B0B10" name="4 · ONE LIGHT." font={COMIC} nameColor="#1A1A1A">
          <ellipse cx={xs[0]} cy={y2 + 20} rx={210} ry={240} fill="url(#lamp)" />
          <path d={`M${xs[0] - 50},${y2 - 150} L${xs[0] + 50},${y2 - 150} L${xs[0] + 80},${y2 - 95} L${xs[0] - 80},${y2 - 95} Z`} fill="#2A2A33" stroke="#8A8A94" strokeWidth={4} />
          <line x1={xs[0]} y1={y2 - 230} x2={xs[0]} y2={y2 - 150} stroke="#8A8A94" strokeWidth={4} />
          <Hero x={xs[0]} y={y2 + 70} r={78} />
        </Avatar>
        <Avatar cx={xs[1]} cy={y2} id="b2" bg="#0B0B10" name="5 · 3 AM." font={COMIC} nameColor="#1A1A1A">
          <rect x={xs[1] - 120} y={y2 - 175} width={240} height={110} rx={18} fill="#15151D" stroke="#8A8A94" strokeWidth={4} />
          <text x={xs[1]} y={y2 - 92} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={84} fill="#FF3B3B">3:00</text>
          <circle cx={xs[1]} cy={y2 + 100} r={170} fill="#FF3B3B" opacity={0.08} />
          <Hero x={xs[1]} y={y2 + 85} r={92} brow={-0.15} />
        </Avatar>
        <Avatar cx={xs[2]} cy={y2} id="b3" bg="#15151D" name="6 · SHADOW & ME" font={COMIC} nameColor="#1A1A1A">
          <g filter="url(#vglow)">
            <circle cx={xs[2] + 70} cy={y2 - 40} r={135} fill="none" stroke="#8B6CFF" strokeWidth={14} />
          </g>
          <circle cx={xs[2] + 70} cy={y2 - 40} r={135} fill="#000" stroke="#8B6CFF" strokeWidth={5} />
          <rect x={xs[2] - 30} y={y2 + 70} width={200} height={260} rx={70} fill="#000" stroke="#8B6CFF" strokeWidth={5} />
          {[-1, 1].map((d) => (
            <path key={d} d={`M${xs[2] + 70 + d * 70},${y2 - 45} q${-d * 25},12 ${-d * 50},2`} stroke="#8B6CFF" strokeWidth={10} fill="none" strokeLinecap="round" />
          ))}
          <Hero x={xs[2] - 70} y={y2 + 90} r={80} brow={0.05} />
        </Avatar>

        <text x={900} y={40} textAnchor="middle" fontFamily={LILITA} fontSize={34} fill="#555">3D channel (1–3)  ·  self-discipline channel (4–6)</text>
      </svg>
    </AbsoluteFill>
  );
};
