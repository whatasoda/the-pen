import { vec3, glMatrix } from 'gl-matrix';
import sequential, { add } from './sequential';

const FactorKey = ['X', 'Y', 'Z', 'XX', 'YY', 'ZZ', 'XY', 'YZ', 'ZX', 'ONE'] as const;
type FNBase<T extends readonly any[]> = { [K in keyof T]: number };
type FactorNumbers = FNBase<typeof FactorKey>;

const regression = (size: number) => {
  const seq = sequential(FactorKey.length, size);
  const UU = vec3.create();
  const UV = vec3.create();
  const acc = new Float32Array(FactorKey.length);
  return (outGradient: vec3, /** U */ input: V3 | vec3, cb?: (factors: FactorNumbers, i: number) => void) => {
    const [x, y, z] = input;
    vec3.multiply(UU, input, input);
    vec3.multiply(UV, input, [y, z, x]);

    const [xx, yy, zz] = UU;
    const [xy, yz, zx] = UV;
    seq.accumulate(acc, [x, y, z, xx, yy, zz, xy, yz, zx, 1], add);

    const [X, Y, Z, XX, YY, ZZ, XY, YZ, ZX, ONE] = acc;

    const A = Gradient(X, XY, Y, YY, ONE);
    // const B = Intercept(X, XY, Y, YY, ONE);
    const C = Gradient(Y, YZ, Z, ZZ, ONE);
    // const D = Intercept(Y, YZ, Z, ZZ, ONE);
    const E = Gradient(Z, ZX, X, XX, ONE);
    // const F = Intercept(Z, ZX, X, XX, ONE);

    if (A === null) {
      vec3.set(outGradient, 1, 0, E || 0);
      // vec3.set(outIntercept, 0, D, F);
    } else if (C === null) {
      vec3.set(outGradient, A || 0, 1, 0);
      // vec3.set(outIntercept, B, 0, F);
    } else if (E === null) {
      vec3.set(outGradient, 0, C || 0, 1);
      // vec3.set(outIntercept, B, D, 0);
    } else {
      vec3.set(outGradient, 1 / E, C, 1);
      // vec3.set(outIntercept, B + D / E / C, D, 0);
    }
    vec3.normalize(outGradient, outGradient);
    // vec3.scaleAndAdd(outIntercept, outIntercept, outGradient, -vec3.dot(outIntercept, outGradient));
    if (cb) seq.forEach(cb as any);
  };
};

/**
 * calculate determinant for least squares
 */
const Determinant = (v: number, vv: number, one: number) => {
  const reciprocal = vv * one - v ** 2;
  return reciprocal < glMatrix.EPSILON ? null : reciprocal ** -1;
};

const Gradient = (
  u: number,
  uv: number,
  v: number,
  vv: number,
  one: number,
  det: number | null = Determinant(v, vv, one),
) => (det === null ? null : (uv * one - u * v) * det);

// We don't use intercept for now.
// const Intercept = (
//   u: number,
//   uv: number,
//   v: number,
//   vv: number,
//   one: number,
//   det: number | null = calcDet(v, vv, one),
// ) => (det === null ? null : (-uv * u + vv * v) * det);

export default regression;
