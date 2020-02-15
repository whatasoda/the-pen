import React, { useEffect } from 'react';
import { useThree } from 'react-three-fiber';
import useCameraRef from '../utils/useCameraRef';
import useMotion from '../utils/useMotion';

// interface HostCameraProps {}

export default function HostCamera() {
  const motion = useMotion();
  const three = useThree();
  const cameraRef = useCameraRef(three);

  useEffect(() => {
    const camera = cameraRef.current!;
    motion.addEventListener('update', ({ value: { leg, axis } }) => {
      camera.up.fromArray(axis);
      camera.lookAt(leg[0], leg[1], leg[2]);
    });
  }, []);

  return <perspectiveCamera ref={cameraRef} near={0.01} fov={100} far={5} aspect={three.aspect} position={[0, 0, 0]} />;
}
