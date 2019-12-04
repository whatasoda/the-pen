import { vec3 } from 'gl-matrix';

const orthogonal = (() => {
  const helper = vec3.create();
  const normalized = vec3.create();
  const SQRT1_3 = Math.sqrt(1 / 3);
  return (out: vec3, base: vec3) => {
    vec3.normalize(normalized, base);
    vec3.copy(helper, normalized);
    const mainIndex = Array.prototype.findIndex.call(normalized, (v) => Math.abs(v) >= SQRT1_3) as 0 | 1 | 2;
    const mainValue = helper[mainIndex];
    if (mainValue > 0.9) {
      const subIndex = ((mainIndex + 1) % 3) as 0 | 1 | 2;
      helper[mainIndex] = helper[subIndex];
      helper[subIndex] = mainValue;
    } else {
      helper[mainIndex] *= -1;
    }
    vec3.cross(out, helper, normalized);
    return out;
  };
})();

export default orthogonal;
