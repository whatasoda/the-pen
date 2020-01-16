import vn from 'vector-node';
import { vec3, quat } from 'gl-matrix';

interface Uniforms {
  dotThreshold: number;
  minRadius: number;
}

interface Attributes {
  k: number;
}

const OmegaRotation = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3',
      dt: 'f32-1',
    },
    outputs: { output: 'f32-4' },
    events: {},
  },
  (_, { minRadius }: Uniforms, { k }: Attributes) => {
    let speed = 0;
    const prev = vec3.create();
    return ({ i: { velocityDirection, dt }, o: { output } }) => {
      const curr = velocityDirection;
      const radius = vec3.length(prev) / (Math.acos(vec3.dot(prev, curr)) / dt[0]);
      speed *= k;
      if (minRadius < radius) {
        quat.rotationTo(output, prev, curr);
        speed = (speed * 3 + Math.max(speed, Math.acos(output[3]) * 0.3)) * 0.25;
        // vec3.scale(output, output, -1);
      }
      if (speed > 0.001) {
        const w = Math.cos(speed);
        output[3] = w;
        vec3.scale(output, output, (1 - w ** 2) ** 0.5 / vec3.length(output));
      } else {
        quat.identity(output);
      }
      vec3.copy(prev, curr);
    };
  },
)({ dotThreshold: 0, minRadius: 0.02 });

export default OmegaRotation;
