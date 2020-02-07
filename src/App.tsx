import React, { useMemo, useState } from 'react';
import GlobalStyle from './globalStyle';
import { vec3 } from 'gl-matrix';
import useAudio from './core/useAudio';
import usePermissionRequest from './utils/permission';
import { EnvelopeProps } from './utils/envelope';
import TapToStart from './components/TapToStart';
import Player from './templates/Player/Player';
import Host from './templates/Host/Host';
import { PinProps } from './canvas/components/Pin';

const App = () => {
  const [[isSupported]] = useState(() => {
    const isSupported = Boolean(window.DeviceOrientationEvent && 'ontouchstart' in window);
    return [isSupported];
  });
  const requestPermission = usePermissionRequest();
  const ctx = useAudio();

  const pins = useMemo<Omit<PinProps, 'tree'>[]>(() => {
    if (!ctx || (isSupported && requestPermission)) return [];

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
      return {
        color,
        pinAttr: { position, radius },
        noteAttr: { envelope: generalEnvelope, calcDuration, source, destination: compressor },
      };
    });
  }, [ctx, requestPermission]);
  const url = `wss://${location.hostname}:8000/`;
  const FOV = 50;

  return (
    <>
      <GlobalStyle />
      {isSupported ? (
        <Player FOV={FOV} pins={pins} code="hoge" url={url} />
      ) : (
        <Host FOV={FOV} pins={pins} code="hoge" url={url} />
      )}
      {requestPermission && isSupported && <TapToStart isSupported start={requestPermission} />}
    </>
  );
};

export default App;
