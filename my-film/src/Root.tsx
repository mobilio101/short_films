import React from "react";
import { Composition } from "remotion";
import { TestFilm, TEST_DURATION } from "./films/test/TestFilm";
import { StyledTest } from "./films/test/StyledTest";
import { PixelTest } from "./films/test/PixelTest";
import { Emotions } from "./films/test/Emotions";
import { CharacterStyles } from "./films/test/CharacterStyles";
import { Cabin3D } from "./films/test/cabin3d/Cabin3D";
import { ChibiSheet } from "./films/test/chibi/ChibiSheet";
import { ComicSheet } from "./films/test/chibi/ComicSheet";
import { ToonSheet } from "./films/test/toon/ToonSheet";
import { CaptainCompare } from "./films/test/toon/CaptainCompare";
import { DazzleShips, DAZZLE_DURATION } from "./films/dazzle-ships/DazzleShips";
import { ShadesSheet } from "./films/test/toon/ShadesSheet";
import { SmileSheet } from "./films/test/toon/SmileSheet";
import { CatSheet } from "./films/test/toon/CatSheet";
import { JawSheet } from "./films/test/toon/JawSheet";
import { LogoSheet } from "./films/test/brand/LogoSheet";
import { SmirkmanAvatar, SmirkmanBanner, StepAvatar, StepBanner } from "./films/test/brand/Brand";
import { CHALK, MEMPHIS, NEON, PAPER, VINTAGE } from "./films/test/styles";
import { FPS, H, W } from "./components/theme";
import { GhostArmy, GHOST_ARMY_DURATION } from "./films/ghost-army/GhostArmy";
import { DragonJar, DRAGON_JAR_DURATION } from "./films/dragon-jar/DragonJar";
import { Garbo, GARBO_DURATION } from "./films/garbo/Garbo";
import { Apollo13, APOLLO13_DURATION } from "./films/apollo13/Apollo13";
import { DragonJarKo, DRAGON_JAR_KO_DURATION } from "./films/dragon-jar-ko/DragonJarKo";
import { Mincemeat, MINCEMEAT_DURATION } from "./films/mincemeat/Mincemeat";

const common = { durationInFrames: TEST_DURATION, fps: FPS, width: W, height: H };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* New channel (3D world, 2D characters): SMIRKMAN, rules in SMIRKMAN.md */}
      <Composition id="DazzleShips" component={DazzleShips} durationInFrames={DAZZLE_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="DragonJarKo" component={DragonJarKo} durationInFrames={DRAGON_JAR_KO_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="Mincemeat" component={Mincemeat} durationInFrames={MINCEMEAT_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="Apollo13" component={Apollo13} durationInFrames={APOLLO13_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="Garbo" component={Garbo} durationInFrames={GARBO_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="DragonJar" component={DragonJar} durationInFrames={DRAGON_JAR_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="GhostArmy" component={GhostArmy} durationInFrames={GHOST_ARMY_DURATION} fps={FPS} width={1080} height={1920} />
      <Composition id="Test" component={TestFilm} {...common} />
      {/* Style experiments: same 10 seconds, five different looks */}
      <Composition id="Test-CharacterStyles" component={CharacterStyles} durationInFrames={240} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-Emotions" component={Emotions} durationInFrames={120} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-Pixel" component={PixelTest} {...common} />
      <Composition id="Test-Paper" component={() => <StyledTest st={PAPER} />} {...common} />
      <Composition id="Test-Neon" component={() => <StyledTest st={NEON} />} {...common} />
      <Composition id="Test-Chalk" component={() => <StyledTest st={CHALK} />} {...common} />
      <Composition id="Test-Memphis" component={() => <StyledTest st={MEMPHIS} />} {...common} />
      {/* New style experiment: real 3D world, flat 2D characters */}
      <Composition id="Brand-SmirkmanAvatar" component={SmirkmanAvatar} durationInFrames={1} fps={FPS} width={800} height={800} />
      <Composition id="Brand-SmirkmanBanner" component={SmirkmanBanner} durationInFrames={1} fps={FPS} width={2560} height={1440} />
      <Composition id="Brand-StepAvatar" component={StepAvatar} durationInFrames={1} fps={FPS} width={800} height={800} />
      <Composition id="Brand-StepBanner" component={StepBanner} durationInFrames={1} fps={FPS} width={2560} height={1440} />
      <Composition id="Test-LogoSheet" component={LogoSheet} durationInFrames={30} fps={FPS} width={1800} height={2720} />
      <Composition id="Test-JawSheet" component={JawSheet} durationInFrames={30} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-SmileSheet" component={SmileSheet} durationInFrames={60} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-CatSheet" component={CatSheet} durationInFrames={60} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-ShadesSheet" component={ShadesSheet} durationInFrames={60} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-CaptainCompare" component={CaptainCompare} durationInFrames={60} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-ToonSheet" component={ToonSheet} durationInFrames={60} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-ComicSheet" component={ComicSheet} durationInFrames={60} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-ChibiSheet" component={ChibiSheet} durationInFrames={60} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-Cabin3D" component={Cabin3D} durationInFrames={300} fps={FPS} width={1080} height={1920} />
      <Composition id="Test-Vintage" component={() => <StyledTest st={VINTAGE} />} {...common} />
    </>
  );
};
