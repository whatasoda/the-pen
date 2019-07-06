import { vec3, glMatrix, quat } from 'gl-matrix';
import {
  Point,
  TrackerAccumulator,
  TrackerMotionInput,
  LeastSquaresComponents,
  TrackerOptions,
  TrackerContext,
  TrackerOrientationInput,
} from './decls';

const V = vec3.create();

const assignMotion = (ctx: TrackerContext, input: TrackerMotionInput) => {
  const point = calculatePoint(ctx.acc, input, ctx.options);
  if (!point) return;
  ctx.points.push(point);
  ctx.shouldUpdate = true;
};

const assignOrientation = (ctx: TrackerContext, input: TrackerOrientationInput) => {
  const { alpha, beta, gamma } = input;
  vec3.set(ctx.acc.rotation, alpha || 0, beta || 0, gamma || 0);
};

const getPoints = (ctx: TrackerContext, range: number): Point[] => {
  const { acc, options, points } = ctx;
  if (ctx.shouldUpdate) {
    ctx.shouldUpdate = false;
    ctx.points = getPoints(ctx, options.maxTimeRange);
  }
  const breakpoint = acc.timestamp - Math.min(Math.max(0, range), options.maxTimeRange);

  const i = points.findIndex(({ timestamp }) => timestamp > breakpoint);
  return points.slice(i !== -1 ? i : 0);
};

/**
 * It calculate tracked point in absolute coordinate system.
 * It also accumulate given input and speed decrement to acc.
 * @param acc
 * @param input
 * @param options
 */
const calculatePoint = (acc: TrackerAccumulator, input: TrackerMotionInput, options: TrackerOptions): Point | null => {
  if (!input.acceleration || !input.rotationRate) return null;

  const { Q } = calculatePoint;
  const { speedRegistancePerSec } = options;
  const {
    interval: ms,
    acceleration: { y, x, z },
  } = input;
  const interval = ms;

  acc.timestamp += interval;
  const { rotation, position, velocity, timestamp } = acc;

  /**
   * We want to apply invert rotation to acceleration.
   * Euler order of `DeviceMotionEventRotationRate` is Z-X-Y.
   */
  const [rZ, rX, rY] = rotation;
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

  const leastSquares = calculateLeastSquaresComponents(withoutWeight);

  return { ...withoutWeight, leastSquares };
};
calculatePoint.Q = quat.create();

type PointWithoutWeight = Omit<Point, 'leastSquares'>;
const calculateLeastSquaresComponents = ({
  position,
  velocity,
  movement: weight,
}: PointWithoutWeight): LeastSquaresComponents => {
  const { u, uu, uv, U, UU, UV } = calculateLeastSquaresComponents;

  vec3.copy(u, position);
  vec3.multiply(uu, u, u);
  vec3.multiply(uv, u, [u[1], u[2], u[0]]);

  vec3.copy(U, u);
  vec3.copy(UU, uu);
  vec3.copy(UV, uv);

  vec3.scaleAndAdd(u, u, velocity, -weight / vec3.length(velocity));
  vec3.multiply(uu, u, u);
  vec3.multiply(uv, u, [u[1], u[2], u[0]]);

  vec3.add(U, U, u);
  vec3.add(UU, UU, uu);
  vec3.add(UV, UV, uv);

  const [x, y, z] = vec3.scale(U, U, weight);
  const [xx, yy, zz] = vec3.scale(UU, UU, weight);
  const [xy, yz, zx] = vec3.scale(UV, UV, weight);
  const one = 2 * weight;
  return { x, y, z, xx, yy, zz, xy, yz, zx, one };
};
calculateLeastSquaresComponents.U = vec3.create();
calculateLeastSquaresComponents.UU = vec3.create();
calculateLeastSquaresComponents.UV = vec3.create();
calculateLeastSquaresComponents.u = vec3.create();
calculateLeastSquaresComponents.v = vec3.create();
calculateLeastSquaresComponents.uv = vec3.create();
calculateLeastSquaresComponents.uu = vec3.create();

type WeightCalculator = (index: number, length: number, leastSquares: LeastSquaresComponents) => number;
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
 * @param outGradient vec3 to set gradient
 * @param outIntercept vec3 to set intercept
 * @param points input points
 */
const calculateRegressionDirection = (
  outGradient: vec3,
  outIntercept: vec3,
  points: Point[],
  getWeight?: WeightCalculator,
) => {
  const leastSquaresList: LeastSquaresComponents[] = [];
  const weights: number[] = [];

  const { length } = points;
  points.forEach(({ leastSquares }, index) => {
    leastSquaresList.push(leastSquares);
    weights.push(getWeight ? getWeight(index, length, leastSquares) : 1);
  });
  const [[A, B], [C, D], [E, F]] = solveLeastSquaresMethod(leastSquaresList, weights);

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

/**
 * It returns scalar of gradient of **U = AV + B**, or null if determinant is Infinity. We do not use `intercept` currently.
 * @param leastSquaresList
 */
const solveLeastSquaresMethod = (
  leastSquaresList: LeastSquaresComponents[],
  weights: number[],
): [number | null, number][] => {
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

  leastSquaresList.forEach(({ x, xx, xy, y, yy, yz, z, zx, zz, one }, i) => {
    const w = weights[i];
    X += x * w;
    Y += y * w;
    Z += z * w;
    XX += xx * w;
    YY += yy * w;
    ZZ += zz * w;
    XY += xy * w;
    YZ += yz * w;
    ZX += zx * w;
    ONE += one * w;
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

export {
  assignMotion,
  assignOrientation,
  calculatePoint,
  calculateRegressionDirection,
  solveLeastSquaresMethod,
  getPoints,
};
