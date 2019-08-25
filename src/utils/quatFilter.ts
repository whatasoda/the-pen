import { vec3, quat, mat4, vec4 } from 'gl-matrix';
import { eulerToArray } from './converter';

// const D2R = Math.PI / 180;
const I = mat4.identity(mat4.create());

/**
 * Using Extended Kalman Filter
 */
const createQuatFilter = ({ bias, Q, R }: QuatFilterConstant) => {
  const rate_euler = vec3.create();
  const angle_euler = vec3.create();
  const raw_curr = vec3.create();
  const angle_offset = vec3.create();

  const rate_quat = quat.create();
  const Y = vec4.create();

  const A = mat4.create();
  const A_T = mat4.create();

  const P_pre = mat4.create();
  const P_post = mat4.create();
  const G_denom = mat4.create();
  const G = mat4.create();

  const X_pre = vec4.create();
  const X_post = vec4.create();

  const tmp3 = vec3.create();
  const tmp4 = vec4.create();

  const quatFilter = ({ angle, rate, dt }: QuatFilterInput) => {
    const raw_next = eulerToArray(angle);
    // const beta = raw_next[1];
    // if (Math.abs(((Math.abs(beta) + 90) % 360) - 180) < 2) {
    //   raw_next[2] -= raw_next[0];
    //   raw_next[0] = 0;
    // }
    raw_next.forEach((next, i) => {
      const curr = raw_curr[i];
      const gap = next - curr;
      if (Math.abs(gap) > 350) {
        angle_offset[i] += Math.sign(gap);
      }
      const offset = angle_offset[i];
      angle_euler[i] = offset * 360 + next;
      raw_curr[i] = next;
    });
    quat.fromEuler((Y as unknown) as quat, angle_euler[0], angle_euler[1], angle_euler[2]);

    vec3.sub(rate_euler, eulerToArray(rate), bias);
    vec3.scale(rate_euler, rate_euler, dt);
    quat.fromEuler(rate_quat, rate_euler[0], rate_euler[1], rate_euler[2]);

    const s = Math.acos(rate_quat[3]);
    vec3.normalize(tmp3, (rate_quat as unknown) as vec3);
    mapQuatToMat4(A, tmp3[0] * s, tmp3[1] * s, tmp3[2] * s, 1);
    mat4.transpose(A_T, A);
    vec4.transformMat4(X_pre, X_post, A);

    mat4.mul(P_pre, A, P_post);
    mat4.mul(P_pre, P_pre, A_T);
    mat4.add(P_pre, P_pre, (Q as unknown) as mat4);

    mat4.add(G_denom, P_pre, (R as unknown) as mat4);
    mat4.invert(G_denom, G_denom);
    mat4.mul(G, P_pre, G_denom);

    vec4.sub(tmp4, Y, X_pre);
    vec4.transformMat4(tmp4, tmp4, G);
    vec4.add(X_post, X_post, tmp4);

    mat4.sub(G, I, G);
    mat4.mul(P_post, G, P_pre);

    return Array.from(X_post) as V4;
  };

  return quatFilter;
};

const mapQuatToMat4 = (out: mat4, ...[x, y, z, w]: V4) => {
  mat4.set(
    out,
     w, -z,  y, -x, // eslint-disable-line prettier/prettier
     z,  w, -x, -y, // eslint-disable-line prettier/prettier
    -y,  x,  w, -z, // eslint-disable-line prettier/prettier
     x,  y,  z,  w, // eslint-disable-line prettier/prettier
  );
};

export default createQuatFilter;
