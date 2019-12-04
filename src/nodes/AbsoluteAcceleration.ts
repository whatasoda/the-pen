import vn from 'vector-node';
import { quat } from 'gl-matrix';
import { vec3 } from 'gl-matrix';

const AbsoluteAcceleration = vn.defineNode(
  {
    nodeType: 'GlobalAcceleration',
    inputs: {
      acceleration: 'f32-3-moment',
      orientation: 'f32-3-moment',
    },
    output: 'f32-3-moment',
  },
  () => {
    const tmp = quat.create();
    return ({ inputs: { acceleration, orientation }, output }) => {
      const [alpha, beta, gamma] = orientation.value;
      const [x, y, z] = acceleration.value;
      quat.fromEuler(tmp, -gamma, -beta, -alpha);
      vec3.transformQuat(output.value, [z, y, x], tmp);
      output.value.reverse();
    };
  },
);

export default AbsoluteAcceleration;
