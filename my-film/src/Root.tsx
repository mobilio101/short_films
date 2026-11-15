import React from "react";
import { Composition } from "remotion";
import { TestFilm, TEST_DURATION } from "./films/test/TestFilm";
import { StyledTest } from "./films/test/StyledTest";
import { PixelTest } from "./films/test/PixelTest";
import { CHALK, MEMPHIS, NEON, PAPER, VINTAGE } from "./films/test/styles";
import { FPS, H, W } from "./components/theme";
import { GhostArmy, GHOST_ARMY_DURATION } from "./films/ghost-army/GhostArmy";

const common = { durationInFrames: TEST_DURATION, fps: FPS, width: W, height: H };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="GhostArmy" component={GhostArmy} durationInFrames={GHOST_ARMY_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="Test" component={TestFilm} {...common} />
      {/* Style experiments: same 10 seconds, five different looks */}
      <Composition id="Test-Pixel" component={PixelTest} {...common} />
      <Composition id="Test-Paper" component={() => <StyledTest st={PAPER} />} {...common} />
      <Composition id="Test-Neon" component={() => <StyledTest st={NEON} />} {...common} />
      <Composition id="Test-Chalk" component={() => <StyledTest st={CHALK} />} {...common} />
      <Composition id="Test-Memphis" component={() => <StyledTest st={MEMPHIS} />} {...common} />
      <Composition id="Test-Vintage" component={() => <StyledTest st={VINTAGE} />} {...common} />
    </>
  );
};
