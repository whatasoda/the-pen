import vn from 'vector-node';

interface Uniforms {
  magnitudeThreshold: number;
  omegaBase: number;
  min: number;
  max: number;
}

const Scratch = vn.defineNode(
  {
    inputs: {
      filteredSignedOmega: 'f32-1',
      magnitude: 'f32-1',
    },
    outputs: { output: 'f32-1' },
    events: {},
  },
  (_, { magnitudeThreshold, omegaBase, min, max }: Uniforms) => {
    const coef = 1 / (1 + min);
    return ({ i: { filteredSignedOmega, magnitude }, o: { output } }) => {
      output[0] = 1; // reset output
      const x = Math.abs(filteredSignedOmega[0] / omegaBase);
      if (magnitude[0] < magnitudeThreshold || x < min) return;

      const sign = Math.sign(filteredSignedOmega[0]) || 1;
      // // https://www.google.com/search?q=4*sqrt(x)*atan(x**3)/PI
      // const raw = (4 / Math.PI) * Math.atan(x ** 3) * x ** (3 / 4);
      output[0] = sign * Math.min(coef * (x ** 2 + min), max);
    };
  },
)({ omegaBase: 10, magnitudeThreshold: 0, min: 0.02, max: 30 });

export default Scratch;
