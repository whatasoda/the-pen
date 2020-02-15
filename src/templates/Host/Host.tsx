import React, { useState, useMemo, MutableRefObject, useRef } from 'react';
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

interface HostProps extends Omit<HostCanvasProps, 'handlerRef'> {
  code: string;
  url: string;
}

interface HostCanvasProps {
  pins: Omit<PinProps, 'tree'>[];
  handlerRef: MutableRefObject<(() => void) | undefined>;
}

const HostCanvasContent = ({ pins, handlerRef }: HostCanvasProps) => {
  const [tree] = useState(createHostMotionTree);
  const pinElements = useMemo(() => pins.map((p, i) => <Pin key={i} tree={tree} {...p} />), [pins]);
  const [requestReload] = useHostUpdate(tree, useFrame);
  handlerRef.current = requestReload || undefined;

  // const [state] = useState(() => ({ update: true }));
  // const [position, setPosition] = useState<[number, number, number]>(() => [0, 1, 0]);
  // const [up, setUp] = useState<[number, number, number]>(() => [0, 0, 1]);

  // useEffect(() => {
  //   tree.motion.addEventListener('update', ({ value: { axis, leg } }) => {
  //     if (state.update) {
  //       setUp([axis[0], axis[1], axis[2]]);
  //       console.log(axis, leg);

  //       setPosition([-leg[0], -leg[1], -leg[2]]);
  //       state.update = false;
  //     }
  //   });

  //   // window.addEventListener('click', () => (state.update = true));
  // }, []);

  return (
    <MotionProvider motion={tree.motion}>
      <Coord transpose type="swipe">
        <Coord type="tilt">
          <Coord type="swipe">
            <CustomCamera fov={15} up={[1, 0, 0]} position={[0, 0, -1]} near={0.13} />
          </Coord>
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
          是非横のスマホをお手にとって振ってみてください！音が出ます！ （スワイプというより、シェイクで）
          <br />
          めちゃくちゃ頑張ればゼルダの伝説シリーズの”エポナの歌”っぽい演奏ができます…！
          <br />
          <Red>赤</Red> <Green>緑</Green> <Blue>青</Blue> <Red>赤</Red> <Green>緑</Green> <Blue>青</Blue> <Red>赤</Red>{' '}
          <Green>緑</Green> <Blue>青</Blue> <Green>緑</Green> <Blue>青</Blue>...
        </ExplainTop>
        <Explain>
          <br />
          裏でバグ修正中ですが、お気軽にお声がけください！
          <br />
          スワイプするとディスプレイとスマホで位置が合わない 😣ぴえん 😣
          <br />
          バグ修正の検証のために時々リロードが入るかもしれません！🙇‍♂️
        </Explain>
        <RequestReload onClick={() => handlerRef.current?.()}>Reload</RequestReload>
        {/* <Big>本気でバグ修正中 しばらくお待ち下さい</Big> */}
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
  text-shadow: 0 0 4px #fff;
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
  color: red;
`;
const Green = styled.span`
  color: green;
`;
const Blue = styled.span`
  color: blue;
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
