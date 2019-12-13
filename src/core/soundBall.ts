import sphericalIntersection, { IntersectionObject } from '../utils/sphericalIntersection';
import { vec3 } from 'gl-matrix';

interface SoundBallProfile {
  pins: [Float32Tuple<6>, SoundProfile][];
}

export interface SoundProfile {
  freq: number;
}

const createSoundBall = ({ pins }: SoundBallProfile) => {
  const Q = new Float32Array(6);
  const Q0 = Q.subarray(0, 3) as Float32Tuple<3>;
  const Q1 = Q.subarray(3, 6) as Float32Tuple<3>;
  const P0 = vec3.create();
  const P1 = vec3.create();

  const stream = (curr: Float32Tuple<6>) => {
    vec3.copy(P0, curr);
    const a = pins.reduce<[IntersectionObject, SoundProfile][]>((acc, [pin, sound]) => {
      Q.set(pin);
      const intersection = sphericalIntersection(Q0, Q1, P0, P1);
      if (intersection) acc.push([intersection, sound]);
      return acc;
    }, []);
    vec3.copy(P1, P0);
    return a;
  };

  return stream;
};

export default createSoundBall;
