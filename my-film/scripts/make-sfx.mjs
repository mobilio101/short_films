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

// ---------------------------------------------------------------------------
// 8-bit ("chip") versions for pixel-art films: square waves, a 4-bit-style
// noise channel and stepped pitches, like an old games console.
// ---------------------------------------------------------------------------
const sq = (ph, duty = 0.5) => ((ph / (2 * Math.PI)) % 1 < duty ? 1 : -1);
const crush = (v, levels = 16) => Math.round(v * levels) / levels;
let lfsr = 1;
const chipNoise = () => {
  const bit = (lfsr ^ (lfsr >> 1)) & 1;
  lfsr = (lfsr >> 1) | (bit << 14);
  return lfsr & 1 ? 1 : -1;
};
/** Noise channel held at a "rate" in Hz, like a console's noise register. */
const noiseAt = (rate) => {
  let held = 0, acc = 0;
  return () => {
    acc += rate / SR;
    if (acc >= 1) { acc -= 1; held = chipNoise(); }
    return held;
  };
};
/** Play a list of [freq, seconds] notes on a square wave. */
const arp = (notes, duty, decay) => {
  const total = notes.reduce((a, n) => a + n[1], 0);
  const d = buf(total + decay);
  let ph = 0, i = 0;
  let t0 = 0;
  for (const [f, len] of notes) {
    const n = Math.round(len * SR);
    for (let k = 0; k < n && i < d.length; k++, i++) {
      ph += (2 * Math.PI * f) / SR;
      d[i] = sq(ph, duty) * (1 - (k / n) * 0.3);
    }
    t0 += len;
  }
  for (; i < d.length; i++) {
    ph += (2 * Math.PI * notes[notes.length - 1][0]) / SR;
    d[i] = sq(ph, duty) * Math.exp(-(i / SR - t0) / (decay / 3));
  }
  return d.map((v) => crush(v * 0.8));
};

Object.assign(sounds, {
  chip_step() {
    const d = buf(0.05), n = noiseAt(3000);
    d.forEach((_, i) => (d[i] = crush(n() * env(i / SR, 0.001, 0.012))));
    return [d, 0.5];
  },
  chip_click() {
    return [arp([[1760, 0.015], [880, 0.015]], 0.25, 0.01), 0.5];
  },
  chip_hum() {
    const d = buf(2);
    let ph = 0;
    d.forEach((_, i) => { ph += (2 * Math.PI * 110) / SR; d[i] = crush(sq(ph, 0.125)); });
    return [d, 0.12];
  },
  chip_roomtone() {
    // slow two-note bass drone on a triangle-ish stepped wave
    const d = buf(12);
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      const f = Math.floor(t / 1.5) % 2 ? 55 : 49;
      ph += (2 * Math.PI * f) / SR;
      const tri = 2 * Math.abs(2 * ((ph / (2 * Math.PI)) % 1) - 1) - 1;
      d[i] = crush(tri, 8) * 0.6;
    });
    return [d, 0.4];
  },
  chip_whoosh() {
    const d = buf(0.35);
    let acc = 0, held = 0;
    d.forEach((_, i) => {
      const x = i / d.length;
      acc += (800 + 9000 * Math.sin(Math.PI * x)) / SR;
      if (acc >= 1) { acc -= 1; held = chipNoise(); }
      d[i] = crush(held * Math.sin(Math.PI * x));
    });
    return [d, 0.6];
  },
  chip_rumble() {
    // ominous descending minor arpeggio, low pulse wave
    const notes = [196, 185, 174.6, 164.8, 155.6, 146.8, 138.6, 130.8].map((f) => [f / 2, 0.16]);
    return [arp(notes, 0.5, 0.4), 0.8];
  },
  chip_pop() {
    // classic "got it" two-step blip
    return [arp([[988, 0.05], [1319, 0.09]], 0.25, 0.05), 0.6];
  },
  chip_impact() {
    const d = buf(0.7), n = noiseAt(1800);
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (160 * Math.exp(-t * 8) + 40)) / SR;
      d[i] = crush(0.7 * n() * env(t, 0.001, 0.18) + 0.6 * sq(ph) * env(t, 0.001, 0.12));
    });
    return [d, 0.9];
  },
  chip_type() {
    return [arp([[1568, 0.02]], 0.125, 0.01), 0.4];
  },
  chip_shimmer() {
    return [arp([[523, 0.06], [659, 0.06], [784, 0.06], [1047, 0.06], [1319, 0.12]], 0.25, 0.3), 0.45];
  },
  // Old film projector: a fast mechanical tick (24 per second) over a motor whirr, 2 s loop.
  projector() {
    const d = buf(2), f = svf(), g = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const tick = (t * 24) % 1;
      const click = g(white(), 2400, 2).band * Math.exp(-tick / 0.006);
      const motor = f(white(), 400).low * 1.5 + 0.15 * Math.sin(2 * Math.PI * 96 * t);
      d[i] = click * 0.8 + motor * 0.5;
    });
    return [d, 0.5];
  },
});

// ---------------------------------------------------------------------------
// Ghost Army Short: inflatables, machines, paperwork and a crowd.
// ---------------------------------------------------------------------------
Object.assign(sounds, {
  // Air rushing into a balloon: band-passed noise that swells, 0.9 s.
  hiss() {
    const len = 0.9, d = buf(len), f = svf();
    d.forEach((_, i) => {
      const t = i / SR, x = t / len;
      d[i] = f(white(), 2500 + 2500 * x, 1.2).band * Math.sin(Math.PI * Math.min(1, x * 1.1)) ** 0.7;
    });
    return [d, 0.5];
  },
  // Hand pump: two quick "chuff"s.
  pump() {
    const d = buf(0.5), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const e = env(t, 0.01, 0.06) + env(Math.max(0, t - 0.25), 0.01, 0.06) * (t > 0.25 ? 1 : 0);
      d[i] = f(white(), 900, 1).band * e;
    });
    return [d, 0.6];
  },
  // Rubber boing: a pitch that wobbles down, like poking a balloon.
  boing() {
    const d = buf(0.6);
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      const fr = 180 + 120 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * 9 * t) + 60 * Math.exp(-t * 4);
      ph += (2 * Math.PI * fr) / SR;
      d[i] = (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * env(t, 0.005, 0.18);
    });
    return [d, 0.7];
  },
  // Engine roar from a loudspeaker: a rough low growl with a tinny band, 1.6 s.
  engine() {
    const len = 1.6, d = buf(len), f = svf(), g = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR, x = t / len;
      ph += (2 * Math.PI * (55 + 8 * Math.sin(2 * Math.PI * 7 * t))) / SR;
      const growl = Math.tanh(3 * (Math.sin(ph) + 0.5 * Math.sin(2.01 * ph) + 0.3 * f(white(), 400).low));
      d[i] = g(growl, 1400, 0.8).band * Math.min(1, x * 8) * Math.min(1, (1 - x) * 4);
    });
    return [d, 0.8];
  },
  // Radio static with two short beeps, 1.0 s.
  static() {
    const d = buf(1.0), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const crackle = f(white(), 3000, 0.7).band * (0.5 + 0.5 * Math.sin(2 * Math.PI * 13 * t) ** 2);
      const beep = (t > 0.15 && t < 0.25) || (t > 0.32 && t < 0.42) ? 0.6 * Math.sin(2 * Math.PI * 1100 * t) : 0;
      d[i] = 0.6 * crackle + beep;
    });
    return [d, 0.45];
  },
  // Pen scribbling on paper: noisy strokes, 0.8 s.
  scribble() {
    const d = buf(0.8), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const strokes = Math.abs(Math.sin(2 * Math.PI * 6.5 * t)) ** 3;
      d[i] = f(white(), 3500, 1.5).band * strokes;
    });
    return [d, 0.45];
  },
  // Drawer slam: wooden thud plus a rattle.
  slam() {
    const d = buf(0.5), f = svf(), g = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (120 * Math.exp(-t * 10) + 70)) / SR;
      d[i] = Math.sin(ph) * env(t, 0.002, 0.07) + 0.4 * f(white(), 1800, 2).band * env(t, 0.001, 0.12) + 0.2 * g(white(), 5000, 3).band * env(Math.max(0, t - 0.05), 0.001, 0.05);
    });
    return [d, 0.8];
  },
  // Rubber stamp on paper: a short, firm thump.
  stamp() {
    const d = buf(0.3), f = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (160 * Math.exp(-t * 20) + 60)) / SR;
      d[i] = Math.sin(ph) * env(t, 0.001, 0.05) + 0.5 * f(white(), 1200, 1).band * env(t, 0.0005, 0.02);
    });
    return [d, 0.85];
  },
  // Applause: many random claps (short noise bursts) that swell and fade, 2.2 s.
  applause() {
    const len = 2.2, d = buf(len), f = svf();
    const claps = [];
    for (let k = 0; k < 260; k++) claps.push([rnd() * len, 0.4 + rnd() * 0.6, 1500 + rnd() * 2000]);
    claps.forEach(([at, amp]) => {
      const s0 = Math.floor(at * SR);
      for (let j = 0; j < 0.03 * SR && s0 + j < d.length; j++) d[s0 + j] += white() * amp * Math.exp(-j / (0.006 * SR));
    });
    d.forEach((v, i) => {
      const x = i / d.length;
      d[i] = f(v, 2500, 0.7).band * Math.min(1, x * 4) * Math.min(1, (1 - x) * 2.5);
    });
    return [d, 0.55];
  },
  // Oars dipping into water: two soft splashes.
  paddle() {
    const d = buf(1.2), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const e = env(t, 0.03, 0.12) + 0.8 * env(Math.max(0, t - 0.6), 0.03, 0.12) * (t > 0.6 ? 1 : 0);
      d[i] = f(white(), 700 + 900 * Math.exp(-((t % 0.6) * 8)), 1).band * e;
    });
    return [d, 0.5];
  },
});

// ---------------------------------------------------------------------------
// Dragon Jar Short: bronze, palace, crowd, horse, night.
// ---------------------------------------------------------------------------
Object.assign(sounds, {
  // Big bronze gong: inharmonic partials with slow beating, 3 s.
  gong() {
    const d = buf(3);
    const parts = [[110, 1], [167, 0.7], [231, 0.55], [298, 0.4], [415, 0.3], [523, 0.2]];
    d.forEach((_, i) => {
      const t = i / SR;
      let v = 0;
      parts.forEach(([f, a], k) => (v += a * Math.sin(2 * Math.PI * f * (1 + 0.002 * Math.sin(2 * Math.PI * (0.7 + k * 0.3) * t)) * t) * Math.exp(-t / (1.6 - k * 0.15))));
      d[i] = Math.tanh(1.2 * v) * Math.min(1, t / 0.01);
    });
    return [d, 0.8];
  },
  // Metal ball hitting a bronze toad: sharp strike plus bright ringing, 1.6 s.
  clang() {
    const d = buf(1.6), f = svf();
    const parts = [[1180, 1], [2290, 0.6], [3410, 0.45], [4870, 0.3]];
    d.forEach((_, i) => {
      const t = i / SR;
      let v = 0;
      parts.forEach(([fr, a], k) => (v += a * Math.sin(2 * Math.PI * fr * t) * Math.exp(-t / (0.5 - k * 0.08))));
      d[i] = v * 0.7 + f(white(), 5000, 1).high * env(t, 0.0003, 0.008);
    });
    return [d, 1];
  },
  // Toad croak blip: low buzzy pulse train with a pitch bend.
  croak() {
    const d = buf(0.25);
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (140 - 40 * t / 0.25)) / SR;
      const pulse = Math.sin(2 * Math.PI * 28 * t) > 0 ? 1 : 0.3;
      d[i] = Math.tanh(3 * Math.sin(ph)) * pulse * env(t, 0.01, 0.08);
    });
    return [d, 0.5];
  },
  // Crowd laughter: many "ha" bursts (formant-shaped pulses) from different voices, 2.4 s.
  laugh() {
    const len = 2.4, d = buf(len);
    for (let v = 0; v < 9; v++) {
      const f0 = 110 + rnd() * 160, formant = 600 + rnd() * 500, rate = 4.5 + rnd() * 2.5;
      const start = rnd() * 0.4, stop = len - rnd() * 0.5;
      const fl = svf();
      let ph = 0;
      for (let i = Math.floor(start * SR); i < Math.floor(stop * SR); i++) {
        const t = i / SR;
        ph += (2 * Math.PI * f0 * (1 + 0.04 * Math.sin(2 * Math.PI * rate * t))) / SR;
        const gate = Math.max(0, Math.sin(2 * Math.PI * rate * (t - start))) ** 2;
        const src = (ph / (2 * Math.PI)) % 1 < 0.15 ? 1 : -0.15; // glottal-ish pulses
        d[i] += fl(src + 0.3 * white(), formant, 2.5).band * gate * 0.5;
      }
    }
    d.forEach((v, i) => {
      const x = i / d.length;
      d[i] = v * Math.min(1, x * 6) * Math.min(1, (1 - x) * 3);
    });
    return [d, 0.6];
  },
  // Galloping hooves: a four-beat thud pattern, 1.6 s.
  hooves() {
    const d = buf(1.6), f = svf();
    const beats = [];
    for (let c = 0; c < 4; c++) [0, 0.09, 0.2, 0.27].forEach((o) => beats.push(c * 0.4 + o));
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      let v = 0;
      beats.forEach((b) => {
        const dt = t - b;
        if (dt >= 0 && dt < 0.12) v += Math.sin(2 * Math.PI * (90 + 60 * Math.exp(-dt * 40)) * dt) * Math.exp(-dt / 0.03) + 0.4 * white() * Math.exp(-dt / 0.008);
      });
      d[i] = f(v, 1500).low;
    });
    return [d, 0.7];
  },
  // Night crickets: chirp trains, 2 s.
  cricket() {
    const d = buf(2);
    d.forEach((_, i) => {
      const t = i / SR;
      const chirp = (t % 0.5) < 0.12 ? Math.max(0, Math.sin(2 * Math.PI * 30 * t)) : 0;
      d[i] = Math.sin(2 * Math.PI * 4400 * t) * chirp * 0.6;
    });
    return [d, 0.25];
  },
  // Clock tick-tock, 2 s.
  tick() {
    const d = buf(2), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const k = t % 0.5;
      d[i] = f(white(), k < 0.25 ? 3200 : 2400, 4).band * Math.exp(-(k % 0.25) / 0.004);
    });
    return [d, 0.5];
  },
});

// ---------------------------------------------------------------------------
// Garbo Short: farm, money, seaside, vanishing spies.
// ---------------------------------------------------------------------------
Object.assign(sounds, {
  // Chicken clucks: three short nasal pitch-drop blips, 1 s.
  chicken() {
    const d = buf(1.0), fl = svf();
    [0, 0.18, 0.5].forEach((st, k) => {
      let ph = 0;
      const n = Math.floor((k === 2 ? 0.3 : 0.1) * SR);
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        ph += (2 * Math.PI * ((k === 2 ? 900 : 700) - (k === 2 ? 500 : 200) * (t / (n / SR)))) / SR;
        const src = (ph / (2 * Math.PI)) % 1 < 0.2 ? 1 : -0.25;
        d[Math.floor(st * SR) + i] += fl(src, 1600, 3).band * env(t, 0.005, k === 2 ? 0.12 : 0.04);
      }
    });
    return [d, 0.55];
  },
  // Coins: a cascade of short bright metallic pings, 1.2 s.
  coins() {
    const d = buf(1.2);
    for (let k = 0; k < 14; k++) {
      const st = rnd() * 0.9, fr = 2500 + rnd() * 2500;
      for (let i = 0; i < 0.25 * SR && st * SR + i < d.length; i++) {
        const t = i / SR;
        d[Math.floor(st * SR) + i] += (Math.sin(2 * Math.PI * fr * t) + 0.5 * Math.sin(2 * Math.PI * fr * 1.51 * t)) * Math.exp(-t / 0.05) * 0.5;
      }
    }
    return [d, 0.5];
  },
  // Seagull cry: two falling, warbling calls, 1.4 s.
  seagull() {
    const d = buf(1.4), fl = svf();
    [0, 0.55].forEach((st) => {
      let ph = 0;
      for (let i = 0; i < 0.5 * SR; i++) {
        const t = i / SR;
        ph += (2 * Math.PI * (1500 - 700 * (t / 0.5) + 80 * Math.sin(2 * Math.PI * 18 * t))) / SR;
        const src = (ph / (2 * Math.PI)) % 1 < 0.3 ? 1 : -0.4;
        d[Math.floor(st * SR) + i] += fl(src, 2200, 2).band * Math.sin(Math.PI * (t / 0.5));
      }
    });
    return [d, 0.45];
  },
  // Cartoon puff: a quick breathy burst for things vanishing.
  puff() {
    const d = buf(0.35), f = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      d[i] = f(white(), 1200 + 2500 * Math.exp(-t * 12), 1).band * env(t, 0.005, 0.07);
    });
    return [d, 0.5];
  },
});

// ---------------------------------------------------------------------------
// Apollo 13 Short: explosion, alarms, heartbeat, cheering, splashdown.
// ---------------------------------------------------------------------------
Object.assign(sounds, {
  // Deep muffled explosion with a long rumble tail, 2.4 s.
  boom() {
    const d = buf(2.4), f = svf(), g = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (60 * Math.exp(-t * 3) + 28)) / SR;
      const body = Math.sin(ph) * env(t, 0.003, 0.5);
      const crack = f(white(), 2000, 0.7).low * env(t, 0.001, 0.05);
      const rumble = g(white(), 180, 0.8).low * env(t, 0.02, 0.8) * 3;
      d[i] = Math.tanh(2 * (body + 0.8 * crack + rumble));
    });
    return [d, 1];
  },
  // Master alarm: urgent two-tone beeping, 1.6 s.
  alarm() {
    const d = buf(1.6);
    d.forEach((_, i) => {
      const t = i / SR;
      const on = t % 0.4 < 0.3;
      const fr = t % 0.8 < 0.4 ? 1250 : 950;
      d[i] = on ? (Math.sin(2 * Math.PI * fr * t) > 0 ? 0.6 : -0.6) * Math.min(1, (t % 0.4) * 200) : 0;
    });
    return [d, 0.35];
  },
  // Heartbeat: lub-dub pairs, 2.4 s.
  heartbeat() {
    const d = buf(2.4);
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      const k = t % 0.8;
      const e = env(k, 0.005, 0.05) + 0.7 * env(Math.max(0, k - 0.18), 0.005, 0.05) * (k > 0.18 ? 1 : 0);
      ph += (2 * Math.PI * 55) / SR;
      d[i] = Math.sin(ph) * e;
    });
    return [d, 0.9];
  },
  // Crowd cheer: many voices rising, plus scattered claps, 2.6 s.
  cheer() {
    const len = 2.6, d = buf(len);
    for (let v = 0; v < 12; v++) {
      const f0 = 160 + rnd() * 220, formant = 700 + rnd() * 600;
      const fl = svf();
      let ph = 0;
      for (let i = 0; i < d.length; i++) {
        const t = i / SR;
        ph += (2 * Math.PI * f0 * (1 + 0.15 * (t / len) + 0.02 * Math.sin(2 * Math.PI * (3 + v) * t))) / SR;
        const src = (ph / (2 * Math.PI)) % 1 < 0.2 ? 1 : -0.2;
        d[i] += fl(src + 0.4 * white(), formant, 2).band * 0.25;
      }
    }
    for (let k = 0; k < 120; k++) {
      const s0 = Math.floor(rnd() * len * SR);
      for (let j = 0; j < 0.02 * SR && s0 + j < d.length; j++) d[s0 + j] += white() * 0.5 * Math.exp(-j / (0.004 * SR));
    }
    d.forEach((v, i) => {
      const x = i / d.length;
      d[i] = v * Math.min(1, x * 3) * Math.min(1, (1 - x) * 3);
    });
    return [d, 0.6];
  },
  // Big splash: water burst with a low thump, 1.4 s.
  splash() {
    const d = buf(1.4), f = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (80 * Math.exp(-t * 6) + 40)) / SR;
      d[i] = 0.8 * Math.sin(ph) * env(t, 0.003, 0.12) + f(white(), 1500 + 1500 * Math.exp(-t * 3), 0.7).band * env(t, 0.01, 0.4) * 1.4;
    });
    return [d, 0.8];
  },
});

// Ship sounds for the 3D-world style test.
Object.assign(sounds, {
  // Sea outside the hull: slow swells of filtered noise, 12 s (loops smoothly).
  waves() {
    const len = 12, d = buf(len), f = svf(), g = svf();
    d.forEach((_, i) => {
      const t = i / SR;
      const swell = 0.55 + 0.45 * Math.sin((2 * Math.PI * t) / 4) * Math.sin((2 * Math.PI * t) / 6 + 1);
      const n = white();
      d[i] = f(n, 380 + 300 * swell, 0.5).low * (0.4 + 0.8 * swell) + g(n, 2400, 0.6).band * 0.12 * swell * swell;
    });
    // crossfade the tail into the head so it loops without a seam
    const x = Math.round(0.5 * SR);
    for (let i = 0; i < x; i++) {
      const a = i / x;
      d[i] = d[i] * a + d[d.length - x + i] * (1 - a);
    }
    return [d.slice(0, d.length - x), 0.7];
  },
  // Wooden hull creak: a slow, rough tone wandering in pitch through a bandpass, 1.2 s.
  creak() {
    const d = buf(1.2), f = svf();
    let ph = 0;
    d.forEach((_, i) => {
      const t = i / SR;
      const hz = 95 + 40 * Math.sin(t * 5) + 25 * Math.sin(t * 17);
      ph += (2 * Math.PI * hz) / SR;
      const saw = ((ph / (2 * Math.PI)) % 1) * 2 - 1;
      const grit = rnd() < 0.02 ? white() * 2 : 0;
      d[i] = f(saw + grit, 700 + 300 * Math.sin(t * 9), 3).band * Math.min(1, t * 8) * Math.min(1, (1.2 - t) * 4);
    });
    return [d, 0.55];
  },
  // Sunglasses landing back on the nose: a bright little clink, 0.3 s.
  clink() {
    const d = buf(0.3);
    d.forEach((_, i) => {
      const t = i / SR;
      d[i] = (Math.sin(2 * Math.PI * 2600 * t) + 0.6 * Math.sin(2 * Math.PI * 3900 * t) + 0.3 * Math.sin(2 * Math.PI * 5400 * t)) * env(t, 0.001, 0.06);
    });
    return [d, 0.6];
  },
});

console.log(`Writing sound effects to ${OUT}`);
for (const [name, make] of Object.entries(sounds)) {
  const [data, gain] = make();
  writeWav(name, data, gain);
}
