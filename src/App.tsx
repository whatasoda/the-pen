import React, { useEffect, useMemo, useRef, useState } from 'react';
import useFiber from './core/fiber';
import Visualizer from './utils/visualizer';
import GlobalStyle from './globalStyle';
import motion from './core/motion';
import { eulerToArray, cartesianToArray } from './utils/converter';
import requestPermission from './utils/permission';
import { vec3 } from 'gl-matrix';
import styled from 'styled-components';
import useAudioRoot from './core/audio';

const App = () => {
  const vis = useRef<VisualizerHandle>(null);
  const rec = useMemo<Record<string, number>>(() => ({}), []);
  const { registerNode, start } = useAudioRoot(async () => {
    try {
      await requestPermission.deviceMotion();
      await requestPermission.deviceOrientation();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  });
  const fiber = useFiber(registerNode);
  const [, setCount] = useState(0);

  useEffect(() => {
    const handle = vis.current!;
    const rerender = () => setCount((c: number) => c + 1);
    const cb = (k: string, v: number) => (rec[k] = v);
    const m = motion({ ...handle, cb }, 6);
    const direction = vec3.create();
    const axis = vec3.create();
    fiber.add('attack', 261.626, [0, 1, 0]);
    fiber.add('attack', 329.628, [0, 1, 0]);
    fiber.add('attack', 391.995, [0, 1, 0]);
    fiber.add('curve', 391.995, [1, 0, 0]);
    fiber.add('curve', 493.883, [1, 0, 0]);
    fiber.add('curve', 587.33, [1, 0, 0]);
    fiber.add('liner', 587.33, [0, 0, 1]);
    fiber.add('liner', 698.456, [0, 0, 1]);
    fiber.add('liner', 880, [0, 0, 1]);

    window.addEventListener('devicemotion', ({ acceleration, rotationRate, interval: dt }) => {
      if (!acceleration || !rotationRate) return;
      const accel = cartesianToArray(acceleration);
      const rate = eulerToArray(rotationRate);
      const payload = m({ direction, axis }, accel, rate, dt);
      fiber.update(Array.from(axis) as V3, payload);
      rerender();
    });
  }, []);

  return (
    <>
      <GlobalStyle />
      <Visualizer ref={vis} />
      <V entries={Object.entries(rec)} mag={1} />
      {start && <StartButton onClick={start} />}
    </>
  );
};

const V = ({ entries, mag }: { entries: [string, number][]; mag: number }) => (
  <div>
    {entries.map(([k, v]) => (
      <VItem key={k} v={v} mag={mag}>
        {k}
        <div style={{ width: `${Math.abs(v) * mag}px` }} />
      </VItem>
    ))}
  </div>
);

const StartButton = styled.a`
  z-index: 100;
  display: block;
  position: fixed;
  width: 100px;
  height: 100px;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  background-color: #aaa;
  border-radius: 50%;
`;

interface VProps {
  v: number;
  mag: number;
}

const VItem = styled.div<VProps>`
  color: #aaa;
  & > div {
    display: block;
    height: 6px;
    background-color: ${({ v }) => (v < 0 ? '#f99' : '#99f')};
  }
`;

export default App;
