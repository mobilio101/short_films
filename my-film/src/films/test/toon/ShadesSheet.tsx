// Round-headed main character with black sunglasses and a sneaky, cynical grin.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST, Expr, Look, Toon } from "../../../characters/toon/Toon";

const T: React.CSSProperties = { position: "absolute", textAlign: "center", fontFamily: "Arial Black, Arial, Helvetica, sans-serif", fontWeight: 900, color: "#141414" };

const captain: Look = { ...CAST.squareCaptain, head: "round", skin: CAST.roundCap.skin, sunglasses: true };
const capKid: Look = { ...CAST.roundCap, sunglasses: true };

export const ShadesSheet: React.FC = () => {
  const cells: { l: Look; e: Expr; label: string; arms?: number }[] = [
    { l: captain, e: "sneaky", label: "SNEAKY GRIN" },
    { l: capKid, e: "sneaky", label: "SNEAKY GRIN" },
    { l: captain, e: "shock", label: "SHOCK (SHADES FLY OFF)", arms: 1 },
    { l: captain, e: "neutral", label: "DEADPAN" },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#BFE6FF, #EAF7FF)" }}>
      <div style={{ ...T, top: 40, width: 1080, left: 0, fontSize: 52 }}>THE COOL ONE</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {cells.map((c, i) => {
          const x = 270 + (i % 2) * 540;
          const y = 900 + Math.floor(i / 2) * 860;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={110} ry={16} fill="#000" opacity={0.15} />
              <Toon id={`sh${i}`} x={x} y={y} scale={0.8} look={c.l} expr={c.e} armsUp={c.arms ?? 0} seed={i} gaze={c.e === "sneaky" ? 8 : 0} />
            </g>
          );
        })}
      </svg>
      {cells.map((c, i) => (
        <div key={i} style={{ ...T, top: 930 + Math.floor(i / 2) * 860, width: 540, left: (i % 2) * 540, fontSize: 28, opacity: 0.6 }}>{c.label}</div>
      ))}
    </AbsoluteFill>
  );
};
