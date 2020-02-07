import { HostMotionTree } from '../../core/motion';
import { useHostSocket } from '../../socket';
import { useState } from 'react';
import { BallBuffer } from '../../shared/buffer';

interface MutablePlayerState {
  buffers: ArrayBuffer[];
  framsFromFirst: number;
}
const FRAME_OFFSET = 1;
export default function useHostUpdate(tree: HostMotionTree, useFrame: (callback: () => void) => void) {
  const [buffer] = useState(BallBuffer);
  const [state] = useState<MutablePlayerState>({ buffers: [], framsFromFirst: 0 });
  useHostSocket((data) => {
    if (data.type !== 'binary') return;
    if (!buffer.checkBufferType(data.value)) return;
    state.buffers.push(data.value);
  }, []);

  const { items } = buffer;
  useFrame(() => {
    if (state.buffers.length) {
      if (state.framsFromFirst++ > FRAME_OFFSET) {
        const next = state.buffers.shift()!;
        tree.update(({ axis, dt, leg, power }) => {
          buffer.copyFrom(next);
          axis.set(items.axis);
          dt.set(items.dt);
          leg.set(items.leg);
          power.set(items.power);
        });
      }
    } else {
      state.framsFromFirst = 0;
    }
  });
}
