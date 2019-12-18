import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Omega = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3',
      dt: 'f32-1',
    },
    outputs: { output: 'f32-1' },
    events: {},
  },
  () => {
    const prev = vec3.create();
    return ({ i: { velocityDirection, dt }, o: { output } }) => {
      const cosTheta = vec3.dot(prev, velocityDirection);
      vec3.copy(prev, velocityDirection);

      const theta = Math.acos(cosTheta);
      output[0] = theta / dt[0];
    };
  },
)({});

export default Omega;
