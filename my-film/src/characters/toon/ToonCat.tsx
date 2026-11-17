// Shared 2D cat for the SMIRKMAN channel: same look as Toon.tsx (bold black outlines, bright flat
// colours). Orange cat with a white chest, muzzle and paws. Original design.
// Origin = between the paws on the ground. Sitting cat is about 330 px tall at scale 1.
import React from "react";
import { useCurrentFrame } from "remotion";
import { INK, POP } from "./Toon";

const OW = 8;
const ol = { stroke: INK, strokeWidth: OW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type CatExpr = "neutral" | "yawn" | "sleep";
export type CatPose = "sit" | "walk";

export type CatLook = {
  fur: string;
  white: string;
  stripe: string;
  /** A tiny spy antenna sticking up out of the fur on the back of the neck. */
  antenna?: boolean;
};

export const CAT_ORANGE: CatLook = { fur: POP.orange, white: POP.white, stripe: "#E06A00", antenna: false };
export const CAT_SPY: CatLook = { ...CAT_ORANGE, antenna: true };

const Antenna: React.FC<{ x: number; y: number; frame: number; seed: number }> = ({ x, y, frame, seed }) => {
  const sway = Math.sin(frame / 5 + seed) * 5;
  return (
    <g>
      <path d={`M${x},${y} Q${x + 6},${y - 40} ${x + 14 + sway},${y - 76}`} fill="none" {...ol} strokeWidth={6} />
      <circle cx={x + 14 + sway} cy={y - 80} r={9} fill={POP.red} {...ol} strokeWidth={5} />
    </g>
  );
};

/** Face drawn around (0,0) = middle of the head. Head radius about 88. */
const CatFace: React.FC<{ e: CatExpr; look: CatLook; blink: boolean; frame: number }> = ({ e, look, blink, frame }) => {
  const eye = (d: number) => {
    const x = d * 36;
    if (e === "sleep") return <path key={d} d={`M${x - 20},-6 Q${x},8 ${x + 20},-6`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
    if (e === "yawn") return <path key={d} d={`M${x - 20},2 Q${x},-16 ${x + 20},2`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
    // Neutral = bored: a green eye with a heavy flat lid
    if (blink) return <path key={d} d={`M${x - 20},0 L${x + 20},0`} stroke={INK} strokeWidth={8} strokeLinecap="round" />;
    return (
      <g key={d}>
        <ellipse cx={x} cy={0} rx={21} ry={20} fill="#C6F36B" {...ol} strokeWidth={6} />
        <ellipse cx={x + 2} cy={4} rx={5} ry={13} fill={INK} />
        <path d={`M${x - 26},-6 L${x + 26},-6 L${x + 26},-24 L${x - 26},-24 Z`} fill={look.fur} />
        <path d={`M${x - 24},-5 L${x + 24},-5`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g>
      {/* white muzzle */}
      <ellipse cx={0} cy={36} rx={44} ry={32} fill={look.white} />
      {[-1, 1].map(eye)}
      {/* nose */}
      <path d="M-11,22 L11,22 L0,35 Z" fill={POP.pink} {...ol} strokeWidth={5} />
      {e === "yawn" ? (
        <g>
          <path d="M-30,40 Q0,112 30,40 Q0,30 -30,40 Z" fill={INK} {...ol} strokeWidth={6} />
          <ellipse cx={0} cy={72} rx={15} ry={9} fill={POP.pink} />
        </g>
      ) : e === "sleep" ? (
        <path d="M-16,44 Q-8,52 0,44 Q8,52 16,44" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      ) : (
        <path d="M0,35 L0,44 M-16,50 Q-8,44 0,44 Q8,44 16,50" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      )}
      {/* whiskers */}
      {[-1, 1].map((d) => [-8, 8].map((o) => <path key={`${d}${o}`} d={`M${d * 44},${38 + o * 0.4} L${d * 96},${34 + o * 2}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />))}
      {e === "sleep" && (
        <g fill={INK} fontFamily="Arial Black, Arial, sans-serif" fontWeight={900}>
          {[0, 1, 2].map((i) => {
            const t = ((frame / 45 + i / 3) % 1);
            return (
              <text key={i} x={80 + t * 40} y={-70 - t * 90} fontSize={36 + i * 8} opacity={1 - t}>
                Z
              </text>
            );
          })}
        </g>
      )}
    </g>
  );
};

const Ears: React.FC<{ look: CatLook }> = ({ look }) => (
  <g>
    {[-1, 1].map((d) => (
      <g key={d}>
        <path d={`M${d * 24},-74 L${d * 74},-130 L${d * 86},-40 Z`} fill={look.fur} {...ol} />
        <path d={`M${d * 46},-72 L${d * 72},-102 L${d * 78},-62 Z`} fill={POP.pink} />
      </g>
    ))}
  </g>
);

const Head: React.FC<{ look: CatLook; e: CatExpr; blink: boolean; frame: number }> = ({ look, e, blink, frame }) => (
  <g>
    <Ears look={look} />
    <ellipse cx={0} cy={0} rx={92} ry={82} fill={look.fur} {...ol} />
    {/* forehead stripes */}
    {[-22, 0, 22].map((x) => (
      <path key={x} d={`M${x},-80 L${x * 0.8},-52`} stroke={look.stripe} strokeWidth={9} strokeLinecap="round" />
    ))}
    <CatFace e={e} look={look} blink={blink} frame={frame} />
  </g>
);

export const ToonCat: React.FC<{
  x: number;
  y: number;
  scale?: number;
  look?: CatLook;
  pose?: CatPose;
  expr?: CatExpr;
  id?: string;
  seed?: number;
  /** Walking cat faces right by default; flip to face left. */
  flip?: boolean;
}> = ({ x, y, scale = 1, look = CAT_ORANGE, pose = "sit", expr = "neutral", seed = 0, flip = false }) => {
  const f = useCurrentFrame();
  const blink = (f + seed * 37) % 120 < 4;
  const breathe = Math.sin(f / (expr === "sleep" ? 18 : 14) + seed) * (expr === "sleep" ? 4 : 2);
  const tailSwish = Math.sin(f / 16 + seed) * 14;

  if (pose === "walk") {
    const step = f / 5 + seed;
    const legs = [
      { x: 90, p: 0 },
      { x: 55, p: Math.PI },
      { x: -70, p: Math.PI },
      { x: -105, p: 0 },
    ];
    return (
      <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * scale},${scale})`}>
        {/* Tail up and curled */}
        <path d={`M-140,-150 Q-210,-170 -200,-250 Q-196,-300 ${-176 + tailSwish},-310`} fill="none" stroke={INK} strokeWidth={36} strokeLinecap="round" />
        <path d={`M-140,-150 Q-210,-170 -200,-250 Q-196,-300 ${-176 + tailSwish},-310`} fill="none" stroke={look.fur} strokeWidth={20} strokeLinecap="round" />
        {legs.map((l, i) => {
          const sw = Math.sin(step + l.p) * 22;
          const lift = Math.max(0, Math.cos(step + l.p)) * 14;
          return (
            <g key={i}>
              <path d={`M${l.x},-110 L${l.x + sw},${-24 - lift}`} stroke={INK} strokeWidth={36} strokeLinecap="round" />
              <path d={`M${l.x},-110 L${l.x + sw},${-24 - lift}`} stroke={look.fur} strokeWidth={20} strokeLinecap="round" />
              <ellipse cx={l.x + sw + 8} cy={-14 - lift} rx={26} ry={14} fill={look.white} {...ol} strokeWidth={6} />
            </g>
          );
        })}
        <g transform={`translate(0,${Math.abs(Math.sin(step)) * -4})`}>
          <ellipse cx={-10} cy={-150} rx={160} ry={64} fill={look.fur} {...ol} />
          <path d="M-20,-92 Q60,-80 120,-120 Q60,-108 -20,-92 Z" fill={look.white} />
          {[-90, -50, -10].map((sx) => (
            <path key={sx} d={`M${sx},-208 L${sx + 6},-176`} stroke={look.stripe} strokeWidth={9} strokeLinecap="round" />
          ))}
          <g transform="translate(150,-196) scale(0.82)">
            <Head look={look} e={expr} blink={blink} frame={f} />
          </g>
          {look.antenna && <Antenna x={112} y={-258} frame={f} seed={seed} />}
        </g>
      </g>
    );
  }

  // Sitting, front view
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * scale},${scale})`}>
      {/* Tail curling round the right side */}
      <path d={`M70,-40 Q190,-30 170,-130 Q${160 + tailSwish},-190 ${120 + tailSwish},-176`} fill="none" stroke={INK} strokeWidth={38} strokeLinecap="round" />
      <path d={`M70,-40 Q190,-30 170,-130 Q${160 + tailSwish},-190 ${120 + tailSwish},-176`} fill="none" stroke={look.fur} strokeWidth={22} strokeLinecap="round" />
      {/* Body */}
      <path d="M-86,-36 C-120,-120 -84,-220 -40,-232 L40,-232 C84,-220 120,-120 86,-36 Q0,-14 -86,-36 Z" fill={look.fur} {...ol} />
      <path d="M-40,-228 C-52,-170 -40,-90 -36,-30 Q0,-20 36,-30 C40,-90 52,-170 40,-228 Z" fill={look.white} />
      {[-70, -50].map((sx, i) => (
        <path key={i} d={`M${sx - 18},${-120 + i * 36} L${sx + 8},${-124 + i * 36}`} stroke={look.stripe} strokeWidth={9} strokeLinecap="round" />
      ))}
      {/* Front paws */}
      {[-1, 1].map((d) => (
        <ellipse key={d} cx={d * 36} cy={-18} rx={30} ry={18} fill={look.white} {...ol} strokeWidth={6} />
      ))}
      <g transform={`translate(0,${-262 + breathe}) rotate(${expr === "sleep" ? 8 : 0})`}>
        <Head look={look} e={expr} blink={blink} frame={f} />
        {look.antenna && <Antenna x={-30} y={-76} frame={f} seed={seed} />}
      </g>
    </g>
  );
};
