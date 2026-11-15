import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Character, Skin } from "../../components/Character";
import { UiContext, clamp01, lerp } from "../../components/theme";
import { Captions, FontContext, GOLD, Label, LightRings, M, MEMPHIS_UI, SAFE, SH, SW, WARM, skin } from "../../components/memphis";
import { Flash, GROUND, Paper, Sfx, SpeedLines, STROKE, Stage, makeCues, useLocal } from "../../components/shortkit";
import { WORDS } from "./words";
import { KO_FONT } from "../../components/korean";

const FONT = KO_FONT;

export const DRAGON_JAR_KO_DURATION = 1800;
const CAPTION_Y = 1490;
const LABEL_X = (SAFE.left + SW - SAFE.right) / 2;
const LABEL_Y = 330;

const { cue, end: VOICE_END } = makeCues(WORDS);

const CUTS = [
  0,
  cue("청동 항아리"),
  cue("약 이천"),
  cue("장형이 신기한"),
  cue("청동 용"),
  cue("입 벌린"),
  cue("그의 약속"),
  cue("그러던 어느"),
  cue("쨍그랑"),
  cue("모두가 얼어붙는다"),
  cue("그리고 웃음이"),
  cue("궁궐의 적들이"),
  cue("장형은 궁에서"),
  cue("하루가 지나고"),
  cue("그때 성문에"),
  cue("거대한 지진이"),
  cue("바로 용이"),
  cue("웃음이 멈춘다"),
  cue("더 기묘한"),
  cue("이천 년이"),
  cue("대체 항아리는"),
  VOICE_END + 4,
  DRAGON_JAR_KO_DURATION,
];
type ShotProps = { start: number };
const at = (start: number, phrase: string) => cue(phrase) - start;

// ---------------------------------------------------------------------------
// Cast
// ---------------------------------------------------------------------------
const ScholarHat = (
  <g>
    <path d="M-72,-58 Q0,-140 72,-58 Z" fill={M.ink} />
    <rect x={-175} y={-80} width={110} height={14} rx={7} fill={M.ink} />
    <rect x={65} y={-80} width={110} height={14} rx={7} fill={M.ink} />
  </g>
);
const CourtCap = <path d="M-64,-56 Q0,-118 64,-56 Z" fill={M.ink} />;
const Crown = (
  <g>
    <path d="M-60,-60 Q0,-112 60,-60 Z" fill={M.ink} />
    <rect x={-120} y={-118} width={240} height={20} fill={M.ink} />
    {[-110, -80, 80, 110].map((x) => (
      <g key={x}>
        <line x1={x} y1={-98} x2={x} y2={-30} stroke={M.ink} strokeWidth={3} />
        {[-80, -60, -40].map((y) => (
          <circle key={y} cx={x} cy={y} r={6} fill={M.pink} />
        ))}
      </g>
    ))}
  </g>
);
const ZHANG = skin(M.amber);
const ENEMY: Skin = { body: M.ink, outline: M.pink, outlineWidth: 4, face: M.pink };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
/** A dragon head in profile, mouth to the right; `ball` puts a red ball in its jaws. */
const DragonHead: React.FC<{ x: number; y: number; dir?: 1 | -1; s?: number; ball?: boolean; jaw?: number }> = ({ x, y, dir = 1, s = 1, ball = true, jaw = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${dir * s},${s})`}>
    <path d="M-20,-30 L-6,-58 L8,-32 L22,-60 L34,-30" fill={M.ink} />
    <path d="M-30,-30 Q20,-48 72,-24 L78,-4 L20,-4 Q-10,4 -30,10 Z" fill={M.lilac} {...STROKE} />
    <path d={`M20,4 L76,${8 + jaw * 30} Q40,${30 + jaw * 30} -26,24 Z`} fill={M.lilac} {...STROKE} />
    <circle cx={30} cy={-20} r={7} fill={M.ink} />
    {ball && <circle cx={80} cy={4 + jaw * 15} r={18} fill={M.pink} stroke={M.ink} strokeWidth={5} />}
  </g>
);

/** A bronze toad looking up with its mouth open. */
const Toad: React.FC<{ x: number; y: number; s?: number; open?: number; ball?: boolean }> = ({ x, y, s = 1, open = 1, ball = false }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70,0 Q-72,-76 0,-80 Q72,-76 70,0 Z" fill={M.cream} {...STROKE} />
    <circle cx={-34} cy={-80} r={16} fill={M.cream} {...STROKE} />
    <circle cx={34} cy={-80} r={16} fill={M.cream} {...STROKE} />
    <circle cx={-34} cy={-82} r={6} fill={M.ink} />
    <circle cx={34} cy={-82} r={6} fill={M.ink} />
    <ellipse cx={0} cy={-42} rx={34} ry={4 + open * 16} fill={M.ink} />
    {ball && <circle cx={0} cy={-46} r={18} fill={M.pink} stroke={M.ink} strokeWidth={5} />}
  </g>
);

/** The seismoscope, side view: a bronze jar with three visible dragons and toads below. */
const Jar: React.FC<{ x: number; y: number; s?: number; balls?: [boolean, boolean, boolean]; toadBall?: number; dropT?: number; ghost?: number }> = ({
  x,
  y,
  s = 1,
  balls = [true, true, true],
  toadBall = -1,
  dropT = -1,
  ghost = 0,
}) => {
  const fade = 1 - ghost;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g opacity={fade}>
        <path d="M-110,-40 Q-175,-100 -168,-230 Q-160,-350 -95,-390 L95,-390 Q160,-350 168,-230 Q175,-100 110,-40 Z" fill={M.cream} {...STROKE} />
        <path d="M-150,-150 Q0,-120 150,-150" fill="none" stroke={M.lilac} strokeWidth={12} />
        <path d="M-160,-300 Q0,-275 160,-300" fill="none" stroke={M.lilac} strokeWidth={12} />
        <path d="M-105,-390 Q0,-480 105,-390 Z" fill={M.lilac} {...STROKE} />
        <circle cx={0} cy={-470} r={18} fill={M.lilac} {...STROKE} />
        <rect x={-130} y={-46} width={260} height={46} rx={10} fill={M.lilac} {...STROKE} />
        <DragonHead x={-150} y={-300} dir={-1} s={0.9} ball={balls[0]} />
        <DragonHead x={150} y={-300} dir={1} s={0.9} ball={balls[2] && dropT < 0} jaw={dropT >= 0 ? 1 : 0} />
        <g transform="translate(0,-330)">
          <path d="M-46,-40 Q0,-70 46,-40 L40,30 Q0,50 -40,30 Z" fill={M.lilac} {...STROKE} />
          <circle cx={-18} cy={-14} r={6} fill={M.ink} />
          <circle cx={18} cy={-14} r={6} fill={M.ink} />
          {balls[1] && <circle cx={0} cy={44} r={18} fill={M.pink} stroke={M.ink} strokeWidth={5} />}
        </g>
        <Toad x={-235} y={0} s={0.75} ball={toadBall === 0} />
        <Toad x={0} y={70} s={0.75} ball={toadBall === 1} />
        <Toad x={235} y={0} s={0.75} ball={toadBall === 2} open={toadBall === 2 ? 1.2 : 1} />
        {dropT >= 0 && dropT < 1 && <circle cx={lerp(222, 235, dropT)} cy={lerp(-296, -40, dropT * dropT)} r={16} fill={M.pink} stroke={M.ink} strokeWidth={5} />}
      </g>
      {ghost > 0 && (
        <path
          d="M-110,-40 Q-175,-100 -168,-230 Q-160,-350 -95,-390 L95,-390 Q160,-350 168,-230 Q175,-100 110,-40 Z"
          fill="none"
          stroke={M.ink}
          strokeWidth={6}
          strokeDasharray="18 18"
          opacity={ghost}
        />
      )}
    </g>
  );
};

const Pillar: React.FC<{ x: number; top?: number }> = ({ x, top = 220 }) => (
  <g>
    <rect x={x - 40} y={top} width={80} height={GROUND - top} fill={M.lilac} {...STROKE} />
    <rect x={x - 56} y={top - 20} width={112} height={26} fill={M.ink} />
  </g>
);

const Teacup: React.FC<{ x: number; y: number; s?: number; shake?: number }> = ({ x, y, s = 1, shake = 0 }) => {
  const f = useCurrentFrame();
  const w = shake * Math.sin(f * 1.7) * 8;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-220} y={0} width={440} height={34} rx={8} fill={M.lilac} {...STROKE} />
      <path d="M-90,-110 L90,-110 Q84,-10 0,0 Q-84,-10 -90,-110 Z" fill={M.cream} {...STROKE} />
      <path d={`M-80,-92 Q0,${-92 + w} 80,-92`} fill="none" stroke={M.ink} strokeWidth={5} />
    </g>
  );
};

const Horse: React.FC<{ x: number; y: number; s?: number; phase: number }> = ({ x, y, s = 1, phase }) => {
  const leg = (bx: number, off: number) => {
    const p = phase + off;
    return `M${bx},-60 Q${bx + Math.sin(p) * 30},-20 ${bx + Math.sin(p) * 50},${-Math.max(0, Math.cos(p)) * 25}`;
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {[[-90, 0], [-60, Math.PI], [80, Math.PI / 2], [110, Math.PI * 1.5]].map(([bx, o], i) => (
        <path key={i} d={leg(bx, o)} stroke={M.ink} strokeWidth={16} strokeLinecap="round" fill="none" />
      ))}
      <path d="M-150,-130 Q-230,-110 -230,-40" stroke={M.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-120} rx={160} ry={66} fill={M.cream} {...STROKE} />
      <path d="M110,-150 L160,-260 L230,-240 L210,-200 L150,-120 Z" fill={M.cream} {...STROKE} />
      <path d="M120,-170 L150,-250" stroke={M.ink} strokeWidth={16} strokeLinecap="round" />
      <circle cx={195} cy={-238} r={6} fill={M.ink} />
    </g>
  );
};

const HaLetters: React.FC<{ from: number; count?: number }> = ({ from, count = 8 }) => {
  const { f, pop } = useLocal();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const t0 = from + i * 6;
        if (f < t0) return null;
        const p = pop(t0);
        const x = 120 + ((i * 263) % 760);
        const y = 420 + ((i * 151) % 420) - (f - t0) * 1.2;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontSize: 70 + (i % 3) * 16, color: M.pink, WebkitTextStroke: `8px ${M.ink}`, paintOrder: "stroke fill", transform: `scale(${p}) rotate(${(i % 2 ? 1 : -1) * 12}deg)` }}>
            하
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
// 1. "Nobody felt the earthquake." A perfectly still cup of tea.
const Shot1: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  return (
    <Stage moon={false} floor={false} spots={false} cam={{ s: 1 + 0.06 * clamp01(f / 50), x: 540, y: 880 }}>
      <Pillar x={140} />
      <Pillar x={940} />
      <Teacup x={540} y={1000} s={1.6} />
    </Stage>
  );
};

// 2. "Except a bronze jar." The jar rises into view.
const Shot2: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const p = pop(0, 12);
  return (
    <Stage moon={false} cam={{ s: 1 + 0.08 * clamp01(f / 50), x: 540, y: 900 }}>
      <LightRings x={540} y={820} radii={[560, 420, 290, 180]} colors={WARM} dots={{ r: 400, color: M.pink }} />
      <g transform={`translate(0,${(1 - p) * 300})`}>
        <Jar x={540} y={GROUND} s={1.15} />
      </g>
    </Stage>
  );
};

// 3. "China, the second century." The palace roof.
const Shot3: React.FC<ShotProps> = () => (
  <AbsoluteFill>
    <Stage moon={{ x: 820, y: 420 }}>
      <path d="M90,700 Q300,640 540,520 Q780,640 990,700 L930,740 L150,740 Z" fill={M.ink} />
      <rect x={200} y={740} width={680} height={60} fill={M.lilac} {...STROKE} />
      {[260, 400, 540, 680, 820].map((x) => (
        <rect key={x} x={x - 22} y={800} width={44} height={GROUND - 800} fill={M.cream} {...STROKE} />
      ))}
      <path d="M140,600 Q540,470 940,600" fill="none" stroke={M.ink} strokeWidth={10} />
    </Stage>
    <Label text="중국 · 서기 2세기" x={LABEL_X} y={LABEL_Y - 60} from={3} to={9999} size={42} />
  </AbsoluteFill>
);

// 4. "Zhang Heng unveils a machine no one has ever seen." Cloth off, the court leans in.
const Shot4: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const lift = clamp01((f - 14) / 16);
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: 1, x: 540, y: 960 }}>
        <Pillar x={70} />
        <Pillar x={1010} />
        <Character x={190} y={GROUND} scale={0.75} skin={skin(M.cream)} hat={Crown} brow={0.3} browRaise={lift * 0.8} mouth={0.2} look={12} />
        <Jar x={540} y={GROUND} s={0.75} />
        <path d={`M380,${GROUND - lift * 700} L700,${GROUND - lift * 700} L720,${GROUND - 20 - lift * 700} L360,${GROUND - 20 - lift * 700} Z`} fill={M.lilac} opacity={1 - lift} />
        {lift < 1 && <path d={`M380,${GROUND - 380 - lift * 700} Q540,${GROUND - 440 - lift * 700} 700,${GROUND - 380 - lift * 700} L720,${GROUND - lift * 700} L360,${GROUND - lift * 700} Z`} fill={M.lilac} {...STROKE} opacity={1 - lift} />}
        <Character x={880} y={GROUND} scale={0.85} skin={ZHANG} hat={ScholarHat} mouth={0.5} brow={-0.2} look={-12} handsY={lerp(120, 300, lift)} />
      </Stage>
      <Label text="장형" x={880} y={600} from={20} to={9999} size={40} />
    </AbsoluteFill>
  );
};

// 5. "Eight bronze dragons. Eight balls." Top-down: dragons pop out around the jar, then balls.
const Shot5: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tBalls = at(start, "구슬 여덟");
  return (
    <Stage moon={false} floor={false}>
      <LightRings x={540} y={900} radii={[520, 400, 290]} colors={WARM} />
      <g transform={`translate(540,900) rotate(${f * 0.3})`}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * 360;
          const p = pop(i * 4);
          const b = pop(tBalls + i * 2);
          return (
            <g key={i} transform={`rotate(${a}) translate(${150 + 60 * p},0) scale(${p})`}>
              <path d="M-20,-34 Q40,-44 110,-14 L110,14 Q40,44 -20,34 Z" fill={M.lilac} {...STROKE} />
              <circle cx={60} cy={-16} r={7} fill={M.ink} />
              {f >= tBalls + i * 2 && <circle cx={128} cy={0} r={22 * b} fill={M.pink} stroke={M.ink} strokeWidth={5} />}
            </g>
          );
        })}
        <circle r={200} fill={M.cream} {...STROKE} />
        <circle r={120} fill={M.lilac} {...STROKE} />
        <circle r={36} fill={M.cream} {...STROKE} />
      </g>
    </Stage>
  );
};

// 6. "Eight toads, mouths open, waiting." Toads pop in under the jar.
const Shot6: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  return (
    <Stage moon={false} cam={{ s: 1.25, x: 540, y: 1010 }}>
      <Jar x={540} y={GROUND} s={0.95} />
      {[-1, 1].map((d, i) => (
        <g key={d} transform={`translate(${540 + d * 360},${GROUND}) scale(${pop(6 + i * 6)})`}>
          <Toad x={0} y={0} s={0.8} open={0.6 + 0.4 * Math.abs(Math.sin(f / 9 + i))} />
        </g>
      ))}
    </Stage>
  );
};

// 7. "His promise: it feels earthquakes no one else can." Zhang Heng, proud; a quake line pulses.
const Shot7: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const pts = Array.from({ length: 13 }, (_, i) => `${i ? "L" : "M"}${120 + i * 70},${GROUND + 120 + (i % 2 ? -1 : 1) * 40 * Math.abs(Math.sin(f / 8))}`).join(" ");
  return (
    <Stage moon={false} cam={{ s: 1.1, x: 560, y: 920 }}>
      <Jar x={330} y={GROUND} s={0.75} />
      <Character x={790} y={GROUND} scale={1} skin={ZHANG} hat={ScholarHat} mouth={0.6} brow={-0.5} look={-14} handsY={330} />
      <path d={pts} fill="none" stroke={M.pink} strokeWidth={12} strokeLinejoin="round" />
    </Stage>
  );
};

// 8. "Then, one silent day..." The palace at night, the jar alone.
const Shot8: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  return (
    <Stage moon={{ x: 820, y: 400 }} cam={{ s: 1 + 0.08 * clamp01(f / 60), x: 540, y: 950 }}>
      <Pillar x={120} />
      <Pillar x={960} />
      <Jar x={540} y={GROUND} s={0.85} />
    </Stage>
  );
};

// 9. "clang. A single ball drops." Close-up: the ball falls into the toad.
const Shot9: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const dropT = clamp01((f + 6) / 8); // lands on the "clang"
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: 1.7, x: 720, y: 1000 }}>
        <Jar x={540} y={GROUND} s={1} dropT={dropT < 1 ? dropT : -1} balls={[true, true, false]} toadBall={dropT >= 1 ? 2 : -1} />
      </Stage>
      <Flash at={2} />
      <Label text="북서쪽" x={LABEL_X} y={LABEL_Y} from={10} to={9999} size={60} />
    </AbsoluteFill>
  );
};

// 10. "Everyone freezes. Nothing. Not a tremor." Frozen court, a perfectly still cup.
const Shot10: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tCup = at(start, "아무 일도");
  if (f >= tCup) {
    return (
      <Stage moon={false} floor={false} spots={false} cam={{ s: 1.15 + 0.05 * clamp01((f - tCup) / 40), x: 540, y: 950 }}>
        <Teacup x={540} y={1000} s={1.6} />
      </Stage>
    );
  }
  return (
    <Stage moon={false}>
      {[140, 340, 540, 740, 940].map((x, i) => (
        <Character key={x} x={x} y={GROUND} scale={0.62} skin={skin(i === 2 ? M.cream : M.lilac)} hat={CourtCap} browRaise={1} mouth={-0.1} seed={i} look={(i - 2) * -4} />
      ))}
    </Stage>
  );
};

// 11. "Then the laughing starts. A toy! A fraud! The scholars mock him." Laughing court, Zhang Heng crushed.
const Shot11: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tToy = at(start, "장난감이다");
  const tFraud = at(start, "사기꾼이다");
  const tMock = at(start, "학자들이");
  const bounce = (i: number) => 1 + 0.07 * Math.abs(Math.sin(f / 3.2 + i));
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: 1 + 0.06 * clamp01(f / 120), x: 540, y: 960 }}>
        {[130, 330, 530].map((x, i) => (
          <Character key={x} x={x} y={GROUND} scale={0.66} skin={skin(i === 1 ? M.cream : M.lilac)} hat={CourtCap} mouth={1} brow={0.3} browRaise={0.6} squash={bounce(i)} seed={i} look={10} />
        ))}
        <Character x={850} y={GROUND} scale={0.8} skin={ZHANG} hat={ScholarHat} mouth={-0.8} brow={1} squash={f > tMock ? 0.92 : 1} look={-14} />
      </Stage>
      <HaLetters from={2} />
      <Label text="장난감이다!" x={330} y={330} from={tToy} to={9999} size={56} />
      <Label text="사기꾼이다!" x={620} y={460} from={tFraud} to={9999} size={56} />
    </AbsoluteFill>
  );
};

// 12. "His enemies at court smell blood." Dark figures whisper behind pillars.
const Shot12: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const lean = Math.sin(f / 10) * 4;
  return (
    <Stage moon={false} cam={{ s: 1.1 + 0.1 * clamp01(f / 60), x: 540, y: 900 }}>
      <g transform={`rotate(${lean} 300 ${GROUND})`}>
        <Character x={300} y={GROUND} scale={0.85} variant="shadow" skin={ENEMY} seed={4} />
      </g>
      <g transform={`rotate(${-lean} 780 ${GROUND})`}>
        <Character x={780} y={GROUND} scale={0.85} variant="shadow" skin={ENEMY} seed={7} />
      </g>
      <Pillar x={160} />
      <Pillar x={920} />
    </Stage>
  );
};

// 13. "Zhang Heng is thrown out of the palace, his name a joke." Out through the gate, gates slam.
const Shot13: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const fly = clamp01(f / 14);
  const x = lerp(760, 320, fly);
  const hop = Math.sin(Math.PI * fly) * 160;
  const land = f > 14 ? 1 - 0.18 * Math.exp(-(f - 14) / 5) * Math.cos((f - 14) * 0.8) : 1;
  const close = clamp01((f - 16) / 8);
  return (
    <Stage moon={false}>
      <rect x={560} y={330} width={520} height={GROUND - 330} fill={M.lilac} {...STROKE} />
      <path d="M520,330 Q820,230 1120,330 Z" fill={M.ink} />
      <rect x={680} y={560} width={300} height={GROUND - 560} fill={M.ink} />
      <rect x={680} y={560} width={150 * close} height={GROUND - 560} fill={M.pink} {...STROKE} />
      <rect x={980 - 150 * close} y={560} width={150 * close} height={GROUND - 560} fill={M.pink} {...STROKE} />
      <g transform={`translate(0,${-hop})`}>
        <Character x={x} y={GROUND} scale={0.8} skin={ZHANG} hat={ScholarHat} mouth={-0.9} brow={1} squash={land} look={14} />
      </g>
      {f > 30 && (
        <text x={820} y={500 - (f - 30) * 1.5} textAnchor="middle" fontFamily={FONT} fontSize={70} fill={M.pink} stroke={M.ink} strokeWidth={6} paintOrder="stroke" opacity={pop(30)}>
          하하
        </text>
      )}
    </Stage>
  );
};

// 14. "One day passes. Then another." Alone outside the walls at night; the day counter ticks.
const Shot14: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tAnother = at(start, "또 하루");
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 760, y: 420 }} cam={{ s: 1.05, x: 540, y: 940 }}>
        <rect x={0} y={700} width={SW} height={GROUND - 700} fill={M.lilac} {...STROKE} />
        <LightRings x={300} y={GROUND - 80} radii={[200, 130]} colors={GOLD} on={0.9} />
        <Character x={420} y={GROUND} scale={0.8} skin={ZHANG} hat={ScholarHat} mouth={-0.5} brow={0.9} squash={0.86} look={-6} />
      </Stage>
      <Label text={f >= tAnother ? "2일째" : "1일째"} x={LABEL_X} y={LABEL_Y} from={2} to={9999} size={70} />
    </AbsoluteFill>
  );
};

// 15. "Then hooves thunder at the gates. A messenger, covered in dust." A rider gallops in.
const Shot15: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const x = lerp(1350, 380, clamp01(f / 70));
  const phase = f * 0.9;
  const bob = Math.abs(Math.sin(phase)) * 12;
  return (
    <AbsoluteFill>
      <Stage moon={false} spots={[{ x: (900 - f * 14) % 1200, y: 500, kind: "triangle", color: M.lilac }, { x: (300 - f * 14 + 1200 * 3) % 1200, y: 700, kind: "squiggle", color: M.pink }]}>
        {Array.from({ length: 6 }, (_, i) => {
          const age = (f + i * 7) % 40;
          return <circle key={i} cx={x + 200 + age * 6} cy={GROUND - 30 - age * 2} r={20 + age * 1.5} fill={M.lilac} opacity={1 - age / 40} />;
        })}
        <g transform={`translate(0,${-bob})`}>
          <Character x={x - 10} y={GROUND - 170} scale={0.55} skin={skin(M.lilac)} hat={CourtCap} mouth={-0.4} brow={0.6} seed={9} look={-14} />
          <g transform={`translate(${x},${GROUND}) scale(-1,1) translate(${-x},${-GROUND})`}>
            <Horse x={x} y={GROUND} s={0.9} phase={phase} />
          </g>
        </g>
      </Stage>
      <SpeedLines at={0} dir={1} />
    </AbsoluteFill>
  );
};

// 16. "A massive earthquake has struck the northwest, hundreds of kilometers away." The map.
const Shot16: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tKm = at(start, "수백");
  const draw = clamp01((f - 6) / 30);
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false}>
        <g transform="translate(540,850) rotate(-1.5)">
          <Paper w={800} h={880} />
        </g>
        <path d="M200,1180 C300,1060 260,980 360,900 C460,820 420,700 520,640" fill="none" stroke={M.lilac} strokeWidth={22} strokeLinecap="round" />
        <circle cx={760} cy={1040} r={22} fill={M.ink} />
        <text x={700} y={1110} fontFamily={FONT} fontSize={38} fill={M.ink}>낙양</text>
        <path d="M760,1040 L330,600" fill="none" stroke={M.pink} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {draw >= 1 && (
          <g transform={`translate(330,600) scale(${pop(36)})`}>
            <path d="M-60,0 L-20,-20 L0,-70 L20,-20 L60,0 L20,20 L0,70 L-20,20 Z" fill={M.pink} {...STROKE} />
          </g>
        )}
        <text x={180} y={540} fontFamily={FONT} fontSize={34} fill={M.ink}>북서쪽</text>
      </Stage>
      <Label text="수백 킬로미터" x={LABEL_X} y={LABEL_Y - 40} from={tKm} to={9999} size={44} />
    </AbsoluteFill>
  );
};

// 17. "Exactly where the dragon pointed." The dragon and the map arrow line up. Flash.
const Shot17: React.FC<ShotProps> = () => {
  const { pop } = useLocal();
  const align = pop(4, 12);
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false}>
        <LightRings x={540} y={880} radii={[520, 380, 250]} colors={WARM} />
        <g transform={`translate(560,820) rotate(${lerp(-10, -45, align)}) scale(-2.2,2.2)`}>
          <DragonHead x={0} y={0} dir={1} ball={false} jaw={1} />
        </g>
        <path d="M760,1260 L300,800" stroke={M.pink} strokeWidth={14} strokeDasharray="30 22" strokeLinecap="round" opacity={align} />
      </Stage>
      <Flash at={18} />
    </AbsoluteFill>
  );
};

// 18. "The laughing stops." Jaws drop. Silence.
const Shot18: React.FC<ShotProps> = () => (
  <Stage moon={false}>
    {[150, 350].map((x, i) => (
      <Character key={x} x={x} y={GROUND} scale={0.66} skin={skin(M.lilac)} hat={CourtCap} mouth={-0.2} browRaise={1} brow={0.2} seed={i} look={14} />
    ))}
    <Jar x={620} y={GROUND} s={0.55} toadBall={2} balls={[true, true, false]} />
    <Character x={890} y={GROUND} scale={0.85} skin={ZHANG} hat={ScholarHat} mouth={0.5} brow={-0.6} look={-14} />
  </Stage>
);

// 19. "The strangest part? The jar was lost." The jar crumbles away, leaving an outline.
const Shot19: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tLost = at(start, "그 항아리는");
  const g = clamp01((f - tLost) / 24);
  return (
    <Stage moon={false} cam={{ s: 1.1, x: 540, y: 930 }}>
      <Jar x={540} y={GROUND} s={0.95} ghost={g} />
      {g > 0 &&
        Array.from({ length: 40 }, (_, i) => {
          const sx = 400 + ((i * 53) % 280);
          const sy = GROUND - 60 - ((i * 97) % 380);
          const t = clamp01(g * 1.4 - (i % 7) * 0.05);
          return <rect key={i} x={sx + t * (120 + (i % 5) * 30)} y={sy - t * (160 + (i % 4) * 40)} width={14} height={14} fill={i % 4 === 0 ? M.pink : M.ink} opacity={1 - t} />;
        })}
    </Stage>
  );
};

// 20. "Two thousand years later, no one knows how it worked." Cutaway full of question marks.
const Shot20: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  return (
    <AbsoluteFill>
      <Stage moon={false} floor={false}>
        <g transform="translate(540,1180)">
          <path d="M-110,-40 Q-175,-100 -168,-230 Q-160,-350 -95,-390 L95,-390 Q160,-350 168,-230 Q175,-100 110,-40 Z" transform="scale(1.6)" fill={M.cream} stroke={M.ink} strokeWidth={4} strokeDasharray="20 14" />
          <line x1={0} y1={-560} x2={0} y2={-160} stroke={M.lilac} strokeWidth={8} />
          <circle cx={0} cy={-160} r={34} fill={M.lilac} {...STROKE} transform={`rotate(${Math.sin(f / 12) * 20} 0 -560)`} />
          {[[-120, -420], [130, -300]].map(([gx, gy], i) => (
            <circle key={i} cx={gx} cy={gy} r={44} fill="none" stroke={M.lilac} strokeWidth={14} strokeDasharray="12 10" transform={`rotate(${f * (i ? -2 : 2)} ${gx} ${gy})`} />
          ))}
          <text x={0} y={-260} textAnchor="middle" fontFamily={FONT} fontSize={260} fill={M.pink} stroke={M.ink} strokeWidth={10} paintOrder="stroke" transform={`scale(${pop(6)})`} style={{ transformOrigin: "0px -330px" }}>
            ?
          </text>
        </g>
      </Stage>
      <Label text="이천 년 후" x={LABEL_X} y={LABEL_Y} from={3} to={9999} size={50} />
    </AbsoluteFill>
  );
};

// 21. "So how did a jar feel what no one could?" Close on a dragon's ball, trembling: about to drop again.
const Shot21: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const tremble = Math.sin(f * 1.3) * clamp01(f / 40) * 3;
  return (
    <Stage moon={false} cam={{ s: 1.6 + 0.4 * clamp01(f / 60), x: 690, y: 860 + tremble }}>
      <LightRings x={690} y={850} radii={[420, 300, 190]} colors={WARM} />
      <Jar x={540} y={GROUND} s={1} />
    </Stage>
  );
};

// 22. End card.
const Shot22: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const lines = ["용 항아리."];
  const total = lines.join("").length;
  const typed = Math.min(total, Math.floor(f / 2) + 1);
  const under = clamp01((f - total * 2) / 10);
  let used = 0;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={860} radii={[520, 400, 290, 190]} colors={WARM} dots={{ r: 300, color: M.pink }} />
      </svg>
      <div style={{ position: "absolute", top: 760, width: SW, textAlign: "center", fontFamily: FONT, fontSize: 170, lineHeight: 1.05, color: M.cream, WebkitTextStroke: `16px ${M.ink}`, paintOrder: "stroke fill" }}>
        {lines.map((l, i) => {
          const show = l.slice(0, Math.max(0, typed - used));
          used += l.length;
          return <div key={i}>{show || " "}</div>;
        })}
      </div>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <path
          d={Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${200 + i * 17},${1000 + Math.sin(i * 0.6 + f * 0.3) * 14}`).join(" ")}
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

const SHOTS = [Shot1, Shot2, Shot3, Shot4, Shot5, Shot6, Shot7, Shot8, Shot9, Shot10, Shot11, Shot12, Shot13, Shot14, Shot15, Shot16, Shot17, Shot18, Shot19, Shot20, Shot21, Shot22];

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
const SoundTrack: React.FC = () => {
  const C = CUTS;
  return (
    <>
      <Audio src={staticFile("voice/dragon-jar-ko.mp3")} volume={1} />
      <Audio src={staticFile("sfx/roomtone.wav")} volume={0.1} loop />
      <Sfx name="gong" at={C[1]} vol={0.35} len={90} />
      <Sfx name="whoosh" at={C[3]} vol={0.3} />
      {Array.from({ length: 8 }, (_, i) => <Sfx key={`d${i}`} name="pop" at={C[4] + i * 4} vol={0.22} len={8} />)}
      {Array.from({ length: 8 }, (_, i) => <Sfx key={`b${i}`} name="pop" at={cue("구슬 여덟") + i * 2} vol={0.18} len={8} rate={1.3} />)}
      <Sfx name="croak" at={C[5] + 6} vol={0.35} len={10} />
      <Sfx name="croak" at={C[5] + 12} vol={0.35} len={10} rate={1.1} />
      <Sfx name="cricket" at={C[7]} vol={0.3} len={60} />
      <Sfx name="clang" at={C[8]} vol={0.7} len={50} />
      <Sfx name="impact" at={C[8]} vol={0.25} />
      <Sfx name="laugh" at={C[10]} vol={0.4} len={90} />
      <Sfx name="laugh" at={C[10] + 60} vol={0.3} len={80} rate={1.08} />
      <Sfx name="rumble" at={C[11]} vol={0.35} />
      <Sfx name="whoosh" at={C[12]} vol={0.35} />
      <Sfx name="slam" at={C[12] + 22} vol={0.5} />
      <Sfx name="laugh" at={C[12] + 30} vol={0.2} len={60} rate={0.95} />
      <Sfx name="cricket" at={C[13]} vol={0.3} len={80} />
      <Sfx name="tick" at={C[13]} vol={0.25} len={78} />
      <Sfx name="hooves" at={C[14]} vol={0.55} len={50} />
      <Sfx name="hooves" at={C[14] + 48} vol={0.45} len={50} />
      <Sfx name="scribble" at={C[15] + 6} vol={0.3} />
      <Sfx name="rumble" at={C[15] + 36} vol={0.4} />
      <Sfx name="impact" at={C[16] + 18} vol={0.35} />
      <Sfx name="shimmer" at={C[16] + 18} vol={0.3} />
      <Sfx name="hiss" at={cue("그 항아리는")} vol={0.25} rate={0.7} />
      <Sfx name="tick" at={C[19]} vol={0.2} len={90} />
      <Sfx name="clang" at={C[21] + 2} vol={0.35} len={50} />
      {Array.from({ length: 6 }, (_, i) => <Sfx key={`t${i}`} name="type" at={C[21] + i * 2} vol={0.4} len={6} />)}
    </>
  );
};

export const DragonJarKo: React.FC = () => (
  <UiContext.Provider value={MEMPHIS_UI}>
  <FontContext.Provider value={KO_FONT}>
    <AbsoluteFill style={{ background: M.night }}>
      {SHOTS.map((Shot, i) => (
        <Sequence key={i} from={CUTS[i]} durationInFrames={CUTS[i + 1] - CUTS[i]}>
          <Shot start={CUTS[i]} />
        </Sequence>
      ))}
      <Captions words={WORDS} y={CAPTION_Y} maxWords={2} hideAfterMs={(VOICE_END / 30) * 1000 + 200} />
      <SoundTrack />
    </AbsoluteFill>
  </FontContext.Provider>
  </UiContext.Provider>
);
