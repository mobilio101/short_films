// The comic chibi versions: 3 funny faces, then one character's range of reactions.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Chibi, COMIC, Mood, OUTFITS } from "../../../characters/chibi/Chibi";

const T: React.CSSProperties = { position: "absolute", width: "100%", textAlign: "center", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 800, color: "#2B1B12" };

export const ComicSheet: React.FC = () => {
  const top: { base: keyof typeof COMIC; outfit: keyof typeof OUTFITS; mood: Mood; label: string; arms?: number }[] = [
    { base: "dex", outfit: "captain", mood: "neutral", label: "D · deadpan" },
    { base: "benny", outfit: "explorer", mood: "panic", label: "E · nervous", arms: 0.6 },
    { base: "mo", outfit: "inventor", mood: "smug", label: "F · smug" },
  ];
  const moods: { mood: Mood; label: string; arms?: number }[] = [
    { mood: "neutral", label: "deadpan" },
    { mood: "shock", label: "shock", arms: 1 },
    { mood: "grin", label: "grin" },
    { mood: "angry", label: "angry" },
  ];
  return (
    <AbsoluteFill style={{ background: "#F3ECDD" }}>
      <div style={{ ...T, top: 40, fontSize: 54 }}>COMIC VERSIONS</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={60} x2={1020} y1={1010} y2={1010} stroke="#2B1B12" strokeWidth={4} strokeDasharray="14 12" opacity={0.4} />
        {top.map((c, i) => (
          <g key={c.base}>
            <ellipse cx={190 + i * 350} cy={860} rx={120} ry={18} fill="#000" opacity={0.12} />
            <Chibi x={190 + i * 350} y={860} scale={0.95} base={COMIC[c.base]} outfit={OUTFITS[c.outfit]} mood={c.mood} seed={i} armsUp={c.arms ?? 0} look={i === 2 ? -8 : 0} />
          </g>
        ))}
        {moods.map((m, i) => (
          <g key={m.mood}>
            <ellipse cx={150 + i * 260} cy={1720} rx={95} ry={14} fill="#000" opacity={0.12} />
            <Chibi x={150 + i * 260} y={1720} scale={0.74} base={COMIC.dex} outfit={OUTFITS.pirate} mood={m.mood} seed={i + 5} armsUp={m.arms ?? 0} />
          </g>
        ))}
      </svg>
      {top.map((c, i) => (
        <div key={c.label} style={{ ...T, top: 900, left: -540 + 190 + i * 350, fontSize: 34 }}>{c.label}</div>
      ))}
      <div style={{ ...T, top: 1050, fontSize: 46 }}>ONE CHARACTER, BIG REACTIONS</div>
      {moods.map((m, i) => (
        <div key={m.label} style={{ ...T, top: 1745, left: -540 + 150 + i * 260, fontSize: 30, textTransform: "uppercase" }}>{m.label}</div>
      ))}
    </AbsoluteFill>
  );
};
