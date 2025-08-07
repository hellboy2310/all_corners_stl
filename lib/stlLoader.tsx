import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';

export interface STLFace {
    normal: THREE.Vector3;
    vertices: THREE.Vector3[];
}

export async function loadSTLFile(url: string): Promise<STLFace[]> {
    try {
        const loader = new STLLoader();
        const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
            loader.load(
                url,
                (geometry) => resolve(geometry),
                undefined,
                (error) => reject(error)
            );
        });

        const faces: STLFace[] = [];

        const positionAttr = geometry.attributes.position;
        const normalAttr = geometry.attributes.normal;

        const positions = positionAttr.array;
        const normals = normalAttr?.array;

        for (let i = 0; i < positions.length; i += 9) {
            const vertices = [
                new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]),
                new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]),
                new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8])
            ];

            let normal: THREE.Vector3;

            if (normals) {
                const n1 = new THREE.Vector3(normals[i], normals[i + 1], normals[i + 2]);
                const n2 = new THREE.Vector3(normals[i + 3], normals[i + 4], normals[i + 5]);
                const n3 = new THREE.Vector3(normals[i + 6], normals[i + 7], normals[i + 8]);
                normal = new THREE.Vector3()
                    .add(n1)
                    .add(n2)
                    .add(n3)
                    .divideScalar(3)
                    .normalize();
            } else {
                const v1 = new THREE.Vector3().subVectors(vertices[1], vertices[0]);
                const v2 = new THREE.Vector3().subVectors(vertices[2], vertices[0]);
                normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
            }

            faces.push({ normal, vertices });
        }

        return faces;
    } catch (err) {
        console.error("Error loading STL file:", err);
        throw err;
    }
}
