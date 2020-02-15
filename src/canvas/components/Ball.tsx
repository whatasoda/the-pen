import React from 'react';

export default function Ball() {
  return (
    <mesh>
      <dodecahedronBufferGeometry attach="geometry" args={[1, 3]} />
      <meshBasicMaterial
        attach="material"
        args={[
          {
            color: 0x00aaaa,
            transparent: true,
            opacity: 0.8,
            wireframe: true,
          },
        ]}
      />
    </mesh>
  );
}
