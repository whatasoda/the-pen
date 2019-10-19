/**
 * The euler-order should be z-x-y.
 * See also: https://developers.google.com/web/fundamentals/native-hardware/device-orientation/?hl=en
 */
export const eulerToArray = ({ alpha, beta, gamma }: EulerRotation): V3 => [alpha || 0, beta || 0, gamma || 0];

/**
 * Adjust coordinate with the euler-order of `eulerToArray`
 */
export const cartesianToArray = ({ x, y, z }: CartesianCoord): V3 => [z || 0, x || 0, y || 0];

const { SQRT2, abs } = Math;
// https://www.google.com/search?q=1-(sqrt(2)**-abs(x)-1)**2
export const zeroPeak = (value: number) => 1 - (SQRT2 ** -abs(value) - 1) ** 2;
