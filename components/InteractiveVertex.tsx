'use client';

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';
import { useEditor, VertexData } from './EditorContext';

interface InteractiveVertexProps {
  vertex: VertexData;
}

export function InteractiveVertex({ vertex }: InteractiveVertexProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { camera, gl } = useThree();
  
  const { 
    selectedVertex, 
    setSelectedVertex, 
    highlightVertex, 
    updateVertexPosition,
    editMode 
  } = useEditor();

  const isSelected = selectedVertex === vertex.id;
  const isHighlighted = vertex.highlighted || hovered;
  const isVisible = editMode === 'vertex' || editMode === 'edge';

  const bind = useDrag(
    ({ active, movement: [x, y], memo = vertex.position.clone() }) => {
      if (editMode !== 'vertex') return memo;
      
      setDragging(active);
      
      if (active && meshRef.current) {
        const newPosition = memo.clone();
        newPosition.x += x * 0.02;
        newPosition.y -= y * 0.02;
        
        updateVertexPosition(vertex.id, newPosition);
        
        return newPosition;
      }
      
      return memo;
    },
    { 
      enabled: editMode === 'vertex',
      pointer: { capture: false }
    }
  );

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (editMode === 'vertex') {
      setSelectedVertex(isSelected ? null : vertex.id);
      highlightVertex(isSelected ? null : vertex.id);
    }
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    if (isVisible) {
      document.body.style.cursor = editMode === 'vertex' ? 'grab' : 'pointer';
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (!dragging) {
      document.body.style.cursor = 'auto';
    }
  };

  useFrame(() => {
    if (meshRef.current && (isHighlighted || dragging)) {
      const scale = dragging ? 1.5 : 1 + Math.sin(Date.now() * 0.008) * 0.2;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  if (!isVisible) return null;

  const sphereColor = dragging 
    ? '#ef4444' 
    : isSelected 
      ? '#fbbf24' 
      : isHighlighted 
        ? '#60a5fa' 
        : '#8b5cf6';

  return (
    <mesh
      ref={meshRef}
      position={vertex.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...bind()}
    >
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshLambertMaterial
        color={sphereColor}
        transparent
        opacity={0.9}
      />
      {(isHighlighted || dragging) && (
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </mesh>
  );
}