import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Canvas } from 'react-three-fiber';
import Pin, { PinProps } from '../../canvas/components/Pin';
import Ball from '../../canvas/components/Ball';
import usePlayerUpdate from './useUpdate';
import { createPlayerMotionTree } from '../../core/motion';
import withBypass from '../../utils/withBypass';
import { PlayerSocketProvider, usePlayerSocket } from '../../socket';
import useSensorEffect, { SensorProvider } from '../../core/useSensorEffect';
import useTouchEffect, { TouchEffectProvider } from '../../core/useTouchEffect';
import TapToStart from '../../components/TapToStart';
import usePermissionRequest from '../../utils/permission';
import CustomCamera from '../../canvas/components/CustomCamera';
import Power from '../../canvas/components/Power';
import { MotionProvider } from '../../canvas/utils/useMotion';
import Coord from '../../canvas/components/Coord';

interface PlayerProps extends PlayerCanvasProps {
  code: string;
  url: string;
}

interface PlayerCanvasProps {
  pins: Omit<PinProps, 'tree'>[];
}

const PlayerCanvasContent = ({ pins }: PlayerCanvasProps) => {
  const [tree] = useState(createPlayerMotionTree);
  const pinElements = useMemo(() => pins.map((p, i) => <Pin key={i} tree={tree} {...p} />), [pins]);
  usePlayerUpdate(tree);

  return (
    <MotionProvider motion={tree.motion}>
      <Coord invert type="swipe">
        <Power position={[0, 0, 1]} />
        <CustomCamera fov={10} up={[0, 0, 1]} position={[1, 0, 0]} />
      </Coord>
      <Coord type="tilt">
        <Ball />
        {pinElements}
      </Coord>
      <mesh>
        <sphereGeometry attach="geometry" args={[0.92, 20, 20]} />
        <meshLambertMaterial attach="material" transparent opacity={0.4} />
      </mesh>
    </MotionProvider>
  );
};

export default function Player({ code, url, pins }: PlayerProps) {
  const [isPermitted, requestPermission] = usePermissionRequest();
  return (
    <TouchEffectProvider>
      <SensorProvider>
        <PlayerSocketProvider code={code} url={url}>
          <CustomCanvas>
            <PlayerCanvasContent pins={pins} />
          </CustomCanvas>
          {isPermitted && pins.length ? null : <TapToStart isSupported start={requestPermission} />}
        </PlayerSocketProvider>
      </SensorProvider>
    </TouchEffectProvider>
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
