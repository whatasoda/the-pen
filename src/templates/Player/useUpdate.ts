import { PlayerMotionTree } from '../../core/motion';
import { usePlayerSocket } from '../../socket';
import useTouchEffect, { TouchState } from '../../core/useTouchEffect';
import useSensorEffect from '../../core/useSensorEffect';
import { useRef, useEffect } from 'react';
import { vec3, vec2, quat } from 'gl-matrix';
import { BallBuffer } from '../../shared/buffer';
import SocketMessages from '../../socket-message';

export default function usePlayerUpdate(tree: PlayerMotionTree) {
  const touchRef = useRef<TouchState | null>(null);

  useTouchEffect(() => (touch) => (touchRef.current = touch), []);
  useSensorEffect(() => {
    let initial = true;
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
        if (initial && clientRef.current) {
          initial = false;
          SocketMessages.send(
            clientRef.current,
            'SET_INITIAL_CAMERA',
            Array.from(
              quat.fromEuler(quat.create(), sensor.orientation[0], sensor.orientation[1], sensor.orientation[2]),
            ) as [number, number, number, number],
          );
        }
      });
    };
  }, []);

  const clientRef = useRef<WebSocket | null>(null);
  const client = (clientRef.current = usePlayerSocket((data) => {
    if (data.type !== 'message') return;
    const msg = data.value;
    switch (msg.type) {
      case 'REQUEST_RELOAD': {
        return location.reload();
      }
    }
  }, []));
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
