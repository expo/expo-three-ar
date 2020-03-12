import { AR } from 'expo';
import { GraphicsView } from 'expo-graphics';
import { Renderer, THREE } from 'expo-three';
import { BackgroundTexture, Camera } from 'expo-three-ar';
import * as React from 'react';
import { Platform, View } from 'react-native';

let renderer, scene, camera;

export default function App() {
  if (Platform.OS !== 'ios') return null;

  const onContextCreate = async ({ gl, pixelRatio, width, height }) => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

    // await addDetectionImageAsync(image);

    renderer = new Renderer({ gl, pixelRatio, width, height });
    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;
    // renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();
    scene.background = new BackgroundTexture(renderer);

    camera = new Camera(width, height, 0.01, 1000);

    // Make a cube - notice that each unit is 1 meter in real life, we will make our box 0.1 meters
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    // Simple color material
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
    });

    // Combine our geometry and material
    const cube = new THREE.Mesh(geometry, material);
    // Place the box 0.4 meters in front of us.
    cube.position.z = -0.4
    // Add the cube to the scene
    scene.add(cube);
    // Setup a light so we can see the cube color
    // AmbientLight colors all things in the scene equally.
    scene.add(new THREE.AmbientLight(0xffffff));
  };

  const onResize = ({ scale, width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(scale);
    renderer.setSize(width, height);
  };

  const onRender = delta => {
    // if (mesh) {
    //   mesh.update(delta);
    // }

    renderer.render(scene, camera);
  };

  return (
    <View style={{ flex: 1 }}>
      <GraphicsView
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
        onRender={onRender}
        onResize={onResize}
        isArEnabled
        isArRunningStateEnabled
        isArCameraStateEnabled
      />

    </View>
  );
}
