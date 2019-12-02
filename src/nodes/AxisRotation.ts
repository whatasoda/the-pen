import vn from 'vector-node';
import { vec3, quat } from 'gl-matrix';

interface Props {
  axis: vec3;
}

const AxisRotation = vn.defineNode(
  {
    nodeType: 'AxisRotation',
    inputs: {
      rotationQuat: 'f32-4-moment',
    },
    output: 'f32-1-moment',
  },
  ({ axis }: Props) => {
    const tmp = vec3.create();
    return ({ inputs, output }) => {
      const angle = quat.getAxisAngle(tmp, inputs.rotationQuat.value);
      vec3.dot(axis, tmp);
      output.value[0] = angle * vec3.dot(axis, tmp);
    };
  },
);

export default AxisRotation;
