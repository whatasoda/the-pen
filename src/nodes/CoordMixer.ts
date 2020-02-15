import vn from 'vector-node';
import { mat3 } from 'gl-matrix';

const CoordMixer = vn.defineNode(
  {
    inputs: {
      from: 'f32-9',
      to: 'f32-9',
    },
    outputs: {
      coord: 'f32-9',
    },
    events: {},
  },
  () => {
    const transpose = mat3.create();
    return ({ i: { from, to }, o: { coord } }) => {
      mat3.transpose(transpose, from);
      mat3.multiply(coord, to, from);
    };
  },
)({});

export default CoordMixer;
