import { vec3, mat4 } from 'gl-matrix';
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

const createTrackerCore = (options: Partial<TrackerOptions>): TrackerCore => {
  const ctx = createContext(options);

  const pushMotion: TrackerCore['pushMotion'] = (motion) => {
    const point = calculatePoint(ctx.acc, motion, ctx.options);
    if (!point) return;
    ctx.points.push(point);
    ctx.shouldUpdate = true;
  };

  const pushOrientation: TrackerCore['pushOrientation'] = ({ alpha, beta, gamma }) => {
    vec3.set(ctx.acc.rotation, alpha || 0, beta || 0, gamma || 0);
  };

  const snapshot: TrackerCore['snapshot'] = (range) => {
    if (ctx.shouldUpdate) {
      ctx.points = getPoints(ctx, ctx.options.maxTimeRange);
      ctx.shouldUpdate = false;
    }
    const src = getPoints(ctx, range || 0);

    if (src.length < 2) return { points: [], normalized: [] };

    const min = 0.9;
    const max = 0.5;
    const start = src[0].position;
    const end = src[src.length - 1].position;

    vec3.sub(P, start, end);
    vec3.normalize(P, P);

    calculateRegressionDirection(axisZ, origin, src, (i, l) => {
      const clip = (Math.min(Math.max(min, i / l), max) + min) / (max - min);
      return clip ** 2;
    });
    vec3.scale(axisZ, axisZ, Math.sign(vec3.dot(P, axisZ)) || 1);
    vec3.cross(axisX, origin, axisZ);

    vec3.copy(eye, end);
    vec3.add(center, eye, axisZ);
    vec3.normalize(up, axisX);

    mat4.lookAt(transform4, eye, center, up);

    let zmax = 0;
    let zmin = 0;
    const points = src.map(({ position: raw, movement, timestamp }) => {
      vec3.transformMat4(P, raw, transform4);
      const position = [...P];
      zmax = Math.max(zmax, position[2]);
      zmin = Math.min(zmin, position[2]);
      return { position, movement, timestamp };
    });
    const length = zmax - zmin;

    const normalized = points.map(({ position: [x, y, z] }) => [(x ** 2 + y ** 2) ** 0.5 / length, z / length]);

    return { points, normalized };
  };

  return {
    ctx,
    pushMotion,
    pushOrientation,
    snapshot,
  };
};

export default createTrackerCore;
