import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Props {
  maxRadius: number;
  minRadius: number;
}

// let i = 0;

const Radius = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3-moment',
      velocityDirection: 'f32-3-moment',
      omega: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ minRadius, maxRadius }: Props) => {
    return ({ inputs: { acceleration, velocityDirection, omega }, output }) => {
      output.value[0] = 0; // reset output
      const magnitude = vec3.length(acceleration.value);
      const a_r = Math.sqrt(magnitude ** 2 - vec3.dot(velocityDirection.value, acceleration.value) ** 2);

      const radius = a_r / omega.value[0] ** 2;
      if (radius < minRadius || maxRadius < radius) return;
      output.value[0] = radius;
    };
  },
);

export default Radius;
