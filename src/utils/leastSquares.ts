import { vec3, glMatrix } from 'gl-matrix';
import sequential, { add } from './sequential';
import { zeroPeak } from './converter';

const FactorKey = ['X', 'Y', 'Z', 'XX', 'YY', 'ZZ', 'XY', 'YZ', 'ZX', 'ONE'] as const;

const LeastSquares = (size: number) => {
  const seq = sequential(FactorKey.length, size);

  const regressionLine = (() => {
    const UU = vec3.create();
    const UV = vec3.create();
    const acc = new Float32Array(FactorKey.length);
    return (outGradient: vec3, outIntercept: vec3, /** U */ input: V3 | vec3) => {
      const [x, y, z] = input;
      vec3.multiply(UU, input, input);
      vec3.multiply(UV, input, [y, z, x]);

      const [xx, yy, zz] = UU;
      const [xy, yz, zx] = UV;
      seq.accumulate(acc, [x, y, z, xx, yy, zz, xy, yz, zx, 1], add);

      const [X, Y, Z, XX, YY, ZZ, XY, YZ, ZX, ONE] = acc;

      const [[A, B], [C, D], [E, F]] = [
        calculateLeastSquares(X, XY, Y, YY, ONE),
        calculateLeastSquares(Y, YZ, Z, ZZ, ONE),
        calculateLeastSquares(Z, ZX, X, XX, ONE),
      ];

      if (A === null) {
        vec3.set(outGradient, 1, 0, E || 0);
        vec3.set(outIntercept, 0, D, F);
      } else if (C === null) {
        vec3.set(outGradient, A || 0, 1, 0);
        vec3.set(outIntercept, B, 0, F);
      } else if (E === null) {
        vec3.set(outGradient, 0, C || 0, 1);
        vec3.set(outIntercept, B, D, 0);
      } else {
        vec3.set(outGradient, 1 / E, C, 1);
        vec3.set(outIntercept, B + D / E / C, D, 0);
      }
      vec3.normalize(outGradient, outGradient);
      vec3.scaleAndAdd(outIntercept, outIntercept, outGradient, -vec3.dot(outIntercept, outGradient));
    };
  })();

  const calculate = (() => {
    const gradient = vec3.create();
    const intercept = vec3.create();
    const tmp = vec3.create();
    return (input: V3 | vec3, coef: number = 1) => {
      regressionLine(gradient, intercept, input);
      let prev = 0;
      const raw = seq.reduceRight((acc, [x, y, z]) => {
        vec3.sub(tmp, [x, y, z], input);
        vec3.scaleAndAdd(tmp, tmp, gradient, -vec3.dot(tmp, gradient));
        const curr = vec3.sqrLen(tmp);
        const gap = (prev - curr) ** 2;
        prev = curr;
        return acc + gap;
      }, 0);
      return zeroPeak((coef * raw) / size);
    };
  })();

  return { regressionLine, calculate };
};

const calculateLeastSquares = (u: number, uv: number, v: number, vv: number, one: number): [number | null, number] => {
  // Reciprocal number of determinant
  const det = vv * one - v ** 2;
  if (det < glMatrix.EPSILON) {
    return [null, 0];
  }

  const gradient = (uv * one - u * v) / det;
  const intercept = (-uv * u + vv * v) / det;

  return [gradient, intercept];
};

export default LeastSquares;
