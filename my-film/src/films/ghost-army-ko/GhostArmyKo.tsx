// 유령 부대 (Ghost Army, Korean version). Written natively in Korean; see STORY.md.
// Every cut and sound is placed with cue("phrase") from the voice's word timings.
import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Character, EMOTE, Pose, Skin } from "../../components/Character";
import { INK_MAIN, INK_SIDE, InkDrop } from "../../components/mascot";
import { GERMAN_PATCH, US_PATCH } from "../../components/insignia";
import { UiContext, clamp01, lerp } from "../../components/theme";
import { Captions, FontContext, GOLD, Label, LightRings, M, MEMPHIS_UI, OFFSET, SAFE, SH, SW, WARM, skin } from "../../components/memphis";
import { Flash, GROUND, Paper, STROKE, Sfx, SpeedLines, Stage, makeCues, useLocal } from "../../components/shortkit";
import { KO_FONT } from "../../components/korean";
import { WORDS } from "./words";

const FONT = KO_FONT;

export const GHOST_ARMY_KO_DURATION = 1800; // 60 s at 30 fps
const CAPTION_Y = 1490;
const LABEL_X = (SAFE.left + SW - SAFE.right) / 2;
const LABEL_Y = 330;

const { cue, end: VOICE_END } = makeCues(WORDS);

const CUTS = [
  0, // 1 four soldiers straining
  cue("탱크를"), // 2 the tank goes up
  cue("들어 옮긴다면"), // 3 a villager's shocked face
  cue("천구백사십사년"), // 4 map: Normandy
  cue("자전거를 타던 마을"), // 5 two cyclists see it
  cue("보초를"), // 6 Shilstone walks up
  cue("미군은 힘이"), // 7 "Americans are very strong"
  cue("사실 그"), // 8 poke: it's a balloon
  cue("실스톤의 부대는"), // 9 the artists
  cue("비밀 부대"), // 10 the stamp
  cue("고무 탱크에"), // 11 montage: inflate / speaker / radio
  cue("가장 큰"), // 12 map: to the Rhine
  cue("고무 차량"), // 13 600 decoys at night
  cue("독일군은"), // 14 the Germans move
  cue("그 사이"), // 15 the real crossing
  cue("하지만 이"), // 16 secret drawer, 1945 → 1996
  cue("노병들은"), // 17 real photo
  cue("의회 금메달을"), // 18 drawn veterans with medals
  cue("그날 자전거를"), // 19 back to the cyclists
  VOICE_END + 4, // 20 end card
  GHOST_ARMY_KO_DURATION,
];
type ShotProps = { start: number };
const at = (start: number, phrase: string) => cue(phrase, start) - start;

// ---------------------------------------------------------------------------
// Cast
// ---------------------------------------------------------------------------
/** Shilstone's mark for the whole film: a pencil tucked beside his drop-shaped head (he was a painter). */
const Pencil = (
  <g transform="translate(70,-40) rotate(35)">
    <rect x={-11} y={-70} width={22} height={110} fill={M.cream} stroke={M.ink} strokeWidth={5} />
    <path d="M-11,40 L11,40 L0,66 Z" fill={M.cream} stroke={M.ink} strokeWidth={5} />
    <path d="M-4,56 L4,56 L0,66 Z" fill={M.ink} />
    <rect x={-11} y={-84} width={22} height={16} fill={M.pink} stroke={M.ink} strokeWidth={5} />
  </g>
);
const Beret = <ellipse cx={-48} cy={-62} rx={58} ry={22} transform="rotate(-24 -48 -62)" fill={M.ink} />;
const Headphones = (
  <g>
    <path d="M-92,0 A92,92 0 0 1 -40,-78 M40,-78 A92,92 0 0 1 92,0" fill="none" stroke={M.ink} strokeWidth={12} />
    <rect x={-112} y={-20} width={30} height={55} rx={12} fill={M.pink} stroke={M.ink} strokeWidth={5} />
    <rect x={82} y={-20} width={30} height={55} rx={12} fill={M.pink} stroke={M.ink} strokeWidth={5} />
  </g>
);
const GreyHair = (
  <g>
    <path d="M-80,-30 Q-86,-70 -46,-80 M46,-80 Q86,-70 80,-30" fill="none" stroke={M.grey} strokeWidth={22} strokeLinecap="round" />
    <path d="M-86,-10 Q-100,14 -88,34 M86,-10 Q100,14 88,34" fill="none" stroke={M.grey} strokeWidth={14} strokeLinecap="round" />
  </g>
);

const SHIL: Pose & { skin: Skin } = { ...INK_MAIN, skin: skin(M.pink), hat: Pencil, chest: US_PATCH };
const GI: Pose & { skin: Skin } = { ...INK_SIDE, skin: skin(M.cream), chest: US_PATCH };
const VILLAGER: Pose & { skin: Skin } = { ...INK_SIDE, skin: skin(M.lilac), hat: Beret };
const GERMAN: Pose & { skin: Skin } = { ...INK_SIDE, skin: skin(M.lilac), chest: GERMAN_PATCH };
const VET: Pose & { skin: Skin } = { ...INK_SIDE, skin: skin(M.cream), hat: GreyHair, chest: US_PATCH };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
/** An inflatable decoy tank. `inflate` 0 = flat, 1 = full; `poke` dents it. Origin = bottom centre. */
const Tank: React.FC<{ x: number; y: number; s?: number; inflate?: number; poke?: number }> = ({ x, y, s = 1, inflate = 1, poke = 0 }) => {
  const sy = 0.12 + 0.88 * inflate;
  const sx = 1 + (1 - inflate) * 0.25 - poke * 0.08;
  return (
    <g transform={`translate(${x},${y}) scale(${s * sx},${s * sy})`}>
      <rect x={-170} y={-70} width={340} height={70} rx={35} fill={M.ink} />
      {[-120, -60, 0, 60, 120].map((wx) => (
        <circle key={wx} cx={wx} cy={-35} r={22} fill={M.lilac} stroke={M.ink} strokeWidth={5} />
      ))}
      <path d="M-185,-70 L-150,-150 L150,-150 L185,-70 Z" fill={M.cream} {...STROKE} />
      <rect x={-75} y={-215} width={150} height={70} rx={30} fill={M.cream} {...STROKE} />
      <rect x={70} y={-196} width={170} height={24} rx={10} fill={M.cream} {...STROKE} />
      {/* the valve: the giveaway that it's a balloon */}
      <circle cx={-40} cy={-222} r={11} fill={M.pink} stroke={M.ink} strokeWidth={4} />
      <path d="M0,-130 l9,18 20,3 -15,14 4,20 -18,-10 -18,10 4,-20 -15,-14 20,-3 Z" fill={M.ink} transform="translate(-60,8)" />
    </g>
  );
};

const Truck: React.FC<{ x: number; y: number; s?: number; speaker?: boolean }> = ({ x, y, s = 1, speaker }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-170} y={-200} width={240} height={150} rx={10} fill={M.lilac} {...STROKE} />
    <path d="M70,-150 L150,-150 L185,-95 L185,-50 L70,-50 Z" fill={M.cream} {...STROKE} />
    <rect x={95} y={-138} width={50} height={40} rx={6} fill={M.night} stroke={M.ink} strokeWidth={4} />
    {[-110, 120].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-40} r={38} fill={M.ink} />
        <circle cx={wx} cy={-40} r={14} fill={M.cream} />
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

/** A bicycle seen side-on, origin = ground under its centre. */
const Bike: React.FC<{ x: number; y: number; s?: number; spin?: number; rot?: number }> = ({ x, y, s = 1, spin = 0, rot = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${rot})`}>
    {[-110, 110].map((wx) => (
      <g key={wx} transform={`translate(${wx},-70)`}>
        <circle r={66} fill="none" stroke={M.ink} strokeWidth={10} />
        {[0, 60, 120].map((a) => (
          <line key={a} x1={-60} y1={0} x2={60} y2={0} stroke={M.ink} strokeWidth={3} transform={`rotate(${a + spin})`} />
        ))}
        <circle r={9} fill={M.ink} />
      </g>
    ))}
    <path d="M-110,-70 L-20,-70 L60,-160 L-60,-160 Z M-20,-70 L-60,-175 M60,-160 L110,-70 M60,-160 L74,-205" fill="none" stroke={M.pink} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
    <rect x={-92} y={-188} width={64} height={16} rx={8} fill={M.ink} />
    <path d="M50,-210 L100,-212" stroke={M.ink} strokeWidth={12} strokeLinecap="round" />
  </g>
);

/** A villager riding (or stopped on) a bike, facing right. */
const Rider: React.FC<{ x: number; y: number; s?: number; spin?: number; pose?: Pose; seed?: number; scarf?: boolean }> = ({ x, y, s = 1, spin = 0, pose = {}, seed = 0, scarf }) => (
  <g>
    <Character
      x={x - 14 * s}
      y={y - 40 * s}
      scale={s * 0.9}
      {...VILLAGER}
      kneel={0.45}
      hands={{ l: [80, -230], r: [95, -235] }}
      look={14}
      seed={seed}
      chest={scarf ? <path d="M-40,8 Q0,30 40,8 L46,60 L30,62 L26,24" fill={M.pink} stroke={M.ink} strokeWidth={4} /> : undefined}
      {...pose}
    />
    <Bike x={x} y={y} s={s} spin={spin} />
  </g>
);

/** Hedgerow bushes along a Normandy lane, scrolling with `scroll`. */
const Hedges: React.FC<{ scroll: number; y?: number }> = ({ scroll, y = GROUND }) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const x = ((i * 260 - scroll) % 2340 + 2340) % 2340 - 300;
      return (
        <g key={i} transform={`translate(${x},${y})`}>
          <path d="M-130,0 Q-150,-120 -60,-140 Q-20,-210 50,-160 Q140,-170 130,0 Z" fill={M.lilac} {...STROKE} />
        </g>
      );
    })}
  </g>
);

/** Four soldiers holding a tank overhead. `up` 0 = tank on the ground, 1 = overhead. */
const TankLift: React.FC<{ x: number; y: number; s?: number; up: number; strain?: number; walk?: number }> = ({ x, y, s = 1, up, strain = 0, walk = 0 }) => {
  const f = useCurrentFrame();
  const xs = [-195, -65, 65, 195];
  const handY = lerp(-190, -430, up);
  return (
    <g>
      {xs.map((dx, i) => (
        <Character
          key={i}
          x={x + dx * s}
          y={y}
          scale={0.62 * s}
          {...GI}
          seed={i + 2}
          walk={walk}
          walkPhase={f * 0.4 + i * 1.3}
          hands={{ l: [-48, handY], r: [48, handY] }}
          eyes={strain > 0.5 ? "squint" : "dot"}
          mouthShape={strain > 0.5 ? "teeth" : "line"}
          mouth={0.6}
          sweat={strain}
          shake={strain * 2}
          squash={1 - 0.05 * strain}
        />
      ))}
      <Tank x={x} y={y + (handY - 18) * 0.62 * s} s={0.95 * s} />
    </g>
  );
};

/** A paper map of northern France: coastline, Normandy and the Rhine. */
const MapSheet: React.FC<{ rhine?: boolean }> = ({ rhine = true }) => (
  <g>
    <g transform="translate(540,880) rotate(-1.5)">
      <Paper w={820} h={1020} />
    </g>
    {/* channel coast with the Cotentin peninsula */}
    <path d="M150,640 C230,660 250,600 300,610 L310,520 C340,510 350,600 380,640 C450,690 560,640 640,560 C700,500 760,460 860,420" fill="none" stroke={M.ink} strokeWidth={8} strokeLinecap="round" />
    <path d="M150,640 C230,660 250,600 300,610 L310,520 C340,510 350,600 380,640 C450,690 560,640 640,560 C700,500 760,460 860,420 L860,380 L150,380 Z" fill={M.lilac} opacity={0.55} />
    <text x={330} y={460} fontFamily={FONT} fontSize={40} fill={M.ink} opacity={0.6}>영국 해협</text>
    <text x={420} y={1020} fontFamily={FONT} fontSize={56} fill={M.ink} opacity={0.35}>프랑스</text>
    {rhine && <path d="M860,470 C800,600 900,720 820,860 C760,980 880,1110 820,1300" fill="none" stroke={M.lilac} strokeWidth={30} strokeLinecap="round" />}
    {rhine && <text x={660} y={760} fontFamily={FONT} fontSize={40} fill={M.ink}>라인강</text>}
  </g>
);

const Pin: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0,0 C-40,-60 -46,-90 -46,-110 A46,46 0 1 1 46,-110 C46,-90 40,-60 0,0 Z" fill={M.pink} {...STROKE} />
    <circle cx={0} cy={-110} r={16} fill={M.cream} stroke={M.ink} strokeWidth={5} />
  </g>
);

/** A big counter number that springs in, for tallies (600 decoys). */
const BigNum: React.FC<{ text: string; x: number; y: number; at0: number; size?: number }> = ({ text, x, y, at0, size = 150 }) => {
  const { f, pop } = useLocal();
  if (f < at0) return null;
  const s = pop(at0, 8);
  return (
    <div style={{ position: "absolute", left: x - 300, top: y - size / 2, width: 600, textAlign: "center", fontFamily: FONT, fontSize: size, color: M.pink, WebkitTextStroke: `14px ${M.ink}`, paintOrder: "stroke fill", transform: `scale(${s}) rotate(${(1 - s) * -10}deg)` }}>
      {text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Shots
// ---------------------------------------------------------------------------
// 1. "군인 네 명이" Tight on four soldiers straining under something heavy.
const Shot1: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const push = 1.75 + 0.35 * clamp01(f / 27);
  return (
    <Stage moon={false} spots={false} cam={{ s: push, x: 540, y: GROUND - 300 }}>
      <LightRings x={540} y={GROUND - 300} radii={[520, 380, 260]} colors={WARM} />
      <TankLift x={540} y={GROUND} up={0.15} strain={1} />
    </Stage>
  );
};

// 2. "탱크를 번쩍" Cut wide: the tank shoots up overhead. Speed lines and a flash.
const Shot2: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const up = Math.min(1.08, pop(2, 7));
  const push = 1.05 + 0.2 * clamp01(f / 24);
  return (
    <AbsoluteFill>
      <Stage moon={false} cam={{ s: push, x: 540, y: GROUND - 330 }}>
        <LightRings x={540} y={GROUND - 420} radii={[560, 420, 300, 190]} colors={WARM} dots={{ r: 330, color: M.pink }} />
        <TankLift x={540} y={GROUND} up={up} strain={0.2} />
      </Stage>
      <SpeedLines at={2} dir={1} />
      <Flash at={4} />
    </AbsoluteFill>
  );
};

// 3. "들어 옮긴다면, 믿으시겠습니까?" A villager's jaw drops. The mascot gasps in the corner.
const Shot3: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const push = 1.7 + 0.3 * clamp01(f / 60);
  const p = pop(0, 10);
  return (
    <AbsoluteFill>
      <Stage moon={false} spots={false} cam={{ s: push, x: 470, y: GROUND - 330 }}>
        <LightRings x={470} y={GROUND - 330} radii={[460, 330, 220]} colors={WARM} />
        <Rider x={430} y={GROUND} {...{ pose: { ...EMOTE.shock, hands: { l: [80, -230], r: [95, -235] }, lean: -14, browRaise: 1 } }} />
      </Stage>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <g style={{ filter: OFFSET }}>
          <circle cx={840} cy={520} r={110 * p} fill={M.night} stroke={M.ink} strokeWidth={6} />
          <g transform={`scale(${p})`} style={{ transformOrigin: "840px 520px" }}>
            <InkDrop x={840} y={590} s={0.85} mood="shock" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 4. "천구백사십사년 여름 프랑스 노르망디," Map with a red pin on Normandy.
const Shot4: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const push = 1 + 0.12 * clamp01(f / 70);
  return (
    <AbsoluteFill>
      <Stage floor={false} moon={false} cam={{ s: push, x: 420, y: 720 }}>
        <MapSheet rhine={false} />
        <Pin x={350} y={650} s={pop(8)} />
        <text x={250} y={750} fontFamily={FONT} fontSize={46} fill={M.ink} opacity={clamp01((f - 12) / 6)}>노르망디</text>
      </Stage>
      <Label text="노르망디 · 1944년 여름" x={LABEL_X} y={LABEL_Y} from={4} to={9999} />
    </AbsoluteFill>
  );
};

// 5. "자전거를 타던 마을 사람 둘이 미군 진지에서 그 장면을 보고 말았습니다." The lane scrolls, they brake and stare.
const Shot5: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tStop = at(start, "미군 진지에서");
  const tSee = at(start, "그 장면을");
  const v = f < tStop ? 1 : Math.max(0, 1 - (f - tStop) / 10);
  const travelled = f < tStop ? f * 14 : tStop * 14 + 14 * (1 - Math.max(0, 1 - (f - tStop) / 10) ** 2) * 5;
  const shock = f >= tSee;
  const riderPose = shock ? { eyes: "wide" as const, mouthShape: "o" as const, browRaise: 1, fx: "shock" as const, lean: -10 } : { mouth: 0.6, walk: 0 };
  const liftX = lerp(1300, 820, clamp01((f - tStop + 10) / 40));
  return (
    <Stage moon={false} cam={{ s: 0.95, x: 540, y: GROUND - 260 }}>
      <LightRings x={760} y={560} radii={[260, 190, 120]} colors={WARM} />
      <circle cx={760} cy={560} r={70} fill={M.cream} stroke={M.ink} strokeWidth={6} />
      <Hedges scroll={travelled * 0.5} y={GROUND - 180} />
      <TankLift x={liftX} y={GROUND - 40} s={0.7} up={1} walk={1} />
      <Rider x={140} y={GROUND + 60} s={0.8} spin={f * 22 * v} seed={1} pose={{ ...riderPose, look: shock ? 22 : 12 }} scarf />
      <Rider x={480} y={GROUND + 60} s={0.8} spin={f * 22 * v + 40} seed={4} pose={{ ...riderPose, headTilt: shock ? -6 : 0 }} />
      {shock && (
        <text x={310} y={GROUND - 340} textAnchor="middle" fontFamily={FONT} fontSize={150} fill={M.pink} stroke={M.ink} strokeWidth={10} paintOrder="stroke" transform={`scale(${pop(tSee, 8)})`} style={{ transformOrigin: `330px ${GROUND - 390}px` }}>
          !!
        </text>
      )}
    </Stage>
  );
};

// 6. "보초를 서던 아서 실스톤 상병은 태연하게 말했죠." Shilstone strolls up, calm as anything.
const Shot6: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tCalm = at(start, "태연하게");
  const x = lerp(1250, 720, clamp01(f / 30));
  const walking = f < 30;
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 820, y: 460 }} cam={{ s: 1.05 + 0.06 * clamp01(f / 90), x: 540, y: GROUND - 300 }}>
        <Hedges scroll={0} y={GROUND - 160} />
        <Rider x={190} y={GROUND + 40} s={0.75} seed={1} pose={{ eyes: "wide", browRaise: 0.8, look: 20 }} scarf />
        <Rider x={400} y={GROUND + 40} s={0.75} seed={4} pose={{ eyes: "wide", browRaise: 0.8, look: 20 }} />
        <Character x={x} y={GROUND + 60} scale={0.95} {...SHIL} walk={walking ? 1 : 0} walkPhase={f * 0.45} look={-14} {...(f >= tCalm ? EMOTE.smug : { mouth: 0.4 })} />
      </Stage>
      <Label text="아서 실스톤 상병" x={LABEL_X} y={LABEL_Y} from={at(start, "아서") + 2} to={9999} />
    </AbsoluteFill>
  );
};

// 7. "미군은 힘이 아주 세거든요." He flexes; the villagers nod slowly.
const Shot7: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const flex = pop(2, 9);
  const nod = Math.sin(f * 0.25) * 8 * clamp01((f - 10) / 6);
  return (
    <Stage moon={false} cam={{ s: 1.25 + 0.08 * clamp01(f / 50), x: 600, y: GROUND - 300 }}>
      <LightRings x={760} y={GROUND - 360} radii={[420, 300, 190]} colors={WARM} dots={{ r: 300, color: M.pink }} />
      <Rider x={300} y={GROUND + 40} s={0.75} seed={1} pose={{ eyes: "dot", headTilt: nod, look: 20, mouth: -0.2 }} scarf />
      <Rider x={480} y={GROUND + 40} s={0.75} seed={4} pose={{ eyes: "dot", headTilt: -nod, look: 20, mouth: -0.2 }} />
      <Character
        x={780}
        y={GROUND + 60}
        scale={0.95}
        {...SHIL}
        eyes="closed"
        mouth={0.9}
        brow={-0.3}
        headTilt={-6}
        fists
        fx="sparkle"
        hands={{ l: [lerp(-60, -150, flex), lerp(-200, -360, flex)], r: [lerp(60, 150, flex), lerp(-200, -360, flex)] }}
        squash={1 + 0.04 * flex}
      />
    </Stage>
  );
};

// 8. "사실 그 탱크는 고무풍선이었습니다." Hard cut: a finger pokes the tank and it squishes like a balloon.
const Shot8: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tBalloon = at(start, "고무풍선이었습니다");
  const reach = clamp01((f - 6) / 10);
  const k = f - tBalloon + 2;
  const dent = k >= 0 ? Math.max(0, Math.sin(k * 0.6) * Math.exp(-k / 12)) : 0;
  return (
    <AbsoluteFill>
      <Stage moon={false} spots={false} cam={{ s: 1.7, x: 600, y: 1020 }}>
        <LightRings x={600} y={950} radii={[420, 300, 190]} colors={WARM} />
        <Tank x={640} y={GROUND} s={1} poke={dent * 3} />
        <path d={`M-40,960 Q200,${940 - reach * 10} ${lerp(120, 410 + dent * 30, reach)},960`} stroke={M.pink} strokeWidth={36} strokeLinecap="round" fill="none" />
      </Stage>
      <Flash at={tBalloon} />
      <Label text="고무풍선" x={LABEL_X} y={LABEL_Y} from={tBalloon + 4} to={9999} size={60} />
    </AbsoluteFill>
  );
};

// 9. "실스톤의 부대는 화가와 디자이너, 음향 기술자 천백 명이 모인" Pull out to a crowd of artists.
const Shot9: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const t = clamp01(f / 50) ** 0.7;
  const pull = lerp(1.9, 1, t);
  const tNum = at(start, "천백");
  const hats = [Beret, Headphones, undefined, Headphones, Beret, undefined];
  const rows = [
    { y: GROUND - 180, s: 0.5, xs: [150, 340, 530, 720, 910] },
    { y: GROUND + 60, s: 0.6, xs: [100, 320, 760, 980] },
    { y: GROUND + 330, s: 0.72, xs: [210, 870] },
  ];
  const palette = (
    <g transform="translate(0,-20)">
      <ellipse rx={70} ry={48} fill={M.cream} {...STROKE} />
      {[[-30, -10], [0, -22], [30, -6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={i === 1 ? M.pink : M.ink} />)}
    </g>
  );
  return (
    <AbsoluteFill>
      <Stage cam={{ s: pull, x: 540, y: lerp(GROUND + 40, SH / 2, t) }}>
        {rows.map((r, ri) =>
          r.xs.map((x, i) => {
            const k = ri * 5 + i;
            return <Character key={k} x={x} y={r.y} scale={r.s} {...INK_SIDE} skin={skin(k % 3 === 1 ? M.lilac : M.cream)} hat={hats[k % 6]} mouth={0.5} brow={0.2} seed={k} look={(k % 3) * 8 - 8} handsY={k % 4 === 0 ? 220 : "hang"} held={k % 4 === 0 ? palette : undefined} />;
          }),
        )}
        <Character x={540} y={GROUND + 60} scale={0.66} {...SHIL} {...EMOTE.proud} />
      </Stage>
      <Label text="약 1,100명" x={LABEL_X} y={LABEL_Y} from={tNum} to={9999} />
    </AbsoluteFill>
  );
};

// 10. "비밀 부대, '유령 부대'였습니다." A stamp slams onto the file.
const Shot10: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tGhost = at(start, "'유령");
  const stamp = pop(tGhost, 8);
  const press = f < tGhost ? lerp(-260, 0, clamp01(f / Math.max(1, tGhost))) : 0;
  return (
    <AbsoluteFill>
      <Stage floor={false} moon={false} cam={{ s: 1 + 0.08 * clamp01(f / 50), x: 540, y: 900 }}>
        <LightRings x={540} y={900} radii={[520, 380, 250]} colors={WARM} />
        <g transform="translate(540,920) rotate(2)">
          <Paper w={700} h={900}>
            <text x={0} y={-330} textAnchor="middle" fontFamily={FONT} fontSize={54} fill={M.ink}>제23 본부 특수부대</text>
            {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={-260} y1={-220 + i * 70} x2={i % 2 ? 160 : 260} y2={-220 + i * 70} stroke={M.lilac} strokeWidth={14} strokeLinecap="round" />)}
          </Paper>
        </g>
        <g transform={`translate(540,${1000 + press}) rotate(-12) scale(${f >= tGhost ? 1.4 - 0.4 * stamp : 1.3})`} opacity={f >= tGhost - 1 ? 1 : 0}>
          <rect x={-240} y={-80} width={480} height={160} fill="none" stroke={M.pink} strokeWidth={14} />
          <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontSize={110} fill={M.pink}>극비</text>
        </g>
      </Stage>
      <Label text="유령 부대" x={LABEL_X} y={LABEL_Y} from={tGhost + 2} to={9999} size={64} />
    </AbsoluteFill>
  );
};

// 11. Montage: "고무 탱크에 바람을 넣고," / "스피커로 엔진 소리를 틀고," / "가짜 무전까지 주고받았죠."
const Shot11: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tSpk = at(start, "스피커로");
  const tRadio = at(start, "가짜 무전까지");
  if (f < tSpk) {
    const inflate = clamp01(f / Math.max(10, tSpk - 4));
    return (
      <Stage cam={{ s: 1.1 + 0.08 * clamp01(f / tSpk), x: 540, y: GROUND - 200 }}>
        <rect x={110} y={GROUND - 160} width={180} height={160} rx={16} fill={M.lilac} {...STROKE} />
        <circle cx={200} cy={GROUND - 100} r={36} fill={M.cream} stroke={M.ink} strokeWidth={5} />
        <line x1={200} y1={GROUND - 100} x2={200 + Math.cos(f) * 28} y2={GROUND - 100 + Math.sin(f) * 28} stroke={M.ink} strokeWidth={6} />
        <path d={`M290,${GROUND - 60} C420,${GROUND - 20} 450,${GROUND - 240} 560,${GROUND - 200}`} fill="none" stroke={M.ink} strokeWidth={14} />
        <Tank x={730} y={GROUND} s={0.9} inflate={inflate} />
      </Stage>
    );
  }
  if (f < tRadio) {
    const lf = f - tSpk;
    return (
      <AbsoluteFill>
        <Stage cam={{ s: 1.1 + 0.08 * clamp01(lf / 30), x: 540, y: 920 }}>
          {[0, 1, 2, 3].map((i) => {
            const t = (lf / 22 + i * 0.25) % 1;
            return <circle key={i} cx={490} cy={GROUND - 340} r={60 + t * 380} fill="none" stroke={M.pink} strokeWidth={14 * (1 - t)} opacity={1 - t} />;
          })}
          <Truck x={540} y={GROUND} s={1.2} speaker />
        </Stage>
        <Label text="녹음된 엔진 소리" x={LABEL_X} y={LABEL_Y} from={tSpk + 3} to={tRadio} />
      </AbsoluteFill>
    );
  }
  const lf = f - tRadio;
  return (
    <Stage cam={{ s: 1.25 + 0.08 * clamp01(lf / 30), x: 560, y: 900 }}>
      <rect x={160} y={GROUND - 260} width={260} height={180} rx={16} fill={M.lilac} {...STROKE} />
      <rect x={160} y={GROUND - 80} width={260} height={80} fill={M.ink} />
      {[220, 290, 360].map((dx, i) => (
        <circle key={dx} cx={dx} cy={GROUND - 190} r={24} fill={M.cream} stroke={M.ink} strokeWidth={5} transform={`rotate(${lf * 6 * (i + 1)} ${dx} ${GROUND - 190})`} />
      ))}
      <line x1={380} y1={GROUND - 260} x2={420} y2={GROUND - 420} stroke={M.ink} strokeWidth={8} />
      {[0, 1, 2].map((i) => {
        const t = (lf / 18 + i / 3) % 1;
        return <path key={i} d={`M${430 + t * 60},${GROUND - 430 - t * 160} l25,-25 25,25 25,-25 25,25`} fill="none" stroke={M.pink} strokeWidth={10} opacity={1 - t} />;
      })}
      <Character
        x={730}
        y={GROUND}
        scale={0.95}
        {...GI}
        hat={Headphones}
        handsY={230}
        look={-12}
        mouthShape="open"
        mouthOpen={0.3 + 0.3 * Math.abs(Math.sin(lf * 0.8))}
        held={
          <g transform="translate(0,-40)">
            <Paper w={150} h={190}>
              {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-50} y1={-60 + i * 30} x2={50} y2={-60 + i * 30} stroke={M.ink} strokeWidth={5} />)}
            </Paper>
          </g>
        }
      />
    </Stage>
  );
};

// 12. "가장 큰 승부는 천구백사십오년 삼월, 라인강이었습니다." A red route crawls to the Rhine.
const Shot12: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const tRhine = at(start, "라인강이었습니다");
  const route = "M350,650 C420,760 520,820 600,840 C700,860 760,900 800,960";
  const drawn = clamp01(f / Math.max(20, tRhine));
  return (
    <AbsoluteFill>
      <Stage floor={false} moon={false} cam={{ s: 1 + 0.1 * clamp01(f / 70), x: 580, y: 820 }}>
        <MapSheet />
        <path d={route} fill="none" stroke={M.lilac} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 26" />
        <path d={route} fill="none" stroke={M.pink} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
        <circle cx={350} cy={650} r={18} fill={M.pink} stroke={M.ink} strokeWidth={5} />
        {f >= tRhine && <Pin x={810} y={960} s={pop(tRhine)} />}
      </Stage>
      <Label text="라인강 · 1945년 3월" x={LABEL_X} y={LABEL_Y} from={at(start, "천구백사십오년") + 2} to={9999} />
    </AbsoluteFill>
  );
};

// 13. "고무 차량 육백 대가 미군 두 개 사단 행세를 하자" Night riverbank: decoys pop up row after row.
const Shot13: React.FC<ShotProps> = ({ start }) => {
  const { f, pop } = useLocal();
  const t600 = at(start, "육백");
  const tDiv = at(start, "두 개");
  const n = Math.min(600, Math.round(clamp01((f - 4) / Math.max(10, t600 + 8)) * 600));
  const rows = [
    { y: GROUND - 120, s: 0.32, xs: [120, 300, 480, 660, 840, 1000] },
    { y: GROUND + 40, s: 0.42, xs: [80, 330, 580, 830] },
    { y: GROUND + 240, s: 0.55, xs: [180, 520, 860] },
  ];
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 800, y: 470 }} cam={{ s: 1 + 0.08 * clamp01(f / 100), x: 540, y: 1000 }}>
        <rect x={-100} y={GROUND - 330} width={1300} height={60} fill={M.lilac} opacity={0.8} />
        {rows.map((r, ri) =>
          r.xs.map((x, i) => {
            const k = ri * 6 + i;
            const p = pop(2 + k * 2, 10);
            return (ri + i) % 3 === 1 ? (
              <g key={k} transform={`translate(0,0)`}>
                <Truck x={x} y={r.y} s={r.s * p} />
              </g>
            ) : (
              <Tank key={k} x={x} y={r.y} s={r.s} inflate={p} />
            );
          }),
        )}
      </Stage>
      <BigNum text={`${n}대`} x={540} y={560} at0={4} />
      <Label text="미군 2개 사단?" x={LABEL_X} y={LABEL_Y} from={tDiv} to={9999} />
    </AbsoluteFill>
  );
};

// 14. "독일군은 그쪽으로 방어를 옮겼고," Across the river, Germans haul sandbags toward the fakes.
const Shot14: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const run = f * 6;
  return (
    <AbsoluteFill>
      <Stage moon={{ x: 260, y: 470 }}>
        <path d={`M980,${GROUND - 40} L${300 + Math.sin(f / 12) * 200},500 L${470 + Math.sin(f / 12) * 200},500 Z`} fill={M.lilac} opacity={0.45} />
        <rect x={930} y={GROUND - 90} width={90} height={90} rx={10} fill={M.lilac} {...STROKE} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${-run},0)`}>
            <Character
              x={660 + i * 230}
              y={GROUND}
              scale={0.7}
              {...GERMAN}
              walk={1}
              walkPhase={f * 0.5 + i}
              brow={-0.6}
              eyes="glare"
              handsY={430}
              held={<rect x={-70} y={-40} width={140} height={60} rx={14} fill={M.cream} stroke={M.ink} strokeWidth={5} />}
              seed={i + 3}
            />
          </g>
        ))}
      </Stage>
      <SpeedLines at={0} />
    </AbsoluteFill>
  );
};

// 15. "그 사이 진짜 미군은 다른 곳에서 강을 건넜습니다." Real boats slip across in the dark.
const Shot15: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tCross = at(start, "강을");
  const boatX = (k: number) => lerp(-260, 1300, clamp01((f - k * 14) / 110));
  return (
    <AbsoluteFill>
      <Stage floor={false} moon={{ x: 820, y: 430 }} cam={{ s: 1, x: 540, y: 960 }}>
        <rect x={-100} y={GROUND - 200} width={1300} height={1200} fill={M.floor} {...STROKE} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${((i * 230 + f * 2) % 1300) - 150},${GROUND - 120 + i * 90} q30,-16 60,0 t60,0`} fill="none" stroke={M.lilac} strokeWidth={8} />
        ))}
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${boatX(k)},${GROUND + 40 + k * 260})`}>
            <path d="M-190,0 L190,0 L150,70 L-150,70 Z" fill={M.lilac} {...STROKE} />
            {[-100, 0, 100].map((x, i) => (
              <Character key={x} x={x} y={20} scale={0.36} {...GI} seed={i + 9 + k} brow={-0.5} hands={{ l: [-60, -160], r: [80, -110] }} />
            ))}
          </g>
        ))}
      </Stage>
      <Label text="진짜 미군" x={LABEL_X} y={LABEL_Y} from={tCross - 20} to={9999} />
    </AbsoluteFill>
  );
};

// 16. "하지만 이 일은 오십 년 넘게 비밀이었고," The file is locked away; the years spin to 1996.
const Shot16: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const { durationInFrames: d } = useVideoConfig();
  const slide = clamp01((f - 4) / 12);
  const closed = f >= 18 && f < d - 10;
  const opened = f >= d - 10;
  const year = f < 20 ? 1945 : Math.round(lerp(1945, 1996, clamp01((f - 20) / Math.max(1, d - 34))));
  return (
    <AbsoluteFill>
      <Stage floor={false} moon={false} cam={{ s: 1.05, x: 540, y: 960 }}>
        <LightRings x={540} y={880} radii={[500, 360, 230]} colors={WARM} />
        <rect x={220} y={760} width={640} height={620} rx={18} fill={M.lilac} {...STROKE} />
        <rect x={260} y={1080 + (opened ? 70 : 0)} width={560} height={260} rx={12} fill={M.cream} {...STROKE} />
        <rect x={480} y={1180 + (opened ? 70 : 0)} width={120} height={30} rx={10} fill={M.ink} />
        {closed && (
          <g>
            <rect x={730} y={1180} width={64} height={54} rx={8} fill={M.pink} {...STROKE} />
            <path d="M742,1180 L742,1156 A20,20 0 0 1 782,1156 L782,1180" fill="none" stroke={M.ink} strokeWidth={8} />
          </g>
        )}
        {!closed && (
          <g transform={`translate(540,${opened ? 900 - pop(d - 10) * 120 : lerp(520, 1130, slide)}) rotate(${opened ? -4 : 0})`}>
            <rect x={-200} y={-140} width={400} height={280} rx={10} fill={M.cream} {...STROKE} />
            <g transform="rotate(-12)">
              <rect x={-150} y={-55} width={300} height={110} fill="none" stroke={opened ? M.ink : M.pink} strokeWidth={10} />
              <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={80} fill={opened ? M.ink : M.pink}>
                {opened ? "공개" : "극비"}
              </text>
            </g>
          </g>
        )}
      </Stage>
      <Label text={`${year}년`} x={LABEL_X} y={560} from={18} to={9999} size={100} color={year === 1996 ? M.pink : M.cream} />
    </AbsoluteFill>
  );
};

// 17. "노병들은 이천이십사년에야" The real photo from the ceremony, as a clipping.
const PHOTO = { src: "photos/dvids-8301726-medal.jpg", focusX: 0.6, focusY: 0.5, credit: "U.S. ARMY PHOTO: HENRY VILLARAMA (DVIDS)" };
const Shot17: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const { durationInFrames } = useVideoConfig();
  const enter = pop(0, 11);
  const zoom = 1 + 0.15 * clamp01(f / durationInFrames);
  const boxW = 860;
  const boxH = 900;
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={760} radii={[620, 480, 340]} colors={WARM} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: (SW - boxW) / 2 - 30,
          top: 290,
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
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${PHOTO.focusX * 100}% ${PHOTO.focusY * 100}%`, transform: `scale(${zoom})`, transformOrigin: `${PHOTO.focusX * 100}% ${PHOTO.focusY * 100}%`, filter: "saturate(0.8) contrast(1.05)" }}
        />
      </div>
      <Label text="실제 사진 · 2024년 3월 21일" x={LABEL_X} y={225} from={3} to={9999} size={42} />
      <div style={{ position: "absolute", top: 290 + boxH + 34, left: SAFE.left, width: SW - SAFE.left - SAFE.right, textAlign: "center", fontFamily: FONT, fontSize: 26, color: M.ink, opacity: clamp01((f - 6) / 8) }}>
        {PHOTO.credit}
      </div>
    </AbsoluteFill>
  );
};

// 18. "의회 금메달을 받았습니다." Drawn veterans, grey-haired now, get their medals.
const Shot18: React.FC<ShotProps> = () => {
  const { f, pop } = useLocal();
  const drop = pop(4, 8);
  const medal = (
    <g transform={`translate(0,${-200 + drop * 240}) scale(${0.6 + 0.4 * drop})`}>
      <path d="M-30,0 L-14,60 L14,60 L30,0 Z" fill={M.pink} stroke={M.ink} strokeWidth={4} />
      <circle cx={0} cy={86} r={34} fill="#F7DA87" stroke={M.ink} strokeWidth={5} />
    </g>
  );
  return (
    <Stage moon={false} cam={{ s: 1.05 + 0.1 * clamp01(f / 40), x: 540, y: GROUND - 300 }}>
      <LightRings x={540} y={GROUND - 420} radii={[560, 430, 310, 200]} colors={GOLD} dots={{ r: 380, color: M.pink }} />
      {[260, 540, 820].map((x, i) => (
        <Character key={x} x={x} y={GROUND} scale={0.85} {...VET} seed={i + 20} {...(i === 1 ? EMOTE.joy : { mouth: 0.8, eyes: "happy" as const })} chest={<g>{US_PATCH}{medal}</g>} />
      ))}
    </Stage>
  );
};

// 19. "그날 자전거를 타던 두 사람은, 정말 미군이 탱크를 들 만큼 힘이 세다고 믿었을까요?"
// Back on the lane: one tries to lift his own bike and wobbles; behind them a decoy sighs flat.
const Shot19: React.FC<ShotProps> = ({ start }) => {
  const { f } = useLocal();
  const tLift = at(start, "탱크를");
  const tFlat = at(start, "믿었을까요");
  const lift = clamp01((f - tLift) / 12);
  const wob = Math.sin(f * 0.7) * 10 * lift;
  const flat = 1 - clamp01((f - tFlat) / 30);
  return (
    <Stage moon={{ x: 820, y: 460 }} cam={{ s: 1 + 0.15 * clamp01(f / 150), x: 540, y: GROUND - 260 }}>
      <Hedges scroll={0} y={GROUND - 200} />
      <Tank x={820} y={GROUND - 120} s={0.6} inflate={flat} />
      <Character x={250} y={GROUND + 60} scale={0.8} {...VILLAGER} headTilt={-12} mouth={-0.3} brow={0.8} look={20} chest={<path d="M-40,8 Q0,30 40,8 L46,60 L30,62 L26,24" fill={M.pink} stroke={M.ink} strokeWidth={4} />} />
      <Bike x={170} y={GROUND + 60} s={0.6} />
      <Character
        x={540}
        y={GROUND + 60}
        scale={0.8}
        {...VILLAGER}
        seed={4}
        eyes={lift > 0.5 ? "squint" : "dot"}
        mouthShape={lift > 0.5 ? "teeth" : "line"}
        sweat={lift}
        shake={lift * 2}
        lean={wob * 0.4}
        hands={{ l: [-60, lerp(-150, -470, lift)], r: [60, lerp(-150, -470, lift)] }}
      />
      <Bike x={540 + wob} y={GROUND + 60 - lift * 300} s={0.6} rot={wob} />
    </Stage>
  );
};

// 20. End card: "유령 부대." with the red underline drawing in; flows back into shot 1.
const Shot20: React.FC<ShotProps> = () => {
  const { f } = useLocal();
  const text = "유령 부대.";
  const typed = Math.min(text.length, Math.floor(f / 3) + 1);
  const under = clamp01((f - text.length * 3) / 10);
  return (
    <AbsoluteFill style={{ background: M.night }}>
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <LightRings x={540} y={860} radii={[520, 400, 290, 190]} colors={WARM} dots={{ r: 300, color: M.pink }} />
        <g style={{ filter: OFFSET }}>
          <Tank x={540} y={700} s={0.7} inflate={0.7 + 0.3 * Math.abs(Math.sin(f / 10))} />
        </g>
      </svg>
      <div style={{ position: "absolute", top: 780, width: SW, textAlign: "center", fontFamily: FONT, fontSize: 170, lineHeight: 1.05, color: M.cream, WebkitTextStroke: `16px ${M.ink}`, paintOrder: "stroke fill" }}>
        {text.slice(0, typed)}
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
        <InkDrop x={540} y={1360} s={1.1} mood="cheer" />
      </svg>
    </AbsoluteFill>
  );
};

const SHOTS = [Shot1, Shot2, Shot3, Shot4, Shot5, Shot6, Shot7, Shot8, Shot9, Shot10, Shot11, Shot12, Shot13, Shot14, Shot15, Shot16, Shot17, Shot18, Shot19, Shot20];

// ---------------------------------------------------------------------------
// Year counter, top left: 1944 → 1945 → (spins) 1996 → 2024.
// ---------------------------------------------------------------------------
const YearCounter: React.FC = () => {
  const f = useCurrentFrame();
  // hidden in the intro, while the big year label spins (16), over the photo (17) and on the end card
  if (f < CUTS[3] || f >= CUTS[19] || (f >= CUTS[15] && f < CUTS[17])) return null;
  let year = 1944;
  if (f >= cue("천구백사십오년")) year = 1945;
  if (f >= CUTS[17]) year = 2024;
  const changes = [CUTS[3], cue("천구백사십오년"), CUTS[17]];
  const last = Math.max(...changes.filter((c) => c <= f));
  const k = clamp01((f - last) / 8);
  const s = 1 + 0.25 * (1 - k) * Math.sin(k * Math.PI);
  return (
    <div style={{ position: "absolute", left: SAFE.left, top: 212, fontFamily: FONT, fontSize: 46, color: M.ink, background: M.cream, border: `5px solid ${M.ink}`, boxShadow: `6px 6px 0 ${M.shadow}`, padding: "2px 14px", transform: `scale(${s})`, transformOrigin: "left center" }}>
      {year}년
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
const SoundTrack: React.FC = () => {
  const C = CUTS;
  return (
    <>
      <Audio src={staticFile("voice/ghost-army-ko.mp3")} volume={0.9} />
      <Audio src={staticFile("sfx/roomtone.wav")} volume={0.1} loop />
      {/* intro: three cuts */}
      <Sfx name="whoosh" at={0} vol={0.25} />
      <Sfx name="whoosh" at={C[1]} vol={0.35} />
      <Sfx name="impact" at={C[1] + 4} vol={0.3} />
      <Sfx name="creak" at={C[2]} vol={0.3} len={30} />
      <Sfx name="pop" at={C[2] + 2} vol={0.3} len={10} />
      {/* Normandy */}
      <Sfx name="scribble" at={C[3] + 2} vol={0.25} />
      <Sfx name="pop" at={C[3] + 8} vol={0.3} len={10} />
      {Array.from({ length: 10 }, (_, i) => <Sfx key={`ch${i}`} name="click" at={C[4] + i * 6} vol={0.12} len={6} rate={1.4} />)}
      <Sfx name="creak" at={cue("미군 진지에서")} vol={0.35} len={30} />
      <Sfx name="impact" at={cue("그 장면을")} vol={0.25} />
      {Array.from({ length: 4 }, (_, i) => <Sfx key={`st${i}`} name="step" at={C[5] + i * 8} vol={0.3} len={8} />)}
      <Sfx name="shimmer" at={C[6] + 6} vol={0.25} />
      {/* it's a balloon */}
      <Sfx name="boing" at={cue("고무풍선이었습니다") - 2} vol={0.3} len={30} />
      <Sfx name="impact" at={cue("고무풍선이었습니다")} vol={0.15} />
      <Sfx name="whoosh" at={C[8]} vol={0.3} />
      <Sfx name="stamp" at={cue("'유령")} vol={0.5} len={20} />
      {/* montage */}
      <Sfx name="pump" at={C[10]} vol={0.35} len={cue("스피커로") - C[10]} />
      <Sfx name="hiss" at={C[10] + 4} vol={0.15} />
      <Sfx name="engine" at={cue("스피커로")} vol={0.3} len={cue("가짜 무전까지") - cue("스피커로")} />
      <Sfx name="static" at={cue("가짜 무전까지")} vol={0.2} len={C[11] - cue("가짜 무전까지")} />
      {/* the Rhine */}
      <Sfx name="scribble" at={C[11] + 4} vol={0.25} />
      <Sfx name="pop" at={cue("라인강이었습니다")} vol={0.3} len={10} />
      {Array.from({ length: 12 }, (_, i) => <Sfx key={`d${i}`} name="puff" at={C[12] + 2 + i * 3} vol={0.18} len={10} />)}
      <Sfx name="rumble" at={cue("두 개")} vol={0.2} />
      <Sfx name="whoosh" at={C[13]} vol={0.35} />
      {Array.from({ length: 6 }, (_, i) => <Sfx key={`r${i}`} name="step" at={C[13] + 4 + i * 6} vol={0.25} len={8} />)}
      {Array.from({ length: 4 }, (_, i) => <Sfx key={`pd${i}`} name="paddle" at={C[14] + 6 + i * 22} vol={0.25} len={22} />)}
      {/* secret */}
      <Sfx name="slam" at={C[15] + 16} vol={0.45} />
      <Sfx name="tick" at={C[15] + 20} vol={0.2} len={C[16] - C[15] - 30} />
      <Sfx name="stamp" at={C[16] - 10} vol={0.45} len={20} />
      {/* medal */}
      <Sfx name="shimmer" at={C[16] + 3} vol={0.25} />
      <Sfx name="applause" at={C[17]} vol={0.25} len={C[18] - C[17] + 10} />
      <Sfx name="shimmer" at={C[17] + 4} vol={0.3} />
      {/* back to the lane */}
      <Sfx name="cricket" at={C[18]} vol={0.2} len={60} />
      <Sfx name="hiss" at={cue("믿었을까요")} vol={0.3} len={40} rate={0.8} />
      {Array.from({ length: 6 }, (_, i) => <Sfx key={`t${i}`} name="type" at={C[19] + i * 3} vol={0.4} len={6} />)}
      <Sfx name="shimmer" at={C[19] + 20} vol={0.3} />
    </>
  );
};

export const GhostArmyKo: React.FC = () => (
  <UiContext.Provider value={MEMPHIS_UI}>
    <FontContext.Provider value={KO_FONT}>
      <AbsoluteFill style={{ background: M.night }}>
        {SHOTS.map((Shot, i) => (
          <Sequence key={i} from={CUTS[i]} durationInFrames={CUTS[i + 1] - CUTS[i]}>
            <Shot start={CUTS[i]} />
          </Sequence>
        ))}
        <YearCounter />
        <Captions words={WORDS} y={CAPTION_Y} maxWords={2} hideAfterMs={(VOICE_END / 30) * 1000 + 200} />
        <SoundTrack />
      </AbsoluteFill>
    </FontContext.Provider>
  </UiContext.Provider>
);
