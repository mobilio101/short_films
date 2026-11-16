// 3D sets for "Dazzle Ships": the sea and dock, the ships, Wilkinson's studio, a U-boat's control room.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Edges } from "../../world3d/kit";
import { dazzleTexture, dayTexture, glowTexture, greyHullTexture, plasterTexture, seaTexture, sketchTexture, skyTexture, woodTexture } from "../../world3d/textures";

type P3 = [number, number, number];

/** Give a geometry UVs taken from its world-space position, so a texture wraps every face evenly. */
const projectUV = (geo: THREE.BufferGeometry, s: number) => {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    if (ny >= nx && ny >= nz) (uv[i * 2] = x * s), (uv[i * 2 + 1] = z * s);
    else if (nx >= nz) (uv[i * 2] = z * s), (uv[i * 2 + 1] = y * s * 2);
    else (uv[i * 2] = x * s), (uv[i * 2 + 1] = y * s * 2);
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
};

const PaintedBox: React.FC<{ size: P3; position: P3; map: THREE.Texture; s: number; ink?: number }> = ({ size, position, map, s, ink = 6 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(...size);
    g.translate(...position);
    return projectUV(g, s);
  }, [size[0], size[1], size[2], position[0], position[1], position[2], s]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={map} roughness={0.8} />
      </mesh>
      {ink > 0 && <Edges geometry={geo} width={ink} />}
    </group>
  );
};

const PaintedCyl: React.FC<{ r: number; h: number; position: P3; map: THREE.Texture; s: number; ink?: number }> = ({ r, h, position, map, s, ink = 5 }) => {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(r, r * 1.05, h, 24);
    g.translate(...position);
    return projectUV(g, s);
  }, [r, h, position[0], position[1], position[2], s]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={map} roughness={0.8} />
      </mesh>
      {ink > 0 && <Edges geometry={geo} width={ink} angle={40} />}
    </group>
  );
};

/**
 * A cartoon warship, bow pointing +x, waterline at y=0. Length about 14 m.
 * `paint` = a dazzle seed, or "grey" for an unpainted ship.
 */
export const Ship: React.FC<{ paint: number | "grey"; position?: P3; rotation?: P3; scale?: number; ink?: number; smoke?: boolean; frame?: number }> = ({
  paint,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  ink = 6,
  smoke = false,
  frame = 0,
}) => {
  const map = useMemo(() => (paint === "grey" ? greyHullTexture() : dazzleTexture(paint)), [paint]);
  const deck = useMemo(() => woodTexture({ base: "#B08458", planks: 6, seed: 4 }), []);
  const L = 14, B = 2.8, Hh = 2.0;
  const hull = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-L / 2, -B / 2);
    s.lineTo(L / 2 - 3, -B / 2);
    s.quadraticCurveTo(L / 2 - 0.6, -B / 4, L / 2, 0);
    s.quadraticCurveTo(L / 2 - 0.6, B / 4, L / 2 - 3, B / 2);
    s.lineTo(-L / 2 + 0.6, B / 2);
    s.quadraticCurveTo(-L / 2, B / 2, -L / 2, B / 2 - 0.6);
    s.lineTo(-L / 2, -B / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: Hh, bevelEnabled: false, curveSegments: 12 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.6, 0);
    g.computeVertexNormals();
    return projectUV(g, 1 / 7);
  }, []);
  const deckGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-L / 2 + 0.1, -B / 2 + 0.1);
    s.lineTo(L / 2 - 3, -B / 2 + 0.1);
    s.quadraticCurveTo(L / 2 - 0.7, -B / 4, L / 2 - 0.15, 0);
    s.quadraticCurveTo(L / 2 - 0.7, B / 4, L / 2 - 3, B / 2 - 0.1);
    s.lineTo(-L / 2 + 0.1, B / 2 - 0.1);
    s.lineTo(-L / 2 + 0.1, -B / 2 + 0.1);
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2);
    g.translate(0, Hh - 0.6 + 0.01, 0);
    return g;
  }, []);
  const top = Hh - 0.6;
  const smokeT = (frame % 90) / 90;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={hull} castShadow receiveShadow>
        <meshStandardMaterial map={map} roughness={0.75} />
      </mesh>
      <Edges geometry={hull} width={ink} angle={30} />
      <mesh geometry={deckGeo} receiveShadow>
        <meshStandardMaterial map={deck} roughness={0.9} />
      </mesh>
      {/* Bridge and superstructure */}
      <PaintedBox size={[3.2, 1.5, 1.9]} position={[-0.6, top + 0.75, 0]} map={map} s={1 / 5} ink={ink} />
      <PaintedBox size={[1.8, 0.9, 1.5]} position={[-0.2, top + 1.95, 0]} map={map} s={1 / 5} ink={ink} />
      <Box size={[1.85, 0.25, 1.55]} position={[-0.2, top + 2.2, 0]} color="#2B2B2B" ink={ink * 0.8} />
      {/* Windows on the bridge */}
      {[-0.7, -0.2, 0.3].map((x) => (
        <Box key={x} size={[0.3, 0.2, 0.02]} position={[x, top + 2.05, 0.76]} color="#BFE6FF" ink={3} />
      ))}
      {/* Funnels */}
      <PaintedCyl r={0.42} h={2.3} position={[-2.6, top + 1.4, 0]} map={map} s={1 / 4} ink={ink} />
      <PaintedCyl r={0.42} h={2.0} position={[-3.8, top + 1.25, 0]} map={map} s={1 / 4} ink={ink} />
      <Cyl r={0.44} h={0.2} position={[-2.6, top + 2.6, 0]} color="#1E1E1E" ink={ink * 0.7} />
      <Cyl r={0.44} h={0.2} position={[-3.8, top + 2.3, 0]} color="#1E1E1E" ink={ink * 0.7} />
      {smoke &&
        [0, 1, 2].map((i) => {
          const t = (smokeT + i / 3) % 1;
          return (
            <mesh key={i} position={[-2.6 - t * 2.2, top + 2.9 + t * 2.4, 0]} scale={0.35 + t * 0.9}>
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color="#E8E8E8" transparent opacity={0.85 * (1 - t)} roughness={1} />
            </mesh>
          );
        })}
      {/* Masts */}
      <Cyl r={0.06} h={4.2} position={[1.4, top + 2.1, 0]} color="#3A3A3A" ink={3} seg={8} />
      <Box size={[0.08, 0.08, 1.6]} position={[1.4, top + 3.6, 0]} color="#3A3A3A" ink={3} />
      <Cyl r={0.05} h={3.0} position={[-5.6, top + 1.5, 0]} color="#3A3A3A" ink={3} seg={8} />
      {/* Gun turrets */}
      {[
        [3.6, 1],
        [-5.0, -1],
      ].map(([x, dir]) => (
        <group key={x} position={[x, top + 0.35, 0]}>
          <PaintedBox size={[1.3, 0.7, 1.3]} position={[0, 0, 0]} map={map} s={1 / 4} ink={ink} />
          <Cyl r={0.09} h={1.6} position={[dir * 1.2, 0.1, 0.2]} rotation={[0, 0, Math.PI / 2]} color="#2B2B2B" ink={3} seg={10} />
          <Cyl r={0.09} h={1.6} position={[dir * 1.2, 0.1, -0.2]} rotation={[0, 0, Math.PI / 2]} color="#2B2B2B" ink={3} seg={10} />
        </group>
      ))}
    </group>
  );
};

/** The bright sea and sky. The water drifts with `frame`. */
export const SeaAndSky: React.FC<{ frame: number }> = ({ frame }) => {
  const sea = useMemo(() => seaTexture(), []);
  const sky = useMemo(() => skyTexture(), []);
  sea.offset.set(frame * 0.0009, frame * 0.0016);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial map={sea} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh>
        <sphereGeometry args={[250, 32, 16]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} />
      </mesh>
    </group>
  );
};

/** A white foam ring around something sitting in the water. */
export const Foam: React.FC<{ position: P3; size: [number, number]; frame: number }> = ({ position, size, frame }) => (
  <mesh position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0] * (1 + 0.03 * Math.sin(frame / 7)), size[1], 1]}>
    <ringGeometry args={[0.92, 1.0, 48]} />
    <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
  </mesh>
);

/** A wooden dock along the x axis at z in [z0-depth, z0], top at y = 0.6. */
export const Dock: React.FC<{ z0?: number; depth?: number; length?: number }> = ({ z0 = 12, depth = 10, length = 40 }) => {
  const wood = useMemo(() => woodTexture({ base: "#C48A55", planks: 10, seed: 22, repeat: [6, 1], vertical: true }), []);
  return (
    <group>
      <Box size={[length, 0.3, depth]} position={[0, 0.45, z0 - depth / 2]} color="#D49A62" map={wood} ink={6} />
      {Array.from({ length: Math.floor(length / 3) }, (_, i) => -length / 2 + 1.5 + i * 3).map((x) => (
        <Cyl key={x} r={0.16} h={1.6} position={[x, -0.2, z0 - depth + 0.2]} color="#7A4A28" ink={4} seg={10} />
      ))}
      {[-4, 3, 9].map((x) => (
        <group key={x} position={[x, 0.6, z0 - depth + 0.45]}>
          <Cyl r={0.16} h={0.35} position={[0, 0.17, 0]} color="#2B2B2B" ink={4} seg={12} />
          <Cyl r={0.24} h={0.08} position={[0, 0.38, 0]} color="#2B2B2B" ink={4} seg={12} />
        </group>
      ))}
    </group>
  );
};

/**
 * A far shore across the harbour: low hills, warehouses and cranes. Placed far away so the fog turns
 * it pale blue, which tells the eye how deep the scene goes.
 */
export const Coast: React.FC<{ z?: number }> = ({ z = -75 }) => (
  <group position={[0, 0, z]}>
    {[
      [-60, 9, 26],
      [-28, 13, 30],
      [8, 10, 34],
      [44, 14, 30],
      [78, 9, 26],
    ].map(([x, h, r], i) => (
      <mesh key={i} position={[x, 0, -12 - (i % 2) * 6]} scale={[1, h / r, 0.5]}>
        <sphereGeometry args={[r, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={i % 2 ? "#4E8F6A" : "#5FA27A"} roughness={1} />
      </mesh>
    ))}
    {[-30, -18, -8, 14, 26, 38].map((x, i) => (
      <Box key={x} size={[6 + (i % 3) * 2, 3 + (i % 2) * 2.5, 4]} position={[x, 1.5 + (i % 2) * 1.25, 0]} color={["#D8C3A0", "#C9744A", "#E4D9C4"][i % 3]} ink={0} />
    ))}
    {[-22, 20].map((x) => (
      <group key={x} position={[x, 0, 2]}>
        <Box size={[0.6, 12, 0.6]} position={[0, 6, 0]} color="#D7263D" ink={0} />
        <Box size={[9, 0.6, 0.6]} position={[2.5, 11.5, 0]} color="#D7263D" ink={0} />
      </group>
    ))}
  </group>
);

/** A thick iron mooring post with a loop of rope: a good blurry foreground shape. */
export const Bollard: React.FC<{ position: P3 }> = ({ position }) => (
  <group position={position}>
    <Cyl r={0.22} h={0.55} position={[0, 0.27, 0]} color="#2B2B2B" ink={5} seg={16} />
    <Cyl r={0.32} h={0.1} position={[0, 0.58, 0]} color="#2B2B2B" ink={5} seg={16} />
    <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.3, 0.06, 8, 24]} />
      <meshStandardMaterial color="#D9B77A" roughness={1} />
    </mesh>
  </group>
);

/** A rope coil lying on the planks. */
export const RopeCoil: React.FC<{ position: P3 }> = ({ position }) => (
  <group position={position}>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0, 0.05 + i * 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38 - i * 0.07, 0.055, 8, 28]} />
        <meshStandardMaterial color="#D9B77A" roughness={1} />
      </mesh>
    ))}
  </group>
);

/** Stacked crates and paint pots on the dock (good foreground props). */
export const Crates: React.FC<{ position: P3; rotation?: number }> = ({ position, rotation = 0 }) => {
  const wood = useMemo(() => woodTexture({ base: "#B9733C", planks: 5, seed: 41 }), []);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box size={[0.9, 0.7, 0.8]} position={[0, 0.35, 0]} color="#C27A40" map={wood} ink={6} />
      <Box size={[0.7, 0.55, 0.6]} position={[0.1, 0.98, 0]} color="#C27A40" map={wood} ink={6} />
      {[
        ["#F2363B", -0.75],
        ["#2D7FF9", -1.25],
        ["#FFC928", -1.0],
      ].map(([c, x], i) => (
        <group key={i} position={[x as number, 0, 0.25 - i * 0.35]}>
          <Cyl r={0.2} h={0.36} position={[0, 0.18, 0]} color="#C9CED6" ink={4} seg={16} />
          <Cyl r={0.19} h={0.03} position={[0, 0.37, 0]} color={c as string} ink={0} seg={16} />
        </group>
      ))}
    </group>
  );
};

/** Wilkinson's studio: plaster walls, wood floor, a big skylight window, easels, tables of model ships. */
export const Studio: React.FC<{ frame: number; turntable?: number; showTurntable?: boolean; committee?: boolean }> = ({ frame, turntable = 0, showTurntable = false, committee = false }) => {
  const wall = useMemo(() => plasterTexture("#9ED8CF", 7), []);
  const side = useMemo(() => plasterTexture("#F2D6A2", 8), []);
  const floor = useMemo(() => woodTexture({ base: "#D39A5E", planks: 8, seed: 13, repeat: [1, 1.4], vertical: true }), []);
  const day = useMemo(() => dayTexture(), []);
  const sketches = useMemo(() => [sketchTexture(3), sketchTexture(8), sketchTexture(15)], []);
  const glow = useMemo(() => glowTexture("#FFE6A8"), []);
  const RW = 7, BACK = -3, CEIL = 3.6;
  const winGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-RW / 2, 0);
    s.lineTo(RW / 2, 0);
    s.lineTo(RW / 2, CEIL);
    s.lineTo(-RW / 2, CEIL);
    s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(0.4, 1.4);
    hole.lineTo(2.9, 1.4);
    hole.lineTo(2.9, 3.3);
    hole.lineTo(0.4, 3.3);
    hole.closePath();
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / RW + 0.5, uv.getY(i) / CEIL);
    return g;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BACK + 4]} receiveShadow>
        <planeGeometry args={[RW, 8]} />
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      <group position={[0, 0, BACK - 0.12]}>
        <mesh geometry={winGeo} castShadow receiveShadow>
          <meshStandardMaterial map={wall} roughness={0.95} />
        </mesh>
        <Edges geometry={winGeo} width={6.5} />
      </group>
      {/* Window frame bars and the sky outside */}
      <Box size={[0.08, 1.9, 0.08]} position={[1.65, 2.35, BACK + 0.02]} color="#FFFFFF" ink={4} />
      <Box size={[2.5, 0.08, 0.08]} position={[1.65, 2.35, BACK + 0.02]} color="#FFFFFF" ink={4} />
      <mesh position={[1.65, 2.35, BACK - 1.2]}>
        <planeGeometry args={[5, 4]} />
        <meshBasicMaterial map={day} toneMapped={false} fog={false} />
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} rotation={[0, -d * (Math.PI / 2), 0]} position={[d * (RW / 2), CEIL / 2, BACK + 4]} receiveShadow>
          <planeGeometry args={[8, CEIL]} />
          <meshStandardMaterial map={side} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Box size={[RW, 0.16, 0.08]} position={[0, 0.08, BACK + 0.04]} color="#2F6E66" ink={5} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL, BACK + 4]}>
        <planeGeometry args={[RW, 8]} />
        <meshStandardMaterial color="#F7EBD3" roughness={1} />
      </mesh>
      {/* Ship sketches pinned on the wall */}
      {[
        [-2.4, 2.4, 0.02],
        [-1.1, 2.6, -0.03],
        [-1.8, 1.45, 0.04],
      ].map(([x, y, rz], i) => (
        <group key={i} position={[x, y, BACK + 0.02]} rotation={[0, 0, rz]}>
          <mesh>
            <planeGeometry args={[1.05, 0.74]} />
            <meshStandardMaterial map={sketches[i]} roughness={1} />
          </mesh>
          <mesh position={[0, 0.3, 0.02]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color="#F2363B" />
          </mesh>
        </group>
      ))}
      {/* Sunbeam from the window */}
      <mesh position={[1.2, 1.6, BACK + 1.4]} rotation={[0.9, 0, 0.25]}>
        <cylinderGeometry args={[0.9, 1.4, 3.6, 24, 1, true]} />
        <meshBasicMaterial color="#FFF0C0" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
      {/* Work table along the right with model ships and paint pots */}
      <Box size={[2.2, 0.08, 1.0]} position={[2.2, 0.9, BACK + 1.1]} color="#C98A52" ink={6} />
      {[-0.95, 0.95].map((dx) => [-0.4, 0.4].map((dz) => <Box key={`${dx}${dz}`} size={[0.08, 0.86, 0.08]} position={[2.2 + dx, 0.43, BACK + 1.1 + dz]} color="#8A5530" ink={4} />))}
      <Ship paint={21} position={[1.9, 0.98, BACK + 1.0]} scale={0.07} rotation={[0, 0.3, 0]} ink={2.5} />
      <Ship paint={34} position={[2.7, 0.98, BACK + 1.25]} scale={0.06} rotation={[0, -0.5, 0]} ink={2.5} />
      {[
        ["#F2363B", 1.4],
        ["#2D7FF9", 1.62],
        ["#141414", 1.84],
        ["#FFFFFF", 3.0],
      ].map(([c, x], i) => (
        <group key={i} position={[x as number, 0.94, BACK + 1.45]}>
          <Cyl r={0.09} h={0.14} position={[0, 0.07, 0]} color="#C9CED6" ink={3} seg={12} />
          <Cyl r={0.085} h={0.02} position={[0, 0.14, 0]} color={c as string} ink={0} seg={12} />
        </group>
      ))}
      {/* An easel on the left with a big ship design */}
      <group position={[-2.3, 0, BACK + 1.6]} rotation={[0, 0.35, 0]}>
        <Box size={[0.06, 2.0, 0.06]} position={[-0.45, 1.0, 0]} rotation={[0, 0, 0.08]} color="#8A5530" ink={4} />
        <Box size={[0.06, 2.0, 0.06]} position={[0.45, 1.0, 0]} rotation={[0, 0, -0.08]} color="#8A5530" ink={4} />
        <Box size={[0.06, 1.8, 0.06]} position={[0, 0.9, -0.4]} rotation={[0.25, 0, 0]} color="#8A5530" ink={4} />
        <mesh position={[0, 1.45, 0.05]}>
          <planeGeometry args={[1.2, 0.85]} />
          <meshStandardMaterial map={sketches[1]} roughness={1} />
        </mesh>
        <Box size={[1.2, 0.04, 0.12]} position={[0, 1.0, 0.06]} color="#8A5530" ink={3} />
      </group>
      {/* The test rig: a turntable with a model ship, and a brass periscope on a stand */}
      {showTurntable && (
        <group>
          <Cyl r={0.7} h={0.8} position={[0.6, 0.4, BACK + 2.5]} color="#5B3A22" ink={6} seg={28} />
          <group position={[0.6, 0.8, BACK + 2.5]} rotation={[0, turntable, 0]}>
            <Cyl r={0.62} h={0.06} position={[0, 0.03, 0]} color="#2C9BD6" ink={4} seg={28} />
            <Ship paint={7} position={[0, 0.07, 0]} scale={0.075} ink={2.5} />
          </group>
          <group position={[-0.9, 0, BACK + 3.4]}>
            <Cyl r={0.06} h={1.05} position={[0, 0.52, 0]} color="#C9962E" ink={4} seg={12} />
            <Cyl r={0.3} h={0.05} position={[0, 0.02, 0]} color="#2B2B2B" ink={4} seg={16} />
            <Box size={[0.24, 0.16, 0.12]} position={[0.02, 1.1, 0]} color="#C9962E" ink={4} />
            <Box size={[0.08, 0.1, 0.22]} position={[0.02, 1.1, 0.14]} color="#2B2B2B" ink={3} />
          </group>
        </group>
      )}
      {/* The committee's long table with papers */}
      {committee && (
        <group position={[0, 0, BACK + 2.2]}>
          <Box size={[3.6, 0.1, 1.0]} position={[0, 0.85, 0]} color="#7B3F22" ink={6} />
          <Box size={[3.5, 0.8, 0.06]} position={[0, 0.42, 0.45]} color="#8E4A28" ink={5} />
          {[-1.2, -0.3, 0.6, 1.3].map((x, i) => (
            <Box key={x} size={[0.42, 0.01, 0.3]} position={[x, 0.91, 0.1]} rotation={[0, i * 0.2 - 0.3, 0]} color="#FFFFFF" ink={2} />
          ))}
        </group>
      )}
      <sprite position={[1.65, 2.35, BACK + 0.4]} scale={[3, 3, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5 + 0.05 * Math.sin(frame / 20)} />
      </sprite>
    </group>
  );
};

/** A U-boat control room: dark teal walls, pipes, valve wheels, a red lamp and the periscope column. */
export const SubRoom: React.FC<{ frame: number }> = ({ frame }) => {
  const wall = useMemo(() => plasterTexture("#2E5E66", 11), []);
  const glow = useMemo(() => glowTexture("#FF5A3C"), []);
  const flick = 1 + 0.08 * Math.sin(frame * 0.7);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#3E4A4F" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2, -2.5]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} position={[d * 3, 2, 0]} rotation={[0, -d * (Math.PI / 2), 0]}>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial map={wall} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Pipes */}
      {[2.9, 3.2, 1.2].map((y, i) => (
        <Cyl key={i} r={0.07 + i * 0.02} h={6} position={[0, y, -2.35]} rotation={[0, 0, Math.PI / 2]} color={i === 2 ? "#C9962E" : "#8C9AA2"} ink={4} seg={12} />
      ))}
      {[-2.2, 2.4].map((x) => (
        <Cyl key={x} r={0.09} h={4} position={[x, 2, -2.3]} color="#8C9AA2" ink={4} seg={12} />
      ))}
      {/* Valve wheels */}
      {[-1.6, 1.8].map((x) => (
        <group key={x} position={[x, 1.6, -2.38]}>
          <mesh>
            <torusGeometry args={[0.22, 0.04, 8, 24]} />
            <meshStandardMaterial color="#F2363B" roughness={0.6} />
          </mesh>
          <Edges geometry={useMemo(() => new THREE.TorusGeometry(0.22, 0.04, 6, 24), [])} width={3} angle={60} />
        </group>
      ))}
      {/* Gauges */}
      {[-0.9, 1.0].map((x) => (
        <group key={x} position={[x, 2.3, -2.42]}>
          <Cyl r={0.18} h={0.06} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} color="#F4F0E6" ink={4} seg={20} />
          <Box size={[0.02, 0.14, 0.02]} position={[0.03, 0.03, 0.04]} rotation={[0, 0, -0.8 + 0.2 * Math.sin(frame / 9 + x)]} color="#F2363B" ink={0} />
        </group>
      ))}
      {/* Periscope column through the ceiling */}
      <Cyl r={0.14} h={4} position={[0.3, 2.2, -0.6]} color="#A9B3BA" ink={5} seg={16} />
      <Box size={[0.42, 0.3, 0.3]} position={[0.3, 1.75, -0.45]} color="#7E8A92" ink={5} />
      {[-1, 1].map((d) => (
        <Box key={d} size={[0.3, 0.06, 0.06]} position={[0.3 + d * 0.32, 1.7, -0.45]} color="#2B2B2B" ink={3} />
      ))}
      {/* Red lamp */}
      <Cyl r={0.12} h={0.18} position={[-1.5, 3.3, -1.6]} color="#7A1E14" ink={3} emissive="#FF3B2A" />
      <sprite position={[-1.5, 3.2, -1.5]} scale={[2.2 * flick, 2.2 * flick, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.7} />
      </sprite>
      <pointLight position={[-1.5, 3.0, -1.2]} color="#FF5A3C" intensity={6 * flick} distance={8} decay={1.6} />
    </group>
  );
};
