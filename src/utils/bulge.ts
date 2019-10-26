import { vec3 } from 'gl-matrix';
import { zeroPeak } from './converter';
import regression from './leastSquares';

const bulge = (size: number) => {
  const reg = regression(size);
  const gradient = vec3.create();
  const tmp = vec3.create();
  const acc = vec3.create();
  return (input: V3 | vec3, coef: number) => {
    vec3.set(acc, 0, 0, 0);
    reg(gradient, input, ([x, y, z]) => {
      vec3.sub(tmp, [x, y, z], input);
      vec3.scaleAndAdd(tmp, tmp, gradient, -vec3.dot(tmp, gradient));
      vec3.add(acc, acc, tmp);
    });
    return zeroPeak(((coef * vec3.length(acc)) / size) ** 2);
  };
};

export default bulge;
