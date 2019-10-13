import { quat, vec3 } from 'gl-matrix';
import { sequential } from '../utils/vector';

type CB = {
  cb: (k: string, v: number) => void;
};

const motion = ({ entry, cb }: VisualizerHandle & CB, size: number) => {
  const rotation = (() => {
    const tmpVec = vec3.create();
    const tmpQuat = quat.create();
    const rotSeq = sequential('quat', size);
    return (out: quat, rateEuler: V3, dt: number) => {
      vec3.scale(tmpVec, rateEuler, dt);
      quat.fromEuler(tmpQuat, tmpVec[0], tmpVec[1], tmpVec[2]);
      return rotSeq.accumulate(out, tmpQuat, quat.mul);
    };
  })();

  const velocity = (() => {
    const tmp = vec3.create();
    const veloSeq = sequential('vec3', size);
    return (out: vec3, accel: V3, dt: number) => {
      vec3.scale(tmp, accel, dt);
      return veloSeq.accumulate(out, tmp, vec3.add);
    };
  })();

  return (() => {
    const rot = quat.create();
    const axis = vec3.create();
    const velo = vec3.create();

    return (out: vec3, accel: V3, rate: V3, dt: number): number => {
      rotation(rot, rate, dt);
      velocity(velo, accel, dt);
      const angle = quat.getAxisAngle(axis, rot) / Math.PI;
      if (angle === 1) return 0; // skip if initial

      vec3.scaleAndAdd(velo, velo, axis, -vec3.dot(axis, velo));
      vec3.scale(velo, velo, angle);

      cb('velo', vec3.length(velo) * 100000);
      entry('velo', 0xff0000, Array.from(velo).map((v) => v * 10) as V3);
      entry('axis', 0x00ff00, Array.from(axis).map((v) => (angle < 0.01 ? 0 : v * 0.4)) as V3);

      vec3.copy(out, axis);
      return vec3.length(velo);
    };
  })();
};

export default motion;
