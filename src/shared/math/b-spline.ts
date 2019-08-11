type BSplineType<D extends Dimension> = {
  points: PointType[D][];
  dimension: D;
  degree: Degree;
  seqList: CalcFunc[];
  baseFunc: (x: number) => number;
  rangeInt: number;
};

type BSplineProps<D extends Dimension> = {
  points: PointType[D][];
  dimension: D;
  degree: Degree;
};

type Degree = 2 | 3 | 4 | 5;
type Dimension = 2 | 3;
type PointType = [[], [], [number, number], [number, number, number]];

type CalcFunc = (n: number) => number;

/**
 * This is typescript version of https://github.com/Tagussan/BSpline
 * Thanks Tagussan!!
 */
const BSpline = <D extends Dimension>({ degree, dimension, points }: BSplineProps<D>): BSplineType<D> => {
  const seqList = new Array(dimension).fill(0).map((_, i) => seqAt({ points, degree }, i));
  const baseFunc = baseFuncRecord[degree];
  const rangeInt = rangeIntRecord[degree];

  return { points, dimension, degree, seqList, baseFunc, rangeInt };
};

BSpline.gen = <D extends Dimension>(props: BSplineProps<D>) => {
  const bs = BSpline(props);
  return calcAt.bind(null, bs) as (t: number) => PointType[D];
};

const calcAt = <D extends Dimension>(bs: BSplineType<D>, t: number) => {
  t *= (bs.degree + 1) * 2 + bs.points.length; // t must be in [0,1]
  return bs.seqList.map((seq) => getInterpol(bs, seq, t)) as PointType[D];
};

const seqAt = (bs: Pick<BSplineType<Dimension>, 'points' | 'degree'>, d: number): CalcFunc => {
  const { points, degree } = bs;
  const margin = degree + 1;
  return (n) => {
    if (n < margin) {
      return points[0][d];
    }
    if (points.length + margin <= n) {
      return points[points.length - 1][d];
    }
    return points[n - margin][d];
  };
};

const getInterpol = (bs: BSplineType<Dimension>, seq: CalcFunc, t: number) => {
  const { baseFunc, rangeInt } = bs;
  const tInt = Math.floor(t);
  let result = 0;
  for (let i = tInt - rangeInt; i <= tInt + rangeInt; i++) {
    result += seq(i) * baseFunc(t - i);
  }
  return result;
};

const rangeIntRecord: Record<Degree, number> = {
  2: 2,
  3: 2,
  4: 3,
  5: 3,
};

const baseFuncRecord: Record<Degree, CalcFunc> = {
  2: (x) => {
    if (x >= -0.5 && x < 0.5) {
      return 0.75 - x * x;
    }
    if (x >= 0.5 && x <= 1.5) {
      return 1.125 + (-1.5 + x / 2.0) * x;
    }
    if (x >= -1.5 && x < -0.5) {
      return 1.125 + (1.5 + x / 2.0) * x;
    }
    return 0;
  },

  3: (x) => {
    if (x >= -1 && x < 0) {
      return 2.0 / 3.0 + (-1.0 - x / 2.0) * x * x;
    }
    if (x >= 1 && x <= 2) {
      return 4.0 / 3.0 + x * (-2.0 + (1.0 - x / 6.0) * x);
    }
    if (x >= -2 && x < -1) {
      return 4.0 / 3.0 + x * (2.0 + (1.0 + x / 6.0) * x);
    }
    if (x >= 0 && x < 1) {
      return 2.0 / 3.0 + (-1.0 + x / 2.0) * x * x;
    }
    return 0;
  },

  4: (x) => {
    if (x >= -1.5 && x < -0.5) {
      return 55.0 / 96.0 + x * (-(5.0 / 24.0) + x * (-(5.0 / 4.0) + (-(5.0 / 6.0) - x / 6.0) * x));
    }
    if (x >= 0.5 && x < 1.5) {
      return 55.0 / 96.0 + x * (5.0 / 24.0 + x * (-(5.0 / 4.0) + (5.0 / 6.0 - x / 6.0) * x));
    }
    if (x >= 1.5 && x <= 2.5) {
      return 625.0 / 384.0 + x * (-(125.0 / 48.0) + x * (25.0 / 16.0 + (-(5.0 / 12.0) + x / 24.0) * x));
    }
    if (x >= -2.5 && x <= -1.5) {
      return 625.0 / 384.0 + x * (125.0 / 48.0 + x * (25.0 / 16.0 + (5.0 / 12.0 + x / 24.0) * x));
    }
    if (x >= -1.5 && x < 1.5) {
      return 115.0 / 192.0 + x * x * (-(5.0 / 8.0) + (x * x) / 4.0);
    }
    return 0;
  },

  5: (x) => {
    if (x >= -2 && x < -1) {
      return 17.0 / 40.0 + x * (-(5.0 / 8.0) + x * (-(7.0 / 4.0) + x * (-(5.0 / 4.0) + (-(3.0 / 8.0) - x / 24.0) * x)));
    }
    if (x >= 0 && x < 1) {
      return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 - x / 12.0) * x * x);
    }
    if (x >= 2 && x <= 3) {
      return 81.0 / 40.0 + x * (-(27.0 / 8.0) + x * (9.0 / 4.0 + x * (-(3.0 / 4.0) + (1.0 / 8.0 - x / 120.0) * x)));
    }
    if (x >= -3 && x < -2) {
      return 81.0 / 40.0 + x * (27.0 / 8.0 + x * (9.0 / 4.0 + x * (3.0 / 4.0 + (1.0 / 8.0 + x / 120.0) * x)));
    }
    if (x >= 1 && x < 2) {
      return 17.0 / 40.0 + x * (5.0 / 8.0 + x * (-(7.0 / 4.0) + x * (5.0 / 4.0 + (-(3.0 / 8.0) + x / 24.0) * x)));
    }
    if (x >= -1 && x < 0) {
      return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 + x / 12.0) * x * x);
    }
    return 0;
  },
};

export default BSpline;
