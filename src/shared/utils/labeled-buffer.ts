import { TupleLength } from 'typed-tuple-type';

const TYPE_TOKEN = '' as const;
// const TYPE_BYTE_LENGTH = Float32Array.BYTES_PER_ELEMENT;
const COMMON_ENTRY: [string, number] = [TYPE_TOKEN, 1];

export interface LabeledBufferSchema extends Record<string, TupleLength> {}

export type AnyLabeledBuffer = LabeledBuffer<LabeledBufferSchema>;
export interface LabeledBuffer<T extends Record<string, TupleLength>> {
  readonly schema: Readonly<T>;
  readonly items: { readonly [K in keyof T]: Float32Tuple<T[K]> };
  readonly root: Float32Array;
  readonly byteLength: number;
  readonly copyFrom: (buffer: ArrayBuffer, byteOffset?: number) => void;
  readonly checkBufferType: (buffer: ArrayBuffer, byteOffset?: number) => boolean;
}

export type AnyLabeledBufferFactory = LabeledBufferFactory<LabeledBufferSchema>;
export interface LabeledBufferFactory<T extends Record<string, TupleLength>> {
  (buffer?: ArrayBuffer, byteOffset?: number): LabeledBuffer<T>;
  readonly type: number;
  readonly elemLength: number;
  readonly byteLength: number;
}

const IDENTIFIER_LENGTH = 4;
const convertIdentifier = (identifier: string) => {
  identifier = identifier.toLowerCase();
  if (identifier.length !== IDENTIFIER_LENGTH) {
    throw new RangeError(
      `binaryMapper: identifier's length should be ${IDENTIFIER_LENGTH}. '${identifier}' is unavailable.`,
    );
  }
  const type = parseInt(identifier, 36);
  if (isNaN(type)) {
    throw new RangeError(
      `binaryMapper: invalid charactors are included in '${identifier}'. You can use only '[0-9a-z]'.`,
    );
  }
  return type;
};

export const createLabeledBufferGroup = <T extends [K, AnyLabeledBufferFactory][], K extends string>(
  identifier: string,
  factories: T,
) => {
  const type = convertIdentifier(identifier);
  const elemLength = factories.reduce((acc, [, { elemLength }]) => acc + elemLength, 1);
  const byteLength = elemLength * Float32Array.BYTES_PER_ELEMENT;
  // const factoryMap = Object.fromEntries<AnyLabeledBufferFactory>(factories);

  return function LabeledBufferGroup() {
    const buffer = new ArrayBuffer(byteLength);
    const self = new Float32Array(buffer);

    let pointer = 0;
    const items = factories.reduce<Record<string, AnyLabeledBuffer>>((acc, [key, factory]) => {
      acc[key] = factory(buffer, pointer);
      pointer += factory.byteLength;
      return acc;
    }, {});

    const copyFrom = (target: ArrayBuffer, byteOffset: number = 0) => {
      self.set(new Float32Array(target, byteOffset, elemLength));
    };

    return { type, elemLength, byteLength, buffer, items, copyFrom };
  };
};

export default function createLabeledBuffer<T extends LabeledBufferSchema>(
  identifier: string,
  schema: T,
): LabeledBufferFactory<T> {
  const type = convertIdentifier(identifier);
  // sort to ensure that items are always mapped with same order
  const inputEntries = [COMMON_ENTRY, ...Object.entries(schema)].sort(([a], [b]) => (a < b ? -1 : 1));
  const elemLength = inputEntries.reduce((acc, [, curr]) => acc + curr, 0);
  const byteLength = elemLength * Float32Array.BYTES_PER_ELEMENT;

  const checkBufferType = (buffer: ArrayBuffer, byteOffset: number = 0) => {
    const view = new Float32Array(buffer, byteOffset, 1);
    return view[0] === type;
  };

  const LabeledBuffer = (
    buffer: ArrayBuffer = new ArrayBuffer(byteLength),
    byteOffset: number = 0,
  ): LabeledBuffer<T> => {
    if (buffer.byteLength - byteOffset < byteLength) {
      throw new RangeError('binaryMapper: ArrayBuffer length is not enough.');
    }

    const root = new Float32Array(buffer, byteOffset, elemLength);
    root[0] = type;

    let pointer = 0;
    const items = inputEntries.reduce<Record<string, Float32Array>>((acc, [key, len]) => {
      acc[key] = root.subarray(pointer, (pointer += len));
      return acc;
    }, {}) as LabeledBuffer<T>['items'];

    const copyFrom = (buffer: ArrayBuffer, byteOffset: number = 0) => {
      root.set(new Float32Array(buffer, byteOffset, elemLength));
    };

    return { schema, root, items, byteLength, copyFrom, checkBufferType };
  };

  LabeledBuffer.type = type;
  LabeledBuffer.elemLength = elemLength;
  LabeledBuffer.byteLength = byteLength;

  return LabeledBuffer;
}
