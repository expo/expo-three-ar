// @ts-ignore
import { AR } from 'expo';
import { THREE } from 'expo-three';

class BackgroundTexture extends THREE.Texture {
  constructor(renderer: THREE.WebGLRenderer) {
    super();
    const properties = renderer.properties.get(this);
    properties.__webglInit = true;
    // @ts-ignore
    properties.__webglTexture = new WebGLTexture(AR.getCameraTexture());
  }
}

export default BackgroundTexture;
