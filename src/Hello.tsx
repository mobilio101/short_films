import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
export const Hello: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#111', justifyContent: 'center', alignItems: 'center'}}>
      <h1 style={{color: 'white', fontSize: 100, opacity, fontFamily: 'sans-serif'}}>Remotion works</h1>
    </AbsoluteFill>
  );
};
