import vn from 'vector-node';
import createCubicBezier from '../utils/cubicBezier';

interface Props {
  /** duration as frame */
  attack: number;
  /** duration as frame */
  decay: number;
  /** volume as magnification */
  sustain: number;
  /** duration as frame */
  release: number;
  /** weight -1 to 1 */
  attackWeight?: number;
  /** weight -1 to 1 */
  decayWeight?: number;
  /** weight -1 to 1 */
  releaseWeight?: number;
}

const ADSR = vn.defineNode(
  {
    inputs: {
      input: 'f32-1-moment',
    },
    output: 'f32-1-moment',
  },
  ({ attack, decay, sustain, release, attackWeight, decayWeight, releaseWeight }: Props) => {
    let value = 0;
    let active = false;
    const subSustain = 1 - sustain;
    const attackBezier = createCubicBezier(attackWeight ?? 0);
    const decayBezier = createCubicBezier(decayWeight ?? 0);
    const releaseBezier = createCubicBezier(releaseWeight ?? 0);

    const frames = new Uint16Array(3);
    const start = () => {
      frames[0] = attack;
      frames[1] = decay;
      frames[2] = release;
    };

    return ({ inputs, output }) => {
      const input = inputs.input.value[0];
      if (input) {
        if (!active) start();
        value = Math.max(value, input);
        active = true;
      } else {
        active = false;
      }
      if (value) {
        if (frames[0]) {
          output.value[0] = value * attackBezier(-(--frames[0] / attack) + 1);
        } else if (frames[1]) {
          output.value[0] = value * (sustain + decayBezier(subSustain * (--frames[1] / decay)));
        } else if (frames[2]) {
          if (!input) output.value[0] = value * sustain * releaseBezier(--frames[2] / release);
        } else {
          value = 0;
        }
      } else {
        output.value[0] = 0;
      }
    };
  },
);

export default ADSR;
