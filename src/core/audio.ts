import { useMemo, useState } from 'react';

const useAudioRoot = (init?: (ctx: AudioContext) => void): AudioRoot => {
  const [status, dispatch] = useState<AudioRoot['status']>('LOADING');
  const { registerNode, ...root } = useMemo(() => createAudioRootObject({ dispatch, init }), []);

  const start = status !== 'RESTART_REQUIRED' ? null : root.start;

  return { status, registerNode, start };
};

interface AudioRootProps {
  dispatch: (status: AudioRoot['status']) => void;
  init: ((ctx: AudioContext) => void) | undefined;
}

const createAudioRootObject = ({ dispatch, init }: AudioRootProps): AudioRootObject => {
  let ctx: AudioContext;
  const queue: ((ctx: AudioContext) => readonly [AudioScheduledSourceNode, AudioNode])[] = [];
  const destinations: AudioNode[] = [];

  /**
   * This function have to be called in user gesture such as `click` and `touchstart`.
   */
  const start = () => {
    let isInitial = false;
    // TODO: judge it is in gesture
    if (!ctx) {
      ctx = new AudioContext();
      isInitial = true;
    }
    queue.forEach((factory) => {
      const [source, destination] = factory(ctx);
      try {
        source.start();
      } catch (e) {
        if (!(e instanceof DOMException) || e.name !== 'InvalidStateError') throw e;
      }
      destinations.push(destination);
      destination.connect(ctx.destination);
    });
    queue.length = 0;

    if (isInitial && typeof init === 'function') init(ctx);
    dispatch('RUNNING');
  };

  const registerNode = <T>(
    factory: (ctx: AudioContext) => readonly [T, AudioScheduledSourceNode, AudioNode],
  ): Promise<T> => {
    return new Promise((resolve) => {
      queue.push((ctx) => {
        const [payload, ...rest] = factory(ctx);
        resolve(payload);
        return rest;
      });
      dispatch('RESTART_REQUIRED');
    });
  };

  // const accessContext = () => {};

  return { registerNode, start };
};

export default useAudioRoot;
