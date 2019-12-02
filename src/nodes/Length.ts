import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Length = vn.defineNode(
  {
    nodeType: 'Length',
    inputs: {
      input: 'f32-3-moment',
    },
    output: 'f32-1-moment',
  },
  () => {
    return ({ inputs: { input }, output }) => {
      output.value[0] = vec3.length(input.value);
    };
  },
);

export default Length;
