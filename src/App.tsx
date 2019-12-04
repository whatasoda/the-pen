import React, { useEffect, useMemo, useRef, useState } from 'react';
import Visualizer from './utils/visualizer';
import GlobalStyle from './globalStyle';
import { vec3 } from 'gl-matrix';
import styled from 'styled-components';
import motion2 from './core/motion';
import useAudio from './core/useAudio';
import sample from '../sample.m4a';
import usePermissionRequest from './utils/permission';
import useSensorEffect from './core/useSensorEffect';

const App = () => {
  const vis = useRef<VisualizerHandle>(null);
  const { record, showScalar } = useMemo(() => {
    const record: Record<string, number> = {};
    const showScalar = (k: string, v: number) => (record[k] = v);

    return { showScalar, record };
  }, []);
  const requestPermission = usePermissionRequest();
  const [, setCount] = useState(0);
  const ctx = useAudio();
  const [tree, setTree] = useState<ReturnType<typeof motion2> | null>(null);

  const resetOffset = useSensorEffect(() => {
    const tmp = vec3.create();
    const tmp2 = vec3.fromValues(10, 0, 0);
    const rerender = () => setCount((c: number) => c + 1);
    return (sensor) => {
      const showVector = vis.current?.entry;

      const tree = motion2(({ acceleration, dt, rotation, orientation }) => {
        vec3.copy(acceleration.value, sensor.acceleration);
        vec3.copy(rotation.value, sensor.rotationRate);
        vec3.copy(orientation.value, sensor.orientation);
        dt.value[0] = sensor.dt;
      });

      setTree(tree);
      showScalar('radius', tree.radius.value.value[0] * 100);
      showScalar('omega', tree.radius.value.value[1] * 10);
      showScalar('theta', tree.radius.value.value[2] * 10);
      showScalar('circle', tree.circle.value.value[0] * 100);
      showScalar('hoge', tree.hoge.value.value[0] * 1000);
      showVector?.('ho', 0x00ff00, tree.v.value.value);
      showVector?.('hsokao', 0x0000ff, vec3.scale(tmp, tree.movement.value.value, 5));
      showVector?.('gioqkg', 0xaaaa00, tmp2);
      (window as any).aaaa = tmp;

      rerender();
    };
  }, []);

  useEffect(() => {
    if (!ctx || !tree) return;

    window.addEventListener('touchstart', resetOffset);
    (async () => {
      const res = await fetch(sample);
      // eslint-disable-next-line no-async-promise-executor
      const buffer = await new Promise<AudioBuffer>(async (resolve) => {
        ctx.decodeAudioData(await res.arrayBuffer(), resolve);
      });
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(ctx.destination);
      // source.start();
      const update = () => {
        source.playbackRate.value = 10 ** tree.ar.value.value[0];
        requestAnimationFrame(update);
      };
      update();
    })();
  }, [ctx, tree]);

  return (
    <>
      <GlobalStyle />
      <Visualizer ref={vis} />
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

export default App;
