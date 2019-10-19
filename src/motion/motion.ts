import { quat, vec3, vec2 } from 'gl-matrix';
import sequential from '../utils/sequential';
import sequentialVariance from '../utils/sequentialVariance';
import { zeroPeak } from '../utils/converter';
import LeastSquares from '../utils/leastSquares';

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

  const axisBuffer = (() => {
    const seq = sequential('vec3', size);
    const seq2 = sequential('vec3', size);
    const prev = vec3.create();
    const tmp = vec3.create();
    const tmp2 = vec3.create();
    prev[0] = 1;
    return (out: vec3, axis: vec3) => {
      const sign = vec3.dot(prev, axis) < 0 ? -1 : 1;
      vec3.scale(tmp, axis, sign);
      vec3.copy(prev, tmp);
      seq.accumulate(tmp2, tmp, vec3.add);
      seq2.accumulate(out, tmp2, vec3.add);
      vec3.normalize(out, out);
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

  const scrapingThreshold = 0.5;
  const attackingThreshold = 1;
  const checkActionType = (() => {
    const variance = sequentialVariance(size, 8);
    const seq = sequential('vec2', size);
    const tmp = vec2.create();
    let isScraping = false;
    let isAttacking = false;
    return (power: number, active: Activity) => {
      const v = variance(power);
      isScraping = active.accel && v > 0.8 && power > scrapingThreshold;

      if (isAttacking) {
        isAttacking = power > attackingThreshold;
      } else {
        isAttacking = active.accel && v < 0.4 && power > attackingThreshold;
      }
      seq.accumulate(tmp, [Number(isScraping), Number(isAttacking)], vec2.add);
      const scraping = (tmp[0] / size) * 10;
      const attacking = (tmp[1] / size) * 10;
      return { v, scraping, attacking };
    };
  })();

  return (() => {
    const rot = quat.create();
    const axis = vec3.create();
    const velo = vec3.create();
    const mvmt = vec3.create();
    const direction = vec3.create();
    const speedVariance = sequentialVariance(size, 1);
    const LS = LeastSquares(size);

    const initial: MotionPayload = { power: 0, isAttacking: false, isScraping: false };
    return (out: vec3, accel: V3, rate: V3, dt: number): MotionPayload => {
      rotation(rot, rate, dt);
      const angle = quat.getAxisAngle(axis, rot) / Math.PI;
      axisBuffer(axis, axis);

      velocity(velo, accel, dt * 10);
      movement(mvmt, velo, dt * 10);
      if (angle === 1) return { ...initial }; // skip if initial

      const active = activity(accel, velo);
      const ls = LS.calculate(mvmt, 0.005);

      const power = vec3.length(mvmt);
      const speed = vec3.length(velo);
      vec3.normalize(direction, mvmt);
      const { v, attacking, scraping } = checkActionType(power, active);

      cb('scrapingThreshold', scrapingThreshold * 100);
      cb('power', power * 100);
      cb('attackingThreshold', attackingThreshold * 100);
      cb('speed', speed);
      cb('active.accel', Number(active.accel) * 100);
      cb('active.velo', Number(active.velo) * 100);
      cb('isAttacking', attacking * 100);
      cb('isScraping', scraping * 100);
      cb('varSpeed', speedVariance(speed * Math.SQRT2) * width);
      cb('ls', ls * width);
      cb('v', v * width);
      entry('velo', 0xff0000, Array.from(direction).map((v) => v * power) as V3);
      entry('axis', 0x00ff00, Array.from(axis).map((v) => v) as V3);

      // entry('mvmt', 0xffff00, Array.from(mvmt) as V3);

      vec3.copy(out, direction);
      return { power, isAttacking: attacking > 0.5, isScraping: scraping > 0.5 };
    };
  })();
};

export default motion;
