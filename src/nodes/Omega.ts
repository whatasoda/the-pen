import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Omega = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3',
      dt: 'f32-1',
    },
    outputs: {
      theta: 'f32-1',
      radius: 'f32-1',
      axis: 'f32-3',
    },
    events: {},
  },
  () => {
    const prev = vec3.create();
    return ({ i: { velocityDirection: curr, dt }, o: { axis, radius } }) => {
      const theta = Math.acos(vec3.dot(prev, curr));
      vec3.cross(axis, prev, curr);
      vec3.copy(prev, curr);

      vec3.normalize(axis, axis);
      radius[0] = vec3.length(prev) / (theta / dt[0]);
    };
  },
)({});

export default Omega;
