const distortion = (i: number, length: number, amount: number): number => {
  const t = (2 * i) / length - 1;
  const k = (2 * amount) / (1 - amount);
  return ((1 + k) * t) / (1 + k * Math.abs(t));
};

export default distortion;
