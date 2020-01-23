import React, { useMemo, useEffect, ReactNode } from 'react';
import * as THREE from 'three';
import { SceneUniforms, SceneRegistration, TickCallback, SceneCallbackParam, TickObject } from './decls';
import { useCanvasInternal, useScene, useCamera } from './shared';

const createSceneComponent = <P extends object>(uniforms: SceneUniforms<P>) => {
  const { createCamera } = uniforms;
  return function Scene({ children, ...currentProps }: P & { children?: ReactNode }) {
    const internal = useCanvasInternal();
    if (!internal) throw new Error('"Scene" component have to be under a "ThreeCanvas" element.');
    const [registration, sceneValue] = useMemo(() => {
      const props = { current: currentProps as P };
      const scene = new THREE.Scene();
      const camera = createCamera?.(internal.three.canvas, props);
      const beforeRender: TickCallback<SceneCallbackParam<P>> = (...args) => {
        uniforms.beforeRender?.(...args);
        ticks.forEach(({ curr }) => curr());
      };
      const afterRender: TickCallback<SceneCallbackParam<P>> = (...args) => {
        uniforms.afterRender?.(...args);
      };

      const registration: SceneRegistration<P> = { scene, camera, props, beforeRender, afterRender };
      const ticks = new Set<TickObject>();

      return [registration, [scene, ticks]] as const;
    }, [internal]);

    if (registration) registration.props.current = currentProps as P;

    useEffect(() => {
      internal.scenes.add(registration);
      return () => {
        internal.scenes.delete(registration);
      };
    }, [internal, registration]);

    return (
      <useScene.context.Provider value={sceneValue}>
        {registration.camera ? (
          <useCamera.context.Provider value={registration.camera} children={children} />
        ) : (
          children
        )}
      </useScene.context.Provider>
    );
  };
};

export default createSceneComponent;
