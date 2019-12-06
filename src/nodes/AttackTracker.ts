import vn from 'vector-node';
import { zeroPeak } from '../utils/converter';
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
      velocity: 'f32-3-moment',
    },
    output: 'f32-3-moment',
  },
  ({ threshold, peakWeight }: Props) => {
    let prevSpeed = 0;
    let currSpeed = 0;
    return ({ inputs: { velocity, acceleration }, output }) => {
      const mag = vec3.length(velocity.value);
      const nextSpeed = mag * zeroPeak(peakWeight * (1 - Math.abs(mag)));
      const speedSign = Math.sign(currSpeed - prevSpeed);
      const isTurning = vec3.dot(acceleration.value, velocity.value) * speedSign <= 0;
      if (isTurning && currSpeed > threshold) {
        vec3.normalize(output.value, velocity.value);
      } else {
        vec3.set(output.value, 0, 0, 0);
      }

      prevSpeed = currSpeed;
      currSpeed = nextSpeed;
    };
  },
);

export default AttackTracker;
