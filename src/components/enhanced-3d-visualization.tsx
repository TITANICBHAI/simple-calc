"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Layers,
  Navigation,
  Info,
  Download,
  Settings,
  Zap
} from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface CriticalPoint {
  x: number;
  y: number;
  z: number;
  type: 'maximum' | 'minimum' | 'saddle';
  value: number;
}

interface Enhanced3DVisualizationProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

// Mathematical utility functions
const evaluateExpression = (expr: string, x: number, y: number): number => {
  try {
    // Replace variables and mathematical functions
    let code = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/log/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/x/g, `(${x})`)
      .replace(/y/g, `(${y})`);
    
    return eval(code);
  } catch {
    return NaN;
  }
};

const calculateGradient = (expr: string, x: number, y: number, h: number = 0.001): [number, number] => {
  const fx = (evaluateExpression(expr, x + h, y) - evaluateExpression(expr, x - h, y)) / (2 * h);
  const fy = (evaluateExpression(expr, x, y + h) - evaluateExpression(expr, x, y - h)) / (2 * h);
  return [fx, fy];
};

const findCriticalPoints = (expr: string, xRange: [number, number], yRange: [number, number]): CriticalPoint[] => {
  const points: CriticalPoint[] = [];
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const stepX = (xMax - xMin) / 20;
  const stepY = (yMax - yMin) / 20;
  
  for (let i = 1; i < 20; i++) {
    for (let j = 1; j < 20; j++) {
      const x = xMin + i * stepX;
      const y = yMin + j * stepY;
      const [fx, fy] = calculateGradient(expr, x, y);
      
      // Check if gradient is close to zero
      if (Math.abs(fx) < 0.1 && Math.abs(fy) < 0.1) {
        const z = evaluateExpression(expr, x, y);
        if (isFinite(z)) {
          // Determine type using second derivatives
          const [fxx] = calculateGradient(expr.replace(/x/g, `(x+0.001)`), x, y);
          const [fyy] = calculateGradient(expr.replace(/y/g, `(y+0.001)`), x, y);
          const hessianDet = fxx * fyy; // Simplified Hessian determinant
          
          let type: 'maximum' | 'minimum' | 'saddle';
          if (hessianDet > 0) {
            type = fxx < 0 ? 'maximum' : 'minimum';
          } else {
            type = 'saddle';
          }
          
          points.push({ x, y, z, type, value: z });
        }
      }
    }
  }
  
  return points;
};

// Canvas-based 3D renderer
const Enhanced3DCanvas: React.FC<{
  expression: string;
  xRange: [number, number];
  yRange: [number, number];
  resolution: number;
  showGradients: boolean;
  showCriticalPoints: boolean;
  showContours: boolean;
  showCrossSection: boolean;
  crossSectionPosition: number;
  animate: boolean;
  colorScheme: string;
}> = ({
  expression,
  xRange,
  yRange,
  resolution,
  showGradients,
  showCriticalPoints,
  showContours,
  showCrossSection,
  crossSectionPosition,
  animate,
  colorScheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.3 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Generate surface data
  const surfaceData = useMemo(() => {
    const points: Point3D[] = [];
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    const stepX = (xMax - xMin) / resolution;
    const stepY = (yMax - yMin) / resolution;
    
    let zMin = Infinity;
    let zMax = -Infinity;
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = xMin + i * stepX;
        const y = yMin + j * stepY;
        const z = evaluateExpression(expression, x, y);
        
        if (isFinite(z)) {
          points.push({ x, y, z });
          zMin = Math.min(zMin, z);
          zMax = Math.max(zMax, z);
        }
      }
    }
    
    return { points, zMin, zMax };
  }, [expression, xRange, yRange, resolution]);

  // Generate critical points
  const criticalPoints = useMemo(() => {
    return findCriticalPoints(expression, xRange, yRange);
  }, [expression, xRange, yRange]);

  // 3D projection functions
  const project3D = useCallback((point: Point3D, canvasWidth: number, canvasHeight: number) => {
    const { x, y, z } = point;
    
    // Normalize coordinates
    const nx = (x - xRange[0]) / (xRange[1] - xRange[0]) - 0.5;
    const ny = (y - yRange[0]) / (yRange[1] - yRange[0]) - 0.5;
    const nz = (z - surfaceData.zMin) / (surfaceData.zMax - surfaceData.zMin) - 0.5;
    
    // Apply rotation
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    // Rotate around X axis
    const y1 = ny * cosX - nz * sinX;
    const z1 = ny * sinX + nz * cosX;
    
    // Rotate around Y axis
    const x2 = nx * cosY + z1 * sinY;
    const z2 = -nx * sinY + z1 * cosY;
    
    // Perspective projection
    const distance = 3;
    const scale = distance / (distance + z2);
    
    return {
      x: canvasWidth / 2 + x2 * scale * 200,
      y: canvasHeight / 2 + y1 * scale * 200,
      z: z2
    };
  }, [rotation, xRange, yRange, surfaceData.zMin, surfaceData.zMax]);

  // Get color for height
  const getColorForHeight = useCallback((z: number) => {
    const t = (z - surfaceData.zMin) / (surfaceData.zMax - surfaceData.zMin);
    
    switch (colorScheme) {
      case 'viridis':
        return `hsl(${240 + t * 120}, 70%, ${30 + t * 40}%)`;
      case 'plasma':
        return `hsl(${300 - t * 60}, 80%, ${20 + t * 50}%)`;
      case 'rainbow':
        return `hsl(${t * 360}, 70%, 50%)`;
      default:
        return `hsl(${210 + t * 60}, 70%, ${30 + t * 40}%)`;
    }
  }, [surfaceData.zMin, surfaceData.zMax, colorScheme]);

  // Render the 3D scene
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Draw surface
    const projectedPoints = surfaceData.points.map(point => ({
      ...point,
      projected: project3D(point, width, height)
    }));
    
    // Sort by depth for proper rendering
    projectedPoints.sort((a, b) => b.projected.z - a.projected.z);
    
    // Draw surface points
    projectedPoints.forEach(({ x, y, z, projected }) => {
      ctx.fillStyle = getColorForHeight(z);
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw contour lines
    if (showContours) {
      const contourLevels = 10;
      for (let i = 1; i < contourLevels; i++) {
        const level = surfaceData.zMin + (i / contourLevels) * (surfaceData.zMax - surfaceData.zMin);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.lineWidth = 1;
        
        // Simple contour approximation
        surfaceData.points.forEach(point => {
          if (Math.abs(point.z - level) < 0.1) {
            const projected = project3D(point, width, height);
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, 1, 0, 2 * Math.PI);
            ctx.stroke();
          }
        });
      }
    }
    
    // Draw gradient vectors
    if (showGradients) {
      const step = Math.floor(resolution / 8);
      for (let i = 0; i <= resolution; i += step) {
        for (let j = 0; j <= resolution; j += step) {
          const x = xRange[0] + (i / resolution) * (xRange[1] - xRange[0]);
          const y = yRange[0] + (j / resolution) * (yRange[1] - yRange[0]);
          const z = evaluateExpression(expression, x, y);
          
          if (isFinite(z)) {
            const [gx, gy] = calculateGradient(expression, x, y);
            const startProj = project3D({ x, y, z }, width, height);
            const endProj = project3D({ 
              x: x + gx * 0.1, 
              y: y + gy * 0.1, 
              z: z 
            }, width, height);
            
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startProj.x, startProj.y);
            ctx.lineTo(endProj.x, endProj.y);
            ctx.stroke();
            
            // Arrowhead
            const angle = Math.atan2(endProj.y - startProj.y, endProj.x - startProj.x);
            const arrowLength = 8;
            ctx.beginPath();
            ctx.moveTo(endProj.x, endProj.y);
            ctx.lineTo(
              endProj.x - arrowLength * Math.cos(angle - Math.PI / 6),
              endProj.y - arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(endProj.x, endProj.y);
            ctx.lineTo(
              endProj.x - arrowLength * Math.cos(angle + Math.PI / 6),
              endProj.y - arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
        }
      }
    }
    
    // Draw critical points
    if (showCriticalPoints) {
      criticalPoints.forEach(point => {
        const projected = project3D(point, width, height);
        
        ctx.fillStyle = point.type === 'maximum' ? '#4CAF50' : 
                       point.type === 'minimum' ? '#F44336' : '#FF9800';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(
          point.type.charAt(0).toUpperCase(),
          projected.x + 12,
          projected.y + 4
        );
      });
    }
    
    // Draw cross-section
    if (showCrossSection) {
      const sectionX = xRange[0] + crossSectionPosition * (xRange[1] - xRange[0]);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      
      const sectionPoints = [];
      for (let j = 0; j <= resolution; j++) {
        const y = yRange[0] + (j / resolution) * (yRange[1] - yRange[0]);
        const z = evaluateExpression(expression, sectionX, y);
        if (isFinite(z)) {
          sectionPoints.push(project3D({ x: sectionX, y, z }, width, height));
        }
      }
      
      if (sectionPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(sectionPoints[0].x, sectionPoints[0].y);
        sectionPoints.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    }
    
    // Draw axes
    const origin = project3D({ x: 0, y: 0, z: 0 }, width, height);
    const xAxis = project3D({ x: 1, y: 0, z: 0 }, width, height);
    const yAxis = project3D({ x: 0, y: 1, z: 0 }, width, height);
    const zAxis = project3D({ x: 0, y: 0, z: 1 }, width, height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // X axis (red)
    ctx.strokeStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();
    
    // Y axis (green)
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();
    
    // Z axis (blue)
    ctx.strokeStyle = '#0000ff';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();
    
  }, [
    surfaceData, 
    project3D, 
    getColorForHeight, 
    showGradients, 
    showCriticalPoints, 
    showContours, 
    showCrossSection,
    crossSectionPosition,
    criticalPoints,
    expression,
    xRange,
    yRange,
    resolution
  ]);

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
  }, [animate]);

  // Render when data changes
  useEffect(() => {
    render();
  }, [render]);

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastMouse({ x: e.clientX, y: e.clientY });
    } else {
      // Show tooltip for critical points
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check if mouse is near any critical point
        const canvas = canvasRef.current;
        if (canvas) {
          const nearPoint = criticalPoints.find(point => {
            const projected = project3D(point, canvas.width, canvas.height);
            const distance = Math.sqrt(
              Math.pow(mouseX - projected.x, 2) + Math.pow(mouseY - projected.y, 2)
            );
            return distance < 15;
          });
          
          if (nearPoint) {
            setTooltip({
              x: mouseX,
              y: mouseY,
              content: `${nearPoint.type}: (${nearPoint.x.toFixed(2)}, ${nearPoint.y.toFixed(2)}, ${nearPoint.z.toFixed(2)})`
            });
          } else {
            setTooltip(null);
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border rounded-lg cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      
      {tooltip && (
        <div
          className="absolute bg-black text-white p-2 rounded text-sm pointer-events-none z-10"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.content}
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>X-axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Y-axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Z-axis</span>
          </div>
          {showGradients && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-red-400"></div>
              <span>Gradient vectors</span>
            </div>
          )}
          {showCriticalPoints && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Maximum</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Minimum</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Saddle point</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Color scale */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Height Scale</h4>
        <div className="flex flex-col items-center">
          <div 
            className="w-4 h-24 border rounded"
            style={{
              background: `linear-gradient(to top, ${getColorForHeight(surfaceData.zMin)}, ${getColorForHeight(surfaceData.zMax)})`
            }}
          ></div>
          <div className="text-xs mt-1">
            <div>{surfaceData.zMax.toFixed(2)}</div>
            <div className="mt-3">{surfaceData.zMin.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Enhanced3DVisualization: React.FC<Enhanced3DVisualizationProps> = ({ onResult, onError }) => {
  const [expression, setExpression] = useState('sin(sqrt(x^2 + y^2))');
  const [xRange, setXRange] = useState<[number, number]>([-3, 3]);
  const [yRange, setYRange] = useState<[number, number]>([-3, 3]);
  const [resolution, setResolution] = useState([30]);
  const [showGradients, setShowGradients] = useState(false);
  const [showCriticalPoints, setShowCriticalPoints] = useState(true);
  const [showContours, setShowContours] = useState(false);
  const [showCrossSection, setShowCrossSection] = useState(false);
  const [crossSectionPosition, setCrossSectionPosition] = useState([0.5]);
  const [animate, setAnimate] = useState(false);
  const [colorScheme, setColorScheme] = useState('viridis');

  const handleReset = () => {
    setExpression('sin(sqrt(x^2 + y^2))');
    setXRange([-3, 3]);
    setYRange([-3, 3]);
    setResolution([30]);
    setShowGradients(false);
    setShowCriticalPoints(true);
    setShowContours(false);
    setShowCrossSection(false);
    setAnimate(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Enhanced 3D Mathematical Visualization
            <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-500">
              <Zap className="w-3 h-3 mr-1" />
              Educational
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="function" className="space-y-4">
            <TabsList>
              <TabsTrigger value="function">Function Setup</TabsTrigger>
              <TabsTrigger value="visualization">Visualization Options</TabsTrigger>
              <TabsTrigger value="analysis">Mathematical Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="function" className="space-y-4">
              <div>
                <Label htmlFor="expression">Function f(x,y)</Label>
                <Input
                  id="expression"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="sin(sqrt(x^2 + y^2))"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use x and y as variables. Supported functions: sin, cos, tan, exp, log, sqrt, abs
                </p>
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
              
              <div>
                <Label>Resolution: {resolution[0]} points</Label>
                <Slider
                  value={resolution}
                  onValueChange={setResolution}
                  max={50}
                  min={10}
                  step={5}
                  className="mt-2"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="visualization" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Gradient Vectors</Label>
                    <p className="text-xs text-muted-foreground">Show gradient vectors (perpendicular to level curves)</p>
                  </div>
                  <Switch checked={showGradients} onCheckedChange={setShowGradients} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Critical Points</Label>
                    <p className="text-xs text-muted-foreground">Mark maxima, minima, and saddle points</p>
                  </div>
                  <Switch checked={showCriticalPoints} onCheckedChange={setShowCriticalPoints} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Contour Lines</Label>
                    <p className="text-xs text-muted-foreground">Show level curves (constant z)</p>
                  </div>
                  <Switch checked={showContours} onCheckedChange={setShowContours} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Cross Section</Label>
                    <p className="text-xs text-muted-foreground">Show 2D slice through surface</p>
                  </div>
                  <Switch checked={showCrossSection} onCheckedChange={setShowCrossSection} />
                </div>
              </div>
              
              {showCrossSection && (
                <div>
                  <Label>Cross Section Position: {(crossSectionPosition[0] * 100).toFixed(0)}%</Label>
                  <Slider
                    value={crossSectionPosition}
                    onValueChange={setCrossSectionPosition}
                    max={1}
                    min={0}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
              )}
              
              <div>
                <Label>Color Scheme</Label>
                <div className="flex gap-2 mt-2">
                  {['viridis', 'plasma', 'rainbow'].map(scheme => (
                    <Button
                      key={scheme}
                      variant={colorScheme === scheme ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColorScheme(scheme)}
                    >
                      {scheme}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setAnimate(!animate)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {animate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {animate ? 'Stop' : 'Animate'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Educational Features:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Gradient vectors</strong> show the direction of steepest ascent and are always perpendicular to level curves</li>
                    <li><strong>Critical points</strong> occur where the gradient is zero (∇f = 0)</li>
                    <li><strong>Saddle points</strong> have mixed curvature - curved up in one direction, down in another</li>
                    <li><strong>Cross sections</strong> reveal how the surface curves in different directions</li>
                    <li><strong>Contour lines</strong> connect points of equal height (like topographic maps)</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Quick Examples</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start"
                      onClick={() => setExpression('x^2 + y^2')}
                    >
                      Paraboloid: x² + y²
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start"
                      onClick={() => setExpression('x^2 - y^2')}
                    >
                      Saddle: x² - y²
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-left justify-start"
                      onClick={() => setExpression('sin(x) * cos(y)')}
                    >
                      Wave: sin(x)·cos(y)
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Interaction Tips</h4>
                  <div className="text-xs space-y-1">
                    <p>• Drag to rotate the view</p>
                    <p>• Hover over critical points for details</p>
                    <p>• Use cross-sections to see 2D behavior</p>
                    <p>• Gradient vectors show steepest ascent</p>
                    <p>• Color indicates height values</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <Enhanced3DCanvas
            expression={expression}
            xRange={xRange}
            yRange={yRange}
            resolution={resolution[0]}
            showGradients={showGradients}
            showCriticalPoints={showCriticalPoints}
            showContours={showContours}
            showCrossSection={showCrossSection}
            crossSectionPosition={crossSectionPosition[0]}
            animate={animate}
            colorScheme={colorScheme}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Enhanced3DVisualization;