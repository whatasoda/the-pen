import { useMemo, useEffect } from 'react';
import '../synthesizer/context';
import { vec3 } from 'gl-matrix';
import useFibers, { Fiber } from './useFibers';

const V = vec3.create();

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

    const fibers = nodeList.map<Fiber>(({ id, osc }) => ({
      id,
      props: {
        coef: 0,
        direction: [...vec3.normalize(V, vec3.sub(V, vec3.random(V), [0.5, 0.5, 0.5]))],
        freq: osc.frequency.value,
        length: (Math.random() + 0.4) * 20,
        maxSlack: 0.4,
        rewindPower: 0.7,
      },
      state: {
        slack: 0.2,
        selfVelocity: 0,
        fiberVelocity: 0,
        volume: 0,
      },
    }));

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
};

export default useFiberSounds;
