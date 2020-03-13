import vn from 'vector-node';
import { MotionTreeBase, MotionNode, TreeSchema } from './base';
import Posture from '../../nodes/Posture';
import Velocity from '../../nodes/Velocity';
import Rotation from '../../nodes/Rotation';
import Pitch from '../../nodes/Pitch';
import BallTraveler from '../../nodes/BallTraveler';
import Pin from '../../nodes/Pin';
import Note from '../../nodes/Note';
import Touch from '../../nodes/Touch';
import CoordParser from '../../nodes/CoordParser';
import CCC from '../../nodes/CCC';

export type PlayerMotionTree = MotionTreeBase<'player', typeof TreeSchema.player>;
export default function createPlayerMotionTree(): PlayerMotionTree {
  const tree = vn.createTree(TreeSchema.player);
  const { rootNode } = tree;

  const posture = Posture({}, { acceleration: [rootNode, 'acceleration'], orientation: [rootNode, 'orientation'] });

  const dt = [rootNode, 'dt'] as const;
  const _touchMovement = [Touch({}, { movement: [rootNode, 'touchMovement'] }), 'movement'] as const;
  _touchMovement;
  const touchMovement = [rootNode, 'touchMovement'] as const;
  const touchActivity = [rootNode, 'touchActivity'] as const;
  const acceleration = [posture, 'acceleration'] as const;

  const velocity = [Velocity({}, { acceleration, dt }), 'output'] as const;
  const rotation = [Rotation({}, { dt, rotationRate: [rootNode, 'rotation'] }), 'rotation'] as const;
  const pitch = Pitch({ attenuation: 0.9, angleThreshold: 0.1, speedThreshold: 0.3 }, { rotation, velocity });

  const traveler = BallTraveler({}, { touchMovement, touchActivity, rotation, pitch: [pitch, 'power'] });

  const ccc = CCC({}, { tilt: [traveler, 'tilt'], swipe: [traveler, 'swipe'] });
  const parsedCoord = CoordParser({}, { coord: [ccc, 'coord'] });

  const power = [pitch, 'power'] as const;
  const axis = [parsedCoord, 'axis'] as const;
  const leg = [parsedCoord, 'leg'] as const;
  const tilt = [ccc, 'tilt'] as const;
  const swipe = [ccc, 'swipe'] as const;
  const coord = [ccc, 'hostSwipe'] as const;
  const motion = MotionNode({}, { dt, power, axis, leg, tilt, swipe, coord }) as MotionNode;
  tree.listen(motion);

  return {
    role: 'player',
    motion,
    update: (...args) => tree.update(...args),
    registerNote: (pinAttr, noteAttr) => {
      const pin = Pin(pinAttr, { axis: leg, pitch: power });
      const note = Note(noteAttr, { dt, velocity: [pin, 'velocity'], timeline: [pin, 'timeline'] });
      tree.listen(note);
      return [pin, () => tree.unlisten(note)];
    },
  };
}
