import React, { useContext, createContext, FC, useMemo, useEffect } from 'react';
import { vec3 } from 'gl-matrix';
import { eulerToArray, cartesianToArray } from '../utils/converter';

type OrientationEvent = WindowEventMap['deviceorientation'];
type MotionEvent = WindowEventMap['devicemotion'];

interface SensorState {
  dt: number;
  orientation: vec3;
  rotationRate: vec3;
  acceleration: vec3;
}
type SensorCallback = (state: Readonly<SensorState>) => void;

interface SensorContextValue {
  registry: Set<SensorCallback>;
  resetOffset: () => void;
}

const useSensorEffect = (factory: () => SensorCallback, input: any[]) => {
  const { registry, resetOffset } = useContext(useSensorEffect.context);
  useEffect(() => {
    const callback = factory();
    registry.add(callback);
    return () => {
      registry.delete(callback);
    };
  }, input);
  return resetOffset;
};
useSensorEffect.context = createContext<SensorContextValue>(null as any);

export const SensorProvider: FC = ({ children }) => {
  const { value, dispatch, resetOffset, handleOrientation, handleMotion } = useMemo(() => {
    const registry = new Set<SensorCallback>();

    const orientation = vec3.create();
    const rotationRate = vec3.create();
    const acceleration = vec3.create();

    const orientationOffset = vec3.create();
    const resetOffset = () => ((orientationOffset[0] = orientation[0]), void 0);
    const handleOrientation = ({ alpha, beta, gamma }: OrientationEvent) => {
      eulerToArray.set(orientation, { alpha, beta, gamma });
      vec3.sub(orientation, orientation, orientationOffset);
    };

    const handleMotion = (event: MotionEvent) => {
      if (!event.rotationRate || !event.acceleration) return;
      eulerToArray.set(rotationRate, event.rotationRate);
      cartesianToArray.set(acceleration, event.acceleration);
      state.dt = event.interval;
    };

    const state: SensorState = { orientation, rotationRate, acceleration, dt: 1 / 60 };
    const value: SensorContextValue = { registry, resetOffset };
    const dispatch = () => registry.forEach((callback) => callback(state));
    return { value, dispatch, resetOffset, handleOrientation, handleMotion };
  }, []);

  useEffect(() => {
    let alive = true;

    const effect = () => {
      if (!alive) return;
      dispatch();
      requestAnimationFrame(effect);
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('deviceorientation', resetOffset, { once: true });
    effect();
    return () => {
      alive = false;
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return <useSensorEffect.context.Provider value={value} children={children} />;
};

export default useSensorEffect;
