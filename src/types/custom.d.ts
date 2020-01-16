import { vec3 } from 'gl-matrix';

declare global {
  type V2 = [number, number];
  type V3 = [number, number, number];
  type V4 = [number, number, number, number];
  type M4 = [
    number, number, number, number, // eslint-disable-line prettier/prettier
    number, number, number, number, // eslint-disable-line prettier/prettier
    number, number, number, number, // eslint-disable-line prettier/prettier
    number, number, number, number, // eslint-disable-line prettier/prettier
  ];

  type CartesianKey = 'x' | 'y' | 'z';
  type EulerKey = 'alpha' | 'beta' | 'gamma';
  type EulerRotation = Record<EulerKey, number | null>;
  type CartesianCoord = Record<CartesianKey, number | null>;

  interface MotionOutput {
    direction: vec3;
    axis: vec3;
  }

  interface MotionPayload {
    angle: number;
    power: number;
    attack: number;
    liner: number;
    curve: number;
  }

  interface VisualizerHandle {
    showVector: (label: string, color: number, values: vec3) => void;
    setBall: (axis: vec3, arm: vec3, leg: vec3) => void;
    showPin: (pos: vec3, radius: number) => void;
  }
  interface VisualizerEntry {
    values: vec3;
    color: number;
  }

  interface InstrumentConfig {}

  interface AudioRoot {
    status: 'LOADING' | 'RESTART_REQUIRED' | 'RUNNING';
    /**
     * This function have to be called in user gesture such as `click` and `touchstart`.
     */
    start: (() => void) | null;
    registerNode: <T>(factory: (ctx: AudioContext) => readonly [T, AudioScheduledSourceNode, AudioNode]) => Promise<T>;
  }
  interface AudioRootObject extends Omit<AudioRoot, 'status'> {
    start: () => void;
  }
}
