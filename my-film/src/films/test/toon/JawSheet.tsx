// Beard and shaving shadow on all three head shapes.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, Look, POP, Toon } from "../../../characters/toon/Toon";

const base: Look = { head: "round", skin: POP.skin, hair: "#3B2618", hairStyle: "flat", shirt: "#22315A", pattern: "buttons", patternColor: POP.yellow, shoes: INK, hat: "captain", hatColor: "#22315A", hatColor2: "#22315A" };
export const JawSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#BFE6FF, #EAF7FF)" }}>
    <svg width={1080} height={1920}>
      {(["round", "square", "triangle"] as const).map((h, i) => (
        <g key={h}>
          <Toon id={`st${i}`} x={180 + i * 360} y={860} scale={0.78} look={{ ...base, head: h, stubble: "#3E5F8C" }} expr="neutral" />
          <Toon id={`bd${i}`} x={180 + i * 360} y={1700} scale={0.78} look={{ ...base, head: h, hat: "crown", hatColor: POP.red, shirt: POP.red, beard: "#6B4A2B" }} expr={i === 1 ? "shock" : "neutral"} />
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
