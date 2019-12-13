import vn from 'vector-node';
import createCubicBezier from '../utils/cubicBezier';

interface Props {
  bezierWeight: number;
  range: number;
}

const BezierFilter = vn.defineNode(
  {
    inputs: { input: 'f32-1-moment' },
    output: 'f32-1-moment',
  },
  ({ bezierWeight, range }: Props) => {
    const bezier = createCubicBezier(bezierWeight);
    let init = true;
    return ({ inputs: { input }, output }) => {
      if (init) {
        output.value[0] = Number.MAX_SAFE_INTEGER;
        init = false;
        return;
      }
      const next = input.value[0];
      const curr = output.value[0];
      const t = bezier(Math.abs(next - curr) / range);
      const out = t * next + (1 - t) * curr;
      if (isNaN(out) || !isFinite(out)) {
        output.value[0] = next;
      } else {
        output.value[0] = out;
      }
    };
  },
);

export default BezierFilter;
