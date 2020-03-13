import React, { PropsWithChildren, useRef, useEffect } from 'react';
import useMotion from '../utils/useMotion';
import { Matrix4 } from 'three';
import { mat3 } from 'gl-matrix';

interface CoordProps {
  type: 'swipe' | 'tilt' | 'coord' | 'hostswipe';
  invert?: boolean;
  transpose?: boolean;
  order?: 'xyz';
}

export default function Coord({ type, invert, transpose, children }: PropsWithChildren<CoordProps>) {
  const motion = useMotion();
  const containerRef = useRef<THREE.Group>();

  useEffect(() => {
    const container = containerRef.current!;
    const matrix = new Matrix4();

    const prev = mat3.identity(mat3.create());
    const prevInverse = mat3.create();
    const tiltInverse = mat3.create();
    const hoge = mat3.create();
    const fuga = mat3.create();
    motion.addEventListener('update', ({ value }) => {
      if (type === 'hostswipe') {
        const { swipe, tilt } = value;

        if (mat3.exactEquals(swipe, prev)) return;
        mat3.invert(prevInverse, prev);
        mat3.copy(prev, swipe);

        mat3.invert(tiltInverse, tilt);
        mat3.multiply(hoge, swipe, prevInverse);
        mat3.multiply(hoge, hoge, tiltInverse);
        mat3.multiply(fuga, fuga, hoge);
        mat3.multiply(fuga, fuga, tilt);
        toThreeMatrix(fuga, matrix);
      } else {
        const { [type]: c } = value;
        toThreeMatrix(c, matrix);
      }

      if (invert) matrix.getInverse(matrix);
      if (transpose) matrix.transpose();
      container.quaternion.setFromRotationMatrix(matrix);
    });
  }, []);

  return <group ref={containerRef} children={children} />;
}

const toThreeMatrix = (from: mat3, to: Matrix4) => {
  return to.set(from[0], from[1], from[2], 0, from[3], from[4], from[5], 0, from[6], from[7], from[8], 0, 0, 0, 0, 1);
};
