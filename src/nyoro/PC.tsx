import React, { useEffect } from 'react';
import BSpline from '../shared/math/b-spline';

const PC = () => {
  useEffect(() => {
    const T = 30;
    const RES = 1;
    const FREQ = 240;
    const len = T * RES;

    const {
      // sin,
      sqrt,
      log10,
      log2,
      abs,
      cos,
      // PI,
    } = Math;
    // const value = (x: number) =>
    //   Math.max(
    //     0,
    //     (80 * sin(x - 0.3 * PI) +
    //       30 * sin(2 * x - 1.125 * PI) -
    //       20 * sin(4 * x + 0.4 * PI) -
    //       4 * sin(8 * x + 0.25 * PI)) /
    //       100,
    //   ) ** 12;
    // const value = (x: number) => (Math.max(0, Math.sin(x) - 0.99) * 100) ** 10;
    const hoge = (x: number) => (sqrt(-log10(abs(cos(x)))) - cos(x) ** 2 + 1) / 2;
    // const hoge = (x: number) => (sqrt(-log10(abs(cos(2 * x)))) + 2 * (cos(2 * x) + 1)) / 2;

    const P = [5, 3, 3, 1, 1, 0];

    const coefGen = BSpline.gen({
      degree: 3,
      dimension: 2,
      points: P.map((y, x) => [x, y * 10]),
    });

    const coef = (t: number) => coefGen(t)[1];

    // const r = 0.9;
    // const coef = (x: number) => sqrt(x) * -log(x * r + 1 - r);

    const REAL = new Float32Array(
      (function* _() {
        yield 0;
        for (let i = 1; i < len; i++) {
          // const v = Math.sqrt(Math.abs(Math.cos(Math.log2(i) * Math.PI)));
          const v = hoge((log2(i) + 0.5) * Math.PI);
          yield v * coef(i / len) + Math.random() * 0.00001;
        }
      })(),
    );

    const IMAG = new Float32Array(len);

    const start = () => {
      const MAX = Math.max(...REAL);

      // eslint-disable-next-line no-console
      console.log([...REAL].map((r) => '-'.repeat((100 * r) / MAX)).join('\n'));

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.frequency.value = FREQ / RES;
      const pw = ctx.createPeriodicWave(REAL, IMAG);
      osc.setPeriodicWave(pw);
      osc.connect(ctx.destination);
      osc.start();
    };

    window.addEventListener('click', start, { once: true });
  }, []);
  return <div />;
};

export default PC;
