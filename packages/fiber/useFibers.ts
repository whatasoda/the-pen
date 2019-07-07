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
    velocity: number;
    volume: number;
  };
};

const useFibers = (callback: FiberCallback, fiberCreater: () => Fiber[], inputs: any[]) => {
  const { scope, handle } = useMemo(() => {
    const scope: FiberScope = { fibers: [] };
    const handle: GlobalMotionListener = ({ acceleration, interval }) => {
      /* eslint-disable no-param-reassign */
      scope.fibers.forEach(({ props, state }, i) => {
        const { direction, maxSlack, rewindPower } = props;
        const mag = vec3.length(acceleration);
        const impactRate = (Math.max(0.5, vec3.dot(direction, acceleration) / mag) - 0.5) * 2;
        const impact = impactRate * interval * mag;
        const relativeMovement = impact * interval * 10;
        const rewind = state.velocity * rewindPower * interval;

        state.velocity = Math.max(0, state.velocity - rewind);
        state.slack = Math.min(maxSlack, state.slack - relativeMovement + state.velocity * interval);
        if (state.slack < 0) {
          state.velocity += impact;
        }

        state.volume = Math.max(0, -state.slack);
        if (!i) {
          /* eslint-disable no-console */
          console.log(impactRate, state.slack, state.velocity);
          /* eslint-enable no-console */
        }
      });
      /* eslint-enable no-param-reassign */

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
