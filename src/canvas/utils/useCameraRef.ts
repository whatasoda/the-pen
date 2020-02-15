import { useRef, useEffect } from 'react';
import { SharedCanvasContext } from 'react-three-fiber';

export default function useCameraRef(three: SharedCanvasContext) {
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  useEffect(() => void (cameraRef.current && three.setDefaultCamera(cameraRef.current)), [three.gl]);

  return cameraRef;
}
