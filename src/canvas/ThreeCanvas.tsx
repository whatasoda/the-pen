import React, { useMemo, useEffect, useState, ReactNode } from 'react';
import styled from 'styled-components';
import { WebGLRenderer, PerspectiveCamera } from 'three';
import { CameraFactory, CanvasInternal, AnySceneRegistration, ThreeCanvasUniforms, MutableContainer } from './decls';
import { useCanvasInternal, useCamera } from './shared';

const DEFAULT_CAMERA_FACTORY: CameraFactory<any> = (canvas) => {
  const camera = new PerspectiveCamera(120, canvas.width / canvas.height, 0.0001, 1000);
  camera.addEventListener('resize', () => {
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
  });
  return camera;
};

interface ThreeCanvasProps {
  fallback?: ReactNode;
  children?: ReactNode;
}

const createThreeCanvas = <P extends object>(uniforms: ThreeCanvasUniforms<P>) => {
  const {
    rendererParameters,
    Canvas = DefaultCanvas,
    Wrapper = DefaultWrapper,
    defaultCameraFactory = DEFAULT_CAMERA_FACTORY,
  } = uniforms;

  return function ThreeCanvas({ children, fallback, ...currentProps }: ThreeCanvasProps & P) {
    const [internal, setInternal] = useState<CanvasInternal | null>(null);
    const [flags, props, canvasRef] = useMemo(() => {
      const flags = { resized: true };
      const props: MutableContainer<P> = { current: currentProps as P };
      const scenes = new Set<AnySceneRegistration>();

      const canvasRef = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const renderer = new WebGLRenderer({ canvas, ...rendererParameters });
        const defaultCamera = defaultCameraFactory(canvas, props);
        setInternal({ scenes, three: { canvas, renderer, defaultCamera } });
      };

      return [flags, props, canvasRef] as const;
    }, []);
    props.current = currentProps as P;

    useEffect(() => {
      if (!internal) return;
      let unmount = false;

      const tick = () => {
        if (unmount) return;
        requestAnimationFrame(tick);

        const { renderer, defaultCamera, canvas } = internal.three;
        const resizeEvent = flags.resized ? { type: 'resize' } : null;
        if (resizeEvent) {
          const width = (canvas.width = canvas.clientWidth);
          const height = (canvas.height = canvas.clientHeight);
          renderer.setSize(width, height);
          defaultCamera.dispatchEvent(resizeEvent);
        }

        uniforms.beforeRender?.(renderer, props.current);

        internal.scenes.forEach(({ beforeRender, afterRender, scene, camera = defaultCamera, props }) => {
          if (resizeEvent && camera !== defaultCamera) camera.dispatchEvent(resizeEvent);
          const params = { scene, camera, props };
          beforeRender?.(renderer, params);
          renderer.render(scene, camera);
          afterRender?.(renderer, params);
        });

        uniforms.afterRender?.(renderer, props.current);
        flags.resized = false;
      };

      tick();
      return () => {
        unmount = true;
      };
    }, [internal]);

    useEffect(() => {
      if (!internal) return;

      const handleResize = () => (flags.resized = true);

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        internal?.scenes.clear();
      };
    }, [internal]);

    return (
      <Wrapper>
        <Canvas ref={internal ? undefined : canvasRef} />
        <useCamera.context.Provider value={internal?.three.defaultCamera || null}>
          <useCanvasInternal.context.Provider value={internal} children={internal ? children : fallback} />
        </useCamera.context.Provider>
      </Wrapper>
    );
  };
};

const DefaultCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -100;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const DefaultWrapper = styled.div``;

export default createThreeCanvas;
