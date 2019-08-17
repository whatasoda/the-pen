import createKalmanFilter, { Kalman } from '../utils/kalmanFilter';
import { quat, vec3 } from 'gl-matrix';
import quatToEuler from '../utils/quatToEuler';

type DeviceMotionState = {
  acceleration: vec3;
  velocity: vec3;
  kalman: Record<'alpha' | 'beta' | 'gamma', Kalman>;
};

const Q = quat.create();
const V = vec3.create();

const deviceMotion = (state: DeviceMotionState, input: DeviceMotionInput): DeviceMotionOutput => {
  const [[alphaAngle, alphaRate], [betaAngle, betaRate], [gammaAngle, gammaRate]] = calculateRotation(state, input);

  const dt = input.interval;
  const rotationRate = [alphaRate, betaRate, gammaRate];
  const rotation = [alphaAngle, betaAngle, gammaAngle];
  const acceleration = [input.acceleration.z || 0, input.acceleration.x || 0, input.acceleration.y || 0];
  const velocity = [...vec3.scaleAndAdd(state.velocity, state.velocity, acceleration, dt)];
  const jerk = [...vec3.sub(V, acceleration, state.acceleration)];
  state.acceleration.set(acceleration);

  return { dt, rotationRate, rotation, acceleration, velocity, jerk };
};

const calculateRotation = (
  { kalman }: DeviceMotionState,
  {
    interval,
    acceleration,
    accelerationIncludingGravity,
    rotationRate: { alpha: alphaRate, beta: betaRate, gamma: gammaRate },
  }: DeviceMotionInput,
) => {
  vec3.sub(
    V,
    [accelerationIncludingGravity.x || 0, accelerationIncludingGravity.y || 0, accelerationIncludingGravity.z || 0],
    [acceleration.x || 0, acceleration.y || 0, acceleration.z || 0],
  );
  vec3.normalize(V, V);

  const [alphaAngle, betaAngle, gammaAngle] = quatToEuler(V, quat.rotationTo(Q, [0, 1, 0], V));

  const alpha = kalman.alpha(alphaAngle, alphaRate || 0, interval);
  const beta = kalman.beta(betaAngle, betaRate || 0, interval);
  const gamma = kalman.gamma(gammaAngle, gammaRate || 0, interval);

  return [alpha, beta, gamma];
};

deviceMotion.createState = (): DeviceMotionState => ({
  acceleration: vec3.create(),
  velocity: vec3.create(),
  kalman: {
    alpha: createKalmanFilter({ QAngle: 0.03, QBias: 0.003, RMeasure: 0.001 }),
    beta: createKalmanFilter({ QAngle: 0.03, QBias: 0.003, RMeasure: 0.001 }),
    gamma: createKalmanFilter({ QAngle: 0.03, QBias: 0.003, RMeasure: 0.001 }),
  },
});

export default deviceMotion;
