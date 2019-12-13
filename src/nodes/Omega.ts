import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Omega = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3-moment',
      dt: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  () => {
    const prev = vec3.create();
    return ({ inputs: { velocityDirection, dt }, output }) => {
      const cosTheta = vec3.dot(prev, velocityDirection.value);
      vec3.copy(prev, velocityDirection.value);

      const theta = Math.acos(cosTheta);
      output.value[0] = theta / dt.value[0];
    };
  },
);

export default Omega;
