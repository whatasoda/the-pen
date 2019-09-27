import { vec2 } from 'gl-matrix';

const createMotionCacher = ({ bufferSize, weightFactor }: MotionCatcherConfigType) => {
  const buffer = Array.from({ length: bufferSize }).map<V2>(() => [0, 0]);
  let pointer = 0;
  const curr = vec2.create();
  const mvmt = vec2.create();
  const weight = Math.pow(weightFactor, 1 / bufferSize);

  const update = ([m0, m1]: V2) => {
    for (let i = 0; i < bufferSize; i++) {
      buffer[i][0] = buffer[i][0] * weight + m0;
      buffer[i][1] = buffer[i][1] * weight + m1;
    }

    curr.set(buffer[pointer]);
    buffer[pointer].fill(0);
    const cLength = vec2.length(curr);
    const mLength = vec2.length([m0, m1]);
    vec2.scale(curr, curr, 1 / cLength);
    vec2.scale(mvmt, [m0, m1], 1 / mLength);
    const dot = vec2.dot(curr, mvmt);
    const pow = cLength / bufferSize;

    pointer++;
    if (pointer >= bufferSize) pointer = 0;

    return { dot, pow };
  };

  const motionCatcher = { update };

  return motionCatcher;
};

export default createMotionCacher;