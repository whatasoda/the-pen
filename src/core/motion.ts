import { quat, vec3, vec2 } from 'gl-matrix';
import sequential, { add } from '../utils/sequential';
import sequentialVariance from '../utils/sequentialVariance';
import { zeroPeak } from '../utils/converter';
import LeastSquares from '../utils/leastSquares';
import curvature from '../utils/curvature';

type CB = {
  cb: (k: string, v: number) => void;
};

interface Activity {
  velo: boolean;
  accel: boolean;
}

const width = window.innerWidth;

const motion = ({ entry, cb }: VisualizerHandle & CB, size: number) => {
  const rotation = (() => {
    const tmpVec = vec3.create();
    const tmpQuat = quat.create();
    const seq = sequential('quat', size);
    return (out: quat, rateEuler: V3, dt: number) => {
      vec3.scale(tmpVec, rateEuler, dt);
      quat.fromEuler(tmpQuat, tmpVec[0], tmpVec[1], tmpVec[2]);
      return seq.accumulate(out, tmpQuat, quat.mul);
    };
  })();

  const velocity = (() => {
    const velo = vec3.create();
    return (out: vec3, accel: V3, dt: number) => {
      vec3.scale(velo, velo, 0.98);
      vec3.scaleAndAdd(velo, velo, accel, dt);
      vec3.copy(out, velo);
    };
  })();

  const movement = (() => {
    const tmp = vec3.create();
    const seq = sequential('vec3', size);
    return (out: vec3, velo: vec3, dt: number) => {
      vec3.scale(tmp, velo, dt);
      seq.accumulate(out, tmp, vec3.add);
      vec3.scale(out, out, 1 / size);
    };
  })();

  const handleRotation = (() => {
    const axis = vec3.create();
    const seq = {
      angle: sequential('free', size),
      axis: sequential('vec3', size),
    };

    const RATE = new Float32Array(1);
    const thershold = 0.75;

    const prevAxisInput = vec3.create();
    vec3.set(prevAxisInput, 1, 1, 1);
    const AXIS = vec3.create();

    const cos30 = Math.cos((30 / 180) * Math.PI);
    let mag = 1;

    return (out: vec3, rot: quat, dt: number) => {
      const rawAngle = quat.getAxisAngle(axis, rot) / Math.PI;
      const angle = rawAngle / dt;
      seq.angle.accumulate(RATE, [angle], add);

      const peak = zeroPeak(RATE[0] * 0.5);
      if (peak < thershold) {
        mag = 1;
        const diff = vec3.dot(prevAxisInput, axis);
        const coef = angle ** 2;
        cb('fafsafsa', Math.abs(diff) * width);
        if (Math.abs(diff) > cos30) {
          vec3.scale(AXIS, prevAxisInput, coef);
        } else {
          vec3.scale(AXIS, axis, diff < 0 ? -coef : coef);
          vec3.copy(prevAxisInput, axis);
        }
      } else {
        mag *= 0.9;
        vec3.scale(AXIS, prevAxisInput, mag);
      }

      seq.axis.accumulate(out, AXIS, vec3.add);
      vec3.normalize(out, out);
      return angle;
    };
  })();

  const handleVelocity = (() => {
    const variance = sequentialVariance(size, 1);
    const curv = curvature(size);
    return (velo: vec3, dt: number) => {
      const speed = vec3.length(velo);
      // TODO: ここつめる
      const s = variance(speed * Math.SQRT2);
      const c = curv(velo, dt);

      return [s, c];
    };
  })();

  const handleMovement = (() => {
    const variance = sequentialVariance(size, 8);
    const { calculate: wave } = LeastSquares(size);
    let prev = 0;
    return (out: vec3, mvmt: vec3) => {
      const power = vec3.length(mvmt);
      vec3.scale(out, mvmt, 1 / power);

      const diff = (Math.max(0, power - prev) * 10) ** 2;
      const p = variance(diff);
      const w = wave(mvmt, 0.005);
      prev = power;
      return [p, w];
    };
  })();

  const activity = (() => {
    const seq = sequential('vec2', size);
    const tmp = vec2.create();
    return (accel: V3, velo: vec3): Activity => {
      seq.accumulate(tmp, [vec3.length(accel), vec3.length(velo)], vec2.add);
      cb('active.acc', tmp[0]);
      cb('active.vel', tmp[1]);
      return {
        accel: zeroPeak(tmp[0] / size) < 0.75,
        velo: zeroPeak(tmp[1] / size) < 0.9,
      };
    };
  })();

  return (() => {
    const rot = quat.create();
    const axis = vec3.create();
    const velo = vec3.create();
    const mvmt = vec3.create();
    const direction = vec3.create();

    const initial: MotionPayload = { power: 0, isAttacking: false, isScraping: false };
    let isFirst = true;
    return (out: vec3, accel: V3, rate: V3, dt: number): MotionPayload => {
      rotation(rot, rate, dt);
      velocity(velo, accel, dt * 10);
      movement(mvmt, velo, dt * 10);

      if (isFirst) {
        isFirst = false;
        return { ...initial };
      }

      const active = activity(accel, velo);
      const angle = handleRotation(axis, rot, dt);
      const [s, c] = handleVelocity(velo, dt);
      const [p, w] = handleMovement(direction, mvmt);

      const power = vec3.length(mvmt);
      const speed = vec3.length(velo);

      cb('s', s * width);
      cb('c', c * width);
      cb('p', p * width);
      cb('w', w * width);
      cb('angle', angle * 30);
      cb('power', power * 100);
      cb('speed', speed);
      cb('active.accel', Number(active.accel) * 100);
      cb('active.velo', Number(active.velo) * 100);
      entry('mvmt', 0xff0000, Array.from(mvmt) as V3);
      entry('axis', 0x00ff00, Array.from(axis) as V3);

      vec3.copy(out, direction);
      return { power, isAttacking: false, isScraping: false };
    };
  })();
};

export default motion;
