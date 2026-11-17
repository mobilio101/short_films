// The spy cat for "Acoustic Kitty": a flat 2D cartoon cat (orange and white) in the Toon style
// (bold black outlines, flat colours). Film-local stand-in until the shared kit has a cat (asked 총괄).
// Origin = between the feet on the ground. About 300 units tall sitting (ear tips at -300).
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { INK, POP } from "../../characters/toon/Toon";
import { Project, v3 } from "../../world3d/kit";

const FUR = "#FF9A3C";
const FUR2 = "#D9651C"; // stripes
const BELLY = "#FFF6EA";
const PINK = "#FF8FA8";
const ol = { stroke: INK, strokeWidth: 8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type CatPose = "sit" | "walk" | "lick" | "back" | "yawn";
export type CatEyes = "bored" | "wide" | "closed" | "side";

/** Screen spot and scale for the cat sitting at a 3D floor spot (`h` = sitting height in metres). */
export const placeCat = (project: Project, at: THREE.Vector3, h = 0.34) => {
  const feet = project(at);
  const top = project(at.clone().add(v3(0, h, 0)));
  return { x: feet.x, y: feet.y, scale: (feet.y - top.y) / 300 };
};

/** Thick outlined stroke (ink under fur) for tails and legs. */
const Limb: React.FC<{ d: string; w?: number; color?: string }> = ({ d, w = 26, color = FUR }) => (
  <>
    <path d={d} fill="none" stroke={INK} strokeWidth={w + 14} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

/** The spy kit: a wire antenna rising out of the fur at the nape, with a red tip. */
const Antenna: React.FC<{ x: number; y: number; sway: number }> = ({ x, y, sway }) => (
  <g>
    <path d={`M${x},${y} Q${x + 20 + sway},${y - 60} ${x + 32 + sway * 2},${y - 118}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <circle cx={x + 32 + sway * 2} cy={y - 118} r={9} fill={POP.red} {...ol} strokeWidth={4} />
  </g>
);

const Ears: React.FC<{ back?: boolean; mic?: boolean }> = ({ back, mic }) => (
  <>
    {[-1, 1].map((d) => (
      <g key={d}>
        <path d={`M${d * 88},-238 L${d * 74},-322 L${d * 26},-282 Z`} fill={FUR} {...ol} />
        {!back && <path d={`M${d * 76},-252 L${d * 70},-300 L${d * 40},-276 Z`} fill={PINK} />}
      </g>
    ))}
    {mic && (
      // A tiny microphone tucked inside the left ear.
      <g>
        <circle cx={-64} cy={-268} r={11} fill="#B9C3CE" {...ol} strokeWidth={4} />
        <path d="M-70,-272 L-58,-272 M-70,-265 L-58,-265" stroke={INK} strokeWidth={3} />
      </g>
    )}
  </>
);

const HEAD = "M-96,-214 C-96,-272 -52,-292 0,-292 C52,-292 96,-272 96,-214 C96,-166 52,-146 0,-146 C-52,-146 -96,-166 -96,-214 Z";

const Face: React.FC<{ eyes: CatEyes; gaze: number; yawn: number; tongue?: boolean; blink: boolean }> = ({ eyes, gaze, yawn, tongue, blink }) => {
  const shut = eyes === "closed" || yawn > 0.3 || blink;
  return (
    <g>
      {/* forehead stripes */}
      <path d="M-22,-288 L-16,-262 M0,-292 L0,-260 M22,-288 L16,-262" stroke={FUR2} strokeWidth={9} strokeLinecap="round" />
      {/* cheek stripes */}
      {[-1, 1].map((d) => (
        <path key={d} d={`M${d * 96},-214 L${d * 74},-210 M${d * 94},-196 L${d * 74},-196`} stroke={FUR2} strokeWidth={8} strokeLinecap="round" />
      ))}
      <ellipse cx={0} cy={-184} rx={44} ry={30} fill={BELLY} />
      {[-1, 1].map((d) => {
        const cx = d * 38;
        const cy = -224;
        if (shut)
          return <path key={d} d={`M${cx - 18},${cy} Q${cx},${cy + (yawn > 0.3 ? -12 : 10)} ${cx + 18},${cy}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
        const px = eyes === "side" ? 9 : gaze;
        return (
          <g key={d}>
            <ellipse cx={cx} cy={cy} rx={21} ry={24} fill={POP.white} {...ol} strokeWidth={6} />
            <ellipse cx={cx + px} cy={cy + 3} rx={eyes === "wide" ? 12 : 8} ry={eyes === "wide" ? 15 : 17} fill={INK} />
            <circle cx={cx + px - 4} cy={cy - 6} r={4} fill={POP.white} />
            {(eyes === "bored" || eyes === "side") && (
              // Heavy half-closed lids: the cat is not impressed.
              <path d={`M${cx - 24},${cy - 2} Q${cx},${cy - 32} ${cx + 24},${cy - 2} L${cx + 24},${cy - 30} L${cx - 24},${cy - 30} Z`} fill={FUR} />
            )}
            {(eyes === "bored" || eyes === "side") && <path d={`M${cx - 23},${cy - 2} L${cx + 23},${cy - 2}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />}
          </g>
        );
      })}
      {/* nose and mouth */}
      <path d="M-11,-201 L11,-201 L0,-189 Z" fill={PINK} {...ol} strokeWidth={4} />
      {yawn > 0.05 ? (
        <g>
          <ellipse cx={0} cy={-168 + yawn * 6} rx={14 + yawn * 10} ry={6 + yawn * 26} fill="#7A1F2B" {...ol} strokeWidth={6} />
          <ellipse cx={0} cy={-160 + yawn * 18} rx={8 + yawn * 6} ry={4 + yawn * 8} fill={PINK} />
        </g>
      ) : (
        <path d="M-17,-181 Q-8,-172 0,-182 Q8,-172 17,-181" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      )}
      {tongue && <path d="M-6,-178 Q0,-160 6,-178 Z" fill={PINK} stroke={INK} strokeWidth={3} />}
      {/* whiskers */}
      {[-1, 1].map((d) => [0, 1, 2].map((i) => <path key={`${d}${i}`} d={`M${d * 30},${-186 + i * 8} L${d * (98 + i * 4)},${-196 + i * 14}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />))}
    </g>
  );
};

/** A sitting cat seen from the front (or from behind, for "the cat didn't care"). */
const Sitting: React.FC<{ pose: CatPose; eyes: CatEyes; gaze: number; yawn: number; f: number; antenna: boolean; mic: boolean; blink: boolean }> = ({ pose, eyes, gaze, yawn, f, antenna, mic, blink }) => {
  const back = pose === "back";
  const tailSwish = Math.sin(f / 9) * 14;
  const tail = back ? `M-50,-24 C-150,-20 -170,-100 ${-130 + tailSwish},-150` : `M56,-22 C150,-14 172,-92 ${128 + tailSwish},-136`;
  const headTilt = pose === "lick" ? -9 : yawn > 0 ? -6 * yawn : 0;
  return (
    <g>
      <Limb d={tail} w={24} />
      <circle cx={back ? -130 + tailSwish : 128 + tailSwish} cy={back ? -150 : -136} r={13} fill={BELLY} />
      {/* body */}
      <path d="M-72,0 C-98,-62 -84,-150 -46,-178 L46,-178 C84,-150 98,-62 72,0 Z" fill={FUR} {...ol} />
      {!back && <path d="M-34,-172 C-46,-110 -30,-42 0,-32 C30,-42 46,-110 34,-172 Z" fill={BELLY} />}
      {[-1, 1].map((d) => (
        <path key={d} d={`M${d * 84},-60 L${d * 58},-66 M${d * 88},-96 L${d * 62},-100 M${d * 84},-130 L${d * 60},-132`} stroke={FUR2} strokeWidth={9} strokeLinecap="round" />
      ))}
      {back && <path d="M-30,-150 L30,-150 M-36,-110 L36,-110 M-34,-70 L34,-70" stroke={FUR2} strokeWidth={10} strokeLinecap="round" />}
      {/* front paws */}
      {[-1, 1].map((d) =>
        pose === "lick" && d < 0 ? null : <ellipse key={d} cx={d * 28} cy={-12} rx={27} ry={16} fill={back ? FUR : BELLY} {...ol} strokeWidth={6} />,
      )}
      {antenna && <Antenna x={back ? 20 : 44} y={back ? -176 : -270} sway={Math.sin(f / 7) * 4} />}
      <g transform={`rotate(${headTilt} 0 -214)`}>
        <Ears back={back} mic={mic && !back} />
        <path d={HEAD} fill={FUR} {...ol} />
        {back ? (
          <path d="M-30,-280 L-24,-250 M0,-288 L0,-252 M30,-280 L24,-250 M-60,-200 L-40,-190 M60,-200 L40,-190" stroke={FUR2} strokeWidth={9} strokeLinecap="round" />
        ) : (
          <Face eyes={pose === "lick" ? "closed" : eyes} gaze={gaze} yawn={yawn} tongue={pose === "lick"} blink={blink} />
        )}
      </g>
      {pose === "lick" && (
        // Left paw raised to the mouth.
        <g>
          <Limb d="M-46,-110 Q-60,-150 -18,-172" w={24} />
          <ellipse cx={-14} cy={-174} rx={22} ry={16} fill={BELLY} {...ol} strokeWidth={6} />
        </g>
      )}
    </g>
  );
};

/** A walking cat, side view, facing right. */
const Walking: React.FC<{ f: number; antenna: boolean; eyes: CatEyes }> = ({ f, antenna, eyes }) => {
  const ph = f / 4;
  const leg = (x: number, o: number) => {
    const s = Math.sin(ph + o) * 22;
    return <Limb key={x} d={`M${x},-80 L${x + s},-12`} w={20} />;
  };
  const tailSwish = Math.sin(f / 8) * 12;
  return (
    <g transform={`translate(0,${Math.abs(Math.sin(ph)) * -5})`}>
      {leg(-70, Math.PI)}
      {leg(60, 0)}
      <Limb d={`M-100,-112 C-160,-150 -172,-226 ${-130 + tailSwish},-252`} w={22} />
      <path d="M-112,-92 C-112,-142 -60,-152 0,-148 C62,-152 102,-140 106,-100 C110,-70 82,-62 0,-64 C-82,-62 -112,-62 -112,-92 Z" fill={FUR} {...ol} />
      <path d="M-60,-148 L-54,-120 M-20,-150 L-16,-122 M20,-150 L18,-122" stroke={FUR2} strokeWidth={9} strokeLinecap="round" />
      {leg(-40, 0)}
      {leg(86, Math.PI)}
      {antenna && <Antenna x={92} y={-150} sway={Math.sin(f / 6) * 5} />}
      <g transform="translate(140,-168)">
        {[-1, 1].map((d) => (
          <path key={d} d={`M${d * 30 - 4},-40 L${d * 30 + 6},-92 L${d * 30 + 30},-48 Z`} fill={FUR} {...ol} />
        ))}
        <path d="M-58,0 C-58,-40 -30,-58 4,-58 C44,-58 66,-34 66,0 C66,34 40,50 4,50 C-30,50 -58,34 -58,0 Z" fill={FUR} {...ol} />
        <ellipse cx={42} cy={22} rx={28} ry={20} fill={BELLY} />
        <path d="M64,10 L72,16 L62,22 Z" fill={PINK} stroke={INK} strokeWidth={4} />
        {eyes === "closed" ? (
          <path d="M18,-10 Q30,0 42,-10" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        ) : (
          <g>
            <ellipse cx={30} cy={-8} rx={15} ry={18} fill={POP.white} {...ol} strokeWidth={5} />
            <ellipse cx={36} cy={-5} rx={6} ry={12} fill={INK} />
            <path d="M13,-12 Q30,-34 47,-12 L47,-30 L13,-30 Z" fill={FUR} />
            <path d="M14,-12 L46,-12" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </g>
        )}
        {[0, 1].map((i) => <path key={i} d={`M50,${20 + i * 8} L${100 + i * 4},${12 + i * 14}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
      </g>
    </g>
  );
};

export const Cat: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose?: CatPose;
  eyes?: CatEyes;
  gaze?: number;
  /** 0..1, how wide the yawn is. */
  yawn?: number;
  antenna?: boolean;
  mic?: boolean;
  flip?: boolean;
  seed?: number;
}> = ({ x, y, scale = 1, pose = "sit", eyes = "bored", gaze = 0, yawn = 0, antenna = true, mic = false, flip = false, seed = 0 }) => {
  const f = useCurrentFrame() + seed * 17;
  const breathe = 1 + Math.sin(f / 14) * 0.015;
  const blink = (f + seed * 31) % 90 < 4;
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * scale},${scale * breathe})`}>
      {pose === "walk" ? (
        <Walking f={f} antenna={antenna} eyes={eyes} />
      ) : (
        <Sitting pose={pose === "yawn" ? "sit" : pose} eyes={eyes} gaze={gaze} yawn={pose === "yawn" ? Math.max(yawn, 0.01) : yawn} f={f} antenna={antenna} mic={mic} blink={blink} />
      )}
    </g>
  );
};
