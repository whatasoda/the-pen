import vn from 'vector-node';

interface Attributes {
  mode: 'sign' | 'simple';
  defaultValue?: number;
}

const Toggle = vn.defineNode(
  {
    inputs: {
      input: 'f32-1',
      value: 'f32-1',
    },
    outputs: { output: 'f32-1' },
    events: {},
  },
  (_0, _1, { mode, defaultValue = 0 }: Attributes) => {
    switch (mode) {
      case 'sign': {
        let curr = -1;
        return ({ i: { input, value }, o: { output } }) => {
          if (input[0]) curr = input[0];
          output[0] = curr < 0 ? defaultValue : value[0];
        };
      }
      case 'simple': {
        let curr = false;
        return ({ i: { input, value }, o: { output } }) => {
          if (input[0]) curr = !curr;
          output[0] = !curr ? defaultValue : value[0];
        };
      }
    }
  },
);

export default Toggle;
