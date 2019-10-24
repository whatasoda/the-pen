import { vec3 } from 'gl-matrix';
import sequentialVariance from './sequentialVariance';

const { acos } = Math;

const curvature = (size: number) => {
  const vari = sequentialVariance(size, 1 / Math.PI);
  const prev = vec3.create();
  const curr = vec3.create();

  return (velo: V3 | vec3, dt: number) => {
    vec3.normalize(curr, velo);
    const v = vari(2 * (acos(vec3.dot(prev, curr)) / dt) ** 2);
    vec3.copy(prev, curr);
    return v;
  };
};

export default curvature;
