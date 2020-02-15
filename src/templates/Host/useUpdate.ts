import { HostMotionTree } from '../../core/motion';
import { useHostSocket } from '../../socket';
import { useState, useRef, useEffect } from 'react';
import { BallBuffer } from '../../shared/buffer';
import SocketMessages from '../../socket-message';

interface MutablePlayerState {
  buffers: number[][];
  framsFromFirst: number;
}
const FRAME_OFFSET = 1;
export default function useHostUpdate(tree: HostMotionTree, useFrame: (callback: () => void) => void) {
  const [buffer] = useState(BallBuffer);
  const [state] = useState<MutablePlayerState>({ buffers: [], framsFromFirst: 0 });
  const client = useHostSocket((data) => {
    if (data.type !== 'message') return;
    const msg = data.value;
    switch (msg.type) {
      case 'BUFFER': {
        msg.value;
        state.buffers.push(msg.value);
      }
    }
  }, []);

  const socketRef = useRef<WebSocket | null>(null);
  const [[requestReload]] = useState(
    () => [() => socketRef.current && SocketMessages.send(socketRef.current, 'REQUEST_RELOAD')] as const,
  );

  socketRef.current = client;

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState) state.buffers.length = 0;
    });
  }, []);

  const { items } = buffer;
  useFrame(() => {
    if (state.buffers.length) {
      if (state.framsFromFirst++ > FRAME_OFFSET) {
        const next = state.buffers.shift()!;
        tree.update(({ axis, dt, leg, power, swipe, tilt, coord }) => {
          buffer.copyFrom(new Float32Array(next).buffer);
          axis.set(items.axis);
          dt.set(items.dt);
          leg.set(items.leg);
          power.set(items.power);
          swipe.set(items.swipe);
          tilt.set(items.tilt);
          coord.set(items.coord);
        });
      }
    } else {
      state.framsFromFirst = 0;
    }
  });

  return [requestReload] as const;
}
