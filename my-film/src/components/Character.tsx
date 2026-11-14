import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";

export type Pose = {
  /** Walk cycle phase in radians; advance ~2π every 30 frames while walking. */
  walkPhase?: number;
  /** 0 = standing still, 1 = full walk stride. */
  walk?: number;
  /** +1 = worried (inner brow ends up), -1 = angry/determined (inner ends down). */
  brow?: number;
  /** Raise both brows (surprise), 0..1. */
  browRaise?: number;
  /** +1 smile, -1 frown. */
  mouth?: number;
  /** Where the hands are: "hang" (by sides) or a hand height above the feet in px. */
  handsY?: number | "hang";
  /** Squash (<1) / stretch (>1), applied from the feet. */
  squash?: number;
  /** Horizontal look offset of the face features. */
  look?: number;
  /** Draw something held in both hands (e.g. a dumbbell), centred between them. */
  held?: React.ReactNode;
};

const LEG = 120;
const TORSO_H = 120;
const TORSO_W = 92;
const HEAD_R = 88;
const LIMB = 15;

/**
 * The hero, or (variant="shadow") his inner voice: same body, pure black,
 * glowing accent outline, slit eyes. Origin = point between the feet on the floor.
 */
export const Character: React.FC<
  Pose & { x: number; y: number; scale?: number; variant?: "hero" | "shadow"; seed?: number }
> = ({
  x,
  y,
  scale = 1,
  variant = "hero",
  walkPhase = 0,
  walk = 0,
  brow = 0,
  browRaise = 0,
  mouth = 0,
  handsY = "hang",
  squash = 1,
  look = 10,
  held,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const isShadow = variant === "shadow";
  const body = isShadow ? C.shadow : C.hero;

  const breathe = 1 + 0.018 * Math.sin((frame + seed * 13) / 14);
  const bob = walk * Math.abs(Math.sin(walkPhase)) * 7;
  const hipY = -LEG - bob;
  const torsoTop = hipY - TORSO_H * breathe;
  const shoulderY = torsoTop + 28;
  const headY = torsoTop - HEAD_R * 0.62; // head sits right on the body: no neck

  // Noodle limb: quadratic curve that bends sideways by `bend`.
  const limb = (x1: number, y1: number, x2: number, y2: number, bend: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    return `M${x1},${y1} Q${mx + nx * bend},${my + ny * bend} ${x2},${y2}`;
  };

  const legs = [0, Math.PI].map((off) => {
    const p = walkPhase + off;
    const fx = Math.sin(p) * 42 * walk;
    const lift = Math.max(0, Math.cos(p)) * 22 * walk;
    return limb(off ? -14 : 14, hipY + 4, fx + (off ? -14 : 14), -lift, 10 + 8 * walk);
  });

  const hands =
    handsY === "hang"
      ? [-1, 1].map((s) => {
          const swing = Math.sin(walkPhase + (s > 0 ? Math.PI : 0)) * 38 * walk;
          const sway = Math.sin((frame + seed * 7) / 22) * 3;
          return [s * 30 + swing + sway, shoulderY + 125] as const;
        })
      : [-1, 1].map((s) => [s * 46 + 18, -handsY] as const);

  const arms = hands.map(([hx, hy], i) => {
    const s = i === 0 ? -1 : 1;
    return limb(s * (TORSO_W / 2 - 10), shoulderY, hx, hy, s * 16);
  });

  // Blink every ~3.5 s for 4 frames.
  const blinkT = (frame + seed * 31) % 105;
  const eyeScale = blinkT < 4 ? 0.15 : 1;

  const limbPaths = [...legs, ...arms];
  const outline = isShadow ? C.accent : "none";

  // Brows: inner end moves up when worried, down when angry.
  const browY = -26 - browRaise * 10;
  const browLine = (ex: number, inner: number) => {
    const half = 15;
    const innerY = browY - brow * 8;
    const outerY = browY + brow * 8;
    const ix = ex + inner * half;
    const ox = ex - inner * half;
    return `M${ox},${outerY} L${ix},${innerY}`;
  };
  const eyeL = -24 + look;
  const eyeR = 24 + look;

  return (
    <g
      transform={`translate(${x},${y}) scale(${scale / Math.sqrt(squash)},${scale * squash})`}
      style={isShadow ? { filter: `drop-shadow(0 0 10px ${C.accent}) drop-shadow(0 0 24px ${C.accent}88)` } : undefined}
    >
      {/* limbs: accent outline underneath for the shadow */}
      {isShadow &&
        limbPaths.map((d, i) => (
          <path key={`o${i}`} d={d} stroke={outline} strokeWidth={LIMB + 5} strokeLinecap="round" fill="none" />
        ))}
      {limbPaths.slice(0, 2).map((d, i) => (
        <path key={`l${i}`} d={d} stroke={body} strokeWidth={LIMB} strokeLinecap="round" fill="none" />
      ))}
      {/* torso */}
      <rect
        x={-TORSO_W / 2}
        y={torsoTop}
        width={TORSO_W}
        height={hipY - torsoTop + 12}
        rx={40}
        fill={body}
        stroke={outline}
        strokeWidth={isShadow ? 2.5 : 0}
      />
      {/* head */}
      <circle cx={0} cy={headY} r={HEAD_R} fill={body} stroke={outline} strokeWidth={isShadow ? 2.5 : 0} />
      {/* face */}
      <g transform={`translate(0,${headY})`}>
        {isShadow ? (
          <>
            <ellipse cx={eyeL} cy={-4} rx={16} ry={3.2 * eyeScale + 0.5} fill={C.accent} transform={`rotate(14 ${eyeL} -4)`} />
            <ellipse cx={eyeR} cy={-4} rx={16} ry={3.2 * eyeScale + 0.5} fill={C.accent} transform={`rotate(-14 ${eyeR} -4)`} />
          </>
        ) : (
          <>
            <ellipse cx={eyeL} cy={-2} rx={7} ry={7 * eyeScale} fill={C.face} />
            <ellipse cx={eyeR} cy={-2} rx={7} ry={7 * eyeScale} fill={C.face} />
            <path d={browLine(eyeL, 1)} stroke={C.face} strokeWidth={5.5} strokeLinecap="round" />
            <path d={browLine(eyeR, -1)} stroke={C.face} strokeWidth={5.5} strokeLinecap="round" />
            <path
              d={`M${look - 18},34 Q${look},${34 + mouth * 13} ${look + 18},34`}
              stroke={C.face}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </g>
      {/* held object goes between the hands, in front of the body */}
      {held && <g transform={`translate(${(hands[0][0] + hands[1][0]) / 2},${(hands[0][1] + hands[1][1]) / 2})`}>{held}</g>}
      {limbPaths.slice(2).map((d, i) => (
        <path key={`a${i}`} d={d} stroke={body} strokeWidth={LIMB} strokeLinecap="round" fill="none" />
      ))}
    </g>
  );
};
