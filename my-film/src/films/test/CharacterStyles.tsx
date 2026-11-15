import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, EMOTE, Pose } from "../../components/Character";
import { BUNGEE, M, OFFSET, skin } from "../../components/memphis";

export const SpaceCap = (
  <g>
    <path d="M-92,-10 A92,92 0 0 1 92,-10 L92,6 L-92,6 Z" fill="#FFFFFF" stroke={M.ink} strokeWidth={5} />
    <path d="M-70,-62 Q0,-110 70,-62" fill="none" stroke={M.ink} strokeWidth={14} />
    <circle cx={-92} cy={6} r={16} fill={M.ink} />
    <circle cx={92} cy={6} r={16} fill={M.ink} />
  </g>
);
export const CutCap = (
  <g>
    <path d="M-80,-70 L70,-74 L95,-20 L-92,-22 Z" fill="#FFFFFF" stroke={M.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-100} y={-24} width={22} height={34} fill={M.ink} />
    <rect x={78} y={-24} width={22} height={34} fill={M.ink} />
  </g>
);

type Look = { name: string; note: string; main: Pose; side: Pose; mascot: (f: number) => React.ReactNode };

const LOOKS: Look[] = [
  {
    name: "A · INK BLOT",
    note: "ink-drop heads, big white eyes, neckerchief, cheek mark",
    main: { headShape: "drop", bigEyes: true, neckerchief: M.ink },
    side: { headShape: "drop", bigEyes: true, cheek: M.pink },
    mascot: (f) => (
      <g transform={`translate(0,${-Math.abs(Math.sin(f / 6)) * 18})`}>
        <path d="M0,-150 C20,-110 60,-80 60,-40 C60,-6 32,10 0,10 C-32,10 -60,-6 -60,-40 C-60,-80 -20,-110 0,-150 Z" fill={M.ink} />
        <ellipse cx={-18} cy={-48} rx={13} ry={16} fill="#FFFFFF" />
        <ellipse cx={18} cy={-48} rx={13} ry={16} fill="#FFFFFF" />
        <circle cx={-15} cy={-45} r={6} fill={M.ink} />
        <circle cx={21} cy={-45} r={6} fill={M.ink} />
        <ellipse cx={38} cy={-24} rx={9} ry={5} fill={M.pink} />
        <path d="M-12,-20 Q0,-10 12,-20" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" />
        <line x1={-18} y1={8} x2={-22} y2={40} stroke={M.ink} strokeWidth={8} strokeLinecap="round" />
        <line x1={18} y1={8} x2={22} y2={40} stroke={M.ink} strokeWidth={8} strokeLinecap="round" />
      </g>
    ),
  },
  {
    name: "B · PAPER CUT",
    note: "angular folded heads, red bow tie",
    main: { headShape: "cut", bowTie: M.pink },
    side: { headShape: "cut" },
    mascot: (f) => (
      <g transform={`translate(0,${-40 - Math.sin(f / 5) * 12})`}>
        <path d="M-70,0 L0,-40 L70,-10 L10,30 Z" fill="#FFFFFF" stroke={M.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M-10,-20 L-40,${-90 + Math.sin(f / 3) * 20} L20,-30 Z`} fill="#FFFFFF" stroke={M.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M70,-10 L100,-30 L84,0 Z" fill={M.pink} stroke={M.ink} strokeWidth={4} />
        <circle cx={58} cy={-12} r={5} fill={M.ink} />
        <line x1={0} y1={-40} x2={10} y2={30} stroke={M.ink} strokeWidth={3} opacity={0.4} />
      </g>
    ),
  },
  {
    name: "C · PRINT CARTOON",
    note: "pear body, joined eyes, big nose, white gloves",
    main: { joinedEyes: true, nose: true, gloves: true, bodyShape: "pear" },
    side: { joinedEyes: true, nose: true, gloves: true, bodyShape: "pear" },
    mascot: () => (
      <g>
        <rect x={-50} y={-110} width={100} height={110} rx={16} fill={M.ink} />
        <rect x={-30} y={-140} width={60} height={34} rx={6} fill={M.ink} />
        <rect x={-38} y={-80} width={76} height={50} rx={8} fill="#FFFFFF" />
        <ellipse cx={-14} cy={-58} rx={10} ry={13} fill={M.ink} />
        <ellipse cx={14} cy={-58} rx={10} ry={13} fill={M.ink} />
        <path d="M40,-140 L90,-220 L70,-140 Z" fill={M.pink} stroke={M.ink} strokeWidth={4} />
      </g>
    ),
  },
];

export const CharacterStyles: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {LOOKS.map((l, r) => {
          const base = 560 + r * 590;
          return (
            <g key={l.name}>
              <text x={60} y={base - 440} fontFamily={BUNGEE} fontSize={46} fill={M.pink}>
                {l.name}
              </text>
              <text x={60} y={base - 400} fontFamily="Arial, sans-serif" fontSize={26} fill={M.ink}>
                {l.note}
              </text>
              <line x1={40} y1={base} x2={1040} y2={base} stroke={M.ink} strokeWidth={4} />
              <g style={{ filter: OFFSET }}>
                <Character x={150} y={base} scale={0.62} skin={skin(M.amber)} seed={r} {...l.main} />
                <Character x={410} y={base} scale={0.62} skin={skin(M.amber)} seed={r + 3} {...l.main} {...EMOTE.shock} />
                <Character x={670} y={base} scale={0.62} skin={skin("#FFFFFF")} seed={r + 6} {...l.side} {...EMOTE.joy} fx="none" />
                <g transform={`translate(910,${base})`}>{l.mascot(f)}</g>
              </g>
              <text x={150} y={base + 46} textAnchor="middle" fontFamily={BUNGEE} fontSize={22} fill={M.ink}>MAIN</text>
              <text x={410} y={base + 46} textAnchor="middle" fontFamily={BUNGEE} fontSize={22} fill={M.ink}>SHOCK</text>
              <text x={670} y={base + 46} textAnchor="middle" fontFamily={BUNGEE} fontSize={22} fill={M.ink}>SIDE</text>
              <text x={910} y={base + 46} textAnchor="middle" fontFamily={BUNGEE} fontSize={22} fill={M.ink}>MASCOT</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
