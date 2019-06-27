import { useMemo, useEffect, useState } from 'react';
import createTrackerCore from './core';
import { TrackerOptions, Snapshot, TrackerCore } from './decls';

type TrackerUnit = {
  id: number;
  range: number;
  setSnapshot: TrackerCallback;
};
type TrackerCallback = (snapshot: Snapshot) => void;

let alive = false;
let moduleCount = 0;
let latestId = 0;
let core: TrackerCore;
const units: Record<number, TrackerUnit> = {};

const useTracker = (range: number) => {
  const [snapshot, setSnapshot] = useState<Snapshot>({ points: [] });
  const unit = useMemo<TrackerUnit>(() => ({ id: latestId++, range, setSnapshot }), []);

  useEffect(() => {
    units[unit.id] = unit;
    return () => {
      delete units[unit.id];
    };
  }, []);

  return snapshot;
};

useTracker.useModule = (options: Partial<TrackerOptions>) => {
  core = useMemo(() => core || createTrackerCore(options), []);

  useEffect(() => {
    if (moduleCount++ === 0) {
      alive = true;
      window.addEventListener('devicemotion', onDeviceMotion);
      update();
    }

    return () => {
      if (--moduleCount === 0) {
        alive = false;
        window.removeEventListener('devicemotion', onDeviceMotion);
      }
    };
  }, []);
};

const onDeviceMotion = ({ acceleration, rotationRate, interval }: DeviceMotionEvent) => {
  core.push({ acceleration, rotationRate, interval });
};

const update = () => {
  if (!alive) return;

  Object.values(units).forEach(({ range, setSnapshot }) => setSnapshot(core.snapshot(range)));

  requestAnimationFrame(update);
};

export default useTracker;