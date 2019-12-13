import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Props {
  axis: vec3;
  dotThreshold: number;
}

const SignedOmega = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3-moment',
      omega: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ axis, dotThreshold }: Props) => {
    const inputAxis = vec3.create();
    const prev = vec3.create();
    vec3.normalize(axis, axis);
    return ({ inputs: { velocityDirection, omega }, output }) => {
      const curr = velocityDirection.value;
      vec3.cross(inputAxis, prev, curr);
      vec3.normalize(inputAxis, inputAxis);
      vec3.copy(prev, curr);
      const dot = vec3.dot(inputAxis, axis);
      const coef = Math.sign(dot) * Number(Math.abs(dot) > dotThreshold);
      output.value[0] = coef * omega.value[0];
    };
  },
);

export default SignedOmega;
