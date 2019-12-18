import vn from 'vector-node';
import { peakDot } from '../utils/converter';
import { vec3 } from 'gl-matrix';

interface Uniforms {
  threshold: number;
  /** around 10 seems to be fine */
  peakWeight: number;
}

const AttackTracker = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3',
      accelerationDirection: 'f32-3',
      velocity: 'f32-3',
      velocityDirection: 'f32-3',
    },
    outputs: { output: 'f32-3' },
    events: {},
  },
  (_, { threshold, peakWeight }: Uniforms) => {
    const calcCoef = (baseDirection: vec3, inputDirection: vec3) => {
      return peakDot(peakWeight, baseDirection, inputDirection);
    };

    const direction = vec3.create();
    let prevSpeed = 0;
    let currSpeed = 0;
    return ({ i: { velocity, acceleration, accelerationDirection, velocityDirection }, o: { output } }) => {
      const nextSpeed = vec3.length(velocity);
      const speedChange = currSpeed - prevSpeed;
      const turningDegree = vec3.dot(accelerationDirection, velocityDirection);
      const magnitude = vec3.length(acceleration) * calcCoef(direction, accelerationDirection);
      if (turningDegree * speedChange <= 0 && magnitude > threshold) {
        vec3.copy(output, direction);
      } else {
        vec3.set(output, 0, 0, 0);
      }

      prevSpeed = currSpeed;
      currSpeed = nextSpeed;
      vec3.copy(direction, velocityDirection);
    };
  },
)({ threshold: 30, peakWeight: 12 });

export default AttackTracker;
