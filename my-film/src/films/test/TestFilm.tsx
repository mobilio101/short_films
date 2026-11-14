import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { noise2D } from "@remotion/noise";
import { Background, Floor, Glow, Layer, Letterbox, WobblyShape, rect } from "../../components/Stage";
import { Character } from "../../components/Character";
import { DayCounter, Flash, Narrator, RepPop, ShadowLine, SpeedLines } from "../../components/Hud";
import { TitleCard } from "../../components/TitleCard";
import { C, FLOOR_Y, H, W, lerp, ramp } from "../../components/theme";

// ---- Timeline (frames @ 30 fps, 300 total = 10 s) ----
const LAMP_ON = 18;
const WALK = [28, 108] as const;
const CLOSEUP = [112, 130] as const; // hard cut to the dumbbell
const SHADOW_IN = 130;
const RESOLVE = 180; // brows snap to determined
const STEP_IN = [184, 196] as const; // steps up to the dumbbell
const PICKUP = [198, 208] as const;
const REPS = [216, 230, 244]; // peak frame of each rep; last one is the big hit
const TITLE = 256;

const LAMP_X = 1320;
const BULB_Y = 548;
const START_X = 150;
const STOP_X = 900;
const LIFT_X = 1042; // where he stands to lift
const DUMBBELL_X = 1060;
const SHADOW_X = 720;
const STRIDE = 170; // px travelled per full walk cycle

const heroX = (f: number) =>
  f < STEP_IN[0] ? lerp(START_X, STOP_X, ramp(f, WALK[0], WALK[1])) : lerp(STOP_X, LIFT_X, ramp(f, STEP_IN[0], STEP_IN[1]));

/** Frames on which a foot lands (every half walk cycle). */
const stepFrames = (() => {
  const out: number[] = [];
  let last = 0;
  for (let f = WALK[0]; f <= STEP_IN[1]; f++) {
    if (f > WALK[1] && f < STEP_IN[0]) continue;
    const half = Math.floor(((heroX(f) - START_X) / STRIDE) * 2);
    if (half > last) {
      out.push(f);
      last = half;
    }
  }
  return out;
})();

const Dumbbell: React.FC<{ seed: string }> = ({ seed }) => (
  <g>
    <WobblyShape seed={seed + "bar"} points={rect(-78, -6, 156, 12)} fill="#3A3A44" />
    <WobblyShape seed={seed + "pl"} points={rect(-82, -34, 26, 68)} fill="#24242C" />
    <WobblyShape seed={seed + "pr"} points={rect(56, -34, 26, 68)} fill="#24242C" />
  </g>
);

const Lamp: React.FC = () => (
  <g>
    <WobblyShape seed="lampbase" points={rect(LAMP_X - 55, FLOOR_Y - 14, 110, 14)} fill="#1E1E26" />
    <WobblyShape seed="lamppole" points={rect(LAMP_X - 5, BULB_Y + 10, 10, FLOOR_Y - BULB_Y - 24)} fill="#1E1E26" />
    <WobblyShape
      seed="lampshade"
      points={[
        [LAMP_X - 45, BULB_Y - 70],
        [LAMP_X + 45, BULB_Y - 70],
        [LAMP_X + 80, BULB_Y + 10],
        [LAMP_X - 80, BULB_Y + 10],
      ]}
      fill="#2A2420"
    />
  </g>
);

const Window: React.FC = () => (
  <g>
    <WobblyShape seed="win" points={rect(330, 250, 240, 290)} fill="#12141E" />
    <circle cx={500} cy={330} r={34} fill={C.moon} opacity={0.9} />
    <WobblyShape seed="winbar1" points={rect(447, 250, 6, 290)} fill="#0E0E14" />
    <WobblyShape seed="winbar2" points={rect(330, 392, 240, 6)} fill="#0E0E14" />
  </g>
);

export const TestFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- Lamp ----
  const flicker = frame < LAMP_ON + 14 ? 0.55 + 0.45 * Math.abs(noise2D("flk", frame * 0.9, 0)) : 1;
  const lampOn = ramp(frame, LAMP_ON, LAMP_ON + 3) * flicker;

  // ---- Hero ----
  const x = heroX(frame);
  const speed = Math.abs(heroX(frame + 1) - heroX(frame));
  const walk = Math.min(1, speed / 8);
  const walkPhase = ((x - START_X) / STRIDE) * Math.PI * 2;
  const settle = frame >= WALK[1] ? spring({ frame: frame - WALK[1], fps, config: { damping: 8 } }) : 1;

  let brow = lerp(0, 0.9, ramp(frame, 114, 128));
  let mouth = lerp(0.2, -0.5, ramp(frame, 114, 128));
  let browRaise = ramp(frame, SHADOW_IN, SHADOW_IN + 6) * (1 - ramp(frame, SHADOW_IN + 20, SHADOW_IN + 34)) * 0.8;
  let look = lerp(10, -14, ramp(frame, SHADOW_IN + 8, SHADOW_IN + 20));
  if (frame >= RESOLVE) {
    const snap = spring({ frame: frame - RESOLVE, fps, config: { damping: 10, stiffness: 200 } });
    brow = lerp(0.9, -1, snap);
    mouth = lerp(-0.5, -0.1, snap);
    browRaise = 0;
    look = lerp(-14, 10, snap);
  }

  // Hands: hanging, then pickup, then overhead presses.
  let handsY: number | "hang" = "hang";
  let squash = lerp(0.93, 1, settle);
  const CHEST = 140;
  const OVERHEAD = 470;
  if (frame >= PICKUP[0]) {
    handsY = lerp(34, CHEST, ramp(frame, PICKUP[0] + 2, PICKUP[1]));
    squash = 1 - 0.12 * Math.sin(Math.PI * Math.min(1, (frame - PICKUP[0]) / (PICKUP[1] - PICKUP[0])));
    for (const peak of REPS) {
      if (frame > peak - 7 && frame <= peak + 7) {
        const up = frame <= peak ? ramp(frame, peak - 7, peak) : 1 - ramp(frame, peak, peak + 7);
        handsY = lerp(CHEST, OVERHEAD, up);
        squash = 1 + 0.06 * up - (frame > peak + 4 ? 0.05 : 0);
      }
    }
  }
  const holding = frame >= PICKUP[0];
  const lit = 0.42 + 0.7 * lampOn * Math.exp(-Math.abs(x - LAMP_X) / 700);

  // ---- Shadow: grows when he's weak, shrinks with each rep ----
  const repsDone = REPS.filter((r) => frame >= r).length;
  const targetScale = [1.3, 1.05, 0.82, 0.55][repsDone];
  const grow = ramp(frame, SHADOW_IN, SHADOW_IN + 22);
  const shrinkFrom = repsDone > 0 ? REPS[repsDone - 1] : 0;
  const prevScale = [1.3, 1.3, 1.05, 0.82][repsDone];
  const shadowScale = repsDone ? lerp(prevScale, targetScale, ramp(frame, shrinkFrom, shrinkFrom + 8)) : 1.3 * grow;
  const shadowOpacity = grow * (repsDone === 3 ? 0.65 : 1);

  // ---- Camera ----
  let cam = { s: 1, fx: W / 2, fy: H / 2 };
  if (frame >= CLOSEUP[0] && frame < CLOSEUP[1]) {
    cam = { s: 3 + 0.08 * ramp(frame, CLOSEUP[0], CLOSEUP[1]), fx: DUMBBELL_X, fy: FLOOR_Y - 60 };
  } else if (frame >= CLOSEUP[1]) {
    const push = ramp(frame, SHADOW_IN, RESOLVE + 20);
    cam = { s: 1 + 0.12 * push, fx: lerp(W / 2, 900, push), fy: lerp(H / 2, 600, push) };
  }
  const shake = frame >= REPS[2] && frame < REPS[2] + 10 ? (1 - (frame - REPS[2]) / 10) * 14 : 0;
  const camT = `translate(${W / 2 - cam.fx * cam.s + noise2D("shx", frame, 0) * shake}px, ${
    H / 2 - cam.fy * cam.s + noise2D("shy", frame, 0) * shake
  }px) scale(${cam.s})`;

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const heroHeadY = FLOOR_Y - 400;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* ---------- SOUND (all generated in code by scripts/make-sfx.mjs) ---------- */}
      <Sequence durationInFrames={TITLE + 6}>
        <Audio
          src={staticFile("sfx/roomtone.wav")}
          volume={(f) => 0.35 * interpolate(f, [0, 15, TITLE - 6, TITLE + 6], [0, 1, 1, 0], { extrapolateRight: "clamp" })}
        />
      </Sequence>
      <Sequence from={LAMP_ON} durationInFrames={10}>
        <Audio src={staticFile("sfx/click.wav")} />
      </Sequence>
      <Sequence from={LAMP_ON + 2} durationInFrames={TITLE - LAMP_ON - 2}>
        <Audio src={staticFile("sfx/hum.wav")} loop volume={0.12} />
      </Sequence>
      {stepFrames.map((f, i) => (
        <Sequence key={f} from={f} durationInFrames={8}>
          <Audio src={staticFile("sfx/step.wav")} volume={0.55 + (i % 2) * 0.1} playbackRate={i % 2 ? 1.06 : 0.96} />
        </Sequence>
      ))}
      <Sequence from={SHADOW_IN - 2} durationInFrames={56}>
        <Audio src={staticFile("sfx/rumble.wav")} volume={0.9} />
      </Sequence>
      <Sequence from={RESOLVE - 2} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} />
      </Sequence>
      {REPS.slice(0, 2).map((r) => (
        <Sequence key={r} from={r} durationInFrames={8}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={REPS[2]} durationInFrames={36}>
        <Audio src={staticFile("sfx/impact.wav")} volume={0.7} />
      </Sequence>

      {/* ---------- PICTURE ---------- */}
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <AbsoluteFill style={{ transform: camT, transformOrigin: "0 0" }}>
          <Background />
          {/* light sources: moon through the window, then the lamp */}
          <Glow x={500} y={330} radius={260} color={C.moon} intensity={0.22} />
          <Glow x={LAMP_X} y={BULB_Y + 40} radius={720} color={C.lamp} intensity={0.55 * lampOn} />
          <Glow x={LAMP_X} y={FLOOR_Y} radius={420} color={C.lamp} intensity={0.25 * lampOn} />
          <Layer>
            <Window />
            <Floor />
            <Lamp />
            <circle cx={LAMP_X} cy={BULB_Y + 4} r={16} fill="#FFE2A8" opacity={0.25 + 0.75 * lampOn} />
            {!holding && (
              <g transform={`translate(${DUMBBELL_X},${FLOOR_Y - 34})`} style={{ filter: `brightness(${0.5 + 0.7 * lampOn})` }}>
                <Dumbbell seed="db" />
              </g>
            )}
            {frame >= SHADOW_IN && (
              <g opacity={shadowOpacity}>
                <Character x={SHADOW_X} y={FLOOR_Y} variant="shadow" scale={shadowScale} seed={3} />
              </g>
            )}
            <g style={{ filter: `brightness(${lit})` }}>
              <Character
                x={x}
                y={FLOOR_Y}
                walk={walk}
                walkPhase={walkPhase}
                brow={brow}
                browRaise={browRaise}
                mouth={mouth}
                look={look}
                handsY={handsY}
                squash={squash}
                held={holding ? <Dumbbell seed="dbh" /> : undefined}
              />
            </g>
          </Layer>
          {/* lamp light falling on the hero's side */}
          <Glow x={LAMP_X} y={BULB_Y + 40} radius={260} color={C.lamp} intensity={0.35 * lampOn} />
          <ShadowLine text="You'll quit by Friday." from={SHADOW_IN + 18} to={RESOLVE} x={140} y={360} />
          {REPS.map((r, i) => (
            <RepPop key={r} n={i + 1} at={r} x={LIFT_X + 190} y={heroHeadY - 40} big={i === 2} />
          ))}
          <SpeedLines at={REPS[2]} x={LIFT_X + 18} y={FLOOR_Y - 330} />
        </AbsoluteFill>

        {/* HUD sits outside the camera so it never zooms */}
        {frame < CLOSEUP[0] || frame >= CLOSEUP[1] ? <DayCounter day={1} from={8} /> : null}
        <Narrator text="Every day starts in the dark." from={36} to={104} />
        <Flash at={REPS[2]} />
      </AbsoluteFill>

      <Sequence from={TITLE}>
        <TitleCardFill />
      </Sequence>
      <Letterbox />
    </AbsoluteFill>
  );
};

/** The title card gets its own duration so its timings scale to the test length. */
const TitleCardFill: React.FC = () => (
  <TitleCard word="TEST." line1="Every rep counts." line2="Day 2 tomorrow." duration={300 - TITLE} />
);

export const TEST_DURATION = 300;
