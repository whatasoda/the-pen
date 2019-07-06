import { useMemo, useEffect } from 'react';

const useOscillator = (ctx: AudioContext, frequency: number, detune: number = 0) => {
  const osc = useMemo(() => ctx.createOscillator(), []);

  useEffect(() => {
    osc.frequency.value = frequency;
  }, [frequency]);

  useEffect(() => {
    osc.detune.value = detune;
  }, [detune]);

  return osc;
};

export default useOscillator;
