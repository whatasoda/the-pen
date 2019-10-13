import { vec3, vec2, vec4, quat } from 'gl-matrix';

export const completeAxis = (outX: vec3, outY: vec3, outZ: vec3, inZ: number[]) => {
  const absZ = [...inZ].map(Math.abs);
  const [i0, i1, i2] = [0, 1, 2].sort((a, b) => absZ[a] - absZ[b]);

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

type VecType = {
  scalar: Float32Array;
  vec2: vec2;
  vec3: vec3;
  vec4: vec4;
  quat: quat;
};
const dimensionMap: Record<keyof VecType, number> = {
  scalar: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  quat: 4,
};

interface Sequential<T extends keyof VecType> {
  get(i: number): VecType[T];
  push(item: VecType[T] | number[]): void;
  forEach(cb: (curr: VecType[T], index: number) => void): void;
  reduce<U>(cb: (acc: U, curr: VecType[T], index: number) => U, acc: U): U;
  accumulate(out: VecType[T], args: VecType[T], cb: (out: VecType[T], a: VecType[T], b: VecType[T]) => void): void;
}
export const sequential = <T extends keyof VecType>(type: T, size: number): Sequential<T> => {
  type V = VecType[T];
  const dimension = dimensionMap[type];
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

  return { push, get, forEach, reduce, accumulate };
};
