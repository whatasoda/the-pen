import { quat, vec3, mat4 } from 'gl-matrix';
import { eulerToArray, cartesianToArray } from '../utils/converter';
import { completeAxis } from '../utils/vector';
import createStabilizer from './stabilizer';
import createQuatFilter from '../utils/quatFilter';

type V3 = [number, number, number];

const createDeviceMotion = ({ direction, twistCycle, elasticity, viscous }: DeviceMotionConstant) => {
  const stabilizer = createStabilizer({ elasticity, viscous });
  /**
   * Tmp: temp
   * Q: quaternion
   * V: vector
   * C: coordinate
   * P: point
   */
  const Tmp_twist = vec3.create();
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
  const quatFilter = createQuatFilter({
    Q: Array.from(m) as M4,
    R: Array.from(m) as M4,
    bias: [0, 0, 0],
  });

  const deviceMotion = (input: DeviceMotionInput, cb: (k: string, v: number) => void = () => {}) => {
    eulerToArray(input.orientation).forEach((v, i) => cb(`orientation:${i}`, v));
    eulerToArray(input.rotationRate).forEach((v, i) => cb(`rotationRate:${i}`, v));
    cartesianToArray(input.acceleration).forEach((v, i) => cb(`acceleration:${i}`, v));
    applyInput(input);
    Q_angle.forEach((v, i) => cb(`Q_angle:${i}`, v * 100));
    start();
    const dt = input.interval;
    updateHeadMovement(dt);
    updateTwist();
    end();

    const { acceleration, velocity, jerk } = stabilizer([...V_movement] as V3, dt);
    return { acceleration, velocity, jerk, twist };
  };

  const applyInput = ({ interval: dt, acceleration, orientation, rotationRate }: DeviceMotionInput) => {
    vec3.scaleAndAdd(V_velocity, V_velocity, cartesianToArray(acceleration), dt);
    vec3.scale(V_velocity, V_velocity, 0.99);

    quat.set(Q_angle, ...quatFilter({ angle: orientation, dt, rate: rotationRate }));
  };

  const start = () => {
    vec3.transformQuat(P_0_curr, C_0, Q_angle);
    vec3.transformQuat(P_1_curr, C_1, Q_angle);
    vec3.transformQuat(P_2_curr, C_2, Q_angle);
    vec3.normalize(P_0_curr, P_0_curr);
    vec3.normalize(P_1_curr, P_1_curr);
    vec3.normalize(P_2_curr, P_2_curr);
  };

  const end = () => {
    vec3.copy(P_0_prev, P_0_curr);
    vec3.copy(P_1_prev, P_1_curr);
    vec3.copy(P_2_prev, P_2_curr);
  };

  const updateTwist = () => {
    vec3.sub(Tmp_twist, P_0_curr, P_0_prev);
    vec3.scaleAndAdd(Tmp_twist, Tmp_twist, P_2_curr, vec3.dot(P_2_curr, Tmp_twist));
    const sign = Math.sign(vec3.dot(P_1_curr, Tmp_twist));

    const cos = 1 - vec3.sqrLen(Tmp_twist) / 2;
    twist += (sign * Math.acos(Math.max(Math.min(1, cos), -1))) / 10;
    if (twist < 0) {
      twist += twistCycle;
    } else if (twist > twistCycle) {
      twist -= twistCycle;
    }
  };

  const updateHeadMovement = (dt: number) => {
    vec3.transformQuat(P_2_curr, C_2, Q_angle);
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
