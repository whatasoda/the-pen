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
      hostSwipe: 'f32-9',
      coord: 'f32-9',
    },
    events: {},
  },
  () => {
    const tiltOnSwipe = quat.create();
    const swipeOnTilt = quat.create();
    let initial = true;
    return ({ i: { swipe, tilt }, o: { coord, tilt: tiltCoord, hostSwipe: hostSwipeCoord, swipe: swipeCoord } }) => {
      if (initial) {
        mat3.identity(swipeCoord);
        mat3.identity(tiltCoord);
        mat3.identity(coord);
        initial = false;
      }
      vec3.transformMat3(swipeOnTilt, swipe, coord);
      vec3.transformMat3(tiltOnSwipe, tilt, swipeCoord);

      tiltOnSwipe[3] = tilt[3];
      applyQuatToCoord(tiltCoord, tiltOnSwipe);
      applyQuatToCoord(swipeCoord, swipe);
      applyQuatToCoord(hostSwipeCoord, swipeOnTilt);
      mat3.multiply(coord, tiltCoord, swipeCoord);
    };
  },
)({});

export default CCC;
