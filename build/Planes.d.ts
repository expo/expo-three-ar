import { THREE } from 'expo-three';
import { PlaneAnchor } from 'expo/build/AR';
declare class Planes extends THREE.Object3D {
    common: {};
    _data: PlaneAnchor[];
    segments: number;
    defaultRotationX: number;
    planeMaterial: THREE.MeshBasicMaterial;
    data: PlaneAnchor[];
    update: () => void;
}
export default Planes;
