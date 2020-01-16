import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Uniforms {
  attenuationRate: number;
}

const tmp = vec3.create();
const Velocity = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3',
      dt: 'f32-1',
    },
    outputs: { output: 'f32-3' },
    events: {},
  },
  (_, { attenuationRate }: Uniforms) => {
    const prev = vec3.create();
    return ({ i: { acceleration: curr, dt }, o: { output } }) => {
      vec3.add(tmp, prev, curr);
      vec3.copy(prev, curr);
      vec3.scale(output, output, attenuationRate);
      vec3.scaleAndAdd(output, output, tmp, dt[0] * 0.5);
    };
  },
)({ attenuationRate: 0.95 });

export default Velocity;
