import vn from 'vector-node';
import { vec3 } from 'gl-matrix';

interface Uniforms {
  attenuationRate: number;
}

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
    const tmp = vec3.create();
    return ({ i: { acceleration, dt }, o: { output } }) => {
      const out = output;
      // const magnitude = vec3.length(acceleration);
      // if (magnitude < 0.3) {
      //   vec3.scale(out, out, attenuationRate ** 3);
      // } else {
      const curr = acceleration;
      vec3.add(tmp, prev, curr);
      vec3.copy(prev, curr);
      vec3.scale(out, out, attenuationRate);
      vec3.scaleAndAdd(out, out, tmp, dt[0] * 0.5);
      // }
    };
  },
)({ attenuationRate: 0.95 });

export default Velocity;
