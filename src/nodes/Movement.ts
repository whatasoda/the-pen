import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Movement = vn.defineNode(
  {
    inputs: {
      velocity: 'f32-3-moment',
      dt: 'f32-1-moment',
    },
    output: 'f32-3-moment',
  },
  () => {
    const prev = vec3.create();
    const tmp = vec3.create();
    return ({ inputs: { velocity, dt }, output }) => {
      const out = output.value;
      const curr = velocity.value;
      if (vec3.length(curr) < 0.1) {
        vec3.set(out, 0, 0, 0);
      } else {
        vec3.add(tmp, prev, curr);
        vec3.scaleAndAdd(out, out, tmp, dt.value[0] * 0.5);
      }
    };
  },
);

export default Movement;
