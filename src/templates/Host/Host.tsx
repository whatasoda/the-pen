import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from 'react-three-fiber';
import { createHostMotionTree } from '../../core/motion';
import Pin, { PinProps } from '../../canvas/components/Pin';
import Ball from '../../canvas/components/Ball';
import Traveler from '../../canvas/components/Traveler';
import { HostSocketProvider, useHostSocket } from '../../socket';
import useHostUpdate from './useUpdate';
import withBypass from '../../utils/withBypass';

interface HostProps extends HostCanvasProps {
  code: string;
  url: string;
}

interface HostCanvasProps {
  FOV: number;
  pins: Omit<PinProps, 'tree'>[];
}

const HostCanvasContent = ({ pins, FOV }: HostCanvasProps) => {
  const [tree] = useState(createHostMotionTree);
  const pinElements = useMemo(() => pins.map((p, i) => <Pin key={i} tree={tree} {...p} />), [pins]);
  useHostUpdate(tree, useFrame);

  return (
    <>
      <Ball />
      <Traveler tree={tree} FOV={FOV} position={[0, 1, 0]} />
      {pinElements}
    </>
  );
};

export default function Host({ code, url, pins, FOV }: HostProps) {
  return (
    <HostSocketProvider code={code} url={url}>
      <CustomCanvas>
        <HostCanvasContent pins={pins} FOV={FOV} />
      </CustomCanvas>
    </HostSocketProvider>
  );
}

const MyCanvas = withBypass([useHostSocket.context], Canvas);
const CustomCanvas = styled(MyCanvas)`
  position: fixed !important;
  width: 100vh !important;
  height: 100vh !important;
  z-index: -1;
  top: 0;
  bottom: 0;
  margin: auto;
`;
