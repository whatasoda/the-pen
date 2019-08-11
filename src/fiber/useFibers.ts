import { useMemo, useEffect } from 'react';
import { vec3, quat } from 'gl-matrix';
import useGlobalMotion, { GlobalMotionListener } from '../shared/global-motion';

// const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));

type FiberScope = {
  velocity: vec3;
  direction: vec3;
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
    readonly axis: number[];
    readonly U: number[];
    readonly V: number[];
    readonly maxSlack: number;
    readonly rewindPower: number;
  };
  state: {
    slack: number;
    selfVelocity: number;
    fiberVelocity: number;
    volume: number;
    u: number;
    v: number;
    rot: number;
  };
};

type Piece = {
  expire: number;
  movement: number[];
};

// const STANDBY_THRESHOLD = 0.2;
// const STANDBY_WAIT_DURATION = 50;
// const STANDBY_ACCEPTABLE_ERROR_COUNT = 5;
// const STANDBY_RESISTANCE = 0.1;

const TAIL_DURATION = 0.3;

const DIRECTION_WEIGHT_THRESHOLD = Math.cos((45 / 180) * Math.PI);
const DIRECTION_WEIGHT_COEF = 1 / (1 - DIRECTION_WEIGHT_THRESHOLD);

const useFibers = (callback: FiberCallback, fiberCreater: () => Fiber[], _: any[]) => {
  const { scope, handle } = useMemo(() => {
    const scope: FiberScope = { velocity: vec3.create(), direction: vec3.create(), fibers: [] };

    // const standby = {
    //   isStandby: false,
    //   timeout: null as null | number,
    //   errorCount: 0,
    // };

    let now = 0;
    let chain: Piece[] = [];
    const movement = vec3.create();
    const velocity = vec3.create();
    const direction = vec3.create();
    const q = quat.create();

    // const updateStandby: GlobalMotionListener = ({ acceleration }) => {
    //   if (vec3.length(acceleration) < STANDBY_THRESHOLD) {
    //     if (standby.timeout !== null) return;
    //     if (standby.isStandby) {
    //       standby.timeout = (setTimeout(() => {
    //         standby.errorCount--;
    //       }, STANDBY_WAIT_DURATION / STANDBY_ACCEPTABLE_ERROR_COUNT) as unknown) as number;
    //     } else {
    //       standby.timeout = (setTimeout(() => {
    //         standby.errorCount = 0;
    //         standby.isStandby = true;
    //       }, STANDBY_WAIT_DURATION) as unknown) as number;
    //     }
    //   } else {
    //     if (!standby.isStandby && standby.timeout === null) return;
    //     if (++standby.errorCount < STANDBY_ACCEPTABLE_ERROR_COUNT) return;
    //     if (standby.timeout !== null) {
    //       clearTimeout(standby.timeout);
    //     }
    //     standby.isStandby = false;
    //     standby.errorCount = 0;
    //   }
    // };

    const handle: GlobalMotionListener = (motion) => {
      const { acceleration, interval } = motion;
      vec3.scaleAndAdd(velocity, velocity, acceleration, interval);
      vec3.scale(velocity, velocity, 0.99);
      // updateStandby(motion);

      // if (standby.isStandby) {
      //   const speed = vec3.length(velocity);
      //   vec3.scale(velocity, velocity, Math.max(0, speed - STANDBY_RESISTANCE * interval) / speed);
      // }

      now += interval;
      vec3.scale(movement, velocity, interval);
      chain.push({ expire: now + TAIL_DURATION, movement: [...movement] });
      const tailIndex = chain.findIndex(({ expire }) => expire < now);
      chain = chain.slice(tailIndex === -1 ? 0 : tailIndex);

      vec3.set(movement, 0, 0, 0);
      chain.reverse().map(({ movement: m }) => [...vec3.add(movement, movement, m)]);
      vec3.normalize(direction, movement);

      scope.fibers.forEach(({ props, state }) => {
        const { axis, U, V, maxSlack, rewindPower } = props;
        let weight = Math.max(0, (vec3.dot(direction, axis) - DIRECTION_WEIGHT_THRESHOLD) * DIRECTION_WEIGHT_COEF);
        weight **= 1 / 4;
        // const mag = vec3.length(acceleration);
        // const impactRate = (Math.max(0.5, vec3.dot(direction, acceleration) / mag) - 0.5) * 2;
        // const impact = impactRate * interval * mag;
        // const impact = vec3.dot(axis, acceleration) * interval;

        const speed = vec3.dot(axis, velocity) * weight;
        const u = vec3.dot(U, velocity) * weight;
        const v = vec3.dot(V, velocity) * weight;

        quat.rotationTo(q, [u, v, 0], [state.u, state.v, 0]);
        state.u = u;
        state.v = v;
        state.rot = q[2] * q[3];
        // const rewind = state.fiberVelocity * rewindPower * interval;

        const selfVelocity = speed;
        const fiberVelocity = Math.max(0, state.fiberVelocity - rewindPower * interval);

        const slackGap = selfVelocity - rewindPower * interval;
        let slack = Math.max(-maxSlack, state.slack + slackGap);

        state.selfVelocity = selfVelocity;
        state.fiberVelocity = fiberVelocity;
        if (slack > 0 && slackGap > 0) {
          slack = Math.log10(Math.max(0, slack - maxSlack * 0.1)) + 1;
          slack *= maxSlack;

          state.fiberVelocity = Math.max(0, fiberVelocity, speed * slack);
        }
        state.slack = slack;

        state.volume = state.fiberVelocity;
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
  }, [fiberCreater, scope.fibers]);

  useGlobalMotion(handle);
};

export default useFibers;
