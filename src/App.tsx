import React, { useMemo } from 'react';
import GlobalStyle from './globalStyle';
import { vec3 } from 'gl-matrix';
import styled from 'styled-components';
import useAudio from './core/useAudio';
import usePermissionRequest from './utils/permission';
import MotionTree from './core/motion';
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

    const generalEnvelope: EnvelopeProps = {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.4,
      release: 0.6,
    };
    const calcDuration = (v: number) => v;
    const radius = 0.35;
    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);
    const unit = (Math.PI * 2) / 8;
    const freqs = [
      [587.33, 0xff4444, Math.cos(unit), 0, Math.sin(unit)], // れ
      [493.883, 0x44ff44, Math.cos(unit * 2), 0, Math.sin(unit * 2)], // し
      [440.0, 0x4444ff, Math.cos(unit * 1.5), Math.sin(unit * 1.7), Math.sin(unit * 1.5)], // ら
      [369.994, 0xff44ff, Math.cos(unit * 3), 0, Math.sin(unit * 3)], // ふぁ#
      [349.228, 0xffff44, Math.cos(unit * 4), 0, Math.sin(unit * 4)], // ふぁ
      [554.365, 0x44ffff, Math.cos(unit * 3.5), -Math.sin(unit * 1.7), Math.sin(unit * 3.5)],
      [587.33, 0xff4444, Math.cos(unit * 1.9), -Math.sin(unit * 1.7), Math.sin(unit * 1.9)], // ど
      [493.883, 0x44ff44, Math.cos(unit * 0.7), -Math.sin(unit * 1.7), Math.sin(unit * 0.7)], // ど
    ];

    return freqs.map(([freq, color, x, y, z]) => {
      // const theta = (i / 9) * Math.PI * 2;
      const position = vec3.fromValues(x, y, z);
      vec3.normalize(position, position);
      const source = ctx.createOscillator();
      source.frequency.value = freq;

      source.start();
      return { position, radius, color, envelope: generalEnvelope, calcDuration, source, destination: compressor };
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
