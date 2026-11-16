// Four sneaky smiles for the round-headed main character, close-up, each with different shades.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST, Look, POP, Toon } from "../../../characters/toon/Toon";

const T: React.CSSProperties = { position: "absolute", textAlign: "center", fontFamily: "Arial Black, Arial, Helvetica, sans-serif", fontWeight: 900, color: "#141414" };

const base: Look = { ...CAST.squareCaptain, head: "round", skin: CAST.roundCap.skin, sunglasses: true };
const cells: { l: Look; label: string; sub: string }[] = [
  { l: { ...base, smile: "toothy", shades: "wayfarer" }, label: "1 · TOOTHY SMIRK", sub: "black wayfarers" },
  { l: { ...base, smile: "closed", shades: "round", lens: "#1E1E1E" }, label: "2 · CLOSED SMIRK", sub: "round shades" },
  { l: { ...base, smile: "cheshire", shades: "aviator", lens: "#27303A" }, label: "3 · CHESHIRE GRIN", sub: "gold aviators" },
  { l: { ...base, smile: "half", shades: "visor", lens: POP.orange }, label: "4 · HALF GRIN", sub: "orange visor" },
];

export const SmileSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#BFE6FF, #EAF7FF)" }}>
    <div style={{ ...T, top: 36, width: 1080, left: 0, fontSize: 52 }}>4 SNEAKY SMILES</div>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {cells.map((c, i) => {
        const cx = 270 + (i % 2) * 540;
        const top = 130 + Math.floor(i / 2) * 890;
        const s = 1.25;
        return (
          <g key={i}>
            <clipPath id={`cell${i}`}>
              <rect x={cx - 260} y={top} width={520} height={760} rx={30} />
            </clipPath>
            <rect x={cx - 260} y={top} width={520} height={760} rx={30} fill="#FFFFFF" opacity={0.35} />
            <g clipPath={`url(#cell${i})`}>
              <Toon id={`sm${i}`} x={cx} y={top + 470 * s + 270} scale={s} look={c.l} expr="sneaky" gaze={10} seed={i} />
            </g>
          </g>
        );
      })}
    </svg>
    {cells.map((c, i) => (
      <div key={i} style={{ ...T, top: 130 + Math.floor(i / 2) * 890 + 770, width: 540, left: (i % 2) * 540 }}>
        <div style={{ fontSize: 34 }}>{c.label}</div>
        <div style={{ fontSize: 24, opacity: 0.55 }}>{c.sub}</div>
      </div>
    ))}
  </AbsoluteFill>
);
