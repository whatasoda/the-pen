import { useMemo } from 'react';

const useGain = (ctx: AudioContext, value: number): GainNode => {
  const node = useMemo(() => ctx.createGain(), []);
  node.gain.value = value;

  return node;
};

export default useGain;
