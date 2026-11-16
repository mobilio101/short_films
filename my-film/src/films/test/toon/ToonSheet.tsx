// Modern comic cast sheet: three head shapes, bright colours, triangle shirts with line patterns.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST, Expr, Toon } from "../../../characters/toon/Toon";

const T: React.CSSProperties = { position: "absolute", width: "100%", textAlign: "center", fontFamily: "Arial Black, Arial, Helvetica, sans-serif", fontWeight: 900, color: "#141414" };

export const ToonSheet: React.FC = () => {
  const row1: { k: keyof typeof CAST; e: Expr; label: string; arms?: number }[] = [
    { k: "roundCap", e: "grin", label: "ROUND" },
    { k: "squareHard", e: "neutral", label: "SQUARE" },
    { k: "triTop", e: "smug", label: "TRIANGLE" },
  ];
  const row2: { k: keyof typeof CAST; e: Expr; arms?: number }[] = [
    { k: "roundBeanie", e: "shock", arms: 1 },
    { k: "squareCaptain", e: "angry" },
    { k: "triBucket", e: "panic", arms: 0.5 },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#BFE6FF, #EAF7FF)" }}>
      <div style={{ ...T, top: 50, fontSize: 64 }}>MODERN COMIC CAST</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {row1.map((c, i) => (
          <g key={c.k}>
            <ellipse cx={180 + i * 360} cy={900} rx={110} ry={16} fill="#000" opacity={0.15} />
            <Toon id={`r1${i}`} x={180 + i * 360} y={900} scale={0.78} look={CAST[c.k]} expr={c.e} seed={i} armsUp={c.arms ?? 0} gaze={i === 2 ? -8 : 0} />
          </g>
        ))}
        {row2.map((c, i) => (
          <g key={c.k}>
            <ellipse cx={180 + i * 360} cy={1700} rx={110} ry={16} fill="#000" opacity={0.15} />
            <Toon id={`r2${i}`} x={180 + i * 360} y={1700} scale={0.78} look={CAST[c.k]} expr={c.e} seed={i + 4} armsUp={c.arms ?? 0} />
          </g>
        ))}
      </svg>
      {row1.map((c, i) => (
        <div key={c.label} style={{ ...T, top: 930, left: -540 + 180 + i * 360, fontSize: 40 }}>{c.label}</div>
      ))}
    </AbsoluteFill>
  );
};
