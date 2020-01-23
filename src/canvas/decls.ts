import styled from 'styled-components';

export type EmptyFunction = () => void;
export type CameraFactory<P extends object> = (
  canvas: HTMLCanvasElement,
  props: Readonly<MutableContainer<P>>,
) => THREE.Camera;

export interface MutableContainer<P extends object> {
  current: P;
}

export interface ThreeCanvasUniforms<P extends object> extends Partial<TickCallbackMap<P>> {
  defaultCameraFactory?: CameraFactory<P>;
  rendererParameters?: Omit<THREE.WebGLRendererParameters, 'canvas'>;
  Canvas?: ReturnType<typeof styled.canvas>;
  Wrapper?: ReturnType<typeof styled.div>;
}

export interface CanvasInternal {
  three: InternalThree;
  scenes: Set<AnySceneRegistration>;
}

export interface InternalThree {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  defaultCamera: THREE.Camera;
}

export type TickCallback<P extends object> = (renderer: THREE.WebGLRenderer, param: P) => void;
export interface TickCallbackMap<P extends object> {
  beforeRender: TickCallback<P>;
  afterRender: TickCallback<P>;
}

// Scene
export interface SceneUniforms<P extends object> extends Partial<TickCallbackMap<SceneCallbackParam<P>>> {
  createCamera?: CameraFactory<P>;
  // priority?: number;
}

export type AnySceneRegistration = SceneRegistration<any>;
export interface SceneRegistration<P extends object> extends TickCallbackMap<SceneCallbackParam<P>> {
  scene: THREE.Scene;
  camera?: THREE.Camera;
  props: MutableContainer<P>;
}
export interface SceneCallbackParam<P extends object> {
  scene: THREE.Scene;
  camera: THREE.Camera;
  props: Readonly<MutableContainer<P>>;
}

export interface TickObject {
  curr: EmptyFunction;
}
