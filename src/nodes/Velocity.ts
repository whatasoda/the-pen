import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Props {
  attenuationRate: number;
}

const Velocity = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3-moment',
      dt: 'f32-1-moment',
    },
    output: 'f32-3-moment',
  },
  ({ attenuationRate }: Props) => {
    return ({ inputs, output }) => {
      const out = output.value;
      vec3.scale(out, out, attenuationRate);
      vec3.scaleAndAdd(out, out, inputs.acceleration.value, inputs.dt.value[0]);
    };
  },
);

export default Velocity;
