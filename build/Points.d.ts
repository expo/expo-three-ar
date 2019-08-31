import { RawFeaturePoint } from 'expo/build/AR';
import { THREE } from 'expo-three';
export default class Points extends THREE.Object3D {
    common: {
        [id: string]: THREE.Points;
    };
    _data: RawFeaturePoint[];
    material: THREE.PointsMaterial;
    data: RawFeaturePoint[];
    update: () => void;
}
