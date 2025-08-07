'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as THREE from 'three';

export interface FaceData {
  id: number;
  vertices: THREE.Vector3[];
  normal: THREE.Vector3;
  color: string;
  highlighted: boolean;
  vertexIndices: number[];
}

export interface VertexData {
  id: number;
  position: THREE.Vector3;
  highlighted: boolean;
  connectedFaces: number[];
}

interface EditorContextType {
  faces: FaceData[];
  vertices: VertexData[];
  selectedFace: number | null;
  selectedVertex: number | null;
  editMode: 'face' | 'vertex' | 'edge';
  setFaces: (faces: FaceData[]) => void;
  setVertices: (vertices: VertexData[]) => void;
  setSelectedFace: (id: number | null) => void;
  setSelectedVertex: (id: number | null) => void;
  setEditMode: (mode: 'face' | 'vertex' | 'edge') => void;
  updateFaceColor: (faceId: number, color: string) => void;
  updateVertexPosition: (vertexId: number, position: THREE.Vector3) => void;
  highlightFace: (faceId: number | null) => void;
  highlightVertex: (vertexId: number | null) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [faces, setFaces] = useState<FaceData[]>([]);
  const [vertices, setVertices] = useState<VertexData[]>([]);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<'face' | 'vertex' | 'edge'>('face');

  const updateFaceColor = (faceId: number, color: string) => {
    setFaces(prev => prev.map(face => 
      face.id === faceId ? { ...face, color } : face
    ));
  };

  const updateVertexPosition = (vertexId: number, position: THREE.Vector3) => {
    setVertices(prev => prev.map(vertex => 
      vertex.id === vertexId ? { ...vertex, position: position.clone() } : vertex
    ));
    
    setFaces(prev => prev.map(face => {
      const updatedVertices = face.vertices.map((vertex, index) => {
        const vertexIndex = vertices.findIndex(v => 
          Math.abs(v.position.x - vertex.x) < 0.001 &&
          Math.abs(v.position.y - vertex.y) < 0.001 &&
          Math.abs(v.position.z - vertex.z) < 0.001
        );
        
        if (vertexIndex === vertexId) {
          return position.clone();
        }
        return vertex;
      });
      
      if (updatedVertices.length >= 3) {
        const v1 = new THREE.Vector3().subVectors(updatedVertices[1], updatedVertices[0]);
        const v2 = new THREE.Vector3().subVectors(updatedVertices[2], updatedVertices[0]);
        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
        
        return {
          ...face,
          vertices: updatedVertices,
          normal
        };
      }
      
      return face;
    }));
  };

  const highlightFace = (faceId: number | null) => {
    setFaces(prev => prev.map(face => ({
      ...face,
      highlighted: false
    })));
    
    setFaces(prev => prev.map(face => ({
      ...face,
      highlighted: face.id === faceId
    })));
    
    if (faceId !== null) {
      setVertices(prev => prev.map(vertex => ({
        ...vertex,
        highlighted: false
      })));
    }
  };

  const highlightVertex = (vertexId: number | null) => {
    setVertices(prev => prev.map(vertex => ({
      ...vertex,
      highlighted: vertex.id === vertexId
    })));
  };

  return (
    <EditorContext.Provider value={{
      faces,
      vertices,
      selectedFace,
      selectedVertex,
      editMode,
      setFaces,
      setVertices,
      setSelectedFace,
      setSelectedVertex,
      setEditMode,
      updateFaceColor,
      updateVertexPosition,
      highlightFace,
      highlightVertex,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}