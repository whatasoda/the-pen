import { vec3, vec2, vec4 } from 'gl-matrix';

/**
 *   u 0           1           2           3
 * v   |           |           |           |
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

type RegionKey = 0 | 1 | 2 | 3;
type V = Float32Tuple<3>;
interface Region {
  U: V;
  V: V;
}

const { PI } = Math;
const PI_3 = PI / 3;
const cos30 = Math.cos(PI / 6);
const cos60 = Math.cos(PI / 3);

const AXES = new Float32Array([
  /* eslint-disable prettier/prettier */
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

const Regions = ((): [Region, Region, Region, Region] => {
  const gen = (i: number, len: number) => () => ((i += len), [i - len, i]);
  const U = gen(0, 3);
  const V = gen(12, 3);
  return [
    {
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
    {
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
    {
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
    {
      U: AXES.subarray(...U()) as V,
      V: AXES.subarray(...V()) as V,
    },
  ];
})();

const planeToSphere = (() => {
  const tmpU = vec3.create();
  const tmpV = vec3.create();
  return (out: vec3, plane: vec2) => {
    const u = plane[0];
    const uIdx = Math.floor(u) as RegionKey;
    const uTheta = u * PI_3;

    const v = plane[1];
    const vTheta = (v - uIdx) * PI_3;
    const vIdx = IDX[Math.floor(v) + uIdx] as RegionKey;
    {
      const { U, V } = Regions[uIdx];
      vec3.scale(tmpU, U, Math.cos(uTheta));
      vec3.scaleAndAdd(tmpU, tmpU, V, Math.sin(uTheta));
    }

    {
      const { V, U } = Regions[vIdx];
      vec3.scale(tmpV, V, Math.cos(vTheta));
      vec3.scaleAndAdd(tmpV, tmpV, U, Math.sin(vTheta));
    }

    vec3.scaleAndAdd(out, tmpU, tmpV, -vec3.dot(tmpU, tmpV));
    vec3.normalize(out, out);
  };
})();

const Coord = new Float32Array(4);
const IDX = new Uint8Array([0, 1, 2, 3, 0, 1, 2]);
const sphereToPlane = (out: vec2, P: vec3) => {
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
      if (-1 < x1 && x1 <= 0) return vec2.set(out, x0, x1 + 1 + i);
    } else if (x0 <= 2) {
      if (-2 < x2 && x2 <= -1) return vec2.set(out, x0, x2 + 2 + i);
    } else if (x0 <= 3) {
      if (-3 < x3 && x3 <= -2) return vec2.set(out, x0, x3 + 3 + i);
    }
  }
  return null;
};

const RhombicDodecahedron = { sphereToPlane, planeToSphere };

export default RhombicDodecahedron;
