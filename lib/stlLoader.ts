import * as THREE from 'three';

export interface STLFace {
  normal: THREE.Vector3;
  vertices: THREE.Vector3[];
}

export function parseSTL(stlContent: string): STLFace[] {
  const faces: STLFace[] = [];
  const lines = stlContent.split('\n');
  
  let currentFace: Partial<STLFace> = {};
  let vertexCount = 0;
  let vertices: THREE.Vector3[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('facet normal')) {
      const parts = trimmed.split(/\s+/);
      const x = parseFloat(parts[2]);
      const y = parseFloat(parts[3]);
      const z = parseFloat(parts[4]);
      currentFace.normal = new THREE.Vector3(x, y, z);
      vertices = [];
      vertexCount = 0;
    } else if (trimmed.startsWith('vertex')) {
      const parts = trimmed.split(/\s+/);
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);
      vertices.push(new THREE.Vector3(x, y, z));
      vertexCount++;
    } else if (trimmed === 'endfacet') {
      if (currentFace.normal && vertices.length === 3) {
        faces.push({
          normal: currentFace.normal,
          vertices: vertices
        });
      }
      currentFace = {};
    }
  }
  
  return faces;
}

export async function loadSTLFile(filePath: string): Promise<STLFace[]> {
  try {
    const response = await fetch(filePath);
    const stlContent = await response.text();
    return parseSTL(stlContent);
  } catch (error) {
    console.error('Error loading STL file:', error);
    throw error;
  }
}