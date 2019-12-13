import vn from 'vector-node';
import { vec3 } from 'gl-matrix';
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
import PositionRadius from '../nodes/PositionRadius';
import AbsoluteAcceleration from '../nodes/AbsoluteAcceleration';
import AttackCatcher from '../nodes/AttackCatcher';
import ADSR from '../nodes/ADSR';
import MagnitudeFilter from '../nodes/MagnitudeFIlter';
import Direction from '../nodes/Direction';
import Omega from '../nodes/Omega';
import SignedOmega from '../nodes/SignedOmega';
import BezierFilter from '../nodes/BezierFilter';
import Scratch from '../nodes/Scratch';
import Toggle from '../nodes/Toggle';
import BeatGenerator from '../nodes/BeatGenerator';

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
    AttackCatcher,
    ADSR,
    MagnitudeFilter,
    Direction,
    Omega,
    SignedOmega,
    BezierFilter,
    Scratch,
    Toggle,
    BeatGenerator,
  },
  (NODE, inputs) => {
    const { dt } = inputs;
    const {
      Velocity,
      Length,
      AbsoluteAcceleration,
      Movement,
      AttackCatcher,
      ADSR,
      Direction,
      Omega,
      SignedOmega,
      BezierFilter,
      Scratch,
      Toggle,
      BeatGenerator,
    } = NODE;

    const acceleration = AbsoluteAcceleration({ ...inputs }, {});
    const velocity = Velocity({ dt, acceleration }, { attenuationRate: 0.95 });
    const accelerationDirection = Direction({ input: acceleration }, {});
    const velocityDirection = Direction({ input: velocity }, {});
    const omega = Omega({ velocityDirection, dt }, {});
    const magnitude = Length({ input: acceleration }, {});
    const movement = Movement({ dt, velocity }, {});

    const hogege = (v: number, ...args: V3) => {
      const axis = vec3.fromValues(...args);
      const signedOmega = SignedOmega({ omega, velocityDirection }, { axis, dotThreshold: 0.6 });
      const filteredSignedOmega = BezierFilter({ input: signedOmega }, { bezierWeight: 0.5, range: 10 });
      const attack = AttackCatcher(
        { acceleration, velocity, velocityDirection, accelerationDirection },
        { direction: axis, threshold: 30, peakWeight: 12 },
      );
      const scratch = Scratch(
        { magnitude, filteredSignedOmega },
        { omegaBase: 10, magnitudeThreshold: 0, min: 0.02, max: 30 },
      );
      const result = Toggle({ input: attack, value: scratch }, { defaultValue: v, mode: 'simple' });
      return { attack, scratch, result };
    };
    const { scratch } = hogege(0, 0, 0, 1);
    const beat = ADSR(
      { input: BeatGenerator({ input: scratch }, { framePerBeat: 8, valuePerBeat: 60 }) },
      { attack: 2, decay: 3, sustain: 0.3, release: 2, releaseWeight: -0.3 },
    );

    return {
      velocity,
      scratch: hogege(1, 0, 1, 0),
      effect: hogege(0, -1, 0, 0),
      acceleration,
      beat,
      movement,
      magnitude,
      omega,
    };
  },
);

export default motion;
