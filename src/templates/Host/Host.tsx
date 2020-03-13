import React, { useState, useMemo, MutableRefObject, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Canvas, useFrame } from 'react-three-fiber';
import { createHostMotionTree } from '../../core/motion';
import Pin, { PinProps } from '../../canvas/components/Pin';
import Ball from '../../canvas/components/Ball';
import { HostSocketProvider, useHostSocket } from '../../socket';
import useHostUpdate from './useUpdate';
import withBypass from '../../utils/withBypass';
import CustomCamera from '../../canvas/components/CustomCamera';
import Power from '../../canvas/components/Power';
import { MotionProvider } from '../../canvas/utils/useMotion';
import Coord from '../../canvas/components/Coord';
// import { vec3, quat } from 'gl-matrix';

interface HostProps extends Omit<HostCanvasProps, 'handlerRef'> {
  code: string;
  url: string;
}

interface HostCanvasProps {
  pins: Omit<PinProps, 'tree'>[];
  handlerRef: MutableRefObject<(() => void) | undefined>;
}

// const tmp = vec3.create();
const deg = Math.PI / 4;

const HostCanvasContent = ({ pins, handlerRef }: HostCanvasProps) => {
  const [tree] = useState(createHostMotionTree);
  const pinElements = useMemo(() => pins.map((p, i) => <Pin key={i} tree={tree} {...p} />), [pins]);
  const [requestReload, cameraOrientation] = useHostUpdate(tree, useFrame);
  handlerRef.current = requestReload || undefined;

  // const [position, setPosition] = useState<[number, number, number]>(() => [0, 1, 0]);
  // const [up, setUp] = useState<[number, number, number]>(() => [0, 0, 1]);

  useEffect(() => {
    // setPosition(
    //   Array.from(vec3.transformQuat(tmp, [1, 0, 0], (cameraOrientation as unknown) as quat)) as [
    //     number,
    //     number,
    //     number,
    //   ],
    // );
    // setUp(
    //   Array.from((vec3.transformQuat(tmp, [0, 0, 1], (cameraOrientation as unknown) as quat))) as [
    //     number,
    //     number,
    //     number,
    //   ],
    // );
  }, [cameraOrientation]);

  return (
    <MotionProvider motion={tree.motion}>
      <Coord invert type="coord">
        <Coord type="tilt">
          <CustomCamera
            fov={15}
            up={[Math.cos(deg), 0, Math.sin(deg)]}
            position={[Math.sin(deg), 0, -Math.cos(deg)]}
            near={0.118}
          />
        </Coord>
      </Coord>
      <Power position={[0, 0, 1]} />
      <Coord type="swipe">
        <Coord type="tilt">
          <Ball />
          {pinElements}
        </Coord>
      </Coord>
    </MotionProvider>
  );
};

export default function Host({ code, url, pins }: HostProps) {
  const handlerRef = useRef<() => void>();
  return (
    <HostSocketProvider code={code} url={url}>
      <CustomCanvas>
        <HostCanvasContent pins={pins} handlerRef={handlerRef} />
      </CustomCanvas>
      <FixedContainer>
        <ExplainTop>
          是非横のスマホをお手にとって振ってみてください！音が出ます！ （スワイプではなくシェイクで）
          <br />
          頑張ればゼルダの伝説シリーズの”エポナの歌”っぽい演奏ができます…！
          <br />
          <Red>赤</Red> <Green>緑</Green> <Blue>青</Blue> <Red>赤</Red> <Green>緑</Green> <Blue>青</Blue> <Red>赤</Red>{' '}
          <Green>緑</Green> <Blue>青</Blue> <Green>緑</Green> <Blue>青</Blue>...
        </ExplainTop>
        <Explain></Explain>
        {/* <Explain>裏でバグ修正中ですが、お気軽にお声がけください！</Explain> */}
        <RequestReload onClick={() => handlerRef.current?.()}>Reload</RequestReload>
        <Big>スマホの充電が切れてしまったので本日は終了です 😣ぴえん 😣</Big>
      </FixedContainer>
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
  left: 0;
  right: 0;
  margin: auto;
`;

const FixedContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  color: white;
  text-shadow: 0 0 4px #aaa;
`;

const Explain = styled.p`
  position: absolute;
  left: 10px;
  bottom: 10px;
  font-size: 40px;
`;

const ExplainTop = styled.p`
  position: absolute;
  left: 10px;
  top: 10px;
  font-size: 40px;
`;

const Red = styled.span`
  color: #f55;
`;
const Green = styled.span`
  color: #5f5;
`;
const Blue = styled.span`
  color: #55f;
`;

const Big = styled.div`
  position: absolute;
  font-size: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  margin: auto;
  text-align: center;
  height: 100px;
`;
Big;

const RequestReload = styled.div`
  position: absolute;
  display: block;
  right: 0;
  bottom: 0;
  font-size: 20px;
`;
