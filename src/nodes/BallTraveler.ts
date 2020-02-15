import vn from 'vector-node';
import { quat, vec3, vec2 } from 'gl-matrix';

const BallTraveler = vn.defineNode(
  {
    inputs: {
      rotation: 'f32-4',
      touchMovement: 'f32-2',
      touchActivity: 'u8-1',
      pitch: 'f32-1',
    },
    outputs: {
      tilt: 'f32-4',
      swipe: 'f32-4',
    },
    events: {},
  },
  () => {
    const axis = vec3.create();
    return ({ i: { rotation, touchActivity, touchMovement }, o: { tilt, swipe } }) => {
      vec3.normalize(axis, vec3.set(axis, 0, -touchMovement[1], -touchMovement[0]));
      quat.setAxisAngle(swipe, axis, vec2.length(touchMovement) * 0.01);

      if (touchActivity[0]) {
        // quat.identity(tilt);
        // } else {
      }
      const angle = quat.getAxisAngle(axis, rotation);
      quat.setAxisAngle(tilt, axis, angle);
    };
  },
)({});

export default BallTraveler;
