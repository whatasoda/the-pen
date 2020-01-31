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
      out: 'f32-4',
    },
    events: {},
  },
  () => {
    const axis = vec3.create();
    const tmp = quat.create();
    // let prevPitch = 1;
    return ({ i: { rotation, touchActivity, touchMovement }, o: { out } }) => {
      // const currPitch = pitch[0];
      vec3.normalize(axis, vec3.set(axis, 0, -touchMovement[1], -touchMovement[0]));
      quat.setAxisAngle(out, axis, vec2.length(touchMovement) * 0.01);
      if (!touchActivity[0]) {
        const angle = quat.getAxisAngle(axis, rotation);
        // const coef = clamp(1 - (currPitch - prevPitch) * 10, 0, 1);
        quat.setAxisAngle(tmp, axis, angle);
        quat.multiply(out, out, tmp);
      }
      // prevPitch = currPitch;
    };
  },
)({});

export default BallTraveler;
