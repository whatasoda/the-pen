import { quat, vec3 } from 'gl-matrix';
import { cartesianToArray } from '../utils/converter';
import createStabilizer from './stabilizer';
import createMotionCacher from './motionCacher';
import createQuatFilter from '../utils/quatFilter';

type V3 = [number, number, number];

const createDeviceMotion = ({ elasticity, viscous }: DeviceMotionConstant) => {
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

  const C_alpha = vec3.create(); // z
  const C_beta = vec3.create(); // x
  const C_gamma = vec3.create(); // y
  C_alpha.set([0, 1, 0]);
  C_beta.set([1, 0, 0]);
  C_gamma.set([0, 0, 1]);

  // alert([...C_alpha].join())
  // alert([...C_beta].join())
  // alert([...C_gamma].join())
  const P_alpha_curr = vec3.create();
  const P_beta_curr = vec3.create();
  const P_gamma_curr = vec3.create();

  // const P_alpha_prev = vec3.create();
  // const P_beta_prev = vec3.create();
  const P_gamma_prev = vec3.create();

  let twist: number = 0;
  let first: boolean = true;

  const attack = vec3.create();

  const n = 0.03;
  const quatFilter = createQuatFilter({
    bias: [0.02, 0.02, 0.02],
    Q: [n, 0, 0, 0, 0, n, 0, 0, 0, 0, n, 0, 0, 0, 0, n],
    R: [n, 0, 0, 0, 0, n, 0, 0, 0, 0, n, 0, 0, 0, 0, n],
  });

  // const madgwick = new AHRS({
  //   algorithm: 'Madgwick',
  //   sampleInterval: 60,
  // });
  // const G = vec3.create();
  // const D2R = Math.PI / 180;

  const motionCatcher = createMotionCacher({ bufferSize: 25 });

  const deviceMotion = (input: DeviceMotionInput, cb: (k: string, v: number) => void = () => {}) => {
    applyInput(input);
    Q_angle.forEach((v, i) => cb(`Q_angle:${i}`, v * 100));

    const dt = input.interval;
    const { u, v, alpha, beta } = updateHeadMovement(dt);

    const movment = [...V_movement];
    const { dot, pow } = motionCatcher.update([u, v]);
    cb('u', u * 1000);
    cb('v', v * 1000);
    cb('dot', dot * 100);
    cb('pow', pow * 10000);
    cb('alpha', alpha * 100);
    cb('beta', beta * 100);
    const { acceleration, velocity, jerk } = stabilizer(movment as V3, dt);

    return { acceleration, velocity, jerk, twist, movment, attack: [...attack], dot, pow };
  };

  const applyInput = ({
    interval: dt,
    acceleration,
    // accelerationIncludingGravity,
    orientation,
    rotationRate,
  }: DeviceMotionInput) => {
    // vec3.copy(G, cartesianToArray(accelerationIncludingGravity));
    // vec3.sub(G, cartesianToArray(accelerationIncludingGravity), cartesianToArray(acceleration));
    // vec3.normalize(G, G);
    // const [gx, gy, gz] = eulerToArray(rotationRate);
    // const [mx, my, mz] = eulerToArray(orientation);
    // madgwick.update(gx * D2R, gy * D2R, gz * D2R, G[0], G[1], G[2], mx * D2R, my * D2R, mz * D2R, dt);

    vec3.scaleAndAdd(V_velocity, V_velocity, cartesianToArray(acceleration), dt);
    vec3.scale(V_velocity, V_velocity, 0.99);

    // const { w, x, y, z } = madgwick.getQuaternion();
    // quat.set(Q_angle, x, y, z, w);
    // quat.normalize(Q_angle, Q_angle);
    quat.set(
      Q_angle,
      ...quatFilter({
        angle: orientation,
        rate: rotationRate,
        dt,
      }),
    );
  };

  const tmp = vec3.create();
  const updateHeadMovement = (dt: number) => {
    vec3.transformQuat(P_alpha_curr, C_alpha, Q_angle);
    vec3.transformQuat(P_beta_curr, C_beta, Q_angle);
    vec3.transformQuat(P_gamma_curr, C_gamma, Q_angle);
    vec3.normalize(P_alpha_curr, P_alpha_curr);
    vec3.normalize(P_beta_curr, P_beta_curr);
    vec3.normalize(P_gamma_curr, P_gamma_curr);

    if (first) {
      vec3.scale(V_movement, V_velocity, dt);
      first = false;
    } else {
      vec3.scale(V_movement, P_gamma_curr, 1 / vec3.dot(P_gamma_curr, P_gamma_prev));
      vec3.sub(V_movement, V_movement, P_gamma_prev);
      vec3.transformQuat(V_movement, V_movement, quat.invert(Tmp_quat, Q_angle));
      vec3.scaleAndAdd(V_movement, V_movement, V_velocity, dt);
    }

    const u = vec3.dot(C_alpha, V_movement);
    const v = vec3.dot(C_beta, V_movement);

    vec3.cross(tmp, P_gamma_curr, C_beta);
    let len = vec3.length(tmp);
    // if (len < Math.sqrt(3) / 2) {
    //   vec3.cross(tmp, P_gamma_curr, C_beta);
    //   len = -vec3.length(tmp);
    // }
    const alpha = vec3.dot(P_alpha_curr, tmp) / len;
    const beta = len;

    // vec3.copy(P_alpha_prev, P_alpha_curr);
    // vec3.copy(P_beta_prev, P_beta_curr);
    vec3.copy(P_gamma_prev, P_gamma_curr);
    return { u, v, alpha, beta };
  };

  return deviceMotion;
};

export default createDeviceMotion;
