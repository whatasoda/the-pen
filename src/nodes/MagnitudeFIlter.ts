import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Props {
  max: number;
  min: number;
}

const MagnitudeFilter = vn.defineNode(
  {
    inputs: {
      filter: 'f32-3-moment',
      input: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ max, min }: Props) => {
    return ({ inputs: { filter, input }, output }) => {
      const mag = vec3.length(filter.value);
      if (mag < min || max < mag) {
        output.value[0] = 0;
      } else {
        output.value[0] = input.value[0];
      }
    };
  },
);

export default MagnitudeFilter;
