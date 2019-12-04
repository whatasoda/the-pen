import { vec3 } from 'gl-matrix';

const { SQRT2, abs, max } = Math;
/**
 * The euler-order should be z-x-y.
 * See also: https://developers.google.com/web/fundamentals/native-hardware/device-orientation/?hl=en
 */
export const eulerToArray = (euler: EulerRotation): V3 => eulerToArray.set([] as any, euler);
eulerToArray.set = <V extends V3 | vec3>(out: V, { alpha, beta, gamma }: EulerRotation): V => {
  out[0] = alpha || 0;
  out[1] = beta || 0;
  out[2] = gamma || 0;
  return out;
};

/**
 * Adjust coordinate with the euler-order of `eulerToArray`
 */
export const cartesianToArray = (cartesian: CartesianCoord): V3 => cartesianToArray.set([] as any, cartesian);
cartesianToArray.set = <V extends V3 | vec3>(out: V, { x, y, z }: CartesianCoord): V => {
  out[0] = z || 0;
  out[1] = x || 0;
  out[2] = y || 0;
  return out;
};

// https://www.google.com/search?q=1-(sqrt(2)**-abs(x)-1)**2
export const zeroPeak = (value: number) => 1 - (SQRT2 ** -abs(value) - 1) ** 2;

export const sqrSubtract = (a: number, b: number) => a ** 2 - b ** 2;
export const sqrPositiveSubtract = (a: number, b: number, threshold: number = 0) => {
  return max(sqrSubtract(a, b) + threshold, 0);
};
