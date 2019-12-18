import vn from 'vector-node';
import { vec3, quat } from 'gl-matrix';

interface Props {
  dotThreshold: number;
}

const OmegaRotation = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3-moment',
    },
    output: 'f32-4-moment',
  },
  ({ dotThreshold }: Props) => {
    const prev = vec3.create();
    return ({ inputs: { velocityDirection }, output }) => {
      const curr = velocityDirection.value;
      if (dotThreshold < vec3.dot(prev, curr)) {
        quat.rotationTo(output.value, prev, curr);
      } else {
        quat.identity(output.value);
      }
      vec3.copy(prev, curr);
    };
  },
);

export default OmegaRotation;
