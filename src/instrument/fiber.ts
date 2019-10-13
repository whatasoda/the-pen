import { vec3 } from 'gl-matrix';

(window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;

const createFiber = (entries: [V3, number][]) => {
  const ctx = new AudioContext();

  const nodes = entries.map(([axis, freq]) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);

    return { axis, osc, gain, out: gain };
  });

  const update = (direction: V3, power: number) => {
    nodes.forEach(({ gain, axis }) => {
      const volume = dot(axis, direction, power) * 100;
      gain.gain.value = volume;
    });
  };

  const dot = (axis: V3, direction: V3, power: number) => {
    const threshold = 0.3;
    const dot = (Math.max(threshold, vec3.dot(direction, axis) ** 3) - threshold) / (1 - threshold);
    return dot * Math.max(power, 0.2) - 0.2;
  };

  const start = () => {
    nodes.forEach(({ osc, out }) => {
      out.connect(ctx.destination);
      osc.start();
    });
  };

  return { start, update };
};

export default createFiber;
