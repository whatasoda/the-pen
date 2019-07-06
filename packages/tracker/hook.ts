import { useMemo, useEffect, useState } from 'react';
import createTrackerCore from './core';
import { TrackerOptions, Snapshot, TrackerCore } from './decls';

type TrackerUnit = {
  id: number;
  range0: number;
  range1: number;
  setSnapshot: (snapshot: Snapshot) => void;
  setAmount: (amount: number) => void;
};

let alive = false;
let moduleCount = 0;
let latestId = 0;
let core: TrackerCore;
const units: Record<number, TrackerUnit> = {};

const useTracker = (range0: number, range1: number = range0) => {
  const [snapshot, setSnapshot] = useState<Snapshot>({ points: [], normalized: [] });
  const [amount, setAmount] = useState(0);
  const unit = useMemo<TrackerUnit>(() => ({ id: latestId++, range0, range1, setSnapshot, setAmount }), []);

  useEffect(() => {
    units[unit.id] = unit;
    return () => {
      delete units[unit.id];
    };
  }, []);

  return [amount, snapshot] as const;
};

useTracker.useModule = (options: Partial<TrackerOptions>) => {
  core = useMemo(() => core || createTrackerCore(options), []);

  useEffect(() => {
    if (moduleCount++ === 0) {
      alive = true;
      window.addEventListener('devicemotion', onDeviceMotion);
      window.addEventListener('deviceorientation', onDeviceOrientation);
      update();
    }

    return () => {
      if (--moduleCount === 0) {
        alive = false;
        window.removeEventListener('devicemotion', onDeviceMotion);
        window.removeEventListener('deviceorientation', onDeviceOrientation);
      }
    };
  }, []);
};

const onDeviceMotion = ({ acceleration, rotationRate, interval }: DeviceMotionEvent) => {
  core.pushMotion({ acceleration, rotationRate, interval });
};

const onDeviceOrientation = ({ absolute, alpha, beta, gamma }: DeviceOrientationEvent) => {
  core.pushOrientation({ absolute, alpha, beta, gamma });
};

const update = () => {
  if (!alive) return;

  Object.values(units).forEach(({ range0, range1, setSnapshot, setAmount }) => {
    setAmount(core.takeChangeAmount(range0, range1));
    setSnapshot(core.snapshot(range0));
  });

  requestAnimationFrame(update);
};

export default useTracker;
