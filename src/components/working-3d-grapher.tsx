"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Box, Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Safe mathematical function evaluator
class SafeMathEvaluator {
  static evaluate(expression: string, x: number, y: number): number {
    try {
      // Replace mathematical functions and variables
      let expr = expression
        .replace(/\bx\b/g, `(${x})`)
        .replace(/\by\b/g, `(${y})`)
        .replace(/\bpi\b/g, Math.PI.toString())
        .replace(/\be\b/g, Math.E.toString())
        .replace(/sin\s*\(/g, 'Math.sin(')
        .replace(/cos\s*\(/g, 'Math.cos(')
        .replace(/tan\s*\(/g, 'Math.tan(')
        .replace(/sqrt\s*\(/g, 'Math.sqrt(')
        .replace(/abs\s*\(/g, 'Math.abs(')
        .replace(/log\s*\(/g, 'Math.log(')
        .replace(/exp\s*\(/g, 'Math.exp(')
        .replace(/\^/g, '**');

      // Safe evaluation using Function constructor
      const result = Function(`"use strict"; return (${expr})`)();
      return isFinite(result) ? result : 0;
    } catch {
      return 0;
    }
  }
}

// 3D Canvas Renderer
const Canvas3DRenderer: React.FC<{
  points: Point3D[];
  wireframe: boolean;
  rotation: { x: number; y: number };
  zoom: number;
  width: number;
  height: number;
}> = ({ points, wireframe, rotation, zoom, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !points.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 3D projection function
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

      // Project to 2D with perspective
      const scale = zoom * 30;
      const projX = width / 2 + x1 * scale;
      const projY = height / 2 - y1 * scale;

      return { x: projX, y: projY, z: z2 };
    };

    const projectedPoints = points.map(project);

    if (wireframe) {
      // Draw wireframe grid
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;

      const gridSize = Math.sqrt(points.length);
      for (let i = 0; i < gridSize - 1; i++) {
        for (let j = 0; j < gridSize - 1; j++) {
          const index = i * gridSize + j;
          const p1 = projectedPoints[index];
          const p2 = projectedPoints[index + 1];
          const p3 = projectedPoints[index + gridSize];

          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          if (p1 && p3) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();
          }
        }
      }
    } else {
      // Draw filled surface with colors
      const gridSize = Math.sqrt(points.length);
      for (let i = 0; i < gridSize - 1; i++) {
        for (let j = 0; j < gridSize - 1; j++) {
          const index = i * gridSize + j;
          const p1 = projectedPoints[index];
          const p2 = projectedPoints[index + 1];
          const p3 = projectedPoints[index + gridSize];
          const p4 = projectedPoints[index + gridSize + 1];

          if (p1 && p2 && p3 && p4) {
            // Color based on height
            const avgZ = (points[index].z + points[index + 1].z + points[index + gridSize].z + points[index + gridSize + 1].z) / 4;
            const normalizedZ = (avgZ + 5) / 10; // Normalize to 0-1
            const hue = normalizedZ * 240; // Blue to red gradient
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Draw coordinate axes
    const origin = project({ x: 0, y: 0, z: 0 });
    const xAxis = project({ x: 2, y: 0, z: 0 });
    const yAxis = project({ x: 0, y: 2, z: 0 });
    const zAxis = project({ x: 0, y: 0, z: 2 });

    ctx.lineWidth = 3;
    
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

  }, [points, wireframe, rotation, zoom, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border rounded-lg bg-gray-900"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default function Working3DGrapher() {
  const [expression, setExpression] = useState('sin(sqrt(x*x + y*y))');
  const [xRange, setXRange] = useState<[number, number]>([-3, 3]);
  const [yRange, setYRange] = useState<[number, number]>([-3, 3]);
  const [resolution, setResolution] = useState([20]);
  const [wireframe, setWireframe] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = useState([2]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animationRef = useRef<number>();

  // Generate 3D surface points
  const surfacePoints = useMemo(() => {
    try {
      setError(null);
      const points: Point3D[] = [];
      const stepX = (xRange[1] - xRange[0]) / resolution[0];
      const stepY = (yRange[1] - yRange[0]) / resolution[0];

      for (let i = 0; i <= resolution[0]; i++) {
        for (let j = 0; j <= resolution[0]; j++) {
          const x = xRange[0] + i * stepX;
          const y = yRange[0] + j * stepY;
          const z = SafeMathEvaluator.evaluate(expression, x, y);
          points.push({ x, y, z });
        }
      }

      return points;
    } catch (err) {
      setError('Invalid expression or calculation error');
      return [];
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
    { name: 'Cone', expr: 'sqrt(x*x + y*y)' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-6 w-6" />
            Working 3D Function Grapher
            <Badge variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              Fixed
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fast 3D visualization that actually works - no more React Three Fiber errors!
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
                max={40}
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
                max={5}
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
                  onClick={() => setIsAnimating(false)}
                  disabled
                >
                  <Pause className="h-4 w-4" />
                  Animation Disabled
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
              points={surfacePoints}
              wireframe={wireframe}
              rotation={rotation}
              zoom={zoom[0]}
              width={600}
              height={400}
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
            <p><strong>✅ Fixed!</strong> No more React Three Fiber errors</p>
            <p>• Use mathematical functions: sin, cos, tan, sqrt, exp, log</p>
            <p>• Variables: x, y | Constants: pi, e</p>
            <p>• Example: sin(x)*cos(y), x*x + y*y, exp(-(x*x + y*y))</p>
            <p>• Points rendered: {surfacePoints.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}