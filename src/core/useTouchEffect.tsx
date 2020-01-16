import React, { createContext, FC, useMemo, useContext, useEffect } from 'react';
import { vec2 } from 'gl-matrix';

export interface TouchState {
  movement: vec2;
  activity: boolean;
}
type TouchCallback = (state: Readonly<TouchState>) => void;

const useTouchEffect = (factory: () => TouchCallback, input: any[]) => {
  const registry = useContext(useTouchEffect.context);
  useEffect(() => {
    const callback = factory();
    registry.add(callback);
    return () => {
      registry.delete(callback);
    };
  }, input);
};
useTouchEffect.context = createContext<Set<TouchCallback>>(null as any);

export const TouchEffectProvider: FC = ({ children }) => {
  const { registry, dispatch, handleStart, handleMove, handleEnd } = useMemo(() => {
    const registry = new Set<TouchCallback>();
    const state: TouchState = { activity: false, movement: vec2.create() };

    const prev = vec2.create();
    const curr = vec2.create();
    let target: null | number = null;
    let targetIndex = -1;
    const updateTargetIdx = (e: TouchEvent) => {
      targetIndex = Array.from(e.touches).findIndex(({ identifier }) => target === identifier);
    };
    const handleStart = (e: TouchEvent) => {
      if (state.activity) return;
      const { identifier, clientX, clientY } = e.changedTouches[0];
      target = identifier;
      updateTargetIdx(e);
      vec2.set(curr, clientX, clientY);
      vec2.copy(prev, curr);
      state.activity = true;
    };
    const handleMove = (e: TouchEvent) => {
      if (!state.activity) return;
      const { clientX, clientY } = e.touches[targetIndex];
      vec2.set(curr, clientX, clientY);
    };
    const handleEnd = (e: TouchEvent) => {
      if (!state.activity) return;
      const { identifier } = e.changedTouches[0];
      if (target !== identifier) return;
      target = null;
      updateTargetIdx(e);
      state.movement.fill(0);
      state.activity = false;
    };

    const dispatch = () => {
      if (state.activity) {
        vec2.sub(state.movement, curr, prev);
        vec2.copy(prev, curr);
      }
      registry.forEach((callback) => callback(state));
    };
    return { registry, dispatch, handleStart, handleMove, handleEnd };
  }, []);

  useEffect(() => {
    let alive = true;
    const update = () => {
      if (!alive) return;
      dispatch();
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('touchstart', handleStart);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
    return () => {
      alive = false;
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, []);

  return <useTouchEffect.context.Provider value={registry} children={children} />;
};

export default useTouchEffect;
