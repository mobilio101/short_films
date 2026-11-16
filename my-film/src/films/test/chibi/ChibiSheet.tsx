// Character sheet for the new channel's chibi main character: 3 base designs, then one base in 4 outfits.
import React from "react";
import { AbsoluteFill } from "remotion";
import { BASES, Chibi, Mood, OUTFITS } from "../../../characters/chibi/Chibi";

const T: React.CSSProperties = { position: "absolute", width: "100%", textAlign: "center", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 800, color: "#2B1B12" };

export const ChibiSheet: React.FC = () => {
  const top: { base: keyof typeof BASES; outfit: keyof typeof OUTFITS; mood: Mood; label: string }[] = [
    { base: "pip", outfit: "captain", mood: "neutral", label: "A · dark bob" },
    { base: "rusty", outfit: "explorer", mood: "happy", label: "B · ginger spikes" },
    { base: "mei", outfit: "inventor", mood: "shock", label: "C · twin buns" },
  ];
  const outfits: (keyof typeof OUTFITS)[] = ["captain", "explorer", "inventor", "pirate"];
  return (
    <AbsoluteFill style={{ background: "#F3ECDD" }}>
      <div style={{ ...T, top: 40, fontSize: 54 }}>3 FACES TO CHOOSE FROM</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={60} x2={1020} y1={1010} y2={1010} stroke="#2B1B12" strokeWidth={4} strokeDasharray="14 12" opacity={0.4} />
        {top.map((c, i) => (
          <g key={c.base}>
            <ellipse cx={190 + i * 350} cy={860} rx={120} ry={18} fill="#000" opacity={0.12} />
            <Chibi x={190 + i * 350} y={860} scale={1.0} base={BASES[c.base]} outfit={OUTFITS[c.outfit]} mood={c.mood} look={i === 1 ? 6 : 0} seed={i} armsUp={c.mood === "shock" ? 0.9 : 0} />
          </g>
        ))}
        {outfits.map((o, i) => (
          <g key={o}>
            <ellipse cx={150 + i * 260} cy={1720} rx={95} ry={14} fill="#000" opacity={0.12} />
            <Chibi x={150 + i * 260} y={1720} scale={0.78} base={BASES.pip} outfit={OUTFITS[o]} mood={i === 3 ? "happy" : "neutral"} seed={i + 5} />
          </g>
        ))}
      </svg>
      {top.map((c, i) => (
        <div key={c.label} style={{ ...T, top: 900, left: -540 + 190 + i * 350, fontSize: 34 }}>{c.label}</div>
      ))}
      <div style={{ ...T, top: 1050, fontSize: 46 }}>SAME FACE, NEW OUTFIT PER STORY</div>
      {["captain", "explorer", "inventor", "pirate"].map((o, i) => (
        <div key={o} style={{ ...T, top: 1745, left: -540 + 150 + i * 260, fontSize: 30, textTransform: "uppercase" }}>{o}</div>
      ))}
    </AbsoluteFill>
  );
};
