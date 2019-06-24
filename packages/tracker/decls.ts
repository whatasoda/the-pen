import { vec3 } from 'gl-matrix';

export type TrackerCore = {
  readonly ctx: TrackerContext;
  push: (input: TrackerInput) => void;
  snapshot: (range?: number) => Snapshot;
};

export type Snapshot = {
  points: Pick<Point, 'position' | 'movement' | 'timestamp'>[];
};

export type Point = {
  velocity: number[];
  position: number[];
  movement: number; // movement distance from previous point
  interval: number;
  timestamp: number;
  weight: LeastSquaresWeight;
};

export type CoordKey = 0 | 1 | 2;
export type WeightElementKey = 'x' | 'y' | 'z' | 'xx' | 'yy' | 'zz' | 'xy' | 'yz' | 'zx' | 'one';
export type LeastSquaresWeight = Record<WeightElementKey, number>;

export type TrackerContext = {
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

export type TrackerInput = {
  acceleration: DeviceMotionEventAcceleration | null;
  rotationRate: DeviceMotionEventRotationRate | null;
  interval: number;
};

export type TrackerOptions = {
  maxTimeRange: number;
  speedRegistancePerSec: number;
  distanceBetweenPoints: number;
};

export type PushInput = (input: TrackerInput) => void;

export type UseTracker = () => void;
export type UseTrackerModule = () => void;
