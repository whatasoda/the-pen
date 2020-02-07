import React, { useRef, useMemo, useEffect } from 'react';
import MotionTree from '../../core/motion';
import { useThree } from 'react-three-fiber';

interface TravelerProps {
  tree: MotionTree;
  FOV: number;
  position: [number, number, number];
}

export default function Traveler({ tree, FOV, position }: TravelerProps) {
  const three = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const travelerRef = useRef<THREE.Group>();
  const centerRef = useRef<THREE.Mesh>();

  const [scaledPosition, far] = useMemo(() => {
    const radius = 1 / Math.cos((Math.PI * (180 - FOV)) / 360) + 0.01;
    const far = radius * 2;
    return [position.map((v) => v * radius) as typeof position, far];
  }, [FOV]);

  useEffect(() => {
    if (cameraRef.current) {
      three.setDefaultCamera(cameraRef.current);
    }
    if (!travelerRef.current) return;
    const traveler = travelerRef.current;

    let currPower = 0;
    tree.motion.addEventListener('update', ({ value: { power, axis, leg } }) => {
      currPower = power[0];
      traveler.up.fromArray(leg);
      traveler.lookAt(axis[0], axis[1], axis[2]);

      if (centerRef.current) {
        const radius = Math.abs(currPower);
        const actualRadius = Math.sin(radius);
        centerRef.current.position.z = Math.cos(radius);
        centerRef.current.scale.set(actualRadius, actualRadius, 0.01);
        [centerRef.current.material].flat<THREE.Material>()[0].color.set(currPower > 0 ? 0xffffff : 0x0000ff);
      }
    });
  }, []);

  return (
    <group ref={travelerRef}>
      <perspectiveCamera
        fov={FOV}
        near={0.01}
        far={far}
        aspect={three.aspect}
        up={[0, 0, 1]}
        position={scaledPosition}
        ref={(camera: THREE.PerspectiveCamera | null) => {
          cameraRef.current = camera || undefined;
          camera?.lookAt(0, 0, 0);
        }}
      />
      <mesh ref={centerRef} position={[0, 0, 1]}>
        <dodecahedronGeometry attach="geometry" args={[1, 3]} />
        <meshBasicMaterial attach="material" color="#ffffff" />
      </mesh>
    </group>
  );
}
