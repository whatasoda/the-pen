import React from 'react';
import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three';
import { useScene } from '../../canvas';
import { useEffectStateDynamic } from '../../utils/useEffectState';
import { createSoundBall } from '../../core/motion';
import { PinAttributes } from '../../nodes/Pin';
import { NoteAttributes } from '../../nodes/Note';

export interface PinProps extends PinAttributes, NoteAttributes {
  color: number;
}

const Pin = ({ radius, position, color, ...rest }: PinProps) => {
  const [scene] = useScene();
  useEffectStateDynamic(
    () => {
      const material = new MeshBasicMaterial({ color, wireframe: true });
      const mesh = new Mesh(new SphereGeometry(1, 10, 5), material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.position.multiplyScalar(Math.cos(radius));
      mesh.scale.set(1, 1, 0.01).multiplyScalar(2 * Math.sin(radius / 2));
      mesh.lookAt(0, 0, 0);
      scene.add(mesh);
      return { mesh, material };
    },
    ({ mesh, material }) => {
      const { pin, destroy } = createSoundBall({ position, radius }, rest);
      pin.addEventListener('update', ({ value: { velocity } }) => {
        material.color;
        mesh.scale.z = velocity[0] || 0.00001;
      });

      return () => {
        destroy();
      };
    },
    [],
  );

  return <></>;
};

export default Pin;
