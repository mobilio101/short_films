// Generates every sound effect for the channel from pure maths (oscillators,
// noise and filters). No samples, no downloads: the output is 100% our own,
// so it is safe to use on YouTube with no copyright claims.
//
// Run:  npm run sfx      -> writes WAV files into public/sfx/
import fs from "node:fs";
import path from "node:path";

const SR = 44100;
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "public", "sfx");
fs.mkdirSync(OUT, { recursive: true });

// Deterministic random so files are identical every time we regenerate.
let seed = 12345;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const white = () => rnd() * 2 - 1;

const buf = (sec) => new Float32Array(Math.round(sec * SR));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d)); // attack, exp decay

// Chamberlin state-variable filter (low/band/high pass).
const svf = () => {
  let low = 0, band = 0;
  return (x, cutoff, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(cutoff, SR / 6)) / SR);
    low += f * band;
    const high = x - low - (1 / q) * band;
    band += f * high;
    return { low, band, high };
  };
};

const writeWav = (name, data, gain = 1) => {
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  const norm = peak > 0 ? (0.89 * gain) / peak : 0; // normalise to about -1 dBFS * gain
  const b = Buffer.alloc(44 + data.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + data.length * 2, 4); b.write("WAVE", 8);
  b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => {
    // short fade at both ends to avoid clicks
    const edge = Math.min(1, i / 64, (data.length - 1 - i) / 64);
    b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * norm * edge)) * 32767), 44 + i * 2);
  });
  fs.writeFileSync(path.join(OUT, `${name}.wav`), b);
  console.log(`  ${name}.wav  ${(data.length / SR).toFixed(2)}s`);
};

const sounds = {
  // Soft footstep: falling low thump + a little scuff of filtered noise.
  step() {
    const d = buf(0.18), f = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (95 - 45 * Math.min(1, t / 0.08))) / SR;
      d[i] = Math.sin(ph) * env(t, 0.003, 0.035) + f(white(), 1800).band * 0.5 * env(t, 0.001, 0.015);
    });
    return [d, 0.6];
  },
  // Light switch: tight double click.
  click() {
    const d = buf(0.12), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const e = env(t, 0.0005, 0.004) + 0.6 * env(Math.max(0, t - 0.035), 0.0005, 0.005) * (t > 0.035 ? 1 : 0);
      d[i] = f(white(), 4500, 2).band * e;
    });
    return [d, 0.7];
  },
  // Electric lamp hum once it's on (warm 50 Hz buzz with harmonics), 2 s.
  hum() {
    const d = buf(2);
    d.forEach((_, i) => {
      const t = i / SR;
      d[i] = (Math.sin(2 * Math.PI * 100 * t) + 0.4 * Math.sin(2 * Math.PI * 200 * t) + 0.15 * Math.sin(2 * Math.PI * 300 * t)) * (0.9 + 0.1 * Math.sin(2 * Math.PI * 3 * t));
    });
    return [d, 0.25];
  },
  // Dark room tone: brown noise + very low drone, 12 s.
  roomtone() {
    const d = buf(12), f = svf();
    let brown = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      brown = (brown + 0.02 * white()) * 0.995;
      d[i] = f(brown, 300).low * 3 + 0.25 * Math.sin(2 * Math.PI * 48 * t) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 0.15 * t));
    });
    return [d, 0.5];
  },
  // Whoosh: noise through a band-pass that sweeps up then down.
  whoosh() {
    const len = 0.6, d = buf(len), f = svf();
    d.forEach((_, i) => {
      const t = i / SR, x = t / len;
      const cutoff = 300 + 3500 * Math.sin(Math.PI * x);
      d[i] = f(white(), cutoff, 1.5).band * Math.sin(Math.PI * x) ** 2;
    });
    return [d, 0.8];
  },
  // Shadow appears: deep sub swell + dark noise, slowly rising.
  rumble() {
    const len = 1.8, d = buf(len), f = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR, x = t / len;
      ph += (2 * Math.PI * (38 + 10 * x)) / SR;
      const shape = Math.sin(Math.PI * Math.min(1, x * 1.3)) ** 1.5;
      d[i] = (Math.sin(ph) + 0.5 * Math.sin(ph * 1.5) + f(white(), 220 + 300 * x, 1).low * 2) * shape;
    });
    return [d, 0.9];
  },
  // Rep pop: bright pitch-up blip.
  pop() {
    const d = buf(0.16);
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (420 + 900 * Math.min(1, t / 0.05))) / SR;
      d[i] = (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * env(t, 0.002, 0.04);
    });
    return [d, 0.7];
  },
  // Big hit: low boom + noise crack + short tail.
  impact() {
    const d = buf(1.2), f = svf(), g = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (70 * Math.exp(-t * 4) + 32)) / SR;
      const boom = Math.sin(ph) * env(t, 0.002, 0.28);
      const crack = f(white(), 3000, 0.8).high * env(t, 0.0005, 0.02);
      const tail = g(white(), 600).low * env(t, 0.01, 0.25) * 1.5;
      d[i] = Math.tanh(1.8 * (boom + 0.6 * crack + 0.4 * tail));
    });
    return [d, 1];
  },
  // Typewriter-style letter tick for the title card.
  type() {
    const d = buf(0.06), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      d[i] = f(white(), 2600, 3).band * env(t, 0.0005, 0.006) + 0.3 * Math.sin(2 * Math.PI * 1200 * t) * env(t, 0.0005, 0.01);
    });
    return [d, 0.55];
  },
  // Soft shimmer for the underline: a few bell-like partials.
  shimmer() {
    const d = buf(1.4);
    const notes = [523.25, 659.25, 783.99, 1046.5];
    d.forEach((_, i) => {
      const t = i / SR;
      let v = 0;
      notes.forEach((n, k) => {
        const tt = t - k * 0.07;
        if (tt > 0) v += Math.sin(2 * Math.PI * n * tt) * env(tt, 0.01, 0.35) * (1 - k * 0.15);
      });
      d[i] = v;
    });
    return [d, 0.45];
  },
};

console.log(`Writing sound effects to ${OUT}`);
for (const [name, make] of Object.entries(sounds)) {
  const [data, gain] = make();
  writeWav(name, data, gain);
}
