import { vec3, mat4, mat3 } from 'gl-matrix';
import { TrackerContext, TrackerCore, TrackerOptions } from './decls';
import { calculatePoint, getPoints, calculateRegressionDirection } from './math';

const DEFAULT_TIME_RANGE = 0.2;
const DEFAULT_SPEED_REGISTANCE = 0.1;
const DEFAULT_DISTANCE_BETWEEN_POINTS = 0.005;

const createContext = ({
  distanceBetweenPoints = DEFAULT_DISTANCE_BETWEEN_POINTS,
  maxTimeRange = DEFAULT_TIME_RANGE,
  speedRegistancePerSec = DEFAULT_SPEED_REGISTANCE,
}: Partial<TrackerOptions>): TrackerContext => ({
  options: { distanceBetweenPoints, maxTimeRange, speedRegistancePerSec },
  points: [],
  acc: {
    rotation: vec3.create(),
    velocity: vec3.create(),
    position: vec3.create(),
    timestamp: 0,
  },
});

const axisZ = vec3.create();
const axisX = vec3.create();
const transform4 = mat4.create();
const transform3 = mat3.create();

const createTrackerCore = (options: Partial<TrackerOptions>): TrackerCore => {
  const ctx = createContext(options);

  const push: TrackerCore['push'] = (input) => {
    const point = calculatePoint(ctx.acc, input, ctx.options);
    if (point) ctx.points.push(point);
  };

  const snapshot: TrackerCore['snapshot'] = (range) => {
    ctx.points = getPoints(ctx, ctx.options.maxTimeRange);
    const src = getPoints(ctx, range || 0);

    calculateRegressionDirection(axisZ, src);
    vec3.cross(axisX, ctx.acc.velocity, axisZ);
    vec3.normalize(axisX, axisX);

    mat4.lookAt(transform4, [0, 0, 0], axisZ, axisX);
    mat3.fromMat4(transform3, transform4);

    const points = src.map(({ position: raw, movement, timestamp }) => {
      const position = vec3.transformMat4(vec3.create(), raw, transform4);
      return { position, movement, timestamp };
    });

    return { points };
  };

  return {
    ctx,
    push,
    snapshot,
  };
};

export default createTrackerCore;
