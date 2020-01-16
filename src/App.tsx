import React, { useEffect, useMemo, useRef, useState } from 'react';
import Visualizer from './utils/visualizer';
import GlobalStyle from './globalStyle';
import { vec3, vec2 } from 'gl-matrix';
import styled from 'styled-components';
import useAudio from './core/useAudio';
import usePermissionRequest from './utils/permission';
import useSensorEffect from './core/useSensorEffect';
import MotionTree, { createSoundBall, ball, pitch } from './core/motion';
import RhombicDodecahedron from './utils/rhombicDodecahedron';
import { EnvelopeProps } from './utils/envelope';

const App = () => {
  const vis = useRef<VisualizerHandle>(null);
  const { record, touch, showScalar } = useMemo(() => {
    const record: Record<string, number> = {};
    const showScalar = (k: string, v: number) => (record[k] = v);
    const touch = {
      movement: vec2.create(),
      active: false,
    };
    return { showScalar, record, touch };
  }, []);
  const requestPermission = usePermissionRequest();
  const ctx = useAudio();
  const [, rerender] = useState(0);

  useEffect(() => {
    const prev = vec2.create();
    const curr = vec2.create();
    const tmp = vec2.create();
    let target: null | number = null;
    let targetIndex = -1;
    const updateTargetIdx = (e: TouchEvent) => {
      targetIndex = Array.from(e.touches).findIndex(({ identifier }) => target === identifier);
    };
    const start = (e: TouchEvent) => {
      if (touch.active) return;
      const { identifier, clientX, clientY } = e.changedTouches[0];
      target = identifier;
      vec2.set(prev, clientX, clientY);
      touch.active = true;
      updateTargetIdx(e);
    };
    const move = (e: TouchEvent) => {
      const { clientX, clientY } = e.touches[targetIndex];
      vec2.set(curr, clientX, clientY);
      vec2.sub(tmp, curr, prev);
      vec2.add(touch.movement, touch.movement, tmp);
      vec2.copy(prev, curr);
    };
    const end = (e: TouchEvent) => {
      const { identifier } = e.changedTouches[0];
      if (target !== identifier) return;
      target = null;
      touch.active = false;
      updateTargetIdx(e);
    };

    window.addEventListener('touchstart', start);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, []);

  useSensorEffect(() => {
    ball.addEventListener('update', ({ value: { arm, axis, leg } }) => {
      vis.current?.setBall!(axis, arm, leg);
    });
    pitch.addEventListener('update', ({ value: { angle, speed } }) => {
      showScalar('one', 100);
      showScalar('angle', angle * 100);
      showScalar('speed', speed * 100);
      rerender((curr) => curr + 1);
    });
    return (sensor) => {
      try {
        MotionTree.update(({ acceleration, rotation, orientation, touchMovement, touchActivity, dt }) => {
          vec3.copy(acceleration, sensor.acceleration);
          vec3.copy(rotation, sensor.rotationRate);
          vec3.copy(orientation, sensor.orientation);
          vec2.copy(touchMovement, touch.movement);
          vec2.set(touch.movement, 0, 0);
          touchActivity[0] = Number(touch.active);
          dt[0] = sensor.dt;
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    };
  }, []);

  useEffect(() => {
    if (!ctx) return;

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
  }, [ctx]);

  return (
    <>
      <GlobalStyle />
      <Visualizer ref={vis as any} />
      <V entries={Object.entries(record)} mag={1} />
      {requestPermission && <StartButton onClick={requestPermission} />}
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
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  background-color: #aaa2;
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

// const makeDistortionCurve = (curve: Float32Array, amount: number = 50) => {
//   const k = clamp(amount, 0, 100);
//   const { length } = curve;
//   const deg = Math.PI / 180;
//   let x;
//   for (let i = 0; i < length; ++i) {
//     x = (i * 2) / length - 1;
//     curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
//   }
//   return curve;
// };

export default App;
