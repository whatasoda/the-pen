import React, { FC } from 'react';
import useTracker from '../../../tracker/hook';

let totalAmount = 0;

const Nyoro: FC = () => {
  useTracker.useModule({
    maxTimeRange: 10,
    speedRegistancePerSec: 0.3,
  });
  const mag = 50;

  const [amount, { points, normalized }] = useTracker(0.5, 0.2);
  totalAmount += 1 - Math.abs(amount);

  if (!points.length) return null;

  const start = normalized[0];
  const end = normalized[points.length - 1];

  return (
    <>
      <div style={{ whiteSpace: 'pre' }}>{start.join('\n')}</div>
      <hr />
      <div style={{ whiteSpace: 'pre' }}>{end.join('\n')}</div>
      <hr />
      <div>{`${amount}\n${totalAmount}`}</div>
      <hr />
      <svg viewBox="-50 -25 100 200">
        <polyline points={`-20 20 -20 ${20 + (1 - Math.abs(amount)) * 25}`} fill="none" stroke="#000" />
        <polyline
          points={normalized.flatMap(([u, v]) => [u * mag, v * -mag]).join(' ')}
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeWidth="0.25"
        />
      </svg>
    </>
  );
};

export default Nyoro;
