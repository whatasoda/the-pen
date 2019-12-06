import vn from 'vector-node';
import { vec3 } from 'gl-matrix';
import { zeroPeak } from '../utils/converter';

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
      velocity: 'f32-3-moment',
    },
    output: 'f32-1-moment',
  },
  ({ direction, threshold, peakWeight }: Props) => {
    vec3.normalize(direction, direction);

    let prevSpeed = 0;
    let currSpeed = 0;
    return ({ inputs: { velocity, acceleration }, output }) => {
      const mag = vec3.dot(velocity.value, direction);
      const nextSpeed = mag * zeroPeak(peakWeight * (1 - Math.abs(mag)));
      const speedSign = Math.sign(currSpeed - prevSpeed);
      const isTurning = vec3.dot(acceleration.value, velocity.value) * speedSign <= 0;
      output.value[0] = Number(isTurning && currSpeed > threshold);

      prevSpeed = currSpeed;
      currSpeed = nextSpeed;
    };
  },
);

export default AttackCatcher;
