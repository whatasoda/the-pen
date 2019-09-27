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
  if (
    window.DeviceMotionEvent &&
    window.DeviceMotionEvent.requestPermission &&
    typeof window.DeviceMotionEvent.requestPermission === 'function'
  ) {
    return window.DeviceMotionEvent.requestPermission();
  }
};

const deviceOrientation = () => {
  if (
    window.DeviceOrientationEvent &&
    window.DeviceOrientationEvent.requestPermission &&
    typeof window.DeviceOrientationEvent.requestPermission === 'function'
  ) {
    return window.DeviceOrientationEvent.requestPermission();
  }
};

const requestPermission = {
  deviceMotion,
  deviceOrientation,
};

export default requestPermission;
