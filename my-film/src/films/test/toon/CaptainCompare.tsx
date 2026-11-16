// Side-by-side: round head vs square head, same captain outfit, same three expressions.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST, Expr, Look, Toon } from "../../../characters/toon/Toon";

const T: React.CSSProperties = { position: "absolute", textAlign: "center", fontFamily: "Arial Black, Arial, Helvetica, sans-serif", fontWeight: 900, color: "#141414" };

const outfit = CAST.squareCaptain;
const round: Look = { ...outfit, head: "round", skin: CAST.roundCap.skin };
const square: Look = { ...outfit, head: "square" };

export const CaptainCompare: React.FC = () => {
  const rows: { e: Expr; label: string; arms?: number }[] = [
    { e: "neutral", label: "DEADPAN" },
    { e: "shock", label: "SHOCK", arms: 1 },
    { e: "grin", label: "GRIN" },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#BFE6FF, #EAF7FF)" }}>
      <div style={{ ...T, top: 40, width: 540, left: 0, fontSize: 56 }}>ROUND</div>
      <div style={{ ...T, top: 40, width: 540, left: 540, fontSize: 56 }}>SQUARE</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={540} x2={540} y1={130} y2={1880} stroke="#141414" strokeWidth={4} strokeDasharray="14 12" opacity={0.3} />
        {rows.map((r, i) => {
          const y = 640 + i * 590;
          return (
            <g key={r.e}>
              {[round, square].map((l, j) => (
                <g key={j}>
                  <ellipse cx={270 + j * 540} cy={y} rx={95} ry={14} fill="#000" opacity={0.15} />
                  <Toon id={`cc${i}${j}`} x={270 + j * 540} y={y} scale={0.68} look={l} expr={r.e} armsUp={r.arms ?? 0} seed={i * 2 + j} />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {rows.map((r, i) => (
        <div key={r.label} style={{ ...T, top: 640 + i * 590 + 18, width: 1080, left: 0, fontSize: 30, opacity: 0.55 }}>{r.label}</div>
      ))}
    </AbsoluteFill>
  );
};
