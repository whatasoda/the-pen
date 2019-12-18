import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Direction = vn.defineNode(
  {
    inputs: { input: 'f32-3' },
    outputs: { output: 'f32-3' },
    events: {},
  },
  () => {
    return ({ i: { input }, o: { output } }) => {
      vec3.normalize(output, input);
    };
  },
)({});

export default Direction;
