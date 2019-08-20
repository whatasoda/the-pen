type EulerKey = 'alpha' | 'beta' | 'gamma';

interface DeviceMotionInput {
  acceleration: DeviceAcceleration;
  accelerationIncludingGravity: DeviceAcceleration;
  rotationRate: DeviceRotationRate;
  interval: number;
}

interface DeviceMotionOutput {
  dt: number;
  rotationRate: number[];
  rotation: number[];
  acceleration: number[];
  velocity: number[];
  jerk: number[];
}

interface HeadMotionInput {
  dt: number;
  rotation: number[];
  velocity: number[];
}

interface StabilizerInput {
  dt: number;
  movement: number[];
}

interface DeviceMotionConstant {
  kalman: Record<EulerKey, KalmanConstant>;
}

interface HeadMotionConstant {
  head: number[];
}

// It should have `weight` also. But we implicity use 1.
interface StabilizerConstant {
  elasticity: number;
  viscous: number;
}
