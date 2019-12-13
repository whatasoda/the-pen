import { clamp } from './math';

const createCubicBezier = (w: number) => {
  if (w === 0) return (x: number) => x;
  w = clamp(w, -1, 1);
  const base = (1 + w) / (w * 2);
  const sqrtBase = base ** 2;
  const sign = Math.sign(w);

  const b = 1 - w;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const t = base - sign * (sqrtBase - x / w) ** 0.5;
    const t2 = t ** 2;
    return w * t2 + b * t;
  };
};

export default createCubicBezier;
