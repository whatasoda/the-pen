import vn from 'vector-node';
import createCubicBezier from '../utils/cubicBezier';

interface Attributes {
  bezierWeight: number;
  range: number;
}

const BezierFilter = vn.defineNode(
  {
    inputs: { input: 'f32-1' },
    outputs: { output: 'f32-1' },
    events: {},
  },
  (_0, _1, { bezierWeight, range }: Attributes) => {
    const bezier = createCubicBezier(bezierWeight);
    let init = true;
    return ({ i: { input }, o: { output } }) => {
      if (init) {
        output[0] = Number.MAX_SAFE_INTEGER;
        init = false;
        return;
      }
      const next = input[0];
      const curr = output[0];
      const t = bezier(Math.abs(next - curr) / range);
      const out = t * next + (1 - t) * curr;
      if (isNaN(out) || !isFinite(out)) {
        output[0] = next;
      } else {
        output[0] = out;
      }
    };
  },
)({});

export default BezierFilter;
