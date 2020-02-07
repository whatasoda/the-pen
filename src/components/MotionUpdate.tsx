import React, { useMemo } from 'react';
import useTouchEffect, { TouchState } from '../core/useTouchEffect';
import useSensorEffect from '../core/useSensorEffect';
import MotionTree from '../core/motion';
import { vec3, vec2 } from 'gl-matrix';

interface MotionUpdateProps {
  tree: MotionTree;
}

const MotionUpdate = ({ tree }: MotionUpdateProps) => {
  const touch = useMemo(() => ({ curr: null as null | TouchState }), []);

  useTouchEffect(() => (curr) => (touch.curr = curr), []);
  useSensorEffect(() => {
    return (sensor) => {
      if (tree.role !== 'player') return;
      tree.update(({ acceleration, rotation, orientation, touchMovement, touchActivity, dt }) => {
        vec3.copy(acceleration, sensor.acceleration);
        vec3.copy(rotation, sensor.rotationRate);
        vec3.copy(orientation, sensor.orientation);
        dt[0] = sensor.dt;
        if (touch.curr) {
          vec2.copy(touchMovement, touch.curr.movement);
          touchActivity[0] = Number(touch.curr.activity);
        }
      });
    };
  }, []);

  return <></>;
};

export default MotionUpdate;
