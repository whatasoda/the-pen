import styled from 'styled-components';
import React from 'react';

interface TapToStartProps {
  start: () => void;
}

const TapToStart = ({ start }: TapToStartProps) => {
  return (
    <Wrapper onClick={start}>
      <Title>
        Bell Ball (<Ja>仮</Ja>)
      </Title>
      <Text>Tap to Start!</Text>
    </Wrapper>
  );
};

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

export default TapToStart;
