const { max: MAX, min: MIN, PI, acos, cos, sin, abs } = Math;
export const clamp = (value: number, min: number, max: number) => MIN(MAX(min, value), max);
export const convertCosine = (coef: number, theta: number) => acos(coef * cos(theta)) || 0;

export const dominanceBetweenCircles: (alphaRadius: number, betaRadius: number, distance: number) => number = (
  Ra,
  Rb,
  d,
) => {
  if (abs(Ra - Rb) >= d) return PI * MIN(Ra, Rb) ** 2;
  const Ra_2 = Ra ** 2;
  const Rb_2 = Rb ** 2;
  const D_2 = d ** 2;
  const alpha = abs(acos((Ra_2 - Rb_2 + D_2) / (2 * Ra * d)));
  const beta = abs(acos((Rb_2 - Ra_2 + D_2) / (2 * Rb * d)));
  return alpha * Ra_2 + beta * Rb_2 - d * Ra * sin(alpha);
};
