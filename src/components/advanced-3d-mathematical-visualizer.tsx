"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AnimatedGlowCard } from '@/components/ui/animated-glow-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RotateCcw, Download, Eye, Zap, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface Point3D {
  x: number;
  y: number;
  z: number;
  color?: string;
  intensity?: number;
}

interface Surface3D {
  points: Point3D[][];
  function: string;
  domain: { x: [number, number]; y: [number, number] };
  critical_points: Point3D[];
  gradient_field: VectorField3D[];
}

interface VectorField3D {
  position: Point3D;
  vector: Point3D;
  magnitude: number;
}

interface VisualizationConfig {
  function: string;
  xRange: [number, number];
  yRange: [number, number];
  resolution: number;
  colorScheme: 'height' | 'gradient' | 'curvature' | 'rainbow';
  showWireframe: boolean;
  showGradients: boolean;
  showCriticalPoints: boolean;
  showLevelCurves: boolean;
  animated: boolean;
  time: number;
}

export default function Advanced3DMathematicalVisualizer() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [config, setConfig] = useState<VisualizationConfig>({
    function: 'sin(x) * cos(y)',
    xRange: [-5, 5],
    yRange: [-5, 5],
    resolution: 50,
    colorScheme: 'height',
    showWireframe: false,
    showGradients: false,
    showCriticalPoints: true,
    showLevelCurves: false,
    animated: false,
    time: 0
  });
  
  const [surface, setSurface] = useState<Surface3D | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.7 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Mathematical function parser and evaluator
  const evaluateFunction = useCallback((expression: string, x: number, y: number, t: number = 0): number => {
    try {
      // Safe mathematical expression evaluation
      const mathContext = {
        x, y, t,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        exp: Math.exp,
        log: Math.log,
        sqrt: Math.sqrt,
        abs: Math.abs,
        pow: Math.pow,
        PI: Math.PI,
        E: Math.E
      };
      
      // Replace common mathematical notation
      let processedExpression = expression
        .replace(/\^/g, '**')
        .replace(/π/g, 'PI')
        .replace(/e/g, 'E')
        .replace(/ln/g, 'log');
      
      // Create function string
      const functionString = `
        with (mathContext) {
          return ${processedExpression};
        }
      `;
      
      const func = new Function('mathContext', functionString);
      const result = func(mathContext);
      
      return isNaN(result) ? 0 : result;
    } catch (error) {
      return 0;
    }
  }, []);

  // Generate 3D surface from mathematical function
  const generateSurface = useCallback(async (): Promise<Surface3D> => {
    const { function: expr, xRange, yRange, resolution, time } = config;
    const points: Point3D[][] = [];
    const criticalPoints: Point3D[] = [];
    const gradientField: VectorField3D[] = [];
    
    const stepX = (xRange[1] - xRange[0]) / resolution;
    const stepY = (yRange[1] - yRange[0]) / resolution;
    
    // Generate surface points
    for (let i = 0; i <= resolution; i++) {
      const row: Point3D[] = [];
      const x = xRange[0] + i * stepX;
      
      for (let j = 0; j <= resolution; j++) {
        const y = yRange[0] + j * stepY;
        const z = evaluateFunction(expr, x, y, time);
        
        // Calculate color based on height and gradient
        const hue = (z + 2) / 4 * 360; // Normalize to hue range
        const intensity = Math.abs(z) / 5;
        
        row.push({
          x, y, z,
          color: `hsl(${Math.max(0, Math.min(360, hue))}, 70%, 50%)`,
          intensity: Math.max(0, Math.min(1, intensity))
        });
      }
      points.push(row);
    }
    
    // Find critical points (simplified gradient analysis)
    const gradientStep = stepX / 10;
    for (let i = 5; i < resolution - 5; i += 5) {
      for (let j = 5; j < resolution - 5; j += 5) {
        const x = xRange[0] + i * stepX;
        const y = yRange[0] + j * stepY;
        
        // Calculate partial derivatives numerically
        const dfdx = (evaluateFunction(expr, x + gradientStep, y, time) - 
                     evaluateFunction(expr, x - gradientStep, y, time)) / (2 * gradientStep);
        const dfdy = (evaluateFunction(expr, x, y + gradientStep, time) - 
                     evaluateFunction(expr, x, y - gradientStep, time)) / (2 * gradientStep);
        
        const gradientMagnitude = Math.sqrt(dfdx * dfdx + dfdy * dfdy);
        
        // Check for critical points (where gradient is near zero)
        if (gradientMagnitude < 0.1) {
          const z = evaluateFunction(expr, x, y, time);
          criticalPoints.push({ x, y, z, color: '#ff0000' });
        }
        
        // Add to gradient field
        if (config.showGradients) {
          gradientField.push({
            position: { x, y, z: evaluateFunction(expr, x, y, time) },
            vector: { x: dfdx, y: dfdy, z: 0 },
            magnitude: gradientMagnitude
          });
        }
      }
    }
    
    return {
      points,
      function: expr,
      domain: { x: xRange, y: yRange },
      critical_points: criticalPoints,
      gradient_field: gradientField
    };
  }, [config, evaluateFunction]);

  // 3D projection and rendering
  const project3DTo2D = useCallback((point: Point3D, width: number, height: number): { x: number; y: number; z: number } => {
    // Apply rotation
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    // Rotate around X axis
    let y1 = point.y * cosX - point.z * sinX;
    let z1 = point.y * sinX + point.z * cosX;
    
    // Rotate around Y axis
    let x2 = point.x * cosY + z1 * sinY;
    let z2 = -point.x * sinY + z1 * cosY;
    
    // Apply zoom and perspective
    const scale = zoom * 50;
    const perspective = 300;
    const factor = perspective / (perspective + z2);
    
    return {
      x: width / 2 + x2 * scale * factor,
      y: height / 2 + y1 * scale * factor,
      z: z2
    };
  }, [rotation, zoom]);

  // Render the 3D surface
  const render3DSurface = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !surface) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas with beautiful animated gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)
    );
    
    // Dynamic background colors based on time and interaction
    const timeOffset = config.time * 0.1;
    const interactionGlow = isInteracting ? 0.3 : 0.1;
    
    gradient.addColorStop(0, `hsla(${220 + Math.sin(timeOffset) * 20}, 70%, ${5 + interactionGlow * 10}%, 1)`);
    gradient.addColorStop(0.5, `hsla(${200 + Math.cos(timeOffset * 0.7) * 15}, 60%, ${3 + interactionGlow * 8}%, 1)`);
    gradient.addColorStop(1, `hsla(${180 + Math.sin(timeOffset * 0.5) * 10}, 50%, ${1 + interactionGlow * 5}%, 1)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Project all points
    const projectedSurface = surface.points.map(row =>
      row.map(point => ({
        ...point,
        projected: project3DTo2D(point, canvas.width, canvas.height)
      }))
    );
    
    // Sort faces by depth for proper rendering
    const faces: Array<{
      points: Array<Point3D & { projected: { x: number; y: number; z: number } }>;
      avgZ: number;
      color: string;
    }> = [];
    
    for (let i = 0; i < surface.points.length - 1; i++) {
      for (let j = 0; j < surface.points[i].length - 1; j++) {
        const p1 = projectedSurface[i][j];
        const p2 = projectedSurface[i + 1][j];
        const p3 = projectedSurface[i + 1][j + 1];
        const p4 = projectedSurface[i][j + 1];
        
        const avgZ = (p1.projected.z + p2.projected.z + p3.projected.z + p4.projected.z) / 4;
        
        faces.push({
          points: [p1, p2, p3, p4],
          avgZ,
          color: p1.color || '#3b82f6'
        });
      }
    }
    
    // Sort faces by depth (back to front)
    faces.sort((a, b) => a.avgZ - b.avgZ);
    
    // Render faces
    faces.forEach(face => {
      ctx.beginPath();
      ctx.moveTo(face.points[0].projected.x, face.points[0].projected.y);
      
      face.points.forEach((point, index) => {
        if (index > 0) {
          ctx.lineTo(point.projected.x, point.projected.y);
        }
      });
      ctx.closePath();
      
      if (!config.showWireframe) {
        // Enhanced lighting with multiple light sources
        const lightIntensity = 0.3 + 0.7 * (face.avgZ + 5) / 10;
        const ambientLight = 0.2;
        const diffuseLight = Math.max(0, lightIntensity - ambientLight);
        
        // Add subtle animation glow when time animation is enabled
        const timeGlow = config.animated ? Math.sin(config.time * 2) * 0.1 + 0.1 : 0;
        const finalIntensity = Math.max(20, Math.min(80, (ambientLight + diffuseLight + timeGlow) * 60));
        
        // Enhanced color mixing with depth-based saturation
        const depthSaturation = Math.max(30, Math.min(90, 70 + (face.avgZ / 10) * 20));
        const enhancedColor = face.color.replace('70%', `${depthSaturation}%`).replace('50%)', `${finalIntensity}%)`);
        
        ctx.fillStyle = enhancedColor;
        ctx.fill();
        
        // Add subtle inner shadow for depth
        if (lightIntensity > 0.7) {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      }
      
      // Draw wireframe
      if (config.showWireframe || faces.length < 100) {
        ctx.strokeStyle = config.showWireframe ? '#ffffff40' : '#ffffff20';
        ctx.lineWidth = config.showWireframe ? 0.5 : 0.2;
        ctx.stroke();
      }
    });
    
    // Render critical points
    if (config.showCriticalPoints && surface.critical_points) {
      surface.critical_points.forEach(point => {
        const projected = project3DTo2D(point, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }
    
    // Render gradient field
    if (config.showGradients && surface.gradient_field) {
      surface.gradient_field.forEach(field => {
        const start = project3DTo2D(field.position, canvas.width, canvas.height);
        const end = project3DTo2D({
          x: field.position.x + field.vector.x * 0.5,
          y: field.position.y + field.vector.y * 0.5,
          z: field.position.z + field.vector.z * 0.5
        }, canvas.width, canvas.height);
        
        const alpha = Math.min(1, field.magnitude / 2);
        ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = 8;
        
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      });
    }
    
    // Render coordinate axes
    renderCoordinateAxes(ctx, canvas.width, canvas.height);
    
  }, [surface, config, project3DTo2D]);

  // Render coordinate axes
  const renderCoordinateAxes = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const origin = project3DTo2D({ x: 0, y: 0, z: 0 }, width, height);
    const xAxis = project3DTo2D({ x: 2, y: 0, z: 0 }, width, height);
    const yAxis = project3DTo2D({ x: 0, y: 2, z: 0 }, width, height);
    const zAxis = project3DTo2D({ x: 0, y: 0, z: 2 }, width, height);
    
    // X axis (red)
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();
    
    // Y axis (green)
    ctx.strokeStyle = '#44ff44';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();
    
    // Z axis (blue)
    ctx.strokeStyle = '#4444ff';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText('X', xAxis.x + 10, xAxis.y);
    ctx.fillText('Y', yAxis.x + 10, yAxis.y);
    ctx.fillText('Z', zAxis.x + 10, zAxis.y);
  }, [project3DTo2D]);

  // Enhanced mouse interactions with smooth motion
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let momentum = { x: 0, y: 0 };
    let momentumDecay = 0.95;
    
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      momentum = { x: 0, y: 0 }; // Stop momentum when user starts dragging
      setIsInteracting(true);
      setAutoRotate(false); // Stop auto-rotation when user interacts
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      
      // Smooth rotation with reduced sensitivity for better control
      const sensitivity = 0.008;
      const rotationDeltaX = deltaY * sensitivity;
      const rotationDeltaY = deltaX * sensitivity;
      
      // Store momentum for smooth continuation
      momentum.x = rotationDeltaX;
      momentum.y = rotationDeltaY;
      
      setRotation(prev => ({
        x: prev.x + rotationDeltaX,
        y: prev.y + rotationDeltaY
      }));
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    
    const handleMouseUp = () => {
      isMouseDown = false;
      setIsInteracting(false);
      
      // Continue rotation with momentum for smooth feel
      const applyMomentum = () => {
        if (Math.abs(momentum.x) < 0.0001 && Math.abs(momentum.y) < 0.0001) return;
        
        setRotation(prev => ({
          x: prev.x + momentum.x,
          y: prev.y + momentum.y
        }));
        
        momentum.x *= momentumDecay;
        momentum.y *= momentumDecay;
        
        requestAnimationFrame(applyMomentum);
      };
      
      if (Math.abs(momentum.x) > 0.001 || Math.abs(momentum.y) > 0.001) {
        applyMomentum();
      }
    };
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.002;
      const zoomDelta = e.deltaY * -zoomSpeed;
      setZoom(prev => Math.max(0.1, Math.min(5, prev + zoomDelta)));
    };
    
    // Touch support for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
        setIsInteracting(true);
        setAutoRotate(false);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastMouseX;
        const deltaY = touch.clientY - lastMouseY;
        
        const sensitivity = 0.008;
        setRotation(prev => ({
          x: prev.x + deltaY * sensitivity,
          y: prev.y + deltaX * sensitivity
        }));
        
        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
      }
    };
    
    const handleTouchEnd = () => {
      setIsInteracting(false);
    };
    
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Enhanced animation loop with smooth transitions
  useEffect(() => {
    const animate = () => {
      // Smooth time animation for mathematical functions
      if (config.animated) {
        setConfig(prev => ({ 
          ...prev, 
          time: prev.time + (0.02 * animationSpeed)
        }));
      }
      
      // Smooth auto-rotation
      if (autoRotate && !isInteracting) {
        setRotation(prev => ({
          x: prev.x + (0.005 * rotationSpeed),
          y: prev.y + (0.008 * rotationSpeed)
        }));
      }
      
      render3DSurface();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.animated, autoRotate, isInteracting, animationSpeed, rotationSpeed, render3DSurface]);

  // Calculate surface when function or parameters change
  const handleCalculateSurface = useCallback(async () => {
    setIsCalculating(true);
    try {
      const newSurface = await generateSurface();
      setSurface(newSurface);
      toast({
        title: "Surface Generated!",
        description: `Successfully plotted ${config.function} with ${newSurface.critical_points.length} critical points found`,
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "Failed to generate surface. Please check your function syntax.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  }, [generateSurface, config.function, toast]);

  // Preset functions
  const presetFunctions = [
    { name: "Gaussian", expr: "exp(-(x*x + y*y)/4)" },
    { name: "Saddle", expr: "x*x - y*y" },
    { name: "Ripples", expr: "sin(sqrt(x*x + y*y))" },
    { name: "Waves", expr: "sin(x) * cos(y)" },
    { name: "Paraboloid", expr: "x*x + y*y" },
    { name: "Monkey Saddle", expr: "x*x*x - 3*x*y*y" },
    { name: "Rosenbrock", expr: "100*(y - x*x)*(y - x*x) + (1-x)*(1-x)" },
    { name: "Himmelblau", expr: "(x*x + y - 11)*(x*x + y - 11) + (x + y*y - 7)*(x + y*y - 7)" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced 3D Mathematical Visualizer</h2>
          <p className="text-gray-600 mt-2">Interactive 3D plotting with critical point analysis and gradient visualization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={surface ? "default" : "secondary"}>
            <Eye className="h-3 w-3 mr-1" />
            {surface ? `${surface.points.length}x${surface.points[0]?.length} surface` : 'No surface'}
          </Badge>
          <Badge variant={config.animated ? "default" : "secondary"} className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            {config.animated ? 'Animated' : 'Static'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatedGlowCard 
            glowColor="#3b82f6" 
            intensity="medium" 
            animationType="mathematical"
            particleSystem={true}
            className="h-fit"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Function & Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Function Input */}
              <div className="space-y-2">
                <Label>Mathematical Function f(x,y,t)</Label>
                <Input
                  value={config.function}
                  onChange={(e) => setConfig(prev => ({ ...prev, function: e.target.value }))}
                  placeholder="sin(x) * cos(y)"
                  className="font-mono"
                />
              </div>

              {/* Preset Functions */}
              <div className="space-y-2">
                <Label>Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {presetFunctions.map((preset) => (
                    <Button
                      key={preset.name}
                      onClick={() => setConfig(prev => ({ ...prev, function: preset.expr }))}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Domain Range */}
              <div className="space-y-2">
                <Label>X Range: [{config.xRange[0]}, {config.xRange[1]}]</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={config.xRange[0]}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      xRange: [parseFloat(e.target.value), prev.xRange[1]]
                    }))}
                    step="0.1"
                  />
                  <Input
                    type="number"
                    value={config.xRange[1]}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      xRange: [prev.xRange[0], parseFloat(e.target.value)]
                    }))}
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Y Range: [{config.yRange[0]}, {config.yRange[1]}]</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={config.yRange[0]}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      yRange: [parseFloat(e.target.value), prev.yRange[1]]
                    }))}
                    step="0.1"
                  />
                  <Input
                    type="number"
                    value={config.yRange[1]}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      yRange: [prev.yRange[0], parseFloat(e.target.value)]
                    }))}
                    step="0.1"
                  />
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <Label>Resolution: {config.resolution}</Label>
                <Slider
                  value={[config.resolution]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, resolution: value }))}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>

              {/* Calculate Button */}
              <Button 
                onClick={handleCalculateSurface}
                disabled={isCalculating}
                className="w-full"
              >
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calculating...
                  </div>
                ) : (
                  'Generate 3D Surface'
                )}
              </Button>
            </CardContent>
          </AnimatedGlowCard>

          {/* Visualization Options */}
          <AnimatedGlowCard 
            glowColor="#8b5cf6" 
            intensity="medium" 
            animationType="sparkle"
          >
            <CardHeader>
              <CardTitle>Visualization Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Scheme */}
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select 
                  value={config.colorScheme} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, colorScheme: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="height">Height-based</SelectItem>
                    <SelectItem value="gradient">Gradient-based</SelectItem>
                    <SelectItem value="curvature">Curvature-based</SelectItem>
                    <SelectItem value="rainbow">Rainbow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Wireframe</Label>
                  <input
                    type="checkbox"
                    checked={config.showWireframe}
                    onChange={(e) => setConfig(prev => ({ ...prev, showWireframe: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Critical Points</Label>
                  <input
                    type="checkbox"
                    checked={config.showCriticalPoints}
                    onChange={(e) => setConfig(prev => ({ ...prev, showCriticalPoints: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Gradient Field</Label>
                  <input
                    type="checkbox"
                    checked={config.showGradients}
                    onChange={(e) => setConfig(prev => ({ ...prev, showGradients: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Animation</Label>
                  <input
                    type="checkbox"
                    checked={config.animated}
                    onChange={(e) => setConfig(prev => ({ ...prev, animated: e.target.checked }))}
                    className="rounded"
                  />
                </div>
              </div>

              {/* Animation Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Auto Rotate</Label>
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="rounded"
                  />
                </div>
                
                {autoRotate && (
                  <div className="space-y-2">
                    <Label>Rotation Speed: {rotationSpeed.toFixed(1)}x</Label>
                    <Slider
                      value={[rotationSpeed]}
                      onValueChange={([value]) => setRotationSpeed(value)}
                      min={0.1}
                      max={3}
                      step={0.1}
                    />
                  </div>
                )}
                
                {config.animated && (
                  <div className="space-y-2">
                    <Label>Animation Speed: {animationSpeed.toFixed(1)}x</Label>
                    <Slider
                      value={[animationSpeed]}
                      onValueChange={([value]) => setAnimationSpeed(value)}
                      min={0.1}
                      max={5}
                      step={0.1}
                    />
                  </div>
                )}
              </div>

              {/* View Controls */}
              <div className="space-y-2">
                <Label>Zoom: {zoom.toFixed(2)}x</Label>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => {
                    setRotation({ x: 0.3, y: 0.7 });
                    setZoom(1);
                    setAutoRotate(false);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                
                <Button 
                  onClick={() => setAutoRotate(!autoRotate)}
                  variant={autoRotate ? "default" : "outline"}
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {autoRotate ? 'Stop' : 'Rotate'}
                </Button>
              </div>
            </CardContent>
          </AnimatedGlowCard>
        </div>

        {/* 3D Visualization Canvas */}
        <div className="lg:col-span-3">
          <AnimatedGlowCard 
            glowColor="#ec4899" 
            intensity="high" 
            animationType="quantum"
            className="h-[700px]"
          >
            <CardContent className="p-6 h-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full bg-black rounded-lg border border-gray-700 cursor-grab active:cursor-grabbing"
                style={{ 
                  cursor: isInteracting ? 'grabbing' : 'grab',
                  touchAction: 'none'
                }}
              />
              
              {/* Overlay Information */}
              <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
                <div>Function: f(x,y,t) = {config.function}</div>
                <div>Domain: x∈[{config.xRange.join(', ')}], y∈[{config.yRange.join(', ')}]</div>
                {surface && (
                  <>
                    <div>Critical Points: {surface.critical_points.length}</div>
                    <div>Resolution: {config.resolution}×{config.resolution}</div>
                  </>
                )}
                {config.animated && (
                  <div>Time: t = {config.time.toFixed(2)}</div>
                )}
              </div>
              
              {/* Controls Hint */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg text-sm">
                <div>🖱️ Drag to rotate</div>
                <div>🎯 Scroll to zoom</div>
                <div>⚡ Enable animation for time-dependent functions</div>
              </div>
            </CardContent>
          </AnimatedGlowCard>
        </div>
      </div>

      {/* Analysis Results */}
      {surface && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnimatedGlowCard glowColor="#10b981" intensity="low" animationType="pulse">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{surface.critical_points.length}</div>
              <div className="text-sm text-gray-600">Critical Points</div>
            </CardContent>
          </AnimatedGlowCard>
          
          <AnimatedGlowCard glowColor="#f59e0b" intensity="low" animationType="pulse">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{surface.gradient_field.length}</div>
              <div className="text-sm text-gray-600">Gradient Vectors</div>
            </CardContent>
          </AnimatedGlowCard>
          
          <AnimatedGlowCard glowColor="#ef4444" intensity="low" animationType="pulse">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{surface.points.length * surface.points[0].length}</div>
              <div className="text-sm text-gray-600">Surface Points</div>
            </CardContent>
          </AnimatedGlowCard>
          
          <AnimatedGlowCard glowColor="#8b5cf6" intensity="low" animationType="pulse">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{zoom.toFixed(1)}×</div>
              <div className="text-sm text-gray-600">Current Zoom</div>
            </CardContent>
          </AnimatedGlowCard>
        </div>
      )}
    </div>
  );
}