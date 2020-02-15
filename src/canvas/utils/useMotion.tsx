import React, { createContext, FC, useContext } from 'react';
import { MotionNode } from '../../core/motion';

export default function useMotion() {
  return useContext(useMotion.context);
}
useMotion.context = createContext<MotionNode>(null as any);

export const MotionProvider: FC<{ motion: MotionNode }> = ({ motion, children }) => {
  return <useMotion.context.Provider value={motion} children={children} />;
};
