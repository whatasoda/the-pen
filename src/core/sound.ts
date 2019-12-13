import { IntersectionObject } from '../utils/sphericalIntersection';
import { SoundProfile } from './soundBall';

const dt = 1 / 60;

const playSound = (ctx: AudioContext, ball: [IntersectionObject, SoundProfile][]) => {
  const { currentTime } = ctx;

  ball.forEach(([{ t }, { freq }]) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.start(dt * t + currentTime);
    osc.connect(ctx.destination);
  });
};

export default playSound;
