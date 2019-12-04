import React, { useContext, createContext, useEffect, useState, FC } from 'react';

if (typeof window !== 'undefined') {
  window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
}

const useAudio = () => useContext(useAudio.context);
useAudio.context = createContext<AudioContext | null>(null);

const TARGET_EVENT_TYPES: (keyof WindowEventMap)[] = ['click', 'touchstart'];

export const AudioPrivider: FC = ({ children }) => {
  const [ctx, setCtx] = useState<AudioContext | null>(null);
  useEffect(() => {
    let done = false;
    const handler = async () => {
      const ctx = new AudioContext();
      cleanup();
      await ctx.resume();
      setCtx(ctx);
    };

    const cleanup = () => {
      if (done) return;
      done = true;
      TARGET_EVENT_TYPES.forEach((type) => window.removeEventListener(type, handler));
    };

    TARGET_EVENT_TYPES.forEach((type) => window.addEventListener(type, handler));
    return cleanup;
  }, []);

  return <useAudio.context.Provider children={children} value={ctx} />;
};

export default useAudio;
