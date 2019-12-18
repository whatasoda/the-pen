import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Uniforms {
  dotThreshold: number;
}

interface Attributes {
  axis: vec3;
}

const SignedOmega = vn.defineNode(
  {
    inputs: {
      velocityDirection: 'f32-3',
      omega: 'f32-1',
    },
    outputs: { output: 'f32-1' },
    events: {},
  },
  (_, { dotThreshold }: Uniforms, { axis }: Attributes) => {
    const inputAxis = vec3.create();
    const prev = vec3.create();
    vec3.normalize(axis, axis);
    return ({ i: { velocityDirection, omega }, o: { output } }) => {
      const curr = velocityDirection;
      vec3.cross(inputAxis, prev, curr);
      vec3.normalize(inputAxis, inputAxis);
      vec3.copy(prev, curr);
      const dot = vec3.dot(inputAxis, axis);
      const coef = Math.sign(dot) * Number(Math.abs(dot) > dotThreshold);
      output[0] = coef * omega[0];
    };
  },
)({ dotThreshold: 0.6 });

export default SignedOmega;
