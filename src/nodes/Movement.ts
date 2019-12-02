import vn from 'vector-node';
import sequential from '../utils/sequential';
import { vec3 } from 'gl-matrix';

interface Props {
  sequenceLength: number;
}

const Movement = vn.defineNode(
  {
    nodeType: 'Movement',
    inputs: {
      velocity: 'f32-3-moment',
      dt: 'f32-1-moment',
    },
    output: 'f32-3-moment',
  },
  ({ sequenceLength }: Props) => {
    const seq = sequential(3, sequenceLength);
    const tmp = vec3.create();
    const coef = 1 / sequenceLength;
    return ({ inputs: { velocity, dt }, output }) => {
      const out = output.value;
      vec3.scale(tmp, velocity.value, dt.value[0]);
      seq.accumulate(out, tmp, vec3.add);
      vec3.scale(out, out, coef);
    };
  },
);

export default Movement;
