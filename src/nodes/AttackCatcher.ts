import vn from 'vector-node';
import { vec3 } from 'gl-matrix';
import { peakDot } from '../utils/converter';

interface Props {
  direction: vec3;
  threshold: number;
  /** around 10 seems to be fine */
  peakWeight: number;
}

const AttackCatcher = vn.defineNode(
  {
    inputs: {
      acceleration: 'f32-3-moment',
      accelerationDirection: 'f32-3-moment',
      velocity: 'f32-3-moment',
      velocityDirection: 'f32-3-moment',
    },
    output: 'f32-1-moment',
  },
  ({ direction, threshold, peakWeight }: Props) => {
    vec3.normalize(direction, direction);

    const calcCoef = (inputDirection: vec3) => peakDot(peakWeight, direction, inputDirection);

    let prevSpeed = 0;
    let currSpeed = 0;
    let latestMagnitude = 0;
    return ({ inputs: { velocity, velocityDirection, acceleration, accelerationDirection }, output }) => {
      const magnitude = vec3.length(acceleration.value) * calcCoef(accelerationDirection.value);
      latestMagnitude = Math.max(magnitude, latestMagnitude);
      const nextSpeed = vec3.length(velocity.value) * calcCoef(velocityDirection.value);

      const speedChange = currSpeed - prevSpeed;
      const turning = vec3.dot(accelerationDirection.value, velocityDirection.value);
      if (!nextSpeed || speedChange * turning >= 0) {
        output.value[0] = 0;
        if (!nextSpeed) latestMagnitude = 0;
      } else {
        output.value[0] = Number(latestMagnitude > threshold);
        latestMagnitude = 0;
      }

      prevSpeed = currSpeed;
      currSpeed = nextSpeed;
    };
  },
);

export default AttackCatcher;
