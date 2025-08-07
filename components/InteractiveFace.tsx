'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEditor, FaceData } from './EditorContext';

interface InteractiveFaceProps {
  face: FaceData;
}

export function InteractiveFace({ face }: InteractiveFaceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { 
    selectedFace, 
    setSelectedFace, 
    highlightFace, 
    editMode 
  } = useEditor();

  const isSelected = selectedFace === face.id;
  const isHighlighted = face.highlighted || hovered;

  const geometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array(9); 
    
    if (face.vertices.length >= 3) {
      vertices[0] = face.vertices[0].x;
      vertices[1] = face.vertices[0].y;
      vertices[2] = face.vertices[0].z;
      
      vertices[3] = face.vertices[1].x;
      vertices[4] = face.vertices[1].y;
      vertices[5] = face.vertices[1].z;
      
      vertices[6] = face.vertices[2].x;
      vertices[7] = face.vertices[2].y;
      vertices[8] = face.vertices[2].z;
    }
    
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    
    return geom;
  }, [face.vertices]);

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (editMode === 'face') {
      setSelectedFace(isSelected ? null : face.id);
      highlightFace(isSelected ? null : face.id);
    }
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    if (editMode === 'face') {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  useFrame(() => {
    if (meshRef.current && isHighlighted) {
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.02;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const materialColor = isSelected 
    ? '#fbbf24' 
    : isHighlighted 
      ? '#60a5fa' 
      : face.color;

  const opacity = editMode === 'face' ? 0.9 : 0.7;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <meshLambertMaterial
        color={materialColor}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}