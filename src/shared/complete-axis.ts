import { vec3 } from 'gl-matrix';

const INDICES = [0, 1, 2];

const completeAxis = (outX: vec3, outY: vec3, outZ: vec3, inZ: number[]) => {
  const absZ = [...inZ].map(Math.abs);
  const [i0, i1, i2] = [...INDICES].sort((a, b) => absZ[a] - absZ[b]);

  vec3.normalize(outZ, inZ);

  const sign = -(Math.sign(outZ[i0]) * Math.sign(outZ[i1])) || 1;

  outX[i0] = outZ[i1] * sign;
  outX[i1] = outZ[i0] * sign;
  outX[i2] = outZ[i2];
  vec3.cross(outX, outZ, outX);
  vec3.cross(outY, outZ, outX);

  vec3.normalize(outX, outX);
  vec3.normalize(outY, outY);
};

export default completeAxis;
