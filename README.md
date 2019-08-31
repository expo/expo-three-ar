[![NPM](https://nodei.co/npm/expo-three-ar.png)](https://nodei.co/npm/expo-three-ar/)

# expo-three-ar

Tools for using three.js to build native AR experiences with Expo. This library is **iOS** only.

> This library is a side-project and should not be considered production ready

### Installation

```bash
yarn add three expo-three-ar
```

### Usage

Import the library into your JavaScript file:

```js
import * as ThreeAR from 'expo-three-ar';
```

#### Enabling AR

- `expo-gl`: call `AR.startAsync(gl)` after `GLView.onContextCreate` has been called.
- `expo-graphics`: you need to add the `isArEnabled={true}` prop

### `new BackgroundTexture(renderer: WebGLRenderingContext)`

extends a [`THREE.Texture`](https://threejs.org/docs/#api/textures/Texture) that
reflects the live video feed of the AR session. Usually this is set as the
`.background` property of a
[`THREE.Scene`](https://threejs.org/docs/#api/scenes/Scene) to render the video
feed behind the scene's objects.

```js
// viewport width/height & zNear/zFar
scene.background = new BackgroundTexture(renderer);
```

See: [Basic Demo](/example/screens/AR/Basic.js)

### `new Camera(width: number, height: number, zNear: number, zFar: number)`

extends a [`THREE.PerspectiveCamera`](https://threejs.org/docs/#api/cameras/PerspectiveCamera)
that automatically updates its view and projection matrices to reflect the AR
session camera. `width, height` specify the dimensions of the target viewport to
render to and `near, far` specify the near and far clipping distances
respectively. The `THREE.PerspectiveCamera` returned has its `updateMatrixWorld`
and `updateProjectionMatrix` methods overriden to update to the AR session's
state automatically.
`THREE.PerspectiveCamera` that updates it's transform based on the device's orientation.

```js
// viewport width/height & zNear/zFar
const camera = new Camera(width, height, 0.01, 1000);
```

See: [Basic Demo](/example/screens/AR/Basic.js)

### `new Light()`

`THREE.PointLight` that will update it's color and intensity based on ARKit's assumption of the room lighting.

```js
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ReinhardToneMapping;

const arPointLight = new Light();
arPointLight.position.y = 2;
scene.add(arPointLight);

// You should also add a Directional for shadows
const shadowLight = new THREE.DirectionalLight();
scene.add(shadowLight);
// If you would like to move the light (you would) then you will need to add the lights `target` to the scene.
// The shadowLight.position adjusts one side of the light vector, and the target.position represents the other.
scene.add(shadowLight.target);

...
// Call this every frame:
arPointLight.update()
```

See: [Model Demo](/example/screens/AR/Model.js)

### `new MagneticObject()`

A `THREE.Mesh` that sticks to surfaces.
Use this as a parent to models that you want to attach to surfaces.

```js
const magneticObject = new MagneticObject();
magneticObject.maintainScale = false; // This will scale the mesh up/down to preserve it's size regardless of distance.
magneticObject.maintainRotation = true; // When true the mesh will orient itself to face the camera.

// screenCenter is a normalized value = { 0.5, 0.5 }
const screenCenter = new THREE.Vector2(0.5, 0.5);
...

// Call this every frame to update the position.
magneticObject.update(camera, screenCenter);
```

See: [Model Demo](/example/screens/AR/Model.js)

### `new ShadowFloor()`

A transparent plane that extends `THREE.Mesh` and receives shadows from other meshes.
This is used to render shadows on real world surfaces.

```js
renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
const shadowFloor = new ShadowFloor({
  width: 1,
  height: 1,
  opacity: 0.6,
}); // The opacity of the shadow
```

See: [Model Demo](/example/screens/AR/Model.js)

### `new CubeTexture()`

Used to load in a texture cube or skybox.

- `assetForDirection`: This function will be called for each of the 6
  directions.
  - `({ direction })`: A direction string will be passed back looking for the
    corresponding image. You can send back: `static resource`, `localUri`,
    `Expo.Asset`, `remote image url`
- `directions`: The order that image will be requested in. The default value is:
  `['px', 'nx', 'py', 'ny', 'pz', 'nz']`

Example:

```js
const skybox = {
  nx: require('./nx.jpg'),
  ny: require('./ny.jpg'),
  nz: require('./nz.jpg'),
  px: require('./px.jpg'),
  py: require('./py.jpg'),
  pz: require('./pz.jpg'),
};
const cubeTexture = new CubeTexture();
await cubeTexture.loadAsync({
  assetForDirection: ({ direction }) => skybox[direction],
});
scene.background = cubeTexture;
```

### `new Points()`

A utility object that renders all the raw feature points.

```js
const points = new Points();
// Then call this each frame...
points.update();
```

See: [Points Demo](/example/screens/AR/Points.js)

### `new Planes()`

A utility object that renders all the ARPlaneAnchors

```js
const planes = new Planes();
// Then call this each frame...
planes.update();
```

See: [Planes Demo](/example/screens/AR/Planes.js)

## AR Functions

Three.js calculation utilites for working in ARKit.
Most of these functions are used for calculating the surfaces.
You should see if `MagneticObject()` has what you need before digging into these.
[You can also check out this example provided by Apple](https://developer.apple.com/sample-code/wwdc/2017/PlacingObjects.zip)

### hitTestWithFeatures(camera: THREE.Camera, point: THREE.Vector2, coneOpeningAngleInDegrees: number, minDistance: number, maxDistance: number, rawFeaturePoints: Array<any>)

#### Props

- camera: `THREE.Camera`
- point: `THREE.Vector2`
- coneOpeningAngleInDegrees: `number`
- minDistance: `number`
- maxDistance: `number`
- rawFeaturePoints: `Array<any>`

### hitTestWithPoint(camera: THREE.Camera, point: THREE.Vector2)

#### Props

- camera: `THREE.Camera`
- point: `THREE.Vector2`

### unprojectPoint(camera: THREE.Camera, point: THREE.Vector2)

#### Props

- camera: `THREE.Camera`
- point: `THREE.Vector2`

### hitTestRayFromScreenPos(camera: THREE.Camera, point: THREE.Vector2)

#### Props

- camera: `THREE.Camera`
- point: `THREE.Vector2`

### hitTestFromOrigin(origin: THREE.Vector3, direction: THREE.Vector3, rawFeaturePoints: ?Array<any>)

#### Props

- origin: `THREE.Vector3`
- direction: `THREE.Vector3`
- rawFeaturePoints: `?Array<any>`

### hitTestWithInfiniteHorizontalPlane(camera: THREE.Camera, point: Point, pointOnPlane: THREE.Vector3)

#### Props

- camera: `THREE.Camera`
- point: `THREE.Vector2`
- pointOnPlane: `THREE.Vector3`

### rayIntersectionWithHorizontalPlane(rayOrigin: THREE.Vector3, direction: THREE.Vector3, planeY: number)

#### Props

- rayOrigin: `THREE.Vector3`
- direction: `THREE.Vector3`
- planeY: `number`

### convertTransformArray(transform: Array<number>): THREE.Matrix4

#### Props

- transform: `number[]`

### positionFromTransform(transform: THREE.Matrix4): THREE.Vector3

#### Props

- transform: `THREE.Matrix4`

### worldPositionFromScreenPosition(camera: THREE.Camera, position: THREE.Vector2, objectPos: THREE.Vector3, infinitePlane = false, dragOnInfinitePlanesEnabled = false, rawFeaturePoints = null): { worldPosition: THREE.Vector3, planeAnchor: ARPlaneAnchor, hitAPlane: boolean }

#### Props

- camera: `THREE.Camera`
- position: `THREE.Vector2`
- objectPos: `THREE.Vector3`
- infinitePlane: `boolean = false`
- dragOnInfinitePlanesEnabled: `boolean = false`
- rawFeaturePoints: `any = null`

### positionFromAnchor(anchor: ARAnchor): THREE.Vector3

#### Props

- anchor: `{ worldTransform: Matrix4 }`

### improviseHitTest(point, camera: THREE.Camera): ?THREE.Vector3

#### Props

- point: `THREE.Vector2`
- camera: `THREE.Camera`
