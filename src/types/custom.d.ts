interface InstrumentConfig {}

interface DeviceMotionInput {
  acceleration: DeviceAcceleration | null;
  accelerationIncludingGravity: DeviceAcceleration | null;
  rotationRate: DeviceRotationRate | null;
}

interface DeviceMotionOutput {
  rotationRate: number[];
  rotation: number[];
  acceleration: number[];
  velocity: number[];
  jerk: number[];
}

interface HeadMotionObject {
  posture: {
    up: number[];
    front: number[];
  };
  motion: {
    acceleration: number[];
    velocity: number[];
    jerk: number[];
  };
}
