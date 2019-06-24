import { vec3, glMatrix, quat } from 'gl-matrix';
import { Point, TrackerAccumulator, TrackerInput, LeastSquaresWeight, TrackerOptions, TrackerContext } from './decls';

const V = vec3.create();

/**
 * It calculate tracked point in absolute coordinate system.
 * It also accumulate given input and speed decrement to acc.
 * @param acc
 * @param input
 * @param options
 */
const calculatePoint = (acc: TrackerAccumulator, input: TrackerInput, options: TrackerOptions): Point | null => {
  if (!input.acceleration || !input.rotationRate) return null;

  const { Q } = calculatePoint;
  const { speedRegistancePerSec } = options;
  const {
    interval: ms,
    rotationRate: { gamma, beta, alpha },
    acceleration: { y, x, z },
  } = input;
  const interval = ms;

  acc.timestamp += interval;
  const { rotation, position, velocity, timestamp } = acc;

  /**
   * We want to apply invert rotation to acceleration.
   * Euler order of `DeviceMotionEventRotationRate` is Z-X-Y.
   */
  const [rZ, rX, rY] = vec3.scaleAndAdd(rotation, rotation, [alpha || 0, beta || 0, gamma || 0], interval * 1e-3);
  quat.fromEuler(Q, -rY, -rX, -rZ);
  const [aY, aX, aZ] = vec3.transformQuat(V, [y || 0, x || 0, z || 0], Q);
  const acceleration = vec3.fromValues(aY, aX, aZ);

  const speed = vec3.length(velocity);
  const mag = Math.max(glMatrix.EPSILON, (speed - speedRegistancePerSec * interval) / speed);
  vec3.scale(velocity, velocity, mag);
  vec3.scaleAndAdd(velocity, velocity, acceleration, interval);

  vec3.scaleAndAdd(position, position, velocity, interval);

  const movement = vec3.length(velocity) * interval;

  const withoutWeight: PointWithoutWeight = {
    velocity: [...velocity],
    position: [...position],
    movement,
    interval,
    timestamp,
  };

  const weight = calculateLeastSquaresWeight(withoutWeight);

  return { ...withoutWeight, weight };
};
calculatePoint.Q = quat.create();

type PointWithoutWeight = Omit<Point, 'weight'>;
const calculateLeastSquaresWeight = ({ position, velocity, movement }: PointWithoutWeight): LeastSquaresWeight => {
  const { u, uu, uv, U, UU, UV } = calculateLeastSquaresWeight;

  const w = movement;

  vec3.copy(u, position);
  vec3.multiply(uu, u, u);
  vec3.multiply(uv, u, [u[1], u[2], u[0]]);

  vec3.copy(U, u);
  vec3.copy(UU, uu);
  vec3.copy(UV, uv);

  vec3.scaleAndAdd(u, u, velocity, -movement / vec3.length(velocity));
  vec3.multiply(uu, u, u);
  vec3.multiply(uv, u, [u[1], u[2], u[0]]);

  vec3.add(U, U, u);
  vec3.add(UU, UU, uu);
  vec3.add(UV, UV, uv);

  const [x, y, z] = vec3.scale(U, U, w);
  const [xx, yy, zz] = vec3.scale(UU, UU, w);
  const [xy, yz, zx] = vec3.scale(UV, UV, w);
  const one = movement * 2;
  return { x, y, z, xx, yy, zz, xy, yz, zx, one };
};
calculateLeastSquaresWeight.U = vec3.create();
calculateLeastSquaresWeight.UU = vec3.create();
calculateLeastSquaresWeight.UV = vec3.create();
calculateLeastSquaresWeight.u = vec3.create();
calculateLeastSquaresWeight.v = vec3.create();
calculateLeastSquaresWeight.uv = vec3.create();
calculateLeastSquaresWeight.uu = vec3.create();

/**
 * Calculate direction vector of __regression line__ of given points via __least squares method__.
 * ```
 * [
 *  x = at + b
 *  y = ct + d
 *  z = et + f
 * ]
 * [
 *  x = Ay + B
 *  y = Cz + D
 *  z = Ex + F
 * ]
 * ```
 * @param gradient vec3 to set result
 * @param points input points
 */
const calculateRegressionDirection = (gradient: vec3, intercept: vec3, points: Point[]) => {
  const [[A, B], [C, D], [E, F]] = solveLeastSquaresMethod(points.map(({ weight }) => weight));

  if (A === null) {
    vec3.set(gradient, 1, 0, E || 0);
    vec3.set(intercept, 0, D, F);
  } else if (C === null) {
    vec3.set(gradient, A || 0, 1, 0);
    vec3.set(intercept, B, 0, F);
  } else if (E === null) {
    vec3.set(gradient, 0, C || 0, 1);
    vec3.set(intercept, B, D, 0);
  } else {
    vec3.set(gradient, 1 / E, C, 1);
    vec3.set(intercept, B + D / E / C, D, 0);
  }

  vec3.normalize(gradient, gradient);
  vec3.scaleAndAdd(intercept, intercept, gradient, -vec3.dot(intercept, gradient));
};

/**
 * It returns scalar of gradient of **U = AV + B**, or null if determinant is Infinity. We do not use `intercept` currently.
 * @param weights
 */
const solveLeastSquaresMethod = (weights: LeastSquaresWeight[]): [number | null, number][] => {
  let X = 0;
  let Y = 0;
  let Z = 0;
  let XX = 0;
  let YY = 0;
  let ZZ = 0;
  let XY = 0;
  let YZ = 0;
  let ZX = 0;
  let ONE = 0;

  weights.forEach(({ x, xx, xy, y, yy, yz, z, zx, zz, one }) => {
    X += x;
    Y += y;
    Z += z;
    XX += xx;
    YY += yy;
    ZZ += zz;
    XY += xy;
    YZ += yz;
    ZX += zx;
    ONE += one;
  });

  return [
    calculateLeastSquares(X, XY, Y, YY, ONE),
    calculateLeastSquares(Y, YZ, Z, ZZ, ONE),
    calculateLeastSquares(Z, ZX, X, XX, ONE),
  ];
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

const getPoints = ({ acc, options, points }: TrackerContext, range: number): Point[] => {
  const breakpoint = acc.timestamp - Math.min(Math.max(0, range), options.maxTimeRange);

  const i = points.findIndex(({ timestamp }) => timestamp > breakpoint);
  return points.slice(i);
};

export { calculatePoint, calculateRegressionDirection, solveLeastSquaresMethod, getPoints };
