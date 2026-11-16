// Shared building blocks for the new channel's "3D world, 2D characters" look.
// <World3D> draws one shot in three layers: a slightly blurred 3D world (back), sharp flat 2D
// characters (middle, placed with the same camera), and a heavily blurred 3D foreground (front).
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { blobTexture } from "../films/test/cabin3d/textures";

export const W = 1080;
export const H = 1920;
export const INK3 = "#1a0f08";
export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export type Cam = { pos: THREE.Vector3; target: THREE.Vector3; fov: number };

/** Projects a 3D point to screen pixels with the given camera. */
export const projector = (c: Cam) => {
  const cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.05, 400);
  cam.position.copy(c.pos);
  cam.lookAt(c.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return (p: THREE.Vector3) => {
    const v = p.clone().project(cam);
    return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
  };
};
export type Project = ReturnType<typeof projector>;

/** Screen position and scale for a Toon character standing at a 3D floor spot, `heightM` metres tall. */
export const placeToon = (project: Project, at: THREE.Vector3, heightM = 1.6) => {
  const feet = project(at);
  const head = project(at.clone().add(v3(0, heightM, 0)));
  return { x: feet.x, y: feet.y, scale: (feet.y - head.y) / 720 };
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.copy(cam.pos);
  camera.fov = cam.fov;
  camera.near = 0.05;
  camera.far = 400;
  camera.lookAt(cam.target);
  camera.updateProjectionMatrix();
  return null;
};

// ---- Ink outlines ----
export const Edges: React.FC<{ geometry: THREE.BufferGeometry; width?: number; angle?: number }> = ({ geometry, width = 6, angle = 25 }) => {
  const obj = useMemo(() => {
    const g = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geometry, angle));
    return new LineSegments2(g, new LineMaterial({ color: INK3, linewidth: width, resolution: new THREE.Vector2(W, H) }));
  }, [geometry, width, angle]);
  return <primitive object={obj} />;
};

type P3 = [number, number, number];

export const Box: React.FC<{ size: P3; position: P3; rotation?: P3; color?: string; map?: THREE.Texture; ink?: number; emissive?: string }> = ({
  size,
  position,
  rotation = [0, 0, 0],
  color = "#ffffff",
  map,
  ink = 6,
  emissive,
}) => {
  const geo = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} map={map} roughness={0.85} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 0.6 : 0} />
      </mesh>
      {ink > 0 && <Edges geometry={geo} width={ink} />}
    </group>
  );
};

export const Cyl: React.FC<{ r: number; h: number; position: P3; rotation?: P3; color: string; seg?: number; ink?: number; r2?: number; map?: THREE.Texture; emissive?: string }> = ({
  r,
  h,
  position,
  rotation = [0, 0, 0],
  color,
  seg = 20,
  ink = 5,
  r2,
  map,
  emissive,
}) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r2 ?? r, h, seg), [r, r2, h, seg]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} map={map} roughness={0.8} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 1.2 : 0} />
      </mesh>
      {ink > 0 && <Edges geometry={geo} width={ink} angle={40} />}
    </group>
  );
};

/** Soft dark spot on the ground under a flat character. */
export const ContactShadow: React.FC<{ at: THREE.Vector3; size?: number; y?: number }> = ({ at, size = 1, y = 0.015 }) => {
  const tex = useMemo(() => blobTexture(), []);
  return (
    <mesh position={[at.x, at.y + y, at.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size * 0.45]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} opacity={0.8} />
    </mesh>
  );
};

/** Standard bright daylight rig. */
export const Daylight: React.FC<{ sun?: P3; sunColor?: string; amb?: number; sunI?: number; shadows?: boolean }> = ({
  sun = [6, 10, 6],
  sunColor = "#FFF1D2",
  amb = 1.2,
  sunI = 2.6,
  shadows = true,
}) => (
  <>
    <ambientLight color="#FFF4E6" intensity={amb} />
    <hemisphereLight color="#EAF6FF" groundColor="#C99A6A" intensity={0.9} />
    <directionalLight
      color={sunColor}
      intensity={sunI}
      position={sun}
      castShadow={shadows}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-camera-far={60}
      shadow-bias={-0.0008}
    />
  </>
);

/**
 * One shot in three layers. `back` and `front` are 3D scene contents (lights included by the caller);
 * `chars` draws the flat characters as SVG, given a projector for this camera.
 */
export const World3D: React.FC<{
  cam: Cam;
  back: React.ReactNode;
  front?: React.ReactNode;
  chars?: (project: Project) => React.ReactNode;
  bg: string;
  fog?: [string, number, number];
  backBlur?: number;
  frontBlur?: number;
}> = ({ cam, back, front, chars, bg, fog, backBlur = 1.6, frontBlur = 7 }) => {
  const project = projector(cam);
  const camProps = { fov: cam.fov, position: cam.pos.toArray() as P3, near: 0.05, far: 400 };
  return (
    <AbsoluteFill style={{ background: bg }}>
      <AbsoluteFill style={{ filter: `blur(${backBlur}px) saturate(1.12)` }}>
        <ThreeCanvas width={W} height={H} shadows="percentage" gl={{ antialias: true, preserveDrawingBuffer: true }} camera={camProps}>
          <CameraRig cam={cam} />
          <color attach="background" args={[bg]} />
          {fog && <fog attach="fog" args={fog} />}
          {back}
        </ThreeCanvas>
      </AbsoluteFill>
      {chars && (
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {chars(project)}
          </svg>
        </AbsoluteFill>
      )}
      {front && (
        <AbsoluteFill style={{ filter: `blur(${frontBlur}px) saturate(1.1)` }}>
          <ThreeCanvas width={W} height={H} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={camProps}>
            <CameraRig cam={cam} />
            <ambientLight color="#FFF1DE" intensity={1.4} />
            <hemisphereLight color="#FFF3D6" groundColor="#B7804F" intensity={1.0} />
            <directionalLight color="#FFE9B8" intensity={1.6} position={[2, 4, 4]} />
            {front}
          </ThreeCanvas>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Camera move helper: interpolate position/target between two keyframes with easing (k in 0..1). */
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.clone().lerp(b.pos, k),
  target: a.target.clone().lerp(b.target, k),
  fov: a.fov + (b.fov - a.fov) * k,
});
