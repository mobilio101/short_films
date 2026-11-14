// The test film's choreography, shared by every style version.
// getState(frame) says where everything is and how it looks on that frame;
// each style only decides how to draw it.
import { interpolate, spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { FLOOR_Y, H, W, lerp, ramp } from "../../components/theme";

// ---- Timeline (frames @ 30 fps, 300 total = 10 s) ----
export const DURATION = 300;
export const LAMP_ON = 18;
export const WALK = [28, 108] as const;
export const CLOSEUP = [112, 130] as const; // hard cut to the dumbbell
export const SHADOW_IN = 130;
export const RESOLVE = 180; // brows snap to determined
export const STEP_IN = [184, 196] as const; // steps up to the dumbbell
export const PICKUP = [198, 208] as const;
export const REPS = [216, 230, 244]; // peak frame of each rep; last one is the big hit
export const TITLE = 256;

export const NARRATOR = { text: "Every day starts in the dark.", from: 36, to: 104 };
export const SHADOW_LINE = { text: "You'll quit by Friday.", from: SHADOW_IN + 18, to: RESOLVE, x: 90, y: 600 };
export const TITLE_TEXT = { word: "TEST.", line1: "Every rep counts.", line2: "Day 2 tomorrow." };

// ---- Layout (stage px, 1920×1080) ----
export const LAMP_X = 1320;
export const BULB_Y = 548;
export const START_X = 150;
export const STOP_X = 900;
export const LIFT_X = 1042; // where he stands to lift
export const DUMBBELL_X = 1060;
export const SHADOW_X = 720;
export const STRIDE = 170; // px travelled per full walk cycle
export const WINDOW = { x: 330, y: 250, w: 240, h: 290, moonX: 500, moonY: 330, moonR: 34 };
export const HERO_HEAD_Y = FLOOR_Y - 400;

export const heroX = (f: number) =>
  f < STEP_IN[0] ? lerp(START_X, STOP_X, ramp(f, WALK[0], WALK[1])) : lerp(STOP_X, LIFT_X, ramp(f, STEP_IN[0], STEP_IN[1]));

/** Frames on which a foot lands (every half walk cycle). */
export const STEP_FRAMES = (() => {
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

export const getState = (frame: number, fps: number) => {
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
  const shadowVisible = frame >= SHADOW_IN;

  // ---- Camera ----
  let cam = { s: 1, fx: W / 2, fy: H / 2 };
  if (frame >= CLOSEUP[0] && frame < CLOSEUP[1]) {
    cam = { s: 3 + 0.08 * ramp(frame, CLOSEUP[0], CLOSEUP[1]), fx: DUMBBELL_X, fy: FLOOR_Y - 60 };
  } else if (frame >= CLOSEUP[1]) {
    const push = ramp(frame, SHADOW_IN, RESOLVE + 20);
    cam = { s: 1 + 0.12 * push, fx: lerp(W / 2, 900, push), fy: lerp(H / 2, 600, push) };
  }
  const shake = frame >= REPS[2] && frame < REPS[2] + 10 ? (1 - (frame - REPS[2]) / 10) * 14 : 0;
  const camX = W / 2 - cam.fx * cam.s + noise2D("shx", frame, 0) * shake;
  const camY = H / 2 - cam.fy * cam.s + noise2D("shy", frame, 0) * shake;

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const inCloseup = frame >= CLOSEUP[0] && frame < CLOSEUP[1];
  const flash = interpolate(frame, [REPS[2], REPS[2] + 1, REPS[2] + 8], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    lampOn,
    hero: { x, walk, walkPhase, brow, browRaise, mouth, look, handsY, squash },
    holding,
    lit,
    shadow: { visible: shadowVisible, scale: shadowScale, opacity: shadowOpacity },
    cam: { s: cam.s, x: camX, y: camY },
    fadeIn,
    inCloseup,
    flash,
    repsDone,
  };
};

export type FilmState = ReturnType<typeof getState>;
