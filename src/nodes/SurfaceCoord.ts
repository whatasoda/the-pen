import vn from 'vector-node';
import { vec3, vec2 } from 'gl-matrix';
import orthogonal from '../utils/orthogonal';

interface Attributes {
  normal: vec3;
}

const SurfaceCoord = vn.defineNode(
  {
    inputs: {
      input: 'f32-3',
    },
    outputs: { output: 'f32-2' },
    events: {},
  },
  (_0, _1, { normal }: Attributes) => {
    const U = vec3.create();
    const V = vec3.create();
    vec3.normalize(V, normal); // tmporary use
    orthogonal(U, V);
    vec3.cross(V, U, V);
    return ({ i: { input }, o: { output } }) => {
      const u = vec3.dot(U, input);
      const v = vec3.dot(V, input);
      vec2.set(output, u, v);
    };
  },
)({});

export default SurfaceCoord;
