import { quat, vec3 } from 'gl-matrix';
import sequential from '../utils/sequential';
import variance from '../utils/variance';
import { zeroPeak, sqrPositiveSubtract } from '../utils/converter';
import curvature from '../utils/curvature';
import bulge from '../utils/bulge';

type CB = {
  cb: (k: string, v: number) => void;
};

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
    const thershold = 0.75;
    const cos30 = Math.cos((45 / 180) * Math.PI);
    const axis = vec3.create();
    const seq = sequential('vec3', size * 3);
    const vari = variance(size, 1);

    const prevAxisInput = vec3.fromValues(1, 1, 1);
    const AXIS = vec3.create();

    let mag = 1;
    let prev = 0;

    return (out: vec3, rot: quat, dt: number) => {
      const rawAngle = quat.getAxisAngle(axis, rot) / Math.PI;
      const angle = rawAngle / dt / size;

      const forDiff = angle ** Math.E;
      const diff = sqrPositiveSubtract(forDiff, prev);
      const a = vari(diff);
      prev = forDiff;

      const peak = zeroPeak(angle * Math.E);
      if (peak < thershold) {
        mag = 1;
        const cos = vec3.dot(AXIS, axis);
        const coef = angle ** 2;
        if (Math.abs(cos) > cos30) {
          vec3.scale(axis, prevAxisInput, coef);
        } else {
          vec3.scale(axis, axis, cos < 0 ? -coef : coef);
          vec3.copy(prevAxisInput, axis);
        }
      } else {
        mag *= 0.9;
        vec3.scale(axis, prevAxisInput, mag);
      }

      seq.accumulate(AXIS, axis, vec3.add);
      vec3.normalize(AXIS, AXIS);
      vec3.copy(out, AXIS);
      return [angle, a];
    };
  })();

  const handleAcceleration = (() => {
    const vari = variance(size, 1);
    return (accel: vec3 | V3) => {
      const mag = vec3.length(accel);
      const m = vari(mag) ** Math.SQRT1_2;
      return [m, mag];
    };
  })();

  const handleVelocity = (() => {
    const speedActivityTheshold = 0.85;
    const curv = curvature(size);
    return (velo: vec3, dt: number) => {
      const speed = vec3.length(velo);
      const isActive = zeroPeak(speed / 10) < speedActivityTheshold;

      const cRaw = curv(velo, dt);
      const c = isActive ? cRaw : 1;

      return [c, Number(isActive), speed];
    };
  })();

  const handleMovement = (() => {
    const variHigh = variance(size, 6);
    const variLow = variance(size, 0.1);
    const bul = bulge(size);
    let prevHigh = 0;
    let prevLow = 0;
    return (out: vec3, mvmt: vec3) => {
      const power = vec3.length(mvmt);
      vec3.scale(out, mvmt, 1 / power);

      const currHigh = power;
      const currLow = power ** (2 * Math.E);
      const diffHigh = sqrPositiveSubtract(currHigh, prevHigh, 0);
      const diffLow = sqrPositiveSubtract(currLow, prevLow, 16);
      prevHigh = currHigh;
      prevLow = currLow;
      const ph = variHigh(diffHigh);
      const pl = variLow(diffLow);
      const b = bul(mvmt, 0.2);
      return [ph, pl, b, power];
    };
  })();

  return (() => {
    const rot = quat.create();
    const axis = vec3.create();
    const velo = vec3.create();
    const mvmt = vec3.create();
    const direction = vec3.create();

    // const initial: MotionPayload = {
    //   angle: 0,
    //   power: 0,
    //   attack: 0,
    //   liner: 0,
    //   curve: 0,
    // };
    // let isFirst = true;
    return (out: MotionOutput, accel: V3, rate: V3, dt: number): MotionPayload => {
      rotation(rot, rate, dt);
      velocity(velo, accel, dt * 10);
      movement(mvmt, velo, dt * 10);

      // if (isFirst) {
      //   isFirst = false;
      //   return { ...initial };
      // }

      const [angle, a] = handleRotation(axis, rot, dt);
      const [m, mag] = handleAcceleration(accel);
      const [c, s, speed] = handleVelocity(velo, dt);
      const [ph, pl, b, power] = handleMovement(direction, mvmt);

      const attack = 2 * (Math.max(1 - a * ph, 0.5) - 0.5);
      const scrapeBase = a * m * s * 2 * (Math.max(c, 0.5) - 0.5) * (1 - attack);
      const liner = b > 0.75 ? scrapeBase * (1 - pl) : 0;
      const curve = b < 0.75 ? scrapeBase * (1 - b) : 0;

      cb('angle', angle * 20);
      cb('mag', mag * 10);
      cb('speed', speed);
      cb('power', power * 30);
      cb('a', (1 - a) * width);
      cb('ph', (1 - ph) * width);
      cb('pl', (1 - pl) * width);
      cb('b', (1 - b) * width);
      cb('m', m * width);
      cb('c', c * width);
      cb('scrapeBase', scrapeBase * width);
      cb('attack', attack * width);
      cb('liner', liner * width);
      cb('curve', curve * width);
      entry('mvmt', 0xff0000, Array.from(mvmt) as V3);
      entry('axis', 0x00ff00, Array.from(axis) as V3);

      vec3.copy(out.direction, direction);
      vec3.copy(out.axis, axis);
      return { angle, power, attack, liner, curve };
    };
  })();
};

export default motion;
