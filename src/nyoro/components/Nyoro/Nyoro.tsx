import React, { FC, useMemo, useEffect } from 'react';
import { vec3 } from 'gl-matrix';
import useTracker from '../../../tracker/hook';
import useOscillator from '../../../synthesizer/oscillator';
import useAudioContext from '../../../synthesizer/context';
import useGain from '../../../synthesizer/gain';

let totalAmount = 0;

const freqs = [
  // 27.500,
  // 29.135,
  // 30.868,
  // 32.703,
  // 34.648,
  // 36.708,
  // 38.891,
  // 41.203,
  // 43.654,
  // 46.249,
  // 48.999,
  51.913,
  // 55.000,
  // 58.270,
  // 61.735,
  // 65.406,
  // 69.296,
  // 73.416,
  // 77.782,
  // 82.407,
  // 87.307,
  // 92.499,
  // 97.999,
  // 103.826,
  // 110.000,
  // 116.541,
  // 123.471,
  // 130.813,
  // 138.591,
  146.832,
  // 155.563,
  // 164.814,
  // 174.614,
  // 184.997,
  // 195.998,
  // 207.652,
  // 220.000,
  233.082,
  // 246.942,
  // 261.626,
  // 277.183,
  // 293.665,
  // 311.127,
  // 329.628,
  // 349.228,
  // 369.994,
  // 391.995,
  415.305,
  // 440.000,
  // 466.164,
  // 493.883,
  // 523.251,
  554.365,
  // 587.330,
  // 622.254,
  659.255,
  // 698.456,
  // 739.989,
  // 783.991,
  // 830.609,
  880.0,
  // 932.328,
  // 987.767,
  // 1046.502,
  // 1108.731,
  // 1174.659,
  // 1244.508,
  // 1318.510,
  // 1396.913,
  // 1479.978,
  // 1567.982,
  1661.219,
  // 1760.000,
  // 1864.655,
  // 1975.533,
  2093.005,
  // 2217.461,
  // 2349.318,
  // 2489.016,
  // 2637.020,
  // 2793.826,
  // 2959.955,
  // 3135.963,
  // 3322.438,
  // 3520.000,
  // 3729.310,
  // 3951.066,
  // 4186.009
];
const randFreqs = [...new Array(20).fill(0).map(() => Math.random() * 3000)];

const Nyoro: FC = () => {
  useTracker.useModule({
    maxTimeRange: 10,
    speedRegistancePerSec: 0.3,
  });
  const mag = 150;

  const [amount, { points, normalized }] = useTracker(3, 0.2);
  totalAmount += 1 - Math.abs(amount);

  if (!points.length) {
    points.push({ movement: 0, position: [0, 0, 0], timestamp: 0, velocity: [0, 0, 0] });
    normalized.push([0, 0, 0]);
  }

  const ctx = useAudioContext();
  const eee = points[points.length - 1];
  const oList = randFreqs.map((freq) => useOscillator(ctx, freq));

  const gP = useMemo(
    () => [
      ...new Array(oList.length).fill(0).map(() => {
        const v = vec3.create();
        vec3.random(v);
        vec3.sub(v, v, [0.5, 0.5, 0.5]);
        vec3.normalize(v, v);
        return v;
      }),
    ],
    [],
  );

  const gains = oList.map((_, i) => useGain(ctx, vec3.dot(eee.velocity, gP[i]) * 0.2));

  useEffect(() => {
    oList.forEach((o, i) => {
      o.connect(gains[i]);
      gains[i].connect(ctx.destination);
    });
    const start = () => {
      oList.forEach((o) => o.start());
    };
    window.addEventListener('touchend', start, { once: true });
  }, []);

  const start = normalized[0];
  const end = normalized[points.length - 1];
  const cmn: JSX.IntrinsicElements['polyline'] = {
    fill: 'none',
    stroke: '#000',
    strokeLinecap: 'round',
    strokeWidth: '0.25',
  };

  return (
    <>
      <div style={{ whiteSpace: 'pre' }}>
        <div>{start.join('\n')}</div>
        <hr />
        <div>{end.join('\n')}</div>
        <hr />
        <div>{`${amount}\n${totalAmount}`}</div>
        <hr />
        <div>{eee.velocity.join('\n')}</div>
        <hr />
      </div>
      <svg viewBox="-50 -25 100 200">
        <polyline {...cmn} points={`0 20 ${eee.velocity[0] * mag} ${eee.velocity[1] * mag + 20}`} />
        <polyline {...cmn} points={`-20 20 -20 ${20 + (1 - Math.abs(amount)) * 25}`} />
        <polyline {...cmn} points={normalized.flatMap(([u, v]) => [u * mag, v * -mag]).join(' ')} />
      </svg>
    </>
  );
};

export default Nyoro;
