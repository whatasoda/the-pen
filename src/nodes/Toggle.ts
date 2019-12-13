import vn from 'vector-node';

interface Props {
  mode: 'sign' | 'simple';
  defaultValue?: number;
}

const Toggle = vn.defineNode(
  {
    inputs: {
      input: 'f32-1-moment',
      value: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ mode, defaultValue = 0 }: Props) => {
    switch (mode) {
      case 'sign': {
        let curr = -1;
        return ({ inputs: { input, value }, output }) => {
          if (input.value[0]) curr = input.value[0];
          output.value[0] = curr < 0 ? defaultValue : value.value[0];
        };
      }
      case 'simple': {
        let curr = false;
        return ({ inputs: { input, value }, output }) => {
          if (input.value[0]) curr = !curr;
          output.value[0] = !curr ? defaultValue : value.value[0];
        };
      }
    }
  },
);

export default Toggle;
