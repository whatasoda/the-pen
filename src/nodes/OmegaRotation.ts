import vn from 'vector-node';
import { vec3, quat } from 'gl-matrix';

interface Uniforms {
  dotThreshold: number;
}

const OmegaRotation = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3',
    },
    outputs: { output: 'f32-4' },
    events: {},
  },
  (_, { dotThreshold }: Uniforms) => {
    const prev = vec3.create();
    return ({ i: { velocityDirection }, o: { output } }) => {
      const curr = velocityDirection;
      if (dotThreshold < vec3.dot(prev, curr)) {
        quat.rotationTo(output, prev, curr);
      } else {
        quat.identity(output);
      }
      vec3.copy(prev, curr);
    };
  },
)({ dotThreshold: 0 });

export default OmegaRotation;
