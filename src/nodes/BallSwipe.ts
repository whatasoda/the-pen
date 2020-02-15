import vn from 'vector-node';
import { vec3, quat, vec2 } from 'gl-matrix';

const BallSwipe = vn.defineNode(
  {
    inputs: {
      childCoord: 'f32-9',
      touchMovement: 'f32-2',
    },
    outputs: {
      swipe: 'f32-4',
    },
    events: {},
  },
  () => {
    const axis = vec3.create();
    return ({ i: { childCoord, touchMovement }, o: { swipe } }) => {
      vec3.set(axis, 0, -touchMovement[1], -touchMovement[0]);
      vec3.transformMat3(axis, axis, childCoord);
      vec3.normalize(axis, axis);

      quat.setAxisAngle(swipe, axis, vec2.length(touchMovement) * 0.01);
    };
  },
);

export default BallSwipe;
