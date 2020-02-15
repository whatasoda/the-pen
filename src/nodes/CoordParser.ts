import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

const CoordParser = vn.defineNode(
  {
    inputs: { coord: 'f32-9' },
    outputs: {
      axis: 'f32-3',
      arm: 'f32-3',
      leg: 'f32-3',
    },
    events: {},
  },
  () => {
    return ({ i: { coord }, o: { axis, arm, leg } }) => {
      vec3.set(axis, coord[0], coord[1], coord[2]);
      vec3.set(arm, coord[3], coord[4], coord[5]);
      vec3.set(leg, coord[6], coord[7], coord[8]);
    };
  },
)({});

export default CoordParser;
