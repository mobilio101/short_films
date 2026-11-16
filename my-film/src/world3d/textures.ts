// More textures painted in code for the new channel (dazzle paint, sea, sky, plaster).
import * as THREE from "three";
import { rng } from "../films/test/cabin3d/textures";

export { woodTexture, chartTexture, glowTexture, blobTexture, dayTexture, rugTexture } from "../films/test/cabin3d/textures";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d") as CanvasRenderingContext2D] as const;
};
const tex = (c: HTMLCanvasElement, repeat: [number, number] = [1, 1]) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
};

/**
 * Dazzle camouflage: big hard-edged stripes, zigzags and wedges in black, white, blue and grey.
 * Each seed gives a different ship its own pattern.
 */
export const dazzleTexture = (seed: number, palette = ["#F4F4F2", "#141414", "#2D63C8", "#9AA7B4", "#6FB7E8"]) => {
  const [c, g] = canvas(1024, 512);
  const r = rng(seed);
  g.fillStyle = palette[0];
  g.fillRect(0, 0, 1024, 512);
  // Big diagonal bands.
  for (let i = 0; i < 9; i++) {
    const x = -300 + i * 160 + r() * 60;
    const w = 50 + r() * 70;
    const slope = (r() < 0.5 ? -1 : 1) * (120 + r() * 260);
    g.fillStyle = palette[1 + Math.floor(r() * (palette.length - 1))];
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + w, 0);
    g.lineTo(x + w + slope, 512);
    g.lineTo(x + slope, 512);
    g.closePath();
    g.fill();
  }
  // Zigzag bands.
  for (let k = 0; k < 2; k++) {
    const y0 = 120 + k * 230 + r() * 40;
    g.fillStyle = k === 0 ? palette[1] : palette[2];
    g.beginPath();
    g.moveTo(0, y0);
    for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y0 + ((x / 64) % 2 === 0 ? -34 : 34));
    for (let x = 1024; x >= 0; x -= 64) g.lineTo(x, y0 + 30 + ((x / 64) % 2 === 0 ? -34 : 34));
    g.closePath();
    g.fill();
  }
  // Wedges.
  for (let i = 0; i < 6; i++) {
    g.fillStyle = palette[Math.floor(r() * palette.length)];
    const x = r() * 1024;
    const y = r() * 512;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 160 + r() * 120, y + (r() - 0.5) * 120);
    g.lineTo(x + 40, y + 140 + r() * 80);
    g.closePath();
    g.fill();
  }
  return tex(c);
};

/** Plain battleship grey with a few rust streaks (the "before" ships). */
export const greyHullTexture = () => {
  const [c, g] = canvas(512, 256);
  g.fillStyle = "#8D97A1";
  g.fillRect(0, 0, 512, 256);
  const r = rng(5);
  for (let i = 0; i < 30; i++) {
    g.fillStyle = `rgba(110,60,30,${0.1 + r() * 0.15})`;
    g.fillRect(r() * 512, r() * 100, 3, 40 + r() * 100);
  }
  return tex(c);
};

/** Bright cartoon sea: blue with white wave marks. Animate `offset` for movement. */
export const seaTexture = () => {
  const [c, g] = canvas(1024, 1024);
  g.fillStyle = "#2C9BD6";
  g.fillRect(0, 0, 1024, 1024);
  const r = rng(31);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(20,90,160,${r() * 0.12})`;
    g.fillRect(r() * 1024, r() * 1024, 30 + r() * 60, 4);
  }
  g.strokeStyle = "rgba(255,255,255,0.85)";
  g.lineWidth = 6;
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = r() * 1024;
    const y = r() * 1024;
    const w = 30 + r() * 50;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + w / 2, y - 12, x + w, y);
    g.stroke();
  }
  return tex(c, [24, 24]);
};

/** Sky dome texture: deep blue at the top to pale at the horizon, with a few flat clouds. */
export const skyTexture = () => {
  const [c, g] = canvas(1024, 512);
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#2F8CEB");
  grad.addColorStop(0.45, "#7CC3F5");
  grad.addColorStop(0.5, "#CFEBFF");
  grad.addColorStop(1, "#CFEBFF");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 512);
  const r = rng(9);
  g.fillStyle = "#FFFFFF";
  for (let k = 0; k < 7; k++) {
    const x = r() * 1024;
    const y = 90 + r() * 120;
    const s = 0.6 + r() * 0.8;
    for (const [dx, dy, rr] of [
      [0, 0, 26],
      [26, -10, 22],
      [50, 2, 20],
      [-22, 6, 18],
    ] as const) {
      g.beginPath();
      g.arc(x + dx * s, y + dy * s, rr * s, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = tex(c);
  t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
};

/** Painted plaster wall with a soft gradient and a little noise. */
export const plasterTexture = (base: string, seed = 3) => {
  const [c, g] = canvas(512, 512);
  const col = new THREE.Color(base);
  const lighter = col.clone().multiplyScalar(1.08);
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, `#${lighter.getHexString()}`);
  grad.addColorStop(1, base);
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const r = rng(seed);
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(0,0,0,${r() * 0.035})`;
    g.fillRect(r() * 512, r() * 512, 2 + r() * 4, 2 + r() * 4);
  }
  return tex(c);
};

/** A ship-design sketch pinned to a wall: side view of a striped ship on paper. */
export const sketchTexture = (seed: number) => {
  const [c, g] = canvas(512, 360);
  g.fillStyle = "#F6EFDD";
  g.fillRect(0, 0, 512, 360);
  const d = dazzleTexture(seed).image as HTMLCanvasElement;
  g.save();
  g.beginPath();
  g.moveTo(40, 200);
  g.lineTo(470, 200);
  g.lineTo(430, 270);
  g.lineTo(80, 270);
  g.closePath();
  g.moveTo(170, 200);
  g.rect(170, 140, 160, 60);
  g.rect(220, 90, 34, 50);
  g.clip();
  g.drawImage(d, 0, 0, 512, 360);
  g.restore();
  g.strokeStyle = "#1a0f08";
  g.lineWidth = 6;
  g.strokeRect(10, 10, 492, 340);
  g.beginPath();
  g.moveTo(40, 200);
  g.lineTo(470, 200);
  g.lineTo(430, 270);
  g.lineTo(80, 270);
  g.closePath();
  g.stroke();
  g.strokeRect(170, 140, 160, 60);
  g.strokeRect(220, 90, 34, 50);
  return tex(c);
};
