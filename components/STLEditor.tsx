'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { STLCube } from './STLCube';
import { ControlPanel } from './ControlPanel';
import { EditorProvider } from './EditorContext';

export default function STLEditor() {
  return (
    <EditorProvider>
      <div className="relative w-full h-full">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900"
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <STLCube />
            </Suspense>
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              dampingFactor={0.05}
            />
            
            <Environment preset="studio" />
          </Suspense>
        </Canvas>
        
        <ControlPanel />
      </div>
    </EditorProvider>
  );
}