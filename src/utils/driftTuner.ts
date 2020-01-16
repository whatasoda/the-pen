import sequential from './sequential';
import { vec3 } from 'gl-matrix';

const average = vec3.create();
const variance = vec3.create();
const tmp = vec3.create();
const createDriftTuner = (size: number, callback: (drift: vec3) => void) => {
  const seq = sequential(3, size);
  const coef = 1 / size;
  let i = 0;

  const update = (input: vec3) => {
    seq.push(input);
    if (++i < size) return;
    vec3.set(average, 0, 0, 0);
    vec3.set(variance, 0, 0, 0);

    seq.forEach((curr) => vec3.add(average, average, curr));
    vec3.scale(average, average, coef);
    seq.forEach((curr) => {
      vec3.sub(tmp, curr, average);
      vec3.multiply(tmp, tmp, tmp);
      vec3.add(variance, variance, tmp);
    });
    vec3.scale(variance, variance, coef);
    if (vec3.length(variance) < 0.01) callback(average);
  };
  return update;
};

export default createDriftTuner;
