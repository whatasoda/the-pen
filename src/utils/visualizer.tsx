import styled from 'styled-components';
import {
  ArrowHelper,
  Vector3,
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  OrthographicCamera,
} from 'three';
import React, { useMemo, forwardRef, useEffect, useRef, useImperativeHandle, memo } from 'react';
import { vec3 } from 'gl-matrix';

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
        const entry = (label: string, color: number, values: vec3) => {
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

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      canvas.width = width;
      canvas.height = height;

      const scene = new Scene();
      scene.modelViewMatrix.identity();
      const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(2, 0, 0);
      camera.lookAt(0, 0, 0);
      const renderer = new WebGLRenderer({ canvas, preserveDrawingBuffer: true });
      renderer.autoClearColor = false;

      const bgCamera = new OrthographicCamera(0, width, height, 0, 0, 1000);
      const bgScene = new Scene();
      const geometry = new PlaneGeometry(width, height, 10, 10);
      const material = new MeshBasicMaterial({
        color: 0,
        transparent: true,
        opacity: 0.1,
      });
      const bg = new Mesh(geometry, material);
      bg.position.x = width / 2;
      bg.position.y = height / 2;
      bgScene.add(bg);

      const render = () => {
        Object.entries(INTERNAL.entries).forEach(([key, { values, color }]) => {
          if (!INTERNAL.helpers[key]) {
            const vec = new Vector3(...values);
            const length = vec.length();
            vec.normalize();
            const helper = new ArrowHelper(vec, ORIGIN, length, color);
            helper;
            scene.add(helper);

            INTERNAL.helpers[key] = [vec, helper];
          }
          const [vec, helper] = INTERNAL.helpers[key];
          const length = Math.max(vec.set(values[0], values[1], values[2]).length(), 0.0001);
          helper.setLength(length);
          helper.setDirection(vec.normalize());
        });
        renderer.render(bgScene, bgCamera);
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
