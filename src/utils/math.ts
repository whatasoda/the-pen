const { max: MAX, min: MIN, acos, cos } = Math;
export const clamp = (value: number, min: number, max: number) => MIN(MAX(min, value), max);
export const convertCosine = (coef: number, theta: number) => acos(coef * cos(theta)) || 0;
