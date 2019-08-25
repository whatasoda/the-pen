import { vec3 } from 'gl-matrix';

// http://www.asem.kyushu-u.ac.jp/qq/qq02/kikanbuturi/chap5.pdf
const createStabilizer = ({ elasticity: k, viscous: h }: StabilizerConstant) => {
  const P = vec3.create();
  const V = vec3.create();
  const A = vec3.create();
  const J = vec3.create();
  const P_u = vec3.create();
  const V_u = vec3.create();

  const stabilizer = (movement: V3, dt: number) => {
    vec3.add(P, P, movement);

    vec3.normalize(P_u, P);
    vec3.normalize(V_u, V);

    const a_P = -k * vec3.length(P);
    const a_V = -2 * h * vec3.length(V);

    vec3.copy(J, A);
    A.fill(0);
    vec3.scaleAndAdd(A, A, P_u, a_P);
    vec3.scaleAndAdd(A, A, V_u, a_V);
    vec3.sub(J, A, J);

    vec3.scaleAndAdd(V, V, A, dt);
    vec3.scaleAndAdd(P, P, V, dt);

    return {
      acceleration: [...A],
      velocity: [...V],
      jerk: [...J],
    };
  };

  return stabilizer;
};

export default createStabilizer;
