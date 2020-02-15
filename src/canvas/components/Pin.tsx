import React, { useRef, useEffect } from 'react';
import { NoteAttributes } from '../../nodes/Note';
import { PinAttributes } from '../../nodes/Pin';
import MotionTree from '../../core/motion';

export interface PinProps {
  tree: MotionTree;
  pinAttr: PinAttributes;
  noteAttr: NoteAttributes;
  color: number;
}

export default function Pin({ color, tree, pinAttr, noteAttr }: PinProps) {
  const meshRef = useRef<THREE.Mesh>();
  useEffect(() => {
    const [pin, destroy] = tree.registerNote(pinAttr, noteAttr);
    pin.addEventListener('update', ({ value: { velocity } }) => {
      if (!meshRef.current) return;
      // meshRef.current.scale.z = velocity[0] || 0.00001;
      velocity[0];
    });
    return () => void destroy();
  }, []);

  return (
    <mesh
      ref={(mesh: THREE.Mesh | null) => {
        if (!mesh) return;
        mesh.position.fromArray(pinAttr.position);
        mesh.position.multiplyScalar(Math.cos(pinAttr.radius));
        mesh.scale.set(1, 1, 0.01).multiplyScalar(2 * Math.sin(pinAttr.radius / 2));
        mesh.lookAt(0, 0, 0);
        meshRef.current = mesh;
      }}
    >
      <dodecahedronBufferGeometry attach="geometry" args={[1, 2]} />
      <meshBasicMaterial attach="material" args={[{ color, wireframe: true }]} />
    </mesh>
  );
}
