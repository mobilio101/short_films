// 3D sets for "Acoustic Kitty", all built from shapes and painted in code (no models or images):
// a 1960s CIA office (teal and mustard, venetian blinds), a bright lab, a park in Washington with a
// grey compound far behind, and the listening van.
import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../test/cabin3d/textures";
import { Box, Cyl, Edges } from "../../world3d/kit";
import { dayTexture, plasterTexture, rugTexture, skyTexture, woodTexture } from "../../world3d/textures";

type P3 = [number, number, number];

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

// ---------------- Textures painted in code ----------------

/** A cartoon world map with red pins and string, for the office wall. */
const mapTexture = () => {
  const [c, g] = canvas(1024, 640);
  g.fillStyle = "#BFE6F2";
  g.fillRect(0, 0, 1024, 640);
  g.strokeStyle = "rgba(20,40,60,0.15)";
  g.lineWidth = 2;
  for (let x = 0; x < 1024; x += 64) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 640);
    g.stroke();
  }
  for (let y = 0; y < 640; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
  const land = (pts: number[][], col: string) => {
    g.fillStyle = col;
    g.strokeStyle = "#1a0f08";
    g.lineWidth = 6;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
    g.stroke();
  };
  land([[90, 120], [300, 90], [360, 190], [290, 300], [230, 330], [160, 260], [100, 210]], "#F2C14E"); // N. America
  land([[260, 350], [330, 360], [350, 470], [300, 590], [260, 520], [240, 420]], "#F2C14E"); // S. America
  land([[470, 110], [560, 90], [580, 170], [520, 200], [470, 180]], "#9ED8CF"); // Europe
  land([[580, 80], [900, 70], [960, 180], [860, 280], [700, 260], [600, 200]], "#F28B6E"); // the East
  land([[480, 230], [600, 240], [620, 380], [560, 520], [500, 430], [470, 320]], "#F2C14E"); // Africa
  land([[820, 420], [930, 410], [950, 500], [860, 520]], "#F2C14E"); // Australia
  // string between pins
  g.strokeStyle = "#F2363B";
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(250, 200);
  g.lineTo(520, 150);
  g.lineTo(740, 160);
  g.stroke();
  return tex(c);
};

/** Small square wall tiles for the lab. */
const tileTexture = (base: string, line: string, n: [number, number]) => {
  const [c, g] = canvas(512, 512);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = line;
  g.lineWidth = 6;
  for (let i = 0; i <= 8; i++) {
    g.beginPath();
    g.moveTo(i * 64, 0);
    g.lineTo(i * 64, 512);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i * 64);
    g.lineTo(512, i * 64);
    g.stroke();
  }
  return tex(c, n);
};

/** Checker lino floor. */
const checkerTexture = (a: string, b: string, n: [number, number]) => {
  const [c, g] = canvas(256, 256);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    g.fillStyle = (i + j) % 2 ? a : b;
    g.fillRect(i * 64, j * 64, 64, 64);
  }
  return tex(c, n);
};

/** The blueprint on the lab wall: a cat with its three spy parts circled. */
const blueprintTexture = () => {
  const [c, g] = canvas(768, 1024);
  g.fillStyle = "#2D63C8";
  g.fillRect(0, 0, 768, 1024);
  g.strokeStyle = "rgba(255,255,255,0.18)";
  g.lineWidth = 2;
  for (let i = 0; i < 768; i += 48) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 1024);
    g.stroke();
  }
  for (let i = 0; i < 1024; i += 48) {
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(768, i);
    g.stroke();
  }
  g.strokeStyle = "#FFFFFF";
  g.lineWidth = 9;
  g.lineJoin = "round";
  // cat outline
  g.beginPath();
  g.moveTo(250, 900);
  g.bezierCurveTo(200, 760, 230, 600, 300, 560);
  g.lineTo(470, 560);
  g.bezierCurveTo(540, 600, 570, 760, 520, 900);
  g.closePath();
  g.stroke();
  g.beginPath();
  g.ellipse(384, 450, 170, 130, 0, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(240, 400);
  g.lineTo(250, 250);
  g.lineTo(330, 330);
  g.moveTo(528, 400);
  g.lineTo(518, 250);
  g.lineTo(438, 330);
  g.stroke();
  // tail
  g.beginPath();
  g.moveTo(520, 880);
  g.bezierCurveTo(660, 880, 680, 760, 620, 700);
  g.stroke();
  // parts: ear, skull base, antenna
  g.strokeStyle = "#FFC928";
  g.lineWidth = 8;
  [[262, 320, 40], [384, 585, 36]].forEach(([x, y, r]) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.stroke();
  });
  g.setLineDash([16, 12]);
  g.beginPath();
  g.moveTo(384, 585);
  g.bezierCurveTo(470, 650, 500, 760, 470, 860);
  g.stroke();
  g.setLineDash([]);
  g.fillStyle = "#FFFFFF";
  g.font = "bold 56px sans-serif";
  g.fillText("PROJECT", 40, 90);
  g.fillText("KITTY", 40, 150);
  g.font = "bold 30px sans-serif";
  g.fillText("FIG. 1", 600, 90);
  return tex(c);
};

/** Mown grass with light and dark stripes. */
const grassTexture = () => {
  const [c, g] = canvas(512, 512);
  const r = rng(5);
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? "#6FCB5A" : "#62BE4F";
    g.fillRect(0, i * 64, 512, 64);
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(40,110,40,0.25)" : "rgba(200,255,160,0.25)";
    g.fillRect(r() * 512, r() * 512, 3, 8);
  }
  return tex(c, [4, 8]);
};

/** Gravel path. */
const gravelTexture = () => {
  const [c, g] = canvas(256, 256);
  const r = rng(9);
  g.fillStyle = "#EAD7AE";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(150,110,60,0.35)" : "rgba(255,255,255,0.4)";
    g.beginPath();
    g.arc(r() * 256, r() * 256, 1 + r() * 2.5, 0, Math.PI * 2);
    g.fill();
  }
  return tex(c, [1, 10]);
};

/** The grey compound far behind the park: rows of windows and a red band (no flags or emblems). */
const compoundTexture = () => {
  const [c, g] = canvas(1024, 512);
  g.fillStyle = "#AEB4BB";
  g.fillRect(0, 0, 1024, 512);
  g.fillStyle = "#C9302C";
  g.fillRect(0, 40, 1024, 50);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 14; col++) {
      g.fillStyle = "#4B5864";
      g.fillRect(30 + col * 72, 130 + row * 90, 40, 56);
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.fillRect(30 + col * 72, 130 + row * 90, 40, 10);
    }
  return tex(c);
};

/** Typed paper with a title, for the report and the file. */
export const paperTexture = (title: string, sub: string, lines = 9) => {
  const [c, g] = canvas(512, 680);
  g.fillStyle = "#FFFDF4";
  g.fillRect(0, 0, 512, 680);
  g.fillStyle = "#1a0f08";
  g.font = "bold 46px monospace";
  g.fillText(title, 40, 90);
  g.font = "bold 28px monospace";
  g.fillText(sub, 40, 140);
  g.fillStyle = "rgba(26,15,8,0.55)";
  const r = rng(title.length);
  for (let i = 0; i < lines; i++) g.fillRect(40, 200 + i * 44, 300 + r() * 130, 12);
  g.strokeStyle = "#F2363B";
  g.lineWidth = 5;
  g.strokeRect(330, 30, 150, 60);
  g.fillStyle = "#F2363B";
  g.font = "bold 22px monospace";
  g.fillText("SECRET", 360, 70);
  return tex(c);
};

/** Manila folder cover with a word on it. */
const folderTexture = (word: string) => {
  const [c, g] = canvas(512, 380);
  g.fillStyle = "#F0C878";
  g.fillRect(0, 0, 512, 380);
  g.fillStyle = "#1a0f08";
  g.font = "bold 92px sans-serif";
  g.textAlign = "center";
  g.fillText(word, 256, 230);
  g.strokeStyle = "#F2363B";
  g.lineWidth = 8;
  g.strokeRect(130, 270, 252, 64);
  g.fillStyle = "#F2363B";
  g.font = "bold 40px sans-serif";
  g.fillText("TOP SECRET", 256, 318);
  return tex(c);
};

// ---------------- Props ----------------

/** A flat manila folder lying on a surface (y = its bottom). */
export const Folder: React.FC<{ position: P3; rotation?: P3; word?: string; scale?: number }> = ({ position, rotation = [0, 0, 0], word = "CAT", scale = 1 }) => {
  const map = useMemo(() => folderTexture(word), [word]);
  const geo = useMemo(() => new THREE.BoxGeometry(0.42, 0.03, 0.31), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo} position={[0, 0.015, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#F0C878" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.31]} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
      <group position={[0, 0.015, 0]}>
        <Edges geometry={geo} width={4} />
      </group>
    </group>
  );
};

/** Bundles of cash, `n` of them stacked (grows as n rises). */
export const Cash: React.FC<{ position: P3; n: number; rotation?: number }> = ({ position, n, rotation = 0 }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => (
      <group key={i} position={[((i * 37) % 3) * 0.02 - 0.02, 0.035 + i * 0.07, ((i * 53) % 3) * 0.015]} rotation={[0, (i % 2) * 0.12, 0]}>
        <Box size={[0.3, 0.07, 0.15]} position={[0, 0, 0]} color="#7BC47F" ink={3.5} />
        <Box size={[0.05, 0.072, 0.152]} position={[0, 0, 0]} color="#FFFFFF" ink={0} />
      </group>
    ))}
  </group>
);

/** A park bench: wooden slats on black iron legs. Faces +z. */
export const Bench: React.FC<{ position: P3; rotation?: number }> = ({ position, rotation = 0 }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {[0, 1, 2].map((i) => (
      <Box key={i} size={[2.0, 0.05, 0.12]} position={[0, 0.46, -0.16 + i * 0.15]} color="#E2843A" ink={3.5} />
    ))}
    {[0, 1].map((i) => (
      <Box key={`b${i}`} size={[2.0, 0.1, 0.04]} position={[0, 0.66 + i * 0.16, -0.27]} rotation={[-0.15, 0, 0]} color="#E2843A" ink={3.5} />
    ))}
    {[-0.85, 0.85].map((x) => (
      <group key={x}>
        <Box size={[0.06, 0.46, 0.06]} position={[x, 0.23, 0.12]} color="#1F2328" ink={2} />
        <Box size={[0.06, 0.9, 0.06]} position={[x, 0.45, -0.24]} color="#1F2328" ink={2} />
        <Box size={[0.06, 0.06, 0.42]} position={[x, 0.5, -0.04]} color="#1F2328" ink={2} />
      </group>
    ))}
  </group>
);

/** A cartoon tree: trunk and a few faceted green blobs. */
export const Tree: React.FC<{ position: P3; s?: number; tone?: number }> = ({ position, s = 1, tone = 0 }) => {
  const greens = ["#3FAE4E", "#56C25A", "#2E9A48"];
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const blobs: [number, number, number, number][] = [
    [0, 3.0, 0, 1.3],
    [-0.8, 2.5, 0.2, 0.95],
    [0.85, 2.6, -0.1, 1.0],
    [0.1, 3.7, -0.2, 0.9],
  ];
  return (
    <group position={position} scale={s}>
      <Cyl r={0.16} r2={0.22} h={2.4} position={[0, 1.2, 0]} color="#8A5A34" ink={4} />
      {blobs.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]} scale={r} rotation={[i, i * 2, 0]}>
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial color={greens[(i + tone) % 3]} roughness={0.9} flatShading />
          </mesh>
          <Edges geometry={geo} width={4.5} angle={1} />
        </group>
      ))}
    </group>
  );
};

export const Bush: React.FC<{ position: P3; s?: number; flowers?: string }> = ({ position, s = 1, flowers }) => {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.5, 0), []);
  return (
    <group position={position} scale={s}>
      <mesh geometry={geo} position={[0, 0.35, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3FAE4E" roughness={0.9} flatShading />
      </mesh>
      <group position={[0, 0.35, 0]}>
        <Edges geometry={geo} width={4} angle={1} />
      </group>
      {flowers &&
        [
          [0.2, 0.7, 0.3],
          [-0.25, 0.6, 0.32],
          [0.05, 0.82, 0.1],
          [0.35, 0.45, 0.35],
          [-0.35, 0.4, 0.3],
        ].map((p, i) => (
          <mesh key={i} position={p as P3}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={flowers} />
          </mesh>
        ))}
    </group>
  );
};

/** A black iron park lamp. */
export const LampPost: React.FC<{ position: P3 }> = ({ position }) => (
  <group position={position}>
    <Cyl r={0.06} h={3.2} position={[0, 1.6, 0]} color="#1F2328" ink={3} />
    <Cyl r={0.16} r2={0.1} h={0.35} position={[0, 3.35, 0]} color="#FFF1B8" ink={4} emissive="#FFE08A" />
    <Cyl r={0.2} r2={0.02} h={0.15} position={[0, 3.58, 0]} color="#1F2328" ink={3} />
  </group>
);

/** A filing cabinet (drawer `open` 0..1 for the top drawer). */
export const Cabinet: React.FC<{ position: P3; rotation?: number; open?: number; color?: string }> = ({ position, rotation = 0, open = 0, color = "#7FA88F" }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Box size={[0.6, 1.4, 0.65]} position={[0, 0.7, 0]} color={color} ink={5} />
    {[0, 1, 2].map((i) => (
      <group key={i} position={[0, 1.15 - i * 0.43, 0.33 + (i === 0 ? open * 0.45 : 0)]}>
        <Box size={[0.54, 0.38, 0.04]} position={[0, 0, 0]} color={color} ink={4} />
        <Box size={[0.18, 0.04, 0.04]} position={[0, 0.06, 0.04]} color="#E8E8E8" ink={2.5} />
        <Box size={[0.12, 0.06, 0.01]} position={[0, -0.06, 0.025]} color="#FFFDF4" ink={2} />
      </group>
    ))}
    {open > 0 && <Box size={[0.52, 0.34, 0.45 * open]} position={[0, 1.15, 0.33 + (0.45 * open) / 2 - 0.02]} color={color} ink={3} />}
  </group>
);

/** Desk lamp with a glowing bulb and its own warm light. */
const DeskLamp: React.FC<{ position: P3 }> = ({ position }) => (
  <group position={position}>
    <Cyl r={0.12} h={0.04} position={[0, 0.02, 0]} color="#1FC2B0" ink={3} />
    <Cyl r={0.018} h={0.42} position={[0, 0.23, 0]} rotation={[0, 0, 0.25]} color="#1F2328" ink={2} />
    <Cyl r={0.03} r2={0.14} h={0.16} position={[-0.07, 0.44, 0]} rotation={[0, 0, 0.9]} color="#1FC2B0" ink={4} />
    <mesh position={[-0.12, 0.4, 0]}>
      <sphereGeometry args={[0.04, 10, 8]} />
      <meshBasicMaterial color="#FFF4C2" toneMapped={false} />
    </mesh>
    <pointLight position={[-0.15, 0.36, 0]} color="#FFD98A" intensity={1.6} distance={3} decay={1.5} />
  </group>
);

/** Rotary phone (red: a colour accent). */
const Phone: React.FC<{ position: P3 }> = ({ position }) => (
  <group position={position} rotation={[0, 0.4, 0]}>
    <Box size={[0.2, 0.08, 0.18]} position={[0, 0.04, 0]} color="#F2363B" ink={3} />
    <Box size={[0.26, 0.05, 0.06]} position={[0, 0.11, 0]} color="#F2363B" ink={3} />
    <Cyl r={0.05} h={0.01} position={[0, 0.085, 0.05]} rotation={[0.5, 0, 0]} color="#FFFFFF" ink={2} />
  </group>
);

// ---------------- Sets ----------------

/** A wall with a rectangular window hole, as one extruded shape (so sunlight comes through). */
const useWallWithWindow = (RW: number, CEIL: number, win: [number, number, number, number]) =>
  useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-RW / 2, 0);
    s.lineTo(RW / 2, 0);
    s.lineTo(RW / 2, CEIL);
    s.lineTo(-RW / 2, CEIL);
    s.closePath();
    const [x0, y0, x1, y1] = win;
    const hole = new THREE.Path();
    hole.moveTo(x0, y0);
    hole.lineTo(x1, y0);
    hole.lineTo(x1, y1);
    hole.lineTo(x0, y1);
    hole.closePath();
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / RW + 0.5, uv.getY(i) / CEIL);
    return g;
  }, [RW, CEIL, win[0], win[1], win[2], win[3]]); // eslint-disable-line react-hooks/exhaustive-deps

export const OFFICE_BACK = -3;
export const DESK_TOP = 0.78;

/**
 * The CIA office, 1960s: teal back wall with a big window and venetian blinds (the sun behind it
 * throws striped shadows across the floor), mustard side walls, a wall map with red pins, a desk with
 * lamp, phone and folders, filing cabinets, a rug and a clock. Desk centre at (0, 0, -0.9).
 */
export const Office: React.FC<{ frame: number; folders?: number; cash?: number; deskFolder?: boolean; drawer?: number; children?: React.ReactNode }> = ({ frame, folders = 2, cash = 0, deskFolder = false, drawer = 0, children }) => {
  const wall = useMemo(() => plasterTexture("#4FB3A5", 4), []);
  const side = useMemo(() => plasterTexture("#F2C14E", 6), []);
  const floor = useMemo(() => woodTexture({ base: "#C98A52", planks: 9, seed: 21, repeat: [1, 1.5], vertical: true }), []);
  const desk = useMemo(() => woodTexture({ base: "#9C5B2E", planks: 4, seed: 4 }), []);
  const map = useMemo(() => mapTexture(), []);
  const rug = useMemo(() => rugTexture(), []);
  const day = useMemo(() => dayTexture(), []);
  const RW = 7.5, BACK = OFFICE_BACK, CEIL = 3.6;
  const win: [number, number, number, number] = [0.5, 1.1, 3.1, 3.2];
  const wallGeo = useWallWithWindow(RW, CEIL, win);
  const slats = 14;
  const tick = Math.floor(frame / 30);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BACK + 5]} receiveShadow>
        <planeGeometry args={[RW, 10]} />
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0.2]} receiveShadow>
        <planeGeometry args={[3.4, 2.4]} />
        <meshStandardMaterial map={rug} roughness={1} />
      </mesh>
      <group position={[0, 0, BACK - 0.12]}>
        <mesh geometry={wallGeo} castShadow receiveShadow>
          <meshStandardMaterial map={wall} roughness={0.95} />
        </mesh>
        <Edges geometry={wallGeo} width={6.5} />
      </group>
      {/* Venetian blinds: real slats, so the sun draws stripes on the floor */}
      {Array.from({ length: slats }, (_, i) => (
        <Box key={i} size={[2.6, 0.035, 0.1]} position={[1.8, 1.2 + i * 0.145, BACK + 0.06]} rotation={[0.5, 0, 0]} color="#FFF6DE" ink={1.6} />
      ))}
      <Box size={[2.7, 0.08, 0.14]} position={[1.8, 3.24, BACK + 0.06]} color="#FFFFFF" ink={4} />
      <Box size={[2.7, 0.1, 0.22]} position={[1.8, 1.05, BACK + 0.1]} color="#FFFFFF" ink={4} />
      <mesh position={[1.8, 2.2, BACK - 1.6]}>
        <planeGeometry args={[6, 4.5]} />
        <meshBasicMaterial map={day} toneMapped={false} fog={false} />
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} rotation={[0, -d * (Math.PI / 2), 0]} position={[d * (RW / 2), CEIL / 2, BACK + 5]} receiveShadow>
          <planeGeometry args={[10, CEIL]} />
          <meshStandardMaterial map={side} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL, BACK + 5]}>
        <planeGeometry args={[RW, 10]} />
        <meshStandardMaterial color="#F7EBD3" roughness={1} />
      </mesh>
      <Box size={[RW, 0.18, 0.06]} position={[0, 0.09, BACK + 0.03]} color="#2F6E66" ink={5} />
      {/* Wall map with red pins */}
      <group position={[-1.9, 2.15, BACK + 0.03]}>
        <Box size={[2.1, 1.35, 0.04]} position={[0, 0, 0]} color="#5A3A22" ink={5} />
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[1.95, 1.2]} />
          <meshStandardMaterial map={map} roughness={1} />
        </mesh>
        {[
          [-0.48, 0.23],
          [0.04, 0.33],
          [0.48, 0.31],
          [0.62, 0.05],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.06]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshStandardMaterial color="#F2363B" />
          </mesh>
        ))}
      </group>
      {/* Clock */}
      <group position={[-0.25, 3.0, BACK + 0.05]}>
        <Cyl r={0.22} h={0.05} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} color="#FFFFFF" ink={4} seg={28} />
        <Box size={[0.025, 0.15, 0.01]} position={[0, 0.06, 0.04]} color="#1a0f08" ink={0} />
        <group rotation={[0, 0, -tick * 0.105]} position={[0, 0, 0.045]}>
          <Box size={[0.015, 0.18, 0.01]} position={[0, 0.08, 0]} color="#F2363B" ink={0} />
        </group>
      </group>
      {/* Desk */}
      <group position={[0, 0, -0.9]}>
        <Box size={[2.2, 0.08, 1.0]} position={[0, DESK_TOP - 0.04, 0]} color="#9C5B2E" map={desk} ink={5} />
        <Box size={[0.55, 0.7, 0.9]} position={[-0.75, 0.37, 0]} color="#874C24" ink={4.5} />
        <Box size={[0.55, 0.7, 0.9]} position={[0.75, 0.37, 0]} color="#874C24" ink={4.5} />
        {[0.15, 0.45].map((y) => (
          <Box key={y} size={[0.14, 0.03, 0.02]} position={[0.75, y + 0.05, 0.46]} color="#FFC928" ink={2} />
        ))}
        <DeskLamp position={[-0.82, DESK_TOP, -0.25]} />
        <Phone position={[0.78, DESK_TOP, -0.2]} />
        {Array.from({ length: folders }, (_, i) => (
          <Folder key={i} position={[0.32 + (i % 2) * 0.05, DESK_TOP + i * 0.032, -0.22]} rotation={[0, 0.2 - i * 0.15, 0]} word="FILE" />
        ))}
        {deskFolder && <Folder position={[0, DESK_TOP, 0.18]} word="CAT" />}
        {cash > 0 && (
          <>
            <Cash position={[-0.45, DESK_TOP, 0.05]} n={cash} rotation={0.2} />
            <Cash position={[0.0, DESK_TOP, 0.12]} n={cash - 2} rotation={-0.1} />
            <Cash position={[0.45, DESK_TOP, 0.0]} n={cash - 4} rotation={0.3} />
          </>
        )}
        {children}
      </group>
      <Cabinet position={[3.2, 0, -2.4]} rotation={-0.1} open={drawer} />
      <Cabinet position={[2.55, 0, -2.6]} color="#93B8A0" />
      {/* Plant (green accent) */}
      <group position={[-3.0, 0, -2.3]}>
        <Cyl r={0.22} r2={0.17} h={0.4} position={[0, 0.2, 0]} color="#F2363B" ink={4} />
        <Bush position={[0, 0.25, 0]} s={1.1} />
      </group>
    </group>
  );
};

/**
 * A bright lab: mint tiled walls, a steel table with a soft blue cushion, a round surgery lamp,
 * the cat blueprint on the wall, shelves with coloured bottles. Table top centre at (0, TABLE, 0).
 */
export const TABLE = 0.92;
export const Lab: React.FC<{ frame: number; tape?: boolean }> = ({ frame, tape = false }) => {
  const tiles = useMemo(() => tileTexture("#D8F3EC", "#A9DCCF", [6, 3]), []);
  const tilesSide = useMemo(() => tileTexture("#F4F8FB", "#CCDDE6", [8, 3]), []);
  const floor = useMemo(() => checkerTexture("#F4F4F2", "#2D7FF9", [6, 8]), []);
  const bp = useMemo(() => blueprintTexture(), []);
  const RW = 7, BACK = -2.6, CEIL = 3.4;
  const lampSwing = Math.sin(frame / 40) * 0.03;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BACK + 5]} receiveShadow>
        <planeGeometry args={[RW, 10]} />
        <meshStandardMaterial map={floor} roughness={0.7} />
      </mesh>
      <mesh position={[0, CEIL / 2, BACK]} receiveShadow>
        <planeGeometry args={[RW, CEIL]} />
        <meshStandardMaterial map={tiles} roughness={0.6} />
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} rotation={[0, -d * (Math.PI / 2), 0]} position={[d * (RW / 2), CEIL / 2, BACK + 5]} receiveShadow>
          <planeGeometry args={[10, CEIL]} />
          <meshStandardMaterial map={tilesSide} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL, BACK + 5]}>
        <planeGeometry args={[RW, 10]} />
        <meshStandardMaterial color="#FFFFFF" roughness={1} />
      </mesh>
      <Box size={[RW, 0.04, 0.04]} position={[0, 0.02, BACK + 0.02]} color="#1FC2B0" ink={4} />
      {/* Blueprint */}
      <group position={[-1.7, 1.95, BACK + 0.03]} rotation={[0, 0, 0.03]}>
        <Box size={[1.25, 1.6, 0.03]} position={[0, 0, 0]} color="#FFFFFF" ink={5} />
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.15, 1.5]} />
          <meshStandardMaterial map={bp} roughness={1} />
        </mesh>
      </group>
      {/* Shelves with bottles (colour accents) */}
      {[1.6, 2.3].map((y, j) => (
        <group key={y}>
          <Box size={[1.8, 0.05, 0.3]} position={[1.7, y, BACK + 0.16]} color="#FFFFFF" ink={4} />
          {[0, 1, 2, 3, 4].map((i) => {
            const cols = ["#F2363B", "#FFC928", "#8B5CF6", "#2BC46B", "#FF8A1F"];
            const h = 0.22 + ((i + j) % 3) * 0.07;
            return <Cyl key={i} r={0.07} h={h} position={[1.0 + i * 0.35, y + 0.025 + h / 2, BACK + 0.16]} color={cols[(i + j * 2) % 5]} ink={3} />;
          })}
        </group>
      ))}
      {/* Steel table with a cushion */}
      <group position={[0, 0, 0]}>
        <Box size={[1.6, 0.06, 0.85]} position={[0, TABLE - 0.03, 0]} color="#D5DDE5" ink={5} />
        {[-0.7, 0.7].map((x) =>
          [-0.35, 0.35].map((z) => <Cyl key={`${x}${z}`} r={0.03} h={TABLE - 0.06} position={[x, (TABLE - 0.06) / 2, z]} color="#9AA6B2" ink={2.5} />),
        )}
        <Cyl r={0.36} r2={0.4} h={0.07} position={[0, TABLE + 0.035, 0.05]} color="#7CC8FF" ink={4} seg={28} />
        {/* tiny tools on a tray */}
        <Box size={[0.4, 0.02, 0.2]} position={[0.55, TABLE + 0.01, 0.2]} color="#B9C3CE" ink={3} />
        {[0, 1, 2].map((i) => (
          <Cyl key={i} r={0.008} h={0.16} position={[0.45 + i * 0.09, TABLE + 0.03, 0.2]} rotation={[Math.PI / 2, 0, 0.3]} color={i === 1 ? "#FFC928" : "#1F2328"} ink={1.5} />
        ))}
      </group>
      {/* Round surgery lamp on an arm */}
      <group position={[0.2 + lampSwing, 2.55, 0.1]}>
        <Cyl r={0.02} h={0.9} position={[0, 0.45, 0]} color="#9AA6B2" ink={2} />
        <Cyl r={0.42} r2={0.25} h={0.18} position={[0, 0, 0]} color="#FFFFFF" ink={5} seg={28} />
        <mesh position={[0, -0.095, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 28]} />
          <meshBasicMaterial color="#FFF8D6" toneMapped={false} />
        </mesh>
        <spotLight position={[0, -0.1, 0]} target-position={[0.2, 0, 0.1]} angle={0.7} penumbra={0.6} intensity={9} distance={5} color="#FFF3D0" castShadow />
      </group>
      {tape && (
        // Training floor: a tape line and a red X a short way along it.
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, 0.008, 1.0]}>
            <planeGeometry args={[2.4, 0.07]} />
            <meshBasicMaterial color="#FFC928" />
          </mesh>
          {[1, -1].map((d) => (
            <mesh key={d} rotation={[-Math.PI / 2, 0, d * 0.785]} position={[1.6, 0.01, 1.0]}>
              <planeGeometry args={[0.5, 0.09]} />
              <meshBasicMaterial color="#F2363B" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

/**
 * A park in Washington: mown grass, a gravel path running away from the camera, a bench, trees,
 * flower bushes and a lamp post, with the grey compound (red band) far behind. No roads.
 * The bench sits at (0, 0, -1).
 */
export const Park: React.FC<{ frame: number }> = ({ frame }) => {
  const grass = useMemo(() => grassTexture(), []);
  const gravel = useMemo(() => gravelTexture(), []);
  const sky = useMemo(() => skyTexture(), []);
  const comp = useMemo(() => compoundTexture(), []);
  return (
    <group>
      <mesh position={[0, 12, -60]}>
        <planeGeometry args={[220, 50]} />
        <meshBasicMaterial map={sky} toneMapped={false} fog={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>
      {/* gravel path from the camera towards the compound */}
      <mesh rotation={[-Math.PI / 2, 0, 0.05]} position={[0.3, 0.005, -4]} receiveShadow>
        <planeGeometry args={[1.8, 30]} />
        <meshStandardMaterial map={gravel} roughness={1} />
      </mesh>
      {/* the strip in front of the bench */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -0.55]} receiveShadow>
        <planeGeometry args={[3.2, 1.3]} />
        <meshStandardMaterial map={gravel} roughness={1} />
      </mesh>
      <Bench position={[0, 0, -1]} />
      <Tree position={[-3.2, 0, -3]} s={1.1} />
      <Tree position={[3.6, 0, -4.5]} s={1.25} tone={1} />
      <Tree position={[-6, 0, -9]} s={1.3} tone={2} />
      <Tree position={[6.5, 0, -11]} s={1.4} />
      <Tree position={[-2.5, 0, -16]} s={1.4} tone={1} />
      <Bush position={[-1.7, 0, -1.6]} s={1.0} flowers="#FF4F7B" />
      <Bush position={[1.8, 0, -1.7]} s={0.9} flowers="#FFC928" />
      <Bush position={[2.6, 0, -1.3]} s={0.7} flowers="#FFFFFF" />
      <LampPost position={[-1.5, 0, -0.6]} />
      {/* red bin: a colour accent */}
      <Cyl r={0.2} r2={0.18} h={0.6} position={[1.35, 0.3, -0.7]} color="#F2363B" ink={4} />
      {/* The compound, far behind (fog fades it) */}
      <group position={[2, 0, -30]}>
        <Box size={[22, 7, 3]} position={[0, 3.5, 0]} color="#AEB4BB" ink={6} />
        <mesh position={[0, 3.5, 1.52]}>
          <planeGeometry args={[22, 7]} />
          <meshStandardMaterial map={comp} roughness={1} />
        </mesh>
        <Box size={[24, 1.2, 0.3]} position={[0, 0.6, 3.2]} color="#8E959C" ink={4} />
        {Array.from({ length: 20 }, (_, i) => (
          <Cyl key={i} r={0.05} h={2.2} position={[-11.5 + i * 1.2, 1.1, 3.2]} color="#1F2328" ink={0} />
        ))}
      </group>
      {/* drifting leaf */}
      <mesh position={[Math.sin(frame / 30) * 1.5 - 0.5, 2.2 - ((frame / 90) % 2), -0.5]} rotation={[frame / 10, frame / 13, 0]}>
        <planeGeometry args={[0.08, 0.05]} />
        <meshStandardMaterial color="#FF8A1F" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/**
 * Inside the listening van: blue-grey metal walls, a rack of radio gear with glowing lights and a
 * reel-to-reel recorder, and the small back window looking out at the park.
 */
export const Van: React.FC<{ frame: number }> = ({ frame }) => {
  const day = useMemo(() => dayTexture(), []);
  const metal = useMemo(() => plasterTexture("#5E7FA3", 11), []);
  const floor = useMemo(() => checkerTexture("#3C4652", "#46525F", [3, 6]), []);
  const RW = 2.6, BACK = -1.4, CEIL = 2.2;
  const win: [number, number, number, number] = [0.15, 1.1, 1.05, 1.75];
  const wallGeo = useWallWithWindow(RW, CEIL, win);
  const reel = frame / 6;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BACK + 3]} receiveShadow>
        <planeGeometry args={[RW, 6]} />
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      <group position={[0, 0, BACK - 0.12]}>
        <mesh geometry={wallGeo} receiveShadow castShadow>
          <meshStandardMaterial map={metal} roughness={0.8} />
        </mesh>
        <Edges geometry={wallGeo} width={6} />
      </group>
      <mesh position={[0.6, 1.4, BACK - 3]}>
        <planeGeometry args={[4, 3]} />
        <meshBasicMaterial map={day} toneMapped={false} fog={false} />
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} rotation={[0, -d * (Math.PI / 2), 0]} position={[d * (RW / 2), CEIL / 2, BACK + 3]} receiveShadow>
          <planeGeometry args={[6, CEIL]} />
          <meshStandardMaterial map={metal} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL, BACK + 3]}>
        <planeGeometry args={[RW, 6]} />
        <meshStandardMaterial color="#3E5670" roughness={1} />
      </mesh>
      {/* Gear rack on the left */}
      <group position={[-0.75, 0, BACK + 0.35]}>
        <Box size={[1.0, 1.7, 0.5]} position={[0, 0.85, 0]} color="#2B3440" ink={5} />
        {[0, 1, 2, 3].map((r) => (
          <group key={r} position={[0, 0.5 + r * 0.33, 0.26]}>
            <Box size={[0.9, 0.26, 0.03]} position={[0, 0, 0]} color={r % 2 ? "#4B5864" : "#3A4552"} ink={3} />
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[-0.3 + i * 0.2, 0.04, 0.03]}>
                <sphereGeometry args={[0.025, 8, 6]} />
                <meshBasicMaterial color={(frame + i * 7 + r * 13) % 40 < 20 ? ["#2BC46B", "#FFC928", "#F2363B", "#7CC8FF"][(i + r) % 4] : "#222"} toneMapped={false} />
              </mesh>
            ))}
            <Cyl r={0.035} h={0.03} position={[0.32, -0.05, 0.03]} rotation={[Math.PI / 2, 0, 0]} color="#E8E8E8" ink={2} />
          </group>
        ))}
        {/* reel-to-reel on top */}
        {[-0.22, 0.22].map((x) => (
          <group key={x} position={[x, 1.92, 0.1]} rotation={[0, 0, reel]}>
            <Cyl r={0.15} h={0.03} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} color="#E8E8E8" ink={3} seg={24} />
            <Box size={[0.25, 0.03, 0.035]} position={[0, 0, 0.01]} color="#1F2328" ink={0} />
          </group>
        ))}
      </group>
      {/* Shelf with a coffee mug (accent) */}
      <Box size={[0.7, 0.04, 0.3]} position={[0.8, 0.95, BACK + 0.15]} color="#8A5A34" ink={3} />
      <Cyl r={0.06} h={0.12} position={[0.7, 1.03, BACK + 0.15]} color="#FFC928" ink={3} />
      <pointLight position={[0, 2.0, 0.2]} color="#FFE6B0" intensity={2.2} distance={5} decay={1.4} />
    </group>
  );
};
