import { loadFont } from "@remotion/google-fonts/ComicNeue";

export const { fontFamily: COMIC } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const BAR = 60; // letterbox bar height
export const FLOOR_Y = 860;

export const C = {
  bg: "#0E0E14",
  hero: "#F5A623",
  face: "#1A1A1A",
  shadow: "#000000",
  accent: "#8B6CFF",
  line: "#8A8A94",
  white: "#FFFFFF",
  lamp: "#FFB347",
  moon: "#BFD4FF",
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/** 0 -> 1 between frames a and b, eased. */
export const ramp = (frame: number, a: number, b: number) => smooth((frame - a) / (b - a));
