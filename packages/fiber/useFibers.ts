import { useMemo, useEffect } from 'react';
import { vec3 } from 'gl-matrix';
import useGlobalMotion, { GlobalMotionListener } from '../shared/global-motion';

// const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));

type FiberScope = {
  fibers: Fiber[];
  callback?: FiberCallback;
};
type FiberCallback = (fibers: Fiber[]) => void;

export type Fiber = {
  readonly id: number;
  props: {
    readonly freq: number;
    readonly coef: number;
    readonly length: number;
    readonly direction: number[];
    readonly maxSlack: number;
    readonly rewindPower: number;
  };
  state: {
    slack: number;
    selfVelocity: number;
    fiberVelocity: number;
    volume: number;
  };
};

const useFibers = (callback: FiberCallback, fiberCreater: () => Fiber[], inputs: any[]) => {
  const { scope, handle } = useMemo(() => {
    const scope: FiberScope = { fibers: [] };
    const handle: GlobalMotionListener = ({ acceleration, interval }) => {
      scope.fibers.forEach(({ props, state }, i) => {
        const { direction, maxSlack, rewindPower } = props;
        // const mag = vec3.length(acceleration);
        // const impactRate = (Math.max(0.5, vec3.dot(direction, acceleration) / mag) - 0.5) * 2;
        // const impact = impactRate * interval * mag;
        const impact = vec3.dot(direction, acceleration) * interval;
        // const rewind = state.fiberVelocity * rewindPower * interval;

        const selfVelocity = state.selfVelocity + impact;
        const fiberVelocity = Math.max(0, state.fiberVelocity * rewindPower * interval);
        const slack = Math.min(maxSlack, state.slack - (selfVelocity - fiberVelocity) * interval);

        state.selfVelocity = selfVelocity;
        state.fiberVelocity = fiberVelocity;
        state.slack = slack;
        if (slack < 0) {
          state.fiberVelocity = Math.max(0, selfVelocity);
        }

        state.volume = Math.max(0, state.fiberVelocity);
      });

      if (scope.callback) {
        scope.callback(scope.fibers);
      }
    };
    return { scope, handle };
  }, []);

  scope.callback = callback;
  useEffect(() => {
    scope.fibers = fiberCreater();
  }, inputs);

  useGlobalMotion(handle);
};

export default useFibers;
