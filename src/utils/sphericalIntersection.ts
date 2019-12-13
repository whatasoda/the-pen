import { vec3 } from 'gl-matrix';

export interface IntersectionObject {
  t: number;
  rad: number;
}

const sphericalIntersection = (() => {
  const UQ = vec3.create();
  const VQ = vec3.create();
  const UP = vec3.create();
  const VP = vec3.create();
  const RAD = new Float32Array(2);

  const check = (V: vec3, U: vec3, Q0: vec3, Q1: vec3, P0: vec3, P1: vec3) => {
    vec3.cross(V, Q0, Q1);
    vec3.normalize(V, V);
    vec3.add(U, Q0, Q1);
    vec3.normalize(U, U);
    RAD[0] = Math.atan2(vec3.dot(V, P0), vec3.dot(U, P0));
    RAD[1] = Math.atan2(vec3.dot(V, P1), vec3.dot(U, P1));
    const r0 = RAD[0];
    const r1 = RAD[1];
    return r0 * r1 <= 0 && Math.abs(r0 - r1) <= Math.PI;
  };

  return (Q0: vec3, Q1: vec3, P0: vec3, P1: vec3): IntersectionObject | null => {
    if (!check(UQ, VQ, P0, P1, Q0, Q1)) return null;
    if (!check(UP, VP, Q0, Q1, P0, P1)) return null;
    const r0 = RAD[0];
    const r1 = RAD[1];
    const t = Math.abs(r0 / r0 - r1);
    const rad = vec3.dot(VQ, VP);
    return { t, rad };
  };
})();

export default sphericalIntersection;
