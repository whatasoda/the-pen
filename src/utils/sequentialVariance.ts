import sequential from './sequential';
import { zeroPeak } from './converter';

const tmp = new Float32Array(1);
const sequentialVariance = (size: number, coef: number) => {
  const seq = sequential('free', size);
  return (input: number) => {
    tmp[0] = input;
    seq.push(tmp);
    const ave = seq.reduce((acc, curr) => acc + curr[0], 0) / size;
    const raw = seq.reduce((acc, curr) => acc + (curr[0] - ave) ** 2, 0) / size;
    return zeroPeak(raw ** 0.5 * coef);
  };
};

export default sequentialVariance;
