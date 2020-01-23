import React, { useMemo, useEffect } from 'react';
import { useRerender } from '../utils/hooks';
import { pitch } from '../core/motion';
import styled from 'styled-components';

const ScalarViewer = () => {
  const rerender = useRerender();
  const { record, showScalar } = useMemo(() => {
    const record: Record<string, number> = {};
    const showScalar = (k: string, v: number) => (record[k] = v);

    return { showScalar, record };
  }, []);
  useEffect(() => {
    pitch.addEventListener('update', ({ value: { angle, speed } }) => {
      showScalar('one', 100);
      showScalar('angle', angle * 100);
      showScalar('speed', speed * 100);
      rerender();
    });
  }, []);

  return (
    <div>
      {Object.entries(record).map(([k, v]) => (
        <Scalar key={k} v={v}>
          {k}
          <div style={{ width: `${Math.abs(v)}px` }} />
        </Scalar>
      ))}
    </div>
  );
};

interface ScalarProps {
  v: number;
}

const Scalar = styled.div<ScalarProps>`
  color: #aaa;
  & > div {
    display: block;
    height: 5px;
    background-color: ${({ v }) => (v < 0 ? '#f99' : '#99f')};
  }
`;

export default ScalarViewer;
