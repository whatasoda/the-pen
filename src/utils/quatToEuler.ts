import { quat, vec3 } from 'gl-matrix';

/**
 * @param out z-x-y Euler
 * @param Q input quat
 */
const quatToEuler = (out: vec3, [qx, qy, qz, qw]: quat): vec3 => {
  const r00 = -2 * (qx * qy - qw * qz);
  const r01 = qw * qw - qx * qx + qy * qy - qz * qz;
  const r10 = 2 * (qy * qz + qw * qx);
  const r20 = -2 * (qx * qz - qw * qy);
  const r21 = qw * qw - qx * qx - qy * qy + qz * qz;
  return vec3.set(out, Math.atan2(r20, r21), Math.asin(r10), Math.atan2(r00, r01));
};

export default quatToEuler;
