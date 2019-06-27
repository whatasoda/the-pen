import { vec3, mat4, mat3 } from 'gl-matrix';
import { TrackerContext, TrackerCore, TrackerOptions } from './decls';
import { calculatePoint, getPoints, calculateRegressionDirection } from './math';

const DEFAULT_TIME_RANGE = 1;
const DEFAULT_SPEED_REGISTANCE = 5;

const createContext = ({
  maxTimeRange = DEFAULT_TIME_RANGE,
  speedRegistancePerSec = DEFAULT_SPEED_REGISTANCE,
}: Partial<TrackerOptions>): TrackerContext => ({
  shouldUpdate: false,
  options: { maxTimeRange, speedRegistancePerSec },
  points: [],
  acc: {
    rotation: vec3.create(),
    velocity: vec3.create(),
    position: vec3.create(),
    timestamp: 0,
  },
});

const P = vec3.create();
const origin = vec3.create();
const eye = vec3.create();
const center = vec3.create();
const up = vec3.create();
const axisZ = vec3.create();
const axisX = vec3.create();
const transform4 = mat4.create();
const transform3 = mat3.create();

const createTrackerCore = (options: Partial<TrackerOptions>): TrackerCore => {
  const ctx = createContext(options);

  const push: TrackerCore['push'] = (input) => {
    const point = calculatePoint(ctx.acc, input, ctx.options);
    if (!point) return;
    ctx.points.push(point);
    ctx.shouldUpdate = true;
  };

  const snapshot: TrackerCore['snapshot'] = (range) => {
    if (ctx.shouldUpdate) {
      ctx.points = getPoints(ctx, ctx.options.maxTimeRange);
      ctx.shouldUpdate = false;
    }
    const src = getPoints(ctx, range || 0);

    if (!src.length) return { points: [] };

    calculateRegressionDirection(axisZ, origin, src);
    vec3.cross(axisX, origin, axisZ);

    vec3.copy(eye, src[0].position);
    vec3.add(center, eye, axisZ);
    vec3.normalize(up, axisX);

    mat4.lookAt(transform4, eye, center, up);
    mat3.fromMat4(transform3, transform4);

    const points = src.map(({ position: raw, movement, timestamp }) => {
      const position = [...vec3.transformMat4(P, raw, transform4)];
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
