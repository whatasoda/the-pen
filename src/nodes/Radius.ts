import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Props {
  maxSpeed: number;
  minSpeed: number;
  maxRadius: number;
  minRadius: number;
}

// let i = 0;

const Radius = vn.defineNode(
  {
    inputs: {
      velocity: 'f32-3-moment',
      dt: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ minSpeed, maxSpeed, minRadius, maxRadius }: Props) => {
    const prev = vec3.create();
    const curr = vec3.create();
    return ({ inputs: { velocity, dt }, output }) => {
      output.value[0] = 0; // reset output
      vec3.normalize(curr, velocity.value);
      const cosTheta = vec3.dot(prev, curr);
      vec3.copy(prev, curr);

      const speed = vec3.length(velocity.value);
      if (speed < minSpeed || maxSpeed < speed) return;

      const theta = Math.acos(cosTheta);
      const omega = theta / dt.value[0];
      const radius = speed / omega;
      if (radius < minRadius || maxRadius < radius) return;
      output.value[0] = radius;
    };
  },
);

export default Radius;
