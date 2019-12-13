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
    return ({ inputs: { acceleration, dt }, output }) => {
      const out = output.value;
      const magnitude = vec3.length(acceleration.value);
      if (magnitude < 0.3) {
        vec3.scale(out, out, attenuationRate ** 3);
      } else {
        vec3.scale(out, out, attenuationRate);
        vec3.scaleAndAdd(out, out, acceleration.value, dt.value[0]);
      }
    };
  },
);

export default Velocity;
