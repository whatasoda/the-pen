import React, { useEffect } from 'react';
// import BSpline from '../shared/math/b-spline';
import craetePeriodicWave from '../core/periodicWave';
import { createWaveShaper, updateWaveShaper } from '../core/waveShaper';

const PC = () => {
  useEffect(() => {
    const start = () => {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const { periodicWave, real } = craetePeriodicWave(ctx, 4, 21, [
        100,
        90,
        20,
        40,
        30,
        30,
        60,
        30,
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
      const MAX = Math.max(...real);
      const waveShaper = updateWaveShaper(createWaveShaper(ctx, 40, '4x'), -0.4, Math.random(), 0.05);
      try {
        // eslint-disable-next-line no-console
        console.log(real, MAX);
        // eslint-disable-next-line no-console
        console.log([...real].map((r) => '-'.repeat((100 * r) / MAX)).join('\n'));
        // eslint-disable-next-line no-console
        console.log('xxxxxxx');
        // eslint-disable-next-line no-console
        console.log([...waveShaper.curve].map((r) => '-'.repeat(10 * Math.abs(r))).join('\n'));
      } catch (_) {
        // eslint-disable-next-line no-console
        console.log(_);
      }
      osc.setPeriodicWave(periodicWave);
      osc.connect(waveShaper);
      waveShaper.connect(ctx.destination);
      // osc.connect(ctx.destination);
      osc.start();
    };

    window.addEventListener('click', start, { once: true });
  }, []);
  return <div />;
};

export default PC;
