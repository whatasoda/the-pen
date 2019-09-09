import styled from 'styled-components';
import { ArrowHelper, Vector3, Scene, WebGLRenderer, PerspectiveCamera } from 'three';
import React, { useMemo, forwardRef, useEffect, useRef, useImperativeHandle, memo } from 'react';

const ORIGIN = new Vector3(0, 0, 0);

const Visualizer = memo(
  forwardRef<VisualizerHandle>((_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const INTERNAL = useMemo(
      () => ({
        entries: {} as Record<string, VisualizerEntry>,
        helpers: {} as Record<string, [Vector3, ArrowHelper]>,
      }),
      [],
    );
    useImperativeHandle(
      ref,
      () => {
        const entry = (label: string, color: number, values: V3) => {
          INTERNAL.entries[label] = { color, values };
        };
        return { entry };
      },
      [],
    );

    useEffect(() => {
      const { current: canvas } = canvasRef;
      if (!canvas) return;
      let alive = true;

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const scene = new Scene();
      const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(2, 2, 2);
      camera.lookAt(0, 0, 0);
      const renderer = new WebGLRenderer({ canvas });
      renderer.setClearColor(0x666666);

      const render = () => {
        Object.entries(INTERNAL.entries).forEach(([key, { values, color }]) => {
          if (!INTERNAL.helpers[key]) {
            const vec = new Vector3(...values);
            const length = vec.length();
            vec.normalize();
            const helper = new ArrowHelper(vec, ORIGIN, length, color);
            scene.add(helper);

            INTERNAL.helpers[key] = [vec, helper];
          }
          const [vec, helper] = INTERNAL.helpers[key];
          const length = vec.set(...values).length();
          helper.setLength(length);
          helper.setDirection(vec.normalize());
        });
        renderer.render(scene, camera);

        if (alive) requestAnimationFrame(render);
      };
      render();

      return () => {
        alive = false;
      };
    }, []);

    return <Canvas ref={canvasRef} />;
  }),
);

const Canvas = styled.canvas`
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: -1;
`;

export default Visualizer;
