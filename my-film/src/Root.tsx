import { Composition } from "remotion";
import { TestFilm, TEST_DURATION } from "./films/test/TestFilm";
import { FPS, H, W } from "./components/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Test" component={TestFilm} durationInFrames={TEST_DURATION} fps={FPS} width={W} height={H} />
    </>
  );
};
