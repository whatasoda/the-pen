import React, { FC } from 'react';
import useTracker from '../../../tracker/hook';

const Nyoro: FC = () => {
  useTracker.useModule({
    maxTimeRange: 10,
    speedRegistancePerSec: 5,
  });

  const { points } = useTracker(10);

  if (!points.length) return null;

  const end = points[points.length - 1].position;
  const sign = Math.sign(end[2]);
  const mag = 100;

  return (
    <svg viewBox="-50 -25 100 200">
      <polyline
        points={points.flatMap(({ position: [x, y, z] }) => [(x ** 2 + y ** 2) ** 0.5 * mag, z * sign * mag]).join(' ')}
        stroke="#000"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Nyoro;
