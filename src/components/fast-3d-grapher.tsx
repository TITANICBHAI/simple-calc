"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Box, Play, Pause, RotateCcw, Download, Settings, Eye } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface SurfaceData {
  points: Point3D[];
  triangles: number[][];
  colors: string[];
}

// Fast mathematical function evaluator
class FastMathEvaluator {
  static evaluate(expression: string, x: number, y: number): number {
    try {
      // Replace common mathematical functions and constants
      let expr = expression
        .replace(/\bx\b/g, `(${x})`)
        .replace(/\by\b/g, `(${y})`)
        .replace(/\bpi\b/g, Math.PI.toString())
        .replace(/\be\b/g, Math.E.toString())
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/pow\(/g, 'Math.pow(')
        .replace(/\^/g, '**');

      return Function(`"use strict"; return (${expr})`)();
    } catch (error) {
      return 0;
    }
  }
}

// Fast 3D surface generator
class Fast3DSurfaceGenerator {
  static generateSurface(
    expression: string,
    xRange: [number, number],
    yRange: [number, number],
    resolution: number
  ): SurfaceData {
    const points: Point3D[] = [];
    const triangles: number[][] = [];
    const colors: string[] = [];

    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    
    const stepX = (xMax - xMin) / resolution;
    const stepY = (yMax - yMin) / resolution;

    let minZ = Infinity;
    let maxZ = -Infinity;
    const zValues: number[] = [];

    // Generate points
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = xMin + i * stepX;
        const y = yMin + j * stepY;
        const z = FastMathEvaluator.evaluate(expression, x, y);
        
        if (isFinite(z)) {
          points.push({ x, y, z });
          zValues.push(z);
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        } else {
          points.push({ x, y, z: 0 });
          zValues.push(0);
        }
      }
    }

    // Generate triangles and colors
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const index = i * (resolution + 1) + j;
        
        // Create two triangles for each grid square
        triangles.push([
          index,
          index + 1,
          index + resolution + 1
        ]);
        
        triangles.push([
          index + 1,
          index + resolution + 2,
          index + resolution + 1
        ]);

        // Color based on height
        const zNorm = (zValues[index] - minZ) / (maxZ - minZ || 1);
        const color = this.heightToColor(zNorm);
        colors.push(color, color);
      }
    }

    return { points, triangles, colors };
  }

  private static heightToColor(normalized: number): string {
    // Create a blue to red gradient
    const r = Math.floor(255 * normalized);
    const g = Math.floor(255 * (1 - Math.abs(normalized - 0.5) * 2));
    const b = Math.floor(255 * (1 - normalized));
    
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Simple 3D renderer using Canvas
const Canvas3DRenderer: React.FC<{
  surfaceData: SurfaceData;
  wireframe: boolean;
  rotation: { x: number; y: number };
  zoom: number;
}> = ({ surfaceData, wireframe, rotation, zoom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !surfaceData.points.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Simple 3D projection
    const project = (point: Point3D) => {
      const { x, y, z } = point;
      
      // Apply rotation
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      const x1 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      // Project to 2D
      const scale = zoom * 50;
      const projX = width / 2 + x1 * scale;
      const projY = height / 2 - y1 * scale;

      return { x: projX, y: projY, z: z2 };
    };

    const projectedPoints = surfaceData.points.map(project);

    if (wireframe) {
      // Draw wireframe
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;

      for (const triangle of surfaceData.triangles) {
        const [a, b, c] = triangle.map(i => projectedPoints[i]);
        if (a && b && c) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineTo(c.x, c.y);
          ctx.closePath();
          ctx.stroke();
        }
      }
    } else {
      // Draw filled triangles
      surfaceData.triangles.forEach((triangle, index) => {
        const [a, b, c] = triangle.map(i => projectedPoints[i]);
        if (a && b && c) {
          ctx.fillStyle = surfaceData.colors[index] || '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineTo(c.x, c.y);
          ctx.closePath();
          ctx.fill();
        }
      });
    }

    // Draw axes
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    
    const origin = project({ x: 0, y: 0, z: 0 });
    const xAxis = project({ x: 2, y: 0, z: 0 });
    const yAxis = project({ x: 0, y: 2, z: 0 });
    const zAxis = project({ x: 0, y: 0, z: 2 });

    // X axis (red)
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();

    // Y axis (green)
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();

    // Z axis (blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();

  }, [surfaceData, wireframe, rotation, zoom]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="border rounded-lg bg-gray-900"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default function Fast3DGrapher() {
  const [expression, setExpression] = useState('sin(sqrt(x*x + y*y))');
  const [xRange, setXRange] = useState<[number, number]>([-3, 3]);
  const [yRange, setYRange] = useState<[number, number]>([-3, 3]);
  const [resolution, setResolution] = useState([25]);
  const [wireframe, setWireframe] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = useState([3]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animationRef = useRef<number>();

  // Generate surface data
  const surfaceData = useMemo(() => {
    try {
      setError(null);
      return Fast3DSurfaceGenerator.generateSurface(
        expression,
        xRange,
        yRange,
        resolution[0]
      );
    } catch (err) {
      setError('Invalid expression or calculation error');
      return { points: [], triangles: [], colors: [] };
    }
  }, [expression, xRange, yRange, resolution]);

  // Animation loop - disabled to prevent rotation issues
  useEffect(() => {
    // Auto-rotation disabled for better user experience
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  const presetFunctions = [
    { name: 'Wave', expr: 'sin(sqrt(x*x + y*y))' },
    { name: 'Paraboloid', expr: 'x*x + y*y' },
    { name: 'Saddle', expr: 'x*x - y*y' },
    { name: 'Ripple', expr: 'sin(x) * cos(y)' },
    { name: 'Gaussian', expr: 'exp(-(x*x + y*y))' },
    { name: 'Spiral', expr: 'sin(x + y) * exp(-0.1*(x*x + y*y))' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-6 w-6" />
            Fast 3D Function Grapher
            <Badge variant="secondary">Optimized</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            High-performance 3D visualization with real-time rendering
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Function Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="expression">Function: f(x,y) =</Label>
              <Input
                id="expression"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter function (e.g., sin(sqrt(x*x + y*y)))"
                className="font-mono"
              />
            </div>

            {/* Preset Functions */}
            <div className="flex flex-wrap gap-2">
              {presetFunctions.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setExpression(preset.expr)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Range Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>X Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={xRange[0]}
                  onChange={(e) => setXRange([parseFloat(e.target.value), xRange[1]])}
                  className="w-20"
                />
                <span className="self-center">to</span>
                <Input
                  type="number"
                  value={xRange[1]}
                  onChange={(e) => setXRange([xRange[0], parseFloat(e.target.value)])}
                  className="w-20"
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
                  className="w-20"
                />
                <span className="self-center">to</span>
                <Input
                  type="number"
                  value={yRange[1]}
                  onChange={(e) => setYRange([yRange[0], parseFloat(e.target.value)])}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Resolution: {resolution[0]}</Label>
              <Slider
                value={resolution}
                onValueChange={setResolution}
                min={10}
                max={50}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Zoom: {zoom[0].toFixed(1)}x</Label>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={0.5}
                max={10}
                step={0.1}
                className="mt-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="wireframe"
                  checked={wireframe}
                  onCheckedChange={setWireframe}
                />
                <Label htmlFor="wireframe">Wireframe</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                >
                  {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isAnimating ? 'Pause' : 'Animate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation({ x: 0.5, y: 0.5 })}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 3D Visualization */}
          <div className="flex justify-center">
            <Canvas3DRenderer
              surfaceData={surfaceData}
              wireframe={wireframe}
              rotation={rotation}
              zoom={zoom[0]}
            />
          </div>

          {/* Manual Rotation Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>X Rotation: {rotation.x.toFixed(2)}</Label>
              <Slider
                value={[rotation.x]}
                onValueChange={([value]) => setRotation(prev => ({ ...prev, x: value }))}
                min={0}
                max={Math.PI * 2}
                step={0.1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Y Rotation: {rotation.y.toFixed(2)}</Label>
              <Slider
                value={[rotation.y]}
                onValueChange={([value]) => setRotation(prev => ({ ...prev, y: value }))}
                min={0}
                max={Math.PI * 2}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Use mathematical functions: sin, cos, tan, sqrt, exp, log</p>
            <p>• Variables: x, y | Constants: pi, e</p>
            <p>• Example: sin(x)*cos(y), x*x + y*y, exp(-(x*x + y*y))</p>
            <p>• Points rendered: {surfaceData.points.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}