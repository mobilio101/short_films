// Cat check sheet: sitting and walking cat, three expressions, with and without the spy antenna.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAT_ORANGE, CAT_SPY, CatExpr, ToonCat } from "../../../characters/toon/ToonCat";

const T: React.CSSProperties = { position: "absolute", textAlign: "center", fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, color: "#141414" };
const exprs: CatExpr[] = ["neutral", "yawn", "sleep"];

export const CatSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#BFE6FF, #EAF7FF)" }}>
    <div style={{ ...T, top: 30, width: 1080, fontSize: 50 }}>TOON CAT</div>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {exprs.map((e, i) => (
        <ToonCat key={e} x={180 + i * 360} y={560} scale={1.05} expr={e} look={i === 0 ? CAT_SPY : CAT_ORANGE} seed={i} />
      ))}
      <ToonCat x={420} y={950} scale={1} pose="walk" look={CAT_SPY} />
      <ToonCat x={860} y={950} scale={0.9} pose="walk" expr="yawn" flip />
      <ToonCat x={540} y={1760} scale={1.6} expr="neutral" look={CAT_SPY} />
    </svg>
    {exprs.map((e, i) => (
      <div key={e} style={{ ...T, top: 590, left: i * 360, width: 360, fontSize: 30 }}>{e.toUpperCase()}</div>
    ))}
  </AbsoluteFill>
);
