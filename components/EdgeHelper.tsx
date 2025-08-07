'use client';

import React from 'react';
import * as THREE from 'three';
import { FaceData } from './EditorContext';

interface EdgeHelperProps {
  faces: FaceData[];
}

export function EdgeHelper({ faces }: EdgeHelperProps) {
  const edgeGeometry = React.useMemo(() => {
    const edges = new Set<string>();
    const points: THREE.Vector3[] = [];
    
    faces.forEach(face => {
      const vertices = face.vertices;
      for (let i = 0; i < vertices.length; i++) {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % vertices.length];
        
        const key1 = `${v1.x.toFixed(6)},${v1.y.toFixed(6)},${v1.z.toFixed(6)}`;
        const key2 = `${v2.x.toFixed(6)},${v2.y.toFixed(6)},${v2.z.toFixed(6)}`;
        const edgeKey = [key1, key2].sort().join('|');
        
        if (!edges.has(edgeKey)) {
          edges.add(edgeKey);
          points.push(v1.clone(), v2.clone());
        }
      }
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [faces]);

  return (
    <lineSegments geometry={edgeGeometry}>
      <lineBasicMaterial color="#64748b" transparent opacity={0.4} />
    </lineSegments>
  );
}