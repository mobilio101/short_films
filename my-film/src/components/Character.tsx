import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";

export type Skin = {
  body: string;
  outline: string;
  outlineWidth: number;
  face: string;
  glow?: string;
  /** Extra CSS filter on the whole character (texture, drop shadow...). */
  filter?: string;
};

export const HERO_SKIN: Skin = { body: C.hero, outline: "none", outlineWidth: 0, face: C.face };
export const SHADOW_SKIN: Skin = { body: C.shadow, outline: C.accent, outlineWidth: 2.5, face: C.accent, glow: C.accent };

type Pt = [number, number];

export type Pose = {
  /** Walk cycle phase in radians; advance ~2π every 30 frames while walking. */
  walkPhase?: number;
  /** 0 = standing still, 1 = full walk stride. */
  walk?: number;
  /** +1 = worried (inner brow ends up), -1 = angry/determined (inner ends down). */
  brow?: number;
  /** Raise both brows (surprise), 0..1. */
  browRaise?: number;
  /** +1 smile, -1 frown (shape of the mouth line, and the curve of open mouths). */
  mouth?: number;
  /** Where the hands are: "hang" (by sides) or a hand height above the feet in px. */
  handsY?: number | "hang";
  /** Squash (<1) / stretch (>1), applied from the feet. */
  squash?: number;
  /** Horizontal look offset of the face features (positive = facing right). */
  look?: number;
  /** Draw something held in both hands (e.g. a dumbbell), centred between them. */
  held?: React.ReactNode;
  /** Identifying shape drawn on the head (hat, hair, helmet), in head coordinates: head radius 88, centre at 0,0. */
  hat?: React.ReactNode;
  /** Something drawn on the chest (badge, medal), in torso coordinates: 0,0 is the top of the torso. */
  chest?: React.ReactNode;

  // ---- Acting ----
  /** Eye shape: dot (normal), wide (shock/fear), squint (strain/laughing hard), happy (∩), closed (∪, sad/asleep), glare (angry slits). */
  eyes?: "dot" | "wide" | "squint" | "happy" | "closed" | "glare";
  /** Mouth shape: line (uses `mouth` curve), open, shout (huge D), teeth (gritted), wobble (trembling), o (small gasp). */
  mouthShape?: "line" | "open" | "shout" | "teeth" | "wobble" | "o";
  /** How open an open/shout mouth is, 0..1. */
  mouthOpen?: number;
  /** Tears streaming, 0..1. */
  tears?: number;
  /** Sweat drop, 0..1. */
  sweat?: number;
  /** Cartoon marks around the head. */
  fx?: "shock" | "anger" | "gloom" | "sparkle" | "none";
  /** Lean the upper body, degrees (positive = forward to the right). */
  lean?: number;
  /** Tilt the head, degrees. */
  headTilt?: number;
  /** 0 = standing, 1 = on knees. */
  kneel?: number;
  /** Lift off the ground (jumps), px. */
  jump?: number;
  /** Tremble amount, px. */
  shake?: number;
  /** Explicit hand positions (relative to the feet; y negative is up). Overrides handsY for that hand. */
  hands?: { l?: Pt; r?: Pt };
  /** Draw clenched fists. */
  fists?: boolean;
};

const LEG = 120;
const TORSO_H = 120;
const TORSO_W = 92;
const HEAD_R = 88;
const LIMB = 15;

/** Ready-made acting poses. Combine with a skin, hat and position; override anything you like. */
export const EMOTE: Record<string, Pose> = {
  neutral: {},
  joy: { eyes: "happy", mouthShape: "open", mouthOpen: 0.9, mouth: 1, browRaise: 0.7, hands: { l: [-110, -470], r: [110, -470] }, fx: "sparkle" },
  shock: { eyes: "wide", mouthShape: "o", browRaise: 1, lean: -10, hands: { l: [-120, -320], r: [120, -320] }, fx: "shock" },
  despair: { eyes: "closed", mouthShape: "wobble", brow: 1, kneel: 1, tears: 1, hands: { l: [-80, -255], r: [80, -255] }, fx: "gloom", headTilt: 6 },
  rage: { eyes: "glare", mouthShape: "teeth", brow: -1, lean: 10, fists: true, hands: { l: [-55, -150], r: [70, -150] }, fx: "anger", shake: 2 },
  fear: { eyes: "wide", mouthShape: "wobble", brow: 1, browRaise: 0.4, lean: -12, kneel: 0.35, sweat: 1, hands: { l: [-10, -250], r: [50, -250] }, fists: true, shake: 3 },
  smug: { eyes: "closed", mouth: 0.9, brow: -0.3, lean: -7, headTilt: -8, hands: { l: [-85, -165], r: [85, -165] } },
  sad: { mouth: -1, brow: 1, headTilt: 10, squash: 0.95, eyes: "dot" },
  laugh: { eyes: "squint", mouthShape: "shout", mouthOpen: 0.9, mouth: 1, browRaise: 0.5, lean: -14, hands: { l: [-40, -150], r: [60, -150] }, shake: 2 },
  point: { eyes: "dot", mouthShape: "open", mouthOpen: 0.5, brow: -0.6, lean: 8, hands: { r: [210, -330] } },
  proud: { eyes: "dot", mouth: 0.6, brow: -0.4, lean: -5, hands: { l: [-85, -165], r: [85, -165] }, fx: "sparkle" },
};

/**
 * The hero, or (variant="shadow") his inner voice: same body, pure black,
 * glowing accent outline, slit eyes. Origin = point between the feet on the floor.
 */
export const Character: React.FC<
  Pose & { x: number; y: number; scale?: number; variant?: "hero" | "shadow"; seed?: number; skin?: Skin }
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
  hat,
  chest,
  seed = 0,
  skin,
  eyes = "dot",
  mouthShape = "line",
  mouthOpen = 0.6,
  tears = 0,
  sweat = 0,
  fx = "none",
  lean = 0,
  headTilt = 0,
  kneel = 0,
  jump = 0,
  shake = 0,
  hands: handTargets,
  fists = false,
}) => {
  const frame = useCurrentFrame();
  const isShadow = variant === "shadow";
  const sk = skin ?? (isShadow ? SHADOW_SKIN : HERO_SKIN);
  const body = sk.body;
  const ow = sk.outlineWidth;
  const ink = sk.face;
  const WHITE = "#FFFFFF";

  const tremble = shake ? Math.sin(frame * 2.3 + seed) * shake : 0;
  const breathe = 1 + 0.018 * Math.sin((frame + seed * 13) / 14);
  const bob = walk * Math.abs(Math.sin(walkPhase)) * 7;
  const hipY = -LEG * (1 - 0.5 * kneel) - bob;
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
    const side = off ? -14 : 14;
    const fx_ = Math.sin(p) * 42 * walk + side * (1 + kneel * 2.5);
    const lift = Math.max(0, Math.cos(p)) * 22 * walk;
    return limb(side, hipY + 4, fx_, -lift, (10 + 8 * walk + 70 * kneel) * (off ? -1 : 1));
  });

  const defaultHand = (s: number): Pt => {
    if (handsY === "hang") {
      const swing = Math.sin(walkPhase + (s > 0 ? Math.PI : 0)) * 38 * walk;
      const sway = Math.sin((frame + seed * 7) / 22) * 3;
      return [s * 30 + swing + sway, shoulderY + 125];
    }
    return [s * 46 + 18, -handsY];
  };
  const kneelDrop = (LEG * 0.5 * kneel); // explicit targets are given for standing height; follow the body down
  const hands: Pt[] = [-1, 1].map((s) => {
    const t = s < 0 ? handTargets?.l : handTargets?.r;
    return t ? [t[0], t[1] + kneelDrop] : defaultHand(s);
  });

  const arms = hands.map(([hx, hy], i) => {
    const s = i === 0 ? -1 : 1;
    return limb(s * (TORSO_W / 2 - 10), shoulderY, hx, hy, s * 16);
  });

  // Blink every ~3.5 s for 4 frames.
  const blinkT = (frame + seed * 31) % 105;
  const blink = blinkT < 4 && (eyes === "dot" || eyes === "wide");
  const eyeScale = blink ? 0.15 : 1;

  const outline = sk.outline;

  // Brows: inner end moves up when worried, down when angry.
  const browY = -26 - browRaise * 10 - (eyes === "wide" ? 10 : 0);
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
  const lk = Math.sign(look) * Math.min(5, Math.abs(look) / 3);

  const eye = (ex: number, side: number) => {
    switch (eyes) {
      case "wide":
        return (
          <g key={side}>
            <ellipse cx={ex} cy={-2} rx={17} ry={19 * eyeScale} fill={WHITE} stroke={ink} strokeWidth={4} />
            {!blink && <circle cx={ex + lk} cy={0} r={6} fill={ink} />}
          </g>
        );
      case "squint":
        return <path key={side} d={`M${ex + 10 * side},-10 L${ex - 8 * side},0 L${ex + 10 * side},10`} stroke={ink} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
      case "happy":
        return <path key={side} d={`M${ex - 12},2 Q${ex},-14 ${ex + 12},2`} stroke={ink} strokeWidth={5.5} strokeLinecap="round" fill="none" />;
      case "closed":
        return <path key={side} d={`M${ex - 12},-4 Q${ex},8 ${ex + 12},-4`} stroke={ink} strokeWidth={5.5} strokeLinecap="round" fill="none" />;
      case "glare":
        return <ellipse key={side} cx={ex} cy={0} rx={9} ry={4} fill={ink} transform={`rotate(${side * 14} ${ex} 0)`} />;
      default:
        return <ellipse key={side} cx={ex} cy={-2} rx={7} ry={7 * eyeScale} fill={ink} />;
    }
  };

  const mx = look;
  const mouthEl = (() => {
    switch (mouthShape) {
      case "open":
        return <path d={`M${mx - 20},30 Q${mx},${30 + 8 * mouth} ${mx + 20},30 Q${mx + 18},${34 + mouthOpen * 26} ${mx},${36 + mouthOpen * 30} Q${mx - 18},${34 + mouthOpen * 26} ${mx - 20},30 Z`} fill={ink} />;
      case "shout": {
        const o = mouthOpen;
        return (
          <g>
            <path d={`M${mx - 30},24 L${mx + 30},24 Q${mx + 28},${30 + 40 * o} ${mx},${34 + 46 * o} Q${mx - 28},${30 + 40 * o} ${mx - 30},24 Z`} fill={ink} />
            <rect x={mx - 24} y={25} width={48} height={8} rx={3} fill={WHITE} />
          </g>
        );
      }
      case "teeth":
        return (
          <g>
            <rect x={mx - 27} y={24} width={54} height={20} rx={7} fill={WHITE} stroke={ink} strokeWidth={4} />
            <line x1={mx - 25} y1={34} x2={mx + 25} y2={34} stroke={ink} strokeWidth={3} />
            {[-12, 0, 12].map((d) => (
              <line key={d} x1={mx + d} y1={25} x2={mx + d} y2={43} stroke={ink} strokeWidth={2.5} />
            ))}
          </g>
        );
      case "wobble": {
        const w = Math.sin(frame * 1.4 + seed) * 2;
        const pts = Array.from({ length: 7 }, (_, i) => `${i ? "L" : "M"}${mx - 21 + i * 7},${36 + (i % 2 ? -4 : 4) + w * (i % 2 ? 1 : -1) - mouth * 4 * Math.sin((i / 6) * Math.PI)}`).join(" ");
        return <path d={pts} stroke={ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
      }
      case "o":
        return <ellipse cx={mx} cy={38} rx={10} ry={14} fill={ink} />;
      default:
        return <path d={`M${mx - 18},34 Q${mx},${34 + mouth * 13} ${mx + 18},34`} stroke={ink} strokeWidth={5} strokeLinecap="round" fill="none" />;
    }
  })();

  const tearEls =
    tears > 0
      ? [eyeL, eyeR].flatMap((ex, k) => {
          const side = k ? 1 : -1;
          const els: React.ReactNode[] = [
            <path key={`s${k}`} d={`M${ex + side * 6},8 Q${ex + side * 14},40 ${ex + side * 10},70`} stroke={WHITE} strokeWidth={9 * tears} strokeLinecap="round" fill="none" opacity={0.95} />,
          ];
          for (let j = 0; j < 2; j++) {
            const t = ((frame * 2.2 + j * 30 + k * 13) % 60) / 60;
            els.push(
              <path
                key={`d${k}${j}`}
                d={`M0,-9 Q7,0 0,7 Q-7,0 0,-9 Z`}
                transform={`translate(${ex + side * (12 + t * 22)},${20 + t * 90})`}
                fill={WHITE}
                stroke={ink}
                strokeWidth={2.5}
                opacity={tears * (1 - t)}
              />,
            );
          }
          return els;
        })
      : null;

  const sweatEl =
    sweat > 0 ? (
      <path
        d="M0,-14 Q11,0 0,10 Q-11,0 0,-14 Z"
        transform={`translate(${-look * 2 + (look >= 0 ? -70 : 70)},${-40 + ((frame * 0.6) % 30)}) scale(${sweat})`}
        fill={WHITE}
        stroke={ink}
        strokeWidth={3}
      />
    ) : null;

  const fxEl = (() => {
    const pulse = 1 + 0.12 * Math.sin(frame * 0.6);
    switch (fx) {
      case "shock":
        return (
          <g>
            {[-70, -40, -10, 20, 50].map((a, i) => {
              const r = (a * Math.PI) / 180 - Math.PI / 2;
              return <line key={i} x1={Math.cos(r) * 110 * pulse} y1={Math.sin(r) * 110 * pulse} x2={Math.cos(r) * 150 * pulse} y2={Math.sin(r) * 150 * pulse} stroke={ink} strokeWidth={6} strokeLinecap="round" />;
            })}
          </g>
        );
      case "anger":
        return (
          <g transform={`translate(${look >= 0 ? 60 : -60},-70) scale(${pulse})`}>
            {[0, 90, 180, 270].map((r) => (
              <path key={r} d="M6,-24 Q4,-8 22,-6" stroke={ink} strokeWidth={6} strokeLinecap="round" fill="none" transform={`rotate(${r})`} />
            ))}
          </g>
        );
      case "gloom":
        return (
          <g opacity={0.8}>
            {[-40, 0, 40].map((gx, i) => (
              <path key={i} d={`M${gx},-150 q10,15 0,30 t0,30`} stroke={ink} strokeWidth={5} fill="none" transform={`translate(0,${Math.sin(frame / 8 + i) * 4})`} />
            ))}
          </g>
        );
      case "sparkle":
        return (
          <g>
            {[[-120, -60], [115, -90], [100, 40]].map(([sx, sy], i) => {
              const s = 0.6 + 0.4 * Math.abs(Math.sin(frame / 6 + i * 2));
              return <path key={i} d="M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5 Z" transform={`translate(${sx},${sy}) scale(${s})`} fill={WHITE} stroke={ink} strokeWidth={3} />;
            })}
          </g>
        );
      default:
        return null;
    }
  })();

  const fist = (p: Pt, k: number) => (fists ? <circle key={`f${k}`} cx={p[0]} cy={p[1]} r={LIMB * 0.95} fill={body} stroke={ow > 0 ? outline : ink} strokeWidth={ow > 0 ? ow : 3} /> : null);

  return (
    <g
      transform={`translate(${x + tremble},${y - jump}) scale(${scale / Math.sqrt(squash)},${scale * squash})`}
      style={{
        filter:
          [sk.glow ? `drop-shadow(0 0 10px ${sk.glow}) drop-shadow(0 0 24px ${sk.glow}88)` : "", sk.filter ?? ""].join(" ").trim() ||
          undefined,
      }}
    >
      {/* legs (outline underneath first) */}
      {ow > 0 &&
        legs.map((d, i) => <path key={`ol${i}`} d={d} stroke={outline} strokeWidth={LIMB + ow * 2} strokeLinecap="round" fill="none" />)}
      {legs.map((d, i) => (
        <path key={`l${i}`} d={d} stroke={body} strokeWidth={LIMB} strokeLinecap="round" fill="none" />
      ))}
      {/* upper body leans from the hips */}
      <g transform={`rotate(${lean} 0 ${hipY})`}>
        {ow > 0 &&
          arms.map((d, i) => <path key={`oa${i}`} d={d} stroke={outline} strokeWidth={LIMB + ow * 2} strokeLinecap="round" fill="none" />)}
        <rect x={-TORSO_W / 2} y={torsoTop} width={TORSO_W} height={hipY - torsoTop + 12} rx={40} fill={body} stroke={outline} strokeWidth={ow} />
        <g transform={`rotate(${headTilt} 0 ${torsoTop})`}>
          <circle cx={0} cy={headY} r={HEAD_R} fill={body} stroke={outline} strokeWidth={ow} />
          <g transform={`translate(0,${headY})`}>
            {isShadow ? (
              <>
                <ellipse cx={eyeL} cy={-4} rx={16} ry={3.2 * eyeScale + 0.5} fill={sk.face} transform={`rotate(14 ${eyeL} -4)`} />
                <ellipse cx={eyeR} cy={-4} rx={16} ry={3.2 * eyeScale + 0.5} fill={sk.face} transform={`rotate(-14 ${eyeR} -4)`} />
              </>
            ) : (
              <>
                {eye(eyeL, -1)}
                {eye(eyeR, 1)}
                <path d={browLine(eyeL, 1)} stroke={ink} strokeWidth={eyes === "glare" ? 7 : 5.5} strokeLinecap="round" />
                <path d={browLine(eyeR, -1)} stroke={ink} strokeWidth={eyes === "glare" ? 7 : 5.5} strokeLinecap="round" />
                {mouthEl}
                {tearEls}
                {sweatEl}
              </>
            )}
            {hat}
            {fxEl}
          </g>
        </g>
        {chest && <g transform={`translate(0,${torsoTop})`}>{chest}</g>}
        {/* held object goes between the hands, in front of the body */}
        {held && <g transform={`translate(${(hands[0][0] + hands[1][0]) / 2},${(hands[0][1] + hands[1][1]) / 2})`}>{held}</g>}
        {arms.map((d, i) => (
          <path key={`a${i}`} d={d} stroke={body} strokeWidth={LIMB} strokeLinecap="round" fill="none" />
        ))}
        {hands.map((p, i) => fist(p, i))}
      </g>
    </g>
  );
};
