import vn from 'vector-node';
import { vec3, quat } from 'gl-matrix';

interface Attributes {
  angleThreshold: number;
  speedThreshold: number;
  attenuationRate: number;
}

const Pitch = vn.defineNode(
  {
    inputs: {
      rotation: 'f32-4',
      velocity: 'f32-3',
    },
    outputs: {
      pitch: 'f32-3',
    },
    events: {
      update: (angle: number, speed: number) => ({ angle, speed }),
    },
  },
  ({ dispatch }, _, { angleThreshold, speedThreshold, attenuationRate }: Attributes) => {
    const axis = vec3.create();
    let max = 0;
    return ({ i: { rotation, velocity }, o: { pitch } }) => {
      vec3.scale(pitch, pitch, attenuationRate);

      const angle = quat.getAxisAngle(axis, rotation);
      const speed = vec3.length(velocity);

      if (angle < angleThreshold) {
        max = 0;
        return;
      } else if (angle < max) {
        return;
      }
      max = angle;
      dispatch('update', angle / angleThreshold, speed / speedThreshold);

      if (speed < speedThreshold) return;
      vec3.scaleAndAdd(pitch, pitch, axis, speed);
    };
  },
)({});

export default Pitch;
