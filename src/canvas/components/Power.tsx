import React, { useRef, useEffect } from 'react';
import useMotion from '../utils/useMotion';

interface PowerProps {
  position: [number, number, number];
}

export default function Power({ position }: PowerProps) {
  const motion = useMotion();
  const scaleRef = useRef<THREE.Group>();
  const meshRef = useRef<THREE.Mesh>();
  const materialRef = useRef<THREE.MeshBasicMaterial>();

  useEffect(() => {
    const mesh = meshRef.current!;
    const scale = scaleRef.current!;
    const material = materialRef.current!;
    scale.scale.set(0.1, 0.1, 0.1);

    motion.addEventListener('update', ({ value: { power } }) => {
      const currPower = power[0];
      const radius = Math.abs(currPower);
      const s = Math.cos(radius);
      const actualRadius = s ? Math.sin(radius) / s : Math.sin(radius);
      scale.scale.set(s, s, s);
      mesh.scale.set(actualRadius, actualRadius, actualRadius);
      material.color.set(currPower > 0 ? 0xffffff : 0x9999ff);
    });
  }, []);

  return (
    <group ref={scaleRef}>
      <mesh ref={meshRef} position={position}>
        <dodecahedronGeometry attach="geometry" args={[1, 3]} />
        <meshBasicMaterial attach="material" ref={materialRef} color="#ffffff" />
      </mesh>
    </group>
  );
}
