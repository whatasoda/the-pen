import vn from 'vector-node';
import { vec3, vec2 } from 'gl-matrix';
import { convertCosine } from '../utils/math';

export interface PinAttributes {
  position: vec3;
  radius: number;
}

const { acos, cos } = Math;
const Pin = vn.defineNode(
  {
    inputs: {
      axis: 'f32-3',
    },
    outputs: {
      alpha: 'f32-1',
      range: 'f32-1',
      velocity: 'f32-1',
      timeline: 'f32-2',
      theta: 'f32-2',
    },
    events: {},
  },
  (_0, _1, { position: P, radius: pinRadius }: PinAttributes) => {
    const normal = vec3.create();
    const B = vec3.create();
    const C /** prev */ = vec3.create();
    const defaultRange = cos(pinRadius);
    return ({ i: { axis: A /** curr */ }, o }) => {
      vec3.normalize(normal, vec3.cross(normal, C, A));

      /**
       * no movement happened
       * A === C, B === P
       */
      if (!vec3.length(normal)) {
        o.alpha[0] = 1;
        o.velocity[0] = 0;
        o.range[0] = defaultRange;
        const theta = acos(vec3.dot(A, P));
        if (theta <= pinRadius) {
          o.theta.fill(theta);
          vec2.set(o.timeline, 0, 1);
        } else {
          o.timeline.fill(0);
          o.theta.fill(0);
        }
      } else {
        // B is the nearest point in the current great circle
        vec3.normalize(B, vec3.scaleAndAdd(B, P, normal, -vec3.dot(normal, P)));
        const alpha = (o.alpha[0] = vec3.dot(B, P));
        if (acos(alpha) > pinRadius) {
          o.timeline.fill(0);
          o.theta.fill(0);
          o.range[0] = 0;
          o.velocity[0] = 0;
        } else {
          const range = (o.range[0] = convertCosine(1 / alpha, pinRadius));
          const AB = acos(vec3.dot(A, B));
          const BC = acos(vec3.dot(B, C));
          const CA = acos(vec3.dot(C, A));

          const CinRange = BC <= range;
          const AinRange = AB <= range;
          const BinAC = CA > AB && CA > BC;

          if (CinRange || AinRange || BinAC) {
            const s = (o.timeline[0] = CinRange ? 0 : (BC - range) / CA);
            const e = (o.timeline[1] = AinRange ? 1 : 1 - (AB - range) / CA);
            o.theta[0] = CinRange ? BC : range;
            o.theta[1] = AinRange ? AB : range;
            o.velocity[0] = CA * (e - s);
            if (BinAC) o.theta[0] *= -1;
          } else {
            o.timeline.fill(0);
            o.theta.fill(0);
            o.velocity[0] = 0;
          }
        }
      }
      vec3.copy(C, A);
    };
  },
)({});

export default Pin;
