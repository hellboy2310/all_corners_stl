'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEditor } from './EditorContext';
import { InteractiveFace } from './InteractiveFace';
import { InteractiveVertex } from './InteractiveVertex';
import { EdgeHelper } from './EdgeHelper';
import { loadSTLFile, STLFace } from '@/lib/stlLoader';

export function STLCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [stlFaces, setStlFaces] = useState<STLFace[]>([]);
  const [loading, setLoading] = useState(true);
  const { setFaces, setVertices, faces, vertices } = useEditor();

  useEffect(() => {
    const loadSTL = async () => {
      try {
        setLoading(true);
        console.log('Loading STL file from /cube.stl...');
        const stlData = await loadSTLFile('/cube.stl');
        console.log('STL data loaded:', stlData.length, 'faces');
        console.log('First face:', stlData[0]);
        setStlFaces(stlData);
        
        const geom = new THREE.BufferGeometry();
        const positions: number[] = [];
        const normals: number[] = [];
        
        stlData.forEach(face => {
          face.vertices.forEach(vertex => {
            positions.push(vertex.x, vertex.y, vertex.z);
            normals.push(face.normal.x, face.normal.y, face.normal.z);
          });
        });
        
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        setGeometry(geom);
        
        const uniqueVertices = new Map<string, THREE.Vector3>();
        const extractedVertices: any[] = [];
        const extractedFaces: any[] = [];
        
        stlData.forEach(face => {
          face.vertices.forEach(vertex => {
            const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
            if (!uniqueVertices.has(key)) {
              uniqueVertices.set(key, vertex.clone());
            }
          });
        });
        
        Array.from(uniqueVertices.values()).forEach((vertex, index) => {
          extractedVertices.push({
            id: index,
            position: vertex.clone(),
            highlighted: false,
            connectedFaces: []
          });
        });
        
        stlData.forEach((face, faceIndex) => {
          extractedFaces.push({
            id: faceIndex,
            vertices: face.vertices.map(v => v.clone()),
            normal: face.normal.clone(),
            color: '#9ca3af', 
            highlighted: false,
            vertexIndices: face.vertices.map(vertex => {
              const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
              return Array.from(uniqueVertices.keys()).indexOf(key);
            })
          });
          
          face.vertices.forEach(vertex => {
            const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
            const vertexIndex = Array.from(uniqueVertices.keys()).indexOf(key);
            if (vertexIndex >= 0 && !extractedVertices[vertexIndex].connectedFaces.includes(faceIndex)) {
              extractedVertices[vertexIndex].connectedFaces.push(faceIndex);
            }
          });
        });
        
        setFaces(extractedFaces);
        setVertices(extractedVertices);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load STL file:', error);
        setLoading(false);
      }
    };
    
    loadSTL();
  }, [setFaces, setVertices]);

  useEffect(() => {
    if (vertices.length > 0 && faces.length > 0) {
      const updatedFaces = faces.map(face => {
        if (face.vertexIndices && face.vertexIndices.length === 3) {
          const updatedVertices = face.vertexIndices.map((vertexIndex: number) => 
            vertices[vertexIndex] ? vertices[vertexIndex].position.clone() : new THREE.Vector3()
          );
          
          if (updatedVertices.length === 3) {
            const v1 = new THREE.Vector3().subVectors(updatedVertices[1], updatedVertices[0]);
            const v2 = new THREE.Vector3().subVectors(updatedVertices[2], updatedVertices[0]);
            const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
            
            return {
              ...face,
              vertices: updatedVertices,
              normal
            };
          }
        }
        return face;
      });
      
      setFaces(updatedFaces);
    }
  }, [vertices]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  if (loading) {
    return null;
  }

  return (
    <group>
      {/* Render interactive faces */}
      {faces.map((face) => (
        <InteractiveFace key={face.id} face={face} />
      ))}
      
      {/* Render interactive vertices */}
      {vertices.map((vertex) => (
        <InteractiveVertex key={vertex.id} vertex={vertex} />
      ))}
      
      {/* Render edge helpers */}
      <EdgeHelper faces={faces} />
    </group>
  );
}