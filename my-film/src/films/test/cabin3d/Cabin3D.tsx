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
import { MAIN, Toon } from "../../../characters/toon/Toon";
import { blobTexture, chartTexture, dayTexture, glowTexture, rugTexture, woodTexture } from "./textures";

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
const SUN = new THREE.Vector3(2.6, 6.0, -5); // sunlight comes from here, through the porthole
const PORT = new THREE.Vector3(0.95, 1.95, -2);
const LANTERN = { x: -0.55, y: 2.25, z: -0.75 };

// ---- Camera ----
export const cameraAt = (frame: number) => {
  const t = frame / 30;
  return {
    pos: new THREE.Vector3(0.1 + t * 0, 0.95, 3.3),
    target: new THREE.Vector3(0.0, 1.38, -0.8),
    fov: 64,
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

const Edges: React.FC<{ geometry: THREE.BufferGeometry; width?: number; angle?: number }> = ({ geometry, width = 6, angle = 25 }) => {
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
const Box: React.FC<BoxProps> = ({ size, position, rotation = [0, 0, 0], color = "#ffffff", map, ink = 6, shadow = true }) => {
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
      floor: woodTexture({ base: "#D0935A", planks: 8, seed: 3, repeat: [1, 1.2], vertical: true }),
      back: woodTexture({ base: "#C07A45", planks: 9, seed: 11, repeat: [1.4, 1] }),
      side: woodTexture({ base: "#A9653A", planks: 9, seed: 21, repeat: [1.6, 1] }),
      beam: woodTexture({ base: "#7E4626", planks: 3, seed: 5 }),
      night: dayTexture(),
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
        <Edges geometry={backGeo} width={6.5} />
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
  const wood = useMemo(() => woodTexture({ base: "#B0602E", planks: 4, seed: 9 }), []);
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

/** Fake volumetric sunbeam from the porthole to the floor, with dust drifting in it. */
const SunBeam: React.FC<{ frame: number }> = ({ frame }) => {
  const { mid, len, quat, end } = useMemo(() => {
    const dir = PORT.clone().sub(SUN).normalize();
    const t = PORT.y / -dir.y;
    const end = PORT.clone().add(dir.clone().multiplyScalar(t));
    const mid = PORT.clone().add(end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), PORT.clone().sub(end).normalize());
    return { mid, len: PORT.distanceTo(end), quat, end };
  }, []);
  const motes = useMemo(() => {
    const r = (i: number) => (Math.sin(i * 91.7) * 43758.5453) % 1;
    return Array.from({ length: 46 }, (_, i) => ({ t: Math.abs(r(i)), a: Math.abs(r(i + 7)) * Math.PI * 2, rr: Math.abs(r(i + 13)) * 0.4, s: 0.008 + Math.abs(r(i + 3)) * 0.012 }));
  }, []);
  return (
    <group>
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[0.3, 0.62, len, 32, 1, true]} />
        <meshBasicMaterial color="#FFE9B0" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
      <mesh position={[end.x, 0.016, end.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 40]} />
        <meshBasicMaterial color="#FFE3A0" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {motes.map((m, i) => {
        const tt = (m.t + frame * 0.0012 * (1 + (i % 3))) % 1;
        const p = PORT.clone().lerp(end, tt);
        const w = 0.3 + 0.3 * tt;
        return (
          <mesh key={i} position={[p.x + Math.cos(m.a + frame * 0.01) * m.rr * w, p.y + Math.sin(frame * 0.02 + i) * 0.03, p.z + Math.sin(m.a) * m.rr * w]}>
            <sphereGeometry args={[m.s, 6, 4]} />
            <meshBasicMaterial color="#FFF6D8" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Objects very close to the camera, drawn in their own layer in FRONT of the flat characters and
 *  strongly blurred, like a real lens: a barrel, a rope coil and a wooden post. */
const FrontProps: React.FC = () => {
  const wood = useMemo(() => woodTexture({ base: "#A0582C", planks: 10, seed: 31, vertical: true }), []);
  return (
    <group>
      {/* A low crate in the bottom-right corner */}
      <group position={[0.5, 0, 2.0]} rotation={[0, 0.35, 0]}>
        <Box size={[0.62, 0.46, 0.5]} position={[0, 0.23, 0]} color="#B5703A" map={wood} ink={6} />
        <Box size={[0.66, 0.07, 0.54]} position={[0, 0.42, 0]} color="#8A4F26" ink={5} />
        <Box size={[0.66, 0.07, 0.54]} position={[0, 0.06, 0]} color="#8A4F26" ink={5} />
      </group>
      <Box size={[0.14, 3.2, 0.14]} position={[-0.32, 1.6, 2.4]} color="#7E4626" map={wood} ink={6} />
    </group>
  );
};

const Scene: React.FC<{ layer: "back" | "front" }> = ({ layer }) => {
  const frame = useCurrentFrame();
  if (layer === "front")
    return (
      <>
        <CameraRig />
        <ambientLight color="#FFF1DE" intensity={1.4} />
        <hemisphereLight color="#FFF3D6" groundColor="#B7804F" intensity={1.0} />
        <directionalLight color="#FFE9B8" intensity={1.6} position={[2, 4, 4]} />
        <FrontProps />
      </>
    );
  return (
    <>
      <CameraRig />
      <color attach="background" args={["#8CC8F0"]} />
      <fog attach="fog" args={["#F6DDB4", 4.2, 13]} />
      <ambientLight color="#FFF1DE" intensity={1.25} />
      <hemisphereLight color="#FFF3D6" groundColor="#B7804F" intensity={1.0} />
      {/* Moonlight through the porthole: cool, casts the round window onto the room */}
      <directionalLight
        color="#FFE9B8"
        intensity={3.4}
        position={SUN.toArray() as [number, number, number]}
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
      <Rug />
      <SunBeam frame={frame} />
      <ContactShadow at={HERO} size={1.0} />
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
  const head = project(HERO.clone().add(new THREE.Vector3(0, 1.6, 0)));
  // The Toon character is about 720 px tall (feet to hat top) at scale 1.
  const heroScale = (feet.y - head.y) / 720;

  return (
    <AbsoluteFill style={{ background: "#120A05" }}>
      {/* BACK layer: the room, softly out of focus */}
      <AbsoluteFill style={{ filter: "blur(1.8px) saturate(1.15)" }}>
        <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 64, position: [0, 1, 3.3], near: 0.05, far: 100 }}>
          <Scene layer="back" />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* MIDDLE layer: the flat 2D characters, in sharp focus */}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Toon id="hero" x={feet.x} y={feet.y} scale={heroScale} look={MAIN} expr="sneaky" gaze={10} seed={1} />
        </svg>
      </AbsoluteFill>
      {/* FRONT layer: objects right in front of the lens, heavily blurred */}
      <AbsoluteFill style={{ filter: "blur(7px) saturate(1.1)" }}>
        <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: 64, position: [0, 1, 3.3], near: 0.05, far: 100 }}>
          <Scene layer="front" />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* Warm vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 42%, rgba(0,0,0,0) 45%, rgba(40,20,0,0.22) 100%)", pointerEvents: "none" }} />
      <div style={{ display: "none" }}>{frame}</div>
    </AbsoluteFill>
  );
};
