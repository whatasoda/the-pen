import { quat, vec3 } from 'gl-matrix';
import { eulerToArray, cartesianToArray } from '../utils/converter';
import { completeAxis } from '../utils/vector';
import createStabilizer from './stabilizer';
import AHRS from 'ahrs';

type V3 = [number, number, number];

const createDeviceMotion = ({ direction, elasticity, viscous }: DeviceMotionConstant) => {
  const stabilizer = createStabilizer({ elasticity, viscous });
  /**
   * Tmp: temp
   * Q: quaternion
   * V: vector
   * C: coordinate
   * P: point
   */
  const Tmp_quat = quat.create();

  const Q_angle = quat.create();
  const V_velocity = vec3.create();
  const V_movement = vec3.create();

  const C_0 = vec3.create(); // z
  const C_1 = vec3.create(); // x
  const C_2 = vec3.create(); // y
  completeAxis(C_0, C_1, C_2, direction);

  // const P_0_curr = vec3.create();
  // const P_0_prev = vec3.create();

  // const P_1_curr = vec3.create();
  // const P_1_prev = vec3.create();

  const P_2_curr = vec3.create();
  const P_2_prev = vec3.create();

  let twist: number = 0;
  let first: boolean = true;

  const attack = vec3.create();

  const madgwick = new AHRS({
    algorithm: 'Madgwick',
    sampleInterval: 60,
  });
  const G = vec3.create();
  const D2R = Math.PI / 180;

  const deviceMotion = (input: DeviceMotionInput, cb: (k: string, v: number) => void = () => {}) => {
    eulerToArray(input.orientation).forEach((v, i) => cb(`orientation:${i}`, v));
    eulerToArray(input.rotationRate).forEach((v, i) => cb(`rotationRate:${i}`, v));
    cartesianToArray(input.acceleration).forEach((v, i) => cb(`acceleration:${i}`, v));
    applyInput(input);
    Q_angle.forEach((v, i) => cb(`Q_angle:${i}`, v * 100));

    const dt = input.interval;
    updateHeadMovement(dt);

    const movment = [...V_movement];
    const { acceleration, velocity, jerk } = stabilizer(movment as V3, dt);

    return { acceleration, velocity, jerk, twist, movment, attack: [...attack] };
  };

  const applyInput = ({
    interval: dt,
    acceleration,
    accelerationIncludingGravity,
    orientation,
    rotationRate,
  }: DeviceMotionInput) => {
    vec3.copy(G, cartesianToArray(accelerationIncludingGravity));
    // vec3.sub(G, cartesianToArray(accelerationIncludingGravity), cartesianToArray(acceleration));
    const [gx, gy, gz] = eulerToArray(rotationRate);
    const [mx, my, mz] = eulerToArray(orientation);
    madgwick.update(gx * D2R, gy * D2R, gz * D2R, G[0], G[1], G[2], mx * D2R, my * D2R, mz * D2R, dt);

    vec3.scaleAndAdd(V_velocity, V_velocity, cartesianToArray(acceleration), dt);
    vec3.scale(V_velocity, V_velocity, 0.99);

    const { w, x, y, z } = madgwick.getQuaternion();
    quat.set(Q_angle, x, y, z, w);
  };

  const updateHeadMovement = (dt: number) => {
    vec3.transformQuat(P_2_curr, C_2, Q_angle);
    vec3.normalize(P_2_curr, P_2_curr);

    if (first) {
      vec3.scale(V_movement, V_velocity, dt);
      first = false;
    } else {
      vec3.sub(V_movement, P_2_curr, P_2_prev);
      vec3.scaleAndAdd(V_movement, V_movement, V_velocity, dt);
    }

    vec3.transformQuat(V_movement, V_movement, quat.invert(Tmp_quat, Q_angle));
    vec3.copy(P_2_prev, P_2_curr);
  };

  return deviceMotion;
};

export default createDeviceMotion;
