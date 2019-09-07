import React, { useEffect, useState, useMemo } from 'react';
import createDeviceMotion from './motion/deviceMotion';
import createFiber from './instrument/fiber';

const App = () => {
  const [twist, setTwist] = useState(0);
  const [velocity, setVelocity] = useState([0, 0, 0]);
  const [jerk, setJerk] = useState([0, 0, 0]);
  const [acceleration, setAcceleration] = useState([0, 0, 0]);

  const rec = useMemo<Record<string, number>>(() => ({}), []);

  useEffect(() => {
    const dm = createDeviceMotion({
      direction: [0.01, 0, 1],
      elasticity: 100,
      twistCycle: 10,
      viscous: 10,
      weight: 1,
    });
    let orientation: EulerRotation = { alpha: 0, beta: 0, gamma: 0 };
    type Aa = ReturnType<typeof dm>;
    let aa: Aa | null = null;
    const cb = (k: string, v: number) => {
      rec[k] = v;
    };

    const fiber = createFiber([
      [[0, 1, 0], 400],
      [[1, 0, 0], 440],
      [[0, 0, 1], 540],
      // [[Math.SQRT1_2, Math.SQRT1_2, 0], 500],
    ]);

    window.addEventListener('deviceorientation', ({ alpha, beta, gamma }) => {
      orientation = { alpha, beta, gamma };
    });
    window.addEventListener(
      'devicemotion',
      ({ acceleration, rotationRate, interval, accelerationIncludingGravity }) => {
        if (!acceleration || !rotationRate || !accelerationIncludingGravity) return;
        // cb('interval', interval);
        aa = dm({ acceleration, interval, orientation, rotationRate, accelerationIncludingGravity }, cb);
      },
    );

    window.addEventListener('touchstart', fiber.start, { once: true });

    const update = () => {
      if (aa) {
        const { twist, acceleration, jerk, attack, movment, dot, pow } = aa;
        setTwist(twist);
        setVelocity(movment);
        setAcceleration(acceleration);
        setJerk(jerk);
        fiber.update({ attack, velocity: movment, dot, pow } as any);
        attack.forEach((v, i) => cb(`attack:${i}`, v));
      }
      requestAnimationFrame(update);
    };
    update();
  }, [rec]);

  return (
    <div>
      <div>
        <V entries={[[`twist ${twist}`, twist]]} mag={10} />
        {rec.interval}
        <V entries={Object.entries(rec)} mag={1} />
        <V entries={Object.entries(velocity)} mag={500} />
        <V entries={Object.entries(acceleration)} mag={50} />
        <V entries={Object.entries(jerk)} mag={100} />
      </div>
    </div>
  );
};

const V = ({ entries, mag }: { entries: [string, number][]; mag: number }) => (
  <div>
    {entries.map(([k, v]) => (
      <>
        <div>{k}</div>
        <div
          key={k}
          style={{ width: `${Math.abs(v) * mag}px`, height: '6px', backgroundColor: v < 0 ? '#f99' : '#99f' }}
        />
      </>
    ))}
  </div>
);

export default App;
