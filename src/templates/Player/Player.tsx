import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Canvas } from 'react-three-fiber';
import Pin, { PinProps } from '../../canvas/components/Pin';
import Ball from '../../canvas/components/Ball';
import usePlayerUpdate from './useUpdate';
import { createPlayerMotionTree } from '../../core/motion';
import withBypass from '../../utils/withBypass';
import { PlayerSocketProvider, usePlayerSocket } from '../../socket';
import Traveler from '../../canvas/components/Traveler';
import useSensorEffect from '../../core/useSensorEffect';
import useTouchEffect from '../../core/useTouchEffect';

interface PlayerProps extends PlayerCanvasProps {
  code: string;
  url: string;
}

interface PlayerCanvasProps {
  FOV: number;
  pins: Omit<PinProps, 'tree'>[];
}

const PlayerCanvasContent = ({ pins }: PlayerCanvasProps) => {
  const [tree] = useState(createPlayerMotionTree);
  const pinElements = useMemo(() => pins.map((p, i) => <Pin key={i} tree={tree} {...p} />), [pins]);
  usePlayerUpdate(tree);

  return (
    <>
      <Ball />
      <Traveler tree={tree} FOV={50} position={[0, 0, 1]} />
      {pinElements}
    </>
  );
};

export default function Player({ code, url, pins, FOV }: PlayerProps) {
  return (
    <PlayerSocketProvider code={code} url={url}>
      <CustomCanvas>
        <PlayerCanvasContent pins={pins} FOV={FOV} />
      </CustomCanvas>
    </PlayerSocketProvider>
  );
}

const MyCanvas = withBypass([usePlayerSocket.context, useSensorEffect.context, useTouchEffect.context], Canvas);
const CustomCanvas = styled(MyCanvas)`
  position: fixed !important;
  width: 100vw !important;
  height: 100vw !important;
  z-index: -1;
  top: 0;
  bottom: 0;
  margin: auto;
`;
