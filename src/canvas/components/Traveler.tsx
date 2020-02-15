import React, { useRef, useEffect, PropsWithChildren } from 'react';
import useMotion from '../utils/useMotion';

interface TravelerProps {}

export default function Traveler({ children }: PropsWithChildren<TravelerProps>) {
  const motion = useMotion();
  const travelerRef = useRef<THREE.Group>();

  useEffect(() => {
    const traveler = travelerRef.current!;
    motion.addEventListener('update', ({ value: { axis, leg } }) => {
      traveler.up.fromArray(leg);
      traveler.lookAt(axis[0], axis[1], axis[2]);
    });
  }, []);

  return <group ref={travelerRef} children={children} />;
}
