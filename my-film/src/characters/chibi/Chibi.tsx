// The new channel's main character: a big-eyed chibi kid, drawn flat in 2D (SVG) so it can stand
// inside the 3D worlds. Original design. The BASE (face, eyes, hair, body) stays the same in every
// Short; the OUTFIT (clothes + hat) changes to match each story.
import React from "react";
import { useCurrentFrame } from "remotion";

const LINE = "#2B1B12"; // warm dark-brown ink for outlines
const OW = 7; // outline width at scale 1

export type Base = {
  skin: string;
  cheek: string;
  hair: string;
  eye: string; // iris colour
  hairStyle: "bob" | "spiky" | "buns";
  freckles?: boolean;
};

export type Outfit = {
  coat: string;
  coatDark: string;
  trousers: string;
  boots: string;
  /** Extra drawing on the torso (buttons, straps, pockets), in torso coordinates. */
  torso?: React.ReactNode;
  /** Something at the neck (neckerchief, bow tie, collar). */
  neck?: React.ReactNode;
  hat?: "captain" | "pith" | "newsboy" | "tricorn" | "none";
  hatColor?: string;
  hatTrim?: string;
};

export type Mood = "neutral" | "happy" | "shock" | "worried";

const ol = { stroke: LINE, strokeWidth: OW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Back hair: drawn behind the head. */
const HairBack: React.FC<{ b: Base }> = ({ b }) => {
  if (b.hairStyle === "bob")
    return <path d="M-150,-330 C-160,-470 160,-470 150,-330 L150,-245 C120,-225 95,-240 90,-260 L-90,-260 C-95,-240 -120,-225 -150,-245 Z" fill={b.hair} {...ol} />;
  if (b.hairStyle === "buns")
    return (
      <g>
        <circle cx={-118} cy={-445} r={46} fill={b.hair} {...ol} />
        <circle cx={118} cy={-445} r={46} fill={b.hair} {...ol} />
        <path d="M-146,-330 C-155,-470 155,-470 146,-330 L140,-300 L-140,-300 Z" fill={b.hair} {...ol} />
      </g>
    );
  return <path d="M-145,-330 C-150,-470 150,-470 145,-330 L-145,-330 Z" fill={b.hair} {...ol} />;
};

/** Front hair: bangs over the forehead. */
const HairFront: React.FC<{ b: Base; hatOn: boolean }> = ({ b, hatOn }) => {
  if (b.hairStyle === "spiky")
    return (
      <path
        d={
          hatOn
            ? "M-128,-395 L-100,-355 L-80,-392 L-50,-352 L-25,-390 L5,-350 L30,-390 L58,-352 L85,-392 L105,-355 L130,-395 C110,-445 -110,-445 -128,-395 Z"
            : "M-135,-380 L-120,-445 L-95,-405 L-80,-470 L-50,-418 L-25,-482 L5,-420 L30,-480 L55,-415 L85,-468 L100,-405 L125,-445 L135,-380 L105,-350 L80,-388 L50,-348 L25,-388 L-5,-346 L-30,-388 L-58,-350 L-85,-390 L-108,-350 Z"
        }
        fill={b.hair}
        {...ol}
      />
    );
  if (b.hairStyle === "buns") return <path d="M-130,-370 C-120,-450 120,-450 130,-370 C95,-390 60,-360 20,-395 C-10,-360 -70,-395 -130,-370 Z" fill={b.hair} {...ol} />;
  // bob: a soft fringe swept to one side
  return <path d="M-138,-360 C-130,-455 130,-455 138,-360 C100,-380 40,-372 0,-405 C-30,-372 -90,-392 -138,-360 Z" fill={b.hair} {...ol} />;
};

const Eyes: React.FC<{ b: Base; mood: Mood; blink: boolean; look: number }> = ({ b, mood, blink, look }) => {
  const ry = mood === "shock" ? 44 : 38;
  return (
    <g>
      {[-1, 1].map((d) => {
        const cx = d * 55 + look;
        if (blink || mood === "happy")
          return <path key={d} d={`M${cx - 28},-318 Q${cx},-${mood === "happy" ? 348 : 300} ${cx + 28},-318`} fill="none" {...ol} strokeWidth={8} />;
        return (
          <g key={d}>
            <ellipse cx={cx} cy={-320} rx={32} ry={ry} fill="#FFFFFF" {...ol} strokeWidth={6} />
            <ellipse cx={cx + look * 0.15} cy={-316} rx={mood === "shock" ? 16 : 25} ry={mood === "shock" ? 20 : 31} fill={b.eye} />
            <ellipse cx={cx + look * 0.15} cy={-314} rx={mood === "shock" ? 8 : 13} ry={mood === "shock" ? 10 : 17} fill={LINE} />
            <circle cx={cx + look * 0.15 - 9} cy={-330} r={mood === "shock" ? 5 : 9} fill="#FFFFFF" />
            <circle cx={cx + look * 0.15 + 9} cy={-302} r={4} fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
};

const Face: React.FC<{ b: Base; mood: Mood; blink: boolean; look: number }> = ({ b, mood, blink, look }) => {
  const browY = mood === "shock" ? -392 : mood === "worried" ? -380 : -376;
  return (
    <g>
      {[-1, 1].map((d) => (
        <ellipse key={d} cx={d * 88 + look * 0.5} cy={-275} rx={24} ry={13} fill={b.cheek} opacity={0.75} />
      ))}
      {b.freckles &&
        [-1, 1].map((d) => (
          <g key={`f${d}`} fill={LINE} opacity={0.45}>
            <circle cx={d * 80 + look * 0.5} cy={-290} r={3} />
            <circle cx={d * 94 + look * 0.5} cy={-284} r={3} />
            <circle cx={d * 86 + look * 0.5} cy={-276} r={3} />
          </g>
        ))}
      {/* Brows: tilt with mood */}
      {[-1, 1].map((d) => {
        const inner = mood === "worried" ? -10 : mood === "shock" ? -6 : 0;
        return <path key={`b${d}`} d={`M${d * 30 + look},${browY + inner} L${d * 78 + look},${browY + (mood === "worried" ? 8 : -2)}`} fill="none" {...ol} strokeWidth={8} />;
      })}
      <Eyes b={b} mood={mood} blink={blink} look={look} />
      {/* Mouth */}
      {mood === "shock" ? (
        <ellipse cx={look} cy={-262} rx={14} ry={18} fill="#7A2A22" {...ol} strokeWidth={5} />
      ) : mood === "happy" ? (
        <path d={`M${look - 26},-272 Q${look},-238 ${look + 26},-272 Z`} fill="#7A2A22" {...ol} strokeWidth={5} />
      ) : mood === "worried" ? (
        <path d={`M${look - 16},-258 Q${look},-270 ${look + 16},-258`} fill="none" {...ol} strokeWidth={6} />
      ) : (
        <path d={`M${look - 16},-268 Q${look},-256 ${look + 16},-268`} fill="none" {...ol} strokeWidth={6} />
      )}
    </g>
  );
};

const Hat: React.FC<{ o: Outfit }> = ({ o }) => {
  const c = o.hatColor ?? "#22324F";
  const t = o.hatTrim ?? "#D9A93A";
  switch (o.hat) {
    case "captain":
      return (
        <g>
          <path d="M-150,-420 C-150,-520 150,-520 150,-420 Z" fill={c} {...ol} />
          <rect x={-140} y={-428} width={280} height={30} rx={8} fill="#FFFFFF" {...ol} />
          <path d="M-120,-400 Q0,-360 120,-400 Q0,-382 -120,-400 Z" fill={LINE} {...ol} strokeWidth={5} />
          <path d="M-12,-470 L0,-488 L12,-470 L4,-470 L4,-452 L-4,-452 L-4,-470 Z" fill={t} />
          <path d="M-36,-455 Q0,-440 36,-455" fill="none" stroke={t} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case "pith":
      return (
        <g>
          <ellipse cx={0} cy={-412} rx={190} ry={36} fill={c} {...ol} />
          <path d="M-138,-415 C-138,-540 138,-540 138,-415 Z" fill={c} {...ol} />
          <path d="M-136,-432 Q0,-412 136,-432" fill="none" stroke={t} strokeWidth={14} />
          <circle cx={0} cy={-505} r={10} fill={t} {...ol} strokeWidth={4} />
        </g>
      );
    case "newsboy":
      return (
        <g>
          <path d="M-150,-405 C-170,-520 170,-520 150,-405 Z" fill={c} {...ol} />
          <path d="M-60,-410 Q60,-395 175,-385 Q120,-360 -40,-385 Z" fill={c} {...ol} />
          <circle cx={0} cy={-505} r={11} fill={c} {...ol} strokeWidth={4} />
          <path d="M0,-500 L-70,-415 M0,-500 L70,-415" stroke={LINE} strokeWidth={4} opacity={0.5} />
        </g>
      );
    case "tricorn":
      return (
        <g>
          <path d="M-190,-420 Q-100,-520 0,-470 Q100,-520 190,-420 Q100,-445 0,-410 Q-100,-445 -190,-420 Z" fill={c} {...ol} />
          <path d="M-175,-423 Q-100,-450 0,-415 Q100,-450 175,-423" fill="none" stroke={t} strokeWidth={8} />
        </g>
      );
    default:
      return null;
  }
};

/**
 * The character. Origin = between the feet. About 540 px tall at scale 1 (head ≈ half the height).
 */
export const Chibi: React.FC<{
  x: number;
  y: number;
  scale?: number;
  base: Base;
  outfit: Outfit;
  mood?: Mood;
  look?: number;
  /** Raise the arms: 0 = hanging, 1 = up in surprise or joy. */
  armsUp?: number;
  seed?: number;
  flip?: boolean;
}> = ({ x, y, scale = 1, base, outfit, mood = "neutral", look = 0, armsUp = 0, seed = 0, flip = false }) => {
  const f = useCurrentFrame();
  const breathe = 1 + 0.012 * Math.sin(f / 14 + seed);
  const blink = (f + seed * 23) % 110 < 4;
  const hatOn = outfit.hat !== undefined && outfit.hat !== "none";
  const hand = (d: number): [number, number] => {
    const down: [number, number] = [d * 92, -112];
    const up: [number, number] = [d * 128, -300];
    return [down[0] + (up[0] - down[0]) * armsUp, down[1] + (up[1] - down[1]) * armsUp];
  };
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * scale},${scale})`}>
      <g transform={`scale(1,${breathe})`}>
        {/* Legs and boots */}
        {[-1, 1].map((d) => (
          <g key={d}>
            <rect x={d * 30 - 19} y={-100} width={38} height={78} rx={14} fill={outfit.trousers} {...ol} />
            <rect x={d * 30 - 26 + d * 8} y={-32} width={52} height={32} rx={14} fill={outfit.boots} {...ol} />
          </g>
        ))}
        {/* Arms (behind torso), thick rounded sleeves with round hands */}
        {[-1, 1].map((d) => {
          const [hx, hy] = hand(d);
          const path = `M${d * 52},-200 Q${d * 85},${(-200 + hy) / 2} ${hx},${hy}`;
          return (
            <g key={`a${d}`}>
              <path d={path} fill="none" stroke={LINE} strokeWidth={42} strokeLinecap="round" />
              <path d={path} fill="none" stroke={outfit.coat} strokeWidth={42 - OW * 2} strokeLinecap="round" />
              <circle cx={hx} cy={hy} r={19} fill={base.skin} {...ol} />
            </g>
          );
        })}
        {/* Torso: a soft bell shape = the coat */}
        <path d="M-58,-222 C-70,-160 -84,-120 -82,-88 Q0,-70 82,-88 C84,-120 70,-160 58,-222 Q0,-236 -58,-222 Z" fill={outfit.coat} {...ol} />
        <g>{outfit.torso}</g>
        {/* Neck shadow and neck item */}
        <g>{outfit.neck}</g>
        {/* Head */}
        <g transform={`translate(0,${-2 * Math.sin(f / 14 + seed)})`}>
          {!hatOn || base.hairStyle !== "spiky" ? <HairBack b={base} /> : null}
          <ellipse cx={0} cy={-330} rx={142} ry={130} fill={base.skin} {...ol} />
          {/* Ears */}
          {[-1, 1].map((d) => (
            <ellipse key={d} cx={d * 140} cy={-318} rx={20} ry={26} fill={base.skin} {...ol} />
          ))}
          <ellipse cx={0} cy={-330} rx={135} ry={123} fill={base.skin} />
          <Face b={base} mood={mood} blink={blink} look={look} />
          <HairFront b={base} hatOn={hatOn} />
          <Hat o={outfit} />
        </g>
      </g>
    </g>
  );
};

// ---------------- Three base designs ----------------
export const BASES: Record<string, Base> = {
  /** A: dark bob with a side fringe, brown eyes. */
  pip: { skin: "#F7D9BF", cheek: "#F29A8B", hair: "#3B2618", eye: "#7A4A26", hairStyle: "bob" },
  /** B: messy ginger spikes, freckles, green eyes. */
  rusty: { skin: "#F9DCC3", cheek: "#F0907E", hair: "#D2652D", eye: "#3E8A5A", hairStyle: "spiky", freckles: true },
  /** C: black hair in two buns, warm skin, deep brown eyes. */
  mei: { skin: "#EBC29E", cheek: "#E98778", hair: "#1E1A22", eye: "#4A2C1A", hairStyle: "buns" },
};

// ---------------- Outfits (swap per story) ----------------
const Buttons: React.FC<{ color: string; xs: number[]; ys: number[] }> = ({ color, xs, ys }) => (
  <g>
    {xs.map((x) => ys.map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={7} fill={color} stroke={LINE} strokeWidth={3} />))}
  </g>
);

export const OUTFITS: Record<string, Outfit> = {
  captain: {
    coat: "#24375E",
    coatDark: "#1A2846",
    trousers: "#F1EDE2",
    boots: "#2A1D16",
    hat: "captain",
    hatColor: "#24375E",
    torso: (
      <g>
        <path d="M0,-218 L0,-80" stroke={LINE} strokeWidth={4} opacity={0.5} />
        <Buttons color="#E3B341" xs={[-22, 22]} ys={[-180, -145, -110]} />
        <path d="M-80,-100 L80,-100" stroke="#E3B341" strokeWidth={6} opacity={0.0} />
      </g>
    ),
    neck: <path d="M-34,-226 L0,-180 L34,-226 Z" fill="#D7263D" {...ol} strokeWidth={5} />,
  },
  explorer: {
    coat: "#C8AE78",
    coatDark: "#A48C5A",
    trousers: "#7A5A3A",
    boots: "#4A2E1C",
    hat: "pith",
    hatColor: "#E8D7A8",
    hatTrim: "#7A5A3A",
    torso: (
      <g>
        <path d="M-50,-222 L60,-90" stroke="#6B4423" strokeWidth={14} strokeLinecap="round" />
        <rect x={-62} y={-172} width={36} height={30} rx={5} fill="#B79A62" {...ol} strokeWidth={4} />
        <rect x={-84} y={-104} width={168} height={14} fill="#6B4423" {...ol} strokeWidth={4} />
        <rect x={-10} y={-108} width={20} height={22} fill="#D9A93A" {...ol} strokeWidth={3} />
      </g>
    ),
    neck: <path d="M-30,-228 L-6,-200 L0,-228 L6,-200 L30,-228" fill="#E9E2CF" {...ol} strokeWidth={4} />,
  },
  inventor: {
    coat: "#2F5D4A",
    coatDark: "#244839",
    trousers: "#5B4636",
    boots: "#2A1D16",
    hat: "newsboy",
    hatColor: "#6E6A64",
    torso: (
      <g>
        <path d="M-30,-224 L0,-150 L30,-224 Z" fill="#F4EFE4" {...ol} strokeWidth={4} />
        <Buttons color="#D9A93A" xs={[0]} ys={[-135, -110]} />
        <path d="M44,-150 Q60,-140 52,-120" fill="none" stroke="#D9A93A" strokeWidth={4} />
        <circle cx={52} cy={-118} r={9} fill="#D9A93A" stroke={LINE} strokeWidth={3} />
      </g>
    ),
    neck: <path d="M-22,-212 L0,-202 L22,-212 L22,-190 L0,-200 L-22,-190 Z" fill="#D7263D" {...ol} strokeWidth={4} />,
  },
  pirate: {
    coat: "#8C2B2B",
    coatDark: "#6E2020",
    trousers: "#2E2A26",
    boots: "#1E1612",
    hat: "tricorn",
    hatColor: "#1E1A1A",
    hatTrim: "#D9A93A",
    torso: <Buttons color="#D9A93A" xs={[-24, 24]} ys={[-180, -140]} />,
    neck: <path d="M-30,-226 L0,-196 L30,-226 Z" fill="#F4EFE4" {...ol} strokeWidth={4} />,
  },
};
