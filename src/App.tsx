import React, { useMemo } from 'react';
import GlobalStyle from './globalStyle';
import { vec3, vec2 } from 'gl-matrix';
import styled from 'styled-components';
import useAudio from './core/useAudio';
import usePermissionRequest from './utils/permission';
import MotionTree from './core/motion';
import RhombicDodecahedron from './utils/rhombicDodecahedron';
import { EnvelopeProps } from './utils/envelope';
import MotionUpdate from './components/MotionUpdate';
import TapToStart from './components/TapToStart';
import { PinProps } from './components/SoundBall/Pin';
import SoundBall from './components/SoundBall/SoundBall';
import { createThreeCanvas } from './canvas';
import ScalarViewer from './components/ScalarViewer';

const App = () => {
  const requestPermission = usePermissionRequest();
  const ctx = useAudio();

  const pins = useMemo<PinProps[]>(() => {
    if (!ctx || requestPermission) return [];

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
    return Array.from({ length: 30 }).map((_, i) => {
      vec2.set(tmp2, Math.random() * 4, Math.random() * 3);
      const position = vec3.create();
      RhombicDodecahedron.planeToSphere(position, tmp2);
      const source = ctx.createOscillator();
      source.frequency.value = 440 * Math.log2(i / 12);

      source.start();
      return { position, radius, envelope: generalEnvelope, calcDuration, source, destination: compressor };
    });
  }, [ctx, requestPermission]);

  return (
    <>
      <GlobalStyle />
      <MotionUpdate tree={MotionTree} />
      <Canvas>
        <SoundBall FOV={50} pins={pins} />
      </Canvas>
      {process.env.NODE_ENV !== 'production' && <ScalarViewer />}
      {requestPermission && <TapToStart start={requestPermission} />}
    </>
  );
};

const Wrapper = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vw;
  z-index: -1;
  top: 0;
  bottom: 0;
  margin: auto;
`;
const Canvas = createThreeCanvas({ Wrapper });

export default App;
