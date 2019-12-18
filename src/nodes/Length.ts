import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Length = vn.defineNode(
  {
    inputs: {
      input: 'f32-3',
    },
    outputs: { output: 'f32-1' },
    events: {},
  },
  () => {
    return ({ i: { input }, o: { output } }) => {
      output[0] = vec3.length(input);
    };
  },
)({});

export default Length;
