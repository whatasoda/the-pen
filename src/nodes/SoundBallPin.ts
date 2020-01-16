import vn from 'vector-node';
import { vec3 } from 'gl-matrix';
import orthogonal from '../utils/orthogonal';

export interface SoundBallPinAttributes {
  position: vec3;
  radius: number;
  angleOffset: number;
}

const { PI, acos } = Math;
const PI2 = PI * 2;
const PI3 = PI * 3;

const N = vec3.create();
const Q = vec3.create();

const SoundBallPin = vn.defineNode(
  {
    inputs: {
      axis: 'f32-3',
    },
    outputs: {
      delay: 'f32-1',
      angle: 'f32-1',
      distance: 'f32-1',
      movement: 'f32-1',
    },
    events: {},
  },
  (_0, _1, { position, radius, angleOffset }: SoundBallPinAttributes) => {
    position = vec3.normalize(vec3.create(), position);
    const curr = vec3.create();
    const prev = vec3.create();

    const U = orthogonal(vec3.create(), position);
    const V = vec3.cross(vec3.create(), position, U);
    vec3.normalize(U, U);
    vec3.normalize(V, V);
    return ({ i: { axis }, o }) => {
      vec3.scale(curr, axis, -1);
      vec3.cross(N, curr, prev);
      vec3.normalize(N, N);

      vec3.scaleAndAdd(Q, position, N, -vec3.dot(N, position));
      vec3.normalize(Q, Q);
      const distance = acos(vec3.dot(Q, position));

      const mvmt = acos(vec3.dot(curr, prev));
      const AB = acos(vec3.dot(prev, Q));
      const BC = acos(vec3.dot(Q, curr));
      if (distance > radius || mvmt < AB || mvmt < BC) {
        o.delay[0] = -1;
        o.angle[0] = -1;
        o.distance[0] = -1;
        o.movement[0] = 0;
      } else {
        const t = AB / mvmt;
        const angle = ((Math.atan2(vec3.dot(U, N), vec3.dot(V, N)) + angleOffset + PI3) / PI2) % 1;

        o.delay[0] = t;
        o.angle[0] = angle;
        o.distance[0] = distance;
        o.movement[0] = mvmt;
      }

      vec3.copy(prev, curr);
    };
  },
)({});

export default SoundBallPin;
