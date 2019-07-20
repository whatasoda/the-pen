import { useMemo, useEffect } from 'react';
import '../synthesizer/context';
import { vec3 } from 'gl-matrix';
import useFibers, { Fiber } from './useFibers';
import completeAxis from '../shared/complete-axis';

const V = vec3.create();
const X = vec3.create();
const Y = vec3.create();
const Z = vec3.create();

const useFiberSounds = (freqs: number[]) => {
  const { fibers, nodeList } = useMemo(() => {
    const ctx = new AudioContext();

    const nodeList = freqs.map((freq, id) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(ctx.destination);
      return { id, osc, gain };
    });

    const fibers = nodeList.map<Fiber>(({ id, osc }) => {
      completeAxis(X, Y, Z, [...vec3.sub(V, vec3.random(V), [0.5, 0.5, 0.5])]);
      return {
        id,
        props: {
          coef: 0,
          axis: [...Z],
          U: [...X],
          V: [...Y],
          freq: osc.frequency.value,
          length: (Math.random() + 0.4) * 20,
          maxSlack: 2,
          rewindPower: 4,
        },
        state: {
          slack: -2,
          selfVelocity: 0,
          fiberVelocity: 0,
          volume: 0,
        },
      };
    });

    return { fibers, nodeList, ctx };
  }, []);

  useFibers(
    (fibers) => {
      fibers.forEach(({ state: { volume } }, i) => {
        const { gain } = nodeList[i];
        gain.gain.value = volume;
      });
    },
    () => fibers,
    [],
  );

  useEffect(() => {
    const start = () => nodeList.forEach(({ osc }) => osc.start());

    document.addEventListener('touchend', start, { once: true });
  }, []);
  return fibers;
};

export default useFiberSounds;
