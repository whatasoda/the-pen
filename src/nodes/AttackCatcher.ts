import vn from 'vector-node';
import { vec3 } from 'gl-matrix';
import { peakDot } from '../utils/converter';

interface Uniforms {
  threshold: number;
  /** around 10 seems to be fine */
  peakWeight: number;
}

interface Attributes {
  direction: vec3;
}

const AttackCatcher = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3',
      accelerationDirection: 'f32-3',
      velocity: 'f32-3',
      velocityDirection: 'f32-3',
    },
    outputs: { output: 'f32-1' },
    events: {},
  },
  (_, { peakWeight, threshold }: Uniforms, { direction }: Attributes) => {
    vec3.normalize(direction, direction);

    const calcCoef = (inputDirection: vec3) => peakDot(peakWeight, direction, inputDirection);

    let prevSpeed = 0;
    let currSpeed = 0;
    let latestMagnitude = 0;
    return ({ i: { velocity, velocityDirection, acceleration, accelerationDirection }, o: { output } }) => {
      const magnitude = vec3.length(acceleration) * calcCoef(accelerationDirection);
      latestMagnitude = Math.max(magnitude, latestMagnitude);
      const nextSpeed = vec3.length(velocity) * calcCoef(velocityDirection);

      const speedChange = currSpeed - prevSpeed;
      const turning = vec3.dot(accelerationDirection, velocityDirection);
      if (!nextSpeed || speedChange * turning >= 0) {
        output[0] = 0;
        if (!nextSpeed) latestMagnitude = 0;
      } else {
        output[0] = Number(latestMagnitude > threshold);
        latestMagnitude = 0;
      }

      prevSpeed = currSpeed;
      currSpeed = nextSpeed;
    };
  },
)({ threshold: 30, peakWeight: 12 });

export default AttackCatcher;
