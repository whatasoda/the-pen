import { useMemo, useEffect } from 'react';

const createPeriodicModule = (ctx: AudioContext, osc: OscillatorNode, length: number) => {
  const mem = {
    ctx,
    osc,
    real: new Float32Array(length + 1),
    imag: new Float32Array(length + 1),
  };

  mem.imag[0] = 1;

  const update = (nextReal: number[], nextImag: number[], start: number = 0, end?: number) => {
    const { ctx, osc, real, imag } = mem;

    if (nextReal.length < length) real.fill(0);
    if (nextImag.length < length) imag.fill(0);

    real.set(nextReal.slice(0, length), 1);
    imag.set(nextImag.slice(0, length), 1);

    osc.setPeriodicWave(ctx.createPeriodicWave(real.subarray(start, end), imag.subarray(start, end)));
  };

  const destroy = () => {
    delete mem.ctx;
    delete mem.osc;
    delete mem.real;
    delete mem.imag;
  };

  return { update, destroy };
};

const usePeriodic = (...args: Parameters<typeof createPeriodicModule>) => {
  const { update, destroy } = useMemo(() => createPeriodicModule(...args), args);

  useEffect(() => destroy, [destroy]);

  return update;
};

export default usePeriodic;
