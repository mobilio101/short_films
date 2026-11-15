// Korean display font for Korean-language Shorts (Black Han Sans, SIL Open Font License).
// Bungee has no Hangul, so Korean films wrap their content in <FontContext.Provider value={KO_FONT}>.
import { loadFont } from "@remotion/google-fonts/BlackHanSans";

export const KO_FONT = loadFont("normal", { weights: ["400"] }).fontFamily;
