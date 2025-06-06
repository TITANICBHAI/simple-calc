"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
// Temporarily disabled due to React compatibility issues
// import { Canvas, useFrame, useThree } from '@react-three/fiber';
// import { OrbitControls, Text, Grid } from '@react-three/drei';
// import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, RotateCcw, Download, Eye, EyeOff } from 'lucide-react';
import { parseExpression, type ASTNode } from '@/lib/math-parser/symbolicParser';
import { evaluateAST } from '@/lib/math-parser/symbolicEvaluator';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface GraphingEngineProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

// Function to safely evaluate mathematical expressions
const safeEvaluate = (expression: string, variables: Record<string, number>): number => {
  try {
    const ast = parseExpression(expression);
    const result = evaluateAST(ast, variables);
    return typeof result === 'number' ? result : NaN;
  } catch (error) {
    return NaN;
  }
};

// Generate surface points for 3D plotting
const generateSurfacePoints = (
  expression: string,
  xRange: [number, number],
  yRange: [number, number],
  resolution: number
): Point3D[] => {
  const points: Point3D[] = [];
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const stepX = (xMax - xMin) / resolution;
  const stepY = (yMax - yMin) / resolution;

  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const x = xMin + i * stepX;
      const y = yMin + j * stepY;
      const z = safeEvaluate(expression, { x, y });
      
      if (isFinite(z)) {
        points.push({ x, y, z });
      }
    }
  }
  
  return points;
};

// Generate parametric curve points
const generateParametricPoints = (
  xExpr: string,
  yExpr: string,
  zExpr: string,
  tRange: [number, number],
  resolution: number
): Point3D[] => {
  const points: Point3D[] = [];
  const [tMin, tMax] = tRange;
  const step = (tMax - tMin) / resolution;

  for (let i = 0; i <= resolution; i++) {
    const t = tMin + i * step;
    const x = safeEvaluate(xExpr, { t });
    const y = safeEvaluate(yExpr, { t });
    const z = safeEvaluate(zExpr, { t });
    
    if (isFinite(x) && isFinite(y) && isFinite(z)) {
      points.push({ x, y, z });
    }
  }
  
  return points;
};

// Temporary fallback component while fixing 3D compatibility
const Surface3D: React.FC<{ points: Point3D[]; color: string; wireframe: boolean }> = ({ 
  points, 
  color, 
  wireframe 
}) => {
  return <div>3D Surface ({points.length} points)</div>;
};

// Temporary fallback component while fixing 3D compatibility
const ParametricCurve: React.FC<{ points: Point3D[]; color: string; thickness: number }> = ({ 
  points, 
  color, 
  thickness 
}) => {
  return <div>3D Parametric Curve ({points.length} points)</div>;
};

// Temporary fallback component while fixing 3D compatibility
const CoordinateAxes: React.FC<{ size: number; showLabels: boolean }> = ({ size, showLabels }) => {
  return <div>3D Coordinate Axes (X, Y, Z)</div>;
};

// Enhanced 3D Visualization Component
const Scene3D: React.FC<{
  surfacePoints: Point3D[];
  parametricPoints: Point3D[];
  showAxes: boolean;
  showGrid: boolean;
  wireframe: boolean;
  animate: boolean;
}> = ({ surfacePoints, parametricPoints, showAxes, showGrid, wireframe, animate }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
      <div className="text-center space-y-4">
        <div className="text-4xl">📊</div>
        <h3 className="text-lg font-semibold text-blue-700">Enhanced 3D Visualization Available</h3>
        <p className="text-sm text-blue-600 max-w-md mx-auto">
          Advanced 3D plotting with educational features is now available! 
          Use the Enhanced 3D tab for gradient vectors, critical points, and interactive visualization.
        </p>
        <div className="text-sm text-blue-500 space-y-1">
          {surfacePoints.length > 0 && <div>✓ Surface points calculated: {surfacePoints.length}</div>}
          {parametricPoints.length > 0 && <div>✓ Parametric points calculated: {parametricPoints.length}</div>}
          {showAxes && <div>✓ Coordinate axes ready</div>}
          {showGrid && <div>✓ Grid overlay ready</div>}
        </div>
        <Button 
          onClick={() => window.dispatchEvent(new CustomEvent('switchTo3DTab'))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Open Enhanced 3D Visualization
        </Button>
      </div>
    </div>
  );
};

export const ThreeDGraphingEngine: React.FC<GraphingEngineProps> = ({ onResult, onError }) => {
  // State for surface plotting
  const [surfaceExpression, setSurfaceExpression] = useState('sin(sqrt(x^2 + y^2))');
  const [xRange, setXRange] = useState<[number, number]>([-5, 5]);
  const [yRange, setYRange] = useState<[number, number]>([-5, 5]);
  
  // State for parametric curves
  const [parametricX, setParametricX] = useState('cos(t)');
  const [parametricY, setParametricY] = useState('sin(t)');
  const [parametricZ, setParametricZ] = useState('t/5');
  const [tRange, setTRange] = useState<[number, number]>([0, 10]);
  
  // UI state
  const [resolution, setResolution] = useState([50]);
  const [plotType, setPlotType] = useState<'surface' | 'parametric'>('surface');
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate points based on current settings
  const surfacePoints = useMemo(() => {
    if (plotType !== 'surface') return [];
    try {
      setError(null);
      return generateSurfacePoints(surfaceExpression, xRange, yRange, resolution[0]);
    } catch (err) {
      const errorMsg = `Surface plotting error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      onError?.(errorMsg);
      return [];
    }
  }, [surfaceExpression, xRange, yRange, resolution, plotType, onError]);
  
  const parametricPoints = useMemo(() => {
    if (plotType !== 'parametric') return [];
    try {
      setError(null);
      return generateParametricPoints(parametricX, parametricY, parametricZ, tRange, resolution[0] * 2);
    } catch (err) {
      const errorMsg = `Parametric plotting error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      onError?.(errorMsg);
      return [];
    }
  }, [parametricX, parametricY, parametricZ, tRange, resolution, plotType, onError]);

  const handlePlot = () => {
    const pointCount = plotType === 'surface' ? surfacePoints.length : parametricPoints.length;
    onResult?.(`Generated ${pointCount} points for ${plotType} plot`);
  };

  const handleReset = () => {
    if (plotType === 'surface') {
      setSurfaceExpression('sin(sqrt(x^2 + y^2))');
      setXRange([-5, 5]);
      setYRange([-5, 5]);
    } else {
      setParametricX('cos(t)');
      setParametricY('sin(t)');
      setParametricZ('t/5');
      setTRange([0, 10]);
    }
    setResolution([50]);
    setAnimate(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            3D Mathematical Graphing Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={plotType} onValueChange={(value) => setPlotType(value as 'surface' | 'parametric')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="surface">Surface Plot (z = f(x,y))</TabsTrigger>
              <TabsTrigger value="parametric">Parametric Curve</TabsTrigger>
            </TabsList>
            
            <TabsContent value="surface" className="space-y-4">
              <div>
                <Label htmlFor="surface-expr">Surface Expression (z = f(x,y))</Label>
                <Input
                  id="surface-expr"
                  value={surfaceExpression}
                  onChange={(e) => setSurfaceExpression(e.target.value)}
                  placeholder="sin(sqrt(x^2 + y^2))"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>X Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={xRange[0]}
                      onChange={(e) => setXRange([parseFloat(e.target.value), xRange[1]])}
                      placeholder="Min X"
                    />
                    <Input
                      type="number"
                      value={xRange[1]}
                      onChange={(e) => setXRange([xRange[0], parseFloat(e.target.value)])}
                      placeholder="Max X"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Y Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={yRange[0]}
                      onChange={(e) => setYRange([parseFloat(e.target.value), yRange[1]])}
                      placeholder="Min Y"
                    />
                    <Input
                      type="number"
                      value={yRange[1]}
                      onChange={(e) => setYRange([yRange[0], parseFloat(e.target.value)])}
                      placeholder="Max Y"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="parametric" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="param-x">X(t)</Label>
                  <Input
                    id="param-x"
                    value={parametricX}
                    onChange={(e) => setParametricX(e.target.value)}
                    placeholder="cos(t)"
                  />
                </div>
                <div>
                  <Label htmlFor="param-y">Y(t)</Label>
                  <Input
                    id="param-y"
                    value={parametricY}
                    onChange={(e) => setParametricY(e.target.value)}
                    placeholder="sin(t)"
                  />
                </div>
                <div>
                  <Label htmlFor="param-z">Z(t)</Label>
                  <Input
                    id="param-z"
                    value={parametricZ}
                    onChange={(e) => setParametricZ(e.target.value)}
                    placeholder="t/5"
                  />
                </div>
              </div>
              
              <div>
                <Label>Parameter Range (t)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={tRange[0]}
                    onChange={(e) => setTRange([parseFloat(e.target.value), tRange[1]])}
                    placeholder="Min t"
                  />
                  <Input
                    type="number"
                    value={tRange[1]}
                    onChange={(e) => setTRange([tRange[0], parseFloat(e.target.value)])}
                    placeholder="Max t"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4">
            <div>
              <Label>Resolution: {resolution[0]}</Label>
              <Slider
                value={resolution}
                onValueChange={setResolution}
                max={100}
                min={10}
                step={10}
                className="mt-2"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handlePlot}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Plot Graph
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setAnimate(!animate)}
                className="flex items-center gap-2"
              >
                {animate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {animate ? 'Stop' : 'Animate'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowAxes(!showAxes)}
                className="flex items-center gap-2"
              >
                {showAxes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Axes
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setWireframe(!wireframe)}
                className="flex items-center gap-2"
              >
                Wireframe
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full">
            <Scene3D
              surfacePoints={surfacePoints}
              parametricPoints={parametricPoints}
              showAxes={showAxes}
              showGrid={showGrid}
              wireframe={wireframe}
              animate={animate}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};