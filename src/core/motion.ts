import vn from 'vector-node';
import AxisRotation from '../nodes/AxisRotation';
import Length from '../nodes/Length';
import Movement from '../nodes/Movement';
import Rotation from '../nodes/Rotation';
import Variance from '../nodes/Variance';
import Velocity from '../nodes/Velocity';
import ZeroPeak from '../nodes/ZeroPeak';
import Circle from '../nodes/Circle';
import Radius from '../nodes/Radius';
import SurfaceCoord from '../nodes/SurfaceCoord';
import { vec3 } from 'gl-matrix';
import PositionRadius from '../nodes/PositionRadius';
import AbsoluteAcceleration from '../nodes/AbsoluteAcceleration';
import Hoge from '../nodes/Hoge';

const motion = vn.Scheduler({
  rotation: 'f32-3-moment',
  acceleration: 'f32-3-moment',
  orientation: 'f32-3-moment',
  dt: 'f32-1-moment',
})(
  {
    AxisRotation,
    Length,
    Movement,
    Rotation,
    Variance,
    Velocity,
    ZeroPeak,
    Circle,
    Radius,
    PositionRadius,
    SurfaceCoord,
    AbsoluteAcceleration,
    Hoge,
  },
  (NODE, inputs) => {
    const { dt } = inputs;
    const {
      Rotation,
      Velocity,
      AxisRotation,
      Circle,
      Radius,
      SurfaceCoord,
      AbsoluteAcceleration,
      Movement,
      Hoge,
      // PositionRadius,
    } = NODE;

    const rotation = Rotation({ dt, rateEuler: inputs.rotation }, { sequenceSize: 3 });
    const acceleration = AbsoluteAcceleration(
      { acceleration: inputs.acceleration, orientation: inputs.orientation },
      {},
    );
    const velocity = Velocity({ dt, acceleration }, { attenuationRate: 0.98 });

    const hoge = Hoge({ acceleration, velocity }, { direction: vec3.fromValues(0, 1, 0), threshold: 0.4 });

    const movement = Movement({ dt, velocity }, {});
    // const radius = PositionRadius(
    //   {
    //     position: SurfaceCoord({ input: movement }, { normal: vec3.fromValues(0, 1, 0) }),
    //     dt,
    //   },
    //   {},
    // );
    const radius = Radius(
      {
        dt,
        velocity: SurfaceCoord({ input: velocity }, { normal: vec3.fromValues(1, 0, 0) }),
      },
      {
        speedThreshold: 0.5,
      },
    );
    const circle = Circle(
      { radius },
      {
        fluctuationThreshold: 4,
        maxRadius: 20,
        minRadius: 1,
        rangeThreshold: 3,
      },
    );

    const axis = vec3.fromValues(0, 0, 1);
    const ar = AxisRotation({ rotationQuat: rotation }, { axis });

    return { r: rotation, v: velocity, ar, circle, radius, accel: acceleration, movement, hoge };
  },
);

export default motion;
