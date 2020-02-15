import vn from 'vector-node';
import { vec3, mat3, quat } from 'gl-matrix';

const Coord = vn.defineNode(
  {
    inputs: {
      rotation: 'f32-4',
    },
    outputs: {
      coord: 'f32-9',
    },
    events: {},
  },
  () => {
    const localRotation = quat.create();
    const rotationMatrix = mat3.create();
    let initial = true;
    return ({ i: { rotation }, o: { coord } }) => {
      if (initial) {
        mat3.identity(coord);
        initial = false;
      }
      const angle = quat.getAxisAngle(localRotation, rotation);
      vec3.transformMat3(localRotation, localRotation, coord);
      quat.setAxisAngle(localRotation, localRotation, angle);

      mat3.fromQuat(rotationMatrix, rotation);
      mat3.multiply(coord, coord, rotationMatrix);
    };
  },
)({});

export default Coord;
