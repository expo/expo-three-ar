import { AR } from 'expo';
import { Asset } from 'expo-asset';
import { GraphicsView } from 'expo-graphics';
import { loadDaeAsync, Renderer, THREE, utils } from 'expo-three';
import { BackgroundTexture, Camera, Light } from 'expo-three-ar';
import * as React from 'react';
import {
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import image from './marker.jpg';

let renderer, scene, camera, mesh;

const model = {
  'Stormtrooper_D.jpg': require(`./stormtrooper/Stormtrooper_D.jpg`),
  'stormtrooper.dae': require(`./stormtrooper/stormtrooper.dae`),
};
export default function App() {
  if (Platform.OS !== 'ios') return null;

  let timeout;

  const addDetectionImageAsync = async (resource, width = 0.254) => {
    let asset = Asset.fromModule(resource);
    await asset.downloadAsync();
    await AR.setDetectionImagesAsync({
      icon: {
        uri: asset.localUri,
        name: asset.name,
        width,
      },
    });
  };

  React.useEffect(() => {
    // When the provided image is found in real life, it'll be shown here.
    const handleImage = (anchor, eventType) => {
      const { transform } = anchor;
      if (!mesh) {
        return;
      }
      mesh.matrix.fromArray(transform);
      mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      if (eventType === AR.AnchorEventTypes.Add) {
        mesh.visible = true;
      } else if (eventType === AR.AnchorEventTypes.Remove) {
        mesh.visible = false;
      }
    };

    const anchorsDidUpdate = AR.onAnchorsDidUpdate(({ anchors, eventType }) => {
      for (const anchor of anchors) {
        if (anchor.type === AR.AnchorTypes.Image) {
          console.log('Found image', anchor);
          handleImage(anchor, eventType);
        }
      }
    });

    // Clear the animation loop when the component unmounts
    return () => {
      clearTimeout(timeout);
      anchorsDidUpdate.remove();
    };
  }, []);

  const onContextCreate = async ({ gl, pixelRatio, width, height }) => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

    await addDetectionImageAsync(image);

    renderer = new Renderer({ gl, pixelRatio, width, height });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();
    scene.background = new BackgroundTexture(renderer);

    camera = new Camera(width, height, 0.01, 1000);

    mesh = new CoolARGroup();
    scene.add(mesh);
  };

  const onResize = ({ scale, width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(scale);
    renderer.setSize(width, height);
  };

  const onRender = delta => {
    if (mesh) {
      mesh.update(delta);
    }

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
      <View
        style={{
          position: 'absolute',
          alignItems: 'stretch',
          justifyContent: 'flex-end',
          bottom: 12,
          right: 12,
          opacity: 0.5,
          width: '30%',
        }}
      >
        <Text>Point the camera at this image.</Text>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(
              'https://github.com/expo/expo-three-ar/blob/master/example/marker.jpg',
            );
          }}
        >
          <Image
            source={image}
            style={{ maxWidth: '100%', height: 100, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

class ShadowFloorMesh extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
    const material = new THREE.ShadowMaterial();
    material.opacity = 0.7;
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    super(geometry, material);
  }
}

class CoolARGroup extends THREE.Group {
  stormtrooper = new Stormtrooper();
  ambient = new Light();
  constructor() {
    super();

    this.add(this.stormtrooper);
    this.add(this.ambient);
    this.add(new ShadowLight());
    this.add(new ShadowFloorMesh());

    const point = new THREE.PointLight(0xffffff);
    point.position.set(2, 2, 2);
    this.add(point);
    this.visible = false;
  }

  update(delta) {
    if (!this.visible) return;
    if (this.stormtrooper.mixer) {
      this.stormtrooper.mixer.update(delta);
    }

    this.ambient.update();
  }
}

class Stormtrooper extends THREE.Group {
  mixer: THREE.AnimationMixer | null = null;

  constructor() {
    super();
    (async () => {
      const { scene, animations } = await loadDaeAsync({
        asset: model['stormtrooper.dae'],
        onAssetRequested: model,
      });
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.castShadow = true;

      utils.scaleLongestSideToSize(scene, 0.1);

      this.mixer = new THREE.AnimationMixer(scene);
      this.mixer.clipAction(animations[0]).play();
      this.add(scene);
    })();
  }
}

class ShadowLight extends THREE.DirectionalLight {
  constructor() {
    super(0xffffff, 0.6);
    this.position.set(0, 0.5, 0.1);
    this.castShadow = true;

    const shadowSize = 0.05;
    this.shadow.camera.left *= shadowSize;
    this.shadow.camera.right *= shadowSize;
    this.shadow.camera.top *= shadowSize;
    this.shadow.camera.bottom *= shadowSize;
    this.shadow.camera.near = 0.01;
    this.shadow.camera.far = 100;

    this.shadow.mapSize.width = 2048;
    this.shadow.mapSize.height = 2048;
  }
}
