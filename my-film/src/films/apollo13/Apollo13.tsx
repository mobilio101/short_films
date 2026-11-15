import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Character, EMOTE, Pose } from "../../components/Character";
import { UiContext, clamp01, lerp } from "../../components/theme";
import { BUNGEE, Captions, Label, LightRings, M, MEMPHIS_UI, OFFSET, SAFE, SH, SW, WARM, skin } from "../../components/memphis";
import { Flash, GROUND, Sfx, SpeedLines, STROKE, Stage, makeCues, useLocal } from "../../components/shortkit";
import { INK_MAIN, INK_SIDE, InkDrop } from "../../components/mascot";
import { USFlag } from "../../components/insignia";
import { WORDS } from "./words";

export const APOLLO13_DURATION = 1800;
const CAPTION_Y = 1500;
const LABEL_X = (SAFE.left + SW - SAFE.right) / 2;
const LABEL_Y = 330;
const WHITE = "#FFFFFF";

const { cue, end: VOICE_END } = makeCues(WORDS);
const CUTS = [
  0,
  cue("April nineteen"),
  cue("Then bang"),
  cue("Oxygen is"),
  cue("Now it's"),
  cue("They crawl"),
  cue("It has to"),
  cue("Then a new"),
  cue("The spare"),
  cue("On Earth"),
  cue("Duct tape"),
  cue("They build"),
  cue("step by step"),
  cue("Freezing"),
  cue("Re-entry"),
  cue("Radio silence"),
  cue("Then a voice"),
  cue("NASA calls"),
  VOICE_END + 4,
  APOLLO13_DURATION,
];
type ShotProps = { start: number };
const at = (start: number, phrase: string) => cue(phrase, start) - start;
const snap = (f: number, t: number) => (f < t ? 1 : 1 + 0.14 * Math.exp(-(f - t) / 4) * Math.cos((f - t) * 0.9));

// ---------------------------------------------------------------------------
// Cast: ink-blot characters. Lovell is the main character (red, neckerchief).
// ---------------------------------------------------------------------------
const FLAG = (
  <g transform="translate(-2,92)">
    <USFlag w={50} h={28} />
  </g>
);
const TIE = <path d="M-8,4 L8,4 L5,16 L12,70 L0,84 L-12,70 L-5,16 Z" fill={M.ink} />;
const Headset = (
  <g>
    <path d="M-92,6 A92,92 0 0 1 92,6" fill="none" stroke={M.ink} strokeWidth={10} />
    <rect x={-108} y={-10} width={26} height={44} rx={10} fill={M.ink} />
    <path d="M-95,30 Q-90,70 -30,60" fill="none" stroke={M.ink} strokeWidth={6} />
  </g>
);
const LOVELL = { ...INK_MAIN, skin: skin(M.amber), chest: FLAG };
const CREW = { ...INK_SIDE, skin: skin(M.cream), chest: FLAG };
const ENGINEER = { ...INK_SIDE, skin: skin(M.cream), chest: TIE };
const CONTROLLER = { ...INK_SIDE, skin: skin(M.lilac), chest: TIE, hat: Headset };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
const Stars: React.FC<{ n?: number }> = ({ n = 40 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={(i * 277) % SW} cy={(i * 163) % SH} r={1.5 + (i % 3)} fill={WHITE} opacity={0.5 + (i % 4) * 0.12} />
    ))}
  </g>
);
const Space: React.FC<{ children: React.ReactNode; cam?: { s: number; x: number; y: number } }> = ({ children, cam = { s: 1, x: SW / 2, y: SH / 2 } }) => (
  <AbsoluteFill style={{ background: M.ink }}>
    <AbsoluteFill style={{ transform: `translate(${SW / 2 - cam.x * cam.s}px, ${SH / 2 - cam.y * cam.s}px) scale(${cam.s})`, transformOrigin: "0 0" }}>
      <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} style={{ overflow: "visible" }}>
        <Stars />
        {children}
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);
/** The Apollo stack: command module (cone), service module (cylinder), lunar module on the nose. */
const Ship: React.FC<{ x: number; y: number; s?: number; r?: number; damaged?: boolean }> = ({ x, y, s = 1, r = -20, damaged }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <path d="M-170,-40 L-200,-60 L-200,60 L-170,40 Z" fill={M.lilac} stroke={WHITE} strokeWidth={4} />
    <rect x={-170} y={-60} width={200} height={120} fill={M.lilac} stroke={WHITE} strokeWidth={4} />
    {damaged && <path d="M-110,-60 L-90,-20 L-120,10 L-80,60 L-40,60 L-60,10 L-30,-20 L-50,-60 Z" fill={M.ink} stroke={WHITE} strokeWidth={3} />}
    <path d="M30,-60 L130,-22 L130,22 L30,60 Z" fill={WHITE} stroke={M.ink} strokeWidth={4} />
    <rect x={130} y={-46} width={90} height={92} fill={M.lilac} stroke={WHITE} strokeWidth={4} />
    <path d="M220,-46 L250,-70 M220,46 L250,70" stroke={WHITE} strokeWidth={6} />
  </g>
);
const Moon: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={WHITE} stroke={M.lilac} strokeWidth={4} />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill={M.lilac} opacity={0.6} />
    <circle cx={x + r * 0.35} cy={y + r * 0.25} r={r * 0.12} fill={M.lilac} opacity={0.6} />
  </g>
);
const Earth: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={WHITE} stroke={M.lilac} strokeWidth={4} />
    <path d={`M${x - r * 0.6},${y - r * 0.2} q${r * 0.3},${-r * 0.4} ${r * 0.6},${-r * 0.1} t${r * 0.4},${r * 0.4} q${-r * 0.3},${r * 0.4} ${-r * 0.7},${r * 0.2} Z`} fill={M.lilac} />
  </g>
);
/** Capsule interior wall with a round window. */
const Cabin: React.FC<{ window?: React.ReactNode; tint?: number }> = ({ window: win, tint = 0 }) => (
  <g>
    <rect x={40} y={260} width={1000} height={GROUND - 260} rx={60} fill={M.lilac} {...STROKE} />
    {[0, 1, 2, 3].map((k) => (
      <rect key={k} x={110 + k * 90} y={320} width={60} height={40} rx={8} fill={M.cream} stroke={M.ink} strokeWidth={4} />
    ))}
    <circle cx={800} cy={480} r={130} fill={M.ink} stroke={M.cream} strokeWidth={14} />
    <g clipPath="url(#win)">{win}</g>
    <defs>
      <clipPath id="win">
        <circle cx={800} cy={480} r={124} />
      </clipPath>
    </defs>
    {tint > 0 && <rect x={40} y={260} width={1000} height={GROUND - 260} rx={60} fill={M.ink} opacity={tint} />}
  </g>
);
const Gauge: React.FC<{ x: number; y: number; v: number; s?: number }> = ({ x, y, v, s = 1 }) => {
  const a = lerp(-160, -20, v);
  const r = (a * Math.PI) / 180;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-120,0 A120,120 0 0 1 120,0 Z" fill={WHITE} {...STROKE} />
      <path d="M50,-108 A120,120 0 0 1 120,0 L80,0 A80,80 0 0 0 34,-72 Z" fill={M.pink} />
      <line x1={0} y1={0} x2={Math.cos(r) * 100} y2={Math.sin(r) * 100} stroke={M.ink} strokeWidth={9} strokeLinecap="round" />
      <circle r={12} fill={M.ink} />
      <text x={0} y={-36} textAnchor="middle" fontFamily={BUNGEE} fontSize={30} fill={M.ink}>CO2</text>
    </g>
  );
};
const Console: React.FC<{ x: number; w?: number }> = ({ x, w = 300 }) => (
  <g>
    <rect x={x - w / 2} y={GROUND - 190} width={w} height={190} fill={M.lilac} {...STROKE} />
    {[0, 1].map((k) => (
      <rect key={k} x={x - w / 2 + 25 + k * (w / 2)} y={GROUND - 170} width={w / 2 - 50} height={70} fill={M.ink} stroke={M.ink} strokeWidth={4} />
    ))}
  </g>
);
const Tape: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={60} fill={M.lilac} {...STROKE} />
    <circle r={28} fill={M.cream} {...STROKE} />
    <path d="M58,10 L130,30 L126,50 L52,30 Z" fill={M.lilac} stroke={M.ink} strokeWidth={4} />
  </g>
);
const Bag: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70,-80 L70,-80 Q80,0 60,80 L-60,80 Q-80,0 -70,-80 Z" fill={WHITE} fillOpacity={0.8} {...STROKE} />
    <path d="M-40,-50 Q0,-30 40,-50 M-30,10 Q10,30 40,0" stroke={M.lilac} strokeWidth={5} fill="none" />
  </g>
);
const FlightPlan: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(-8)`}>
    <rect x={-80} y={-100} width={160} height={200} fill={M.pink} {...STROKE} />
    <text x={0} y={-30} textAnchor="middle" fontFamily={BUNGEE} fontSize={28} fill={WHITE}>FLIGHT</text>
    <text x={0} y={10} textAnchor="middle" fontFamily={BUNGEE} fontSize={28} fill={WHITE}>PLAN</text>
  </g>
);
const Mailbox: React.FC<{ x: number; y: number; s?: number; tape?: number }> = ({ x, y, s = 1, tape = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-110} y={-110} width={220} height={220} fill={M.lilac} {...STROKE} />
    {[-55, 0, 55].map((k) => (
      <line key={k} x1={k} y1={-100} x2={k} y2={100} stroke={M.ink} strokeWidth={3} opacity={0.4} />
    ))}
    {[-60, 0, 60].map((k, i) => (i / 3 < tape ? <rect key={`h${k}`} x={-120} y={k - 10} width={240} height={20} fill={WHITE} stroke={M.ink} strokeWidth={3} /> : null))}
    {[-60, 60].map((k, i) => ((i + 3) / 5 < tape ? <rect key={`v${k}`} x={k - 10} y={-120} width={20} height={240} fill={WHITE} stroke={M.ink} strokeWidth={3} /> : null))}
    <path d="M-20,110 Q-30,180 20,220" stroke={WHITE} strokeWidth={26} fill="none" />
  </g>
);

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
// 1. "Two hundred thousand miles from Earth, Apollo 13 explodes."
const Shot1: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tBoom = at(start, "explodes");
  const boomed = f >= tBoom;
  const shake = boomed ? Math.sin(f * 2.1) * 10 * Math.exp(-(f - tBoom) / 12) : 0;
  return (
    <AbsoluteFill>
      <Space>
        <Earth x={160} y={1250} r={60} />
        <g transform={`translate(${shake},0)`}>
          <Ship x={lerp(560, 600, f / 120)} y={760} s={1.1} damaged={boomed} />
          {boomed &&
            Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const d = (f - tBoom) * (6 + (i % 4) * 2);
              return <rect key={i} x={480 + Math.cos(a) * d} y={790 + Math.sin(a) * d} width={14 + (i % 3) * 8} height={10} fill={i % 3 ? WHITE : M.pink} transform={`rotate(${f * 10 + i * 40} ${480 + Math.cos(a) * d} ${790 + Math.sin(a) * d})`} />;
            })}
          {boomed && <circle cx={480} cy={790} r={lerp(20, 220, clamp01((f - tBoom) / 10))} fill={WHITE} opacity={1 - clamp01((f - tBoom) / 14)} />}
        </g>
        <g style={{ filter: OFFSET }}>
          <circle cx={840} cy={1150} r={105} fill={M.cream} stroke={M.ink} strokeWidth={6} />
          <InkDrop x={840} y={1215} s={0.6} mood={boomed ? "shock" : "happy"} />
        </g>
      </Space>
      <Flash at={tBoom} />
      <Label text="200,000 MILES FROM EARTH" x={LABEL_X} y={LABEL_Y} from={4} to={9999} size={40} />
    </AbsoluteFill>
  );
};

// 2. "April 1970. Three astronauts are on their way to the Moon."
const Shot2: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tThree = at(start, "Three astronauts");
  const happy = f >= tThree;
  const float = (i: number) => 30 + Math.sin(f / 12 + i * 2) * 18;
  const pose: Pose = happy ? { eyes: "happy", mouthShape: "open", mouthOpen: 0.7, mouth: 1, hands: { l: [-60, -200], r: [110, -420] } } : { mouth: 0.4 };
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false} spots={false}>
        <Cabin window={<Moon x={800} y={480} r={70} />} />
        <Character x={260} y={GROUND - 40} scale={0.75} {...CREW} {...pose} jump={float(0)} seed={1} look={10} />
        <Character x={520} y={GROUND - 40} scale={0.85} {...LOVELL} {...pose} jump={float(1)} squash={snap(f, tThree)} look={10} />
        <Character x={790} y={GROUND - 40} scale={0.75} {...CREW} {...pose} jump={float(2)} seed={4} look={-10} />
      </Stage>
      <Label text="APRIL 1970" x={LABEL_X} y={210} from={2} to={9999} size={54} />
    </AbsoluteFill>
  );
};

// 3. "Then, bang. Houston, we've had a problem."
const Shot3: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tBang = at(start, "bang");
  const tHouston = at(start, "Houston");
  const hit = f >= tBang;
  const shake = hit ? Math.sin(f * 2.3) * 16 * Math.exp(-(f - tBang) / 10) : 0;
  const lovell: Pose = f >= tHouston ? { ...EMOTE.fear, kneel: 0, lean: 0, hands: { l: [-40, -300], r: [140, -280] }, mouthShape: "open", mouthOpen: 0.5 } : hit ? EMOTE.shock : { mouth: 0.5 };
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <Stage moon={false} floor={false} spots={false}>
        <Cabin window={<Moon x={800} y={480} r={70} />} tint={hit ? 0.12 : 0} />
        <Character x={230} y={GROUND - 40} scale={0.75} {...CREW} {...(hit ? EMOTE.shock : {})} seed={1} look={10} squash={snap(f, tBang)} />
        <Character x={520} y={GROUND - 40} scale={0.85} {...LOVELL} {...lovell} squash={snap(f, tBang)} look={14} />
        <g transform="translate(680,820)">
          <rect x={-30} y={-60} width={60} height={60} rx={10} fill={M.ink} />
          <line x1={0} y1={0} x2={-40} y2={60} stroke={M.ink} strokeWidth={6} />
        </g>
        <Character x={820} y={GROUND - 40} scale={0.75} {...CREW} {...(hit ? EMOTE.shock : {})} seed={4} look={-10} squash={snap(f, tBang + 2)} />
      </Stage>
      <Flash at={tBang} />
      <SpeedLines at={tBang} dir={1} />
      <Label text="“HOUSTON, WE'VE HAD A PROBLEM.”" x={LABEL_X} y={230} from={tHouston} to={9999} size={34} />
    </AbsoluteFill>
  );
};

// 4. "Oxygen is venting into space. The Moon landing is over."
const Shot4: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tOver = at(start, "The Moon landing");
  return (
    <Space cam={{ s: 1, x: 540, y: 900 }}>
      <Moon x={lerp(820, 1000, clamp01((f - tOver) / 40))} y={420} r={lerp(120, 70, clamp01((f - tOver) / 40))} />
      {f >= tOver && (
        <g transform={`translate(${lerp(820, 1000, clamp01((f - tOver) / 40))},420) scale(${pop(tOver)})`}>
          <path d="M-70,-70 L70,70 M70,-70 L-70,70" stroke={M.pink} strokeWidth={24} strokeLinecap="round" />
        </g>
      )}
      {Array.from({ length: 30 }, (_, i) => {
        const t = ((f * 2 + i * 9) % 90) / 90;
        return <circle key={i} cx={440 - t * 360 + Math.sin(i) * 30 * t} cy={800 + t * 300 + Math.cos(i * 2) * 60 * t} r={8 + t * 40} fill={WHITE} opacity={0.8 * (1 - t)} />;
      })}
      <Ship x={560} y={760} s={1.1} damaged r={-20 + Math.sin(f / 10) * 4} />
    </Space>
  );
};

// 5. "Now it's about survival." Lovell at the window, jaw set.
const Shot5: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  return (
    <Stage moon={false} floor={false} spots={false} cam={{ s: 1.6, x: 600, y: 760 }}>
      <Cabin window={<Earth x={800} y={520} r={40} />} />
      <Character x={600} y={GROUND} scale={1} {...LOVELL} eyes="dot" brow={-1} mouthShape="teeth" sweat={1} look={14} squash={snap(f, 4)} />
    </Stage>
  );
};

// 6. "They crawl into the lunar lander, a lifeboat built for two men for two days."
const Lander: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <path d="M300,560 L780,560 L840,700 L840,1150 L240,1150 L240,700 Z" fill={M.lilac} {...STROKE} />
    <rect x={300} y={640} width={480} height={510} rx={20} fill={M.cream} {...STROKE} />
    {children}
  </g>
);
const Shot6: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tLife = at(start, "a lifeboat");
  const squeeze = clamp01(f / 20);
  const cramp: Pose = { kneel: 0.7, brow: 0.8, mouth: -0.6, hands: { l: [-30, -200], r: [30, -200] } };
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false}>
        <Lander>
          <Character x={lerp(150, 390, squeeze)} y={1130} scale={0.72} {...CREW} {...cramp} seed={1} look={10} />
          <Character x={540} y={1130} scale={0.8} {...LOVELL} {...cramp} squash={0.9} />
          <Character x={lerp(930, 690, squeeze)} y={1130} scale={0.72} {...CREW} {...cramp} seed={4} look={-10} />
        </Lander>
      </Stage>
      <Label text="BUILT FOR 2 MEN · 2 DAYS" x={LABEL_X} y={LABEL_Y} from={tLife} to={9999} size={44} />
    </AbsoluteFill>
  );
};

// 7. "It has to keep three men alive for four." The numbers are crossed out.
const Shot7: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const despair: Pose = { ...EMOTE.sad, eyes: "wide", brow: 1, mouthShape: "wobble", sweat: 1 };
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false}>
        <Lander>
          <Character x={390} y={1130} scale={0.72} {...CREW} {...despair} kneel={0.7} look={14} seed={1} />
          <Character x={540} y={1130} scale={0.8} {...LOVELL} {...despair} kneel={0.7} look={0} />
          <Character x={690} y={1130} scale={0.72} {...CREW} {...despair} kneel={0.7} look={-14} seed={4} />
        </Lander>
      </Stage>
      <div style={{ position: "absolute", left: LABEL_X - 330, top: LABEL_Y - 40, width: 660, textAlign: "center", fontFamily: BUNGEE, fontSize: 44, color: M.ink }}>
        BUILT FOR 2 MEN · 2 DAYS
        <div style={{ position: "absolute", left: 0, right: 0, top: 26, height: 10, background: M.pink, transform: `scaleX(${clamp01(f / 10)})`, transformOrigin: "left" }} />
      </div>
      <Label text="NEEDED: 3 MEN · 4 DAYS" x={LABEL_X} y={LABEL_Y + 90} from={10} to={9999} size={48} />
    </AbsoluteFill>
  );
};

// 8. "Then a new killer. Carbon dioxide. Every breath makes the air more poisonous."
const Shot8: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tBreath = at(start, "Every breath");
  const v = clamp01(f / dur) * 0.95;
  const choke: Pose = { eyes: f >= tBreath ? "closed" : "wide", brow: 1, mouthShape: "wobble", sweat: 1, headTilt: 10, squash: 0.94 };
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false} spots={false}>
        <Cabin tint={0.05 + v * 0.35} window={<Earth x={800} y={480} r={36} />} />
        <Gauge x={540} y={640} v={v} s={1.2} />
        <Character x={260} y={GROUND} scale={0.75} {...CREW} {...choke} seed={1} look={10} />
        <Character x={540} y={GROUND} scale={0.8} {...LOVELL} {...choke} hands={{ l: [-40, -250], r: [40, -250] }} />
        <Character x={820} y={GROUND} scale={0.75} {...CREW} {...choke} seed={4} look={-10} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={100 + ((i * 97 + f * 2) % 880)} cy={400 + ((i * 131) % 600)} r={50 + (i % 3) * 30} fill={M.ink} opacity={0.05 + v * 0.08} />
        ))}
      </Stage>
      <Label text="CO2 RISING" x={LABEL_X} y={LABEL_Y} from={at(start, "Carbon dioxide")} to={9999} size={56} />
    </AbsoluteFill>
  );
};

// 9. "The spare filters are square. The holes are round." Square peg, round hole.
const Shot9: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tRound = at(start, "The holes");
  const push = Math.max(0, Math.sin(f / 4)) * 30;
  return (
    <Stage moon={false} floor={false}>
      <LightRings x={540} y={850} radii={[500, 380, 260]} colors={WARM} />
      <rect x={180} y={560} width={720} height={600} rx={30} fill={M.lilac} {...STROKE} />
      <circle cx={700} cy={860} r={110} fill={M.ink} />
      <g transform={`translate(${380 + push},860) rotate(${push / 6})`}>
        <rect x={-120} y={-120} width={240} height={240} fill={M.cream} {...STROKE} />
        {[-60, 0, 60].map((k) => (
          <line key={k} x1={k} y1={-110} x2={k} y2={110} stroke={M.ink} strokeWidth={4} opacity={0.4} />
        ))}
        <path d="M-280,-20 L-120,-30 M-280,30 L-120,20" stroke={M.amber} strokeWidth={28} strokeLinecap="round" />
      </g>
      {f >= tRound && (
        <g transform={`translate(540,860) scale(${pop(tRound)})`}>
          <path d="M-200,-200 L200,200 M200,-200 L-200,200" stroke={M.pink} strokeWidth={40} strokeLinecap="round" />
        </g>
      )}
    </Stage>
  );
};

// 10. "On Earth, engineers pile everything the astronauts have onto a table."
const Shot10: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tPile = at(start, "engineers pile");
  const run = clamp01((f - tPile) / 16);
  const dumped = f >= tPile + 20;
  const frantic: Pose = { eyes: "wide", brow: -0.6, mouthShape: "open", mouthOpen: 0.6, sweat: 1, lean: 10 };
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <Console x={200} w={300} />
        <rect x={420} y={GROUND - 170} width={480} height={30} fill={M.lilac} {...STROKE} />
        <rect x={450} y={GROUND - 140} width={30} height={140} fill={M.lilac} {...STROKE} />
        <rect x={840} y={GROUND - 140} width={30} height={140} fill={M.lilac} {...STROKE} />
        {dumped &&
          [[520, -230], [610, -220], [700, -240], [790, -215]].map(([x, y], i) => (
            <rect key={i} x={x - 30} y={GROUND + y - pop(tPile + 20 + i * 2) * 10} width={60} height={50} fill={i % 2 ? M.cream : M.lilac} {...STROKE} transform={`rotate(${(i - 1.5) * 15} ${x} ${GROUND + y})`} />
          ))}
        <Character x={lerp(-100, 560, run)} y={GROUND} scale={0.8} {...ENGINEER} {...frantic} walk={run < 1 ? 1 : 0} walkPhase={f * 0.6} hands={dumped ? { l: [80, -330], r: [180, -330] } : { l: [60, -250], r: [140, -250] }} held={dumped ? undefined : <rect x={-70} y={-60} width={140} height={110} fill={M.cream} {...STROKE} />} />
        <Character x={lerp(1200, 820, run)} y={GROUND} scale={0.78} {...ENGINEER} {...frantic} lean={-10} look={-14} walk={run < 1 ? 1 : 0} walkPhase={f * 0.6 + 1} seed={5} />
      </Stage>
      <Label text="HOUSTON" x={LABEL_X} y={LABEL_Y} from={2} to={9999} size={58} />
    </AbsoluteFill>
  );
};

// 11. "Duct tape. Plastic bags. The cover of the flight plan." Items pop onto the table.
const Shot11: React.FC<ShotProps> = ({ start }) => {
  const { pop } = useLocal();
  const tBag = at(start, "Plastic bags");
  const tPlan = at(start, "The cover");
  return (
    <Stage moon={false} floor={false}>
      <rect x={60} y={1000} width={960} height={40} fill={M.lilac} {...STROKE} />
      <g transform={`translate(240,880) scale(${pop(0)})`}>
        <Tape x={0} y={0} s={1.3} />
      </g>
      <g transform={`translate(540,860) scale(${pop(tBag)})`}>
        <Bag x={0} y={0} s={1.2} />
      </g>
      <g transform={`translate(820,860) scale(${pop(tPlan)})`}>
        <FlightPlan x={0} y={0} s={1} />
      </g>
    </Stage>
  );
};

// 12. "They build a fix, and talk the crew through it," Split: engineer reading, astronaut taping.
const Shot12: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tTalk = at(start, "and talk");
  const tape = clamp01(f / 70);
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <AbsoluteFill style={{ height: SH / 2, overflow: "hidden" }}>
        <svg width={SW} height={SH / 2} viewBox={`0 0 ${SW} ${SH / 2}`}>
          <rect width={SW} height={SH / 2} fill={M.night} />
          <g style={{ filter: OFFSET }}>
            <Console x={760} w={360} />
            <g transform="translate(0,-200)">
              <Character x={380} y={GROUND} scale={0.8} {...CONTROLLER} mouthShape={f >= tTalk ? "open" : "line"} mouthOpen={0.3 + 0.3 * Math.abs(Math.sin(f / 3))} brow={-0.4} look={14} hands={{ r: [150, -300] }} held={undefined} />
              <rect x={490} y={GROUND - 300 * 0.8 - 120} width={110} height={140} fill={WHITE} {...STROKE} transform={`rotate(-8 545 ${GROUND - 300})`} />
            </g>
          </g>
          <line x1={0} y1={SH / 2 - 4} x2={SW} y2={SH / 2 - 4} stroke={M.ink} strokeWidth={12} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: SH / 2, height: SH / 2, overflow: "hidden" }}>
        <svg width={SW} height={SH / 2} viewBox={`0 0 ${SW} ${SH / 2}`}>
          <rect width={SW} height={SH / 2} fill={M.lilac} />
          <g style={{ filter: OFFSET }}>
            <Mailbox x={720} y={260} s={0.9} tape={tape} />
            <g transform="translate(0,-720)">
              <Character x={330} y={GROUND} scale={0.75} {...LOVELL} eyes="squint" mouthShape="teeth" brow={-0.8} sweat={1} lean={10} hands={{ l: [180, -250 + Math.sin(f / 2) * 10], r: [250, -200] }} look={14} />
            </g>
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 13. "step by step. It works." The real NASA photo of the improvised filter.
const PHOTO = { src: "photos/nasa-as13-62-8929-mailbox.jpg", focusX: 0.38, focusY: 0.42, credit: "NASA PHOTO AS13-62-8929" };
const ShotPhoto: React.FC<ShotProps> = ({ start }) => {
  const { f, pop, dur } = useLocal();
  const tWorks = at(start, "It works");
  const enter = pop(0, 11);
  const zoom = 1.05 + 0.2 * clamp01(f / dur);
  const boxW = 860;
  const boxH = 940;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={800} radii={[620, 480, 340]} colors={WARM} />
      </svg>
      <div style={{ position: "absolute", left: (SW - boxW) / 2 - 20, top: 290, width: boxW, height: boxH, border: `10px solid ${M.ink}`, boxShadow: `14px 14px 0 ${M.shadow}`, background: M.ink, overflow: "hidden", transform: `rotate(${2 + (1 - enter) * 6}deg) scale(${0.85 + 0.15 * enter})` }}>
        <Img src={staticFile(PHOTO.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${PHOTO.focusX * 100}% ${PHOTO.focusY * 100}%`, transform: `scale(${zoom})`, transformOrigin: `${PHOTO.focusX * 100}% ${PHOTO.focusY * 100}%`, filter: "saturate(0.8) contrast(1.05)" }} />
      </div>
      <Label text="THE REAL FIX · APRIL 1970" x={LABEL_X} y={225} from={3} to={9999} size={40} />
      {f >= tWorks && <Label text="IT WORKED" x={LABEL_X + 120} y={1080} from={tWorks} to={9999} size={56} />}
      <div style={{ position: "absolute", top: 290 + boxH + 28, left: SAFE.left, width: SW - SAFE.left - SAFE.right, textAlign: "center", fontFamily: BUNGEE, fontSize: 26, color: M.ink, opacity: clamp01((f - 6) / 8) }}>
        {PHOTO.credit}
      </div>
    </AbsoluteFill>
  );
};

// 14. "Freezing and exhausted, they head home." Shivering, breath clouds, Earth growing.
const Shot14: React.FC<ShotProps> = () => {
  const { f, dur } = useLocal();
  const cold: Pose = { eyes: "closed", brow: 1, mouthShape: "teeth", shake: 2.5, hands: { l: [40, -240], r: [-40, -240] }, squash: 0.95 };
  const breath = (x: number, k: number) => {
    const t = ((f + k * 17) % 40) / 40;
    return <ellipse key={k} cx={x + 50 + t * 60} cy={GROUND - 260 - t * 60} rx={20 + t * 30} ry={14 + t * 20} fill={WHITE} opacity={0.8 * (1 - t)} />;
  };
  return (
    <Stage moon={false} floor={false} spots={false}>
      <Cabin window={<Earth x={800} y={480} r={lerp(40, 110, clamp01(f / dur))} />} />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={700 + ((i * 53) % 200)} cy={360 + ((i * 37) % 240)} r={3} fill={WHITE} />
      ))}
      <Character x={240} y={GROUND} scale={0.75} {...CREW} {...cold} seed={1} look={10} />
      <Character x={520} y={GROUND} scale={0.8} {...LOVELL} {...cold} seed={2} />
      {[240, 520].map((x, i) => breath(x, i))}
    </Stage>
  );
};

// 15. "Re-entry." The capsule falls, wrapped in fire.
const Shot15: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const y = lerp(500, 900, clamp01(f / 40));
  return (
    <AbsoluteFill>
      <Space>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={540 + (i - 5) * 40} y1={y - 120 - ((f * 30 + i * 70) % 500)} x2={540 + (i - 5) * 40} y2={y - 220 - ((f * 30 + i * 70) % 500)} stroke={WHITE} strokeWidth={4} opacity={0.6} />
        ))}
        <g transform={`translate(540,${y})`}>
          <path d={`M-140,40 Q0,${220 + Math.sin(f) * 20} 140,40 Z`} fill={M.pink} />
          <path d={`M-100,40 Q0,${160 + Math.sin(f * 1.3) * 16} 100,40 Z`} fill={WHITE} />
          <path d="M-110,40 L-40,-120 L40,-120 L110,40 Z" fill={WHITE} stroke={M.ink} strokeWidth={6} />
          <rect x={-115} y={30} width={230} height={22} fill={M.ink} />
        </g>
      </Space>
      <Label text="RE-ENTRY" x={LABEL_X} y={LABEL_Y} from={2} to={9999} size={60} />
    </AbsoluteFill>
  );
};

// 16. "Radio silence. Four minutes. Five." Mission Control frozen; a timer runs.
const Shot16: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tFour = at(start, "Four minutes");
  const tFive = at(start, "Five");
  const time = f >= tFive ? "5:00" : f >= tFour ? "4:00" : `3:${String(Math.min(59, 40 + Math.floor(f / 2))).padStart(2, "0")}`;
  const tense: Pose = { eyes: "wide", brow: 1, mouthShape: "wobble", sweat: 1, hands: { l: [-30, -280], r: [30, -280] }, fists: true };
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <rect x={420} y={420} width={240} height={160} rx={20} fill={M.ink} />
        {[0, 1, 2, 3, 4].map((k) => (
          <circle key={k} cx={470 + k * 35} cy={500} r={10} fill={M.lilac} />
        ))}
        <Character x={200} y={GROUND} scale={0.78} {...CONTROLLER} {...tense} look={14} seed={1} />
        <Character x={420} y={GROUND} scale={0.8} {...ENGINEER} {...tense} look={10} seed={2} />
        <Character x={660} y={GROUND} scale={0.8} {...CONTROLLER} {...tense} look={-10} seed={3} />
        <Character x={880} y={GROUND} scale={0.78} {...ENGINEER} {...tense} look={-14} seed={4} />
      </Stage>
      <div style={{ position: "absolute", left: 0, width: SW, top: 230, textAlign: "center", fontFamily: BUNGEE, fontSize: 130, color: M.pink, WebkitTextStroke: `10px ${M.ink}`, paintOrder: "stroke fill" }}>{time}</div>
    </AbsoluteFill>
  );
};

// 17. "Then a voice. Splashdown!" Parachutes, then Mission Control erupts.
const Shot17: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tSplash = at(start, "Splashdown");
  if (f < tSplash) {
    const open = pop(4, 12);
    return (
      <Stage moon={false} floor={false}>
        {[380, 540, 700].map((x, i) => (
          <g key={i} transform={`translate(${x},${560 - (i % 2) * 40}) scale(${open})`}>
            <path d="M-140,0 A140,110 0 0 1 140,0 Z" fill={i % 2 ? WHITE : M.pink} {...STROKE} />
            <path d="M-70,0 A70,110 0 0 1 70,0" fill="none" stroke={M.ink} strokeWidth={4} />
            <line x1={-140} y1={0} x2={540 - x} y2={440} stroke={M.ink} strokeWidth={3} />
            <line x1={140} y1={0} x2={540 - x} y2={440} stroke={M.ink} strokeWidth={3} />
          </g>
        ))}
        <path d="M460,1040 L500,960 L580,960 L620,1040 Z" fill={WHITE} {...STROKE} />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${(k * 300 + f * 3) % 1300 - 150},1120 q40,-24 80,0 t80,0`} stroke={M.ink} strokeWidth={6} fill="none" />
        ))}
      </Stage>
    );
  }
  const lf = f - tSplash;
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        {Array.from({ length: 16 }, (_, i) => {
          const t = ((lf * 2 + i * 20) % 120) / 120;
          return <rect key={i} x={80 + ((i * 131) % 900)} y={300 + t * 800} width={60} height={80} fill={WHITE} stroke={M.ink} strokeWidth={3} transform={`rotate(${t * 360 + i * 20} ${110 + ((i * 131) % 900)} ${340 + t * 800})`} />;
        })}
        {[180, 420, 660, 900].map((x, i) => (
          <Character key={x} x={x} y={GROUND} scale={0.78} {...(i % 2 ? ENGINEER : CONTROLLER)} {...EMOTE.joy} fx="none" jump={Math.abs(Math.sin(lf / 4 + i)) * 50} seed={i} look={(i - 1.5) * -8} />
        ))}
      </Stage>
      <Label text="SPLASHDOWN!" x={LABEL_X} y={LABEL_Y} from={0} to={9999} size={70} />
    </AbsoluteFill>
  );
};

// 18. "NASA calls it a successful failure." The crew safe on the recovery ship.
const Shot18: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 820, y: 420 }}>
        <rect x={0} y={GROUND - 30} width={SW} height={30} fill={M.ink} />
        {[200, 0, 400].map((dx, i) => (
          <Character key={i} x={300 + dx * 0.9} y={GROUND - 30} scale={i === 1 ? 0.85 : 0.78} {...(i === 1 ? LOVELL : CREW)} eyes="happy" mouthShape="open" mouthOpen={0.6} mouth={1} hands={{ l: [-80, -165], r: [120, -400 + Math.sin(f / 4 + i) * 30] }} seed={i} look={0} />
        ))}
      </Stage>
      <Label text="APRIL 17, 1970" x={LABEL_X} y={LABEL_Y} from={2} to={9999} size={54} />
    </AbsoluteFill>
  );
};

// 19. End card with the mascot.
const Shot19: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const lines = ["APOLLO", "13."];
  const total = lines.join("").length;
  const typed = Math.min(total, Math.floor(f / 2) + 1);
  const under = clamp01((f - total * 2) / 10);
  let used = 0;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={860} radii={[520, 400, 290, 190]} colors={WARM} dots={{ r: 300, color: M.pink }} />
      </svg>
      <div style={{ position: "absolute", top: 600, width: SW, textAlign: "center", fontFamily: BUNGEE, fontSize: 170, lineHeight: 1.05, color: M.cream, WebkitTextStroke: `16px ${M.ink}`, paintOrder: "stroke fill" }}>
        {lines.map((l, i) => {
          const show = l.slice(0, Math.max(0, typed - used));
          used += l.length;
          return <div key={i}>{show || " "}</div>;
        })}
      </div>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <path d={Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${200 + i * 17},${1010 + Math.sin(i * 0.6 + f * 0.3) * 14}`).join(" ")} fill="none" stroke={M.pink} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - under} />
        <g style={{ filter: OFFSET }}>
          <InkDrop x={540} y={1340} s={1.1} mood="cheer" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const SHOTS = [Shot1, Shot2, Shot3, Shot4, Shot5, Shot6, Shot7, Shot8, Shot9, Shot10, Shot11, Shot12, ShotPhoto, Shot14, Shot15, Shot16, Shot17, Shot18, Shot19];

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
const SoundTrack: React.FC = () => {
  const C = CUTS;
  return (
    <>
      <Audio src={staticFile("voice/apollo13.mp3")} volume={1} />
      <Audio src={staticFile("sfx/roomtone.wav")} volume={0.12} loop />
      <Sfx name="boom" at={cue("explodes")} vol={0.55} len={80} />
      <Sfx name="hum" at={C[1]} vol={0.08} len={130} />
      <Sfx name="boom" at={cue("bang")} vol={0.6} len={70} />
      <Sfx name="alarm" at={cue("bang") + 8} vol={0.25} len={60} />
      <Sfx name="static" at={cue("Houston")} vol={0.2} />
      <Sfx name="hiss" at={C[3]} vol={0.4} len={30} rate={0.7} />
      <Sfx name="hiss" at={C[3] + 28} vol={0.35} len={30} rate={0.6} />
      <Sfx name="impact" at={cue("The Moon landing")} vol={0.3} />
      <Sfx name="rumble" at={C[4]} vol={0.3} />
      <Sfx name="stamp" at={C[6] + 2} vol={0.4} />
      <Sfx name="pop" at={C[6] + 10} vol={0.35} />
      <Sfx name="heartbeat" at={C[7]} vol={0.4} len={75} />
      <Sfx name="alarm" at={cue("Every breath")} vol={0.15} len={50} />
      <Sfx name="boing" at={C[8] + 6} vol={0.4} />
      <Sfx name="boing" at={C[8] + 30} vol={0.35} rate={0.9} />
      <Sfx name="impact" at={cue("The holes")} vol={0.3} />
      <Sfx name="step" at={cue("engineers pile")} vol={0.3} len={8} />
      <Sfx name="step" at={cue("engineers pile") + 6} vol={0.3} len={8} />
      <Sfx name="slam" at={cue("engineers pile") + 20} vol={0.4} />
      <Sfx name="pop" at={C[10]} vol={0.4} />
      <Sfx name="pop" at={cue("Plastic bags")} vol={0.4} />
      <Sfx name="pop" at={cue("The cover")} vol={0.4} />
      <Sfx name="static" at={cue("and talk")} vol={0.18} />
      <Sfx name="scribble" at={C[11] + 10} vol={0.25} />
      <Sfx name="click" at={C[12]} vol={0.5} />
      <Sfx name="shimmer" at={cue("It works")} vol={0.4} />
      <Sfx name="hiss" at={C[13]} vol={0.15} len={80} rate={0.5} />
      <Sfx name="rumble" at={C[14]} vol={0.6} />
      <Sfx name="heartbeat" at={C[15]} vol={0.6} len={80} />
      <Sfx name="static" at={C[16]} vol={0.35} />
      <Sfx name="splash" at={cue("Splashdown")} vol={0.5} />
      <Sfx name="cheer" at={cue("Splashdown") + 4} vol={0.5} len={80} />
      <Sfx name="shimmer" at={C[17]} vol={0.25} />
      {Array.from({ length: 9 }, (_, i) => <Sfx key={`t${i}`} name="type" at={C[18] + i * 2} vol={0.4} len={6} />)}
    </>
  );
};

export const Apollo13: React.FC = () => (
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
