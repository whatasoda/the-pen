import vn from 'vector-node';

interface Props {
  minRadius: number;
  maxRadius: number;
  fluctuationThreshold: number;
  rangeThreshold: number;
}

const Circle = vn.defineNode(
  {
    inputs: {
      radius: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ fluctuationThreshold, rangeThreshold, maxRadius, minRadius }: Props) => {
    let active = false;
    let prev = 0;
    let max = -Infinity;
    let min = Infinity;

    const reset = (out: Float32Tuple<1>) => {
      active = false;
      prev = 0;
      max = -Infinity;
      min = Infinity;
      out[0] = 0;
    };

    return ({ inputs, output }) => {
      const [radius] = inputs.radius.value;
      if (radius < minRadius || maxRadius < radius) return reset(output.value);
      const fluctuation = prev - radius;
      if (active && fluctuationThreshold < Math.abs(fluctuation)) return reset(output.value);

      prev = radius;
      active = true;
      max = Math.max(max, radius);
      min = Math.min(min, radius);
      const range = max - min;
      if (rangeThreshold < range) return reset(output.value);

      output.value[0] = 1;
    };
  },
);

export default Circle;
