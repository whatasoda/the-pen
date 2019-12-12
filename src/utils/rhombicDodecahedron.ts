import { vec3, quat } from 'gl-matrix';

/**
 *   v 0           1           2           3
 * u   |           |           |           |
 * 0 --+-----------+-----------+-----------+--
 *     |           |           |           |
 * A   |     B     |     C     |     D     |
 *     |           |           |           |
 * 1 --+-----------+-----------+-----------+--
 *     |           |           |           |
 * B   |     C     |     D     |     A     |
 *     |           |           |           |
 * 2 --+-----------+-----------+-----------+--
 *     |           |           |           |
 * C   |     D     |     A     |     B     |
 *     |           |           |           |
 * 3 --+-----------+-----------+-----------+--
 *     |           |           |           |
 * D   |     A     |     B     |     C     |
 *     |           |           |           |
 * 4 --+-----------+-----------+-----------+--
 *     |           |           |           |
 */

interface RhombicDodecahedronPoint {
  uIdx: RegionKey;
  vIdx: RelativeKey;
  u: number;
  v: number;
}

type V = Float32Tuple<3>;
type RegionKey = 0 | 1 | 2 | 3;
type RelativeKey = 0 | 1 | 2;
interface Region {
  O: V;
  U: V;
  V: V;
}

const { SQRT1_2, PI } = Math;
const SQRT1_8 = 8 ** -0.5;
const PI_3 = PI / 3;
const PI_6 = PI / 6;
const cos30 = Math.cos(PI / 6);
const cos60 = Math.cos(PI / 3);

const AXES = new Float32Array([
  /* eslint-disable prettier/prettier */
  /* O - A */  cos60, cos30,      0,
  /* O - B */      0, cos30, -cos60,
  /* O - C */ -cos60, cos30,      0,
  /* O - D */      0, cos30,  cos60,

  /* U - A */ -cos30, cos60,      0,
  /* U - B */      0, cos60,  cos30,
  /* U - C */  cos30, cos60,      0,
  /* U - D */      0, cos60, -cos30,

  /* V - A */      0,     0,      1,
  /* V - B */      1,     0,      0,
  /* V - C */      0,     0,     -1,
  /* V - D */     -1,     0,      0,
  /* eslint-enable prettier/prettier */
]);

const RhombicDodecahedron = () => {};

const Regions = ((): [Region, Region, Region, Region] => {
  const gen = (i: number, len: number) => () => ((i += len), [i - len, i]);
  const O = gen(0, 3);
  const U = gen(12, 3);
  const V = gen(24, 3);
  return [
    {
      O: AXES.subarray(...O()) as V,
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
    /* B */
    {
      O: AXES.subarray(...O()) as V,
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
    /* C */
    {
      O: AXES.subarray(...O()) as V,
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
    /* D */
    {
      O: AXES.subarray(...O()) as V,
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
  ];
})();

RhombicDodecahedron.planeToSphere = (() => {
  const rotation = quat.create();
  const tmp = vec3.create();
  return (out: vec3, { u, uIdx, v, vIdx }: RhombicDodecahedronPoint) => {
    const uTheta = u * PI_3;
    const vTheta = v * PI_3;
    const height = calcBetaHeight(calcT(uIdx, uTheta));
    const { O, U } = Regions[uIdx];
    quat.setAxisAngle(rotation, O, uTheta);
    vec3.transformQuat(tmp, U, rotation);
    vec3.scaleAndAdd(tmp, tmp, O, SQRT1_2 - height);

    quat.setAxisAngle(rotation, Regions[(uIdx + vIdx + 1) % 4].O, vTheta);
    vec3.transformQuat(tmp, tmp, rotation);
    vec3.normalize(out, tmp);
  };
})();

RhombicDodecahedron.sphereToPlane = (P: vec3) => {
  return parse(0, P) || parse(1, P) || parse(2, P) || parse(3, P);
};

const parse = (idx: RegionKey, P: vec3): RhombicDodecahedronPoint | null => {
  const curr = convertPoint(idx, P);
  if (typeof curr.u === 'number') {
    const { v } = convertPoint(curr.next, P);
    if (typeof v !== 'number') return null;
    const vIdx = ((curr.next - idx + 3) % 4) as RelativeKey;
    return {
      uIdx: idx,
      vIdx,
      u: curr.u,
      v,
    };
  } else if (typeof curr.v === 'number') {
    const { u } = convertPoint(curr.next, P);
    if (typeof u !== 'number') return null;
    const vIdx = ((idx - curr.next + 3) % 4) as RelativeKey;
    return {
      uIdx: curr.next,
      vIdx,
      u,
      v: curr.v,
    };
  }
  return null;
};

const convertPoint = (type: RegionKey, P: vec3) => {
  const { O, U, V } = Regions[type];
  const height = vec3.dot(O, P);
  const rad = Math.atan2(vec3.dot(V, P), vec3.dot(U, P)) + PI;

  const idx = Math.floor(rad / PI_3);
  const theta = rad % PI_3;
  const next = ((idx + 1) % 4) as RegionKey;
  if (!validateHeight(height, theta, idx)) return { next };

  const pos = theta / PI_3;
  return idx < 2 ? { next, u: pos } : { next, v: pos };
};

const validateHeight = (height: number, theta: number, idx: number) => {
  const t = calcT(theta, idx);
  if (height < calcAlphaHeight(t) || calcBetaHeight(t) < height) return false;
  return true;
};

const calcT = (theta: number, idx: number) => {
  return (idx % 2 ? 1 : -1) * Math.tan(theta - PI_6) + 0.5;
};

const calcAlphaHeight = (t: number) => {
  const alpha = SQRT1_8 * (t + 1);
  return -alpha * (alpha ** 2 + 1) ** 0.5;
};

const calcBetaHeight = (t: number) => {
  const beta = SQRT1_8 * (2 - t);
  return beta * (beta ** 2 + 1) ** 0.5;
};
