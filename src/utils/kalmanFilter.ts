interface KalmanConstant {
  QAngle: number;
  QBias: number;
  RMeasure: number;
}

export type Kalman = {
  (newAngle: number, newRage: number, dt: number): [number, number];
  constant(newConstants: Partial<KalmanConstant>): void;
};

/**
 * https://github.com/TKJElectronics/KalmanFilter
 */
const createKalmanFilter = ({ QAngle, QBias, RMeasure }: KalmanConstant): Kalman => {
  let angle = 0;
  let bias = 0;

  let P00 = 0;
  let P01 = 0;
  let P10 = 0;
  let P11 = 0;

  const kalman: Kalman = (newAngle: number, newRate: number, dt: number) => {
    const rate = newRate - bias;
    angle += dt * rate;

    const dtp11 = dt * P11;
    P00 += dt * (dtp11 - P01 - P10 + QAngle);
    P01 -= dtp11;
    P10 -= dtp11;
    P11 += dt * QBias;

    const S = P00 + RMeasure;
    const K0 = P00 / S;
    const K1 = P10 / S;

    const y = newAngle - angle;
    angle += K0 * y;
    bias += K1 * y;

    const P00Temp = P00;
    const P01Temp = P01;

    P00 -= K0 * P00Temp;
    P01 -= K0 * P01Temp;
    P10 -= K1 * P00Temp;
    P11 -= K1 * P01Temp;

    return [angle, rate];
  };

  kalman.constant = (newConstants: Partial<KalmanConstant>) => {
    QAngle = newConstants.QAngle || QAngle;
    QBias = newConstants.QBias || QBias;
    RMeasure = newConstants.QAngle || RMeasure;
  };

  return kalman;
};

export default createKalmanFilter;
