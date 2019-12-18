import vn from 'vector-node';
import { quat } from 'gl-matrix';
import { vec3 } from 'gl-matrix';

const AbsoluteAcceleration = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3',
      orientation: 'f32-3',
    },
    outputs: { output: 'f32-3' },
    events: {},
  },
  () => {
    const tmp = quat.create();
    return ({ i: { acceleration, orientation }, o: { output } }) => {
      const [alpha, beta, gamma] = orientation;
      const [x, y, z] = acceleration;
      quat.fromEuler(tmp, -gamma, -beta, -alpha);
      vec3.transformQuat(output, [z, y, x], tmp);
      output.reverse();
    };
  },
)({});

export default AbsoluteAcceleration;
