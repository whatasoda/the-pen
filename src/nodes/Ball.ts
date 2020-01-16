import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const X = vec3.fromValues(1, 0, 0);
const Y = vec3.fromValues(0, 1, 0);
const Z = vec3.fromValues(0, 0, 1);

const Ball = vn.defineNode(
  {
    inputs: {
      rotation: 'f32-4',
    },
    outputs: {
      axis: 'f32-3',
      arm: 'f32-3',
      leg: 'f32-3',
    },
    events: {
      update: (axis: vec3, arm: vec3, leg: vec3) => ({ axis, arm, leg }),
    },
  },
  ({ dispatch }) => {
    const x = vec3.create();
    const y = vec3.create();
    const z = vec3.create();
    const tmpX = vec3.create();
    const tmpY = vec3.create();
    const tmpZ = vec3.create();
    const outX = vec3.fromValues(1, 0, 0);
    const outY = vec3.fromValues(0, 1, 0);
    const outZ = vec3.fromValues(0, 0, 1);
    return ({ i: { rotation }, o: { arm, axis, leg } }) => {
      vec3.transformQuat(x, X, rotation);
      vec3.transformQuat(y, Y, rotation);
      vec3.transformQuat(z, Z, rotation);

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

      vec3.copy(axis, outX);
      vec3.copy(arm, outY);
      vec3.copy(leg, outZ);
      dispatch('update', axis, arm, leg);
    };
  },
)({});

export default Ball;
