import vn from 'vector-node';
import { vec3, quat } from 'gl-matrix';

interface Attributes {
  angleThreshold: number;
  speedThreshold: number;
  attenuation: number;
}

const Pitch = vn.defineNode(
  {
    inputs: {
      rotation: 'f32-4',
      velocity: 'f32-3',
    },
    outputs: {
      pitch: 'f32-3',
      power: 'f32-1',
    },
    events: {
      update: (angle: number, speed: number) => ({ angle, speed }),
      power: (power: number) => ({ power }),
    },
  },
  ({ dispatch }, _, { angleThreshold, speedThreshold, attenuation }: Attributes) => {
    const axis = vec3.create();
    let max = 0;
    return ({ i: { rotation, velocity }, o: { pitch, power } }) => {
      vec3.scale(pitch, pitch, attenuation);

      const angle = quat.getAxisAngle(axis, rotation);
      const speed = vec3.length(velocity);

      dispatch('update', angle / angleThreshold, speed / speedThreshold);
      if (angle < angleThreshold) {
        max = 0;
      } else if (angle >= max) {
        max = angle;
        if (speed >= speedThreshold) vec3.scaleAndAdd(pitch, pitch, axis, speed);
      }
      dispatch('power', (power[0] = (Math.sqrt(vec3.length(pitch) / speedThreshold) - 1) * 0.05));
    };
  },
)({});

export default Pitch;
