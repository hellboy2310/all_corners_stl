'use client';

import React from 'react';
import { useEditor } from './EditorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Move3D, 
  Square, 
  Circle, 
  Minus,
  RotateCcw,
  Download,
  Upload,
  Settings
} from 'lucide-react';

const colorPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

export function ControlPanel() {
  const {
    editMode,
    setEditMode,
    selectedFace,
    selectedVertex,
    faces,
    vertices,
    updateFaceColor,
    updateVertexPosition,
    setSelectedFace,
    setSelectedVertex,
    highlightFace,
    highlightVertex
  } = useEditor();

  const selectedFaceData = faces.find(f => f.id === selectedFace);
  const selectedVertexData = vertices.find(v => v.id === selectedVertex);

  const handleVertexSliderChange = (vertexId: number, axis: 'x' | 'y' | 'z', value: number[]) => {
    const vertex = vertices.find(v => v.id === vertexId);
    if (vertex) {
      const newPosition = vertex.position.clone();
      newPosition[axis] = value[0];
      updateVertexPosition(vertexId, newPosition);
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedFace !== null) {
      updateFaceColor(selectedFace, color);
    }
  };

  const clearSelection = () => {
    setSelectedFace(null);
    setSelectedVertex(null);
    highlightFace(null);
    highlightVertex(null);
  };

  return (
    <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Square className="w-5 h-5" />
            STL Cube Editor
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Edit Mode Selection */}
          <div>
            <h3 className="text-sm font-medium mb-2">Edit Mode</h3>
            <div className="flex gap-1">
              <Button
                variant={editMode === 'face' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode('face')}
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-1" />
                Face
              </Button>
              <Button
                variant={editMode === 'vertex' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode('vertex')}
                className="flex-1"
              >
                <Circle className="w-4 h-4 mr-1" />
                Vertex
              </Button>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div>
            <h3 className="text-sm font-medium mb-2">Model Info</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Faces</div>
                <div className="text-gray-600">{faces.length}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Vertices</div>
                <div className="text-gray-600">{vertices.length}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded col-span-2">
                <div className="font-medium">Source</div>
                <div className="text-gray-600">cube.stl</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Selection Info */}
          {(selectedFace !== null || selectedVertex !== null) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Selection</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-6 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
              
              {selectedFaceData && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    Face #{selectedFaceData.id}
                  </Badge>
                  <div className="text-xs text-gray-600">
                    Normal: ({selectedFaceData.normal.x.toFixed(2)}, {selectedFaceData.normal.y.toFixed(2)}, {selectedFaceData.normal.z.toFixed(2)})
                  </div>
                </div>
              )}
              
              {selectedVertexData && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    Vertex #{selectedVertexData.id}
                  </Badge>
                  <div className="text-xs text-gray-600">
                    Position: ({selectedVertexData.position.x.toFixed(2)}, {selectedVertexData.position.y.toFixed(2)}, {selectedVertexData.position.z.toFixed(2)})
                  </div>
                  <div className="text-xs text-gray-600">
                    Connected to {selectedVertexData.connectedFaces.length} faces
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Color Palette */}
          {selectedFace !== null && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Face Color
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
                {selectedFaceData && (
                  <div className="mt-2 text-xs text-gray-600">
                    Current: {selectedFaceData.color}
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Vertex Sliders */}
          {editMode === 'vertex' && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Corner Controls
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {vertices.map((vertex) => (
                    <div key={vertex.id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium mb-2">
                        Corner {vertex.id + 1}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600">X: {vertex.position.x.toFixed(2)}</label>
                          <Slider
                            value={[vertex.position.x]}
                            onValueChange={(value) => handleVertexSliderChange(vertex.id, 'x', value)}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Y: {vertex.position.y.toFixed(2)}</label>
                          <Slider
                            value={[vertex.position.y]}
                            onValueChange={(value) => handleVertexSliderChange(vertex.id, 'y', value)}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Z: {vertex.position.z.toFixed(2)}</label>
                          <Slider
                            value={[vertex.position.z]}
                            onValueChange={(value) => handleVertexSliderChange(vertex.id, 'z', value)}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Instructions */}
          <div>
            <h3 className="text-sm font-medium mb-2">Instructions</h3>
            <div className="text-xs text-gray-600 space-y-1">
              {editMode === 'face' && (
                <>
                  <div>• Click faces to select and color them</div>
                  <div>• Selected faces are highlighted in yellow</div>
                </>
              )}
              {editMode === 'vertex' && (
                <>
                  <div>• Click vertices to select them</div>
                  <div>• Use sliders to resize and reshape the cube</div>
                  <div>• Drag vertices directly in 3D space</div>
                  <div>• Move corners to make the cube bigger or smaller</div>
                </>
              )}
              {editMode === 'edge' && (
                <>
                  <div>• Drag vertices along edges</div>
                  <div>• Edges are shown as gray lines</div>
                </>
              )}
              <div>• Use mouse to orbit, zoom, and pan</div>
            </div>
          </div>

          
        </CardContent>
      </Card>
    </div>
  );
}