// Nationality patches so viewers can tell sides apart at a glance.
// Drawn in the newsprint palette. For WWII Germany we use the Balkenkreuz (the cross on German
// military vehicles and aircraft), not the swastika: see "Insignia" in CLAUDE.md.
import React from "react";
import { M } from "./memphis";

/** Union Jack patch, centred on 0,0. Black field instead of blue to fit the palette. */
export const UnionJack: React.FC<{ w?: number; h?: number }> = ({ w = 60, h = 34 }) => {
  const id = `uj-${w}-${h}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={M.ink} />
        <line x1={-w / 2} y1={-h / 2} x2={w / 2} y2={h / 2} stroke="#FFFFFF" strokeWidth={h * 0.2} />
        <line x1={-w / 2} y1={h / 2} x2={w / 2} y2={-h / 2} stroke="#FFFFFF" strokeWidth={h * 0.2} />
        <line x1={-w / 2} y1={-h / 2} x2={w / 2} y2={h / 2} stroke={M.pink} strokeWidth={h * 0.07} />
        <line x1={-w / 2} y1={h / 2} x2={w / 2} y2={-h / 2} stroke={M.pink} strokeWidth={h * 0.07} />
        <rect x={-w / 2} y={-h * 0.17} width={w} height={h * 0.34} fill="#FFFFFF" />
        <rect x={-h * 0.17} y={-h / 2} width={h * 0.34} height={h} fill="#FFFFFF" />
        <rect x={-w / 2} y={-h * 0.1} width={w} height={h * 0.2} fill={M.pink} />
        <rect x={-h * 0.1} y={-h / 2} width={h * 0.2} height={h} fill={M.pink} />
      </g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={M.ink} strokeWidth={3} />
    </g>
  );
};

/** Balkenkreuz: a black cross with white edges, centred on 0,0. */
export const Balkenkreuz: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-7,-22 L7,-22 L7,-7 L22,-7 L22,7 L7,7 L7,22 L-7,22 L-7,7 L-22,7 L-22,-7 L-7,-7 Z" fill="#FFFFFF" stroke={M.ink} strokeWidth={2} />
    <path d="M-4,-19 L4,-19 L4,-4 L19,-4 L19,4 L4,4 L4,19 L-4,19 L-4,4 L-19,4 L-19,-4 L-4,-4 Z" fill={M.ink} />
  </g>
);

/** Ready-made chest patches for `Character`'s `chest` prop (torso coordinates: 0,0 is the top of the torso). */
export const BRITISH_PATCH = (
  <g transform="translate(-2,44)">
    <UnionJack w={80} h={46} />
  </g>
);
export const GERMAN_PATCH = (
  <g transform="translate(-2,46)">
    <Balkenkreuz s={1.5} />
  </g>
);
