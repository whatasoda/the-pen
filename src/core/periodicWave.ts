import BSpline from '../shared/math/b-spline';

type PeriodicWaveContainer = {
  order: number;
  length: number;
  real: Float32Array;
  imag: Float32Array;
  periodicWave: PeriodicWave;
};

const craetePeriodicWave = (ctx: AudioContext, order: number, points: number[]): PeriodicWaveContainer => {
  const width = Math.max(...points) - Math.min(...points);
  const coef = BSpline.gen({
    degree: 3,
    dimension: 2,
    points: points.map((x, y) => [x, y]),
  });

  const length = 2 ** order;
  const real = new Float32Array(length + 1);
  const imag = new Float32Array(length + 1);

  for (let i = 1; i <= length; i++) {
    // eslint-disable-next-line prefer-destructuring
    real[i] = coef(i / length)[0] + ((Math.random() - 0.5) * width) / 4;
  }

  const node = ctx.createPeriodicWave(real, imag);
  return { order, length, real, imag, periodicWave: node };
};

export default craetePeriodicWave;
