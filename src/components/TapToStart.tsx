import React from 'react';
import styled from 'styled-components';
import qrcode from '../assets/qrcode.svg';

interface TapToStartProps {
  isSupported: boolean;
  start: () => void;
}

const TapToStart = ({ isSupported, start }: TapToStartProps) => (
  <Wrapper onClick={isSupported ? start : undefined}>
    <Title>
      Bell Ball (<Ja>仮</Ja>)
    </Title>
    {isSupported ? (
      <Text>Tap to Start!</Text>
    ) : (
      <Unsupported>
        Please open this page on your smartphone.
        <br />
        <Ja>このページはスマートフォン用コンテンツです。</Ja>
        <br />
        <QRCode src={qrcode} />
      </Unsupported>
    )}
  </Wrapper>
);

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #8888;
  color: #ddd;
`;

const Title = styled.h1`
  font-size: 10vw;
  text-align: center;
`;

const Text = styled.p`
  font-size: 7vw;
  text-align: center;
`;

const Ja = styled.span`
  font-size: 0.86em;
`;

const Unsupported = styled.p`
  color: #e63;
  font-size: 4vw;
  text-align: center;
`;

const QRCode = styled.img`
  margin-top: 2vw;
`;

export default TapToStart;
