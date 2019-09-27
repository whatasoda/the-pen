import { quat, vec3 } from 'gl-matrix';
import { sequential } from '../utils/vector';

type CB = {
  cb: (k: string, v: number) => void;
};

const motion = ({ entry, cb }: VisualizerHandle & CB, size: number) => {
  const last = size - 1;

  const rotation = (() => {
    const tmpVec = vec3.create();
    const tmpQuat = quat.create();
    const rotSeq = sequential('quat', size);
    return (out: quat, rateEuler: V3, dt: number) => {
      vec3.scale(tmpVec, rateEuler, dt);
      quat.fromEuler(tmpQuat, tmpVec[0], tmpVec[1], tmpVec[2]);
      quat.copy(out, rotSeq.get(last));
      rotSeq.forEach((out) => {
        quat.mul(out, out, tmpQuat);
      });
      rotSeq.push(tmpQuat);
      return out;
    };
  })();

  const velocity = (() => {
    const tmp = vec3.create();
    const veloSeq = sequential('vec3', size);
    return (out: vec3, accel: V3, dt: number) => {
      vec3.scale(tmp, accel, dt);
      vec3.copy(out, veloSeq.get(last));
      veloSeq.forEach((out) => {
        vec3.add(out, out, tmp);
      });
      veloSeq.push([0, 0, 0]);
      return out;
    };
  })();

  return (() => {
    const rot = quat.create();
    const axis = vec3.create();
    const velo = vec3.create();

    return (out: vec3, accel: V3, rate: V3, dt: number) => {
      rotation(rot, rate, dt);
      velocity(velo, accel, dt);
      const angle = quat.getAxisAngle(axis, rot) / Math.PI;
      if (angle === 1) return; // skip if initial

      vec3.scaleAndAdd(velo, velo, axis, -vec3.dot(axis, velo));
      vec3.scale(velo, velo, angle);

      cb('velo', vec3.length(velo) * 100000);
      entry('velo', 0xff0000, Array.from(velo).map((v) => v * 10) as V3);
      entry('axis', 0x00ff00, Array.from(axis).map((v) => (angle < 0.01 ? 0 : v * 0.4)) as V3);

      vec3.scale(out, axis, vec3.length(velo) * 100);
      return out;
    };
  })();
};

export default motion;
