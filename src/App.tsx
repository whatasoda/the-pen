import React, { useEffect, useMemo, useRef, useState } from 'react';
import createFiber from './instrument/fiber';
import Visualizer from './utils/visualizer';
import GlobalStyle from './globalStyle';
import motion from './motion/motion';
import { eulerToArray, cartesianToArray } from './utils/converter';
import requestPermission from './utils/permission';
import { vec3 } from 'gl-matrix';
import styled from 'styled-components';

const App = () => {
  const vis = useRef<VisualizerHandle>(null);
  const rec = useMemo<Record<string, number>>(() => ({}), []);
  const [, setCount] = useState(0);

  useEffect(() => {
    const handle = vis.current!;
    const rerender = () => setCount((c: number) => c + 1);
    const cb = (k: string, v: number) => (rec[k] = v);
    const mmmm = motion({ ...handle, cb }, 30);
    const motionOut = vec3.create();

    const fiber = createFiber([
      [[0, 1, 0], 400],
      [[1, 0, 0], 440],
      [[0, 0, 1], 540],
      // [[Math.SQRT1_2, Math.SQRT1_2, 0], 500],
    ]);

    window.addEventListener('devicemotion', ({ acceleration, rotationRate, interval: dt }) => {
      if (!acceleration || !rotationRate) return;
      const accel = cartesianToArray(acceleration);
      const rate = eulerToArray(rotationRate);
      mmmm(motionOut, accel, rate, dt);
      fiber.update(Array.from(motionOut) as V3);
    });

    window.addEventListener(
      'touchend',
      async () => {
        try {
          await requestPermission.deviceMotion();
          await requestPermission.deviceOrientation();
          fiber.start();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e);
        }
      },
      { once: true },
    );

    let alive = true;
    const update = () => {
      if (!alive) return;
      rerender();
      requestAnimationFrame(update);
    };
    update();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <Visualizer ref={vis} />
      <V entries={Object.entries(rec)} mag={1} />
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
