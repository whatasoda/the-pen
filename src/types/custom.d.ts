type V2 = [number, number];
type V3 = [number, number, number];
type V4 = [number, number, number, number];
type M4 = [
    number, number, number, number, // eslint-disable-line prettier/prettier
    number, number, number, number, // eslint-disable-line prettier/prettier
    number, number, number, number, // eslint-disable-line prettier/prettier
    number, number, number, number, // eslint-disable-line prettier/prettier
];

type CartesianKey = 'x' | 'y' | 'z';
type EulerKey = 'alpha' | 'beta' | 'gamma';
type EulerRotation = Record<EulerKey, number | null>;
type CartesianCoord = Record<CartesianKey, number | null>;
