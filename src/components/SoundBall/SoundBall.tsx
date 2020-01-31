import React, { useMemo } from 'react';
import { PerspectiveCamera, Mesh, DodecahedronGeometry, MeshBasicMaterial } from 'three';
import { ball, pitch } from '../../core/motion';
import { useScene, useCamera, createSceneComponent } from '../../canvas';
import { useEffectStateDynamic } from '../../utils/useEffectState';
import Pin, { PinProps } from './Pin';

const calcCameraRadius = (FOV: number) => 1 / Math.cos((Math.PI * (180 - FOV)) / 360) + 0.01;

const INITIAL_POWER = -0.05;

interface SoundBallProps {
  FOV: number;
  pins: PinProps[];
}

const SoundBallScene = createSceneComponent<SoundBallProps>({
  createCamera: (canvas, { current: { FOV } }) => {
    const camera = new PerspectiveCamera(FOV, canvas.width / canvas.height, 0.01, calcCameraRadius(FOV) * 2);
    camera.addEventListener('resize', () => {
      camera.aspect = canvas.width / canvas.height;
      camera.updateProjectionMatrix();
    });
    return camera;
  },
});

const SoundBallComponent = ({ FOV }: SoundBallProps) => {
  const [scene] = useScene();
  const camera = useCamera()!;
  useEffectStateDynamic(
    () => {
      const cameraRadius = calcCameraRadius(FOV);
      const mesh = new Mesh(
        new DodecahedronGeometry(1, 2),
        new MeshBasicMaterial({
          color: 0x00aaaa,
          transparent: true,
          opacity: 0.5,
          wireframe: true,
        }),
      );

      const centerMaterial = new MeshBasicMaterial({ color: 0xffffff, opacity: 1 });
      const center = new Mesh(new DodecahedronGeometry(1, 3), centerMaterial);
      scene.add(mesh);
      scene.add(center);
      camera.position.set(cameraRadius, 0, 0);
      camera.lookAt(0, 0, 0);

      const radius = Math.abs(INITIAL_POWER);
      const actualRadius = Math.sin(radius);
      center.position.set(Math.cos(radius), 0, 0);
      center.lookAt(0, 0, 0);
      center.scale.set(actualRadius, actualRadius, 0.0001);

      return { cameraRadius, mesh, centerMaterial, center };
    },
    ({ cameraRadius, center, centerMaterial }) => {
      let power = INITIAL_POWER;
      pitch.addEventListener('power', ({ value }) => (power = value.power));
      ball.addEventListener('update', ({ value: { axis, leg } }) => {
        camera.position.set(axis[0], axis[1], axis[2]);
        camera.position.multiplyScalar(cameraRadius);
        camera.lookAt(0, 0, 0);
        camera.up.set(leg[0], leg[1], leg[2]);

        const radius = Math.abs(power);
        center.position.set(axis[0], axis[1], axis[2]);
        center.position.multiplyScalar(Math.cos(radius));
        const actualRadius = Math.sin(radius);
        center.scale.set(actualRadius, actualRadius, 0.01);
        center.lookAt(0, 0, 0);
        centerMaterial.color.set(power > 0 ? 0xffffff : 0x0000ff);
      });
    },
    [],
  );

  return <></>;
};

const SoundBall = (props: SoundBallProps) => {
  const { pins } = props;
  const pinElements = useMemo(() => {
    return pins.map((pinProps, key) => <Pin key={key} {...pinProps} />);
  }, [pins]);

  return (
    <SoundBallScene {...props}>
      <SoundBallComponent {...props} />
      {pinElements}
    </SoundBallScene>
  );
};

export default SoundBall;
