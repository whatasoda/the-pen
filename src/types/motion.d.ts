interface DeviceMotionConstant {
  twistCycle: number;
  direction: V3;
  weight: number;
  elasticity: number;
  viscous: number;
}

interface DeviceMotionInput {
  acceleration: CartesianCoord;
  accelerationIncludingGravity: CartesianCoord;
  rotationRate: EulerRotation;
  orientation: EulerRotation;
  interval: number;
}

interface MotionCatcherConfigType {
  bufferSize: number;
  weightFactor: number;
}

interface StabilizerInput {
  dt: number;
  movement: number[];
}

// It should have `weight` also. But we implicity use 1.
interface StabilizerConstant {
  elasticity: number;
  viscous: number;
}
