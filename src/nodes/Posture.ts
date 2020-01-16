import vn from 'vector-node';
import { quat } from 'gl-matrix';
import { vec3 } from 'gl-matrix';

const Posture = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3',
      orientation: 'f32-3',
    },
    outputs: {
      acceleration: 'f32-3',
      orientation: 'f32-4',
      inverseOrientation: 'f32-4',
    },
    events: {},
  },
  () => {
    return ({ i, o: { acceleration, orientation, inverseOrientation } }) => {
      const [alpha, beta, gamma] = i.orientation;
      quat.fromEuler(orientation, alpha, beta, gamma);
      quat.conjugate(inverseOrientation, orientation);
      vec3.transformQuat(acceleration, i.acceleration, inverseOrientation);
    };
  },
)({});

export default Posture;
