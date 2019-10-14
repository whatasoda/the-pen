import { vec2, vec3, vec4, quat } from 'gl-matrix';

type VT = {
  scalar: Float32Array;
  vec2: vec2;
  vec3: vec3;
  vec4: vec4;
  quat: quat;
};
const dimensions: Record<keyof VT, number> = {
  scalar: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  quat: 4,
};

interface Sequential<T extends keyof VT> {
  readonly type: T;
  readonly size: number;
  readonly dimension: number;
  get(i: number): VT[T];
  push(item: VT[T] | number[]): void;
  forEach(cb: (curr: VT[T], index: number) => void): void;
  map<U>(cb: (curr: VT[T], index: number) => U): U[];
  reduce<U>(cb: (acc: U, curr: VT[T], index: number) => U, acc: U): U;
  accumulate(out: VT[T], args: number[], cb: (out: VT[T], a: VT[T], b: number[]) => void): void;
  accumulate(out: VT[T], args: VT[T], cb: (out: VT[T], a: VT[T], b: VT[T]) => void): void;
}

const sequential = <T extends keyof VT>(type: T, size: number): Sequential<T> => {
  type V = VT[T];
  const dimension = dimensions[type];
  const length = size * dimension;
  const last = size - 1;
  const sqeuence = new Float32Array(length);
  const view = Array.from({ length: size }).map((_, i) => sqeuence.subarray(i * dimension, (i + 1) * dimension) as V);

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

  const push = (item: V | number[]) => {
    view[next()].set(item);
  };

  const forEach = (cb: (curr: V, index: number) => void) => {
    pointer.forEach((p, i) => {
      cb(view[p], i);
    });
  };

  const map = <U>(cb: (curr: V, index: number) => U): U[] => {
    return pointer.map((p, i) => cb(view[p], i));
  };

  const reduce = <U>(cb: (acc: U, curr: V, index: number) => U, acc: U): U => {
    pointer.forEach((p, i) => {
      acc = cb(acc, view[p], i);
    });
    return acc;
  };

  const accumulate = (out: V, value: V, cb: (out: V, a: V, b: V) => void): V => {
    out.set(get(last));
    forEach((out) => cb(out, out, value));
    push(value);
    return out;
  };

  return {
    type,
    size,
    dimension,
    push,
    get,
    forEach,
    map,
    reduce,
    accumulate: (accumulate as unknown) as Sequential<T>['accumulate'],
  };
};

export const add: {
  <V extends VT[keyof VT]>(out: V, a: V, b: V): V;
  <V extends VT[keyof VT]>(out: V, a: V, b: number[]): V;
} = <V extends VT[keyof VT]>(out: V, a: V, b: V) => {
  a.forEach((val, i) => (out[i] = val + b[i]));
  return out;
};

export const sub: {
  <V extends VT[keyof VT]>(out: V, a: V, b: V): V;
  <V extends VT[keyof VT]>(out: V, a: V, b: number[]): V;
} = <V extends VT[keyof VT]>(out: V, a: V, b: V) => {
  a.forEach((v, i) => (out[i] = v - b[i]));
  return out;
};

export const scale = <V extends VT[keyof VT]>(out: V, a: V, length: number) => {
  a.forEach((v, i) => (out[i] = v * length));
  return out;
};

export const dot = (base: Float32Array, target: Float32Array) => {
  return base.reduce((acc, v, i) => acc + v * target[i]);
};

export const len = (a: Float32Array) => a.reduce((acc, v) => acc + v ** 2, 0) ** 0.5;

export default sequential;
