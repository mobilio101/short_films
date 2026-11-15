import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, EMOTE, Pose } from "../../components/Character";
import { BUNGEE, M, OFFSET, skin } from "../../components/memphis";

/** Acting test sheet: the main character in ten emotions. */
const CELLS: { name: string; pose: Pose; extra?: (f: number) => Pose }[] = [
  { name: "JOY", pose: EMOTE.joy, extra: (f) => ({ jump: Math.abs(Math.sin(f / 6)) * 60, squash: 1 + 0.08 * Math.sin(f / 3) }) },
  { name: "SHOCK", pose: EMOTE.shock },
  { name: "DESPAIR", pose: EMOTE.despair },
  { name: "RAGE", pose: EMOTE.rage },
  { name: "FEAR", pose: EMOTE.fear },
  { name: "SMUG", pose: EMOTE.smug },
  { name: "LAUGH", pose: EMOTE.laugh, extra: (f) => ({ squash: 1 + 0.06 * Math.abs(Math.sin(f / 2.5)) }) },
  { name: "SAD", pose: EMOTE.sad },
  { name: "POINT", pose: EMOTE.point },
  { name: "PROUD", pose: EMOTE.proud },
];

const Hat = (
  <g>
    <path d="M-72,-58 Q0,-140 72,-58 Z" fill={M.ink} />
    <rect x={-175} y={-80} width={110} height={14} rx={7} fill={M.ink} />
    <rect x={65} y={-80} width={110} height={14} rx={7} fill={M.ink} />
  </g>
);

export const Emotions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {CELLS.map((c, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const cx = 270 + col * 540;
          const base = 330 + row * 360;
          return (
            <g key={c.name}>
              <line x1={cx - 220} y1={base} x2={cx + 220} y2={base} stroke={M.ink} strokeWidth={4} />
              <g style={{ filter: OFFSET }}>
                <Character x={cx} y={base} scale={0.55} skin={skin(M.amber)} hat={Hat} seed={i} {...c.pose} {...(c.extra ? c.extra(f) : {})} />
              </g>
              <text x={cx + 120} y={base - 260} fontFamily={BUNGEE} fontSize={34} fill={M.pink}>
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
