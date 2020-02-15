import vn from 'vector-node';
import { mat3, quat, vec3 } from 'gl-matrix';

const localRotation = quat.create();
const rotationMatrix = mat3.create();
const applyQuatToCoord = (coord: mat3, rotation: quat) => {
  const angle = quat.getAxisAngle(localRotation, rotation);
  vec3.transformMat3(localRotation, localRotation, coord);
  quat.setAxisAngle(localRotation, localRotation, angle);

  mat3.fromQuat(rotationMatrix, rotation);
  mat3.multiply(coord, coord, rotationMatrix);
};

const CCC = vn.defineNode(
  {
    inputs: {
      tilt: 'f32-4',
      swipe: 'f32-4',
    },
    outputs: {
      tilt: 'f32-9',
      swipe: 'f32-9',
      coord: 'f32-9',
    },
    events: {},
  },
  () => {
    const localTilt = quat.create();
    let initial = true;
    return ({ i: { swipe, tilt }, o: { coord, tilt: tiltCoord, swipe: swipeCoord } }) => {
      if (initial) {
        mat3.identity(swipeCoord);
        mat3.identity(tiltCoord);
        mat3.identity(coord);
        initial = false;
      }
      vec3.transformMat3(localTilt, tilt, swipeCoord);
      localTilt[3] = tilt[3];
      applyQuatToCoord(tiltCoord, localTilt);
      applyQuatToCoord(swipeCoord, swipe);

      mat3.multiply(coord, tiltCoord, swipeCoord);
    };
  },
)({});

export default CCC;
