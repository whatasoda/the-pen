interface InstrumentConfig {}

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
