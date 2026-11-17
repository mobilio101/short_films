// The spy cat for "Acoustic Kitty": the shared ToonCat (src/characters/toon/ToonCat.tsx, look CAT_SPY)
// plus one film-only detail drawn on top: the tiny microphone in its left ear.
// Origin = between the paws on the ground. Sitting cat: head top about 344 units, ear tips about 392.
import React from "react";
import * as THREE from "three";
import { INK } from "../../characters/toon/Toon";
import { CAT_ORANGE, CAT_SPY, CatExpr, ToonCat } from "../../characters/toon/ToonCat";
import { Project, v3 } from "../../world3d/kit";

export type CatPose = "sit" | "walk";

/** Height of the sitting cat's head top in ToonCat units, and in metres in the world. */
const TOP_UNITS = 344;
const TOP_M = 0.34;

/** Screen spot and scale for the cat at a 3D floor spot. */
export const placeCat = (project: Project, at: THREE.Vector3) => {
  const feet = project(at);
  const top = project(at.clone().add(v3(0, TOP_M, 0)));
  return { x: feet.x, y: feet.y, scale: (feet.y - top.y) / TOP_UNITS };
};

/** Spots on the sitting cat (ToonCat units, relative to the feet) used for the lab labels. */
export const CAT_SPOTS = {
  ear: { x: -65, y: -341 },
  skull: { x: 0, y: -190 },
  antenna: { x: -26, y: -372 },
};

export const Cat: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose?: CatPose;
  expr?: CatExpr;
  antenna?: boolean;
  mic?: boolean;
  flip?: boolean;
  seed?: number;
}> = ({ x, y, scale = 1, pose = "sit", expr = "neutral", antenna = true, mic = false, flip = false, seed = 0 }) => (
  <g>
    <ToonCat x={x} y={y} scale={scale} pose={pose} expr={expr} look={antenna ? CAT_SPY : CAT_ORANGE} flip={flip} seed={seed} />
    {mic && pose === "sit" && (
      // A tiny microphone tucked inside the left ear.
      <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * scale},${scale})`}>
        <circle cx={CAT_SPOTS.ear.x} cy={CAT_SPOTS.ear.y} r={13} fill="#B9C3CE" stroke={INK} strokeWidth={5} />
        <path d={`M${CAT_SPOTS.ear.x - 7},${CAT_SPOTS.ear.y - 3} h14 M${CAT_SPOTS.ear.x - 7},${CAT_SPOTS.ear.y + 4} h14`} stroke={INK} strokeWidth={3} />
      </g>
    )}
  </g>
);
