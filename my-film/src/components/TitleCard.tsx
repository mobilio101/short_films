import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, COMIC, W, clamp01 } from "./theme";

/**
 * End title card. In a real film this is the last 12 s (360 frames); timings scale
 * with durationInFrames so a short test can use a compressed version.
 * Place inside a <Sequence> that starts where the card starts.
 */
export const TitleCard: React.FC<{ word: string; line1: string; line2: string; duration?: number }> = ({
  word,
  line1,
  line2,
  duration = 360,
}) => {
  const frame = useCurrentFrame();
  const d = duration;
  const k = d / 360; // timing scale
  const typeStart = Math.round(15 * k);
  const perLetter = Math.max(3, Math.round(8 * k));
  const typed = Math.max(0, Math.min(word.length, Math.floor((frame - typeStart) / perLetter) + 1));
  const typeEnd = typeStart + perLetter * word.length;
  const underStart = typeEnd + Math.round(10 * k);
  const underT = clamp01((frame - underStart) / Math.max(8, 30 * k));
  const l1 = Math.round(underStart + 60 * k);
  const l2 = Math.round(l1 + 60 * k);
  const fadeOut = interpolate(frame, [d - Math.max(10, 45 * k), d - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeIn = (at: number) =>
    interpolate(frame, [at, at + Math.max(6, 15 * k)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Wavy underline that draws from left to right and keeps gently waving.
  const uw = 760;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * uw;
    const y = Math.sin(i * 0.55 + frame * 0.25) * 9;
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeOut, alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: typed }, (_, i) => (
        <Sequence key={i} from={typeStart + i * perLetter} durationInFrames={10} layout="none">
          <Audio src={staticFile("sfx/type.wav")} volume={0.8} />
        </Sequence>
      ))}
      <Sequence from={underStart} layout="none">
        <Audio src={staticFile("sfx/shimmer.wav")} volume={0.5} />
      </Sequence>
      <div style={{ fontFamily: COMIC, fontWeight: 700, fontSize: 190, color: C.white, letterSpacing: 6, height: 220, marginTop: -120 }}>
        {word.slice(0, typed)}
      </div>
      <svg width={uw} height={40} viewBox={`0 -20 ${uw} 40`} style={{ marginTop: 6 }}>
        <path
          d={pts.join(" ")}
          stroke={C.accent}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - underT}
          style={{ filter: `drop-shadow(0 0 10px ${C.accent})` }}
        />
      </svg>
      <div style={{ fontFamily: COMIC, fontSize: 46, color: C.white, marginTop: 50, opacity: fadeIn(l1), width: W, textAlign: "center" }}>
        {line1}
      </div>
      <div style={{ fontFamily: COMIC, fontWeight: 700, fontSize: 40, color: C.accent, marginTop: 18, opacity: fadeIn(l2) }}>
        {line2}
      </div>
    </AbsoluteFill>
  );
};
