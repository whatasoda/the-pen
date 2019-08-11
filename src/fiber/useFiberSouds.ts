import { useMemo, useEffect } from 'react';
import '../synthesizer/context';
import { vec3 } from 'gl-matrix';
import useFibers, { Fiber } from './useFibers';
import completeAxis from '../shared/complete-axis';
import craetePeriodicWave from '../core/periodicWave';
import { createWaveShaper, updateWaveShaper } from '../core/waveShaper';

// const V = vec3.create();
const X = vec3.create();
const Y = vec3.create();
const Z = vec3.create();

const ax = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];

const useFiberSounds = (freqs: [number, number][][]) => {
  const { fibers, nodeList } = useMemo(() => {
    const ctx = new AudioContext();
    freqs.length = ax.length;

    const nodeList = freqs.map((freq, id) => {
      return freq.map((f) => {
        const osc = ctx.createOscillator();
        const { periodicWave } = craetePeriodicWave(ctx, 5, 21421, [
          120,
          110,
          120,
          10,
          80,
          90,
          60,
          10,
          80,
          80,
          20,
          10,
          24,
          16,
          20,
          14,
          10,
          8,
          2,
          6,
          3,
          1,
        ]);
        osc.setPeriodicWave(periodicWave);
        const waveShaper = updateWaveShaper(createWaveShaper(ctx, 90, '4x'), -0.3, 124187979, 0.02);
        const gain = ctx.createGain();
        gain.gain.value = 0;
        // eslint-disable-next-line prefer-destructuring
        osc.frequency.value = f[0];
        const a = f[1];

        osc.connect(waveShaper);
        waveShaper.connect(gain);
        gain.connect(ctx.destination);
        return { id, osc, gain, waveShaper, a };
      });
    });

    const fibers = nodeList.map<Fiber>((nodes, id) => {
      // completeAxis(X, Y, Z, [...vec3.sub(V, vec3.random(V), [0.5, 0.5, 0.5])]);
      completeAxis(X, Y, Z, [...ax[id]]);
      const props: Fiber['props'] = {
        coef: 0,
        axis: [...Z],
        U: [...X],
        V: [...Y],
        freq: nodes[0].osc.frequency.value,
        length: (Math.random() + 0.4) * 20,
        maxSlack: 1.5,
        rewindPower: 4,
      };
      return {
        id,
        props,
        state: {
          slack: -props.maxSlack,
          selfVelocity: 0,
          fiberVelocity: 0,
          volume: 0,
          u: 0,
          v: 0,
          rot: 0,
        },
      };
    });

    return { fibers, nodeList, ctx };
  }, [freqs]);

  useFibers(
    (fibers) => {
      fibers.forEach(({ state: { volume, rot } }, i) => {
        nodeList[i].forEach(({ gain, waveShaper, a }) => {
          updateWaveShaper(waveShaper, 0.4 + rot * 50, 124241, 0.05);
          gain.gain.value = volume * a;
        });
      });
    },
    () => fibers,
    [],
  );

  useEffect(() => {
    const start = () =>
      nodeList.forEach((nodes) =>
        nodes.forEach(({ osc }) => {
          osc.start();
        }),
      );

    document.addEventListener('touchend', start, { once: true });
  }, [nodeList]);
  return fibers;
};

export default useFiberSounds;
