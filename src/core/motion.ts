import vn from 'vector-node';
import Length from '../nodes/Length';
import Velocity from '../nodes/Velocity';
import AbsoluteAcceleration from '../nodes/AbsoluteAcceleration';
import Direction from '../nodes/Direction';
import OmegaRotation from '../nodes/OmegaRotation';
import Ball from '../nodes/Ball';

const MotionTree = vn.createTree({
  rotation: 'f32-3',
  acceleration: 'f32-3',
  orientation: 'f32-3',
  dt: 'f32-1',
});
const { rootNode } = MotionTree;

const dt = [rootNode, 'dt'] as const;
const acceleration = [
  AbsoluteAcceleration({}, { acceleration: [rootNode, 'acceleration'], orientation: [rootNode, 'orientation'] }),
  'output',
] as const;
const velocity = [Velocity({}, { acceleration, dt }), 'output'] as const;

const velocityDirection = Direction({}, { input: velocity });
const magnitude = [Length({}, { input: acceleration }), 'output'] as const;

const omegaRotation = OmegaRotation({}, { velocityDirection: [velocityDirection, 'output'] });
const ball = Ball({}, { magnitude, rotation: [omegaRotation, 'output'] });
ball;

export default MotionTree;
