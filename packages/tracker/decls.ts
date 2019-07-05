import { vec3 } from 'gl-matrix';

export type TrackerCore = {
  readonly ctx: TrackerContext;
  pushMotion: (motion: TrackerMotionInput) => void;
  pushOrientation: (orientation: TrackerOrientationInput) => void;
  snapshot: (range?: number) => Snapshot;
};

export type Snapshot = {
  points: Pick<Point, 'position' | 'movement' | 'timestamp'>[];
  normalized: number[][];
};

export type Point = {
  velocity: number[];
  position: number[];
  movement: number;
  interval: number;
  timestamp: number;
  leastSquares: LeastSquaresComponents;
};

export type CoordKey = 0 | 1 | 2;
export type WeightElementKey = 'x' | 'y' | 'z' | 'xx' | 'yy' | 'zz' | 'xy' | 'yz' | 'zx' | 'one';
export type LeastSquaresComponents = Record<WeightElementKey, number>;

export type TrackerContext = {
  shouldUpdate: boolean;
  options: TrackerOptions;
  points: Point[];
  acc: TrackerAccumulator;
};

export type TrackerAccumulator = {
  rotation: vec3;
  velocity: vec3;
  position: vec3;
  timestamp: number;
};

export type TrackerMotionInput = {
  acceleration: DeviceMotionEventAcceleration | null;
  rotationRate: DeviceMotionEventRotationRate | null;
  interval: number;
};

export type TrackerOrientationInput = {
  absolute: boolean;
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

export type TrackerOptions = {
  maxTimeRange: number;
  speedRegistancePerSec: number;
};

export type PushInput = (input: TrackerMotionInput) => void;

export type UseTracker = () => void;
export type UseTrackerModule = () => void;
