import vn from 'vector-node';
import sequential from '../utils/sequential';
import { vec3, quat } from 'gl-matrix';

interface Props {
  sequenceSize: number;
}

const Rotation = vn.defineNode(
  {
    nodeType: 'Rotation',
    inputs: {
      rateEuler: 'f32-3-moment',
      dt: 'f32-1-moment',
    },
    output: 'f32-4-moment',
  },
  ({ sequenceSize }: Props) => {
    const euler = vec3.create();
    const tmp = quat.create();
    const seq = sequential(4, sequenceSize);
    return ({ inputs, output }) => {
      const [dt] = inputs.dt.value;
      vec3.scale(euler, inputs.rateEuler.value, dt);
      quat.fromEuler(tmp, euler[0], euler[1], euler[2]);
      seq.accumulate(output.value, tmp, quat.mul);
    };
  },
);

export default Rotation;
