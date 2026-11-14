import React from "react";
import { Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { LAMP_ON, REPS, RESOLVE, SHADOW_IN, STEP_FRAMES, TITLE } from "./timeline";

/**
 * The test film's soundtrack. Every file is generated in code by scripts/make-sfx.mjs.
 * kit "default" = the channel sounds, "chip" = 8-bit versions for the pixel-art style.
 * The title card plays its own typing sounds. `projector` adds an old film projector rattle under everything.
 */
export const TestSound: React.FC<{ kit?: "default" | "chip"; projector?: boolean}> = ({
  kit = "default",
  projector = false,
}) => {
  const sfx = (name: string) => staticFile(`sfx/${kit === "chip" ? "chip_" : ""}${name}.wav`);

  return (
    <>
      <Sequence durationInFrames={TITLE + 6}>
        <Audio
          src={sfx("roomtone")}
          volume={(f) => (kit === "chip" ? 0.22 : 0.35) * interpolate(f, [0, 15, TITLE - 6, TITLE + 6], [0, 1, 1, 0], { extrapolateRight: "clamp" })}
        />
      </Sequence>
      {projector && <Audio src={staticFile("sfx/projector.wav")} loop volume={0.35} />}
      <Sequence from={LAMP_ON} durationInFrames={10}>
        <Audio src={sfx("click")} />
      </Sequence>
      <Sequence from={LAMP_ON + 2} durationInFrames={TITLE - LAMP_ON - 2}>
        <Audio src={sfx("hum")} loop volume={0.12} />
      </Sequence>
      {STEP_FRAMES.map((f, i) => (
        <Sequence key={f} from={f} durationInFrames={8}>
          <Audio src={sfx("step")} volume={0.55 + (i % 2) * 0.1} playbackRate={i % 2 ? 1.06 : 0.96} />
        </Sequence>
      ))}
      <Sequence from={SHADOW_IN - 2} durationInFrames={56}>
        <Audio src={sfx("rumble")} volume={0.9} />
      </Sequence>
      <Sequence from={RESOLVE - 2} durationInFrames={20}>
        <Audio src={sfx("whoosh")} volume={0.6} />
      </Sequence>
      {REPS.slice(0, 2).map((r) => (
        <Sequence key={r} from={r} durationInFrames={8}>
          <Audio src={sfx("pop")} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={REPS[2]} durationInFrames={36}>
        <Audio src={sfx("impact")} volume={0.7} />
      </Sequence>
    </>
  );
};
