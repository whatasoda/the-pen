import { vec3, quat } from 'gl-matrix';
import { useEffect } from 'react';

export type GlobalMotion = {
  acceleration: [number, number, number];
  interval: number;
};
export type GlobalMotionListener = (motion: GlobalMotion) => void;

const euler = vec3.create();
const acceleration = vec3.create();
const rotation = quat.create();
const listeners = new Set<GlobalMotionListener>();

let moduleCount = 0;

const useGlobalMotion = (listener: GlobalMotionListener) => {
  useEffect(() => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [listener]);
};

useGlobalMotion.useModule = () => {
  useEffect(() => {
    if (!moduleCount++) {
      window.addEventListener('devicemotion', motionHandler);
      window.addEventListener('deviceorientation', orientationHandler);
    }
    return () => {
      if (!moduleCount--) {
        window.removeEventListener('devicemotion', motionHandler);
        window.removeEventListener('deviceorientation', orientationHandler);
      }
    };
  }, []);
};

const orientationHandler = (event: DeviceOrientationEvent) => {
  const { alpha, beta, gamma } = event;
  vec3.set(euler, alpha || 0, beta || 0, gamma || 0);
};

const motionHandler = (event: DeviceMotionEvent) => {
  const { interval } = event;
  const { x, y, z } = event.acceleration || { x: 0, y: 0, z: 0 };
  const [eZ, eX, eY] = euler;
  /**
   * We want to apply invert rotation to acceleration.
   * Euler order of `DeviceMotionEventRotationRate` is Z-X-Y.
   */
  quat.fromEuler(rotation, -eY, -eX, -eZ);
  const [aX, aY, aZ] = vec3.transformQuat(acceleration, [y || 0, x || 0, z || 0], rotation);

  listeners.forEach((listener) => listener({ acceleration: [aX, aY, aZ], interval }));
};

export default useGlobalMotion;
