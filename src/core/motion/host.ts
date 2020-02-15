import vn from 'vector-node';
import { MotionTreeBase, TreeSchema, MotionNode } from './base';
import Pin from '../../nodes/Pin';
// import Note from '../../nodes/Note';

export type HostMotionTree = MotionTreeBase<'host', typeof TreeSchema.host>;
export default function createHostMotionTree(): HostMotionTree {
  const tree = vn.createTree(TreeSchema.host);
  const { rootNode } = tree;

  const dt = [rootNode, 'dt'] as const;
  const power = [rootNode, 'power'] as const;
  const axis = [rootNode, 'axis'] as const;
  const leg = [rootNode, 'leg'] as const;
  const tilt = [rootNode, 'tilt'] as const;
  const swipe = [rootNode, 'swipe'] as const;
  const coord = [rootNode, 'coord'] as const;

  const motion = MotionNode({}, { dt, power, axis, leg, tilt, swipe, coord }) as MotionNode;
  tree.listen(motion);

  return {
    role: 'host',
    motion,
    update: (...args) => tree.update(...args),
    registerNote: (pinAttr, _) => {
      const pin = Pin(pinAttr, { axis: leg, pitch: power });
      // const note = Note(noteAttr, { dt, velocity: [pin, 'velocity'], timeline: [pin, 'timeline'] });
      tree.listen(pin);
      return [pin, () => tree.unlisten(pin)];
    },
  };
}
