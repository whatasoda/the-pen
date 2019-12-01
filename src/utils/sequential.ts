import { TupleLength } from 'typed-tuple-type';

type Vec = Float32Array;

interface Sequential<V extends Float32Tuple<TupleLength>> {
  readonly size: number;
  readonly dimension: number;
  get(i: number): V;
  push(item: V | number[]): void;
  forEach(cb: (curr: V, index: number) => void): void;
  map<U>(cb: (curr: V, index: number) => U): U[];
  reduce<U>(cb: (acc: U, curr: V, index: number) => U, acc: U): U;
  reduceRight<U>(cb: (acc: U, curr: V, index: number) => U, acc: U): U;
  accumulate(out: V, args: number[], cb: (out: V, a: V, b: number[]) => void): void;
  accumulate(out: V, args: V, cb: (out: V, a: V, b: V) => void): void;
}

const sequential = <T extends TupleLength>(dimension: T, size: number): Sequential<Float32Tuple<T>> => {
  type Vec = Float32Tuple<T>;
  const length = size * dimension;
  const last = size - 1;
  const sqeuence = new Float32Array(length);
  const view = Array.from({ length: size }).map(
    (_, i) => (sqeuence.subarray(i * dimension, (i + 1) * dimension) as unknown) as Vec,
  );

  const base = size - 1;
  const pointer = Array.from({ length: size }).map((_, i) => i);
  /** private */
  const next = () => {
    let i = base - pointer[0];
    for (let p = 0; p < size; ) {
      pointer[i++] = p++;
      if (i === size) i = 0;
    }
    return pointer[0];
  };

  const get = (i: number) => view[pointer[i]];

  const push = (item: Vec | number[]) => {
    view[next()].set(item);
  };

  const forEach = (cb: (curr: Vec, index: number) => void) => {
    pointer.forEach((p, i) => {
      cb(view[p], i);
    });
  };

  const map = <U>(cb: (curr: Vec, index: number) => U): U[] => {
    return pointer.map((p, i) => cb(view[p], i));
  };

  const reduce = <U>(cb: (acc: U, curr: Vec, index: number) => U, acc: U): U => {
    return pointer.reduce((acc, p, i) => cb(acc, view[p], i), acc);
  };

  const reduceRight = <U>(cb: (acc: U, curr: Vec, index: number) => U, acc: U): U => {
    return pointer.reduceRight((acc, p, i) => cb(acc, view[p], i), acc);
  };

  const accumulate = (out: Vec, value: Vec, cb: (out: Vec, a: Vec, b: Vec) => void): Vec => {
    out.set(get(last));
    forEach((out) => cb(out, out, value));
    push(value);
    return out;
  };

  return {
    size,
    dimension,
    push,
    get,
    forEach,
    map,
    reduce,
    reduceRight,
    accumulate: (accumulate as unknown) as Sequential<Vec>['accumulate'],
  };
};

export const add: {
  (out: Vec, a: Vec, b: Vec): Vec;
  (out: Vec, a: Vec, b: number[]): Vec;
} = (out: Vec, a: Vec, b: Vec | number[]) => {
  a.forEach((val, i) => (out[i] = val + b[i]));
  return out;
};

export const sub: {
  (out: Vec, a: Vec, b: Vec): Vec;
  (out: Vec, a: Vec, b: number[]): Vec;
} = (out: Vec, a: Vec, b: Vec | number[]) => {
  a.forEach((v, i) => (out[i] = v - b[i]));
  return out;
};

export const scale = (out: Vec, a: Vec, length: number) => {
  a.forEach((v, i) => (out[i] = v * length));
  return out;
};

export const dot = (base: Vec, target: Vec) => {
  return base.reduce((acc, v, i) => acc + v * target[i]);
};

export const len = (a: Vec) => a.reduce((acc, v) => acc + v ** 2, 0) ** 0.5;

export default sequential;
