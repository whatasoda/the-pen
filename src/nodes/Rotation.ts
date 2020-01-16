import vn from 'vector-node';
import { quat, vec3, vec4 } from 'gl-matrix';

const euler = vec3.create();
const curr = vec3.create();
const tmp = quat.create();

const Rotation = vn.defineNode(
  {
    inputs: {
      rotationRate: 'f32-3',
      dt: 'f32-1',
    },
    outputs: {
      rotation: 'f32-4',
    },
    events: {},
  },
  () => {
    const prev = vec3.create();
    return ({ i: { rotationRate, dt }, o: { rotation } }) => {
      vec3.scale(curr, rotationRate, dt[0] * 0.5);
      vec3.add(euler, prev, curr);
      vec3.copy(prev, curr);
      quat.fromEuler(tmp, euler[0], euler[1], euler[2]);
      vec4.copy(rotation, tmp);
      vec4.set(rotation, tmp[2], tmp[0], tmp[1], tmp[3]);
    };
  },
)({});

export default Rotation;
