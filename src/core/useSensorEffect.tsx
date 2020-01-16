import React, { useContext, createContext, FC, useMemo, useEffect } from 'react';
import { vec3 } from 'gl-matrix';
import { eulerToArray, cartesianToArray } from '../utils/converter';
import createDriftTuner from '../utils/driftTuner';

type OrientationEvent = WindowEventMap['deviceorientation'];
type MotionEvent = WindowEventMap['devicemotion'];

interface SensorState {
  dt: number;
  orientation: vec3;
  rotationRate: vec3;
  acceleration: vec3;
}
type SensorCallback = (state: Readonly<SensorState>) => void;

const useSensorEffect = (factory: () => SensorCallback, input: any[]) => {
  const registry = useContext(useSensorEffect.context);
  useEffect(() => {
    const callback = factory();
    registry.add(callback);
    return () => {
      registry.delete(callback);
    };
  }, input);
};
useSensorEffect.context = createContext<Set<SensorCallback>>(null as any);

export const SensorProvider: FC = ({ children }) => {
  const { registry, dispatch, handleOrientation, handleMotion } = useMemo(() => {
    const registry = new Set<SensorCallback>();

    const orientation = vec3.create();
    const rotationRate = vec3.create();
    const acceleration = vec3.create();

    const rotationDrift = vec3.create();
    const accelerationDrift = vec3.create();
    const updateRotationDrift = createDriftTuner(60, (next) => vec3.copy(rotationDrift, next));
    const updateAccelerationDrift = createDriftTuner(60, (next) => vec3.copy(accelerationDrift, next));
    const handleOrientation = ({ alpha, beta, gamma }: OrientationEvent) => {
      eulerToArray.set(orientation, { alpha, beta, gamma });
    };

    const handleMotion = (event: MotionEvent) => {
      if (!event.rotationRate || !event.acceleration) return;
      eulerToArray.set(rotationRate, event.rotationRate);
      cartesianToArray.set(acceleration, event.acceleration);
      updateAccelerationDrift(acceleration);
      updateRotationDrift(rotationRate);
      vec3.sub(rotationRate, rotationRate, rotationDrift);
      vec3.sub(acceleration, acceleration, accelerationDrift);
      state.dt = event.interval;
    };

    const state: SensorState = { orientation, rotationRate, acceleration, dt: 1 / 60 };
    const dispatch = () => registry.forEach((callback) => callback(state));
    return { registry, dispatch, handleOrientation, handleMotion };
  }, []);

  useEffect(() => {
    let alive = true;

    const update = () => {
      if (!alive) return;
      dispatch();
      requestAnimationFrame(update);
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    update();
    return () => {
      alive = false;
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return <useSensorEffect.context.Provider value={registry} children={children} />;
};

export default useSensorEffect;
