"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Download, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Settings,
  Camera,
  Maximize
} from 'lucide-react';

interface Interactive3DVisualizerProps {
  expression?: string;
  onExpressionChange?: (expression: string) => void;
}

export default function Interactive3DVisualizer({ 
  expression = "x^2 + y^2", 
  onExpressionChange 
}: Interactive3DVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [resolution, setResolution] = useState(50);
  const [animationSpeed, setAnimationSpeed] = useState(0.02);
  const [colorScheme, setColorScheme] = useState('viridis');
  const [showWireframe, setShowWireframe] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Real-time 3D rendering with Three.js-like calculations
  const render3DGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up 3D projection parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 100 * zoom;
    
    // Generate 3D surface points
    const points = [];
    const domain = 4; // -4 to 4 range
    const step = (domain * 2) / resolution;
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = -domain + i * step;
        const y = -domain + j * step;
        const z = evaluateExpression(currentExpression, x, y);
        
        // 3D to 2D projection with rotation
        const rotatedPoint = rotatePoint3D(x, y, z, rotationX, rotationY);
        const projected = project3D(rotatedPoint, scale, centerX, centerY);
        
        points.push({
          x: projected.x,
          y: projected.y,
          z: rotatedPoint.z,
          originalZ: z,
          color: getColorForZ(z, colorScheme)
        });
      }
    }
    
    // Sort points by z-depth for proper rendering
    points.sort((a, b) => b.z - a.z);
    
    // Render surface
    if (!showWireframe) {
      renderSurface(ctx, points, resolution);
    } else {
      renderWireframe(ctx, points, resolution);
    }
    
    // Add coordinate axes
    renderAxes(ctx, centerX, centerY, scale);
    
    // Add expression label
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`f(x,y) = ${currentExpression}`, 10, 30);
  };

  const evaluateExpression = (expr: string, x: number, y: number): number => {
    try {
      // Replace variables with actual values
      let evaluatedExpr = expr
        .replace(/x/g, `(${x})`)
        .replace(/y/g, `(${y})`)
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E');
      
      const result = eval(evaluatedExpr);
      return isFinite(result) ? result : 0;
    } catch (error) {
      return 0;
    }
  };

  const rotatePoint3D = (x: number, y: number, z: number, rotX: number, rotY: number) => {
    // Rotation around X axis
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    
    // Rotation around Y axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    
    return { x: x2, y: y1, z: z2 };
  };

  const project3D = (point: {x: number, y: number, z: number}, scale: number, centerX: number, centerY: number) => {
    const distance = 5;
    const factor = distance / (distance + point.z * 0.1);
    
    return {
      x: centerX + point.x * scale * factor,
      y: centerY - point.y * scale * factor
    };
  };

  const getColorForZ = (z: number, scheme: string): string => {
    const normalized = Math.max(0, Math.min(1, (z + 2) / 4)); // Normalize to 0-1
    
    switch (scheme) {
      case 'viridis':
        return `hsl(${240 + normalized * 120}, 70%, ${30 + normalized * 40}%)`;
      case 'plasma':
        return `hsl(${300 - normalized * 60}, 80%, ${40 + normalized * 30}%)`;
      case 'rainbow':
        return `hsl(${normalized * 360}, 80%, 60%)`;
      default:
        return `hsl(${220}, 70%, ${30 + normalized * 40}%)`;
    }
  };

  const renderSurface = (ctx: CanvasRenderingContext2D, points: any[], resolution: number) => {
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const idx = i * (resolution + 1) + j;
        if (idx + resolution + 2 < points.length) {
          const p1 = points[idx];
          const p2 = points[idx + 1];
          const p3 = points[idx + resolution + 1];
          const p4 = points[idx + resolution + 2];
          
          // Draw quad as two triangles
          ctx.fillStyle = p1.color;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
          
          ctx.fillStyle = p2.color;
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  };

  const renderWireframe = (ctx: CanvasRenderingContext2D, points: any[], resolution: number) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const idx = i * (resolution + 1) + j;
        if (idx + resolution + 1 < points.length) {
          const p1 = points[idx];
          const p2 = points[idx + 1];
          const p3 = points[idx + resolution + 1];
          
          // Draw lines
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
        }
      }
    }
  };

  const renderAxes = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(centerX - scale, centerY);
    ctx.lineTo(centerX + scale, centerY);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - scale);
    ctx.lineTo(centerX, centerY + scale);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('X', centerX + scale - 10, centerY - 5);
    ctx.fillText('Y', centerX + 5, centerY - scale + 15);
  };

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setRotationY(prev => prev + deltaX * 0.01);
    setRotationX(prev => prev + deltaY * 0.01);
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  // Animation loop
  useEffect(() => {
    let animationFrame: number;
    
    if (isAnimating) {
      const animate = () => {
        setRotationY(prev => prev + animationSpeed);
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAnimating, animationSpeed]);

  // Render loop
  useEffect(() => {
    render3DGraph();
  }, [currentExpression, rotationX, rotationY, zoom, resolution, colorScheme, showWireframe]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 400;
      render3DGraph();
    }
  }, []);

  const handleExpressionChange = (newExpression: string) => {
    setCurrentExpression(newExpression);
    onExpressionChange?.(newExpression);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `3d-graph-${currentExpression.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const resetView = () => {
    setRotationX(0);
    setRotationY(0);
    setZoom(1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Interactive 3D Function Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expression Input */}
        <div className="space-y-2">
          <Label htmlFor="expression">Function f(x,y) =</Label>
          <Input
            id="expression"
            value={currentExpression}
            onChange={(e) => handleExpressionChange(e.target.value)}
            placeholder="e.g., x^2 + y^2, sin(x)*cos(y), x*y"
            className="font-mono"
          />
        </div>

        {/* 3D Canvas */}
        <div className="relative border rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <canvas
            ref={canvasRef}
            className="w-full h-auto cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {/* Overlay Controls */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={exportImage}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAnimating(!isAnimating)}>
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
            Drag to rotate • Scroll to zoom • Click play to animate
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Resolution: {resolution}</Label>
              <Slider
                value={[resolution]}
                onValueChange={(value) => setResolution(value[0])}
                min={20}
                max={100}
                step={10}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Zoom: {zoom.toFixed(1)}x</Label>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Animation Speed</Label>
              <Slider
                value={[animationSpeed * 100]}
                onValueChange={(value) => setAnimationSpeed(value[0] / 100)}
                min={0.5}
                max={5}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant={showWireframe ? "default" : "outline"}
                onClick={() => setShowWireframe(!showWireframe)}
              >
                Wireframe
              </Button>
              
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="viridis">Viridis</option>
                <option value="plasma">Plasma</option>
                <option value="rainbow">Rainbow</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Rotation: X={rotationX.toFixed(2)}, Y={rotationY.toFixed(2)}
          </Badge>
          <Badge variant="outline">
            Points: {(resolution + 1) * (resolution + 1)}
          </Badge>
          <Badge variant={isAnimating ? "default" : "secondary"}>
            {isAnimating ? "Animating" : "Static"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}