import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Direction = vn.defineNode(
  {
    inputs: { input: 'f32-3-moment' },
    output: 'f32-3-moment',
  },
  () => {
    return ({ inputs: { input }, output }) => {
      vec3.normalize(output.value, input.value);
    };
  },
);

export default Direction;
