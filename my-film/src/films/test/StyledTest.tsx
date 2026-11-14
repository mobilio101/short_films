import React from "react";
import { AbsoluteFill, Freeze, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Floor, Glow, Layer, Letterbox, WobblyShape, rect } from "../../components/Stage";
import { Character, Skin } from "../../components/Character";
import { DayCounter, Narrator, RepPop, ShadowLine, SpeedLines } from "../../components/Hud";
import { TitleCard } from "../../components/TitleCard";
import { FLOOR_Y, Ui, UiContext } from "../../components/theme";
import {
  BULB_Y,
  DUMBBELL_X,
  DURATION,
  HERO_HEAD_Y,
  LAMP_X,
  LIFT_X,
  NARRATOR,
  REPS,
  SHADOW_LINE,
  SHADOW_X,
  TITLE,
  TITLE_TEXT,
  WINDOW,
  getState,
} from "./timeline";
import { TestSound } from "./TestSound";

/** Everything that changes between the SVG-drawn style versions. */
export type FilmStyle = {
  ui: Ui;
  bg: string;
  floor: { color: string; width: number };
  prop: {
    stroke: string;
    strokeWidth: number;
    wobble: number;
    dark: string; // lamp, window bars
    metal: string; // dumbbell plates
    bar: string; // dumbbell bar
    glass: string; // window glass
    shade: string; // lamp shade
  };
  moon: string;
  lamp: string;
  bulb: string;
  glow: number; // glow strength multiplier
  heroSkin: Skin;
  shadowSkin: Skin;
  /** Darken the hero when he's far from the lamp. */
  heroLit: boolean;
  /** Hold each drawing for N frames (stop-motion "on twos" = 2). */
  hold?: number;
  /** Extra filter applied to all SVG world drawing (e.g. chalk boil); return "" for none. */
  worldFilter?: (frame: number) => string;
  /** SVG <defs> needed by worldFilter. */
  Defs?: React.FC<{ frame: number }>;
  /** Drawn behind the world, inside the camera. */
  Backdrop?: React.FC<{ frame: number }>;
  /** Drawn over the whole picture, under the letterbox. */
  Overlay?: React.FC<{ frame: number }>;
  /** CSS filter for the whole picture (e.g. black and white film). */
  pictureFilter?: (frame: number) => string;
  /** Picture offset per frame (e.g. old film gate weave). */
  weave?: (frame: number) => [number, number];
  flashColor: string;
  sound: { kit: "default" | "chip"; projector?: boolean };
};

const Dumbbell: React.FC<{ seed: string; st: FilmStyle }> = ({ seed, st }) => (
  <g>
    <WobblyShape seed={seed + "bar"} points={rect(-78, -6, 156, 12)} fill={st.prop.bar} stroke={st.prop.stroke} strokeWidth={st.prop.strokeWidth} amount={st.prop.wobble} />
    <WobblyShape seed={seed + "pl"} points={rect(-82, -34, 26, 68)} fill={st.prop.metal} stroke={st.prop.stroke} strokeWidth={st.prop.strokeWidth} amount={st.prop.wobble} />
    <WobblyShape seed={seed + "pr"} points={rect(56, -34, 26, 68)} fill={st.prop.metal} stroke={st.prop.stroke} strokeWidth={st.prop.strokeWidth} amount={st.prop.wobble} />
  </g>
);

const Lamp: React.FC<{ st: FilmStyle }> = ({ st }) => {
  const p = { stroke: st.prop.stroke, strokeWidth: st.prop.strokeWidth, amount: st.prop.wobble };
  return (
    <g>
      <WobblyShape seed="lampbase" points={rect(LAMP_X - 55, FLOOR_Y - 14, 110, 14)} fill={st.prop.dark} {...p} />
      <WobblyShape seed="lamppole" points={rect(LAMP_X - 5, BULB_Y + 10, 10, FLOOR_Y - BULB_Y - 24)} fill={st.prop.dark} {...p} />
      <WobblyShape
        seed="lampshade"
        points={[
          [LAMP_X - 45, BULB_Y - 70],
          [LAMP_X + 45, BULB_Y - 70],
          [LAMP_X + 80, BULB_Y + 10],
          [LAMP_X - 80, BULB_Y + 10],
        ]}
        fill={st.prop.shade}
        {...p}
      />
    </g>
  );
};

const Window: React.FC<{ st: FilmStyle }> = ({ st }) => {
  const p = { stroke: st.prop.stroke, strokeWidth: st.prop.strokeWidth, amount: st.prop.wobble };
  const w = WINDOW;
  return (
    <g>
      <WobblyShape seed="win" points={rect(w.x, w.y, w.w, w.h)} fill={st.prop.glass} {...p} />
      <circle cx={w.moonX} cy={w.moonY} r={w.moonR} fill={st.moon} opacity={0.9} />
      <WobblyShape seed="winbar1" points={rect(w.x + 117, w.y, 6, w.h)} fill={st.bg} {...p} />
      <WobblyShape seed="winbar2" points={rect(w.x, w.y + 142, w.w, 6)} fill={st.bg} {...p} />
    </g>
  );
};

/** The picture for one style (no sound). */
const Picture: React.FC<{ st: FilmStyle }> = ({ st }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = getState(frame, fps);
  const h = s.hero;
  const worldFilter = st.worldFilter?.(frame) || undefined;
  const [wx, wy] = st.weave?.(frame) ?? [0, 0];

  return (
    <AbsoluteFill style={{ opacity: s.fadeIn, filter: st.pictureFilter?.(frame), transform: `translate(${wx}px, ${wy}px)` }}>
      <AbsoluteFill style={{ transform: `translate(${s.cam.x}px, ${s.cam.y}px) scale(${s.cam.s})`, transformOrigin: "0 0" }}>
        <AbsoluteFill style={{ background: st.bg }} />
        {st.Backdrop && <st.Backdrop frame={frame} />}
        <Glow x={WINDOW.moonX} y={WINDOW.moonY} radius={260} color={st.moon} intensity={0.22 * st.glow} />
        <Glow x={LAMP_X} y={BULB_Y + 40} radius={720} color={st.lamp} intensity={0.55 * s.lampOn * st.glow} />
        <Glow x={LAMP_X} y={FLOOR_Y} radius={420} color={st.lamp} intensity={0.25 * s.lampOn * st.glow} />
        <Layer>
          {st.Defs && <st.Defs frame={frame} />}
          <g style={{ filter: worldFilter }}>
            <Window st={st} />
            <Floor color={st.floor.color} width={st.floor.width} />
            <Lamp st={st} />
            <circle cx={LAMP_X} cy={BULB_Y + 4} r={16} fill={st.bulb} opacity={0.25 + 0.75 * s.lampOn} />
            {!s.holding && (
              <g transform={`translate(${DUMBBELL_X},${FLOOR_Y - 34})`} style={{ filter: st.heroLit ? `brightness(${0.5 + 0.7 * s.lampOn})` : undefined }}>
                <Dumbbell seed="db" st={st} />
              </g>
            )}
            {s.shadow.visible && (
              <g opacity={s.shadow.opacity}>
                <Character x={SHADOW_X} y={FLOOR_Y} variant="shadow" scale={s.shadow.scale} seed={3} skin={st.shadowSkin} />
              </g>
            )}
            <g style={{ filter: st.heroLit ? `brightness(${s.lit})` : undefined }}>
              <Character
                x={h.x}
                y={FLOOR_Y}
                walk={h.walk}
                walkPhase={h.walkPhase}
                brow={h.brow}
                browRaise={h.browRaise}
                mouth={h.mouth}
                look={h.look}
                handsY={h.handsY}
                squash={h.squash}
                skin={st.heroSkin}
                held={s.holding ? <Dumbbell seed="dbh" st={st} /> : undefined}
              />
            </g>
          </g>
        </Layer>
        <Glow x={LAMP_X} y={BULB_Y + 40} radius={260} color={st.lamp} intensity={0.35 * s.lampOn * st.glow} />
        <ShadowLine text={SHADOW_LINE.text} from={SHADOW_LINE.from} to={SHADOW_LINE.to} x={SHADOW_LINE.x} y={SHADOW_LINE.y} />
        {REPS.map((r, i) => (
          <RepPop key={r} n={i + 1} at={r} x={LIFT_X + 190} y={HERO_HEAD_Y - 40} big={i === 2} />
        ))}
        <SpeedLines at={REPS[2]} x={LIFT_X + 18} y={FLOOR_Y - 330} />
      </AbsoluteFill>

      {!s.inCloseup && <DayCounter day={1} from={8} />}
      <Narrator text={NARRATOR.text} from={NARRATOR.from} to={NARRATOR.to} />
      <AbsoluteFill style={{ background: st.flashColor, opacity: s.flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/** One complete style version: picture + title card + sound + letterbox. */
export const StyledTest: React.FC<{ st: FilmStyle }> = ({ st }) => {
  const frame = useCurrentFrame();
  const held = st.hold ? Math.floor(frame / st.hold) * st.hold : frame;
  return (
    <UiContext.Provider value={st.ui}>
      <AbsoluteFill style={{ background: "#000" }}>
        <TestSound kit={st.sound.kit} projector={st.sound.projector} />
        {st.hold ? (
          <Freeze frame={held}>
            <Picture st={st} />
          </Freeze>
        ) : (
          <Picture st={st} />
        )}
        {/* Title card is never frozen: it carries its own typing sounds. */}
        <Sequence from={TITLE}>
          <TitleCard {...TITLE_TEXT} duration={DURATION - TITLE} sfxPrefix={st.sound.kit === "chip" ? "chip_" : ""} />
        </Sequence>
        {st.Overlay && <st.Overlay frame={frame} />}
        <Letterbox />
      </AbsoluteFill>
    </UiContext.Provider>
  );
};
