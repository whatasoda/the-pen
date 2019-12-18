import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const X = vec3.fromValues(1, 0, 0);
const Y = vec3.fromValues(0, 1, 0);
const Z = vec3.fromValues(0, 0, 1);

const Ball = vn.defineNode(
  {
    inputs: {
      magnitude: 'f32-1-moment',
      rotation: 'f32-4-moment',
    },
    output: 'f32-6-moment',
  },
  () => {
    const x = vec3.create();
    const y = vec3.create();
    const z = vec3.create();
    const tmpX = vec3.create();
    const tmpY = vec3.create();
    const tmpZ = vec3.create();
    const outX = vec3.fromValues(1, 0, 0);
    const outY = vec3.fromValues(0, 1, 0);
    const outZ = vec3.fromValues(0, 0, 1);
    return ({ inputs: { rotation, magnitude }, output }) => {
      if (magnitude.value[0] < 0.7) return;
      vec3.transformQuat(x, X, rotation.value);
      vec3.transformQuat(y, Y, rotation.value);
      vec3.transformQuat(z, Z, rotation.value);

      vec3.scale(tmpX, outX, x[0]);
      vec3.scaleAndAdd(tmpX, tmpX, outY, x[1]);
      vec3.scaleAndAdd(tmpX, tmpX, outZ, x[2]);

      vec3.scale(tmpY, outX, y[0]);
      vec3.scaleAndAdd(tmpY, tmpY, outY, y[1]);
      vec3.scaleAndAdd(tmpY, tmpY, outZ, y[2]);

      vec3.scale(tmpZ, outX, z[0]);
      vec3.scaleAndAdd(tmpZ, tmpZ, outY, z[1]);
      vec3.scaleAndAdd(tmpZ, tmpZ, outZ, z[2]);

      vec3.normalize(outX, tmpX);
      vec3.normalize(outY, tmpY);
      vec3.normalize(outZ, tmpZ);

      output.value.set(outX);
      output.value.set(outY, 3);
    };
  },
);

export default Ball;
