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

  const update = ({ velocity }: { attack: V3; velocity: V3 }) => {
    nodes.forEach(({ gain, axis }) => {
      const volume = (dot(velocity, axis) * 100) / 10;
      // const volume = (dot(velocity, axis) + dot(axis, attack) * 10) / 100;
      gain.gain.value = volume;
    });
  };

  const tmpA = vec3.create();
  const tmpB = vec3.create();
  const dot = (a: V3, b: V3) => {
    vec3.normalize(tmpA, a);
    vec3.normalize(tmpB, b);
    const d = vec3.dot(tmpA, tmpB);
    const hoge = 0.3;
    const mag = (Math.max(hoge, d ** 3) - hoge) / (1 - hoge);
    return mag * (Math.max(vec3.length(a), 0.2) - 0.2) * vec3.length(b);
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
