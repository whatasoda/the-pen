import { quat, vec3 } from 'gl-matrix';
import { cartesianToArray, eulerToArray } from '../utils/converter';
import createStabilizer from './stabilizer';
import createMotionCacher from './motionCacher';
import createQuatFilter from '../utils/quatFilter';

type V3 = [number, number, number];

const createDeviceMotion = (
  { elasticity, viscous }: DeviceMotionConstant,
  entry: VisualizerHandle['entry'],
  cb: (k: string, v: number) => void = () => {},
) => {
  const stabilizer = createStabilizer({ elasticity, viscous });
  /**
   * Tmp: temp
   * Q: quaternion
   * V: vector
   * C: coordinate
   * P: point
   */
  const Q_angle = quat.create();
  const V_velocity = vec3.create();

  const C_alpha = vec3.create(); // z
  const C_beta = vec3.create(); // x
  const C_gamma = vec3.create(); // y
  C_alpha.set([0, 1, 0]);
  C_beta.set([1, 0, 0]);
  C_gamma.set([0, 0, 1]);
  entry('C_alpha', 0x550000, [...C_alpha] as V3);
  entry('C_beta', 0x005500, [...C_beta] as V3);
  entry('C_gamma', 0x000055, [...C_gamma] as V3);

  // alert([...C_alpha].join())
  // alert([...C_beta].join())
  // alert([...C_gamma].join())
  const P_alpha_curr = vec3.create();
  const P_beta_curr = vec3.create();
  const P_gamma_curr = vec3.create();

  // const P_alpha_prev = vec3.create();
  const P_beta_prev = vec3.create();
  const P_gamma_prev = vec3.create();

  // const M_alpha = vec3.create();
  const M_beta = vec3.create();
  const M_gamma = vec3.create();

  let twist: number = 0;
  let first: boolean = true;

  const attack = vec3.create();

  const n = 0.003;
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

  const motionCatcher = createMotionCacher({ bufferSize: 25, weightFactor: 0.2 });

  const deviceMotion = (input: DeviceMotionInput) => {
    applyInput(input);
    Q_angle.forEach((v, i) => cb(`Q_angle:${i}`, v * 100));

    const dt = input.interval;
    const { u, v } = updateHeadMovement(dt);
    entry('P_alpha', 0xaa0000, [...P_alpha_curr] as V3);
    entry('P_beta', 0x00aa00, [...P_beta_curr] as V3);
    entry('P_gamma', 0x0000aa, [...P_gamma_curr] as V3);

    const movment = [...M_gamma];
    const { dot, pow } = motionCatcher.update([u, v]);
    eulerToArray(input.orientation).forEach((v, i) => cb(`or${i}`, v));
    eulerToArray(input.rotationRate).forEach((v, i) => cb(`ro${i}`, v));
    cb('u', u * 1000);
    cb('v', v * 1000);
    cb('dot', dot * 100);
    cb('pow', pow * 10000);
    cb('hoge', pow * Math.pow(Math.max(0, dot), 10) * 10000);
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

  const updateHeadMovement = (_: number) => {
    vec3.transformQuat(P_alpha_curr, C_alpha, Q_angle);
    vec3.transformQuat(P_beta_curr, C_beta, Q_angle);
    vec3.transformQuat(P_gamma_curr, C_gamma, Q_angle);
    vec3.normalize(P_alpha_curr, P_alpha_curr);
    vec3.normalize(P_beta_curr, P_beta_curr);
    vec3.normalize(P_gamma_curr, P_gamma_curr);

    if (first) {
      first = false;
    } else {
      vec3.scale(M_beta, P_beta_curr, 1 / vec3.dot(P_beta_curr, P_beta_prev));
      vec3.scale(M_gamma, P_gamma_curr, 1 / vec3.dot(P_gamma_curr, P_gamma_prev));

      vec3.sub(M_beta, M_beta, P_beta_prev);
      vec3.sub(M_gamma, M_gamma, P_gamma_prev);
    }

    const mag_beta = Math.abs(vec3.dot(P_beta_curr, C_beta));
    const mag_gamma = Math.abs(vec3.dot(P_gamma_curr, C_gamma));

    const u_beta = -vec3.dot(C_beta, M_beta);
    const u_gamma = vec3.dot(P_beta_curr, M_gamma);

    const v_beta = vec3.dot(C_alpha, M_beta);
    const v_gamma = vec3.dot(P_alpha_curr, M_gamma);

    const u = u_gamma * mag_gamma + u_beta * mag_beta;
    const v = v_beta * mag_gamma + v_gamma * mag_beta;
    entry('uv', 0xffffff, [u, v, -1]);

    // vec3.cross(tmp, P_gamma_curr, C_beta);
    // let len = vec3.length(tmp);
    // // if (len < Math.sqrt(3) / 2) {
    // //   vec3.cross(tmp, P_gamma_curr, C_beta);
    // //   len = -vec3.length(tmp);
    // // }
    // const alpha = vec3.dot(P_alpha_curr, tmp) / len;
    // const beta = len;

    // vec3.copy(P_alpha_prev, P_alpha_curr);
    vec3.copy(P_beta_prev, P_beta_curr);
    vec3.copy(P_gamma_prev, P_gamma_curr);
    return { u, v };
  };

  return deviceMotion;
};

export default createDeviceMotion;
