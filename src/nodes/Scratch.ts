import vn from 'vector-node';

interface Props {
  magnitudeThreshold: number;
  omegaBase: number;
  min: number;
  max: number;
}

const Scratch = vn.defineNode(
  {
    inputs: {
      filteredSignedOmega: 'f32-1-moment',
      magnitude: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ magnitudeThreshold, omegaBase, min, max }: Props) => {
    const coef = 1 / (1 + min);
    return ({ inputs: { filteredSignedOmega, magnitude }, output }) => {
      output.value[0] = 1; // reset output
      const x = Math.abs(filteredSignedOmega.value[0] / omegaBase);
      if (magnitude.value[0] < magnitudeThreshold || x < min) return;

      const sign = Math.sign(filteredSignedOmega.value[0]) || 1;
      // // https://www.google.com/search?q=4*sqrt(x)*atan(x**3)/PI
      // const raw = (4 / Math.PI) * Math.atan(x ** 3) * x ** (3 / 4);
      output.value[0] = sign * Math.min(coef * (x ** 2 + min), max);
    };
  },
);

export default Scratch;
