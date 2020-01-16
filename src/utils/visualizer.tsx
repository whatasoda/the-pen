import styled from 'styled-components';
import {
  ArrowHelper,
  Vector3,
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  DodecahedronGeometry,
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  Group,
} from 'three';
import React, { useMemo, forwardRef, useEffect, useRef, useImperativeHandle, memo } from 'react';
import { vec3 } from 'gl-matrix';

const ORIGIN = new Vector3(0, 0, 0);

interface Handle extends VisualizerHandle {
  entries: Record<string, VisualizerEntry>;
  helpers: Record<string, [Vector3, ArrowHelper]>;
  pins: Mesh[];
  axis: vec3 | null;
  arm: vec3 | null;
  leg: vec3 | null;
}

const FOV = 50;
const camRadius = 1 / Math.cos((Math.PI * (180 - FOV)) / 360) + 0.01;

const Visualizer = memo(
  forwardRef<Handle>((_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const INTERNAL = useMemo<Handle>(() => {
      const showVector = (label: string, color: number, values: vec3) => {
        INTERNAL.entries[label] = { color, values };
      };
      const setBall = (axis: vec3, arm: vec3, leg: vec3) => {
        if (INTERNAL.axis) return;
        INTERNAL.axis = axis;
        INTERNAL.arm = arm;
        INTERNAL.leg = leg;
      };
      const showPin = (pos: vec3, radius: number) => {
        const pin = new Mesh(
          new SphereGeometry(2 * Math.sin(radius / 2), 10, 5),
          new MeshBasicMaterial({ color: 0xffff00, wireframe: true }),
        );
        pin.position.set(pos[0], pos[1], pos[2]);
        pin.position.multiplyScalar(Math.cos(radius));
        pin.scale.set(1, 1, 0.01);
        pin.lookAt(0, 0, 0);
        pins.push(pin);
      };
      const pins: Mesh[] = [];
      return { showVector, setBall, pins, showPin, entries: {}, helpers: {}, arm: null, axis: null, leg: null };
    }, []);
    useImperativeHandle(ref, () => INTERNAL, []);

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
      const camera = new PerspectiveCamera(FOV, width / height, 0.01, camRadius * 2);
      camera.position.set(camRadius, 0, 0);
      camera.lookAt(0, 0, 0);
      const renderer = new WebGLRenderer({ canvas, preserveDrawingBuffer: true });
      // const updateBackground = createBackground({ height, width, opacity: 0.1 }, renderer);

      const Ball = new Group();
      Ball.add(
        new Mesh(
          new DodecahedronGeometry(1, 2),
          new MeshBasicMaterial({
            color: 0x00aaaa,
            transparent: true,
            opacity: 0.5,
            wireframe: true,
          }),
        ),
      );
      // Ball.add(
      //   ...(() => {
      //     const x = new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 0xff0000 }));
      //     const y = new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 0x00ff00 }));
      //     const z = new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 0x0000ff }));
      //     x.position.x = y.position.y = z.position.z = 1.5;
      //     return [x, y, z];
      //   })(),
      // );
      scene.add(Ball);

      const render = () => {
        if (alive) requestAnimationFrame(render);

        const { axis, leg, pins, entries, helpers } = INTERNAL;
        if (axis && leg) {
          camera.position.set(axis[0], axis[1], axis[2]);
          camera.position.multiplyScalar(camRadius);
          camera.lookAt(0, 0, 0);
          camera.up.set(leg[0], leg[1], leg[2]);
        }

        while (pins.length) {
          const pin = pins.pop()!;
          Ball.add(pin);
        }

        Object.entries(entries).forEach(([key, { values, color }]) => {
          if (!INTERNAL.helpers[key]) {
            const vec = new Vector3(...values);
            const length = vec.length();
            vec.normalize();
            const helper = new ArrowHelper(vec, ORIGIN, length, color);
            helper;
            scene.add(helper);

            INTERNAL.helpers[key] = [vec, helper];
          }
          const [vec, helper] = helpers[key];
          const length = Math.max(vec.set(values[0], values[1], values[2]).length(), 0.0001);
          helper.setLength(length);
          helper.setDirection(vec.normalize());
        });
        // updateBackground();
        renderer.render(scene, camera);
      };
      render();

      return () => {
        alive = false;
      };
    }, []);

    return (
      <>
        <Canvas ref={canvasRef} />
        <Dot />
      </>
    );
  }),
);

// const createBackground = (
//   { height, opacity, width }: { width: number; height: number; opacity: number },
//   renderer: WebGLRenderer,
// ) => {
//   renderer.autoClearColor = false;
//   const camera = new OrthographicCamera(0, width, height, 0, 0, 1000);
//   const scene = new Scene();
//   const bg = new Mesh(
//     new PlaneGeometry(width, height, 10, 10),
//     new MeshBasicMaterial({ color: 0, transparent: true, opacity }),
//   );
//   bg.position.x = width / 2;
//   bg.position.y = height / 2;
//   scene.add(bg);

//   return () => renderer.render(scene, camera);
// };

const Canvas = styled.canvas`
  position: fixed;
  width: 100vw;
  height: 100vw;
  z-index: -1;
  top: 0;
  bottom: 0;
  margin: auto;
`;

const Dot = styled.div`
  position: fixed;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  background-color: #fff;
`;

export default Visualizer;
