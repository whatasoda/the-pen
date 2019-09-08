interface KalmanConstant {
  QAngle: number;
  QBias: number;
  RMeasure: number;
}

interface QuatFilterConstant {
  bias: V3;
  Q: M4;
  R: M4;
}

interface QuatFilterInput {
  rate: EulerRotation;
  angle: EulerRotation;
  dt: number;
}

interface VisualizerHandle {
  entry(label: string, color: number, values: V3): void;
}
interface VisualizerEntry {
  values: V3;
  color: number;
}
