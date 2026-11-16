// Style test "3D world": a real 3D captain's cabin built in code with Three.js, with our flat 2D
// ink-blot characters standing inside it. Background = 3D (lit, shadowed, ink outlines on every edge,
// slightly blurred); characters = flat SVG drawn on top, sharp.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Character, EMOTE } from "../../../components/Character";
import { INK_MAIN, InkDrop } from "../../../components/mascot";
import { skin } from "../../../components/memphis";
import { blobTexture, chartTexture, glowTexture, nightTexture, rugTexture, woodTexture } from "./textures";

const W = 1080;
const H = 1920;
const INK = "#1a0f08";
const RED = "#D7263D";

// ---- Room layout (metres). Floor at y=0, back wall at z=BACK, open towards the camera. ----
const ROOM_W = 3.8;
const BACK = -2;
const CEIL = 3.1;
const HERO = new THREE.Vector3(-0.35, 0, -0.35); // where the main character stands
const DESK = { x: 0.95, z: -1.55, top: 0.86 };
const LANTERN = { x: -0.55, y: 2.25, z: -0.75 };

// ---- Camera ----
export const cameraAt = (frame: number) => {
  const t = frame / 30;
  return {
    pos: new THREE.Vector3(0.1 + t * 0, 1.15, 3.6),
    target: new THREE.Vector3(0.05, 1.32, -0.8),
    fov: 58,
  };
};

/** Project a 3D point to screen pixels with the same camera the 3D canvas uses. */
const useProjector = () => {
  const frame = useCurrentFrame();
  return useMemo(() => {
    const c = cameraAt(frame);
    const cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.05, 100);
    cam.position.copy(c.pos);
    cam.lookAt(c.target);
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    return (p: THREE.Vector3) => {
      const v = p.clone().project(cam);
      return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
    };
  }, [frame]);
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = cameraAt(frame);
  camera.position.copy(c.pos);
  camera.fov = c.fov;
  camera.near = 0.05;
  camera.far = 100;
  camera.lookAt(c.target);
  camera.updateProjectionMatrix();
  return null;
};

// ---- Ink outlines: thick black lines on every hard edge of a geometry. ----
const lineMat = (width: number) => new LineMaterial({ color: INK, linewidth: width, resolution: new THREE.Vector2(W, H) });

const Edges: React.FC<{ geometry: THREE.BufferGeometry; width?: number; angle?: number }> = ({ geometry, width = 4.6, angle = 25 }) => {
  const obj = useMemo(() => {
    const edges = new THREE.EdgesGeometry(geometry, angle);
    const g = new LineSegmentsGeometry().fromEdgesGeometry(edges);
    return new LineSegments2(g, lineMat(width));
  }, [geometry, width, angle]);
  return <primitive object={obj} />;
};

type BoxProps = {
  size: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  map?: THREE.Texture;
  ink?: number;
  shadow?: boolean;
};

/** A painted box with ink outlines that casts and receives shadows. */
const Box: React.FC<BoxProps> = ({ size, position, rotation = [0, 0, 0], color = "#ffffff", map, ink = 4.6, shadow = true }) => {
  const geo = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow={shadow} receiveShadow>
        <meshStandardMaterial color={color} map={map} roughness={0.9} />
      </mesh>
      {ink > 0 && <Edges geometry={geo} width={ink} />}
    </group>
  );
};

const Cyl: React.FC<{ r: number; h: number; position: [number, number, number]; rotation?: [number, number, number]; color: string; seg?: number; ink?: number; emissive?: string }> = ({
  r,
  h,
  position,
  rotation = [0, 0, 0],
  color,
  seg = 18,
  ink = 3,
  emissive,
}) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r, h, seg), [r, h, seg]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 1.4 : 0} />
      </mesh>
      {ink > 0 && <Edges geometry={geo} width={ink} angle={40} />}
    </group>
  );
};

// ---- The room ----
const Room: React.FC = () => {
  const tex = useMemo(
    () => ({
      floor: woodTexture({ base: "#8E6646", planks: 8, seed: 3, repeat: [1, 1.2], vertical: true }),
      back: woodTexture({ base: "#6E4C36", planks: 9, seed: 11, repeat: [1.4, 1] }),
      side: woodTexture({ base: "#5C3F2C", planks: 9, seed: 21, repeat: [1.6, 1] }),
      beam: woodTexture({ base: "#4E2E18", planks: 3, seed: 5 }),
      night: nightTexture(),
    }),
    [],
  );

  // Back wall with a round porthole cut out of it.
  const port = { x: DESK.x, y: 1.95, r: 0.36 };
  const backGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-ROOM_W / 2, 0);
    s.lineTo(ROOM_W / 2, 0);
    s.lineTo(ROOM_W / 2, CEIL);
    s.lineTo(-ROOM_W / 2, CEIL);
    s.closePath();
    const hole = new THREE.Path();
    hole.absarc(port.x, port.y, port.r, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false, curveSegments: 40 });
    // Scale UVs from metres to texture repeats.
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / ROOM_W + 0.5, uv.getY(i) / CEIL);
    return g;
  }, [port.x, port.y, port.r]);

  const floorGeo = useMemo(() => new THREE.PlaneGeometry(ROOM_W, 7), []);
  const sideGeo = useMemo(() => new THREE.PlaneGeometry(7, CEIL), []);

  return (
    <group>
      {/* Floor */}
      <mesh geometry={floorGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BACK + 3.5]} receiveShadow>
        <meshStandardMaterial map={tex.floor} roughness={0.95} />
      </mesh>
      {/* Back wall */}
      <group position={[0, 0, BACK - 0.12]}>
        <mesh geometry={backGeo} castShadow receiveShadow>
          <meshStandardMaterial map={tex.back} roughness={0.95} />
        </mesh>
        <Edges geometry={backGeo} width={5} />
      </group>
      {/* Side walls */}
      {[-1, 1].map((d) => (
        <mesh key={d} geometry={sideGeo} rotation={[0, -d * (Math.PI / 2), 0]} position={[d * (ROOM_W / 2), CEIL / 2, BACK + 3.5]} receiveShadow>
          <meshStandardMaterial map={tex.side} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Corner posts, skirting boards and ceiling beams */}
      {[-1, 1].map((d) => (
        <Box key={`post${d}`} size={[0.2, CEIL, 0.2]} position={[d * (ROOM_W / 2 - 0.1), CEIL / 2, BACK + 0.1]} color="#5A341C" map={tex.beam} />
      ))}
      <Box size={[ROOM_W, 0.14, 0.06]} position={[0, 0.07, BACK + 0.03]} color="#4A2A16" />
      {[-1, 1].map((d) => (
        <Box key={`sk${d}`} size={[0.06, 0.14, 7]} position={[d * (ROOM_W / 2 - 0.03), 0.07, BACK + 3.5]} color="#4A2A16" />
      ))}
      {[BACK + 0.2, -0.7, 0.9, 2.5].map((z) => (
        <Box key={`beam${z}`} size={[ROOM_W, 0.22, 0.24]} position={[0, CEIL - 0.11, z]} color="#5A341C" map={tex.beam} />
      ))}
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL, BACK + 3.5]}>
        <planeGeometry args={[ROOM_W, 7]} />
        <meshStandardMaterial map={tex.side} roughness={1} />
      </mesh>

      {/* Porthole: brass ring, bolts, faint glass, and the moonlit sea outside */}
      <group position={[port.x, port.y, BACK + 0.02]}>
        <mesh castShadow>
          <torusGeometry args={[port.r + 0.04, 0.07, 14, 48]} />
          <meshStandardMaterial color="#C9962E" metalness={0.6} roughness={0.35} />
        </mesh>
        <Edges geometry={useMemo(() => new THREE.TorusGeometry(port.r + 0.04, 0.07, 6, 48), [port.r])} width={3} angle={60} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * (port.r + 0.16), Math.sin(a) * (port.r + 0.16), 0.02]}>
              <sphereGeometry args={[0.03, 10, 8]} />
              <meshStandardMaterial color="#8C6A22" metalness={0.5} roughness={0.4} />
            </mesh>
          );
        })}
      </group>
      <mesh position={[port.x, port.y, BACK - 0.9]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial map={tex.night} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Desk: React.FC<{ frame: number }> = ({ frame }) => {
  const wood = useMemo(() => woodTexture({ base: "#7B4422", planks: 4, seed: 9 }), []);
  const chart = useMemo(() => chartTexture(4), []);
  const glow = useMemo(() => glowTexture("#FFB347"), []);
  const flick = 1 + 0.08 * Math.sin(frame * 0.9) + 0.05 * Math.sin(frame * 2.3);
  const { x, z, top } = DESK;
  return (
    <group>
      <Box size={[1.5, 0.08, 0.78]} position={[x, top, z]} color="#8A4F28" map={wood} />
      <Box size={[1.42, 0.2, 0.7]} position={[x, top - 0.14, z]} color="#6A3A1C" map={wood} />
      {[-1, 1].map((dx) =>
        [-1, 1].map((dz) => <Box key={`${dx}${dz}`} size={[0.08, top - 0.24, 0.08]} position={[x + dx * 0.66, (top - 0.24) / 2, z + dz * 0.31]} color="#5A3018" />),
      )}
      {/* Drawer knobs */}
      {[-0.35, 0.35].map((dx) => (
        <mesh key={dx} position={[x + dx, top - 0.14, z + 0.36]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#C9962E" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* Sea chart lying on the desk, slightly askew */}
      <mesh position={[x - 0.1, top + 0.045, z + 0.06]} rotation={[-Math.PI / 2, 0, 0.12]} receiveShadow>
        <planeGeometry args={[0.92, 0.66]} />
        <meshStandardMaterial map={chart} roughness={1} />
      </mesh>
      {/* Books */}
      <Box size={[0.32, 0.07, 0.24]} position={[x + 0.52, top + 0.075, z - 0.18]} color="#2E4C6E" />
      <Box size={[0.3, 0.06, 0.22]} position={[x + 0.53, top + 0.14, z - 0.18]} rotation={[0, 0.2, 0]} color={RED} />
      {/* Green glass bottles */}
      <Cyl r={0.05} h={0.26} position={[x + 0.18, top + 0.17, z - 0.25]} color="#2E7D5B" ink={2.4} />
      <Cyl r={0.018} h={0.08} position={[x + 0.18, top + 0.34, z - 0.25]} color="#2E7D5B" ink={2} />
      <Cyl r={0.04} h={0.18} position={[x + 0.3, top + 0.13, z - 0.3]} color="#3F8F6A" ink={2.4} />
      {/* Candle, flame, light */}
      <Cyl r={0.045} h={0.05} position={[x - 0.55, top + 0.065, z - 0.2]} color="#C9962E" ink={2} />
      <Cyl r={0.028} h={0.2} position={[x - 0.55, top + 0.19, z - 0.2]} color="#F3E7C9" ink={2} />
      <mesh position={[x - 0.55, top + 0.32, z - 0.2]} scale={[1, 1.6 * flick, 1]}>
        <sphereGeometry args={[0.025, 10, 8]} />
        <meshBasicMaterial color="#FFE08A" toneMapped={false} />
      </mesh>
      <sprite position={[x - 0.55, top + 0.32, z - 0.18]} scale={[0.5 * flick, 0.5 * flick, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight position={[x - 0.55, top + 0.36, z - 0.05]} color="#FFB04A" intensity={1.6 * flick} distance={3} decay={2} />
    </group>
  );
};

const Chest: React.FC = () => {
  const wood = useMemo(() => woodTexture({ base: "#6E3E1E", planks: 4, seed: 15 }), []);
  const lidGeo = useMemo(() => new THREE.CylinderGeometry(0.26, 0.26, 0.9, 20, 1, false, 0, Math.PI), []);
  return (
    <group position={[-1.15, 0, -1.4]} rotation={[0, 0.3, 0]}>
      <Box size={[0.9, 0.5, 0.52]} position={[0, 0.25, 0]} color="#7A4522" map={wood} />
      <group position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={lidGeo} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#7A4522" map={wood} roughness={0.9} />
        </mesh>
      </group>
      {[-0.3, 0.3].map((dx) => (
        <Box key={dx} size={[0.07, 0.52, 0.54]} position={[dx, 0.26, 0]} color="#2B2B2B" ink={2.5} />
      ))}
      <Box size={[0.12, 0.14, 0.04]} position={[0, 0.42, 0.27]} color="#C9962E" ink={2.5} />
    </group>
  );
};

const Lantern: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = useMemo(() => glowTexture("#FFB347"), []);
  const swing = Math.sin(frame / 22) * 0.12;
  const flick = 1 + 0.06 * Math.sin(frame * 0.7) + 0.04 * Math.sin(frame * 1.9);
  const hook = CEIL - 0.22;
  const len = hook - LANTERN.y;
  return (
    <group position={[LANTERN.x, hook, LANTERN.z]} rotation={[0, 0, swing]}>
      {/* Rope */}
      <Cyl r={0.012} h={len - 0.2} position={[0, -(len - 0.2) / 2, 0]} color="#3A2614" seg={6} ink={0} />
      <group position={[0, -len, 0]}>
        <Cyl r={0.13} h={0.04} position={[0, 0.17, 0]} color="#2B2B2B" ink={2.5} />
        <Cyl r={0.15} h={0.05} position={[0, -0.16, 0]} color="#2B2B2B" ink={2.5} />
        <mesh>
          <cylinderGeometry args={[0.11, 0.12, 0.3, 16]} />
          <meshBasicMaterial color="#FFD27A" toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return <Box key={i} size={[0.025, 0.32, 0.025]} position={[Math.cos(a) * 0.13, 0, Math.sin(a) * 0.13]} color="#2B2B2B" ink={1.8} shadow={false} />;
        })}
        <mesh position={[0, 0.24, 0]}>
          <torusGeometry args={[0.05, 0.012, 6, 16]} />
          <meshStandardMaterial color="#2B2B2B" />
        </mesh>
        <sprite scale={[1.5 * flick, 1.5 * flick, 1]}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.9} />
        </sprite>
        <pointLight
          color="#FFA94D"
          intensity={5 * flick}
          distance={9}
          decay={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.002}
          position={[0, -0.05, 0.3]}
        />
      </group>
    </group>
  );
};

/** Things in the foreground (close to the camera) to give depth: a coiled rope and a barrel. */
const Foreground: React.FC = () => {
  const wood = useMemo(() => woodTexture({ base: "#7A4522", planks: 10, seed: 31, vertical: true }), []);
  return (
    <group>
      <group position={[0.95, 0, 1.75]}>
        <Cyl r={0.38} h={0.95} position={[0, 0.475, 0]} color="#8A5530" seg={22} ink={3.4} />
        <mesh position={[0, 0.475, 0]} castShadow>
          <cylinderGeometry args={[0.385, 0.385, 0.95, 22, 1, true]} />
          <meshStandardMaterial map={wood} roughness={0.9} />
        </mesh>
        {[0.18, 0.77].map((y) => (
          <Cyl key={y} r={0.395} h={0.06} position={[0, y, 0]} color="#2B2B2B" seg={22} ink={2.5} />
        ))}
      </group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.75, 0.05 + i * 0.07, 2.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.32 - i * 0.07, 0.04, 8, 30]} />
          <meshStandardMaterial color="#B88A55" roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

/** Wall chart in a frame, on the left of the back wall. */
const WallChart: React.FC = () => {
  const chart = useMemo(() => chartTexture(12), []);
  return (
    <group position={[-0.95, 1.75, BACK + 0.03]} rotation={[0, 0, -0.03]}>
      <Box size={[1.0, 0.76, 0.04]} position={[0, 0, 0]} color="#3E2412" />
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.88, 0.64]} />
        <meshStandardMaterial map={chart} roughness={1} />
      </mesh>
    </group>
  );
};

/** A blue rug on the floor under the hero: a splash of cool colour against all the wood. */
const Rug: React.FC = () => {
  const tex = useMemo(() => rugTexture(), []);
  return (
    <mesh position={[-0.15, 0.006, 0.05]} rotation={[-Math.PI / 2, 0, 0.06]} receiveShadow>
      <planeGeometry args={[2.0, 1.25]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  );
};

/** Soft dark spot on the floor under each flat character, so they sit in the 3D world. */
const ContactShadow: React.FC<{ at: THREE.Vector3; size: number }> = ({ at, size }) => {
  const tex = useMemo(() => blobTexture(), []);
  return (
    <mesh position={[at.x, 0.014, at.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size * 0.45]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} opacity={0.8} />
    </mesh>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <CameraRig />
      <color attach="background" args={["#120A05"]} />
      <ambientLight color="#4A4A5E" intensity={0.6} />
      <hemisphereLight color="#FFD9A8" groundColor="#2A160A" intensity={0.35} />
      {/* Moonlight through the porthole: cool, casts the round window onto the room */}
      <directionalLight
        color="#8FB0F0"
        intensity={2.2}
        position={[DESK.x + 1.2, 3.6, BACK - 4]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <Room />
      <WallChart />
      <Desk frame={frame} />
      <Chest />
      <Lantern frame={frame} />
      <Foreground />
      <Rug />
      <ContactShadow at={HERO} size={0.9} />
    </>
  );
};

/** The whole picture: blurred 3D cabin, sharp flat characters, warm vignette. */
export const Cabin3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const project = useProjector();

  // Hero: feet on the floor at HERO, about 1.5 m tall in the room.
  const feet = project(HERO);
  const head = project(HERO.clone().add(new THREE.Vector3(0, 1.5, 0)));
  const heroScale = (feet.y - head.y) / 420;
  // Mascot sits on the desk next to the candle.
  const deskSpot = project(new THREE.Vector3(DESK.x + 0.15, DESK.top + 0.04, DESK.z + 0.22));
  const deskUp = project(new THREE.Vector3(DESK.x + 0.15, DESK.top + 0.34, DESK.z + 0.22));
  const dropScale = (deskSpot.y - deskUp.y) / 175;

  return (
    <AbsoluteFill style={{ background: "#120A05" }}>
      <AbsoluteFill style={{ filter: "blur(1.1px) saturate(1.05)" }}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          camera={{ fov: 52, position: [0, 1.4, 4.3], near: 0.05, far: 100 }}
        >
          <Scene />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* Flat 2D characters, sharp, on top of the 3D world */}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g style={{ filter: "drop-shadow(0 0 10px rgba(255,170,80,0.18))" }}>
            <InkDrop x={deskSpot.x} y={deskSpot.y} s={dropScale} mood="shock" seed={2} />
            <Character {...INK_MAIN} {...EMOTE.shock} x={feet.x} y={feet.y} scale={heroScale} skin={skin(RED)} look={12} seed={1} />
          </g>
        </svg>
      </AbsoluteFill>
      {/* Warm vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 42%, rgba(0,0,0,0) 45%, rgba(20,8,0,0.55) 100%)", pointerEvents: "none" }} />
      <div style={{ display: "none" }}>{frame}</div>
    </AbsoluteFill>
  );
};
