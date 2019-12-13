import { vec3, quat, vec2, vec4 } from 'gl-matrix';

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

const Coord = new Float32Array(4);
const IDX = new Uint8Array([0, 1, 2, 3, 0, 1, 2]);
RhombicDodecahedron.sphereToPlane = (out: vec2, P: vec3) => {
  vec4.set(
    Coord,
    Math.atan2(vec3.dot(Regions[0].V, P), vec3.dot(Regions[0].U, P)) / PI_3,
    Math.atan2(vec3.dot(Regions[1].V, P), vec3.dot(Regions[1].U, P)) / PI_3,
    Math.atan2(vec3.dot(Regions[2].V, P), vec3.dot(Regions[2].U, P)) / PI_3,
    Math.atan2(vec3.dot(Regions[3].V, P), vec3.dot(Regions[3].U, P)) / PI_3,
  );

  for (let i = 0; i < 4; i++) {
    const x0 = Coord[i];
    const x1 = Coord[IDX[i + 1]];
    const x2 = Coord[IDX[i + 2]];
    const x3 = Coord[IDX[i + 3]];

    if (x0 <= 0) {
      continue;
    } else if (x0 <= 1) {
      if (-1 < x1 && x1 <= 0) return vec2.set(out, x0, x1 + 1);
    } else if (x0 <= 2) {
      if (-2 < x2 && x2 <= -1) return vec2.set(out, x0, x2 + 2);
    } else if (x0 <= 3) {
      if (-3 < x3 && x3 <= -2) return vec2.set(out, x0, x3 + 3);
    }
  }
  return null;
};

const calcT = (theta: number, idx: number) => {
  return (idx % 2 ? 1 : -1) * Math.tan(theta - PI_6) + 0.5;
};

const calcBetaHeight = (t: number) => {
  const beta = SQRT1_8 * (2 - t);
  return beta * (beta ** 2 + 1) ** 0.5;
};
