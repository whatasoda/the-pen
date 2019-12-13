import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const Ball = vn.defineNode(
  {
    inputs: {
      rotation: 'f32-4-moment',
    },
    output: 'f32-6-moment',
  },
  () => {
    const V = vec3.create();
    const H = vec3.create();
    return ({ inputs: { rotation }, output }) => {
      vec3.transformQuat(V, V, rotation.value);
      vec3.transformQuat(H, H, rotation.value);
      vec3.normalize(V, V);
      vec3.normalize(H, H);

      output.value.set(V);
      output.value.set(H, 3);
    };
  },
);

export default Ball;
