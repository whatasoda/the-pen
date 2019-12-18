import { IntersectionObject } from '../utils/sphericalIntersection';
import { SoundProfile } from './soundBall';

const dt = 1 / 60;
const aaaa: any[] = [];
(window as any).aaaaaa = aaaa;

const playSound = (ctx: AudioContext, ball: [IntersectionObject, SoundProfile][]) => {
  const { currentTime } = ctx;

  ball.forEach(([{ t }, { freq }]) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    const startTime: number = dt * t + currentTime;
    osc.connect(ctx.destination);
    osc.start(startTime);
    aaaa.push(osc);
    osc.stop(startTime + 0.2);
  });
};

export default playSound;
