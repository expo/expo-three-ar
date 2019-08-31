import { THREE } from 'expo-three';
import ARCamera from './Camera';
declare class MagneticObject extends THREE.Object3D {
    recentMagneticPositions: any[];
    anchorsOfVisitedPlanes: any[];
    maintainScale: boolean;
    maintainRotation: boolean;
    constructor();
    updateForAnchor: (position: THREE.Vector3, planeAnchor: any, camera: THREE.Camera) => void;
    update: (camera: ARCamera, screenPosition: any) => void;
    isValidVector: (vector: any) => boolean;
    updateTransform: (position: any, camera: any) => void;
    normalize: (angle: number, ref: number) => number;
    readonly worldPosition: THREE.Vector3;
    scaleBasedOnDistance: (camera: any) => number;
}
export default MagneticObject;
