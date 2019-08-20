import { vec3, quat } from 'gl-matrix';

const createHeadMotion = ({ head }: HeadMotionConstant) => {
  const Q = quat.create();
  const curr = vec3.create();
  const prev = vec3.create();
  const M = vec3.create();
  let first = true;

  const headMotion = ({ dt, rotation, velocity }: HeadMotionInput): StabilizerInput => {
    quat.fromEuler(Q, ...(rotation as [number, number, number]));
    vec3.transformQuat(curr, head, Q);

    if (first) {
      first = false;
      vec3.scale(M, velocity, dt);
      vec3.copy(prev, curr);
    } else {
      vec3.sub(M, curr, prev);
      vec3.scaleAndAdd(M, M, velocity, dt);
    }

    vec3.transformQuat(M, M, quat.invert(Q, Q));
    vec3.copy(prev, curr);
    return {
      dt,
      movement: [...M],
    };
  };
  return headMotion;
};

export default createHeadMotion;
