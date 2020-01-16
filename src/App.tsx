import React, { useEffect, useMemo, useRef } from 'react';
import Visualizer from './utils/visualizer';
import GlobalStyle from './globalStyle';
import { vec3, vec2 } from 'gl-matrix';
import styled from 'styled-components';
import useAudio from './core/useAudio';
import usePermissionRequest from './utils/permission';
import MotionTree, { createSoundBall, ball, pitch } from './core/motion';
import RhombicDodecahedron from './utils/rhombicDodecahedron';
import { EnvelopeProps } from './utils/envelope';
import { useRerender } from './utils/hooks';
import MotionUpdate from './components/MotionUpdate';
import TapToStart from './components/TapToStart';

const App = () => {
  const vis = useRef<VisualizerHandle>(null);
  const rerender = useRerender();
  const { record, showScalar } = useMemo(() => {
    const record: Record<string, number> = {};
    const showScalar = (k: string, v: number) => (record[k] = v);

    return { showScalar, record };
  }, []);
  const requestPermission = usePermissionRequest();
  const ctx = useAudio();

  useEffect(() => {
    if (!ctx || requestPermission) return;

    const tmp2 = vec2.create();
    const generalEnvelope: EnvelopeProps = {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.4,
      release: 0.6,
    };
    const calcDuration = (v: number) => v;
    const radius = 0.2;
    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);
    // const sources: AudioNode[] = [];
    Array.from({ length: 30 }).map((_, i) => {
      vec2.set(tmp2, Math.random() * 4, Math.random() * 3);
      const position = vec3.create();
      RhombicDodecahedron.planeToSphere(position, tmp2);
      const source = ctx.createOscillator();
      source.frequency.value = 440 * Math.log2(i / 12);
      createSoundBall(
        { position, radius },
        { envelope: generalEnvelope, calcDuration, source, destination: compressor },
      );
      source.start();
      const showPin = vis.current?.showPin!;
      showPin(position, radius);
    });

    return () => {};
  }, [ctx, requestPermission]);

  useEffect(() => {
    ball.addEventListener('update', ({ value: { arm, axis, leg } }) => {
      vis.current?.setBall!(axis, arm, leg);
    });
    if (process.env.NODE_ENV !== 'production') {
      pitch.addEventListener('update', ({ value: { angle, speed } }) => {
        showScalar('one', 100);
        showScalar('angle', angle * 100);
        showScalar('speed', speed * 100);
        rerender();
      });
    }
  });

  return (
    <>
      <GlobalStyle />
      <Visualizer ref={vis as any} />
      <MotionUpdate tree={MotionTree} />
      <V entries={Object.entries(record)} mag={1} />
      {requestPermission && <TapToStart start={requestPermission} />}
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
