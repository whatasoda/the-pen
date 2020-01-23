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
      speed: (speed: number) => ({ speed }),
    },
  },
  ({ dispatch }, _, { angleThreshold, speedThreshold, attenuationRate }: Attributes) => {
    const axis = vec3.create();
    let max = 0;
    return ({ i: { rotation, velocity }, o: { pitch } }) => {
      vec3.scale(pitch, pitch, attenuationRate);

      const angle = quat.getAxisAngle(axis, rotation);
      const speed = vec3.length(velocity);

      dispatch('update', angle / angleThreshold, speed / speedThreshold);
      if (angle < angleThreshold) {
        max = 0;
      } else if (angle >= max) {
        max = angle;
        if (speed >= speedThreshold) vec3.scaleAndAdd(pitch, pitch, axis, speed);
      }
      dispatch('speed', vec3.length(pitch) / speedThreshold);
    };
  },
)({});

export default Pitch;
