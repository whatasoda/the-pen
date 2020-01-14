import vn from 'vector-node';
import { vec3 } from 'gl-matrix';
import { convertCosine } from '../utils/math';

interface Attributes {
  position: vec3;
  radius: number;
}

const { acos } = Math;
const Pin = vn.defineNode(
  {
    inputs: {
      axis: 'f32-3',
    },
    outputs: {
      alpha: 'f32-1',
      range: 'f32-1',
      timeline: 'f32-2',
      theta: 'f32-2',
    },
    events: {},
  },
  (_0, _1, { position: P, radius: pinRadius }: Attributes) => {
    const normal = vec3.create();
    const B = vec3.create();
    const C /** prev */ = vec3.create();
    return ({ i: { axis: A /** curr */ }, o }) => {
      vec3.normalize(normal, vec3.cross(normal, C, A));
      vec3.normalize(B, vec3.scaleAndAdd(B, P, normal, -vec3.dot(normal, P)));
      const alpha = (o.alpha[0] = vec3.dot(B, P));
      if (acos(alpha) >= pinRadius) {
        o.timeline.fill(0);
        o.theta.fill(0);
        o.range[0] = 0;
      } else {
        const range = (o.range[0] = convertCosine(1 / alpha, pinRadius));
        const AB = acos(vec3.dot(A, B));
        const BC = acos(vec3.dot(B, C));
        const CA = acos(vec3.dot(C, A));

        const CisValid = BC <= range;
        const AisValid = BC <= range;
        const sign = CA > AB && CA > BC ? -1 : 1;

        o.timeline[0] = CisValid ? 0 : (BC - range) / CA;
        o.timeline[1] = AisValid ? 1 : 1 - (AB - range) / CA;
        o.theta[0] = (CisValid ? BC : range) * sign;
        o.theta[1] = AisValid ? AB : range;
      }
      vec3.copy(C, A);
    };
  },
)({});

export default Pin;
