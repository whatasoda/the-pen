import createKalmanFilter, { Kalman } from '../utils/kalmanFilter';
import { quat, vec3 } from 'gl-matrix';
import quatToEuler from '../utils/quatToEuler';

const createDeviceMotion = (constant: DeviceMotionConstant) => {
  const Q = quat.create();
  const G = vec3.create();
  const V = vec3.create();

  const kalman: Record<EulerKey, Kalman> = {
    alpha: createKalmanFilter(constant.kalman.alpha),
    beta: createKalmanFilter(constant.kalman.beta),
    gamma: createKalmanFilter(constant.kalman.gamma),
  };

  const calcRotation = ({
    acceleration,
    accelerationIncludingGravity,
    interval,
    rotationRate: { alpha: alphaRate, beta: betaRate, gamma: gammaRate },
  }: DeviceMotionInput) => {
    vec3.sub(
      G,
      [accelerationIncludingGravity.x || 0, accelerationIncludingGravity.y || 0, accelerationIncludingGravity.z || 0],
      [acceleration.x || 0, acceleration.y || 0, acceleration.z || 0],
    );
    vec3.normalize(G, G);

    const [alphaAngle, betaAngle, gammaAngle] = quatToEuler(G, quat.rotationTo(Q, [0, 1, 0], G));

    const alpha = kalman.alpha(alphaAngle, alphaRate || 0, interval);
    const beta = kalman.beta(betaAngle, betaRate || 0, interval);
    const gamma = kalman.gamma(gammaAngle, gammaRate || 0, interval);

    return [alpha, beta, gamma];
  };

  const deviceMotion = (input: DeviceMotionInput): HeadMotionInput => {
    const { interval: dt, acceleration } = input;
    return {
      dt,
      rotation: calcRotation(input),
      velocity: [...vec3.scaleAndAdd(V, V, [acceleration.z || 0, acceleration.x || 0, acceleration.y || 0], dt)],
    };
  };

  return deviceMotion;
};

export default createDeviceMotion;
