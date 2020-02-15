import React, { useMemo, useEffect } from 'react';
import useCameraRef from '../utils/useCameraRef';
import { useThree } from 'react-three-fiber';

interface CustomCameraProps {
  fov: number;
  near?: number;
  position: [number, number, number];
  up: [number, number, number];
}

export default function CustomCamera({ fov, position, up, near }: CustomCameraProps) {
  const three = useThree();
  const cameraRef = useCameraRef(three);

  const [scale, far] = useMemo(() => {
    const radius = 1 / Math.cos((Math.PI * (180 - fov)) / 360) + 0.2;
    const far = radius;
    return [[radius, radius, radius], far];
  }, [fov]);

  useEffect(() => {
    const camera = cameraRef.current!;
    camera.lookAt(0, 0, 0);
  }, position);

  return (
    <group scale={scale}>
      <perspectiveCamera
        ref={cameraRef}
        aspect={three.aspect}
        fov={fov}
        near={near === undefined ? 0.01 : far * near}
        far={far}
        up={up}
        position={position}
      />
    </group>
  );
}
