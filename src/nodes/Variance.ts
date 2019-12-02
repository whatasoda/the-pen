import vn from 'vector-node';
import sequential from '../utils/sequential';

interface Props {
  sequenceLength: number;
}

const Variance = vn.defineNode(
  {
    nodeType: 'Variance',
    inputs: {
      input: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ sequenceLength }: Props) => {
    const seq = sequential(1, sequenceLength);
    return ({ inputs: { input }, output }) => {
      seq.push(input.value);
      const ave = seq.reduce((acc, [curr]) => acc + curr, 0) / sequenceLength;
      output.value[0] = seq.reduce((acc, [curr]) => acc + (curr - ave) ** 2, 0) / sequenceLength;
    };
  },
);

export default Variance;
