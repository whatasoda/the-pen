import vn from 'vector-node';

interface Props {
  framePerBeat: number;
  valuePerBeat: number;
}

const BeatGenerator = vn.defineNode(
  {
    inputs: { input: 'f32-1-moment' },
    output: 'f32-1-moment',
  },
  ({ framePerBeat, valuePerBeat }: Props) => {
    let timer = 0;
    let acc = 0;
    return ({ inputs: { input }, output }) => {
      output.value[0] = 0; // reset output
      acc += Math.abs(input.value[0] || 0);
      if (--timer >= 0) return;
      timer += framePerBeat;
      if (acc < valuePerBeat) return;
      acc = Math.max(0, acc - valuePerBeat);
      output.value[0] = 1;
    };
  },
);

export default BeatGenerator;
