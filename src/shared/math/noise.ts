import xorshift from './xorshift';

type NoiseTransform = (noise: number, curr: number) => number;
const defaultTransform: NoiseTransform = (n) => n;

const applyNoise = (
  out: Float32Array,
  [offset, width]: [number, number],
  seed: number,
  transform: NoiseTransform = defaultTransform,
): Float32Array => {
  const { length } = out;
  const rand = xorshift(seed);
  for (let i = 0; i < length; i++) {
    out[i] = transform(rand() * width + offset, out[i]);
  }
  return out;
};

export default applyNoise;
