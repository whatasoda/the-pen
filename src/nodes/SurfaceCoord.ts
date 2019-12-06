import vn from 'vector-node';
import { vec3, vec2 } from 'gl-matrix';
import orthogonal from '../utils/orthogonal';

interface Props {
  normal: vec3;
}

const SurfaceCoord = vn.defineNode(
  {
    inputs: {
      input: 'f32-3-moment',
    },
    output: 'f32-2-moment',
  },
  ({ normal }: Props) => {
    const U = vec3.create();
    const V = vec3.create();
    vec3.normalize(V, normal); // tmporary use
    orthogonal(U, V);
    vec3.cross(V, U, V);
    return ({ inputs: { input }, output }) => {
      const u = vec3.dot(U, input.value);
      const v = vec3.dot(V, input.value);
      vec2.set(output.value, u, v);
    };
  },
);

export default SurfaceCoord;
