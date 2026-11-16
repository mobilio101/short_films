// "Dazzle Ships": the new channel's first Short. 3D worlds (Three.js) with flat 2D Toon characters,
// cut to the ElevenLabs Brian voice-over. Plan and sources: STORY.md in this folder.
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
import * as THREE from "three";
import { makeCues } from "../../components/shortkit";
import { Brush, CAST, INK, Look, MAIN, POP, PaintRoller, Toon } from "../../characters/toon/Toon";
import { Cam, ContactShadow, Daylight, Project, World3D, lerpCam, placeToon, v3 } from "../../world3d/kit";
import { Crates, Dock, Foam, SeaAndSky, Ship, Studio, SubRoom } from "./sets";
import { WORDS } from "./words";

const { fontFamily: LILITA } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

const FPS = 30;
const { cue, end } = makeCues(WORDS, FPS);
export const DAZZLE_DURATION = end + 30;
const DIS = 8; // dissolve length in frames

// ---- Shot boundaries, cut to the voice ----
const S = {
  s1: 0,
  s2a: cue("German"),
  s2b: cue("And you can't"),
  s3: cue("So a painter"),
  s4: cue("The Navy thought"),
  s5: cue("So Wilkinson"),
  s6a: cue("You see"),
  s6b: cue("He had to"),
  s7: cue("So Britain painted"),
  s8a: cue("Even the"),
  s8b: cue("But sailors"),
  s9: cue("The paint job"),
};

// ---- Cast ----
const WILK: Look = { ...MAIN, shirt: POP.white, pattern: "splatter", patternColor: POP.red, hat: "captain", hatColor: POP.blue, hatColor2: POP.white };
const KING: Look = { head: "square", skin: POP.skin, hair: "#6B4A2B", hairStyle: "flat", shirt: POP.red, pattern: "buttons", patternColor: POP.yellow, shoes: INK, hat: "crown", hatColor: POP.red, beard: "#6B4A2B" };
const BRASS: Look = { head: "square", skin: POP.skin2, hair: "#3B2618", hairStyle: "flat", shirt: "#22315A", pattern: "buttons", patternColor: POP.yellow, shoes: INK, hat: "captain", hatColor: "#22315A", hatColor2: "#22315A" };
const BRASS2: Look = { ...BRASS, skin: POP.skin3, head: "square" };
const BRASS3: Look = { ...BRASS, skin: POP.skin, beard: "#9A9A9A" };
const UCAP: Look = { head: "triangle", skin: POP.skin, hair: "#1B1B1B", hairStyle: "spiky", shirt: "#3A3F45", pattern: "pinstripe", patternColor: "#555C63", shoes: INK, hat: "cap", hatColor: "#2B2F33", hatColor2: "#555C63" };
const SAILOR1: Look = { ...CAST.squareCaptain, head: "round", hat: "beanie", hatColor: "#22315A", hatColor2: POP.white };
const SAILOR2: Look = { ...CAST.squareCaptain, head: "square", skin: POP.skin3, hat: "beanie", hatColor: POP.red, hatColor2: POP.white };
const SAILOR3: Look = { ...CAST.squareCaptain, head: "triangle", skin: POP.skin2, hat: "bucket", hatColor: POP.white, hatColor2: POP.blue };

// ---- Helpers ----
const useLocal = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { f, pop: (at: number, damping = 9) => spring({ frame: f - at, fps, config: { damping, stiffness: 220 } }) };
};
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

/** A shot that dissolves in over the previous one. Frames inside are local to the shot. */
const Shot: React.FC<{ from: number; to: number; first?: boolean; children: React.ReactNode }> = ({ from, to, first, children }) => {
  const Inner: React.FC = () => {
    const f = useCurrentFrame();
    const o = first ? 1 : interpolate(f, [0, DIS], [0, 1], { extrapolateRight: "clamp" });
    return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
  };
  return (
    <Sequence from={from} durationInFrames={to - from + DIS}>
      <Inner />
    </Sequence>
  );
};

/** A pop-up tag (white card, black outline) at a screen position. */
const Tag: React.FC<{ text: string; x: number; y: number; at: number; out?: number; color?: string; size?: number; rotate?: number }> = ({ text, x, y, at, out = 9999, color = POP.white, size = 70, rotate = -4 }) => {
  const { f, pop } = useLocal();
  if (f < at || f > out) return null;
  const s = pop(at, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${s}) rotate(${rotate}deg)`,
        background: color,
        border: `8px solid ${INK}`,
        borderRadius: 22,
        padding: "10px 30px 6px",
        fontFamily: LILITA,
        fontSize: size,
        color: color === POP.white || color === POP.yellow ? INK : POP.white,
        boxShadow: `10px 10px 0 ${INK}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** Captions: one or two words at a time, white with a thick black outline, in the middle of the screen. */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const ms = (f / FPS) * 1000;
  const chunks: { text: string; start: number; end: number }[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const brk = /[.,?!]$/.test(w.text) || cur.length >= 2 || i === WORDS.length - 1;
    if (brk) {
      chunks.push({ text: cur.map((c) => c.text).join(" "), start: cur[0].startMs, end: cur[cur.length - 1].endMs });
      cur = [];
    }
  });
  const idx = chunks.findIndex((c, i) => ms >= c.start && (i === chunks.length - 1 ? ms <= c.end + 400 : ms < chunks[i + 1].start));
  if (idx < 0) return null;
  const c = chunks[idx];
  const age = ms - c.start;
  const s = interpolate(age, [0, 90], [0.85, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1400, display: "flex", justifyContent: "center", transform: `scale(${s})` }}>
      <span
        style={{
          fontFamily: LILITA,
          fontSize: 104,
          color: POP.white,
          WebkitTextStroke: `16px ${INK}`,
          paintOrder: "stroke fill",
          textTransform: "uppercase",
          letterSpacing: 2,
          textShadow: `0 8px 0 ${INK}`,
        }}
      >
        {c.text.replace(/[.,]$/, "")}
      </span>
    </div>
  );
};

/** The view through a periscope: black mask with a round window, crosshair and scale marks. */
const Periscope: React.FC = () => {
  const f = useCurrentFrame();
  const sx = Math.sin(f / 20) * 10;
  const sy = Math.cos(f / 27) * 6;
  const cx = 540 + sx, cy = 860 + sy, r = 470;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <path d={`M0,0 H1080 V1920 H0 Z M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`} fill="#0B0F12" fillRule="evenodd" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2B3238" strokeWidth={26} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={INK} strokeWidth={5} opacity={0.75} />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={INK} strokeWidth={5} opacity={0.75} />
        {Array.from({ length: 13 }, (_, i) => -6 + i).map((k) => (
          <line key={k} x1={cx + k * 34} y1={cy - (k % 2 ? 12 : 22)} x2={cx + k * 34} y2={cy + (k % 2 ? 12 : 22)} stroke={INK} strokeWidth={4} opacity={0.75} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Sparkle: React.FC<{ x: number; y: number; at: number; size?: number }> = ({ x, y, at, size = 40 }) => {
  const f = useCurrentFrame();
  const t = (f - at) / 14;
  if (t < 0 || t > 1) return null;
  const s = Math.sin(t * Math.PI) * size;
  return <path d={`M${x},${y - s} L${x + s * 0.25},${y - s * 0.25} L${x + s},${y} L${x + s * 0.25},${y + s * 0.25} L${x},${y + s} L${x - s * 0.25},${y + s * 0.25} L${x - s},${y} L${x - s * 0.25},${y - s * 0.25} Z`} fill={POP.white} stroke={INK} strokeWidth={4} />;
};

/** Draw a Toon standing at a 3D spot. */
const At: React.FC<{ project: Project; at: THREE.Vector3; look: Look; id: string; h?: number } & Omit<React.ComponentProps<typeof Toon>, "x" | "y" | "scale" | "look" | "id">> = ({ project, at, look, id, h = 1.6, ...rest }) => {
  const p = placeToon(project, at, h);
  return <Toon id={id} x={p.x} y={p.y} scale={p.scale} look={look} {...rest} />;
};

// =========================== SHOTS ===========================

/** 1 · Hook: a dazzle ship slides past the dock; Wilkinson with his paint roller. */
const Shot1: React.FC = () => {
  const { f } = useLocal();
  const k = ease(f, 0, S.s2a - S.s1);
  const cam = lerpCam({ pos: v3(1.4, 1.8, 12.5), target: v3(0, 2.2, -1), fov: 50 }, { pos: v3(0.8, 1.6, 11.2), target: v3(0, 2.1, -1), fov: 50 }, k);
  const shipX = interpolate(f, [0, 170], [-8, 1.5]);
  const wilk = v3(-0.35, 0.6, 3.7);
  return (
    <World3D
      cam={cam}
      bg="#CFEBFF"
      fog={["#CFEBFF", 30, 160]}
      back={
        <>
          <Daylight />
          <SeaAndSky frame={f} />
          <Ship paint={12} position={[shipX, 0, -3]} frame={f} smoke />
          <Foam position={[shipX, 0, -3]} size={[7.4, 1.8]} frame={f} />
          <Dock />
          <ContactShadow at={wilk} size={1.0} />
        </>
      }
      front={<Crates position={[2.0, 0.6, 8.6]} rotation={0.4} />}
      chars={(p) => <At project={p} at={wilk} look={WILK} id="w1" expr="sneaky" gaze={10} holding={<PaintRoller />} handR={[160, -330]} />}
    />
  );
};

/** 2a · Through a U-boat periscope: a grey ship is hit (smoke and a splash, nothing graphic). */
const Shot2a: React.FC = () => {
  const { f } = useLocal();
  const hit = cue("sinking") - S.s2a;
  const cam: Cam = { pos: v3(-2 + f * 0.004, 0.7, 12), target: v3(0, 1.8, -45), fov: 32 };
  const t = Math.max(0, f - hit);
  return (
    <AbsoluteFill>
      <World3D
        cam={cam}
        bg="#CFEBFF"
        fog={["#CFEBFF", 40, 160]}
        backBlur={1.2}
        back={
          <>
            <Daylight />
            <SeaAndSky frame={f} />
            <Ship paint="grey" position={[0, -Math.min(0.9, t * 0.006), -45]} rotation={[0, 0.35, Math.min(0.12, t * 0.0012)]} frame={f} smoke />
            {t > 0 && (
              <>
                <mesh position={[1.5, interpolate(t, [0, 10, 40], [0, 2.4, 1.6], { extrapolateRight: "clamp" }), -43]} scale={[0.7, interpolate(t, [0, 10, 40], [0.3, 2.2, 1.2], { extrapolateRight: "clamp" }), 0.7]}>
                  <sphereGeometry args={[1, 16, 12]} />
                  <meshStandardMaterial color="#FFFFFF" transparent opacity={interpolate(t, [0, 30, 60], [1, 0.9, 0], { extrapolateRight: "clamp" })} />
                </mesh>
                {[0, 1, 2, 3].map((i) => (
                  <mesh key={i} position={[0.5 - i * 0.5, 3 + ((t / 18 + i * 0.6) % 4), -45]} scale={1 + ((t / 18 + i * 0.6) % 4) * 0.6}>
                    <sphereGeometry args={[1, 12, 10]} />
                    <meshStandardMaterial color="#5A5F66" transparent opacity={0.7} />
                  </mesh>
                ))}
              </>
            )}
          </>
        }
      />
      <Periscope />
    </AbsoluteFill>
  );
};

/** 2b · "You can't hide a ship on the open sea": an admiral on the dock, grey ships in plain sight. */
const Shot2b: React.FC = () => {
  const { f } = useLocal();
  const k = ease(f, 0, S.s3 - S.s2b);
  const cam = lerpCam({ pos: v3(-0.6, 1.6, 10.6), target: v3(0, 2.0, -1), fov: 50 }, { pos: v3(-0.2, 1.5, 9.8), target: v3(0, 2.0, -1), fov: 50 }, k);
  const adm = v3(0, 0.6, 4.4);
  return (
    <World3D
      cam={cam}
      bg="#CFEBFF"
      fog={["#CFEBFF", 30, 160]}
      back={
        <>
          <Daylight />
          <SeaAndSky frame={f} />
          <Ship paint="grey" position={[-3, 0, -8]} rotation={[0, 0.15, 0]} frame={f} smoke />
          <Ship paint="grey" position={[7, 0, -18]} rotation={[0, -0.25, 0]} frame={f + 30} smoke />
          <Dock />
          <ContactShadow at={adm} />
        </>
      }
      front={<Crates position={[-2.2, 0.6, 8.4]} rotation={-0.3} />}
      chars={(p) => <At project={p} at={adm} look={BRASS3} id="adm" expr={f > 25 ? "panic" : "neutral"} armsUp={f > 25 ? 0.4 : 0} />}
    />
  );
};

const studioCam = (f: number, a: Cam, b: Cam, len: number) => lerpCam(a, b, ease(f, 0, len));

/** 3 · The studio: Wilkinson's "ridiculous idea", then three patterns pop up beside him. */
const Shot3: React.FC = () => {
  const { f } = useLocal();
  const len = S.s4 - S.s3;
  const cam = studioCam(f, { pos: v3(0.9, 1.25, 4.3), target: v3(0.2, 1.3, -1), fov: 60 }, { pos: v3(0.4, 1.15, 3.2), target: v3(0.1, 1.25, -1), fov: 60 }, len);
  const wilk = v3(0.15, 0, -0.1);
  const confuse = cue("confuse") - S.s3;
  return (
    <World3D
      cam={cam}
      bg="#F2D6A2"
      fog={["#F6E4C2", 6, 20]}
      back={
        <>
          <Daylight sun={[3, 8, -6]} amb={1.1} />
          <Studio frame={f} />
          <ContactShadow at={wilk} />
        </>
      }
      front={
        <group position={[-1.2, 0, 2.6]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 1, 18]} />
            <meshStandardMaterial color="#2D7FF9" />
          </mesh>
        </group>
      }
      chars={(p) => (
        <At
          project={p}
          at={wilk}
          look={WILK}
          id="w3"
          expr="sneaky"
          gaze={10}
          holding={<Brush color={f > cue("Blue") - S.s3 ? POP.blue : f > cue("White") - S.s3 ? POP.white : POP.red} />}
          handR={f > confuse ? [170, -470 - 30 * Math.sin(Math.min(1, (f - confuse) / 8) * Math.PI)] : [150, -230]}
        />
      )}
    />
  );
};

/** Pattern swatches that pop up during shot 3 (2D cards over the picture). */
const Swatch: React.FC<{ kind: "stripes" | "zigzag" | "swirl"; x: number; y: number; at: number }> = ({ kind, x, y, at }) => {
  const { f, pop } = useLocal();
  if (f < at) return null;
  const s = pop(at, 8);
  const id = `sw-${kind}`;
  let body: React.ReactNode;
  if (kind === "stripes") body = [0, 1, 2, 3, 4].map((i) => <rect key={i} x={-130 + i * 60} y={-200} width={30} height={400} fill={INK} transform="rotate(25)" />);
  else if (kind === "zigzag")
    body = [-60, 30].map((y0) => <path key={y0} d={`M-140,${y0} ${Array.from({ length: 10 }, (_, i) => `L${-140 + (i + 1) * 30},${y0 + (i % 2 ? 0 : 28)}`).join(" ")}`} fill="none" stroke={INK} strokeWidth={22} />);
  else body = [70, 45, 20].map((r, i) => <circle key={r} cx={-10} cy={10} r={r} fill="none" stroke={i % 2 ? POP.white : POP.blue} strokeWidth={22} />);
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${kind === "zigzag" ? 6 : kind === "swirl" ? -6 : -3})`}>
      <clipPath id={id}>
        <rect x={-120} y={-120} width={240} height={240} rx={24} />
      </clipPath>
      <rect x={-120} y={-120} width={240} height={240} rx={24} fill={kind === "swirl" ? "#BFE6FF" : POP.white} />
      <g clipPath={`url(#${id})`}>{body}</g>
      <rect x={-120} y={-120} width={240} height={240} rx={24} fill="none" stroke={INK} strokeWidth={9} />
    </g>
  );
};

/** 4 · "The Navy thought he'd lost his mind": two officers laughing in the studio. */
const Shot4: React.FC = () => {
  const { f } = useLocal();
  const cam: Cam = { pos: v3(-0.2 + f * 0.004, 1.25, 3.6), target: v3(-1.0, 1.25, -1), fov: 60 };
  const a = v3(-1.7, 0, 0.2), b = v3(-0.85, 0, 0.5), w = v3(0.9, 0, 1.4);
  return (
    <World3D
      cam={cam}
      bg="#F2D6A2"
      fog={["#F6E4C2", 6, 20]}
      back={
        <>
          <Daylight sun={[3, 8, -6]} amb={1.1} />
          <Studio frame={f} />
          <ContactShadow at={a} />
          <ContactShadow at={b} />
          <ContactShadow at={w} />
        </>
      }
      chars={(p) => (
        <>
          <At project={p} at={a} look={BRASS} id="b4a" expr="grin" armsUp={0.15} />
          <At project={p} at={b} look={BRASS2} id="b4b" expr="grin" handL={[-120, -470]} />
          <At project={p} at={w} look={WILK} id="w4" expr="neutral" gaze={-14} holding={<Brush color={POP.blue} />} />
        </>
      )}
    />
  );
};

/** 5 · The king's test: a model on a turntable, a periscope, a confident wrong answer. */
const Shot5: React.FC = () => {
  const { f } = useLocal();
  const kingIn = cue("The king") - S.s5;
  const south = cue("South") - S.s5;
  const east = cue("It was pointing") - S.s5;
  const cam = lerpCam({ pos: v3(1.6, 1.4, 3.6), target: v3(0.6, 0.9, -0.5), fov: 52 }, { pos: v3(-0.1, 1.3, 4.0), target: v3(-0.2, 1.0, -0.2), fov: 58 }, ease(f, kingIn - 20, kingIn + 25));
  const camEnd = lerpCam(cam, { pos: v3(0.25, 1.35, 4.9), target: v3(0.2, 0.95, -0.2), fov: 60 }, ease(f, south - 20, south + 10));
  const king = v3(-0.85, 0, 0.55), wilk = v3(1.35, 0, 0.75);
  const spin = interpolate(f, [0, kingIn], [-1.2, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <World3D
      cam={camEnd}
      bg="#F2D6A2"
      fog={["#F6E4C2", 6, 20]}
      back={
        <>
          <Daylight sun={[3, 8, -6]} amb={1.1} />
          <Studio frame={f} showTurntable turntable={spin} />
          <ContactShadow at={king} />
          <ContactShadow at={wilk} />
        </>
      }
      chars={(p) => {
        const w = placeToon(p, wilk);
        return (
          <>
            {f >= kingIn - 10 && <At project={p} at={king} look={KING} id="k5" expr={f >= east ? "shock" : f >= south ? "smug" : "neutral"} gaze={f >= south && f < east ? 14 : 0} handR={f >= south && f < east ? [190, -420] : undefined} armsUp={f >= east ? 0.8 : 0} />}
            <At project={p} at={wilk} look={WILK} id="w5" expr="sneaky" gaze={-10} handL={f < kingIn ? [-190, -360] : undefined} />
            <Sparkle x={w.x - 30 * w.scale} y={w.y - 500 * w.scale} at={east + 6} size={50} />
          </>
        );
      }}
    />
  );
};

/** 6a · Inside the U-boat: the captain at the periscope, sweating. */
const Shot6a: React.FC = () => {
  const { f } = useLocal();
  const cam: Cam = { pos: v3(-0.4 + f * 0.003, 1.2, 3.0 - f * 0.004), target: v3(0.3, 1.15, -0.6), fov: 56 };
  const cap = v3(0.05, 0, -0.05);
  return (
    <World3D
      cam={cam}
      bg="#1E3438"
      fog={["#1E3438", 5, 14]}
      back={
        <>
          <ambientLight color="#9FC6CC" intensity={0.9} />
          <hemisphereLight color="#BFE3E8" groundColor="#2A1A14" intensity={0.6} />
          <directionalLight color="#E8F4FF" intensity={1.2} position={[2, 5, 4]} />
          <SubRoom frame={f} />
          <ContactShadow at={cap} />
        </>
      }
      chars={(p) => <At project={p} at={cap} look={UCAP} id="u6" expr="panic" gaze={8} handL={[-150, -470]} handR={[150, -470]} />}
    />
  );
};

/** 6b · Periscope view of a dazzle ship: speed? heading? Ten degrees off, the torpedo misses. */
const Shot6b: React.FC = () => {
  const { f } = useLocal();
  const fire = cue("Get it wrong") - S.s6b;
  const miss = cue("torpedo") - S.s6b;
  const cam: Cam = { pos: v3(0, 0.7, 12), target: v3(0, 1.8, -40), fov: 30 };
  const shipX = interpolate(f, [0, 240], [-5, 3]);
  const tw = interpolate(f, [fire, miss + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Torpedo track: from near the camera to where the gunner *thought* the ship would be.
  const start = v3(0.5, 0.03, 9), aim = v3(shipX - 9, 0.03, -38);
  const head = start.clone().lerp(aim, tw);
  const mid = start.clone().lerp(head, 0.5);
  const len = start.distanceTo(head);
  const ang = Math.atan2(head.x - start.x, head.z - start.z);
  return (
    <AbsoluteFill>
      <World3D
        cam={cam}
        bg="#CFEBFF"
        fog={["#CFEBFF", 40, 160]}
        backBlur={1.2}
        back={
          <>
            <Daylight />
            <SeaAndSky frame={f} />
            <Ship paint={12} position={[shipX, 0, -40]} rotation={[0, 0.5, 0]} frame={f} smoke />
            {tw > 0 && (
              <mesh position={[mid.x, 0.04, mid.z]} rotation={[-Math.PI / 2, 0, -ang]}>
                <planeGeometry args={[0.35, Math.max(0.01, len)]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
              </mesh>
            )}
          </>
        }
      />
      <Periscope />
    </AbsoluteFill>
  );
};

/** 7 · Thousands of dazzle ships in the harbour. */
const Shot7: React.FC = () => {
  const { f } = useLocal();
  const k = ease(f, 0, S.s8a - S.s7 + DIS);
  const cam = lerpCam({ pos: v3(-5, 2.2, 10), target: v3(-2, 1.8, -6), fov: 58 }, { pos: v3(3, 2.0, 9), target: v3(3, 1.8, -6), fov: 58 }, k);
  return (
    <World3D
      cam={cam}
      bg="#CFEBFF"
      fog={["#CFEBFF", 25, 140]}
      back={
        <>
          <Daylight />
          <SeaAndSky frame={f} />
          <Ship paint={3} position={[-4, 0, -2.5]} frame={f} smoke />
          <Ship paint={17} position={[9, 0, -7]} rotation={[0, Math.PI, 0]} frame={f + 20} smoke />
          <Ship paint={26} position={[-6, 0, -14]} rotation={[0, 0.2, 0]} frame={f + 40} />
          <Ship paint={40} position={[12, 0, -22]} rotation={[0, -0.4, 0]} frame={f + 60} smoke />
          <Ship paint={55} position={[0, 0, -32]} rotation={[0, 0.6, 0]} frame={f + 10} />
          <Dock />
        </>
      }
    />
  );
};

/** 8a · The committee can't prove it worked. */
const Shot8a: React.FC = () => {
  const { f } = useLocal();
  const shrug = cue("couldn't") - S.s8a;
  const cam: Cam = { pos: v3(0.2, 1.3, 3.6 - f * 0.004), target: v3(0, 1.1, -1), fov: 58 };
  const xs = [-1.0, 0, 1.0];
  const looks = [BRASS, BRASS3, BRASS2];
  return (
    <World3D
      cam={cam}
      bg="#F2D6A2"
      fog={["#F6E4C2", 6, 20]}
      back={
        <>
          <Daylight sun={[3, 8, -6]} amb={1.1} />
          <Studio frame={f} committee />
        </>
      }
      chars={(p) => (
        <>
          {xs.map((x, i) => (
            <At key={i} project={p} at={v3(x, 0, -1.3)} look={looks[i]} id={`c8${i}`} expr={f >= shrug && i === 1 ? "smug" : "neutral"} gaze={(i - 1) * -8} handL={f >= shrug ? [-170, -360] : undefined} handR={f >= shrug ? [170, -360] : undefined} />
          ))}
        </>
      )}
    />
  );
};

/** 8b · But the sailors loved it. */
const Shot8b: React.FC = () => {
  const { f } = useLocal();
  const cam: Cam = { pos: v3(0.3, 1.6, 10.6 - f * 0.006), target: v3(0, 2.0, -1), fov: 50 };
  const ps = [v3(-1.05, 0.6, 4.0), v3(0, 0.6, 4.5), v3(1.05, 0.6, 4.0)];
  const looks = [SAILOR1, SAILOR2, SAILOR3];
  return (
    <World3D
      cam={cam}
      bg="#CFEBFF"
      fog={["#CFEBFF", 30, 160]}
      back={
        <>
          <Daylight />
          <SeaAndSky frame={f} />
          <Ship paint={21} position={[0.5, 0, -2.5]} frame={f} smoke />
          <Dock />
          {ps.map((q, i) => (
            <ContactShadow key={i} at={q} />
          ))}
        </>
      }
      chars={(p) => (
        <>
          {ps.map((q, i) => (
            <At key={i} project={p} at={q} look={looks[i]} id={`s8${i}`} expr="grin" armsUp={0.6 + 0.4 * Math.abs(Math.sin(f / 6 + i))} seed={i} />
          ))}
        </>
      )}
    />
  );
};

/** 9 · Payoff: the dazzle ship sails away; Wilkinson smirks, his shades glint. Matches shot 1 to loop. */
const Shot9: React.FC = () => {
  const { f } = useLocal();
  const len = DAZZLE_DURATION - S.s9;
  const k = ease(f, 0, len);
  const cam = lerpCam({ pos: v3(0.8, 1.6, 11.2), target: v3(0, 2.1, -1), fov: 50 }, { pos: v3(1.4, 1.8, 12.5), target: v3(0, 2.2, -1), fov: 50 }, k);
  const shipX = interpolate(f, [0, len], [1.5, 7]);
  const wilk = v3(-0.35, 0.6, 3.7);
  return (
    <World3D
      cam={cam}
      bg="#CFEBFF"
      fog={["#CFEBFF", 30, 160]}
      back={
        <>
          <Daylight />
          <SeaAndSky frame={f} />
          <Ship paint={12} position={[shipX, 0, -3]} frame={f} smoke />
          <Foam position={[shipX, 0, -3]} size={[7.4, 1.8]} frame={f} />
          <Dock />
          <ContactShadow at={wilk} />
        </>
      }
      front={<Crates position={[2.0, 0.6, 8.6]} rotation={0.4} />}
      chars={(p) => {
        const w = placeToon(p, wilk);
        return (
          <>
            <At project={p} at={wilk} look={WILK} id="w9" expr="sneaky" gaze={10} holding={<PaintRoller />} handR={[160, -330]} />
            <Sparkle x={w.x + 40 * w.scale} y={w.y - 500 * w.scale} at={cue("impossible to hit") - S.s9} size={60} />
          </>
        );
      }}
    />
  );
};

// =========================== SOUND ===========================
const Sfx: React.FC<{ at: number; name: string; vol?: number; len?: number; rate?: number }> = ({ at, name, vol = 0.4, len = 60, rate }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={len} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} playbackRate={rate} />
  </Sequence>
);

const Soundtrack: React.FC = () => {
  const sea = (from: number, to: number, vol = 0.22) => (
    <Sequence from={from} durationInFrames={to - from + DIS} layout="none">
      <Audio src={staticFile("sfx/waves.wav")} loop volume={vol} />
    </Sequence>
  );
  return (
    <>
      <Audio src={staticFile("voice/dazzle-ships.mp3")} volume={1} />
      {sea(S.s1, S.s3)}
      {sea(S.s7, DAZZLE_DURATION)}
      <Sfx at={20} name="seagull" vol={0.15} />
      <Sfx at={8} name="pop" vol={0.35} len={15} />
      <Sfx at={S.s2a} name="click" vol={0.4} len={10} />
      <Sfx at={cue("sinking") - 2} name="boom" vol={0.3} len={60} />
      <Sfx at={cue("sinking")} name="splash" vol={0.35} len={45} />
      <Sfx at={S.s3} name="whoosh" vol={0.25} len={20} />
      {["Black", "White", "Blue"].map((w) => (
        <Sfx key={w} at={cue(w)} name="pop" vol={0.45} len={15} />
      ))}
      <Sfx at={cue("Norman")} name="shimmer" vol={0.15} len={30} />
      <Sfx at={S.s4} name="laugh" vol={0.35} len={60} />
      <Sfx at={S.s5} name="whoosh" vol={0.25} len={20} />
      <Sfx at={cue("periscope")} name="click" vol={0.35} len={10} />
      <Sfx at={cue("South")} name="pop" vol={0.4} len={15} />
      <Sfx at={cue("It was pointing")} name="boing" vol={0.35} len={30} />
      <Sfx at={cue("east") + 6} name="clink" vol={0.4} len={12} />
      <Sfx at={S.s6a} name="hum" vol={0.12} len={S.s6b - S.s6a} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={cue("few seconds") + i * 15} name="tick" vol={0.3} len={10} />
      ))}
      <Sfx at={S.s6b} name="click" vol={0.4} len={10} />
      <Sfx at={cue("Get it wrong")} name="whoosh" vol={0.3} len={40} rate={0.6} />
      <Sfx at={cue("misses")} name="splash" vol={0.2} len={40} />
      <Sfx at={S.s7} name="whoosh" vol={0.25} len={20} />
      <Sfx at={cue("thousands")} name="pop" vol={0.45} len={15} />
      <Sfx at={cue("prove")} name="stamp" vol={0.5} len={20} />
      <Sfx at={S.s8b} name="cheer" vol={0.3} len={80} />
      <Sfx at={cue("impossible to hit")} name="shimmer" vol={0.25} len={30} />
    </>
  );
};

// =========================== FILM ===========================
export const DazzleShips: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Shot from={S.s1} to={S.s2a} first>
        <Shot1 />
        <Tag text="1917" x={540} y={330} at={6} />
      </Shot>
      <Shot from={S.s2a} to={S.s2b}>
        <Shot2a />
        <Tag text="GERMAN U-BOAT" x={540} y={290} at={4} color={POP.yellow} size={56} />
      </Shot>
      <Shot from={S.s2b} to={S.s3}>
        <Shot2b />
      </Shot>
      <Shot from={S.s3} to={S.s4}>
        <Shot3 />
        <Tag text="NORMAN WILKINSON" x={540} y={300} at={cue("Norman") - S.s3} size={58} />
        <Tag text="PAINTER" x={540} y={410} at={cue("Norman") - S.s3 + 6} color={POP.red} size={44} rotate={3} />
        <AbsoluteFill>
          <svg width={1080} height={1920}>
            <Swatch kind="stripes" x={230} y={640} at={cue("Black") - S.s3} />
            <Swatch kind="zigzag" x={830} y={560} at={cue("White") - S.s3} />
            <Swatch kind="swirl" x={820} y={900} at={cue("Blue") - S.s3} />
          </svg>
        </AbsoluteFill>
      </Shot>
      <Shot from={S.s4} to={S.s5}>
        <Shot4 />
        <Tag text="HA HA HA!" x={330} y={420} at={4} color={POP.yellow} size={64} />
      </Shot>
      <Shot from={S.s5} to={S.s6a}>
        <Shot5 />
        <Tag text="KING GEORGE V" x={540} y={300} at={cue("King") - S.s5} size={58} />
        <Tag text="SOUTH!" x={300} y={520} at={cue("South") - S.s5} out={cue("It was pointing") - S.s5} color={POP.yellow} size={76} />
        <Tag text="EAST" x={700} y={560} at={cue("It was pointing") - S.s5} color={POP.red} size={86} rotate={5} />
      </Shot>
      <Shot from={S.s6a} to={S.s6b}>
        <Shot6a />
        <Tag text="A FEW SECONDS" x={540} y={320} at={cue("few seconds") - S.s6a} color={POP.red} size={60} />
      </Shot>
      <Shot from={S.s6b} to={S.s7}>
        <Shot6b />
        <Tag text="SPEED?" x={300} y={480} at={cue("speed") - S.s6b} color={POP.yellow} size={60} />
        <Tag text="HEADING?" x={780} y={520} at={cue("direction") - S.s6b} color={POP.yellow} size={60} rotate={4} />
        <Tag text="10° OFF = MISS" x={540} y={1590} at={cue("ten degrees") - S.s6b} color={POP.red} size={62} rotate={-2} />
      </Shot>
      <Shot from={S.s7} to={S.s8a}>
        <Shot7 />
        <Tag text="THOUSANDS" x={540} y={330} at={cue("thousands") - S.s7} color={POP.yellow} size={80} />
      </Shot>
      <Shot from={S.s8a} to={S.s8b}>
        <Shot8a />
        <Tag text="DID IT WORK?" x={540} y={300} at={0} size={60} />
        <Tag text="NO CLEAR PROOF" x={540} y={560} at={cue("prove") - S.s8a} color={POP.red} size={70} rotate={-8} />
      </Shot>
      <Shot from={S.s8b} to={S.s9}>
        <Shot8b />
        <Tag text="CHEAP!" x={780} y={360} at={cue("cost") - S.s8b} color={POP.yellow} size={66} rotate={6} />
      </Shot>
      <Shot from={S.s9} to={DAZZLE_DURATION}>
        <Shot9 />
      </Shot>
      <Captions />
      <Soundtrack />
    </AbsoluteFill>
  );
};
