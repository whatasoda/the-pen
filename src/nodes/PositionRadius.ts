import vn from 'vector-node';
import { vec2, vec3 } from 'gl-matrix';

const PI_2 = Math.PI * 0.5;

const PositionRadius = vn.defineNode(
  {
    inputs: {
      position: 'f32-2-moment',
      dt: 'f32-1-moment',
    },
    output: 'f32-3-moment',
  },
  () => {
    const A = vec2.create();
    const B = vec2.create();
    const C = vec2.create();

    const E = vec2.create();
    const F = vec2.create();

    const O = vec2.create();
    const OA = vec2.create();
    const OB = vec2.create();

    return ({ inputs: { position, dt }, output }) => {
      vec2.copy(A, position.value);

      vec2.add(E, A, B);
      vec2.add(F, B, C);
      vec2.scale(E, E, 0.5);
      vec2.scale(F, F, 0.5);
      const [A_u, A_v] = A;
      const [B_u, B_v] = B;
      const [C_u, C_v] = C;
      const [E_u, E_v] = E;
      const [F_u, F_v] = F;

      const tAlpha = Math.tan(Math.atan2(B_v - A_v, B_u - A_u) + PI_2);
      const tBeta = Math.tan(Math.atan2(C_v - B_v, C_u - B_u) + PI_2);

      const O_u = (E_v - F_v - E_u * tAlpha + F_u * tBeta) / (tBeta - tAlpha);
      const O_v = E_v - (E_u - O_u) * tAlpha;
      vec2.set(O, O_u, O_v);
      const radius = vec2.distance(O, A);

      vec2.sub(OA, A, O);
      vec2.sub(OB, A, O);
      const theta = Math.acos(vec2.dot(OA, OB) * radius ** -2);
      const omega = theta / dt.value[0];

      vec2.copy(B, A);
      vec2.copy(C, B);
      vec3.set(output.value, radius, omega, theta);
    };
  },
);

export default PositionRadius;
