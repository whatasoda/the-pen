import { useContext, createContext, useMemo, useEffect } from 'react';
import { CanvasInternal, EmptyFunction, TickObject } from './decls';

export const useCanvasInternal = () => useContext(useCanvasInternal.context);
useCanvasInternal.context = createContext<CanvasInternal | null>(null);

// export const useScene = () => useContext(useScene.context);
// useScene.context = createContext<THREE.Scene | null>(null);

export const useCamera = () => useContext(useCamera.context);
useCamera.context = createContext<THREE.Camera | null>(null);

const DEFAULT_TICK = () => {};
export const useScene = () => {
  const value = useContext(useScene.context);
  if (!value) throw new Error('"useScene" have to be used under a "Scene" element.');
  const [scene, ticks] = value;
  const [tickObject, tick] = useMemo(() => {
    const tickObject = { curr: DEFAULT_TICK };
    const setTick = (next: EmptyFunction | null) => (tickObject.curr = next || DEFAULT_TICK);
    return [tickObject, setTick] as const;
  }, [ticks]);

  useEffect(() => {
    ticks.add(tickObject);
    return () => void ticks.delete(tickObject);
  }, [tickObject]);

  return [scene, tick] as const;
};
useScene.context = createContext<readonly [THREE.Scene, Set<TickObject>] | null>(null);
