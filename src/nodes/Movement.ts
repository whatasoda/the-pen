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
    return ({ inputs: { velocity, dt }, output }) => {
      const out = output.value;
      if (vec3.length(velocity.value) < 0.1) {
        vec3.set(out, 0, 0, 0);
      } else {
        vec3.scaleAndAdd(out, out, velocity.value, dt.value[0]);
      }
    };
  },
);

export default Movement;
