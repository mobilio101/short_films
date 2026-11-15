import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Character, EMOTE, Pose } from "../../components/Character";
import { UiContext, clamp01, lerp } from "../../components/theme";
import { BUNGEE, Captions, Label, LightRings, M, MEMPHIS_UI, SAFE, SH, SW, WARM, skin } from "../../components/memphis";
import { Flash, GROUND, Paper, Sfx, SpeedLines, STROKE, Stage, makeCues, useLocal } from "../../components/shortkit";
import { WORDS } from "./words";
import { BRITISH_PATCH, Balkenkreuz, GERMAN_PATCH } from "../../components/insignia";

export const GARBO_DURATION = 1800;
const CAPTION_Y = 1500;
const LABEL_X = (SAFE.left + SW - SAFE.right) / 2;
const LABEL_Y = 330;

const { cue, end: VOICE_END } = makeCues(WORDS);
const CUTS = [
  0,
  cue("Nineteen forty"),
  cue("He begs"),
  cue("They laugh"),
  cue("So he does"),
  cue("He goes to"),
  cue("But Pujol"),
  cue("Fake reports"),
  cue("The Germans pay"),
  cue("His lies"),
  cue("Then they find"),
  cue("D-Day"),
  cue("They believe"),
  cue("His reward"),
  cue("Twenty-seven spies", cue("His reward")),
  VOICE_END + 4,
  GARBO_DURATION,
];
type ShotProps = { start: number };
const at = (start: number, phrase: string) => cue(phrase, start) - start;

/** Squash "pop" when a character snaps into a new emotion. */
const snap = (f: number, t: number) => (f < t ? 1 : 1 + 0.14 * Math.exp(-(f - t) / 4) * Math.cos((f - t) * 0.9));

// ---------------------------------------------------------------------------
// Cast
// ---------------------------------------------------------------------------
const PUJOL = skin(M.amber);
const BRIT = skin(M.cream);
const GERMAN = skin(M.lilac);
const Moustache = <path d="M-26,22 Q-12,12 0,20 Q12,12 26,22 Q12,26 0,22 Q-12,26 -26,22 Z" fill={M.ink} />;
const PujolHat = (
  <g>
    <path d="M-84,-46 Q-70,-112 10,-108 Q80,-104 90,-50 Z" fill={M.ink} />
    <path d="M40,-56 L130,-46 L120,-34 L40,-40 Z" fill={M.ink} />
    {Moustache}
  </g>
);
const PeakedCap = (crown: string, mous = false) => (
  <g>
    <path d="M-100,-74 Q0,-150 100,-74 L80,-56 L-80,-56 Z" fill={crown} stroke={M.ink} strokeWidth={5} />
    <rect x={-82} y={-60} width={164} height={18} fill={M.ink} />
    <path d="M10,-46 Q80,-46 110,-30 L20,-34 Z" fill={M.ink} />
    {mous && <path d="M-30,22 Q0,8 30,22 Q0,30 -30,22 Z" fill={M.ink} />}
  </g>
);
const BritCap = PeakedCap(M.cream, true);
const GermanCap = PeakedCap(M.lilac);
const Helmet = <path d="M-96,-16 A96,96 0 0 1 96,-16 L110,-2 L-110,-2 Z" fill={M.ink} />;
const Fedora = (
  <g>
    <rect x={-120} y={-70} width={240} height={16} rx={8} fill={M.ink} />
    <path d="M-70,-66 L-60,-130 Q0,-118 60,-130 L70,-66 Z" fill={M.ink} />
    <rect x={-62} y={-26} width={124} height={22} rx={10} fill={M.ink} />
  </g>
);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
const Desk: React.FC<{ x: number; w?: number }> = ({ x, w = 360 }) => (
  <g>
    <rect x={x - w / 2} y={GROUND - 170} width={w} height={30} fill={M.lilac} {...STROKE} />
    <rect x={x - w / 2 + 20} y={GROUND - 140} width={w - 40} height={140} fill={M.lilac} {...STROKE} />
  </g>
);
const Door: React.FC<{ x: number; open?: number }> = ({ x, open = 0 }) => (
  <g>
    <rect x={x - 90} y={GROUND - 420} width={180} height={420} fill={M.ink} />
    <rect x={x - 90} y={GROUND - 420} width={180 * (1 - open)} height={420} fill={M.cream} {...STROKE} />
    {open < 0.9 && <circle cx={x - 90 + 150 * (1 - open)} cy={GROUND - 200} r={10} fill={M.ink} />}
  </g>
);
const Chicken: React.FC<{ x: number; f: number; i: number }> = ({ x, f, i }) => {
  const peck = Math.max(0, Math.sin(f / 5 + i * 2)) * 18;
  return (
    <g transform={`translate(${x},${GROUND})`}>
      <line x1={-10} y1={-30} x2={-12} y2={0} stroke={M.ink} strokeWidth={5} />
      <line x1={10} y1={-30} x2={12} y2={0} stroke={M.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-62} rx={48} ry={36} fill={M.cream} {...STROKE} />
      <g transform={`rotate(${peck} 30 -80)`}>
        <circle cx={40} cy={-96} r={22} fill={M.cream} {...STROKE} />
        <path d="M30,-124 Q38,-136 44,-122 Q52,-134 56,-118 Z" fill={M.pink} stroke={M.ink} strokeWidth={3} />
        <path d="M60,-98 L78,-92 L60,-86 Z" fill={M.ink} />
        <circle cx={46} cy={-100} r={4} fill={M.ink} />
      </g>
    </g>
  );
};
const Spy: React.FC<{ x: number; y: number; s?: number; p: number; wave?: boolean; seed: number }> = ({ x, y, s = 0.27, p, wave, seed }) =>
  p <= 0.01 ? null : (
    <g transform={`translate(${x},${y}) scale(${p}) translate(${-x},${-y})`}>
      <Character x={x} y={y} scale={s} skin={skin(M.cream)} hat={Fedora} seed={seed} mouth={0.6} look={seed % 2 ? 8 : -8} hands={wave ? { r: [90, -400 + Math.sin(seed) * 20] } : undefined} />
    </g>
  );
const SPY_SPOTS: [number, number][] = Array.from({ length: 27 }, (_, i) => {
  const row = Math.floor(i / 9);
  const col = i % 9;
  return [80 + col * 115 + (row % 2) * 50, 1205 + row * 85];
});
const Paperwork: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <rect x={-40} y={-52} width={80} height={104} fill={M.cream} {...STROKE} />
    {[0, 1, 2, 3].map((k) => (
      <line key={k} x1={-26} y1={-30 + k * 20} x2={26} y2={-30 + k * 20} stroke={M.ink} strokeWidth={4} />
    ))}
  </g>
);
const Magnifier: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <line x1={0} y1={0} x2={50} y2={60} stroke={M.ink} strokeWidth={14} strokeLinecap="round" />
    <circle cx={-10} cy={-14} r={44} fill="#FFFFFF" fillOpacity={0.7} stroke={M.ink} strokeWidth={9} />
  </g>
);
const Tank: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-170} y={-70} width={340} height={70} rx={35} fill={M.ink} />
    {[-120, -60, 0, 60, 120].map((wx) => (
      <circle key={wx} cx={wx} cy={-35} r={20} fill={M.lilac} stroke={M.ink} strokeWidth={4} />
    ))}
    <path d="M-185,-70 L-150,-150 L150,-150 L185,-70 Z" fill={M.lilac} {...STROKE} />
    <rect x={-75} y={-215} width={150} height={70} rx={28} fill={M.lilac} {...STROKE} />
    <rect x={70} y={-196} width={190} height={24} rx={10} fill={M.lilac} {...STROKE} />
    <g transform="translate(-40,-110)">
      <Balkenkreuz s={1.3} />
    </g>
  </g>
);
const IronCross = (
  <g transform="translate(-22,46) scale(0.9)">
    <path d="M-8,-30 L8,-30 L6,-10 L30,-8 L30,8 L6,10 L8,30 L-8,30 L-6,10 L-30,8 L-30,-8 L-6,-10 Z" fill={M.ink} stroke="#FFFFFF" strokeWidth={4} />
  </g>
);
const MBE = (
  <g transform="translate(26,46)">
    <rect x={-10} y={-36} width={20} height={22} fill={M.pink} stroke={M.ink} strokeWidth={3} />
    <path d="M0,-16 L8,-4 L20,0 L8,4 L0,16 L-8,4 L-20,0 L-8,-4 Z" fill="#FFFFFF" stroke={M.ink} strokeWidth={3} />
  </g>
);

const HaLetters: React.FC<{ from: number; count?: number; x0?: number }> = ({ from, count = 6, x0 = 520 }) => {
  const { f, pop } = useLocal();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const t0 = from + i * 5;
        if (f < t0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x0 + ((i * 131) % 380), top: 480 + ((i * 97) % 300) - (f - t0) * 1.4, fontFamily: BUNGEE, fontSize: 68 + (i % 3) * 14, color: M.pink, WebkitTextStroke: `8px ${M.ink}`, paintOrder: "stroke fill", transform: `scale(${pop(t0)}) rotate(${(i % 2 ? 1 : -1) * 12}deg)` }}>
            HA
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
// 1. "One man fooled Hitler with twenty-seven spies who never existed."
const Shot1: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tGone = at(start, "never existed");
  return (
    <Stage moon={false}>
      <LightRings x={540} y={760} radii={[520, 400, 290]} colors={WARM} />
      {SPY_SPOTS.map(([sx, sy], i) => {
        const p = f < tGone ? pop(4 + i * 2) : 1 - clamp01((f - tGone - i * 0.6) / 4);
        return <Spy key={i} x={sx} y={sy} p={p} seed={i} />;
      })}
      <Character x={540} y={GROUND} scale={0.95} skin={PUJOL} hat={PujolHat} {...(f < tGone ? EMOTE.smug : { ...EMOTE.smug, hands: { l: [-130, -300], r: [130, -300] }, mouth: 0.9 })} squash={snap(f, tGone)} />
    </Stage>
  );
};

// 2. "Nineteen forty. Juan Pujol, a Spanish chicken farmer, hates the Nazis."
const Shot2: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tHate = at(start, "hates the");
  const mood: Pose = f < tHate ? { mouth: 0.4, look: -10 } : { ...EMOTE.rage, look: 14 };
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 820, y: 430 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <rect key={k} x={k * 170} y={GROUND - 150} width={20} height={150} fill={M.lilac} {...STROKE} />
        ))}
        <rect x={0} y={GROUND - 120} width={SW} height={16} fill={M.lilac} {...STROKE} />
        <Chicken x={160} f={f} i={0} />
        <Chicken x={330} f={f} i={1} />
        <Character x={640} y={GROUND} scale={0.95} skin={PUJOL} hat={PujolHat} {...mood} squash={snap(f, tHate)} />
        <Chicken x={900} f={f} i={2} />
      </Stage>
      <Label text="1940 · SPAIN" x={LABEL_X} y={LABEL_Y} from={2} to={9999} size={54} />
    </AbsoluteFill>
  );
};

// 3. "He begs the British to let him spy for them."
const Shot3: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const plead = Math.sin(f / 4) * 10;
  return (
    <Stage moon={false} cam={{ s: 1.05, x: 540, y: 950 }}>
      <Character x={760} y={GROUND} scale={0.95} skin={BRIT} hat={BritCap} brow={-0.4} mouth={-0.3} look={-14} hands={{ l: [-60, -200], r: [60, -200] }} chest={BRITISH_PATCH} />
      <Desk x={760} />
      <Character x={300} y={GROUND} scale={0.95} skin={PUJOL} hat={PujolHat} eyes="wide" brow={1} mouthShape="open" mouthOpen={0.5} kneel={1} look={14} hands={{ l: [20, -265 + plead], r: [50, -265 + plead] }} />
    </Stage>
  );
};

// 4. "They laugh him out the door."
const Shot4: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const shove = clamp01(f / 16);
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <Door x={150} open={1} />
        <Character x={lerp(380, 150, shove)} y={GROUND} scale={0.9} skin={PUJOL} hat={PujolHat} {...EMOTE.sad} lean={-12 * (1 - shove)} look={14} squash={snap(f, 16) * 0.95} />
        <Character x={640} y={GROUND} scale={0.85} skin={BRIT} hat={BritCap} {...EMOTE.laugh} look={-14} squash={1 + 0.06 * Math.abs(Math.sin(f / 2.5))} seed={2} chest={BRITISH_PATCH} />
        <Character x={880} y={GROUND} scale={0.85} skin={BRIT} hat={BritCap} {...EMOTE.laugh} lean={10} look={-14} squash={1 + 0.06 * Math.abs(Math.sin(f / 2.7 + 1))} seed={5} chest={BRITISH_PATCH} />
      </Stage>
      <HaLetters from={2} />
    </AbsoluteFill>
  );
};

// 5. "So he does something insane." Sad face snaps into a wild grin.
const Shot5: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const t = 10;
  const pose: Pose = f < t ? EMOTE.sad : { eyes: "wide", mouthShape: "shout", mouthOpen: 0.7, mouth: 1, brow: -0.9, fx: "sparkle", look: 0 };
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false} cam={{ s: 2.4, x: 540, y: GROUND - 300 }}>
        <LightRings x={540} y={GROUND - 300} radii={[300, 210, 130]} colors={WARM} on={f >= t ? 1 : 0.3} />
        <Character x={540} y={GROUND} scale={1} skin={PUJOL} hat={PujolHat} {...pose} squash={snap(f, t)} />
      </Stage>
      <SpeedLines at={t} dir={1} />
    </AbsoluteFill>
  );
};

// 6. "He goes to the Nazis instead. They hire him to spy on Britain."
const Shot6: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tHire = at(start, "They hire");
  const hired = f >= tHire;
  const stampY = hired ? lerp(-140, 0, clamp01((f - tHire) / 5)) : -140;
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <Character x={330} y={GROUND} scale={0.95} skin={GERMAN} hat={GermanCap} eyes={hired ? "dot" : "glare"} brow={hired ? -0.2 : -1} mouth={hired ? 0.7 : -0.4} look={14} hands={{ r: [150, -170 + stampY * 0.6] }} squash={snap(f, tHire)} chest={GERMAN_PATCH} />
        <Desk x={420} w={420} />
        <Paperwork x={440} y={GROUND - 190} r={-4} s={1.1} />
        {hired && (
          <text x={440} y={GROUND - 180} textAnchor="middle" fontFamily={BUNGEE} fontSize={34} fill={M.pink} transform={`rotate(-12 440 ${GROUND - 180})`} opacity={pop(tHire + 4)}>
            HIRED
          </text>
        )}
        <Character
          x={810}
          y={GROUND}
          scale={0.95}
          skin={PUJOL}
          hat={PujolHat}
          {...(hired ? { eyes: "happy" as const, mouth: 0.9, brow: 0.2, hands: { l: [-80, -330], r: [80, -160] } } : { eyes: "wide" as const, brow: 1, mouthShape: "wobble" as const, sweat: 1, shake: 1.5 })}
          look={-14}
          squash={snap(f, tHire)}
        />
      </Stage>
      <Label text="HIRED BY THE GERMANS" x={LABEL_X} y={LABEL_Y} from={tHire + 2} to={9999} size={46} />
    </AbsoluteFill>
  );
};

// 7. "But Pujol never goes. He sits in Lisbon with a guidebook and train timetables, inventing everything."
const Shot7: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tSit = at(start, "He sits");
  const frantic = f >= tSit;
  const scrib = Math.sin(f * 1.4) * 14;
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 820, y: 420 }}>
        <Character
          x={360}
          y={GROUND}
          scale={0.95}
          skin={PUJOL}
          hat={PujolHat}
          {...(frantic
            ? { eyes: "squint" as const, mouthShape: "teeth" as const, brow: -0.6, sweat: 1, shake: 2, lean: 14, hands: { l: [120, -190], r: [180 + scrib, -195] } }
            : { ...EMOTE.smug, hands: { l: [-85, -165], r: [110, -330] } })}
          look={14}
          squash={snap(f, tSit)}
        />
        <rect x={420} y={GROUND - 190} width={420} height={26} fill={M.lilac} {...STROKE} />
        <rect x={600} y={GROUND - 164} width={40} height={164} fill={M.lilac} {...STROKE} />
        <g transform={`translate(560,${GROUND - 250}) rotate(-6)`}>
          <rect x={-90} y={-60} width={180} height={120} fill={M.pink} {...STROKE} />
          <line x1={0} y1={-60} x2={0} y2={60} stroke={M.ink} strokeWidth={5} />
          <text x={-45} y={-10} textAnchor="middle" fontFamily={BUNGEE} fontSize={20} fill="#FFFFFF">GUIDE</text>
          <text x={45} y={-10} textAnchor="middle" fontFamily={BUNGEE} fontSize={20} fill="#FFFFFF">BRITAIN</text>
        </g>
        <Paperwork x={740} y={GROUND - 240} r={8} />
        {frantic &&
          [0, 1, 2, 3].map((k) => {
            const t = ((f - tSit) * 2 + k * 25) % 100;
            return <Paperwork key={k} x={500 + k * 60 + t * 2} y={GROUND - 280 - t * 5} r={t * 3} s={0.6} />;
          })}
      </Stage>
      <Label text="LISBON, NOT LONDON" x={LABEL_X} y={LABEL_Y} from={tSit + 4} to={9999} size={50} />
    </AbsoluteFill>
  );
};

// 8. "Fake reports. Fake spies. Twenty-seven of them."
const Shot8: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tSpies = at(start, "Fake spies");
  const t27 = at(start, "Twenty-seven of");
  const n = f < tSpies ? 0 : Math.min(27, Math.floor(((f - tSpies) / Math.max(1, t27 - tSpies + 6)) * 27) + 1);
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: 1, x: 540, y: 960 }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const p = pop(k * 4);
          return <Paperwork key={k} x={180 + k * 180} y={lerp(GROUND - 100, 520 + (k % 2) * 120, p)} r={(k - 2) * 12} s={p * 1.2} />;
        })}
        {SPY_SPOTS.map(([sx, sy], i) => (i < n ? <Spy key={i} x={sx} y={sy} p={pop(tSpies + (i / 27) * (t27 - tSpies + 6))} seed={i} /> : null))}
      </Stage>
      <Label text={`FAKE SPIES: ${n}`} x={LABEL_X} y={LABEL_Y} from={tSpies} to={9999} size={60} />
    </AbsoluteFill>
  );
};

// 9. "The Germans pay them all."
const Shot9: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  return (
    <Stage moon={false}>
      {Array.from({ length: 18 }, (_, i) => {
        const t = ((f * 3 + i * 37) % 260) / 260;
        return <circle key={i} cx={100 + ((i * 173) % 880)} cy={200 + t * 1000} r={18} fill="#FFFFFF" stroke={M.ink} strokeWidth={4} />;
      })}
      <Character x={330} y={GROUND} scale={0.95} skin={GERMAN} hat={GermanCap} {...EMOTE.joy} fx="none" jump={Math.abs(Math.sin(f / 5)) * 40} look={14} chest={GERMAN_PATCH} />
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${640 + k * 120},${GROUND})`}>
          {[0, 1, 2, 3].map((j) => (
            <rect key={j} x={-50} y={-30 - j * 30} width={100} height={28} fill="#FFFFFF" {...STROKE} />
          ))}
          <rect x={-50} y={-150} width={20} height={150} fill={M.pink} opacity={0.9} />
        </g>
      ))}
    </Stage>
  );
};

// 10. "His lies are so good, British intelligence starts hunting for his spy ring."
const Shot10: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tHunt = at(start, "British intelligence");
  const pins = [[300, 420], [420, 520], [560, 460], [700, 560], [380, 650], [620, 700], [780, 430]];
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <rect x={220} y={330} width={640} height={480} fill="#FFFFFF" {...STROKE} />
        <path d={pins.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ")} fill="none" stroke={M.pink} strokeWidth={5} />
        {pins.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={14} fill={M.pink} stroke={M.ink} strokeWidth={4} />
        ))}
        <Character x={260} y={GROUND} scale={0.85} skin={BRIT} hat={BritCap} {...(f >= tHunt ? EMOTE.shock : {})} fx={f >= tHunt ? "shock" : "none"} hands={{ r: [140, -330] }} look={14} squash={snap(f, tHunt)}  chest={BRITISH_PATCH} />
        <Magnifier x={260 + 140 * 0.85} y={GROUND - 330 * 0.85 - 40} s={1.1} />
        <Character x={820} y={GROUND} scale={0.85} skin={BRIT} hat={BritCap} eyes="wide" brow={0.6} mouthShape="o" hands={{ l: [-140, -340] }} look={-14} seed={4} squash={snap(f, tHunt + 4)} chest={BRITISH_PATCH} />
        <Magnifier x={820 - 140 * 0.85} y={GROUND - 340 * 0.85 - 40} s={1.1} />
      </Stage>
      <Label text="MI5 SPY HUNT" x={LABEL_X} y={230} from={tHunt} to={9999} size={50} />
    </AbsoluteFill>
  );
};

// 11. "Then they find him, and hire him. Now he lies for Britain."
const Shot11: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tHire = at(start, "and hire");
  const tNow = at(start, "Now he lies");
  const burst = clamp01(f / 6);
  const hired = f >= tHire;
  const brit: Pose = hired ? { mouth: 0.9, eyes: "happy", hands: { r: [175, -230] } } : { brow: -0.8, eyes: "glare", hands: { r: [160, -330] } };
  const pujol: Pose = f >= tNow ? { ...EMOTE.smug, hands: { l: [-170, -230], r: [85, -165] } } : hired ? { eyes: "happy", mouth: 0.8, brow: 0.6, hands: { l: [-170, -230] } } : EMOTE.fear;
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <Door x={180} open={burst} />
        <Character x={lerp(180, 340, burst)} y={GROUND} scale={0.9} skin={BRIT} hat={BritCap} {...brit} look={14} squash={snap(f, tHire)} chest={BRITISH_PATCH} />
        <Character x={660} y={GROUND} scale={0.9} skin={PUJOL} hat={PujolHat} {...pujol} look={-14} squash={snap(f, hired ? (f >= tNow ? tNow : tHire) : 2)} />
      </Stage>
      <Flash at={1} />
      <Label text="CODENAME: GARBO" x={LABEL_X} y={LABEL_Y} from={tNow} to={9999} size={58} />
    </AbsoluteFill>
  );
};

// 12. "D-Day. Pujol tells Hitler: Normandy is a trick. The real attack is coming at Calais."
const Shot12: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tTrick = at(start, "Normandy is");
  const tCalais = at(start, "at Calais");
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false}>
        <g transform="translate(540,800) rotate(1)">
          <Paper w={820} h={760} />
        </g>
        <path d="M200,470 C300,420 420,450 520,430 C600,415 700,450 760,500 C720,540 600,560 480,560 C360,560 260,540 200,470 Z" fill={M.lilac} {...STROKE} />
        <text x={360} y={510} fontFamily={BUNGEE} fontSize={32} fill={M.ink}>ENGLAND</text>
        <path d="M160,960 C260,880 360,900 460,880 C560,860 620,780 760,760 L940,740 L940,1180 L160,1180 Z" fill={M.lilac} {...STROKE} />
        <text x={250} y={1000} fontFamily={BUNGEE} fontSize={30} fill={M.ink}>NORMANDY</text>
        <text x={720} y={830} fontFamily={BUNGEE} fontSize={30} fill={M.ink}>CALAIS</text>
        <path d="M380,580 L330,900" stroke={M.ink} strokeWidth={12} strokeDasharray={f >= tTrick ? "18 16" : "none"} opacity={f >= tTrick ? 0.5 : 1} />
        {f >= tTrick && (
          <text x={330} y={760} textAnchor="middle" fontFamily={BUNGEE} fontSize={110} fill={M.pink} stroke={M.ink} strokeWidth={6} paintOrder="stroke" transform={`scale(${pop(tTrick)})`} style={{ transformOrigin: "330px 720px" }}>
            ?
          </text>
        )}
        {f >= tCalais && <path d="M640,560 L760,740" stroke={M.pink} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01((f - tCalais) / 8)} />}
        <g transform={`translate(760,1140) scale(0.55)`}>
          <rect x={-120} y={-200} width={160} height={120} rx={10} fill={M.lilac} {...STROKE} />
          <line x1={-40} y1={-200} x2={-10} y2={-300} stroke={M.ink} strokeWidth={8} />
        </g>
        <Character x={860} y={1180} scale={0.5} skin={PUJOL} hat={PujolHat} {...EMOTE.smug} hands={{ l: [-170, -220] }} look={-14} />
      </Stage>
      <Label text="D-DAY · JUNE 1944" x={LABEL_X} y={260} from={2} to={9999} size={50} />
      <SpeedLines at={0} />
    </AbsoluteFill>
  );
};

// 13. "They believe him. Their tanks wait for an army that never comes."
const Shot13: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tWait = at(start, "Their tanks");
  const gull = clamp01((f - tWait - 10) / 20);
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 830, y: 420 }}>
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${740 + ((f * 2 + k * 60) % 120)},${GROUND - 40 + k * 0} q20,-14 40,0 t40,0`} stroke={M.ink} strokeWidth={5} fill="none" />
        ))}
        <rect x={720} y={GROUND - 20} width={360} height={20} fill={M.cream} />
        <Tank x={200} y={GROUND} s={0.55} />
        <Tank x={480} y={GROUND} s={0.55} />
        <Character x={330} y={GROUND} scale={0.55} skin={GERMAN} hat={Helmet} eyes={f >= tWait ? "closed" : "dot"} mouthShape={f >= tWait ? "o" : "line"} brow={0.4} headTilt={f >= tWait ? 12 : 0} hands={f >= tWait ? { l: [-30, -330], r: [40, -330] } : undefined} seed={3} look={14}  chest={GERMAN_PATCH} />
        <Character x={620} y={GROUND} scale={0.55} skin={GERMAN} hat={Helmet} eyes="closed" mouth={-0.3} headTilt={-10} seed={8} look={14} chest={GERMAN_PATCH} />
        {f >= tWait && (
          <g transform={`translate(${lerp(1100, 520, gull)},${lerp(380, GROUND - 200 * 0.55 - 30, gull)})`}>
            <ellipse cx={0} cy={0} rx={30} ry={16} fill="#FFFFFF" {...STROKE} />
            <path d={`M-10,-6 Q-30,${-30 - (1 - gull) * 20 * Math.sin(f)} -50,-10`} stroke={M.ink} strokeWidth={6} fill="none" />
            <path d="M28,-4 L44,0 L28,4 Z" fill={M.pink} />
          </g>
        )}
      </Stage>
      <Label text={f >= tWait + 30 ? "AUGUST..." : f >= tWait ? "JULY..." : "CALAIS"} x={LABEL_X} y={LABEL_Y} from={2} to={9999} size={54} />
    </AbsoluteFill>
  );
};

// 14. "His reward? An Iron Cross from Germany. A medal from Britain."
const Shot14: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tCross = at(start, "An Iron");
  const tMedal = at(start, "A medal");
  const tGrin = tMedal + 22;
  const look = f >= tGrin ? 0 : f >= tMedal ? 14 : f >= tCross ? -14 : 0;
  const pose: Pose = f >= tGrin ? { eyes: "happy", mouthShape: "open", mouthOpen: 0.7, mouth: 1, fx: "sparkle" } : f >= tCross ? { eyes: "wide", browRaise: 0.8, mouthShape: "o" } : { brow: 0.4, mouth: 0.2 };
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <LightRings x={540} y={760} radii={[520, 400, 290]} colors={WARM} dots={{ r: 380, color: M.pink }} />
        <Character x={210} y={GROUND} scale={0.85} skin={GERMAN} hat={GermanCap} mouth={0.5} look={14} hands={f >= tCross && f < tCross + 20 ? { r: [300, -230] } : undefined}  chest={GERMAN_PATCH} />
        <Character x={870} y={GROUND} scale={0.85} skin={BRIT} hat={BritCap} mouth={0.5} look={-14} hands={f >= tMedal && f < tMedal + 20 ? { l: [-300, -230] } : undefined}  chest={BRITISH_PATCH} />
        <Character
          x={540}
          y={GROUND}
          scale={0.95}
          skin={PUJOL}
          hat={PujolHat}
          {...pose}
          look={look}
          chest={
            <g>
              {f >= tCross + 8 && IronCross}
              {f >= tMedal + 8 && MBE}
            </g>
          }
          squash={snap(f, f >= tGrin ? tGrin : f >= tMedal ? tMedal + 8 : tCross + 8)}
        />
      </Stage>
      <Label text="IRON CROSS" x={290} y={560} from={tCross + 6} to={9999} size={40} />
      <Label text="MBE" x={790} y={560} from={tMedal + 6} to={9999} size={40} />
    </AbsoluteFill>
  );
};

// 15. "Twenty-seven spies. Not one of them was real."
const Shot15: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tGone = at(start, "Not one");
  return (
    <Stage moon={false}>
      <LightRings x={540} y={760} radii={[520, 400, 290]} colors={WARM} />
      {SPY_SPOTS.map(([sx, sy], i) => {
        const p = f < tGone ? pop(i) : 1 - clamp01((f - tGone - i * 1.2) / 4);
        return <Spy key={i} x={sx} y={sy} p={p} wave seed={i} />;
      })}
      <Character x={540} y={GROUND} scale={0.95} skin={PUJOL} hat={PujolHat} eyes="happy" mouth={0.9} brow={-0.3} headTilt={-8} hands={{ l: [-85, -165], r: [120, -380] }} look={0} />
    </Stage>
  );
};

// 16. End card.
const Shot16: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const lines = ["AGENT", "GARBO."];
  const total = lines.join("").length;
  const typed = Math.min(total, Math.floor(f / 2) + 1);
  const under = clamp01((f - total * 2) / 10);
  let used = 0;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={860} radii={[520, 400, 290, 190]} colors={WARM} dots={{ r: 300, color: M.pink }} />
      </svg>
      <div style={{ position: "absolute", top: 640, width: SW, textAlign: "center", fontFamily: BUNGEE, fontSize: 160, lineHeight: 1.05, color: M.cream, WebkitTextStroke: `16px ${M.ink}`, paintOrder: "stroke fill" }}>
        {lines.map((l, i) => {
          const show = l.slice(0, Math.max(0, typed - used));
          used += l.length;
          return <div key={i}>{show || " "}</div>;
        })}
      </div>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <path
          d={Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${200 + i * 17},${1020 + Math.sin(i * 0.6 + f * 0.3) * 14}`).join(" ")}
          fill="none"
          stroke={M.pink}
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - under}
        />
      </svg>
    </AbsoluteFill>
  );
};

const SHOTS = [Shot1, Shot2, Shot3, Shot4, Shot5, Shot6, Shot7, Shot8, Shot9, Shot10, Shot11, Shot12, Shot13, Shot14, Shot15, Shot16];

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
const SoundTrack: React.FC = () => {
  const C = CUTS;
  return (
    <>
      <Audio src={staticFile("voice/garbo.mp3")} volume={1} />
      <Audio src={staticFile("sfx/roomtone.wav")} volume={0.1} loop />
      {Array.from({ length: 10 }, (_, i) => <Sfx key={`p${i}`} name="pop" at={4 + i * 5} vol={0.15} len={8} rate={1.2} />)}
      <Sfx name="puff" at={cue("never existed")} vol={0.5} />
      <Sfx name="chicken" at={C[1] + 4} vol={0.35} />
      <Sfx name="chicken" at={C[1] + 60} vol={0.25} rate={1.1} />
      <Sfx name="impact" at={cue("hates the")} vol={0.25} />
      <Sfx name="laugh" at={C[3]} vol={0.4} len={60} />
      <Sfx name="slam" at={C[3] + 16} vol={0.45} />
      <Sfx name="whoosh" at={C[4] + 10} vol={0.45} />
      <Sfx name="stamp" at={cue("They hire") + 4} vol={0.6} />
      <Sfx name="scribble" at={cue("He sits")} vol={0.35} />
      <Sfx name="scribble" at={cue("He sits") + 24} vol={0.3} />
      <Sfx name="scribble" at={cue("He sits") + 48} vol={0.3} />
      {Array.from({ length: 14 }, (_, i) => <Sfx key={`s${i}`} name="pop" at={cue("Fake spies") + i * 4} vol={0.18} len={8} rate={1 + (i % 4) * 0.1} />)}
      <Sfx name="coins" at={C[8]} vol={0.45} />
      <Sfx name="rumble" at={cue("British intelligence")} vol={0.3} />
      <Sfx name="slam" at={C[10]} vol={0.5} />
      <Sfx name="shimmer" at={cue("and hire")} vol={0.3} />
      <Sfx name="whoosh" at={C[11]} vol={0.4} />
      <Sfx name="static" at={cue("Pujol tells")} vol={0.25} />
      <Sfx name="pop" at={cue("Normandy is")} vol={0.35} />
      <Sfx name="impact" at={cue("at Calais")} vol={0.3} />
      <Sfx name="seagull" at={cue("Their tanks") + 10} vol={0.35} />
      <Sfx name="pop" at={cue("An Iron") + 8} vol={0.35} />
      <Sfx name="pop" at={cue("A medal") + 8} vol={0.35} />
      <Sfx name="shimmer" at={cue("A medal") + 22} vol={0.3} />
      {Array.from({ length: 8 }, (_, i) => <Sfx key={`v${i}`} name="puff" at={cue("Not one") + i * 3} vol={0.2} len={10} rate={1 + i * 0.05} />)}
      {Array.from({ length: 11 }, (_, i) => <Sfx key={`t${i}`} name="type" at={C[15] + i * 2} vol={0.4} len={6} />)}
    </>
  );
};

export const Garbo: React.FC = () => (
  <UiContext.Provider value={MEMPHIS_UI}>
    <AbsoluteFill style={{ background: M.night }}>
      {SHOTS.map((Shot, i) => (
        <Sequence key={i} from={CUTS[i]} durationInFrames={CUTS[i + 1] - CUTS[i]}>
          <Shot start={CUTS[i]} />
        </Sequence>
      ))}
      <Captions words={WORDS} y={CAPTION_Y} hideAfterMs={(VOICE_END / 30) * 1000 + 200} />
      <SoundTrack />
    </AbsoluteFill>
  </UiContext.Provider>
);
