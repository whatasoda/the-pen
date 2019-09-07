import { quat, vec3, mat4 } from 'gl-matrix';
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

  const P_0_curr = vec3.create();
  const P_0_prev = vec3.create();

  const P_1_curr = vec3.create();
  const P_1_prev = vec3.create();

  const P_2_curr = vec3.create();
  const P_2_prev = vec3.create();

  let twist: number = 0;
  let first: boolean = true;

  const m = mat4.identity(mat4.create());
  mat4.multiplyScalar(m, m, 0.01);
  const attack = vec3.create();

  const deviceMotion = (input: DeviceMotionInput, cb: (k: string, v: number) => void = () => {}) => {
    eulerToArray(input.orientation).forEach((v, i) => cb(`orientation:${i}`, v));
    eulerToArray(input.rotationRate).forEach((v, i) => cb(`rotationRate:${i}`, v));
    cartesianToArray(input.acceleration).forEach((v, i) => cb(`acceleration:${i}`, v));
    applyInput(input);
    Q_angle.forEach((v, i) => cb(`Q_angle:${i}`, v * 100));

    const dt = input.interval;
    updateHeadMovement(dt);
    end();

    const movment = [...V_movement];
    const { acceleration, velocity, jerk } = stabilizer(movment as V3, dt);

    return { acceleration, velocity, jerk, twist, movment, attack: [...attack] };
  };
  const madgwick = new AHRS({
    algorithm: 'Madgwick',
    sampleInterval: 60,
  });
  const a = vec3.create();
  const D2R = Math.PI / 180;

  const applyInput = ({
    interval: dt,
    acceleration,
    accelerationIncludingGravity,
    orientation,
    rotationRate,
  }: DeviceMotionInput) => {
    vec3.sub(a, cartesianToArray(accelerationIncludingGravity), cartesianToArray(acceleration));
    const [gx, gy, gz] = eulerToArray(rotationRate);
    const [mx, my, mz] = eulerToArray(orientation);
    madgwick.update(gx * D2R, gy * D2R, gz * D2R, a[0], a[1], a[2], mx * D2R, my * D2R, mz * D2R, dt);

    vec3.scaleAndAdd(V_velocity, V_velocity, cartesianToArray(acceleration), dt);
    vec3.scale(V_velocity, V_velocity, 0.99);

    const { w, x, y, z } = madgwick.getQuaternion();
    quat.set(Q_angle, x, y, z, w);
  };

  const end = () => {
    vec3.copy(P_0_prev, P_0_curr);
    vec3.copy(P_1_prev, P_1_curr);
    vec3.copy(P_2_prev, P_2_curr);
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
