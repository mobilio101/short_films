import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Character } from "../../components/Character";
import { UiContext, clamp01, lerp } from "../../components/theme";
import {
  BUNGEE,
  CheckerFloor,
  Captions,
  Confetti,
  GOLD,
  Label,
  LightRings,
  M,
  MEMPHIS_UI,
  MOON,
  OFFSET,
  SAFE,
  SH,
  SW,
  WARM,
  skin,
} from "../../components/memphis";
import { WORDS } from "./words";

export const GHOST_ARMY_DURATION = 1800; // 60 s at 30 fps
const FPS = 30;
const GROUND = 1150;
const CAPTION_Y = 1490;
const LABEL_X = (SAFE.left + SW - SAFE.right) / 2;
const LABEL_Y = 330;

// ---------------------------------------------------------------------------
// Timing: every cut comes from the voice file's word timings.
// ---------------------------------------------------------------------------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
/** Frame where the given phrase starts in the narration (searching from `afterFrame`). */
const cue = (phrase: string, afterFrame = 0): number => {
  const target = phrase.split(" ").map(norm);
  for (let i = 0; i + target.length <= WORDS.length; i++) {
    const f = Math.round((WORDS[i].startMs / 1000) * FPS);
    if (f < afterFrame) continue;
    if (target.every((t, j) => norm(WORDS[i + j].text) === t)) return f;
  }
  throw new Error(`Phrase not found in narration: "${phrase}"`);
};
const VOICE_END = Math.round((WORDS[WORDS.length - 1].endMs / 1000) * FPS);

const CUTS = [
  0,
  cue("In March"),
  cue("Tanks"),
  cue("The Germans"),
  cue("There was just"),
  cue("None of it"),
  cue("The tanks were"),
  cue("The roar"),
  cue("The radio"),
  cue("Even the shoulder"),
  cue("This was the Ghost"),
  cue("trained to fight"),
  cue("From Normandy"),
  cue("At the Rhine six"),
  cue("Their secret"),
  cue("In twenty twenty-four"),
  cue("they finally received"),
  cue("Because sometimes"),
  VOICE_END + 6,
  GHOST_ARMY_DURATION,
];

// ---------------------------------------------------------------------------
// Props, all flat shapes with thick black outlines.
// ---------------------------------------------------------------------------
const STROKE = { stroke: M.ink, strokeWidth: 6, strokeLinejoin: "round" as const };

/** An inflatable decoy tank. `inflate` 0 = flat on the ground, 1 = full; `poke` dents it. */
const Tank: React.FC<{ x: number; y: number; s?: number; inflate?: number; poke?: number; color?: string }> = ({
  x,
  y,
  s = 1,
  inflate = 1,
  poke = 0,
  color = M.teal,
}) => {
  const sy = 0.12 + 0.88 * inflate;
  const sx = 1 + (1 - inflate) * 0.25 - poke * 0.08;
  return (
    <g transform={`translate(${x},${y}) scale(${s * sx},${s * sy})`}>
      {/* treads */}
      <rect x={-170} y={-70} width={340} height={70} rx={35} fill={M.ink} />
      {[-120, -60, 0, 60, 120].map((wx) => (
        <circle key={wx} cx={wx} cy={-35} r={22} fill={M.yellow} stroke={M.ink} strokeWidth={5} />
      ))}
      {/* hull */}
      <path d="M-185,-70 L-150,-150 L150,-150 L185,-70 Z" fill={color} {...STROKE} />
      {/* turret + barrel */}
      <rect x={-75} y={-215} width={150} height={70} rx={30} fill={color} {...STROKE} />
      <rect x={70} y={-196} width={170} height={24} rx={10} fill={color} {...STROKE} />
      {/* valve: the giveaway that it's a balloon */}
      <circle cx={-40} cy={-222} r={11} fill={M.cream} stroke={M.ink} strokeWidth={4} />
      {/* star decal */}
      <path d="M0,-130 l9,18 20,3 -15,14 4,20 -18,-10 -18,10 4,-20 -15,-14 20,-3 Z" fill={M.cream} stroke={M.ink} strokeWidth={3} transform="translate(-60,8)" />
    </g>
  );
};

const Truck: React.FC<{ x: number; y: number; s?: number; speaker?: boolean }> = ({ x, y, s = 1, speaker }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-170} y={-200} width={240} height={150} rx={10} fill={M.lilac} {...STROKE} />
    <path d="M70,-150 L150,-150 L185,-95 L185,-50 L70,-50 Z" fill={M.cream} {...STROKE} />
    <rect x={95} y={-138} width={50} height={40} rx={6} fill={M.teal} stroke={M.ink} strokeWidth={4} />
    {[-110, 120].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-40} r={38} fill={M.ink} />
        <circle cx={wx} cy={-40} r={14} fill={M.yellow} />
      </g>
    ))}
    {speaker && (
      <g transform="translate(-50,-200)">
        <rect x={-14} y={-50} width={28} height={50} fill={M.ink} />
        <path d="M-10,-60 L-90,-140 L90,-140 L10,-60 Z" fill={M.pink} {...STROKE} />
      </g>
    )}
  </g>
);

const Helmet = <path d="M-92,-20 A92,92 0 0 1 92,-20 L100,-10 L-100,-10 Z" fill={M.ink} />;
const Cap = (
  <g>
    <path d="M-86,-30 A88,88 0 0 1 86,-30 Z" fill={M.teal} stroke={M.ink} strokeWidth={5} />
    <rect x={20} y={-38} width={110} height={18} rx={9} fill={M.teal} stroke={M.ink} strokeWidth={5} />
  </g>
);
const Beret = <ellipse cx={-10} cy={-72} rx={95} ry={34} fill={M.pink} stroke={M.ink} strokeWidth={5} />;
const Headphones = (
  <g>
    <path d="M-92,0 A92,92 0 0 1 92,0" fill="none" stroke={M.ink} strokeWidth={12} />
    <rect x={-112} y={-20} width={30} height={55} rx={12} fill={M.pink} stroke={M.ink} strokeWidth={5} />
    <rect x={82} y={-20} width={30} height={55} rx={12} fill={M.pink} stroke={M.ink} strokeWidth={5} />
  </g>
);
const GreyHair = (
  <g>
    <path d="M-80,-40 Q-70,-95 -10,-90 Q60,-100 82,-40" fill="none" stroke={M.grey} strokeWidth={22} strokeLinecap="round" />
    <path d="M-86,-20 Q-100,10 -88,30 M86,-20 Q100,10 88,30" fill="none" stroke={M.grey} strokeWidth={14} strokeLinecap="round" />
  </g>
);

const Paper: React.FC<{ w: number; h: number; children?: React.ReactNode }> = ({ w, h, children }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={M.cream} {...STROKE} />
    {children}
  </g>
);

// ---------------------------------------------------------------------------
// Shared scene pieces
// ---------------------------------------------------------------------------
const Stage: React.FC<{ children: React.ReactNode; cam?: { s: number; x: number; y: number }; floor?: boolean; moon?: boolean; confetti?: boolean }> = ({
  children,
  cam = { s: 1, x: SW / 2, y: SH / 2 },
  floor = true,
  moon = true,
  confetti = true,
}) => (
  <AbsoluteFill style={{ background: M.night }}>
    <AbsoluteFill style={{ transform: `translate(${SW / 2 - cam.x * cam.s}px, ${SH / 2 - cam.y * cam.s}px) scale(${cam.s})`, transformOrigin: "0 0" }}>
      <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} style={{ overflow: "visible" }}>
        {moon && <LightRings x={780} y={520} radii={[300, 210, 130]} colors={MOON} />}
        {moon && <circle cx={780} cy={520} r={70} fill={M.cream} stroke={M.ink} strokeWidth={6} />}
        {confetti && (
          <Confetti
            spots={[
              { x: 110, y: 560, kind: "squiggle", color: M.pink },
              { x: 300, y: 260, kind: "triangle", color: M.lilac },
              { x: 960, y: 900, kind: "ring", color: M.teal },
              { x: 150, y: 900, kind: "grid", color: M.yellow },
              { x: 520, y: 780, kind: "cross", color: M.teal, size: 30 },
            ]}
          />
        )}
        {floor && <CheckerFloor y={GROUND} />}
        <g style={{ filter: OFFSET }}>{children}</g>
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

const useLocal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { f: frame, fps, pop: (at: number, damping = 9) => spring({ frame: frame - at, fps, config: { damping, stiffness: 200 } }) };
};

const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 1, at + 7], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#FFFFFF", opacity: o }} />;
};

const SpeedLines: React.FC<{ at: number; dir?: 1 | -1 }> = ({ at, dir = -1 }) => {
  const f = useCurrentFrame();
  const t = (f - at) / 10;
  if (t < 0 || t > 1) return null;
  return (
    <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 16 }, (_, i) => {
        const y = 250 + i * 95 + ((i * 37) % 40);
        const len = 300 + ((i * 131) % 300);
        const x = dir < 0 ? SW - t * (SW + len) : t * (SW + len) - len;
        return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke={M.ink} strokeWidth={8} strokeLinecap="round" opacity={1 - t} />;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// The 18 shots. Each receives its own local frame (0 = start of the shot).
// `abs` converts a narration frame to the shot's local frame.
// ---------------------------------------------------------------------------
type ShotProps = { start: number };
const abs = (start: number, frame: number) => frame - start;

// 1. "This army fought with balloons." A flat tank inflates in two puffs.
const Shot1: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const puff = clamp01(f / 14) * 0.55 + clamp01((f - 20) / 14) * 0.45;
  const wobble = Math.sin(f * 0.9) * 0.05 * (1 - clamp01((f - 36) / 20));
  return (
    <Stage moon={false}>
      <LightRings x={540} y={900} radii={[520, 400, 290, 190]} colors={WARM} dots={{ r: 260, color: M.yellow }} />
      <Tank x={540} y={GROUND} s={1.5} inflate={Math.min(1, puff + wobble)} />
    </Stage>
  );
};

// 2. "In March, 1945, two American divisions appeared on the banks of the Rhine." Map with two flags.
const Shot2: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const push = 1 + 0.08 * clamp01(f / 140);
  const river = "M600,300 C520,500 700,640 600,820 C500,1000 680,1120 600,1220";
  const drawn = clamp01(f / 30);
  const flag = (x: number, y: number, at: number) => (
    <g transform={`translate(${x},${y}) scale(${pop(at)})`}>
      <line x1={0} y1={0} x2={0} y2={-120} stroke={M.ink} strokeWidth={8} />
      <path d="M0,-120 L90,-95 L0,-70 Z" fill={M.pink} {...STROKE} />
    </g>
  );
  const tDiv = abs(start, cue("two American"));
  return (
    <Stage floor={false} moon={false} cam={{ s: push, x: 540, y: 820 }}>
      <g transform="translate(540,760) rotate(-2)">
        <Paper w={760} h={1000} />
      </g>
      <path d={river} fill="none" stroke={M.lilac} strokeWidth={46} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
      <text x={700} y={560} fontFamily={BUNGEE} fontSize={44} fill={M.ink}>RHINE</text>
      {flag(430, 760, tDiv + 6)}
      {flag(400, 960, tDiv + 14)}
    </Stage>
  );
};

// 3. "Tanks. Trucks. Thousands of men." They pop in one per word.
const Shot3: React.FC<ShotProps> = ({ start }) => {
  const { pop } = useLocal();
  const tTrucks = abs(start, cue("Trucks"));
  const tMen = abs(start, cue("Thousands"));
  return (
    <Stage>
      <g transform={`translate(0,0)`}>
        <g style={{ transformOrigin: `300px ${GROUND}px`, transform: `scale(${pop(0)})` }}>
          <Tank x={300} y={GROUND} s={0.9} />
        </g>
        <g style={{ transformOrigin: `800px ${GROUND}px`, transform: `scale(${pop(tTrucks)})` }}>
          <Truck x={790} y={GROUND} s={0.9} />
        </g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} style={{ transformOrigin: `${130 + i * 170}px ${GROUND + 330}px`, transform: `scale(${pop(tMen + i * 2)})` }}>
            <Character x={130 + i * 170} y={GROUND + 330} scale={0.55} skin={skin(M.teal)} hat={Helmet} seed={i} brow={-0.4} />
          </g>
        ))}
      </g>
    </Stage>
  );
};

// 4. "The Germans moved their defenses to meet them." Whip pan to the far bank.
const Shot4: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const run = f * 6;
  return (
    <AbsoluteFill>
      <Stage>
        {/* searchlight beam */}
        <path d={`M980,${GROUND - 40} L${300 + Math.sin(f / 12) * 200},500 L${470 + Math.sin(f / 12) * 200},500 Z`} fill={M.lilac} opacity={0.55} />
        <rect x={930} y={GROUND - 90} width={90} height={90} rx={10} fill={M.lilac} {...STROKE} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${-run},0)`}>
            <Character
              x={900 + i * 230}
              y={GROUND}
              scale={0.7}
              skin={skin(M.lilac)}
              hat={Helmet}
              walk={1}
              walkPhase={f * 0.5 + i}
              brow={-0.6}
              handsY={220}
              held={<rect x={-60} y={-30} width={120} height={60} rx={14} fill={M.cream} stroke={M.ink} strokeWidth={5} />}
              seed={i + 3}
            />
          </g>
        ))}
      </Stage>
      <SpeedLines at={0} />
    </AbsoluteFill>
  );
};

// 5. "There was just one problem." Our soldier leans on a tank, smug.
const Shot5: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const push = 1 + 0.1 * clamp01(f / 40);
  return (
    <Stage cam={{ s: push, x: 500, y: 950 }}>
      <Tank x={680} y={GROUND} s={1} />
      <Character x={330} y={GROUND} scale={1} skin={skin(M.amber)} hat={Cap} mouth={0.6} brow={0.1} browRaise={0.3} look={14} />
    </Stage>
  );
};

// 6. "None of it was real." A finger pokes the tank; it squishes like a balloon. Flash on "real".
const Shot6: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tReal = abs(start, cue("real"));
  const reach = clamp01((f - 4) / 10);
  const dent = f >= tReal - 4 ? Math.max(0, Math.sin((f - tReal + 4) * 0.6) * Math.exp(-(f - tReal + 4) / 10)) : 0;
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: 1.7, x: 600, y: 1020 }}>
        <LightRings x={600} y={950} radii={[420, 300, 190]} colors={WARM} />
        <Tank x={640} y={GROUND} s={1} poke={dent * 3} />
        <path d={`M-40,960 Q200,${940 - reach * 10} ${lerp(120, 410 + dent * 30, reach)},960`} stroke={M.amber} strokeWidth={36} strokeLinecap="round" fill="none" />
      </Stage>
      <Flash at={tReal} />
    </AbsoluteFill>
  );
};

// 7. "The tanks were rubber, inflated in minutes." Compressor inflating, then lifting a whole tank.
const Shot7: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tLift = abs(start, cue("inflated"));
  if (f < tLift) {
    const inflate = clamp01(f / Math.max(10, tLift - 4));
    return (
      <Stage>
        <rect x={110} y={GROUND - 160} width={180} height={160} rx={16} fill={M.yellow} {...STROKE} />
        <circle cx={200} cy={GROUND - 100} r={36} fill={M.cream} stroke={M.ink} strokeWidth={5} />
        <line x1={200} y1={GROUND - 100} x2={200 + Math.cos(f) * 28} y2={GROUND - 100 + Math.sin(f) * 28} stroke={M.ink} strokeWidth={6} />
        <path d={`M290,${GROUND - 60} C420,${GROUND - 20} 450,${GROUND - 240} ${560},${GROUND - 200}`} fill="none" stroke={M.ink} strokeWidth={14} />
        <Tank x={720} y={GROUND} s={0.9} inflate={inflate} />
      </Stage>
    );
  }
  const lf = f - tLift;
  const up = clamp01(lf / 10);
  return (
    <Stage cam={{ s: 1.05, x: 540, y: 900 }}>
      <Character
        x={540}
        y={GROUND}
        scale={1}
        skin={skin(M.amber)}
        hat={Cap}
        handsY={lerp(200, 470, up)}
        squash={1 + 0.06 * up}
        mouth={0.7}
        brow={-0.2}
        held={
          <g transform="translate(0,-10) scale(0.55)">
            <Tank x={0} y={70} s={1} />
          </g>
        }
      />
    </Stage>
  );
};

// 8. "The roar of engines came from speakers on trucks." Sound-wave rings from a horn speaker.
const Shot8: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tRoar = abs(start, cue("roar"));
  const drift = -f * 1.2;
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.1, x: 540 + drift * 0.3, y: 920 }}>
        {[0, 1, 2, 3].map((i) => {
          const t = ((f - tRoar) / 22 + i * 0.25) % 1;
          if (f < tRoar) return null;
          return <circle key={i} cx={490} cy={GROUND - 340} r={60 + t * 380} fill="none" stroke={M.pink} strokeWidth={14 * (1 - t)} opacity={1 - t} />;
        })}
        <Truck x={540} y={GROUND} s={1.2} speaker />
      </Stage>
      <Label text="RECORDED SOUND" x={LABEL_X} y={LABEL_Y} from={tRoar + 4} to={9999} />
    </AbsoluteFill>
  );
};

// 9. "The radio chatter was scripted." Operator reading from a script; zigzag radio waves.
const Shot9: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  return (
    <Stage cam={{ s: 1.25, x: 560, y: 900 }}>
      <rect x={160} y={GROUND - 260} width={260} height={180} rx={16} fill={M.lilac} {...STROKE} />
      <rect x={160} y={GROUND - 80} width={260} height={80} fill={M.ink} />
      {[220, 290, 360].map((dx, i) => (
        <circle key={dx} cx={dx} cy={GROUND - 190} r={24} fill={M.yellow} stroke={M.ink} strokeWidth={5} transform={`rotate(${f * 6 * (i + 1)} ${dx} ${GROUND - 190})`} />
      ))}
      <line x1={380} y1={GROUND - 260} x2={420} y2={GROUND - 420} stroke={M.ink} strokeWidth={8} />
      {[0, 1, 2].map((i) => {
        const t = ((f / 18 + i / 3) % 1);
        return <path key={i} d={`M${430 + t * 60},${GROUND - 430 - t * 160} l25,-25 25,25 25,-25 25,25`} fill="none" stroke={M.teal} strokeWidth={10} opacity={1 - t} />;
      })}
      <Character
        x={730}
        y={GROUND}
        scale={0.95}
        skin={skin(M.teal)}
        hat={Headphones}
        handsY={230}
        look={-12}
        mouth={Math.sin(f * 0.8) * 0.4}
        held={
          <g transform="translate(0,-40)">
            <Paper w={150} h={190}>
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={-50} y1={-60 + i * 30} x2={50} y2={-60 + i * 30} stroke={M.ink} strokeWidth={5} />
              ))}
            </Paper>
          </g>
        }
      />
    </Stage>
  );
};

// 10. "Even the shoulder patches were fake." Close-up: a brush paints a patch, then a new one pops on.
const Shot10: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tFake = abs(start, cue("fake"));
  const swap = f >= tFake;
  const brushX = 560 + Math.sin(f * 0.5) * 60;
  return (
    <Stage floor={false} moon={false}>
      <LightRings x={540} y={900} radii={[520, 380, 250]} colors={WARM} />
      {/* shoulder and sleeve */}
      <path d="M-50,1500 C150,700 700,560 1150,700 L1150,1500 Z" fill={M.teal} {...STROKE} />
      <g transform={`translate(560,960) scale(${swap ? pop(tFake) : 1})`}>
        <path d="M-120,-140 L120,-140 L120,40 Q0,160 -120,40 Z" fill={swap ? M.yellow : M.lilac} {...STROKE} />
        {swap ? (
          <path d="M0,-90 l22,46 50,6 -37,34 10,50 -45,-25 -45,25 10,-50 -37,-34 50,-6 Z" fill={M.pink} stroke={M.ink} strokeWidth={5} />
        ) : (
          <circle cx={0} cy={-30} r={60} fill={M.cream} stroke={M.ink} strokeWidth={5} />
        )}
      </g>
      {!swap && (
        <g transform={`translate(${brushX},700) rotate(-30)`}>
          <rect x={-18} y={-260} width={36} height={220} rx={12} fill={M.yellow} {...STROKE} />
          <path d="M-26,-40 L26,-40 L16,40 L-16,40 Z" fill={M.pink} {...STROKE} />
        </g>
      )}
    </Stage>
  );
};

// 11. "This was the Ghost Army: about eleven hundred artists, designers and sound engineers," Pull-out reveal.
const Shot11: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const pull = lerp(1.9, 1, clamp01(f / 45) ** 0.7);
  const tNum = abs(start, cue("about eleven"));
  const hats = [Beret, Headphones, Beret, Cap, Headphones, Beret];
  const bodies = [M.cream, M.yellow, M.amber, M.teal, M.lilac, M.cream];
  const rows = [
    { y: GROUND - 180, s: 0.5, xs: [150, 340, 530, 720, 910] },
    { y: GROUND + 60, s: 0.6, xs: [100, 320, 540, 760, 980] },
    { y: GROUND + 330, s: 0.72, xs: [210, 540, 870] },
  ];
  return (
    <AbsoluteFill>
      <Stage cam={{ s: pull, x: 540, y: lerp(GROUND + 60, SH / 2, clamp01(f / 45) ** 0.7) }}>
        {rows.map((r, ri) =>
          r.xs.map((x, i) => {
            const k = ri * 5 + i;
            return (
              <Character key={k} x={x} y={r.y} scale={r.s} skin={skin(bodies[k % 6])} hat={hats[k % 6]} mouth={0.5} brow={0.2} seed={k} look={(k % 3) * 8 - 8} />
            );
          }),
        )}
      </Stage>
      <Label text="THE GHOST ARMY" x={LABEL_X} y={LABEL_Y} from={4} to={tNum - 2} color={M.pink} />
      <Label text="~1,100 MEN" x={LABEL_X} y={LABEL_Y} from={tNum} to={9999} />
    </AbsoluteFill>
  );
};

// 12. "trained to fight with paint, noise and imagination." Three quick icons.
const Shot12: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tNoise = abs(start, cue("noise"));
  const tImag = abs(start, cue("imagination"));
  const which = f < tNoise ? 0 : f < tImag ? 1 : 2;
  const at = [0, tNoise, tImag][which];
  const s = pop(at);
  return (
    <Stage floor={false} moon={false}>
      <LightRings x={540} y={880} radii={[480, 360, 250]} colors={which === 2 ? GOLD : WARM} dots={{ r: 330, color: M.yellow }} />
      <g transform={`translate(540,880) scale(${s * 1.4}) rotate(${(1 - s) * 20})`}>
        {which === 0 && (
          <g transform="rotate(-30)">
            <rect x={-24} y={-260} width={48} height={260} rx={14} fill={M.yellow} {...STROKE} />
            <rect x={-30} y={-10} width={60} height={50} fill={M.grey} {...STROKE} />
            <path d="M-34,40 L34,40 L20,150 Q0,190 -20,150 Z" fill={M.pink} {...STROKE} />
          </g>
        )}
        {which === 1 && (
          <g>
            <rect x={-150} y={-60} width={90} height={120} fill={M.lilac} {...STROKE} />
            <path d="M-60,-60 L60,-150 L60,150 L-60,60 Z" fill={M.pink} {...STROKE} />
            {[0, 1, 2].map((i) => {
              const t = ((f / 12 + i / 3) % 1);
              return <path key={i} d={`M${100 + t * 80},-${70 + t * 50} Q${150 + t * 100},0 ${100 + t * 80},${70 + t * 50}`} fill="none" stroke={M.cream} strokeWidth={12} opacity={1 - t} />;
            })}
          </g>
        )}
        {which === 2 && (
          <g>
            <circle cx={0} cy={-40} r={110} fill={M.yellow} {...STROKE} />
            <rect x={-50} y={60} width={100} height={70} rx={10} fill={M.grey} {...STROKE} />
            <path d="M-30,-20 L0,20 L30,-20" fill="none" stroke={M.ink} strokeWidth={8} />
          </g>
        )}
      </g>
    </Stage>
  );
};

// 13. "From Normandy to the Rhine, they staged more than twenty deceptions." Dotted route + counter.
const Shot13: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tTwenty = abs(start, cue("twenty deceptions"));
  const route = "M260,1180 C360,1000 420,920 560,860 C700,800 760,680 820,560";
  const drawn = clamp01(f / Math.max(20, tTwenty));
  const stops = [0.15, 0.32, 0.5, 0.66, 0.82, 1];
  const n = Math.min(20, Math.floor(clamp01(f / Math.max(20, tTwenty)) * 20));
  return (
    <AbsoluteFill>
      <Stage floor={false} moon={false}>
        <g transform="translate(540,860) rotate(1.5)">
          <Paper w={800} h={880} />
        </g>
        <path d="M820,450 C760,560 900,700 820,860 C760,980 880,1100 820,1270" fill="none" stroke={M.lilac} strokeWidth={34} strokeLinecap="round" />
        <path d="M170,1280 C210,1220 170,1160 240,1100 C300,1050 240,1000 300,960" fill="none" stroke={M.lilac} strokeWidth={14} />
        <text x={160} y={1270} fontFamily={BUNGEE} fontSize={36} fill={M.ink}>NORMANDY</text>
        <text x={650} y={500} fontFamily={BUNGEE} fontSize={36} fill={M.ink}>RHINE</text>
        <path d={route} fill="none" stroke={M.lilac} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 26" />
        <path d={route} fill="none" stroke={M.pink} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
        {stops.map((p, i) => (drawn >= p ? <circle key={i} cx={260 + (820 - 260) * p} cy={1180 - (1180 - 560) * p} r={16} fill={M.yellow} stroke={M.ink} strokeWidth={5} /> : null))}
      </Stage>
      <Label text={f >= tTwenty ? "20+ OPERATIONS" : `${n} OPERATIONS`} x={LABEL_X} y={LABEL_Y} from={6} to={9999} />
    </AbsoluteFill>
  );
};

// 14. "At the Rhine, six hundred inflatable vehicles drew the enemy's eyes, while the real divisions crossed somewhere else."
const Shot14: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tEyes = abs(start, cue("drew the"));
  const tReal = abs(start, cue("while the real"));
  const look = Math.min(1, pop(tEyes, 14));
  const boatX = lerp(-200, 1250, clamp01((f - tReal) / 70));
  return (
    <AbsoluteFill style={{ background: M.night }}>
      {/* top: the fake camp the enemy is staring at */}
      <AbsoluteFill style={{ height: SH / 2, overflow: "hidden" }}>
        <svg width={SW} height={SH / 2} viewBox={`0 0 ${SW} ${SH / 2}`}>
          <rect width={SW} height={SH / 2} fill={M.night} />
          <LightRings x={540} y={700} radii={[520, 380, 250]} colors={WARM} />
          <g style={{ filter: OFFSET }}>
            {[200, 470, 740].map((x, i) => (
              <Tank key={x} x={x} y={860} s={0.55} inflate={pop(4 + i * 4, 10)} />
            ))}
            {/* giant enemy eyes peeking in from the right */}
            <g transform={`translate(${lerp(1200, 900, look)},420)`}>
              {[-70, 70].map((dy) => (
                <g key={dy}>
                  <ellipse cx={0} cy={dy} rx={70} ry={52} fill={M.cream} {...STROKE} />
                  <circle cx={-30} cy={dy + 10} r={22} fill={M.ink} />
                </g>
              ))}
            </g>
          </g>
          <line x1={0} y1={SH / 2 - 3} x2={SW} y2={SH / 2 - 3} stroke={M.ink} strokeWidth={12} />
        </svg>
      </AbsoluteFill>
      {/* bottom: the real crossing, quiet and dark */}
      <AbsoluteFill style={{ top: SH / 2, height: SH / 2, opacity: interpolate(f, [tReal - 6, tReal + 4], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <svg width={SW} height={SH / 2} viewBox={`0 0 ${SW} ${SH / 2}`}>
          <rect width={SW} height={SH / 2} fill={M.night} />
          <rect y={330} width={SW} height={SH / 2 - 330} fill={M.floor} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${((i * 230 + f * 2) % 1300) - 150},${400 + i * 60} q30,-16 60,0 t60,0`} fill="none" stroke={M.teal} strokeWidth={6} />
          ))}
          <g style={{ filter: OFFSET }} transform={`translate(${boatX},380)`}>
            <path d="M-170,0 L170,0 L130,60 L-130,60 Z" fill={M.lilac} {...STROKE} />
            {[-90, 0, 90].map((x, i) => (
              <Character key={x} x={x} y={10} scale={0.32} skin={skin(M.teal)} hat={Helmet} seed={i + 9} brow={-0.5} />
            ))}
          </g>
        </svg>
      </AbsoluteFill>
      <Label text="600 FAKE VEHICLES" x={LABEL_X} y={260} from={abs(start, cue("six hundred")) + 2} to={9999} />
    </AbsoluteFill>
  );
};

// 15. "Their secret stayed locked away until 1996." Folder into drawer, years spin, then declassified.
const Shot15: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tYear = abs(start, cue("nineteen ninety-six"));
  const slide = clamp01((f - 6) / 14);
  const closed = f >= 22 && f < tYear + 4;
  const opened = f >= tYear + 4;
  const year = f < 24 ? 1945 : f >= tYear ? 1996 : Math.round(lerp(1945, 1996, clamp01((f - 24) / Math.max(1, tYear - 24))));
  return (
    <AbsoluteFill>
      <Stage floor={false} moon={false}>
        <LightRings x={540} y={880} radii={[500, 360, 230]} colors={MOON} />
        {/* cabinet */}
        <rect x={220} y={760} width={640} height={620} rx={18} fill={M.lilac} {...STROKE} />
        <rect x={260} y={1080 + (opened ? 70 : 0)} width={560} height={260} rx={12} fill={M.teal} {...STROKE} />
        <rect x={480} y={1180 + (opened ? 70 : 0)} width={120} height={30} rx={10} fill={M.yellow} stroke={M.ink} strokeWidth={5} />
        {closed && <circle cx={760} cy={1210} r={26} fill={M.yellow} stroke={M.ink} strokeWidth={6} />}
        {/* folder */}
        {!closed && (
          <g transform={`translate(540,${opened ? 900 - pop(tYear + 4) * 120 : lerp(520, 1130, slide)}) rotate(${opened ? -4 : 0})`}>
            <rect x={-200} y={-140} width={400} height={280} rx={10} fill={M.yellow} {...STROKE} />
            <g transform="rotate(-12)">
              <rect x={-150} y={-45} width={300} height={90} fill="none" stroke={opened ? M.teal : M.pink} strokeWidth={10} />
              <text x={0} y={22} textAnchor="middle" fontFamily={BUNGEE} fontSize={opened ? 40 : 60} fill={opened ? M.teal : M.pink}>
                {opened ? "DECLASSIFIED" : "SECRET"}
              </text>
            </g>
          </g>
        )}
      </Stage>
      <Label text={String(year)} x={LABEL_X} y={LABEL_Y} from={22} to={9999} size={90} color={year === 1996 ? M.yellow : M.cream} />
    </AbsoluteFill>
  );
};

// 16. "In 2024, they finally received the Congressional Gold Medal." The old soldier gets the medal.
const Shot16: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const tMedal = 18;
  const drop = pop(tMedal, 8);
  const push = 1 + 0.12 * clamp01(f / 120);
  const medal = (
    <g transform={`translate(0,${-260 + drop * 300}) scale(${0.6 + 0.4 * drop})`} opacity={clamp01((f - tMedal + 6) / 4)}>
      <path d="M-30,0 L-14,60 L14,60 L30,0 Z" fill={M.pink} stroke={M.ink} strokeWidth={4} />
      <circle cx={0} cy={86} r={34} fill={M.cream} stroke={M.ink} strokeWidth={5} />
    </g>
  );
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: push, x: 540, y: 880 }}>
        <LightRings x={540} y={760} radii={[560, 430, 310, 200]} colors={GOLD} dots={{ r: 380, color: M.yellow }} />
        <Character x={540} y={GROUND} scale={1.1} skin={skin(M.amber)} hat={GreyHair} mouth={0.7} brow={0.5} browRaise={drop * 0.6} chest={f >= tMedal - 6 ? medal : undefined} />
      </Stage>
      <Label text="MARCH 21, 2024" x={LABEL_X} y={LABEL_Y} from={4} to={9999} />
    </AbsoluteFill>
  );
};

// 16b. "they finally received the Congressional Gold Medal." The real photo from the ceremony.
const PHOTO = { src: "photos/dvids-8301726-medal.jpg", w: 1999, h: 1333, focusX: 0.6, focusY: 0.5, credit: "U.S. ARMY PHOTO: HENRY VILLARAMA" };
const ShotPhoto: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const { durationInFrames } = useVideoConfig();
  const enter = pop(0, 11);
  const zoom = 1 + 0.18 * clamp01(f / durationInFrames);
  const boxW = 880;
  const boxH = 960;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={800} radii={[620, 480, 340]} colors={WARM} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: (SW - boxW) / 2 - 20,
          top: 270,
          width: boxW,
          height: boxH,
          border: `10px solid ${M.ink}`,
          boxShadow: `14px 14px 0 ${M.shadow}`,
          background: M.ink,
          overflow: "hidden",
          transform: `rotate(${-2 + (1 - enter) * -6}deg) scale(${0.85 + 0.15 * enter})`,
        }}
      >
        <Img
          src={staticFile(PHOTO.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${PHOTO.focusX * 100}% ${PHOTO.focusY * 100}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${PHOTO.focusX * 100}% ${PHOTO.focusY * 100}%`,
            filter: "saturate(0.8) contrast(1.05)",
          }}
        />
      </div>
      <Label text="REAL PHOTO · MARCH 21, 2024" x={LABEL_X} y={215} from={3} to={9999} size={40} />
      <div
        style={{
          position: "absolute",
          top: 270 + boxH + 30,
          left: SAFE.left,
          width: SW - SAFE.left - SAFE.right,
          textAlign: "center",
          fontFamily: BUNGEE,
          fontSize: 26,
          color: M.ink,
          opacity: clamp01((f - 6) / 8),
        }}
      >
        {PHOTO.credit}
      </div>
    </AbsoluteFill>
  );
};

// 17. "Because sometimes, the most powerful army on the battlefield is the one that isn't there." Everything deflates.
const Shot17: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const end = abs(start, VOICE_END);
  const deflate = (i: number) => 1 - clamp01((f - (end * 0.35 + i * 10)) / 14);
  const heroFade = 1 - clamp01((f - (end - 6)) / 10);
  const push = 1 + 0.1 * clamp01(f / end);
  return (
    <Stage cam={{ s: push, x: 540, y: 960 }}>
      {[180, 540, 900].map((x, i) => (
        <Tank key={x} x={x} y={GROUND - 120} s={0.55} inflate={deflate(i)} />
      ))}
      <g opacity={heroFade}>
        <Character x={540} y={GROUND + 280} scale={0.9} skin={skin(M.amber)} hat={Cap} mouth={0.4} brow={-0.3} />
      </g>
    </Stage>
  );
};

// 18. End card: "THE GHOST ARMY." types on, wavy pink underline, then a flat tank to loop into shot 1.
const Shot18: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const lines = ["THE GHOST", "ARMY."];
  const total = lines.join("").length;
  const typed = Math.min(total, Math.floor(f / 2) + 1);
  const under = clamp01((f - total * 2 - 2) / 12);
  let used = 0;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={860} radii={[520, 400, 290, 190]} colors={WARM} dots={{ r: 300, color: M.yellow }} />
      </svg>
      <div style={{ position: "absolute", top: 640, width: SW, textAlign: "center", fontFamily: BUNGEE, fontSize: 150, lineHeight: 1.05, color: M.cream, WebkitTextStroke: `16px ${M.ink}`, paintOrder: "stroke fill" }}>
        {lines.map((l, i) => {
          const show = l.slice(0, Math.max(0, typed - used));
          used += l.length;
          return <div key={i}>{show || " "}</div>;
        })}
      </div>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <path
          d={Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${200 + i * 17},${1010 + Math.sin(i * 0.6 + f * 0.3) * 14}`).join(" ")}
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

const SHOTS = [Shot1, Shot2, Shot3, Shot4, Shot5, Shot6, Shot7, Shot8, Shot9, Shot10, Shot11, Shot12, Shot13, Shot14, Shot15, Shot16, ShotPhoto, Shot17, Shot18];

// ---------------------------------------------------------------------------
// Sound: voice on top, code-made effects underneath.
// ---------------------------------------------------------------------------
const Sfx: React.FC<{ name: string; at: number; vol?: number; len?: number; rate?: number }> = ({ name, at, vol = 0.4, len = 60, rate }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={len} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} playbackRate={rate} />
  </Sequence>
);

const SoundTrack: React.FC = () => {
  const C = CUTS;
  const word = (p: string, after = 0) => cue(p, after);
  return (
    <>
      <Audio src={staticFile("voice/ghost-army.mp3")} volume={1} />
      <Audio src={staticFile("sfx/roomtone.wav")} volume={0.12} loop />
      {/* 1 */}
      <Sfx name="hiss" at={2} vol={0.35} />
      <Sfx name="hiss" at={20} vol={0.35} />
      <Sfx name="pop" at={40} vol={0.3} />
      {/* 2 */}
      <Sfx name="scribble" at={C[1]} vol={0.3} />
      <Sfx name="pop" at={word("two American") + 6} vol={0.3} />
      <Sfx name="pop" at={word("two American") + 14} vol={0.3} />
      {/* 3 */}
      <Sfx name="pop" at={C[2]} vol={0.35} />
      <Sfx name="engine" at={C[2]} vol={0.12} />
      <Sfx name="pop" at={word("Trucks")} vol={0.35} />
      <Sfx name="pop" at={word("Thousands")} vol={0.35} />
      {/* 4 */}
      <Sfx name="whoosh" at={C[3] - 2} vol={0.4} />
      {[0, 8, 16, 24, 32, 40].map((d) => (
        <Sfx key={d} name="step" at={C[3] + 8 + d} vol={0.25} len={8} />
      ))}
      {/* 6 */}
      <Sfx name="boing" at={word("real") - 4} vol={0.5} />
      <Sfx name="impact" at={word("real")} vol={0.25} />
      {/* 7 */}
      <Sfx name="pump" at={C[6]} vol={0.35} />
      <Sfx name="hiss" at={C[6] + 8} vol={0.3} />
      <Sfx name="pop" at={word("inflated")} vol={0.3} />
      {/* 8 */}
      <Sfx name="engine" at={word("roar")} vol={0.25} />
      {/* 9 */}
      <Sfx name="static" at={C[8]} vol={0.25} />
      {/* 10 */}
      <Sfx name="scribble" at={C[9]} vol={0.25} />
      <Sfx name="pop" at={word("fake")} vol={0.35} />
      {/* 11 */}
      <Sfx name="whoosh" at={C[10]} vol={0.35} />
      <Sfx name="pop" at={word("about eleven")} vol={0.3} />
      {/* 12 */}
      <Sfx name="pop" at={word("paint")} vol={0.3} />
      <Sfx name="pop" at={word("noise")} vol={0.3} />
      <Sfx name="shimmer" at={word("imagination")} vol={0.3} />
      {/* 13 */}
      <Sfx name="scribble" at={C[12]} vol={0.3} />
      <Sfx name="pop" at={word("twenty deceptions")} vol={0.35} />
      {/* 14 */}
      <Sfx name="pop" at={word("six hundred")} vol={0.3} />
      <Sfx name="whoosh" at={word("drew the")} vol={0.25} />
      <Sfx name="paddle" at={word("while the real")} vol={0.35} />
      {/* 15 */}
      <Sfx name="slam" at={C[14] + 22} vol={0.45} />
      <Sfx name="stamp" at={word("nineteen ninety-six") + 4} vol={0.5} />
      {/* 16 */}
      <Sfx name="pop" at={C[15] + 18} vol={0.3} />
      <Sfx name="click" at={C[16]} vol={0.5} />
      <Sfx name="shimmer" at={word("Gold Medal")} vol={0.35} />
      <Sfx name="applause" at={word("Gold Medal") + 4} vol={0.3} len={70} />
      {/* 17 */}
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="hiss" at={C[17] + Math.round((C[18] - C[17]) * 0.35) + i * 10} vol={0.25} rate={0.8} />
      ))}
      {/* 18 */}
      {Array.from({ length: 13 }, (_, i) => (
        <Sfx key={`t${i}`} name="type" at={C[18] + i * 2} vol={0.5} len={6} />
      ))}
      <Sfx name="shimmer" at={C[18] + 28} vol={0.35} />
    </>
  );
};

export const GhostArmy: React.FC = () => (
  <UiContext.Provider value={MEMPHIS_UI}>
    <AbsoluteFill style={{ background: M.night }}>
      {SHOTS.map((Shot, i) => (
        <Sequence key={i} from={CUTS[i]} durationInFrames={CUTS[i + 1] - CUTS[i]}>
          <Shot start={CUTS[i]} />
        </Sequence>
      ))}
      <Captions words={WORDS} y={CAPTION_Y} hideAfterMs={(VOICE_END / FPS) * 1000 + 200} />
      <SoundTrack />
    </AbsoluteFill>
  </UiContext.Provider>
);
