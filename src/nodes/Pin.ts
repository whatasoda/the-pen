import vn from 'vector-node';
import { vec3, vec2 } from 'gl-matrix';
import { dominanceBetweenCircles } from '../utils/math';

export interface PinAttributes {
  position: vec3;
  radius: number;
}

interface Uniforms {
  sample: number;
}

const { acos, cos, sin } = Math;
const Pin = vn.defineNode(
  {
    inputs: {
      axis: 'f32-3',
      pitch: 'f32-1',
    },
    outputs: {
      velocity: 'f32-2',
      timeline: 'f32-2',
    },
    events: {
      update: (velocity: vec2, timeline: vec2) => ({
        velocity,
        timeline,
      }),
    },
  },
  ({ dispatch }, { sample }: Uniforms, { position: P, radius: pinRadius }: PinAttributes) => {
    const prev = vec3.create();
    const R = vec3.create();
    const Q = vec3.create();

    let i = 0;
    let prevPitch = -1;
    return ({ i: { axis: curr, pitch }, o: { timeline, velocity } }) => {
      const currPitch = pitch[0];
      if (prevPitch < 0 && currPitch < 0) {
        timeline.fill(0);
        velocity.fill(0);
      } else {
        const pitchRange = currPitch - prevPitch;

        const cosRange = vec3.dot(curr, prev);
        const range = acos(cosRange);
        vec3.normalize(R, vec3.scaleAndAdd(R, curr, prev, -cosRange));

        timeline[0] = NaN;
        timeline[1] = 0;
        for (i = 0; i <= sample; i++) {
          const t = i / sample;
          const theta = range * t;
          vec3.scale(Q, prev, cos(theta));
          vec3.scaleAndAdd(Q, Q, R, sin(theta));

          const pitchRadius = pitchRange * t + prevPitch;
          if (pitchRadius < 0) continue;

          const distance = acos(vec3.dot(Q, P));
          if (pitchRadius + pinRadius < distance) continue;

          const dominance = dominanceBetweenCircles(pitchRadius, pinRadius, distance);
          if (isNaN(timeline[0])) {
            timeline[0] = t;
            velocity[0] = dominance;
          }
          if (timeline[1] < t) {
            timeline[1] = t;
            velocity[1] = dominance;
          }
        }

        if (isNaN(timeline[0])) {
          timeline[0] = 0;
          velocity.fill(0);
        }
      }
      prevPitch = currPitch;
      dispatch('update', velocity, timeline);
    };
  },
)({ sample: 16 });

export default Pin;
