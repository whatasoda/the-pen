import vn from 'vector-node';

interface Props {
  coef: number;
}

const { SQRT2, abs } = Math;
const ZeroPeak = vn.defineNode(
  {
    inputs: { input: 'f32-1-moment' },
    output: 'f32-1-moment',
  },
  ({ coef }: Props) => {
    return ({ inputs: { input }, output }) => {
      // https://www.google.com/search?q=1-(sqrt(2)**-abs(x)-1)**2
      output.value[0] = 1 - (SQRT2 ** -abs(coef * input.value[0]) - 1) ** 2;
    };
  },
);

export default ZeroPeak;
