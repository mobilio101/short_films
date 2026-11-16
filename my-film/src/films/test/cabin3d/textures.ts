// Textures for the 3D cabin, painted in code on a canvas (no images, no downloads).
import * as THREE from "three";

/** Small seeded random so every render paints exactly the same texture. */
export const rng = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
};

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d") as CanvasRenderingContext2D] as const;
};

const toTexture = (c: HTMLCanvasElement, repeat: [number, number] = [1, 1]) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
};

const shade = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
};

/**
 * Wooden planks. Planks run along the canvas width; `planks` is how many fit across the height.
 * Each plank gets its own tone, grain streaks, a few knots, nail dots and a dark ink seam.
 */
export const woodTexture = (opts: { base: string; planks: number; seed: number; repeat?: [number, number]; vertical?: boolean }) => {
  const [c, g] = canvas(1024, 1024);
  const r = rng(opts.seed);
  const ph = 1024 / opts.planks;
  for (let i = 0; i < opts.planks; i++) {
    const y = i * ph;
    const tone = 0.86 + r() * 0.24;
    g.fillStyle = shade(opts.base, tone);
    g.fillRect(0, y, 1024, ph);
    // Soft painted light along the top of each plank.
    const grad = g.createLinearGradient(0, y, 0, y + ph);
    grad.addColorStop(0, "rgba(255,230,190,0.10)");
    grad.addColorStop(1, "rgba(40,20,5,0.12)");
    g.fillStyle = grad;
    g.fillRect(0, y, 1024, ph);
    // Grain.
    for (let k = 0; k < 9; k++) {
      g.strokeStyle = `rgba(60,30,10,${0.08 + r() * 0.1})`;
      g.lineWidth = 1 + r() * 2;
      g.beginPath();
      const gy = y + 4 + r() * (ph - 8);
      g.moveTo(0, gy);
      for (let x = 0; x <= 1024; x += 64) g.lineTo(x, gy + Math.sin(x / 90 + k + i) * 2.5 + (r() - 0.5) * 2);
      g.stroke();
    }
    // Knots.
    if (r() < 0.6) {
      const kx = r() * 1024;
      const ky = y + ph * (0.3 + r() * 0.4);
      for (let ring = 3; ring >= 1; ring--) {
        g.strokeStyle = `rgba(55,28,10,${0.18 + 0.1 * ring})`;
        g.lineWidth = 2;
        g.beginPath();
        g.ellipse(kx, ky, 10 * ring, 4 * ring, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }
    // Butt joint and nails.
    const jx = r() * 1024;
    g.fillStyle = "rgba(25,12,5,0.7)";
    g.fillRect(jx, y, 3, ph);
    g.fillStyle = "rgba(20,10,5,0.75)";
    for (const nx of [jx - 14, jx + 17]) {
      g.beginPath();
      g.arc(nx, y + ph * 0.3, 3, 0, Math.PI * 2);
      g.arc(nx, y + ph * 0.7, 3, 0, Math.PI * 2);
      g.fill();
    }
    // Ink seam between planks.
    g.fillStyle = "#1a0f08";
    g.fillRect(0, y, 1024, 4);
  }
  if (opts.vertical) {
    const [c2, g2] = canvas(1024, 1024);
    g2.translate(512, 512);
    g2.rotate(Math.PI / 2);
    g2.drawImage(c, -512, -512);
    return toTexture(c2, opts.repeat);
  }
  return toTexture(c, opts.repeat);
};

/** An old sea chart: parchment, a coastline, islands, a compass rose and a red route. */
export const chartTexture = (seed: number) => {
  const [c, g] = canvas(1024, 768);
  const r = rng(seed);
  g.fillStyle = "#EAD9B0";
  g.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(120,80,30,${r() * 0.07})`;
    g.fillRect(r() * 1024, r() * 768, 2 + r() * 6, 2 + r() * 6);
  }
  const edge = g.createRadialGradient(512, 384, 250, 512, 384, 640);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(110,60,15,0.45)");
  g.fillStyle = edge;
  g.fillRect(0, 0, 1024, 768);
  // Coastline.
  g.fillStyle = "#D2BC86";
  g.strokeStyle = "#2a1a0c";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(0, 120);
  for (let x = 0; x <= 520; x += 40) g.lineTo(x, 120 + Math.sin(x / 70) * 50 + r() * 30 + x * 0.35);
  g.lineTo(380, 768);
  g.lineTo(0, 768);
  g.closePath();
  g.fill();
  g.stroke();
  // Islands.
  for (const [ix, iy, s] of [
    [700, 220, 50],
    [820, 300, 30],
    [760, 520, 40],
  ] as const) {
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.5) {
      const rr = s * (0.75 + r() * 0.45);
      g.lineTo(ix + Math.cos(a) * rr, iy + Math.sin(a) * rr * 0.7);
    }
    g.closePath();
    g.fill();
    g.stroke();
  }
  // Grid lines.
  g.strokeStyle = "rgba(60,40,20,0.25)";
  g.lineWidth = 2;
  for (let x = 128; x < 1024; x += 128) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 768);
    g.stroke();
  }
  for (let y = 128; y < 768; y += 128) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
  // Compass rose.
  g.save();
  g.translate(880, 640);
  g.fillStyle = "#2a1a0c";
  for (let i = 0; i < 4; i++) {
    g.rotate(Math.PI / 2);
    g.beginPath();
    g.moveTo(0, -70);
    g.lineTo(12, 0);
    g.lineTo(-12, 0);
    g.closePath();
    g.fill();
  }
  g.restore();
  // Dashed red route and an X.
  g.strokeStyle = "#C21F33";
  g.lineWidth = 7;
  g.setLineDash([22, 16]);
  g.beginPath();
  g.moveTo(330, 360);
  g.bezierCurveTo(480, 250, 600, 470, 740, 500);
  g.stroke();
  g.setLineDash([]);
  g.lineWidth = 9;
  g.beginPath();
  g.moveTo(745, 495);
  g.lineTo(785, 535);
  g.moveTo(785, 495);
  g.lineTo(745, 535);
  g.stroke();
  // Ink border.
  g.strokeStyle = "#2a1a0c";
  g.lineWidth = 10;
  g.strokeRect(14, 14, 996, 740);
  return toTexture(c);
};

/** The night outside the porthole: deep blue sky, moon with rings, stars, and a moonlit sea. */
export const nightTexture = () => {
  const [c, g] = canvas(512, 512);
  const sky = g.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, "#14234A");
  sky.addColorStop(1, "#3B5C8C");
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 300);
  const r = rng(7);
  g.fillStyle = "#FFFFFF";
  for (let i = 0; i < 40; i++) g.fillRect(r() * 512, r() * 240, 2, 2);
  for (const [rad, a] of [
    [80, 0.08],
    [55, 0.12],
  ] as const) {
    g.fillStyle = `rgba(255,248,220,${a})`;
    g.beginPath();
    g.arc(330, 150, rad, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#FFF6D8";
  g.beginPath();
  g.arc(330, 150, 34, 0, Math.PI * 2);
  g.fill();
  const sea = g.createLinearGradient(0, 300, 0, 512);
  sea.addColorStop(0, "#1D3A63");
  sea.addColorStop(1, "#0E1F3A");
  g.fillStyle = sea;
  g.fillRect(0, 300, 512, 212);
  g.strokeStyle = "rgba(255,246,216,0.6)";
  g.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const y = 315 + i * 12;
    g.beginPath();
    g.moveTo(330 - 20 - i * 8, y);
    g.lineTo(330 + 20 + i * 8, y);
    g.stroke();
  }
  return toTexture(c);
};

/** A soft round glow for light halos (lantern, candle). */
export const glowTexture = (color: string) => {
  const [c, g] = canvas(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  const col = new THREE.Color(color);
  const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  grad.addColorStop(0, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.25, `rgba(${rgb},0.35)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Soft dark blob used as a contact shadow under the flat characters. */
export const blobTexture = () => {
  const [c, g] = canvas(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.75)");
  grad.addColorStop(0.6, "rgba(0,0,0,0.35)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

/** A woven rug: deep blue field, cream border, red diamonds. */
export const rugTexture = () => {
  const [c, g] = canvas(1024, 640);
  g.fillStyle = "#3D74AD";
  g.fillRect(0, 0, 1024, 640);
  const r = rng(77);
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(0,0,0,${r() * 0.08})`;
    g.fillRect(r() * 1024, r() * 640, 3, 2);
  }
  g.strokeStyle = "#EBD9AE";
  g.lineWidth = 26;
  g.strokeRect(40, 40, 944, 560);
  g.strokeStyle = "#C21F33";
  g.lineWidth = 10;
  g.strokeRect(80, 80, 864, 480);
  g.fillStyle = "#EBD9AE";
  for (const [x, y, s] of [
    [512, 320, 110],
    [270, 320, 60],
    [754, 320, 60],
  ] as const) {
    g.beginPath();
    g.moveTo(x, y - s);
    g.lineTo(x + s, y);
    g.lineTo(x, y + s);
    g.lineTo(x - s, y);
    g.closePath();
    g.fill();
    g.fillStyle = "#C21F33";
    g.beginPath();
    g.moveTo(x, y - s * 0.5);
    g.lineTo(x + s * 0.5, y);
    g.lineTo(x, y + s * 0.5);
    g.lineTo(x - s * 0.5, y);
    g.closePath();
    g.fill();
    g.fillStyle = "#EBD9AE";
  }
  // Fringe.
  g.strokeStyle = "#EBD9AE";
  g.lineWidth = 4;
  for (let x = 10; x < 1024; x += 16) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 22);
    g.moveTo(x, 618);
    g.lineTo(x, 640);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Bright daytime view outside the porthole: blue sky, clouds, sun, turquoise sea. */
export const dayTexture = () => {
  const [c, g] = canvas(512, 512);
  const sky = g.createLinearGradient(0, 0, 0, 290);
  sky.addColorStop(0, "#3E9BF2");
  sky.addColorStop(1, "#A9DCFF");
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 290);
  g.fillStyle = "#FFF4C2";
  g.beginPath();
  g.arc(360, 120, 46, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#FFFFFF";
  for (const [x, y, s] of [
    [140, 110, 1],
    [250, 190, 0.7],
  ] as const) {
    for (const [dx, dy, r] of [
      [0, 0, 36],
      [34, -12, 30],
      [64, 4, 26],
      [-30, 8, 24],
    ] as const) {
      g.beginPath();
      g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
      g.fill();
    }
  }
  const sea = g.createLinearGradient(0, 290, 0, 512);
  sea.addColorStop(0, "#1FB5C9");
  sea.addColorStop(1, "#0C7FA8");
  g.fillStyle = sea;
  g.fillRect(0, 290, 512, 222);
  g.strokeStyle = "rgba(255,255,255,0.8)";
  g.lineWidth = 4;
  for (let i = 0; i < 7; i++) {
    const y = 315 + i * 26;
    g.beginPath();
    g.moveTo(40 + (i % 2) * 60, y);
    g.quadraticCurveTo(80 + (i % 2) * 60, y - 8, 120 + (i % 2) * 60, y);
    g.moveTo(300 - (i % 2) * 40, y + 10);
    g.quadraticCurveTo(340 - (i % 2) * 40, y + 2, 380 - (i % 2) * 40, y + 10);
    g.stroke();
  }
  return toTexture(c);
};
