import distortion from '../shared/math/distortion';
import applyNoise from '../shared/math/noise';

const DEFAULT_NOISE_AMOUNT = 0.1;

const applyCurve = (out: Float32Array, amount: number, noiseSeed: number, noiseAmount: number): Float32Array => {
  const { length } = out;
  applyNoise(out, [-noiseAmount, 2 * noiseAmount], noiseSeed);
  for (let i = 0; i < length; i++) {
    out[i] += distortion(i, length, amount);
  }

  return out;
};

const createWaveShaper = (
  ctx: AudioContext,
  resolution: number,
  oversample: WaveShaperNode['oversample'],
): WaveShaperNode => {
  const waveShaper = ctx.createWaveShaper();
  const curve = new Float32Array(resolution);
  waveShaper.oversample = oversample;
  waveShaper.curve = curve;
  return waveShaper;
};

const updateWaveShaper = (
  waveShaper: WaveShaperNode,
  amount: number,
  noiseSeed: number,
  noiseAmount: number = DEFAULT_NOISE_AMOUNT,
): WaveShaperNode => {
  if (waveShaper.curve) {
    applyCurve(waveShaper.curve, amount, noiseSeed, noiseAmount);
  }
  return waveShaper;
};

export { createWaveShaper, updateWaveShaper };
