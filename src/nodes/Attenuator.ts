import vn from 'vector-node';

interface Props {
  weight: number;
}

const Attenuator = vn.defineNode(
  {
    inputs: {
      input: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ weight }: Props) => {
    return ({ inputs: { input }, output }) => {
      output.value[0] = Math.max(input.value[0], output.value[0] * weight);
    };
  },
);

export default Attenuator;
