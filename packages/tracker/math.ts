import { vec3, glMatrix, quat } from 'gl-matrix';
import {
  Point,
  CoordKey,
  TrackerAccumulator,
  TrackerInput,
  LeastSquaresWeight,
  TrackerOptions,
  RegressionWeight,
  TrackerContext,
} from './decls';

const REGRESSION_COORD_ORDER = [0, 1, 2] as const;
const REGRESSION_COORD_U = [0, 1, 2] as const;
const REGRESSION_COORD_V = [1, 2, 0] as const;

const Q = quat.create();
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

  const { speedRegistancePerSec, distanceBetweenPoints } = options;
  const {
    interval: ms,
    rotationRate: { gamma, beta, alpha },
    acceleration: { y, x, z },
  } = input;
  const interval = ms * 1e3;

  acc.timestamp += interval;
  const { rotation, position, velocity, timestamp } = acc;

  /**
   * We want to apply invert rotation to acceleration.
   * Euler order of `DeviceMotionEventRotationRate` is Z-X-Y.
   */
  const [rZ, rX, rY] = vec3.scaleAndAdd(rotation, rotation, [alpha || 0, beta || 0, gamma || 0], interval);
  quat.fromEuler(Q, -rY, -rX, -rZ);
  const [aY, aX, aZ] = vec3.transformQuat(V, [y || 0, x || 0, z || 0], Q);
  const acceleration = vec3.fromValues(aY, aX, aZ);

  const speed = vec3.length(velocity);
  const mag = Math.max(glMatrix.EPSILON, (speed - speedRegistancePerSec * interval) / speed);
  vec3.scale(velocity, velocity, mag);
  vec3.scaleAndAdd(velocity, velocity, acceleration, interval);

  vec3.scaleAndAdd(position, position, velocity, interval);

  const movement = vec3.length(velocity) * interval;

  const toLerp: PointToLerp = {
    velocity: vec3.clone(velocity),
    position: vec3.clone(position),
    movement,
    interval,
  };

  const weight = calculateRegressionWeight(toLerp, distanceBetweenPoints);

  return { ...toLerp, weight, timestamp };
};

const calculateRegressionWeight = (point: PointToLerp, distanceBetweenPoints: number): RegressionWeight => {
  const line = lerpLine(point, distanceBetweenPoints);
  const weight = REGRESSION_COORD_ORDER.map((o) =>
    calculateLeastSquaresWeight(line, REGRESSION_COORD_U[o], REGRESSION_COORD_V[o]),
  ) as RegressionWeight;

  return weight;
};

type PointToLerp = Pick<Point, 'position' | 'velocity' | 'interval' | 'movement'>;
const lerpLine = ({ position, velocity, interval, movement }: PointToLerp, distanceBetweenPoints: number): vec3[] => {
  const count = Math.floor(movement / distanceBetweenPoints);
  const step = interval / count;
  vec3.copy(V, position);

  const acc = [];
  for (let i = 0; i < count; i++) {
    const p = vec3.scaleAndAdd(vec3.create(), V, velocity, interval - i * step);
    acc.push(p);
  }

  return acc;
};

const calculateLeastSquaresWeight = (line: vec3[], kU: CoordKey, kV: CoordKey): LeastSquaresWeight => {
  let u = 0;
  let uv = 0;
  let v = 0;
  let vv = 0;
  let one = 0;

  line.forEach(({ [kU]: U, [kV]: V }) => {
    u += U;
    uv += U * V;
    v += V;
    vv += V ** 2;
    one += 1;
  });

  return { u, uv, v, vv, one };
};

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
 * @param out vec3 to set result
 * @param points input points
 */
const calculateRegressionDirection = (out: vec3, points: Point[]): vec3 => {
  const weightsList: [LeastSquaresWeight[], LeastSquaresWeight[], LeastSquaresWeight[]] = [[], [], []];
  points.forEach(({ weight }) => {
    weightsList.forEach((weights, i) => weights.push(weight[i]));
  });

  // B, D and F are unnecessary for intercept.
  const [A, C, E] = weightsList.map(solveLeastSquaresMethod);

  if (A === null) {
    vec3.set(out, 1, 0, E || 0);
  } else if (C === null) {
    vec3.set(out, A || 0, 1, 0);
  } else if (E === null) {
    vec3.set(out, 0, C || 0, 1);
  } else {
    vec3.set(out, 1 / E, C, 1);
  }

  return vec3.normalize(out, out);
};

/**
 * It returns scalar of gradient of **U = AV + B**, or null if determinant is Infinity. We do not use `intercept` currently.
 * @param weights
 */
const solveLeastSquaresMethod = (weights: LeastSquaresWeight[]): number | null => {
  // variables to accumulate
  let V = 0;
  let VV = 0;
  let U = 0;
  let UV = 0;
  let ONE = 0;

  weights.forEach(({ u, uv, v, vv, one }) => {
    U += u;
    V += v;
    VV += vv;
    UV += uv;
    ONE += one;
  });

  // Reciprocal number of determinant
  const det = VV * ONE - V ** 2;
  if (det < glMatrix.EPSILON) {
    return null;
  }

  const gradient = (UV * ONE - U * V) / det;
  // const intercept = (-UV * U + V2 * V) / det;

  return gradient;
};

const getPoints = ({ acc, options, points }: TrackerContext, range: number): Point[] => {
  const breakpoint = acc.timestamp - Math.min(Math.max(0, range), options.maxTimeRange);
  const i = points.findIndex(({ timestamp }) => timestamp > breakpoint);
  return points.slice(i);
};

export { calculatePoint, calculateRegressionDirection, solveLeastSquaresMethod, getPoints };
