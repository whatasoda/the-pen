import vn from 'vector-node';
import { quat, vec3, vec2 } from 'gl-matrix';

// interface Uniforms {
//   dotThreshold: number;
//   radiusThreshold: number;
// }

const BallTraveler = vn.defineNode(
  {
    inputs: {
      rotation: 'f32-4',
      pitch: 'f32-3',
      touchMovement: 'f32-2',
      touchActivity: 'u8-1',
    },
    outputs: {
      out: 'f32-4',
    },
    events: {},
  },
  () => {
    const axis = vec3.create();
    const mvmtRotation = quat.create();
    const touchAxis = vec3.create();
    return ({ i: { rotation, pitch, touchActivity, touchMovement }, o: { out } }) => {
      if (touchActivity[0]) {
        vec3.normalize(touchAxis, vec3.set(touchAxis, 0, -touchMovement[1], -touchMovement[0]));
        quat.setAxisAngle(out, touchAxis, vec2.length(touchMovement) * 0.01);
      } else {
        const radien = Math.min(vec3.length(pitch), 5);
        vec3.normalize(axis, pitch);
        quat.setAxisAngle(mvmtRotation, axis, radien * 0.15);
        quat.multiply(out, rotation, mvmtRotation);
      }
    };
  },
)({});

export default BallTraveler;
