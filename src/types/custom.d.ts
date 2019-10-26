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
    entry(label: string, color: number, values: V3): void;
  }
  interface VisualizerEntry {
    values: V3;
    color: number;
  }

  interface InstrumentConfig {}
}
