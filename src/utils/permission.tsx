import React, { createContext, useState, useMemo, FC, useContext } from 'react';

type WithRequestPermission<T> = T & {
  requestPermission?: () => void;
};

declare global {
  interface Window {
    DeviceMotionEvent: WithRequestPermission<typeof DeviceMotionEvent>;
    DeviceOrientationEvent: WithRequestPermission<typeof DeviceOrientationEvent>;
  }
}

const deviceMotion = () => {
  if (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function') {
    return window.DeviceMotionEvent.requestPermission();
  }
};

const deviceOrientation = () => {
  if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
    return window.DeviceOrientationEvent.requestPermission();
  }
};

export const requestPermission = {
  deviceMotion,
  deviceOrientation,
};

const usePermissionRequest = () => useContext(usePermissionRequest.context);
usePermissionRequest.context = createContext<undefined | (() => Promise<void>)>(undefined);

export const PermissionRequestProvider: FC = ({ children }) => {
  const [hasPermisson, setHasPermission] = useState(false);

  const request = useMemo(() => {
    return async () => {
      try {
        await deviceMotion();
        await deviceOrientation();
        setHasPermission(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    };
  }, []);

  return <usePermissionRequest.context.Provider value={hasPermisson ? undefined : request} children={children} />;
};

export default usePermissionRequest;
