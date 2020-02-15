import { PlayerMotionTree } from '../../core/motion';
import { usePlayerSocket } from '../../socket';
import useTouchEffect, { TouchState } from '../../core/useTouchEffect';
import useSensorEffect from '../../core/useSensorEffect';
import { useRef, useEffect } from 'react';
import { vec3, vec2 } from 'gl-matrix';
import { BallBuffer } from '../../shared/buffer';
import SocketMessages from '../../socket-message';

export default function usePlayerUpdate(tree: PlayerMotionTree) {
  const touchRef = useRef<TouchState | null>(null);

  useTouchEffect(() => (touch) => (touchRef.current = touch), []);
  useSensorEffect(() => {
    return (sensor) => {
      tree.update(({ acceleration, rotation, orientation, touchMovement, touchActivity, dt }) => {
        vec3.copy(acceleration, sensor.acceleration);
        vec3.copy(rotation, sensor.rotationRate);
        vec3.copy(orientation, sensor.orientation);
        dt[0] = sensor.dt;
        if (touchRef.current) {
          vec2.copy(touchMovement, touchRef.current.movement);
          touchActivity[0] = Number(touchRef.current.activity);
        }
      });
    };
  }, []);

  const client = usePlayerSocket((data) => {
    if (data.type !== 'message') return;
    const msg = data.value;
    switch (msg.type) {
      case 'REQUEST_RELOAD': {
        return location.reload();
      }
    }
  }, []);
  useEffect(() => {
    if (!client) return;
    const buffer = BallBuffer();
    const { items } = buffer;
    tree.motion.addEventListener('update', ({ value: { axis, dt, leg, power, swipe, tilt, coord } }) => {
      items.axis.set(axis);
      items.dt.set(dt);
      items.leg.set(leg);
      items.power.set(power);
      items.swipe.set(swipe);
      items.tilt.set(tilt);
      items.coord.set(coord);
      if (client.readyState === client.OPEN) {
        SocketMessages.send(client, 'BUFFER', buffer);
      }
    });
  }, [client]);
}
