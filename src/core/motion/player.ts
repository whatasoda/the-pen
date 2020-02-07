import vn from 'vector-node';
import { MotionTreeBase, MotionNode, TreeSchema } from './base';
import Posture from '../../nodes/Posture';
import Velocity from '../../nodes/Velocity';
import Rotation from '../../nodes/Rotation';
import Pitch from '../../nodes/Pitch';
import BallTraveler from '../../nodes/BallTraveler';
import Ball from '../../nodes/Ball';
import Pin from '../../nodes/Pin';
import Note from '../../nodes/Note';
import Touch from '../../nodes/Touch';

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
  const pitch = Pitch({ attenuation: 0.9, angleThreshold: 0.15, speedThreshold: 0.7 }, { rotation, velocity });

  const traveler = BallTraveler({}, { touchMovement, touchActivity, rotation, pitch: [pitch, 'power'] });
  const ball = Ball({}, { rotation: [traveler, 'out'] });

  const power = [pitch, 'power'] as const;
  const axis = [ball, 'axis'] as const;
  const leg = [ball, 'leg'] as const;
  const motion = MotionNode({}, { dt, power, axis, leg }) as MotionNode;
  tree.listen(motion);

  return {
    role: 'player',
    motion,
    update: (...args) => tree.update(...args),
    registerNote: (pinAttr, noteAttr) => {
      const pin = Pin(pinAttr, { axis, pitch: power });
      const note = Note(noteAttr, { dt, velocity: [pin, 'velocity'], timeline: [pin, 'timeline'] });
      tree.listen(note);
      return [pin, () => tree.unlisten(note)];
    },
  };
}
