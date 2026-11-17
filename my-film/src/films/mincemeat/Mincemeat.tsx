import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Character, EMOTE, Pose } from "../../components/Character";
import { UiContext, clamp01, lerp } from "../../components/theme";
import { BUNGEE, Captions, GOLD, Label, LightRings, M, MEMPHIS_UI, OFFSET, SAFE, SH, SW, WARM, skin } from "../../components/memphis";
import { Flash, GROUND, Sfx, SpeedLines, STROKE, Stage, makeCues, useLocal } from "../../components/shortkit";
import { INK_MAIN, INK_SIDE, InkDrop } from "../../components/mascot";
import { BRITISH_PATCH, GERMAN_PATCH } from "../../components/insignia";
import { WORDS } from "./words";

export const MINCEMEAT_DURATION = 1800;
const CAPTION_Y = 1500;
const LABEL_X = (SAFE.left + SW - SAFE.right) / 2;
const LABEL_Y = 330;
const WHITE = "#FFFFFF";

const { cue, end: VOICE_END } = makeCues(WORDS);
const T_APRIL = cue("April 1943");
const CUTS = [
  0,
  21, // intro cut 2: briefcase
  43, // intro cut 3: the question-mark man
  T_APRIL,
  cue("So spies"),
  cue("They give"),
  cue("A theatre"),
  cue("Then they tuck"),
  cue("There's just"),
  cue("A fisherman"),
  cue("Spain hands"),
  cue("They read"),
  cue("Hitler believes"),
  cue("July"),
  cue("So who was"),
  cue("His real"),
  cue("He never fought"),
  cue("Hitler trusted"),
  cue("So who tricked", cue("Hitler trusted")),
  MINCEMEAT_DURATION,
];
type ShotProps = { start: number };
const at = (start: number, phrase: string) => cue(phrase, start) - start;
/** Squash "pop" when a character snaps into a new emotion. */
const snap = (f: number, t: number) => (f < t ? 1 : 1 + 0.14 * Math.exp(-(f - t) / 4) * Math.cos((f - t) * 0.9));
const ease = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

// ---------------------------------------------------------------------------
// Cast. Glyndwr Michael is the main character (red, neckerchief), shown only from "his real name".
// Before that, "Major Martin" is a flat paper cut-out.
// ---------------------------------------------------------------------------
const Glasses = (
  <g>
    <circle cx={-26} cy={-6} r={20} fill="none" stroke={M.ink} strokeWidth={6} />
    <circle cx={30} cy={-6} r={20} fill="none" stroke={M.ink} strokeWidth={6} />
    <line x1={-6} y1={-6} x2={10} y2={-6} stroke={M.ink} strokeWidth={6} />
  </g>
);
const Moustache = <path d="M-30,30 Q-14,18 0,26 Q14,18 30,30 Q14,34 0,28 Q-14,34 -30,30 Z" fill={M.ink} />;
const Beard = <path d="M-70,20 Q-60,90 0,96 Q60,90 70,20 Q40,56 0,54 Q-40,56 -70,20 Z" fill={M.lilac} stroke={M.ink} strokeWidth={5} />;
const Sash = <path d="M-46,4 L46,110 L30,120 L-56,18 Z" fill={M.lilac} stroke={M.ink} strokeWidth={4} />;
/** Glyndwr's worn coat: a sewn-on patch and a torn collar. */
const WornCoat = (
  <g>
    <rect x={14} y={58} width={34} height={30} fill={M.lilac} stroke={M.ink} strokeWidth={4} transform="rotate(8 31 73)" />
    {[0, 1, 2].map((k) => (
      <line key={k} x1={18 + k * 12} y1={56} x2={20 + k * 12} y2={64} stroke={M.ink} strokeWidth={3} />
    ))}
    <path d="M-40,104 L-30,96 L-22,106 L-12,98" fill="none" stroke={M.ink} strokeWidth={4} />
  </g>
);

const MONTAGU: Pose = { ...INK_SIDE, hat: Glasses, chest: BRITISH_PATCH };
const SPY2: Pose = { ...INK_SIDE, hat: Moustache, chest: BRITISH_PATCH };
const GERMAN: Pose = { ...INK_SIDE, chest: GERMAN_PATCH };
const SPANIARD: Pose = { ...INK_SIDE, chest: Sash, hat: Moustache };
const FISHER: Pose = { ...INK_SIDE, hat: Beard };
const GLYNDWR: Pose = { ...INK_MAIN, chest: WornCoat };
const BRIT_SKIN = skin(WHITE);
const GER_SKIN = skin(M.lilac);
const RED_SKIN = skin(M.pink);

const DOLL_PATH =
  "M-45,0 L-8,0 L-8,-185 L8,-185 L8,0 L45,0 L45,-200 L80,-200 L80,-230 L120,-230 L120,-400 L90,-420 L25,-425 L25,-440 L60,-452 L70,-520 L45,-578 L-45,-578 L-70,-520 L-60,-452 L-25,-440 L-25,-425 L-90,-420 L-120,-400 L-120,-230 L-80,-230 L-80,-200 L-45,-200 Z";

/** "Major William Martin": a flat paper cut-out officer. Origin at his feet. */
const PaperMan: React.FC<{
  x: number;
  y: number;
  s?: number;
  face?: "none" | "dots" | "q";
  sag?: number;
  rot?: number;
  cut?: number;
  fill?: string;
  qPop?: number;
}> = ({ x, y, s = 1, face = "dots", sag = 0, rot = 0, cut = 1, fill = WHITE, qPop = 1 }) => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 14) * 1.2 * (1 - sag);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot + sway - sag * 14}) scale(${s},${s * (1 - sag * 0.12)})`}>
      <path d={DOLL_PATH} fill={fill} {...STROKE} />
      {/* the cut line, drawn in while the scissors go round */}
      <path d={DOLL_PATH} fill="none" stroke={M.ink} strokeWidth={4} strokeDasharray="14 12" transform="scale(1.09,1.04) translate(0,6)" opacity={cut} />
      {/* uniform: tie, buttons, belt, shoulder boards */}
      <path d="M-10,-424 L10,-424 L6,-404 L14,-330 L0,-314 L-14,-330 L-6,-404 Z" fill={M.ink} />
      {[-380, -330, -280].map((by) => (
        <circle key={by} cx={44} cy={by} r={7} fill={M.ink} />
      ))}
      <rect x={-80} y={-262} width={160} height={16} fill={M.lilac} stroke={M.ink} strokeWidth={4} />
      <rect x={-112} y={-414} width={44} height={14} fill={M.ink} />
      <rect x={68} y={-414} width={44} height={14} fill={M.ink} />
      {face === "dots" && (
        <g>
          <circle cx={-22} cy={-515} r={7} fill={M.ink} />
          <circle cx={22} cy={-515} r={7} fill={M.ink} />
          <line x1={-16} y1={-482} x2={16} y2={-482} stroke={M.ink} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
      {face === "q" && (
        <text x={0} y={-468} textAnchor="middle" fontFamily={BUNGEE} fontSize={120} fill={M.pink} stroke={M.ink} strokeWidth={6} paintOrder="stroke" transform={`translate(0,-510) scale(${qPop}) translate(0,510)`}>
          ?
        </text>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
const Briefcase: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-50,-130 L-50,-170 Q-50,-186 -34,-186 L34,-186 Q50,-186 50,-170 L50,-130" fill="none" stroke={M.ink} strokeWidth={18} strokeLinecap="round" />
    <rect x={-170} y={-130} width={340} height={210} rx={16} fill={M.ink} />
    <g transform={`translate(0,-130) scale(1,${1 - open * 1.8}) translate(0,130)`}>
      <rect x={-170} y={-130} width={340} height={64} rx={14} fill={M.ink} stroke={WHITE} strokeWidth={4} />
    </g>
    <rect x={-26} y={-82} width={52} height={30} rx={6} fill={M.lilac} stroke={WHITE} strokeWidth={3} />
    <rect x={-150} y={20} width={300} height={10} fill={WHITE} opacity={0.25} />
  </g>
);
const Envelope: React.FC<{ x: number; y: number; s?: number; r?: number; secret?: boolean }> = ({ x, y, s = 1, r = 0, secret = true }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <rect x={-110} y={-70} width={220} height={140} fill={WHITE} {...STROKE} />
    <path d="M-110,-70 L0,10 L110,-70" fill="none" stroke={M.ink} strokeWidth={5} />
    {secret && (
      <g transform="rotate(-10)">
        <rect x={-80} y={14} width={160} height={40} fill="none" stroke={M.pink} strokeWidth={5} />
        <text x={0} y={46} textAnchor="middle" fontFamily={BUNGEE} fontSize={30} fill={M.pink}>SECRET</text>
      </g>
    )}
  </g>
);
const PamPhoto: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <rect x={-170} y={-220} width={340} height={440} fill={WHITE} {...STROKE} />
    <rect x={-136} y={-186} width={272} height={300} fill={M.lilac} stroke={M.ink} strokeWidth={5} />
    {/* Pam: a drawn portrait, not a character */}
    <path d="M-80,114 Q-90,0 0,-6 Q90,0 80,114 Z" fill={WHITE} stroke={M.ink} strokeWidth={5} />
    <path d="M-74,-60 Q-80,-150 0,-150 Q80,-150 74,-60 L80,10 Q60,-10 56,-60 L-56,-60 Q-60,-10 -80,10 Z" fill={M.ink} />
    <ellipse cx={0} cy={-62} rx={56} ry={66} fill={WHITE} stroke={M.ink} strokeWidth={5} />
    <path d="M-58,-90 Q0,-150 58,-90 Q20,-104 -58,-90 Z" fill={M.ink} />
    <circle cx={-20} cy={-62} r={6} fill={M.ink} />
    <circle cx={20} cy={-62} r={6} fill={M.ink} />
    <path d="M-18,-30 Q0,-16 18,-30" stroke={M.pink} strokeWidth={6} fill="none" strokeLinecap="round" />
    <text x={0} y={180} textAnchor="middle" fontFamily={BUNGEE} fontSize={44} fill={M.ink}>LOVE, PAM</text>
  </g>
);
const Letters: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[2, 1, 0].map((k) => (
      <g key={k} transform={`translate(${k * 18},${-k * 22}) rotate(${(k - 1) * 6})`}>
        <rect x={-200} y={-130} width={400} height={260} fill={WHITE} {...STROKE} />
        <path d="M-200,-130 L0,20 L200,-130" fill="none" stroke={M.ink} strokeWidth={5} />
      </g>
    ))}
    <rect x={-16} y={-176} width={32} height={300} fill={M.pink} stroke={M.ink} strokeWidth={4} />
    <path d="M0,-60 C-30,-110 -90,-60 0,0 C90,-60 30,-110 0,-60 Z" fill={M.pink} stroke={M.ink} strokeWidth={5} />
  </g>
);
const Ticket: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <path d="M-260,-110 L260,-110 L260,-40 Q230,0 260,40 L260,110 L-260,110 L-260,40 Q-230,0 -260,-40 Z" fill={WHITE} {...STROKE} />
    <line x1={120} y1={-110} x2={120} y2={110} stroke={M.ink} strokeWidth={5} strokeDasharray="12 10" />
    <text x={-60} y={-20} textAnchor="middle" fontFamily={BUNGEE} fontSize={58} fill={M.ink}>THEATRE</text>
    <text x={-60} y={50} textAnchor="middle" fontFamily={BUNGEE} fontSize={40} fill={M.pink}>ADMIT ONE</text>
    <text x={190} y={18} textAnchor="middle" fontFamily={BUNGEE} fontSize={46} fill={M.ink}>No 2</text>
  </g>
);
const BankSlip: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <rect x={-280} y={-180} width={560} height={360} fill={WHITE} {...STROKE} />
    <text x={-240} y={-110} fontFamily={BUNGEE} fontSize={40} fill={M.ink}>BANK NOTICE</text>
    {[-60, -20].map((ly) => (
      <line key={ly} x1={-240} y1={ly} x2={240} y2={ly} stroke={M.lilac} strokeWidth={8} />
    ))}
    <text x={-240} y={60} fontFamily={BUNGEE} fontSize={44} fill={M.ink}>OVERDRAWN:</text>
    <text x={0} y={140} textAnchor="middle" fontFamily={BUNGEE} fontSize={76} fill={M.pink}>£79 19s 2d</text>
  </g>
);
const Waves: React.FC<{ y: number; f: number; dark?: boolean }> = ({ y, f, dark = true }) => (
  <g>
    <rect x={-200} y={y} width={SW + 400} height={SH - y + 400} fill={dark ? M.ink : M.lilac} />
    {[0, 1, 2, 3, 4, 5].map((row) =>
      Array.from({ length: 7 }, (_, i) => {
        const wx = ((i * 190 + row * 70 + f * (1.5 + row * 0.3)) % 1400) - 200;
        const wy = y + 40 + row * 70;
        return <path key={`${row}-${i}`} d={`M${wx},${wy} q24,-16 48,0 t48,0`} stroke={dark ? WHITE : M.ink} strokeWidth={5} fill="none" opacity={dark ? 0.55 - row * 0.06 : 0.7} />;
      }),
    )}
  </g>
);
const Seagull: React.FC<{ x: number; y: number; s?: number; f: number; fly?: boolean }> = ({ x, y, s = 1, f, fly }) => {
  const flap = fly ? Math.sin(f * 0.9) * 26 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {!fly && <line x1={-6} y1={10} x2={-8} y2={34} stroke={M.ink} strokeWidth={5} />}
      {!fly && <line x1={8} y1={10} x2={10} y2={34} stroke={M.ink} strokeWidth={5} />}
      <ellipse cx={0} cy={0} rx={40} ry={22} fill={WHITE} {...STROKE} />
      <circle cx={34} cy={-22} r={16} fill={WHITE} stroke={M.ink} strokeWidth={5} />
      <circle cx={38} cy={-25} r={3.5} fill={M.ink} />
      <path d="M48,-22 L68,-17 L48,-12 Z" fill={M.pink} stroke={M.ink} strokeWidth={3} />
      <path d={`M-14,-6 Q-34,${-30 - flap} -58,${-6 - flap * 0.6}`} stroke={M.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};
const Barrel: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70,-180 Q-90,-90 -70,0 L70,0 Q90,-90 70,-180 Z" fill={M.lilac} {...STROKE} />
    <line x1={-82} y1={-130} x2={82} y2={-130} stroke={M.ink} strokeWidth={8} />
    <line x1={-82} y1={-50} x2={82} y2={-50} stroke={M.ink} strokeWidth={8} />
  </g>
);
const Boat: React.FC<{ x: number; y: number; s?: number; f: number; crew?: number }> = ({ x, y, s = 1, f, crew = 3 }) => (
  <g transform={`translate(${x},${y + Math.sin(f / 7 + x) * 6}) scale(${s})`}>
    {Array.from({ length: crew }, (_, i) => (
      <g key={i} transform={`translate(${-110 + i * 90},-120)`}>
        <path d="M0,-90 C16,-60 40,-46 40,-22 C40,0 20,10 0,10 C-20,10 -40,0 -40,-22 C-40,-46 -16,-60 0,-90 Z" fill={WHITE} {...STROKE} />
        <circle cx={-10} cy={-26} r={6} fill={M.ink} />
        <circle cx={12} cy={-26} r={6} fill={M.ink} />
      </g>
    ))}
    <path d="M-220,-110 L220,-110 L190,0 L-180,0 Z" fill={WHITE} {...STROKE} />
    <path d="M220,-110 L250,-150 L250,-40 L190,0 Z" fill={M.lilac} {...STROKE} />
    <line x1={-200} y1={-70} x2={200} y2={-70} stroke={M.ink} strokeWidth={5} />
  </g>
);
const Submarine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-320,0 Q-320,-60 -240,-60 L260,-60 Q340,-50 340,0 Z" fill={M.lilac} stroke={WHITE} strokeWidth={5} />
    <path d="M-60,-60 L-40,-150 L80,-150 L100,-60 Z" fill={M.lilac} stroke={WHITE} strokeWidth={5} />
    <line x1={20} y1={-150} x2={20} y2={-210} stroke={WHITE} strokeWidth={6} />
  </g>
);
const StreetLamp: React.FC<{ x: number; on: number }> = ({ x, on }) => (
  <g>
    <rect x={x - 10} y={GROUND - 640} width={20} height={640} fill={M.ink} />
    <path d={`M${x - 50},${GROUND - 640} L${x + 50},${GROUND - 640} L${x + 34},${GROUND - 720} L${x - 34},${GROUND - 720} Z`} fill={on > 0.5 ? WHITE : M.lilac} {...STROKE} />
    <path d={`M${x - 44},${GROUND - 720} L${x},${GROUND - 760} L${x + 44},${GROUND - 720} Z`} fill={M.ink} />
  </g>
);

/** The Mediterranean on a white sheet, in sheet coordinates 0..900 × 0..700. */
const LAND = {
  spain: "M0,90 L200,70 L240,120 L215,230 L170,310 L80,330 L20,320 L0,250 Z",
  france: "M0,0 L420,0 L400,40 L330,70 L250,60 L200,70 L0,90 Z",
  italy: "M420,0 L470,40 L460,90 L520,170 L600,240 L660,280 L640,300 L590,280 L600,330 L570,350 L540,300 L480,220 L430,150 L410,70 L400,40 Z",
  sicily: "M515,382 L625,368 L585,436 Z",
  greece: "M680,110 L900,96 L900,420 L850,470 L805,440 L825,386 L772,346 L742,262 L700,200 Z",
  africa: "M0,560 L120,500 L260,520 L380,480 L520,500 L620,560 L740,600 L900,620 L900,700 L0,700 Z",
};
const PLACE = { sicily: [570, 400], sardinia: [360, 250], greece: [800, 300], africa: [480, 560], huelva: [40, 318] } as const;
const MedMap: React.FC<{
  x: number;
  y: number;
  s?: number;
  hot?: "sicily" | "none";
  children?: React.ReactNode;
  names?: boolean;
}> = ({ x, y, s = 1, hot = "sicily", children, names = true }) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.25 * Math.abs(Math.sin(f / 6));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-30} y={-30} width={960} height={760} fill={WHITE} {...STROKE} />
      {Object.entries(LAND).map(([k, d]) => (
        <path key={k} d={d} fill={M.night} stroke={M.ink} strokeWidth={5} strokeLinejoin="round" />
      ))}
      <ellipse cx={360} cy={250} rx={32} ry={70} fill={M.night} stroke={M.ink} strokeWidth={5} />
      <ellipse cx={372} cy={140} rx={18} ry={38} fill={M.night} stroke={M.ink} strokeWidth={5} />
      {names && (
        <g fontFamily={BUNGEE} fill={M.ink}>
          <text x={50} y={200} fontSize={34}>SPAIN</text>
          <text x={490} y={480} fontSize={30}>SICILY</text>
          <text x={260} y={360} fontSize={26}>SARDINIA</text>
          <text x={720} y={250} fontSize={30}>GREECE</text>
        </g>
      )}
      {hot === "sicily" && <circle cx={570} cy={400} r={18 * pulse} fill={M.pink} stroke={M.ink} strokeWidth={4} />}
      {children}
    </g>
  );
};
const Arrow: React.FC<{ from: readonly [number, number]; to: readonly [number, number]; p: number; w?: number }> = ({ from, to, p, w = 20 }) => {
  if (p <= 0) return null;
  const [x1, y1] = from;
  const [x2, y2] = to;
  const ex = lerp(x1, x2, p);
  const ey = lerp(y1, y2, p);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = w * 2.2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={M.pink} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${ex + Math.cos(a) * h},${ey + Math.sin(a) * h} L${ex + Math.cos(a + 2.3) * h},${ey + Math.sin(a + 2.3) * h} L${ex + Math.cos(a - 2.3) * h},${ey + Math.sin(a - 2.3) * h} Z`} fill={M.pink} stroke={M.ink} strokeWidth={4} />
    </g>
  );
};
/** A flat stage with no floor: a close-up on paper. */
const Close: React.FC<{ children: React.ReactNode; cam?: { s: number; x: number; y: number }; back?: React.ReactNode }> = ({ children, cam, back }) => (
  <Stage moon={false} floor={false} cam={cam} back={back}>
    {children}
  </Stage>
);
const push = (f: number, dur: number, s0 = 1, s1 = 1.12) => lerp(s0, s1, ease(f / dur));

/** Small counter in the top left: the date in the story. */
const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const t13 = CUTS[14];
  if (f < T_APRIL || f >= CUTS[18]) return null;
  let text = "APRIL 1943";
  if (f >= CUTS[10]) text = "MAY 1943";
  if (f >= CUTS[13]) text = "JULY 1943";
  if (f >= t13) {
    const a = cue("For more");
    const b = cue("nobody knew", a) + 6;
    const year = Math.round(lerp(1943, 1996, ease((f - a) / (b - a))));
    text = `YEAR ${f < a ? 1943 : year}`;
  }
  return (
    <div style={{ position: "absolute", left: SAFE.left + 10, top: 210, fontFamily: BUNGEE, fontSize: 42, color: WHITE, background: M.ink, border: `5px solid ${M.ink}`, boxShadow: `8px 8px 0 ${M.pink}`, padding: "4px 16px" }}>
      {text}
    </div>
  );
};
const ItemPop: React.FC<{ n: number; from: number }> = ({ n, from }) => <Label text={`ITEM ${n}`} x={810} y={470} from={from} to={9999} size={48} color={WHITE} />;

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
// 1a. Intro: a dark sea, something floating. Push in.
const Shot1a: React.FC<ShotProps> = () => {
  const { f, dur } = useLocal();
  const bob = Math.sin(f / 5) * 8;
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 760, y: 470 }} floor={false} spots={false} cam={{ s: push(f, dur, 1.1, 1.5), x: 540, y: 1000 }}>
        <Waves y={1000} f={f} />
        <PaperMan x={740} y={1040 + bob} s={0.7} rot={-90} face="none" cut={0} />
      </Stage>
      <Label text="WHO?" x={LABEL_X} y={LABEL_Y} from={4} to={9999} size={70} />
    </AbsoluteFill>
  );
};
// 1b. Intro: close-up of the briefcase handle.
const Shot1b: React.FC<ShotProps> = () => {
  const { f, dur } = useLocal();
  return (
    <AbsoluteFill>
      <Close cam={{ s: push(f, dur, 1.5, 2.0), x: 540, y: 720 }}>
        <LightRings x={540} y={760} radii={[420, 320, 220]} colors={WARM} />
        <Briefcase x={540} y={900} s={2} />
      </Close>
      <Label text="WHO?" x={LABEL_X} y={LABEL_Y} from={-20} to={9999} size={70} />
    </AbsoluteFill>
  );
};
// 1c. Intro: a stamped question mark on a face-less paper man; the mascot gasps.
const Shot1c: React.FC<ShotProps> = () => {
  const { f, dur, pop } = useLocal();
  return (
    <AbsoluteFill>
      <Close cam={{ s: push(f, dur, 1.25, 1.55), x: 540, y: 700 }}>
        <LightRings x={540} y={620} radii={[420, 320, 220]} colors={WARM} />
        <PaperMan x={540} y={1180} s={1.2} face="q" qPop={pop(2, 7)} />
      </Close>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0, filter: OFFSET }}>
        <circle cx={190} cy={1230} r={110} fill={M.night} stroke={M.ink} strokeWidth={6} />
        <InkDrop x={190} y={1300} s={0.8} mood="shock" />
      </svg>
      <Label text="WHO?" x={LABEL_X} y={LABEL_Y} from={-20} to={9999} size={70} />
    </AbsoluteFill>
  );
};

// 2. "April 1943. Britain needs to hide an invasion."
const Shot2: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tBrit = at(start, "Britain needs");
  const tInv = at(start, "invasion");
  if (f < tBrit) {
    return (
      <Close cam={{ s: push(f, tBrit, 1.0, 1.12), x: 540, y: 820 }}>
        <MedMap x={90} y={460} />
      </Close>
    );
  }
  const g = f - tBrit;
  const arrow = ease((f - tInv) / 12);
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: push(g, dur - tBrit, 1.0, 1.08), x: 540, y: 900 }}>
        <MedMap x={240} y={330} s={0.66} hot="sicily">
          <Arrow from={PLACE.africa} to={[560, 430]} p={arrow} w={16} />
        </MedMap>
        <rect x={120} y={GROUND - 200} width={840} height={30} fill={M.lilac} {...STROKE} />
        <rect x={160} y={GROUND - 170} width={30} height={170} fill={M.lilac} {...STROKE} />
        <rect x={890} y={GROUND - 170} width={30} height={170} fill={M.lilac} {...STROKE} />
        <Character x={300} y={GROUND} scale={0.8} skin={BRIT_SKIN} {...MONTAGU} eyes="squint" mouth={0.8} brow={-0.6} lean={12} headTilt={-6} look={14} hands={{ l: [80, -220], r: [40, -420] }} squash={snap(g, 0)} />
        <Character x={780} y={GROUND} scale={0.8} skin={BRIT_SKIN} {...SPY2} seed={3} eyes="squint" mouth={0.9} brow={-0.5} lean={-10} look={-14} hands={{ l: [-130, -220] }} squash={snap(g, 4)} />
      </Stage>
      <Label text="TOP SECRET: SICILY" x={LABEL_X} y={LABEL_Y + 30} from={tInv} to={9999} size={44} />
    </AbsoluteFill>
  );
};

// 3. "So spies invent a man. Major William Martin."
const Shot3: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tMan = at(start, "man");
  const tMajor = at(start, "Major William");
  const cutP = clamp01(f / Math.max(1, tMan));
  const a = cutP * Math.PI * 2 - Math.PI / 2;
  const rise = f < tMan ? 0.25 : pop(tMan, 8);
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: 1.05, x: 540, y: 900 }}>
        <LightRings x={540} y={700} radii={[460, 340, 230]} colors={WARM} />
        <g transform={`translate(540,${GROUND}) scale(1,${0.25 + 0.75 * rise}) translate(-540,${-GROUND})`}>
          <PaperMan x={540} y={GROUND} s={0.95} cut={f < tMan ? 1 : 1 - clamp01((f - tMan) / 10)} face={f >= tMan ? "dots" : "none"} />
        </g>
        {f < tMan + 6 && (
          <g transform={`translate(${540 + Math.cos(a) * 200},${GROUND - 280 + Math.sin(a) * 300}) rotate(${(a * 180) / Math.PI + 90})`}>
            <g transform={`rotate(${Math.sin(f * 1.6) * 12})`}>
              <path d="M0,0 L-14,-150 L8,-150 Z" fill={WHITE} {...STROKE} />
              <circle cx={-26} cy={30} r={22} fill="none" stroke={M.pink} strokeWidth={10} />
            </g>
            <g transform={`rotate(${-Math.sin(f * 1.6) * 12})`}>
              <path d="M0,0 L14,-150 L-8,-150 Z" fill={WHITE} {...STROKE} />
              <circle cx={26} cy={30} r={22} fill="none" stroke={M.pink} strokeWidth={10} />
            </g>
          </g>
        )}
        <Character x={150} y={GROUND} scale={0.62} skin={BRIT_SKIN} {...MONTAGU} {...(f >= tMan ? EMOTE.smug : { eyes: "squint" as const, mouth: 0.6 })} look={14} />
        <Character x={930} y={GROUND} scale={0.62} skin={BRIT_SKIN} {...SPY2} seed={4} eyes={f >= tMajor ? "happy" : "dot"} mouth={0.8} look={-14} hands={f >= tMajor ? { l: [-60, -360] } : undefined} squash={snap(f, tMajor)} />
      </Stage>
      <Label text="MAJOR WILLIAM MARTIN" x={LABEL_X} y={LABEL_Y} from={tMajor} to={9999} size={50} />
      <Label text="ROYAL MARINES" x={LABEL_X} y={LABEL_Y + 90} from={tMajor + 10} to={9999} size={34} color={WHITE} />
    </AbsoluteFill>
  );
};

// 4. "They give him a fiancée named Pam. Her photo. Love letters."
const Shot4: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tPam = at(start, "named Pam");
  const tLetters = at(start, "Love letters");
  if (f < tPam) {
    const h = pop(at(start, "fiancée"));
    return (
      <Stage moon={false}>
        <PaperMan x={420} y={GROUND} s={0.9} face="dots" />
        <g transform={`translate(560,620) scale(${h})`}>
          <path d="M0,-30 C-50,-110 -150,-40 0,70 C150,-40 50,-110 0,-30 Z" fill={M.pink} {...STROKE} />
        </g>
        <Character x={850} y={GROUND} scale={0.75} skin={BRIT_SKIN} {...MONTAGU} eyes="happy" mouth={0.9} lean={-6} look={-14} hands={{ l: [-170, -300] }} />
      </Stage>
    );
  }
  if (f < tLetters) {
    const g = f - tPam;
    return (
      <AbsoluteFill>
        <Close cam={{ s: push(g, tLetters - tPam, 1.0, 1.15), x: 540, y: 820 }}>
          <LightRings x={540} y={820} radii={[480, 360, 250]} colors={WARM} />
          <PamPhoto x={540} y={lerp(1000, 820, pop(tPam, 11))} r={-4} s={1.35} />
        </Close>
        <ItemPop n={1} from={tPam + 2} />
      </AbsoluteFill>
    );
  }
  const g = f - tLetters;
  return (
    <AbsoluteFill>
      <Close cam={{ s: push(g, 40, 1.0, 1.12), x: 540, y: 820 }}>
        <LightRings x={540} y={820} radii={[480, 360, 250]} colors={WARM} />
        <Letters x={540} y={lerp(1060, 860, pop(tLetters, 11))} s={1.2} />
      </Close>
      <ItemPop n={2} from={tLetters + 2} />
    </AbsoluteFill>
  );
};

// 5. "A theatre ticket. Even an overdraft." The spies high-five.
const Shot5: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tOver = at(start, "Even an");
  if (f < tOver) {
    return (
      <AbsoluteFill>
        <Close cam={{ s: push(f, tOver, 1.0, 1.12), x: 540, y: 820 }}>
          <LightRings x={540} y={820} radii={[480, 360, 250]} colors={WARM} />
          <Ticket x={540} y={lerp(1040, 840, pop(0, 11))} r={6} s={1.3} />
        </Close>
        <ItemPop n={3} from={2} />
      </AbsoluteFill>
    );
  }
  const g = f - tOver;
  const tFive = at(start, "overdraft") + 4;
  const five = f >= tFive;
  return (
    <AbsoluteFill>
      <Stage moon={false}>
        <BankSlip x={540} y={lerp(900, 640, pop(tOver, 11))} r={-3} s={1.1} />
        <Character x={330} y={GROUND} scale={0.62} skin={BRIT_SKIN} {...MONTAGU} {...(five ? { eyes: "happy" as const, mouthShape: "open" as const, mouthOpen: 0.6, mouth: 1 } : { eyes: "squint" as const, mouth: 0.7 })} look={14} hands={{ r: five ? [150, -440] : [90, -200] }} jump={five ? Math.max(0, 30 - (f - tFive) * 3) : 0} squash={snap(f, tFive)} />
        <Character x={720} y={GROUND} scale={0.62} skin={BRIT_SKIN} {...SPY2} seed={5} {...(five ? { eyes: "happy" as const, mouthShape: "open" as const, mouthOpen: 0.6, mouth: 1 } : { eyes: "squint" as const, mouth: 0.7 })} look={-14} hands={{ l: five ? [-150, -440] : [-90, -200] }} jump={five ? Math.max(0, 30 - (f - tFive) * 3) : 0} squash={snap(f, tFive)} />
        {five && g < 60 && <circle cx={525} cy={GROUND - 440 * 0.62 - 10} r={20 + (f - tFive) * 4} fill="none" stroke={M.pink} strokeWidth={6} opacity={1 - clamp01((f - tFive) / 10)} />}
      </Stage>
      <ItemPop n={4} from={tOver + 2} />
    </AbsoluteFill>
  );
};

// 6. "Then they tuck secret letters in his briefcase and slip him into the sea off Spain."
const Shot6: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tSecret = at(start, "secret letters");
  const tCase = at(start, "briefcase");
  const tSlip = at(start, "and slip");
  if (f < tSlip) {
    const slide = ease((f - tSecret) / 14);
    const open = f < tCase ? 1 : 1 - ease((f - tCase) / 5);
    return (
      <AbsoluteFill>
        <Close cam={{ s: push(f, tSlip, 1.0, 1.1), x: 540, y: 860 }}>
          <LightRings x={540} y={820} radii={[480, 360, 250]} colors={WARM} />
          <Briefcase x={540} y={1040} s={1.8} open={open} />
          {f < tCase + 2 && <Envelope x={540} y={lerp(560, 860, slide)} s={1.2} r={lerp(-12, 0, slide)} />}
        </Close>
        {f >= tCase && <Flash at={tCase} />}
      </AbsoluteFill>
    );
  }
  const g = f - tSlip;
  const drop = ease(g / 22);
  const bob = Math.sin(f / 6) * 8 * drop;
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 820, y: 460 }} floor={false} cam={{ s: push(g, dur - tSlip, 1.0, 1.1), x: 540, y: 1000 }}>
        <Submarine x={300} y={1040} s={0.9} />
        <Waves y={1040} f={f} />
        <g transform={`translate(${lerp(460, 700, drop)},${lerp(950, 1060, drop) + bob}) rotate(${lerp(-30, -90, drop)})`}>
          <PaperMan x={0} y={0} s={0.6} face="dots" cut={0} />
        </g>
        <Briefcase x={lerp(480, 800, drop)} y={lerp(960, 1080, drop) + bob * 0.8} s={0.3} />
        {g > 18 && g < 40 && <circle cx={640} cy={1060} r={(g - 18) * 8} fill="none" stroke={WHITE} strokeWidth={6} opacity={1 - (g - 18) / 22} />}
      </Stage>
      <Label text="OFF SPAIN" x={LABEL_X} y={LABEL_Y} from={at(start, "off Spain")} to={9999} size={56} />
    </AbsoluteFill>
  );
};

// 7. "There's just one problem. Major Martin is dead." Shown by suggestion: the paper man sags, silence.
const Shot7: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tDead = at(start, "Major Martin");
  const dead = f >= tDead;
  const sag = dead ? ease((f - tDead) / 24) : 0;
  return (
    <AbsoluteFill>
      <Close cam={{ s: dead ? push(f - tDead, dur - tDead, 1.25, 1.35) : push(f, tDead, 1.0, 1.15), x: 540, y: 820 }}>
        {!dead && <LightRings x={540} y={700} radii={[460, 340, 230]} colors={WARM} />}
        <PaperMan x={540} y={1180} s={1.05} face={dead ? "none" : "dots"} sag={sag} fill={dead ? M.night : WHITE} />
      </Close>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0, filter: OFFSET }}>
        <InkDrop x={880} y={1300} s={0.7} mood={dead ? "shock" : "happy"} />
      </svg>
      {!dead && <Label text="ONE PROBLEM..." x={LABEL_X} y={LABEL_Y} from={at(start, "one problem")} to={9999} size={50} />}
    </AbsoluteFill>
  );
};

// 8. "A fisherman pulls him out."
const Shot8: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const pull = ease(f / 22);
  const startled = f >= 22;
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false}>
        <rect x={-100} y={GROUND} width={SW + 200} height={SH} fill={M.floor} />
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={(i * 211) % SW} cy={GROUND + 30 + ((i * 97) % 300)} r={4} fill={M.lilac} />
        ))}
        <Waves y={GROUND - 10} f={f} />
        <rect x={420} y={GROUND - 10} width={SW} height={SH} fill={M.floor} />
        <line x1={420} y1={GROUND - 10} x2={SW} y2={GROUND - 10} stroke={M.ink} strokeWidth={5} />
        <g transform={`translate(${lerp(260, 560, pull)},${GROUND - 20}) rotate(-90)`}>
          <PaperMan x={0} y={0} s={0.42} face="none" cut={0} />
        </g>
        <Character x={760} y={GROUND - 10} scale={0.85} skin={BRIT_SKIN} {...FISHER} {...(startled ? { ...EMOTE.shock, hands: { l: [-140, -300], r: [130, -330] } } : { eyes: "dot" as const, mouth: 0, lean: 18, hands: { l: [-200, -60], r: [-160, -60] } })} look={-14} squash={snap(f, 22)} />
      </Stage>
      <Label text="HUELVA, SPAIN" x={LABEL_X} y={LABEL_Y} from={2} to={9999} size={56} />
    </AbsoluteFill>
  );
};

// 9. "Spain hands the papers to the Germans."
const Shot9: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tHand = at(start, "the papers");
  const p = ease((f - tHand) / 16);
  return (
    <Stage moon={false} cam={{ s: push(f, dur, 1.0, 1.08), x: 540, y: 950 }}>
      <LightRings x={540} y={560} radii={[360, 260, 170]} colors={WARM} />
      <path d="M470,240 L610,240 L590,320 L490,320 Z" fill={WHITE} {...STROKE} />
      <line x1={540} y1={200} x2={540} y2={240} stroke={M.ink} strokeWidth={6} />
      <Character x={220} y={GROUND} scale={0.82} skin={BRIT_SKIN} {...SPANIARD} eyes="dot" mouth={0.3} look={14} lean={lerp(0, 14, p)} hands={{ r: [lerp(120, 300, p), -300] }} />
      <Character x={860} y={GROUND} scale={0.82} skin={GER_SKIN} {...GERMAN} seed={2} {...(p > 0.8 ? { eyes: "wide" as const, mouthShape: "o" as const, browRaise: 0.8 } : { eyes: "glare" as const, mouth: -0.2 })} look={-14} hands={{ l: [lerp(-120, -300, p), -300] }} squash={snap(f, tHand + 14)} />
      <rect x={300} y={GROUND - 200} width={480} height={30} fill={M.lilac} {...STROKE} />
      <rect x={340} y={GROUND - 170} width={30} height={170} fill={M.lilac} {...STROKE} />
      <rect x={710} y={GROUND - 170} width={30} height={170} fill={M.lilac} {...STROKE} />
      <Envelope x={lerp(220 + 300 * 0.82, 860 - 300 * 0.82, p)} y={GROUND - 300 * 0.82 - 20 - Math.sin(p * Math.PI) * 80} s={0.6} r={lerp(-8, 8, p)} />
    </Stage>
  );
};

// 10. "They read it: the Allies are coming for Greece. For Sardinia. Not Sicily."
const Shot10: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tAllies = at(start, "the Allies");
  const tGreece = at(start, "Greece");
  const tSard = at(start, "Sardinia");
  const tNot = at(start, "Not Sicily");
  if (f < tAllies) {
    return (
      <Close cam={{ s: push(f, tAllies, 1.2, 1.4), x: 540, y: 960 }}>
        <Character x={540} y={1300} scale={1.1} skin={GER_SKIN} {...GERMAN} eyes="wide" brow={-0.4} mouthShape="o" lean={4} look={4} headTilt={Math.sin(f / 4) * 6} hands={{ l: [-110, -160], r: [110, -160] }} />
        <g transform="translate(540,1180) rotate(-4)">
          <rect x={-150} y={-110} width={300} height={220} fill={WHITE} {...STROKE} />
          {[-60, -20, 20, 60].map((ly) => (
            <line key={ly} x1={-110} y1={ly} x2={110} y2={ly} stroke={M.ink} strokeWidth={6} />
          ))}
        </g>
      </Close>
    );
  }
  const g = f - tAllies;
  const xP = ease((f - tNot) / 8);
  return (
    <AbsoluteFill>
      <Close cam={{ s: push(g, 120, 1.0, 1.1), x: 540, y: 860 }}>
        <MedMap x={90} y={500} hot="none">
          <Arrow from={PLACE.africa} to={[790, 330]} p={ease((f - tGreece) / 10)} />
          <Arrow from={PLACE.africa} to={[372, 290]} p={ease((f - tSard) / 10)} />
          {f >= tNot && (
            <g transform={`translate(570,400) scale(${pop(tNot, 8)})`}>
              <path d="M-70,-70 L70,70 M70,-70 L-70,70" stroke={M.ink} strokeWidth={30} strokeLinecap="round" />
              <path d="M-70,-70 L70,70 M70,-70 L-70,70" stroke={WHITE} strokeWidth={14} strokeLinecap="round" opacity={xP} />
            </g>
          )}
        </MedMap>
      </Close>
      <Label text="GREECE!" x={760} y={LABEL_Y} from={tGreece} to={9999} size={44} />
      <Label text="SARDINIA!" x={330} y={LABEL_Y + 90} from={tSard} to={9999} size={44} />
      <Label text="NOT SICILY" x={LABEL_X} y={1340} from={tNot + 2} to={9999} size={50} color={WHITE} />
    </AbsoluteFill>
  );
};

// 11. "Hitler believes it. His army moves away." Hitler is never drawn: only the stamped order.
const Shot11: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tStamp = at(start, "believes") + 4;
  const tMove = at(start, "His army");
  const move = ease((f - tMove) / 26);
  const pins = Array.from({ length: 8 }, (_, i) => {
    const sx = 520 + (i % 4) * 34;
    const sy = 360 + Math.floor(i / 4) * 34;
    const [tx, ty] = i % 2 ? [780 + (i % 4) * 20, 260 + Math.floor(i / 4) * 40] : [340 + (i % 4) * 10, 200 + (i % 4) * 30];
    return [lerp(sx, tx, ease(move * 1.2 - i * 0.03)), lerp(sy, ty, ease(move * 1.2 - i * 0.03))];
  });
  const stampS = f < tStamp ? 0 : lerp(1.6, 1, ease((f - tStamp) / 4));
  return (
    <AbsoluteFill>
      <Close cam={{ s: 1.05, x: 540, y: 880 }}>
        <MedMap x={90} y={500} hot="none">
          {pins.map(([px, py], i) => (
            <g key={i} transform={`translate(${px},${py})`}>
              <line x1={0} y1={0} x2={0} y2={-46} stroke={M.ink} strokeWidth={6} />
              <circle cx={0} cy={-50} r={19} fill={M.lilac} stroke={M.ink} strokeWidth={5} />
            </g>
          ))}
        </MedMap>
        {f >= tStamp && (
          <g transform={`translate(640,560) rotate(-6) scale(${stampS * 0.85})`}>
            <rect x={-230} y={-120} width={460} height={240} fill={WHITE} {...STROKE} />
            <rect x={-190} y={-80} width={380} height={110} fill="none" stroke={M.pink} strokeWidth={10} />
            <text x={0} y={10} textAnchor="middle" fontFamily={BUNGEE} fontSize={86} fill={M.pink}>ORDER</text>
            <line x1={-190} y1={70} x2={190} y2={70} stroke={M.ink} strokeWidth={6} />
          </g>
        )}
      </Close>
      {f >= tStamp && <SpeedLines at={tStamp} />}
      <Label text="TROOPS MOVE" x={LABEL_X} y={LABEL_Y} from={tMove + 2} to={9999} size={50} />
    </AbsoluteFill>
  );
};

// 12. "July. The Allies land in Sicily, and almost nobody is waiting."
const Shot12: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tLand = at(start, "The Allies");
  const tNobody = at(start, "almost nobody");
  const land = ease((f - tLand) / 40);
  const zoom = f >= tNobody;
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false} cam={zoom ? { s: push(f - tNobody, dur - tNobody, 1.6, 1.8), x: 820, y: GROUND - 220 } : { s: 1, x: 540, y: 960 }}>
        <LightRings x={760} y={520} radii={[360, 260, 170]} colors={GOLD} />
        <circle cx={760} cy={520} r={90} fill={WHITE} {...STROKE} />
        <Waves y={GROUND - 10} f={f} dark={false} />
        <path d={`M380,${GROUND - 10} Q520,${GROUND - 50} 700,${GROUND - 40} L${SW + 100},${GROUND - 40} L${SW + 100},${SH} L380,${SH} Z`} fill={M.floor} stroke={M.ink} strokeWidth={5} />
        <Boat x={lerp(-260, 220, land)} y={GROUND} s={0.7} f={f} />
        <Boat x={lerp(-520, 0, land)} y={GROUND + 90} s={0.55} f={f + 20} crew={2} />
        <Barrel x={860} y={GROUND - 40} s={0.8} />
        <Seagull x={860} y={GROUND - 40 - 180 * 0.8 - 30} s={1} f={f} />
      </Stage>
      <Label text="SICILY" x={LABEL_X} y={LABEL_Y + 40} from={tLand} to={9999} size={56} />
    </AbsoluteFill>
  );
};

// 13. "So who was Major Martin? For more than fifty years, nobody knew."
const Shot13: React.FC<ShotProps> = ({ start }) => {
  const { f, dur, pop } = useLocal();
  const tYears = at(start, "For more");
  const dust = clamp01((f - tYears) / 40);
  return (
    <AbsoluteFill>
      <Close cam={{ s: push(f, dur, 1.0, 1.15), x: 540, y: 820 }}>
        <LightRings x={540} y={640} radii={[460, 340, 230]} colors={WARM} />
        <PaperMan x={540} y={1180} s={1.05} face="q" qPop={pop(2, 7)} fill={f >= tYears ? M.night : WHITE} />
        {Array.from({ length: 30 }, (_, i) => {
          const t = ((f * (0.6 + (i % 5) * 0.15) + i * 47) % 900) / 900;
          return <rect key={i} x={140 + ((i * 131) % 800)} y={260 + t * 1100} width={8} height={8} fill={M.lilac} opacity={dust} transform={`rotate(${f * 2 + i * 20} ${140 + ((i * 131) % 800)} ${260 + t * 1100})`} />;
        })}
        {f >= tYears && (
          <path d={`M120,260 Q260,${260 + 120 * dust} 120,${260 + 260 * dust} M120,260 L${120 + 240 * dust},260 M120,${260 + 130 * dust} Q${180 + 40 * dust},${300 + 40 * dust} ${120 + 120 * dust},260`} stroke={M.ink} strokeWidth={4} fill="none" opacity={0.6} />
        )}
      </Close>
      <Label text="NOBODY KNEW" x={LABEL_X} y={1340} from={at(start, "nobody knew")} to={9999} size={50} color={WHITE} />
    </AbsoluteFill>
  );
};

// 14. "His real name was Glyndwr Michael. A homeless Welshman who died in London."
const Shot14: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tName = at(start, "real name") + 4;
  const tHome = at(start, "homeless");
  const tDied = at(start, "died in");
  const peel = ease((f - tName) / 18);
  const dim = ease((f - tDied) / 30);
  const lampOn = f < tDied + 14 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: push(f, dur, 1.0, 1.14), x: 540, y: 900 }}>
        {f >= tHome && <LightRings x={260} y={GROUND - 690} radii={[lerp(440, 300, dim), lerp(330, 220, dim), lerp(220, 140, dim)]} colors={WARM} />}
        {f >= tHome && <StreetLamp x={260} on={lampOn} />}
        <Character
          x={560}
          y={GROUND}
          scale={0.78}
          skin={RED_SKIN}
          {...GLYNDWR}
          eyes={f >= tDied ? "closed" : "dot"}
          brow={1}
          mouth={-0.3}
          headTilt={f >= tHome ? 10 : 4}
          squash={0.97 + Math.sin(f / 12) * 0.01}
          hands={f >= tHome ? { l: [30, -250], r: [-20, -240] } : undefined}
          look={-6}
          lean={f >= tHome ? -4 : 0}
        />
        {peel < 1 && (
          <g transform={`translate(${lerp(560, 1100, peel)},${lerp(GROUND, GROUND - 600, peel)}) rotate(${peel * 70})`} opacity={1 - peel * 0.3}>
            <PaperMan x={0} y={0} s={0.98} face="q" fill={M.night} cut={0} />
          </g>
        )}
      </Stage>
      <Label text="GLYNDWR MICHAEL" x={LABEL_X} y={LABEL_Y} from={tName + 6} to={9999} size={56} />
      <Label text="WELSH · HOMELESS" x={LABEL_X} y={LABEL_Y + 90} from={tHome + 2} to={9999} size={38} color={WHITE} />
    </AbsoluteFill>
  );
};

// 15. "He never fought. He never knew. Yet he helped win Sicily."
const Shot15: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tKnew = at(start, "He never knew");
  const tYet = at(start, "Yet he");
  const hope = f >= tYet;
  const glow = ease((f - tYet) / 16);
  const pose: Pose = hope
    ? { eyes: "dot", mouth: 0.5, brow: 0.6, browRaise: 0.3, headTilt: -6, look: 10, fx: "sparkle" }
    : f >= tKnew
      ? { eyes: "closed", mouth: -0.2, brow: 1, headTilt: 10, look: 4, hands: { l: [-60, -260], r: [60, -260] } }
      : { eyes: "dot", mouth: -0.2, brow: 1, headTilt: 14, look: 6, hands: { l: [-40, -250], r: [50, -250] } };
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: push(f, dur, 1.05, 1.22), x: 540, y: 920 }}>
        {hope && <LightRings x={540} y={620} radii={[lerp(200, 520, glow), lerp(140, 400, glow), lerp(90, 290, glow), lerp(50, 190, glow)]} colors={GOLD} />}
        {hope && (
          <g opacity={glow}>
            <path d="M260,820 Q540,760 820,820 L820,860 L260,860 Z" fill={M.floor} stroke={M.ink} strokeWidth={4} />
            <Boat x={420} y={830} s={0.22} f={f} crew={2} />
            <Boat x={660} y={840} s={0.18} f={f + 12} crew={2} />
            <text x={540} y={920} textAnchor="middle" fontFamily={BUNGEE} fontSize={36} fill={M.ink}>SICILY</text>
          </g>
        )}
        <Character x={540} y={GROUND} scale={0.85} skin={RED_SKIN} {...GLYNDWR} {...pose} squash={snap(f, hope ? tYet : tKnew)} />
      </Stage>
    </AbsoluteFill>
  );
};

// 16. "Hitler trusted a man who never lived." The paper Martin and the real Glyndwr side by side; a stamped question mark.
const Shot16: React.FC<ShotProps> = ({ start }) => {
  const { f, dur } = useLocal();
  const tLived = at(start, "never lived");
  const sS = f < tLived ? 0 : lerp(2.2, 1, ease((f - tLived) / 5));
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: push(f, dur, 1.0, 1.1), x: 540, y: 900 }}>
        <LightRings x={540} y={620} radii={[480, 360, 250]} colors={WARM} />
        {f >= tLived && (
          <text x={540} y={1060} textAnchor="middle" fontFamily={BUNGEE} fontSize={900} fill={M.pink} opacity={0.9} transform={`translate(540,700) scale(${sS}) translate(-540,-700)`}>
            ?
          </text>
        )}
        <PaperMan x={330} y={GROUND} s={0.85} face="dots" />
        <Character x={760} y={GROUND} scale={0.78} skin={RED_SKIN} {...GLYNDWR} eyes="dot" mouth={0.3} brow={0.6} headTilt={-6} look={-12} />
      </Stage>
      <Label text="MAJOR MARTIN" x={310} y={LABEL_Y + 40} from={2} to={9999} size={40} color={WHITE} />
      <Label text="GLYNDWR" x={790} y={LABEL_Y + 40} from={8} to={9999} size={40} />
      {f >= tLived && <Flash at={tLived} />}
    </AbsoluteFill>
  );
};

// 17. End card.
const Shot17: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const lines = ["WHO WAS", "MAJOR", "MARTIN?"];
  const total = lines.join("").length;
  const typed = Math.min(total, Math.floor(f / 2) + 1);
  const under = clamp01((f - total * 2) / 10);
  let used = 0;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={820} radii={[520, 400, 290, 190]} colors={WARM} dots={{ r: 300, color: M.pink }} />
      </svg>
      <div style={{ position: "absolute", top: 520, width: SW - SAFE.right + 60, textAlign: "center", fontFamily: BUNGEE, fontSize: 150, lineHeight: 1.05, color: WHITE, WebkitTextStroke: `16px ${M.ink}`, paintOrder: "stroke fill" }}>
        {lines.map((l, i) => {
          const show = l.slice(0, Math.max(0, typed - used));
          used += l.length;
          return <div key={i}>{show || " "}</div>;
        })}
      </div>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0, filter: OFFSET }}>
        <path
          d={Array.from({ length: 37 }, (_, i) => `${i ? "L" : "M"}${190 + i * 17},${1050 + Math.sin(i * 0.6 + f * 0.3) * 14}`).join(" ")}
          fill="none"
          stroke={M.pink}
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - under}
        />
        <InkDrop x={480} y={1330} s={0.9} mood="cheer" />
      </svg>
    </AbsoluteFill>
  );
};

const SHOTS = [Shot1a, Shot1b, Shot1c, Shot2, Shot3, Shot4, Shot5, Shot6, Shot7, Shot8, Shot9, Shot10, Shot11, Shot12, Shot13, Shot14, Shot15, Shot16, Shot17];

// ---------------------------------------------------------------------------
// Sound (all code-made, from public/sfx)
// ---------------------------------------------------------------------------
const T_DEAD = cue("Major Martin is");
const SoundTrack: React.FC = () => {
  const C = CUTS;
  return (
    <>
      <Audio src={staticFile("voice/mincemeat.mp3")} volume={1} />
      {/* quiet bed; drops to silence on "Major Martin is dead" and comes back with the fisherman */}
      <Audio src={staticFile("sfx/roomtone.wav")} loop volume={(fr) => (fr >= T_DEAD && fr < C[9] ? 0 : 0.1)} />
      {/* intro */}
      <Sfx name="waves" at={0} vol={0.25} len={21} />
      <Sfx name="whoosh" at={C[1]} vol={0.4} />
      <Sfx name="click" at={C[1] + 6} vol={0.4} />
      <Sfx name="stamp" at={C[2] + 2} vol={0.6} />
      <Sfx name="pop" at={C[2] + 10} vol={0.3} />
      {/* setup */}
      <Sfx name="whoosh" at={C[3]} vol={0.35} />
      <Sfx name="pop" at={cue("invasion")} vol={0.3} />
      {Array.from({ length: 6 }, (_, i) => <Sfx key={`c${i}`} name="click" at={C[4] + 2 + i * 6} vol={0.35} len={6} rate={1.4} />)}
      <Sfx name="puff" at={cue("man", C[4])} vol={0.4} />
      <Sfx name="stamp" at={cue("Major William")} vol={0.6} />
      <Sfx name="pop" at={cue("fiancée")} vol={0.3} />
      {/* items */}
      <Sfx name="whoosh" at={cue("named Pam")} vol={0.4} />
      <Sfx name="pop" at={cue("named Pam") + 2} vol={0.35} />
      <Sfx name="whoosh" at={cue("Love letters")} vol={0.4} />
      <Sfx name="pop" at={cue("Love letters") + 2} vol={0.35} />
      <Sfx name="whoosh" at={C[6]} vol={0.4} />
      <Sfx name="pop" at={C[6] + 2} vol={0.35} />
      <Sfx name="whoosh" at={cue("Even an")} vol={0.4} />
      <Sfx name="pop" at={cue("Even an") + 2} vol={0.35} />
      <Sfx name="clink" at={cue("overdraft") + 4} vol={0.35} />
      {/* briefcase and sea */}
      <Sfx name="whoosh" at={C[7]} vol={0.35} />
      <Sfx name="puff" at={cue("secret letters")} vol={0.3} />
      <Sfx name="slam" at={cue("briefcase")} vol={0.35} />
      <Sfx name="click" at={cue("briefcase") + 4} vol={0.5} />
      <Sfx name="waves" at={cue("and slip")} vol={0.3} len={C[8] - cue("and slip") + 30} />
      <Sfx name="splash" at={cue("and slip") + 18} vol={0.45} />
      {/* the dead man: a single low beat, then silence */}
      <Sfx name="heartbeat" at={T_DEAD} vol={0.3} len={40} rate={0.8} />
      {/* fisherman, Spain, Germany */}
      <Sfx name="waves" at={C[9]} vol={0.25} len={C[10] - C[9]} />
      <Sfx name="seagull" at={C[9] + 4} vol={0.25} />
      <Sfx name="pop" at={C[9] + 22} vol={0.3} />
      <Sfx name="whoosh" at={cue("the papers")} vol={0.4} />
      <Sfx name="whoosh" at={cue("the Allies", C[11])} vol={0.35} />
      <Sfx name="scribble" at={cue("Greece")} vol={0.3} />
      <Sfx name="scribble" at={cue("Sardinia")} vol={0.3} />
      <Sfx name="impact" at={cue("Not Sicily")} vol={0.25} />
      <Sfx name="stamp" at={cue("believes") + 4} vol={0.7} />
      <Sfx name="impact" at={cue("believes") + 4} vol={0.2} />
      {Array.from({ length: 8 }, (_, i) => <Sfx key={`m${i}`} name="step" at={cue("His army") + i * 4} vol={0.25} len={8} />)}
      {/* landing */}
      <Sfx name="waves" at={C[13]} vol={0.3} len={C[14] - C[13]} />
      <Sfx name="engine" at={cue("The Allies", C[13])} vol={0.2} len={50} />
      <Sfx name="seagull" at={cue("almost nobody") + 4} vol={0.4} />
      {/* the real man */}
      <Sfx name="creak" at={C[14] + 4} vol={0.25} />
      {Array.from({ length: 12 }, (_, i) => <Sfx key={`t${i}`} name="tick" at={cue("For more") + i * 5} vol={0.25} len={6} />)}
      <Sfx name="whoosh" at={cue("real name") + 4} vol={0.35} rate={0.8} />
      <Sfx name="hum" at={cue("homeless")} vol={0.12} len={80} rate={0.7} />
      <Sfx name="shimmer" at={cue("Yet he")} vol={0.3} />
      <Sfx name="stamp" at={cue("never lived")} vol={0.7} />
      <Sfx name="impact" at={cue("never lived")} vol={0.25} />
      {/* end card */}
      {Array.from({ length: 15 }, (_, i) => <Sfx key={`ty${i}`} name="type" at={C[18] + i * 2} vol={0.4} len={6} />)}
      <Sfx name="shimmer" at={C[18] + 30} vol={0.3} />
    </>
  );
};

export const Mincemeat: React.FC = () => (
  <UiContext.Provider value={MEMPHIS_UI}>
    <AbsoluteFill style={{ background: M.night }}>
      {SHOTS.map((Shot, i) => (
        <Sequence key={i} from={CUTS[i]} durationInFrames={CUTS[i + 1] - CUTS[i]}>
          <Shot start={CUTS[i]} />
        </Sequence>
      ))}
      <Counter />
      <Captions words={WORDS} y={CAPTION_Y} hideAfterMs={(VOICE_END / 30) * 1000 + 200} />
      <SoundTrack />
    </AbsoluteFill>
  </UiContext.Provider>
);
