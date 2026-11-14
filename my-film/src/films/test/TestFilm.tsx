import React from "react";
import { StyledTest } from "./StyledTest";
import { CHANNEL } from "./styles";

/** The original test film in the channel style. */
export const TestFilm: React.FC = () => <StyledTest st={CHANNEL} />;
export { DURATION as TEST_DURATION } from "./timeline";
