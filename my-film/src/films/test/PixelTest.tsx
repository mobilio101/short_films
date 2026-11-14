import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { noise2D } from "@remotion/noise";
import { loadFont } from "@remotion/google-fonts/PressStart2P";
import { BAR, FLOOR_Y, H, W, clamp01 } from "../../components/theme";
import { titleTimings } from "../../components/TitleCard";
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

const PIXEL_FONT = loadFont("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

// Low-res frame buffer: 384×216, shown 5× bigger with hard pixel edges.
const S = 5;
const FW = W / S;
const FH = H / S;

// Our own limited palette.
const P = {
  black: "#000000",
  bg: "#0B0B13",
  bg2: "#141420",
  grey: "#5E5E74",
  light: "#A9A9BE",
  white: "#F4F4F4",
  ambDark: "#6E3F0E",
  ambMid: "#B8701A",
  amb: "#F5A623",
  ambHi: "#FFD47E",
  face: "#1A1210",
  lamp1: "#22180F",
  lamp2: "#3E2A15",
  lamp3: "#6A4720",
  lamp4: "#A8742E",
  bulb: "#FFE8B0",
  moon: "#BFD4FF",
  moon1: "#141A2A",
  moon2: "#1E2940",
  violet: "#8B6CFF",
  violetDark: "#3A2C7A",
  metal: "#2C2C3A",
  bar: "#55556A",
  shade: "#4A3420",
};

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => (v + 0.5) / 16));

const hexToABGR = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0xff << 24) | ((n & 0xff) << 16) | (n & 0xff00) | ((n >> 16) & 0xff);
};
const CACHE = new Map<string, number>();
const col = (hex: string) => {
  let v = CACHE.get(hex);
  if (v === undefined) {
    v = hexToABGR(hex);
    CACHE.set(hex, v);
  }
  return v;
};

/** Tiny software rasterizer: every pixel is placed by hand, no anti-aliasing. */
class Pix {
  img: ImageData;
  buf: Uint32Array;
  textCanvas: HTMLCanvasElement;
  tctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.img = ctx.createImageData(FW, FH);
    this.buf = new Uint32Array(this.img.data.buffer);
    this.textCanvas = document.createElement("canvas");
    this.textCanvas.width = FW;
    this.textCanvas.height = FH;
    this.tctx = this.textCanvas.getContext("2d", { willReadFrequently: true })!;
  }
  /** alpha < 1 is drawn as an ordered dither pattern. */
  px(x: number, y: number, c: string, alpha = 1) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= FW || y >= FH) return;
    if (alpha < 1 && alpha <= BAYER[y & 3][x & 3]) return;
    this.buf[y * FW + x] = col(c);
  }
  clear(c: string) {
    this.buf.fill(col(c));
  }
  rect(x: number, y: number, w: number, h: number, c: string, alpha = 1) {
    const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h);
    for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) this.px(i, j, c, alpha);
  }
  disc(cx: number, cy: number, r: number, c: string, alpha = 1) {
    const r2 = r * r;
    for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++)
      for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++)
        if ((i - cx + 0.5) ** 2 + (j - cy + 0.5) ** 2 <= r2) this.px(i, j, c, alpha);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: string, alpha = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let n = 0; n < 2000; n++) {
      this.px(x0, y0, c, alpha);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  /** Thick curve (noodle limb): a quadratic bezier stamped with discs. */
  noodle(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, r: number, c: string, alpha = 1) {
    const steps = Math.max(6, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      if (r <= 0.6) this.px(x, y, c, alpha);
      else this.disc(x, y, r, c, alpha);
    }
  }
  /** Dithered radial glow, 4 light levels. */
  glow(cx: number, cy: number, radius: number, levels: string[], strength: number) {
    if (strength <= 0.01) return;
    for (let j = Math.max(0, Math.floor(cy - radius)); j < Math.min(FH, cy + radius); j++)
      for (let i = Math.max(0, Math.floor(cx - radius)); i < Math.min(FW, cx + radius); i++) {
        const d = Math.hypot(i - cx, j - cy) / radius;
        if (d >= 1) continue;
        const v = (1 - d) ** 1.6 * strength * levels.length + BAYER[j & 3][i & 3] - 0.5;
        const lvl = Math.min(levels.length, Math.floor(v));
        if (lvl > 0) this.buf[j * FW + i] = col(levels[lvl - 1]);
      }
  }
  /** Text drawn with the pixel font, then thresholded so edges stay hard. */
  text(str: string, x: number, y: number, size: number, c: string, align: CanvasTextAlign = "left", alpha = 1, outline?: string) {
    if (!str || alpha <= 0) return;
    const t = this.tctx;
    t.clearRect(0, 0, FW, FH);
    t.font = `${size}px ${PIXEL_FONT}`;
    t.textAlign = align;
    t.textBaseline = "top";
    t.fillStyle = "#fff";
    t.fillText(str, Math.round(x), Math.round(y));
    const data = t.getImageData(0, 0, FW, FH).data;
    const on = (i: number, j: number) => i >= 0 && j >= 0 && i < FW && j < FH && data[(j * FW + i) * 4 + 3] > 110;
    for (let j = 0; j < FH; j++)
      for (let i = 0; i < FW; i++) {
        if (on(i, j)) this.px(i, j, c, alpha);
        else if (outline && (on(i - 1, j) || on(i + 1, j) || on(i, j - 1) || on(i, j + 1))) this.px(i, j, outline, alpha);
      }
  }
  flush(ctx: CanvasRenderingContext2D) {
    ctx.putImageData(this.img, 0, 0);
  }
}

type Figure = {
  x: number;
  scale: number;
  squash: number;
  walk: number;
  walkPhase: number;
  handsY: number | "hang";
  brow: number;
  browRaise: number;
  mouth: number;
  look: number;
  frame: number;
  seed: number;
};

/** The character, rebuilt from the same proportions as the SVG version. */
const drawFigure = (
  p: Pix,
  f: Figure,
  toScreen: (wx: number, wy: number) => [number, number],
  k: number,
  colors: { body: string; rim?: string; outline?: string; face: string; slit?: boolean },
  alpha: number,
  held?: (cx: number, cy: number) => void,
) => {
  const LEG = 120, TORSO_H = 120, TORSO_W = 92, HEAD_R = 88, LIMB = 15;
  const sx = f.scale / Math.sqrt(f.squash), sy = f.scale * f.squash;
  const L = (lx: number, ly: number) => toScreen(f.x + lx * sx, FLOOR_Y + ly * sy);
  const breathe = 1 + 0.018 * Math.sin((f.frame + f.seed * 13) / 14);
  const bob = f.walk * Math.abs(Math.sin(f.walkPhase)) * 7;
  const hipY = -LEG - bob;
  const torsoTop = hipY - TORSO_H * breathe;
  const shoulderY = torsoTop + 28;
  const headY = torsoTop - HEAD_R * 0.62;
  const r = (LIMB / 2) * k * f.scale;

  const noodleL = (x1: number, y1: number, x2: number, y2: number, bend: number, c: string, grow: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const cx = (x1 + x2) / 2 + (-(y2 - y1) / len) * bend;
    const cy = (y1 + y2) / 2 + ((x2 - x1) / len) * bend;
    const [a, b] = L(x1, y1), [c1, c2] = L(cx, cy), [d1, d2] = L(x2, y2);
    p.noodle(a, b, c1, c2, d1, d2, r + grow, c, alpha);
  };
  const legs = [0, Math.PI].map((off) => {
    const ph = f.walkPhase + off;
    const fx = Math.sin(ph) * 42 * f.walk;
    const lift = Math.max(0, Math.cos(ph)) * 22 * f.walk;
    const side = off ? -14 : 14;
    return [side, hipY + 4, fx + side, -lift, 10 + 8 * f.walk] as const;
  });
  const hands =
    f.handsY === "hang"
      ? [-1, 1].map((s) => [s * 30 + Math.sin(f.walkPhase + (s > 0 ? Math.PI : 0)) * 38 * f.walk + Math.sin((f.frame + f.seed * 7) / 22) * 3, shoulderY + 125] as const)
      : [-1, 1].map((s) => [s * 46 + 18, -(f.handsY as number)] as const);
  const arms = hands.map(([hx, hy], i) => {
    const s = i === 0 ? -1 : 1;
    return [s * (TORSO_W / 2 - 10), shoulderY, hx, hy, s * 16] as const;
  });

  const torso = (c: string, grow: number) => {
    const [tx, ty] = L(0, torsoTop + TORSO_W / 2 - 6);
    const [bx, by] = L(0, hipY + 12 - TORSO_W / 2 + 6);
    p.noodle(tx, ty, tx, (ty + by) / 2, bx, by, (TORSO_W / 2) * k * f.scale + grow, c, alpha);
  };
  const [hx, hy] = L(0, headY);
  const hr = HEAD_R * k * f.scale;

  // outline pass
  if (colors.outline) {
    legs.forEach((l) => noodleL(...l, colors.outline!, 1));
    arms.forEach((a) => noodleL(...a, colors.outline!, 1));
    torso(colors.outline, 1);
    p.disc(hx, hy, hr + 1, colors.outline, alpha);
  }
  legs.forEach((l) => noodleL(...l, colors.body, 0));
  torso(colors.body, 0);
  if (colors.rim) p.disc(hx + Math.max(1, hr * 0.08), hy, hr, colors.rim, alpha);
  p.disc(hx - (colors.rim ? Math.max(1, hr * 0.06) : 0), hy, hr, colors.body, alpha);

  // face
  const F = (lx: number, ly: number) => L(lx, headY + ly);
  const eyeL = -24 + f.look, eyeR = 24 + f.look;
  const blink = (f.frame + f.seed * 31) % 105 < 4;
  const thick = Math.max(1, Math.round(2.6 * k * f.scale));
  if (colors.slit) {
    for (const [ex, dir] of [[eyeL, 1], [eyeR, -1]] as const) {
      const [a, b] = F(ex - 16, -4 - dir * 4), [c, d] = F(ex + 16, -4 + dir * 4);
      p.line(a, b, c, d, colors.face, alpha);
    }
  } else {
    for (const ex of [eyeL, eyeR]) {
      const [a, b] = F(ex, -2);
      if (blink) p.rect(a - thick, b, thick * 2, 1, colors.face, alpha);
      else p.rect(a - thick / 2 - 0.5, b - thick / 2 - 0.5, thick + 1, thick + 1, colors.face, alpha);
    }
    const browY = -26 - f.browRaise * 10;
    for (const [ex, inner] of [[eyeL, 1], [eyeR, -1]] as const) {
      const [a, b] = F(ex - inner * 15, browY + f.brow * 8);
      const [c, d] = F(ex + inner * 15, browY - f.brow * 8);
      for (let t = 0; t < thick; t++) p.line(a, b + t, c, d + t, colors.face, alpha);
    }
    const [m0, m1] = F(f.look - 18, 34), [mc0, mc1] = F(f.look, 34 + f.mouth * 13), [m2, m3] = F(f.look + 18, 34);
    p.noodle(m0, m1, mc0, mc1, m2, m3, thick > 1 ? thick / 2 : 0, colors.face, alpha);
  }

  if (held) {
    const [cx, cy] = L((hands[0][0] + hands[1][0]) / 2, (hands[0][1] + hands[1][1]) / 2);
    held(cx, cy);
  }
  arms.forEach((a) => noodleL(...a, colors.body, 0));
};

const drawFrame = (p: Pix, frame: number, fps: number) => {
  const s = getState(frame, fps);
  const k = s.cam.s / S;
  const T = (wx: number, wy: number): [number, number] => [(wx * s.cam.s + s.cam.x) / S, (wy * s.cam.s + s.cam.y) / S];

  // ---------- title card ----------
  if (frame >= TITLE) {
    const t = frame - TITLE;
    const d = DURATION - TITLE;
    const tt = titleTimings(d, TITLE_TEXT.word.length);
    const fade = 1 - clamp01((t - tt.fadeOutStart) / (d - 2 - tt.fadeOutStart));
    p.clear(P.black);
    const typed = Math.max(0, Math.min(TITLE_TEXT.word.length, Math.floor((t - tt.typeStart) / tt.perLetter) + 1));
    // centre the full word so letters don't shift while typing
    const full = TITLE_TEXT.word;
    p.tctx.font = `32px ${PIXEL_FONT}`;
    const wordW = p.tctx.measureText(full).width;
    p.text(full.slice(0, typed), FW / 2 - wordW / 2, 72, 32, P.white, "left", fade);
    const u = clamp01((t - tt.underStart) / tt.underLen);
    const ux0 = FW / 2 - 80;
    for (let i = 0; i < 160 * u; i++) {
      const y = 116 + Math.round(Math.sin(i * 0.22 + t * 0.25) * 2);
      p.rect(ux0 + i, y, 1, 2, P.violet, fade);
    }
    p.text(TITLE_TEXT.line1, FW / 2, 132, 8, P.white, "center", fade * clamp01((t - tt.l1) / 6));
    p.text(TITLE_TEXT.line2, FW / 2, 148, 8, P.violet, "center", fade * clamp01((t - tt.l2) / 6));
    p.rect(0, 0, FW, BAR / S, P.black);
    p.rect(0, FH - BAR / S, FW, BAR / S, P.black);
    return;
  }

  // ---------- world ----------
  p.clear(P.bg);
  // back wall slightly lighter band
  const [, wallTop] = T(0, 120);
  const [, floorY] = T(0, FLOOR_Y);
  p.rect(0, wallTop, FW, floorY - wallTop, P.bg2, 0.35);
  // light sources (dithered)
  const [mx, my] = T(WINDOW.moonX, WINDOW.moonY);
  p.glow(mx, my, 60 * k * S * 0.9, [P.moon1, P.moon2], 0.55);
  const [lx, ly] = T(LAMP_X, BULB_Y + 40);
  p.glow(lx, ly, 150 * k * S * 0.9, [P.lamp1, P.lamp2, P.lamp3, P.lamp4], s.lampOn * 0.95);

  // window
  const [wx, wy] = T(WINDOW.x, WINDOW.y);
  const ww = WINDOW.w * k, wh = WINDOW.h * k;
  p.rect(wx - 1, wy - 1, ww + 2, wh + 2, P.grey);
  p.rect(wx, wy, ww, wh, P.moon1);
  p.disc(mx, my, WINDOW.moonR * k, P.moon);
  p.disc(mx - WINDOW.moonR * k * 0.3, my - WINDOW.moonR * k * 0.2, WINDOW.moonR * k * 0.25, "#D8E4FF");
  p.rect(wx + 117 * k, wy, Math.max(1, 6 * k), wh, P.grey);
  p.rect(wx, wy + 142 * k, ww, Math.max(1, 6 * k), P.grey);

  // floor: line + checker strip
  p.rect(0, floorY, FW, 1, P.light);
  for (let i = 0; i < FW; i += 2) p.px(i, floorY + 2, P.grey);

  // lamp
  const [lbx, lby] = T(LAMP_X - 55, FLOOR_Y - 14);
  p.rect(lbx, lby, 110 * k, 14 * k, P.grey);
  const [lpx, lpy] = T(LAMP_X - 5, BULB_Y + 10);
  p.rect(lpx, lpy, Math.max(1, 10 * k), (FLOOR_Y - BULB_Y - 24) * k, P.grey);
  for (let j = 0; j <= 80 * k; j++) {
    const t = j / (80 * k);
    const half = (45 + 35 * t) * k;
    const [cx, cy] = T(LAMP_X, BULB_Y - 70);
    p.rect(cx - half, cy + j, half * 2, 1, j === 0 ? P.light : P.shade);
    p.px(cx - half, cy + j, P.light);
    p.px(cx + half - 1, cy + j, P.light);
  }
  const [bx, by] = T(LAMP_X, BULB_Y + 4);
  p.disc(bx, by, 16 * k, s.lampOn > 0.5 ? P.bulb : P.grey);

  const dumbbell = (cx: number, cy: number) => {
    p.rect(cx - 78 * k, cy - 6 * k, 156 * k, Math.max(1, 12 * k), P.bar);
    for (const ox of [-82, 56]) {
      p.rect(cx + ox * k - 1, cy - 34 * k - 1, 26 * k + 2, 68 * k + 2, P.light);
      p.rect(cx + ox * k, cy - 34 * k, 26 * k, 68 * k, P.metal);
    }
  };
  if (!s.holding) {
    const [dx, dy] = T(DUMBBELL_X, FLOOR_Y - 34);
    dumbbell(dx, dy);
  }

  // shadow (dithered transparency)
  if (s.shadow.visible) {
    const sh: Figure = { x: SHADOW_X, scale: s.shadow.scale, squash: 1, walk: 0, walkPhase: 0, handsY: "hang", brow: 0, browRaise: 0, mouth: 0, look: 10, frame, seed: 3 };
    drawFigure(p, sh, T, k, { body: P.violetDark, face: P.violetDark, slit: true }, s.shadow.opacity * (0.5 + 0.2 * Math.sin(frame / 6)));
    drawFigure(p, sh, T, k, { body: P.black, outline: P.violet, face: P.violet, slit: true }, s.shadow.opacity);
  }

  // hero: palette shade depends on how close he is to the lamp
  const h = s.hero;
  const body = s.lit > 0.8 ? P.amb : s.lit > 0.6 ? P.ambMid : P.ambDark;
  const rim = s.lampOn > 0.5 && s.lit > 0.6 ? P.ambHi : undefined;
  drawFigure(
    p,
    { ...h, scale: 1, frame, seed: 0 },
    T,
    k,
    { body, rim, face: P.face },
    1,
    s.holding ? (cx, cy) => dumbbell(cx, cy) : undefined,
  );

  // speed lines
  const tHit = (frame - REPS[2]) / 14;
  if (tHit >= 0 && tHit <= 1) {
    const [cx, cy] = T(LIFT_X + 18, FLOOR_Y - 330);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + noise2D("sp", i, 0) * 0.15;
      const r1 = (180 + tHit * 260) / S, r2 = r1 + (120 + noise2D("sp2", i, 2) * 80) / S;
      p.line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, P.white, 1 - tHit);
    }
  }

  // ---------- HUD ----------
  // shadow line (types on, beside the shadow)
  if (frame >= SHADOW_LINE.from && frame < SHADOW_LINE.to) {
    const str = SHADOW_LINE.text;
    const chars = Math.floor(clamp01((frame - SHADOW_LINE.from) / Math.max(8, str.length * 1.2)) * str.length);
    const [tx, ty] = T(SHADOW_LINE.x, SHADOW_LINE.y + 20);
    p.text(str.slice(0, chars), tx, ty, 8, P.violet, "left", clamp01((SHADOW_LINE.to - frame) / 10));
  }
  // rep pops
  REPS.forEach((r, i) => {
    if (frame < r || frame > r + 30) return;
    const sp = spring({ frame: frame - r, fps, config: { damping: 7, stiffness: 220 } });
    const size = (i === 2 ? 24 : 16) * (sp > 1.05 ? 1.5 : sp > 0.5 ? 1 : 0.5);
    const [rx, ry] = T(LIFT_X + 190, HERO_HEAD_Y - 40 - (frame - r) * 1.5);
    p.text(String(i + 1), rx, ry - size / 2, Math.round(size / 8) * 8, P.white, "center", 1 - clamp01((frame - r - 18) / 12), P.black);
  });
  if (!s.inCloseup) p.text("DAY 1", 11, BAR / S + 6, 8, P.white, "left", clamp01((frame - 8) / 8) * 0.9);
  const nOp = Math.min(clamp01((frame - NARRATOR.from) / 12), clamp01((NARRATOR.to - frame) / 12));
  p.text(NARRATOR.text, FW / 2, BAR / S + 8, 8, P.white, "center", nOp);

  // flash + fade-in (both dithered)
  if (s.flash > 0.02) p.rect(0, 0, FW, FH, P.white, s.flash);
  if (s.fadeIn < 1) p.rect(0, 0, FW, FH, P.black, 1 - s.fadeIn);

  // letterbox
  p.rect(0, 0, FW, BAR / S, P.black);
  p.rect(0, FH - BAR / S, FW, BAR / S, P.black);
};

const PixelCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const pix = useRef<Pix | null>(null);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    const h = delayRender("pixel font");
    document.fonts.load(`8px ${PIXEL_FONT}`).then(() => {
      setFontReady(true);
      continueRender(h);
    });
  }, []);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    if (!pix.current) pix.current = new Pix(ctx);
    drawFrame(pix.current, frame, fps);
    pix.current.flush(ctx);
  }, [frame, fps, fontReady]);

  return <canvas ref={ref} width={FW} height={FH} style={{ width: W, height: H, imageRendering: "pixelated" }} />;
};

export const PixelTest: React.FC = () => {
  const tt = titleTimings(DURATION - TITLE, TITLE_TEXT.word.length);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TestSound kit="chip" />
      {/* title card sounds (the pixel title card is drawn on the canvas) */}
      {Array.from({ length: TITLE_TEXT.word.length }, (_, i) => (
        <Sequence key={i} from={TITLE + tt.typeStart + i * tt.perLetter} durationInFrames={10} layout="none">
          <Audio src={staticFile("sfx/chip_type.wav")} volume={0.8} />
        </Sequence>
      ))}
      <Sequence from={TITLE + tt.underStart} layout="none">
        <Audio src={staticFile("sfx/chip_shimmer.wav")} volume={0.5} />
      </Sequence>
      <PixelCanvas />
    </AbsoluteFill>
  );
};
