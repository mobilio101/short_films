// Channel pictures (800×800) and banners (2560×1440) for SMIRKMAN (3D channel) and 한걸음 (self-discipline).
// Banner text and logo stay inside YouTube's 1546×423 safe area in the middle.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { INK, MAIN, POP, Toon } from "../../../characters/toon/Toon";
import { Glint, Hero } from "./LogoSheet";

const { fontFamily: LILITA } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: JUA } = loadJua("normal", { weights: ["400"] });

// ---------------- SMIRKMAN ----------------
/** Smirkman's face in a circle of radius r, centred at (cx, cy). */
const SmirkFace: React.FC<{ cx: number; cy: number; r: number; id: string }> = ({ cx, cy, r, id }) => {
  const k = r / 220;
  return (
    <g>
      <clipPath id={`sm-${id}`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill={POP.yellow} />
      <g clipPath={`url(#sm-${id})`}>
        {[...Array(12)].map((_, i) => (
          <path key={i} d={`M${cx},${cy} L${cx + Math.cos((i * Math.PI) / 6) * r * 1.5},${cy + Math.sin((i * Math.PI) / 6) * r * 1.5} L${cx + Math.cos((i * Math.PI) / 6 + 0.26) * r * 1.5},${cy + Math.sin((i * Math.PI) / 6 + 0.26) * r * 1.5} Z`} fill="#FFD95C" />
        ))}
        <g transform={`translate(${cx},${cy}) scale(${k}) translate(${-cx},${-cy})`}>
          <Toon id={`smt-${id}`} x={cx} y={cy + 470} scale={0.9} look={MAIN} expr="smug" />
          <Glint x={cx - 52} y={cy + 32} s={18} />
        </g>
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={12 * k} />
    </g>
  );
};

export const SmirkmanAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: POP.yellow }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <SmirkFace cx={400} cy={400} r={392} id="av" />
    </svg>
  </AbsoluteFill>
);

export const SmirkmanBanner: React.FC = () => (
  <AbsoluteFill style={{ background: POP.sky }}>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      {/* Bright comic background: dots and a few floating shapes. */}
      {[...Array(40)].map((_, i) =>
        [...Array(23)].map((__, j) => <circle key={`${i}-${j}`} cx={i * 66 + (j % 2) * 33} cy={j * 66} r={7} fill="#fff" opacity={0.28} />),
      )}
      {[
        [300, 260, POP.yellow], [2250, 300, POP.pink], [420, 1180, POP.teal], [2150, 1150, POP.orange], [1300, 160, POP.white], [1250, 1300, POP.yellow],
      ].map(([x, y, c], i) => (
        <rect key={i} x={(x as number) - 40} y={(y as number) - 40} width={80} height={80} rx={14} fill={c as string} stroke={INK} strokeWidth={8} transform={`rotate(${i * 23} ${x} ${y})`} />
      ))}
      <rect x={0} y={520} width={2560} height={400} fill={POP.blue} />
      <rect x={0} y={520} width={2560} height={400} fill="none" stroke={INK} strokeWidth={12} />
      <SmirkFace cx={760} cy={720} r={190} id="bn" />
      <text x={1000} y={790} fontFamily={LILITA} fontSize={210} fill={INK} transform="translate(12,12)">SMIRKMAN</text>
      <text x={1000} y={790} fontFamily={LILITA} fontSize={210} fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke fill">SMIRKMAN</text>
      <text x={1010} y={870} fontFamily={LILITA} fontSize={58} fill={POP.yellow} stroke={INK} strokeWidth={6} paintOrder="stroke fill" letterSpacing={3}>TRUE STORIES THAT SOUND FAKE</text>
    </svg>
  </AbsoluteFill>
);

// ---------------- 한걸음 ----------------
/** The hero stepping out of the dark into a lamp's light. Drawn in a 700×700 box. */
const StepScene: React.FC = () => (
  <g>
    <rect width={700} height={700} fill="#0B0B10" />
    <ellipse cx={440} cy={330} rx={300} ry={340} fill="url(#lampB)" />
    <rect x={40} y={520} width={620} height={7} fill="#8A8A94" />
    {[[150, 515, 0.3], [240, 515, 0.55]].map(([x, y, o], i) => (
      <ellipse key={i} cx={x} cy={y} rx={26} ry={11} fill="#F5A623" opacity={o} />
    ))}
    <path d="M335,430 q-10,48 -42,84 M384,430 q32,46 82,80" stroke="#F5A623" strokeWidth={24} strokeLinecap="round" fill="none" />
    <g transform="rotate(6 360 330)">
      <Hero x={360} y={200} r={76} brow={0.16} />
    </g>
  </g>
);

const LampDefs: React.FC = () => (
  <defs>
    <radialGradient id="lampB" cx="50%" cy="30%" r="60%">
      <stop offset="0" stopColor="#FFD58A" stopOpacity={0.95} />
      <stop offset="0.45" stopColor="#F5A623" stopOpacity={0.35} />
      <stop offset="1" stopColor="#0B0B10" stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const StepAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B0B10" }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <LampDefs />
      <g transform="translate(50,90)">
        <StepScene />
      </g>
    </svg>
  </AbsoluteFill>
);

export const StepBanner: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B0B10" }}>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      <LampDefs />
      {[...Array(60)].map((_, i) => (
        <circle key={i} cx={(i * 397) % 2560} cy={(i * 211) % 1440} r={i % 3 === 0 ? 3 : 2} fill="#fff" opacity={0.25} />
      ))}
      <g transform="translate(560,500) scale(0.62)">
        <StepScene />
      </g>
      <text x={1060} y={760} fontFamily={JUA} fontSize={230} fill="#F5A623">한걸음</text>
      <text x={1068} y={860} fontFamily={JUA} fontSize={70} fill="#fff" opacity={0.9}>오늘도, 딱 한 걸음만.</text>
    </svg>
  </AbsoluteFill>
);
