import vn from 'vector-node';
import { vec2 } from 'gl-matrix';

interface Uniforms {
  speed: number;
  threshold: number;
  maxLength: number;
}

const Touch = vn.defineNode(
  {
    inputs: {
      movement: 'f32-2',
    },
    outputs: {
      movement: 'f32-2',
    },
    events: {},
  },
  (_, { speed, threshold, maxLength }: Uniforms) => {
    const curr = vec2.create();
    const velocity = vec2.create();
    const direction = vec2.create();
    return ({ i: { movement }, o }) => {
      vec2.add(curr, curr, movement);
      vec2.normalize(direction, curr);
      const currLength = vec2.length(curr);
      maxLength;
      // if (currLength > maxLength) {
      //   vec2.scale(velocity, direction, currLength - maxLength);
      //   vec2.scale(curr, direction, maxLength);
      // }
      if (currLength > threshold) {
        vec2.scaleAndAdd(velocity, velocity, direction, speed * (currLength - threshold));
        vec2.scale(velocity, velocity, 0.98);
      } else {
        vec2.scale(velocity, velocity, 0.1);
      }
      vec2.copy(o.movement, velocity);
      vec2.sub(curr, curr, velocity);
      if (vec2.dot(curr, direction) < 0) {
        vec2.set(curr, 0, 0);
      }
    };
  },
)({ speed: 0.1, threshold: 20, maxLength: 50 });

export default Touch;
