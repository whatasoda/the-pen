import createCubicBezier from './cubicBezier';

export interface EnvelopeProps {
  /** duration as second */
  attack: number;
  /** duration as second */
  decay: number;
  /** volume as magnification */
  sustain: number;
  /** duration as second */
  release: number;
  /** weight -1 to 1 */
  attackWeight?: number;
  /** weight -1 to 1 */
  decayWeight?: number;
  /** weight -1 to 1 */
  releaseWeight?: number;
}

const createEnvelope = (props: EnvelopeProps, freq: number) => {
  const { attack, decay, sustain, release, attackWeight, decayWeight, releaseWeight } = props;

  const subSustain = 1 - sustain;
  const attackBezier = createCubicBezier(attackWeight ?? 0);
  const decayBezier = createCubicBezier(decayWeight ?? 0);
  const releaseBezier = createCubicBezier(releaseWeight ?? 0);

  const a = attack * freq;
  const d = decay * freq;
  const r = release * freq;

  const AD = new Float32Array(a + d + 1);
  const R = new Float32Array(r + 1);
  for (let i = 0; i < a; i++) AD[i] = attackBezier(i / a);
  for (let i = 0; i <= d; i++) AD[i + a] = sustain + subSustain * (1 - decayBezier(i / d));
  for (let i = 0; i <= r; i++) R[i] = sustain * (1 - releaseBezier(i / r));

  const start = (param: AudioParam, startTime: number) => {
    const duration = attack + decay;
    param.cancelScheduledValues(startTime);
    param.setValueCurveAtTime(AD, startTime, duration);
    param.setValueAtTime(AD[AD.length - 1], startTime + duration);
  };
  const stop = (param: AudioParam, stopTime: number) => {
    param.cancelScheduledValues(stopTime);
    param.setValueCurveAtTime(R, stopTime, release);
  };

  return { AD, R, start, stop };
};

export default createEnvelope;
