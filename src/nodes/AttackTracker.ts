import vn from 'vector-node';
import { peakDot } from '../utils/converter';
import { vec3 } from 'gl-matrix';

interface Props {
  threshold: number;
  /** around 10 seems to be fine */
  peakWeight: number;
}

const AttackTracker = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3-moment',
      accelerationDirection: 'f32-3-moment',
      velocity: 'f32-3-moment',
      velocityDirection: 'f32-3-moment',
    },
    output: 'f32-3-moment',
  },
  ({ threshold, peakWeight }: Props) => {
    const calcCoef = (baseDirection: vec3, inputDirection: vec3) => {
      return peakDot(peakWeight, baseDirection, inputDirection);
    };

    const direction = vec3.create();
    let prevSpeed = 0;
    let currSpeed = 0;
    return ({ inputs: { velocity, acceleration, accelerationDirection, velocityDirection }, output }) => {
      const nextSpeed = vec3.length(velocity.value);
      const speedChange = currSpeed - prevSpeed;
      const turningDegree = vec3.dot(accelerationDirection.value, velocityDirection.value);
      const magnitude = vec3.length(acceleration.value) * calcCoef(direction, accelerationDirection.value);
      if (turningDegree * speedChange <= 0 && magnitude > threshold) {
        vec3.copy(output.value, direction);
      } else {
        vec3.set(output.value, 0, 0, 0);
      }

      prevSpeed = currSpeed;
      currSpeed = nextSpeed;
      vec3.copy(direction, velocityDirection.value);
    };
  },
);

export default AttackTracker;
