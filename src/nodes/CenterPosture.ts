import vn from 'vector-node';
import { vec3, quat } from 'gl-matrix';

interface Attributes {
  center: vec3;
}

const CenterPosture = vn.defineNode(
  {
    inputs: {
      inverseOrientation: 'f32-4',
      rotation: 'f32-4',
      acceleration: 'f32-3',
      dt: 'f32-1',
    },
    outputs: {
      velocity: 'f32-3',
    },
    events: {},
  },
  (_0, _1, { center }: Attributes) => {
    const mvmt = vec3.create();
    const prevOrientation = quat.create();
    const prevAcceleration = vec3.create();
    const tmp = vec3.create();
    const acc = vec3.create();
    return ({ i: { inverseOrientation, rotation, acceleration: currAcceleration, dt }, o: { velocity } }) => {
      const freq = 1 / dt[0];
      freq;
      vec3.transformQuat(mvmt, center, rotation);
      vec3.transformQuat(mvmt, mvmt, prevOrientation);
      vec3.copy(prevOrientation, inverseOrientation);

      vec3.add(tmp, prevAcceleration, currAcceleration);
      vec3.copy(prevAcceleration, currAcceleration);
      vec3.scale(acc, acc, 0.97);
      vec3.scaleAndAdd(acc, acc, tmp, dt[0] * 0.5);
      vec3.scaleAndAdd(velocity, acc, mvmt, freq);
      vec3.copy(velocity, acc);
    };
  },
)({});

export default CenterPosture;
