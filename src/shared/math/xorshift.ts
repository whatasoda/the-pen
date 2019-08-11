/* eslint-disable no-bitwise */
type XOrShiftState = Record<'x' | 'y' | 'z' | 'w', number>;
const initialState = JSON.stringify({
  x: 123456789,
  y: 362436069,
  z: 521288629,
  w: 0,
});

const INVERT = 1 << 31;
const WINDOW = ~INVERT;

const xorshift = (seed: number) => {
  const state: XOrShiftState = JSON.parse(initialState);
  state.w = seed;
  let t: number;
  return () => {
    t = state.x ^ (state.x << 11);
    state.x = state.y;
    state.y = state.z;
    state.z = state.w;
    state.w = state.w ^ (state.w >>> 19) ^ (t ^ (t >>> 8));
    return -((state.w | INVERT) / WINDOW);
  };
};

export default xorshift;
