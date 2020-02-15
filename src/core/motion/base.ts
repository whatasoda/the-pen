import vn, { VectorsOf, VectorSchemaMap } from 'vector-node';
import Pin, { PinAttributes } from '../../nodes/Pin';
import { NoteAttributes } from '../../nodes/Note';

export const TreeSchema = {
  host: {
    power: 'f32-1',
    axis: 'f32-3',
    leg: 'f32-3',
    dt: 'f32-1',
    tilt: 'f32-9',
    swipe: 'f32-9',
    coord: 'f32-9',
  } as const,
  player: {
    rotation: 'f32-3',
    acceleration: 'f32-3',
    orientation: 'f32-3',
    touchMovement: 'f32-2',
    touchActivity: 'u8-1',
    dt: 'f32-1',
  } as const,
};

export type MotionNode = ReturnType<typeof MotionNode>;
export const MotionNode = vn.defineNode(
  { inputs: TreeSchema.host, outputs: {}, events: { update: (i: VectorsOf<typeof TreeSchema.host>) => i } },
  ({ dispatch }) => ({ i }) => dispatch('update', i),
)({});

export interface MotionTreeBase<T extends keyof typeof TreeSchema, O extends VectorSchemaMap> {
  role: T;
  motion: MotionNode;
  update: (callback: (o: Readonly<VectorsOf<O>>) => void) => void;
  registerNote: (pinAttr: PinAttributes, noteAttr: NoteAttributes) => readonly [ReturnType<typeof Pin>, () => void];
}
