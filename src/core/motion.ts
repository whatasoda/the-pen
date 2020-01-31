import vn from 'vector-node';
import Velocity from '../nodes/Velocity';
import Posture from '../nodes/Posture';
import Ball from '../nodes/Ball';
import Note, { NoteAttributes } from '../nodes/Note';
import Rotation from '../nodes/Rotation';
import BallTraveler from '../nodes/BallTraveler';
import Pin, { PinAttributes } from '../nodes/Pin';
import Pitch from '../nodes/Pitch';
import Touch from '../nodes/Touch';

const MotionTree = vn.createTree({
  rotation: 'f32-3',
  acceleration: 'f32-3',
  orientation: 'f32-3',
  touchMovement: 'f32-2',
  touchActivity: 'u8-1',
  dt: 'f32-1',
});
const { rootNode } = MotionTree;

const posture = Posture({}, { acceleration: [rootNode, 'acceleration'], orientation: [rootNode, 'orientation'] });

const dt = [rootNode, 'dt'] as const;
const _touchMovement = [Touch({}, { movement: [rootNode, 'touchMovement'] }), 'movement'] as const;
_touchMovement;
const touchMovement = [rootNode, 'touchMovement'] as const;
const touchActivity = [rootNode, 'touchActivity'] as const;
const acceleration = [posture, 'acceleration'] as const;

const velocity = [Velocity({}, { acceleration, dt }), 'output'] as const;
const rotation = [Rotation({}, { dt, rotationRate: [rootNode, 'rotation'] }), 'rotation'] as const;
export const pitch = Pitch({ attenuation: 0.9, angleThreshold: 0.15, speedThreshold: 0.7 }, { rotation, velocity });
const traveler = BallTraveler({}, { touchMovement, touchActivity, rotation, pitch: [pitch, 'power'] });

export const ball = Ball({}, { rotation: [traveler, 'out'] });

export const createSoundBall = (pinAttr: PinAttributes, noteAttr: NoteAttributes) => {
  const pin = Pin(pinAttr, { axis: [ball, 'axis'], pitch: [pitch, 'power'] });
  const note = Note(noteAttr, { dt, velocity: [pin, 'velocity'], timeline: [pin, 'timeline'] });

  MotionTree.listen(note);

  const destroy = () => {
    MotionTree.unlisten(note);
  };
  return { destroy, pin };
};

export default MotionTree;
