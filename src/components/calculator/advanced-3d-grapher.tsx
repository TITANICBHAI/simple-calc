"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { evaluate } from 'mathjs';
import { Play, Pause, RotateCcw, Download, Info, Eye, EyeOff } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface SurfaceData {
  vertices: Float32Array;
  indices: Uint16Array;
  colors: Float32Array;
  normals: Float32Array;
  boundingBox: { min: Point3D; max: Point3D };
}

interface ContourLine {
  points: Point3D[];
  level: number;
  color: string;
}

interface CriticalPoint {
  position: Point3D;
  type: 'minimum' | 'maximum' | 'saddle';
  value: number;
}

interface GradientVector {
  position: Point3D;
  direction: Point3D;
  magnitude: number;
}

interface PlotOptions {
  expression: string;
  xDomain: [number, number];
  yDomain: [number, number];
  resolution: number;
  zScale: number;
  colorScheme: 'viridis' | 'plasma' | 'rainbow' | 'grayscale';
  showWireframe: boolean;
  showContours: boolean;
  showGradients: boolean;
  showCriticalPoints: boolean;
  showCrossSections: boolean;
  contourLevels: number;
  gradientDensity: number;
  crossSectionX: number;
  crossSectionY: number;
  animationParameter: string;
  animationRange: [number, number];
  animationSpeed: number;
  surfaceOpacity: number;
}

// Surface mesh component
function SurfaceMesh({ 
  surfaceData, 
  colorScheme, 
  showWireframe, 
  opacity, 
  zScale 
}: { 
  surfaceData: SurfaceData | null;
  colorScheme: string;
  showWireframe: boolean;
  opacity: number;
  zScale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!surfaceData) return;

    const geom = new THREE.BufferGeometry();
    
    // Scale Z coordinates
    const scaledVertices = new Float32Array(surfaceData.vertices.length);
    for (let i = 0; i < surfaceData.vertices.length; i += 3) {
      scaledVertices[i] = surfaceData.vertices[i];       // x
      scaledVertices[i + 1] = surfaceData.vertices[i + 1]; // y
      scaledVertices[i + 2] = surfaceData.vertices[i + 2] * zScale; // z scaled
    }

    geom.setAttribute('position', new THREE.BufferAttribute(scaledVertices, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(surfaceData.colors, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(surfaceData.normals, 3));
    geom.setIndex(new THREE.BufferAttribute(surfaceData.indices, 1));
    
    setGeometry(geom);

    return () => {
      geom.dispose();
    };
  }, [surfaceData, zScale]);

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhongMaterial 
        vertexColors
        transparent
        opacity={opacity}
        wireframe={showWireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Contour lines component
function ContourLines({ 
  contours, 
  zScale 
}: { 
  contours: ContourLine[];
  zScale: number;
}) {
  return (
    <group>
      {contours.map((contour, index) => {
        const points = contour.points.map(p => 
          new THREE.Vector3(p.x, p.y, p.z * zScale)
        );
        
        if (points.length < 2) return null;

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={index}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial 
              attach="material" 
              color={contour.color}
              linewidth={2}
            />
          </line>
        );
      })}
    </group>
  );
}

// Critical points component
function CriticalPoints({ 
  criticalPoints, 
  zScale 
}: { 
  criticalPoints: CriticalPoint[];
  zScale: number;
}) {
  const getPointColor = (type: string) => {
    switch (type) {
      case 'minimum': return '#00ff00';
      case 'maximum': return '#ff0000';
      case 'saddle': return '#ffff00';
      default: return '#ffffff';
    }
  };

  return (
    <group>
      {criticalPoints.map((point, index) => (
        <mesh 
          key={index} 
          position={[point.position.x, point.position.y, point.position.z * zScale]}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={getPointColor(point.type)} />
        </mesh>
      ))}
    </group>
  );
}

// Gradient vectors component
function GradientVectors({ 
  gradients, 
  zScale 
}: { 
  gradients: GradientVector[];
  zScale: number;
}) {
  return (
    <group>
      {gradients.map((grad, index) => {
        const start = new THREE.Vector3(
          grad.position.x, 
          grad.position.y, 
          grad.position.z * zScale
        );
        const end = new THREE.Vector3(
          grad.position.x + grad.direction.x * 0.5,
          grad.position.y + grad.direction.y * 0.5,
          grad.position.z * zScale + grad.direction.z * 0.5 * zScale
        );
        
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <group key={index}>
            <line>
              <bufferGeometry attach="geometry" {...geometry} />
              <lineBasicMaterial 
                attach="material" 
                color="#ff6600"
                linewidth={3}
              />
            </line>
            {/* Arrow head */}
            <mesh position={[end.x, end.y, end.z]}>
              <coneGeometry args={[0.05, 0.1, 8]} />
              <meshStandardMaterial color="#ff6600" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Cross sections component
function CrossSections({ 
  options, 
  surfaceData, 
  zScale 
}: { 
  options: PlotOptions;
  surfaceData: SurfaceData | null;
  zScale: number;
}) {
  if (!options.showCrossSections || !surfaceData) return null;

  // Generate cross section at x = crossSectionX
  const xSectionPoints: THREE.Vector3[] = [];
  const ySectionPoints: THREE.Vector3[] = [];

  // Sample points along the cross sections
  const resolution = 50;
  const { xDomain, yDomain, crossSectionX, crossSectionY } = options;

  // X cross section (fix x, vary y)
  for (let i = 0; i <= resolution; i++) {
    const y = yDomain[0] + (yDomain[1] - yDomain[0]) * i / resolution;
    try {
      const z = evaluate(options.expression, { x: crossSectionX, y });
      if (typeof z === 'number' && isFinite(z)) {
        xSectionPoints.push(new THREE.Vector3(crossSectionX, y, z * zScale));
      }
    } catch (e) {
      // Skip invalid points
    }
  }

  // Y cross section (fix y, vary x)
  for (let i = 0; i <= resolution; i++) {
    const x = xDomain[0] + (xDomain[1] - xDomain[0]) * i / resolution;
    try {
      const z = evaluate(options.expression, { x, y: crossSectionY });
      if (typeof z === 'number' && isFinite(z)) {
        ySectionPoints.push(new THREE.Vector3(x, crossSectionY, z * zScale));
      }
    } catch (e) {
      // Skip invalid points
    }
  }

  return (
    <group>
      {/* X cross section */}
      {xSectionPoints.length > 1 && (
        <line>
          <bufferGeometry 
            attach="geometry" 
            {...new THREE.BufferGeometry().setFromPoints(xSectionPoints)} 
          />
          <lineBasicMaterial 
            attach="material" 
            color="#ff0000"
            linewidth={4}
          />
        </line>
      )}
      
      {/* Y cross section */}
      {ySectionPoints.length > 1 && (
        <line>
          <bufferGeometry 
            attach="geometry" 
            {...new THREE.BufferGeometry().setFromPoints(ySectionPoints)} 
          />
          <lineBasicMaterial 
            attach="material" 
            color="#0000ff"
            linewidth={4}
          />
        </line>
      )}
    </group>
  );
}

// Point picker component
function PointPicker({ 
  onPointSelected 
}: { 
  onPointSelected: (point: Point3D | null) => void;
}) {
  const { camera, raycaster, scene } = useThree();
  const [mouse] = useState(new THREE.Vector2());

  const handleClick = useCallback((event: any) => {
    // Convert mouse coordinates
    const rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Cast ray
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      onPointSelected({ x: point.x, y: point.y, z: point.z });
    } else {
      onPointSelected(null);
    }
  }, [camera, raycaster, scene, mouse, onPointSelected]);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [handleClick]);

  return null;
}

export default function Advanced3DGrapher() {
  const [options, setOptions] = useState<PlotOptions>({
    expression: 'sin(sqrt(x^2 + y^2))',
    xDomain: [-5, 5],
    yDomain: [-5, 5],
    resolution: 50,
    zScale: 1,
    colorScheme: 'viridis',
    showWireframe: false,
    showContours: true,
    showGradients: false,
    showCriticalPoints: false,
    showCrossSections: false,
    contourLevels: 10,
    gradientDensity: 10,
    crossSectionX: 0,
    crossSectionY: 0,
    animationParameter: 't',
    animationRange: [0, 2],
    animationSpeed: 1,
    surfaceOpacity: 0.8
  });

  const [surfaceData, setSurfaceData] = useState<SurfaceData | null>(null);
  const [contours, setContours] = useState<ContourLine[]>([]);
  const [criticalPoints, setCriticalPoints] = useState<CriticalPoint[]>([]);
  const [gradients, setGradients] = useState<GradientVector[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point3D | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate surface data
  const generateSurface = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { expression, xDomain, yDomain, resolution } = options;
      const vertices: number[] = [];
      const indices: number[] = [];
      const colors: number[] = [];
      const normals: number[] = [];

      let minZ = Infinity;
      let maxZ = -Infinity;
      const zValues: number[][] = [];

      // Generate Z values
      for (let i = 0; i <= resolution; i++) {
        zValues[i] = [];
        for (let j = 0; j <= resolution; j++) {
          const x = xDomain[0] + (xDomain[1] - xDomain[0]) * i / resolution;
          const y = yDomain[0] + (yDomain[1] - yDomain[0]) * j / resolution;
          
          try {
            let z = evaluate(expression, { x, y, t: animationTime });
            if (typeof z !== 'number' || !isFinite(z)) z = 0;
            
            zValues[i][j] = z;
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
          } catch (e) {
            zValues[i][j] = 0;
          }
        }
      }

      // Generate vertices and colors
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const x = xDomain[0] + (xDomain[1] - xDomain[0]) * i / resolution;
          const y = yDomain[0] + (yDomain[1] - yDomain[0]) * j / resolution;
          const z = zValues[i][j];

          vertices.push(x, y, z);

          // Color based on height
          const normalizedZ = maxZ > minZ ? (z - minZ) / (maxZ - minZ) : 0;
          const color = getColorFromScheme(normalizedZ, options.colorScheme);
          colors.push(color.r, color.g, color.b);

          // Simple normal calculation
          let nx = 0, ny = 0, nz = 1;
          if (i > 0 && i < resolution && j > 0 && j < resolution) {
            const dzdx = (zValues[i + 1][j] - zValues[i - 1][j]) / 2;
            const dzdy = (zValues[i][j + 1] - zValues[i][j - 1]) / 2;
            const length = Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1);
            nx = -dzdx / length;
            ny = -dzdy / length;
            nz = 1 / length;
          }
          normals.push(nx, ny, nz);
        }
      }

      // Generate indices
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const a = i * (resolution + 1) + j;
          const b = a + 1;
          const c = (i + 1) * (resolution + 1) + j;
          const d = c + 1;

          indices.push(a, c, b);
          indices.push(b, c, d);
        }
      }

      const newSurfaceData: SurfaceData = {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
        colors: new Float32Array(colors),
        normals: new Float32Array(normals),
        boundingBox: {
          min: { x: xDomain[0], y: yDomain[0], z: minZ },
          max: { x: xDomain[1], y: yDomain[1], z: maxZ }
        }
      };

      setSurfaceData(newSurfaceData);

      // Generate additional features if enabled
      if (options.showContours) {
        generateContours(newSurfaceData);
      }
      if (options.showCriticalPoints) {
        generateCriticalPoints();
      }
      if (options.showGradients) {
        generateGradientField();
      }

    } catch (err) {
      setError(`Error generating surface: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [options, animationTime]);

  // Generate contour lines
  const generateContours = useCallback((surface: SurfaceData) => {
    const { min, max } = surface.boundingBox;
    const levels = [];
    
    for (let i = 0; i < options.contourLevels; i++) {
      const level = min.z + (max.z - min.z) * i / (options.contourLevels - 1);
      levels.push(level);
    }

    const newContours: ContourLine[] = levels.map((level, index) => ({
      points: [], // Simplified - would need marching squares algorithm
      level,
      color: `hsl(${(index / options.contourLevels) * 360}, 70%, 50%)`
    }));

    setContours(newContours);
  }, [options.contourLevels]);

  // Generate critical points (simplified)
  const generateCriticalPoints = useCallback(() => {
    // Simplified implementation - would need numerical optimization
    const newCriticalPoints: CriticalPoint[] = [];
    setCriticalPoints(newCriticalPoints);
  }, [options]);

  // Generate gradient field
  const generateGradientField = useCallback(() => {
    const { xDomain, yDomain, gradientDensity } = options;
    const newGradients: GradientVector[] = [];

    for (let i = 0; i < gradientDensity; i++) {
      for (let j = 0; j < gradientDensity; j++) {
        const x = xDomain[0] + (xDomain[1] - xDomain[0]) * i / (gradientDensity - 1);
        const y = yDomain[0] + (yDomain[1] - yDomain[0]) * j / (gradientDensity - 1);

        try {
          // Numerical gradient calculation
          const h = 0.001;
          const z = evaluate(options.expression, { x, y, t: animationTime });
          const zx = evaluate(options.expression, { x: x + h, y, t: animationTime });
          const zy = evaluate(options.expression, { x, y: y + h, t: animationTime });

          const gradX = (zx - z) / h;
          const gradY = (zy - z) / h;
          const magnitude = Math.sqrt(gradX * gradX + gradY * gradY);

          if (isFinite(gradX) && isFinite(gradY) && magnitude > 0.01) {
            newGradients.push({
              position: { x, y, z },
              direction: { x: gradX / magnitude, y: gradY / magnitude, z: 0 },
              magnitude
            });
          }
        } catch (e) {
          // Skip invalid points
        }
      }
    }

    setGradients(newGradients);
  }, [options, animationTime]);

  // Color scheme function
  const getColorFromScheme = (t: number, scheme: string) => {
    t = Math.max(0, Math.min(1, t));
    
    switch (scheme) {
      case 'viridis':
        return {
          r: 0.267 + 0.533 * t,
          g: 0.004 + 0.873 * t,
          b: 0.329 + 0.524 * t
        };
      case 'plasma':
        return {
          r: 0.050 + 0.898 * t,
          g: 0.030 + 0.718 * t,
          b: 0.527 + 0.416 * t
        };
      case 'rainbow':
        const hue = (1 - t) * 240;
        return hslToRgb(hue / 360, 1, 0.5);
      default:
        return { r: t, g: t, b: t };
    }
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return { r: r + m, g: g + m, b: b + m };
  };

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAnimationTime(prev => {
        const next = prev + options.animationSpeed * 0.02;
        const [min, max] = options.animationRange;
        return next > max ? min : next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isAnimating, options.animationSpeed, options.animationRange]);

  // Generate surface when options change
  useEffect(() => {
    generateSurface();
  }, [generateSurface]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Advanced 3D Function Grapher
            <div className="flex items-center space-x-2">
              {isLoading && <Badge variant="secondary">Computing...</Badge>}
              {error && <Badge variant="destructive">Error</Badge>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="function" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="function">Function</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
            </TabsList>

            <TabsContent value="function" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expression">Function f(x,y)</Label>
                  <Input
                    id="expression"
                    value={options.expression}
                    onChange={(e) => setOptions(prev => ({ ...prev, expression: e.target.value }))}
                    placeholder="e.g., sin(sqrt(x^2 + y^2))"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>X Domain</Label>
                    <div className="flex space-x-1">
                      <Input
                        type="number"
                        value={options.xDomain[0]}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          xDomain: [parseFloat(e.target.value) || -5, prev.xDomain[1]]
                        }))}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        value={options.xDomain[1]}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          xDomain: [prev.xDomain[0], parseFloat(e.target.value) || 5]
                        }))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Y Domain</Label>
                    <div className="flex space-x-1">
                      <Input
                        type="number"
                        value={options.yDomain[0]}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          yDomain: [parseFloat(e.target.value) || -5, prev.yDomain[1]]
                        }))}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        value={options.yDomain[1]}
                        onChange={(e) => setOptions(prev => ({
                          ...prev,
                          yDomain: [prev.yDomain[0], parseFloat(e.target.value) || 5]
                        }))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Resolution: {options.resolution}</Label>
                  <Slider
                    value={[options.resolution]}
                    onValueChange={([value]) => setOptions(prev => ({ ...prev, resolution: value }))}
                    min={20}
                    max={100}
                    step={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Z Scale: {options.zScale.toFixed(1)}</Label>
                  <Slider
                    value={[options.zScale]}
                    onValueChange={([value]) => setOptions(prev => ({ ...prev, zScale: value }))}
                    min={0.1}
                    max={3}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opacity: {options.surfaceOpacity.toFixed(1)}</Label>
                  <Slider
                    value={[options.surfaceOpacity]}
                    onValueChange={([value]) => setOptions(prev => ({ ...prev, surfaceOpacity: value }))}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select
                    value={options.colorScheme}
                    onValueChange={(value: any) => setOptions(prev => ({ ...prev, colorScheme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viridis">Viridis</SelectItem>
                      <SelectItem value="plasma">Plasma</SelectItem>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                      <SelectItem value="grayscale">Grayscale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={options.showWireframe}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showWireframe: checked }))}
                  />
                  <Label>Wireframe</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={options.showContours}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showContours: checked }))}
                    />
                    <Label>Show Contour Lines</Label>
                  </div>
                  {options.showContours && (
                    <div className="ml-6 space-y-2">
                      <Label>Contour Levels: {options.contourLevels}</Label>
                      <Slider
                        value={[options.contourLevels]}
                        onValueChange={([value]) => setOptions(prev => ({ ...prev, contourLevels: value }))}
                        min={5}
                        max={20}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={options.showGradients}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showGradients: checked }))}
                    />
                    <Label>Show Gradient Field</Label>
                  </div>
                  {options.showGradients && (
                    <div className="ml-6 space-y-2">
                      <Label>Gradient Density: {options.gradientDensity}</Label>
                      <Slider
                        value={[options.gradientDensity]}
                        onValueChange={([value]) => setOptions(prev => ({ ...prev, gradientDensity: value }))}
                        min={5}
                        max={20}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={options.showCriticalPoints}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showCriticalPoints: checked }))}
                  />
                  <Label>Show Critical Points</Label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={options.showCrossSections}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showCrossSections: checked }))}
                    />
                    <Label>Show Cross Sections</Label>
                  </div>
                  {options.showCrossSections && (
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>X = {options.crossSectionX}</Label>
                        <Slider
                          value={[options.crossSectionX]}
                          onValueChange={([value]) => setOptions(prev => ({ ...prev, crossSectionX: value }))}
                          min={options.xDomain[0]}
                          max={options.xDomain[1]}
                          step={0.1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Y = {options.crossSectionY}</Label>
                        <Slider
                          value={[options.crossSectionY]}
                          onValueChange={([value]) => setOptions(prev => ({ ...prev, crossSectionY: value }))}
                          min={options.yDomain[0]}
                          max={options.yDomain[1]}
                          step={0.1}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Animation Parameter</Label>
                  <Input
                    value={options.animationParameter}
                    onChange={(e) => setOptions(prev => ({ ...prev, animationParameter: e.target.value }))}
                    placeholder="t"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Animation Range</Label>
                  <div className="flex space-x-1">
                    <Input
                      type="number"
                      value={options.animationRange[0]}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        animationRange: [parseFloat(e.target.value) || 0, prev.animationRange[1]]
                      }))}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      value={options.animationRange[1]}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        animationRange: [prev.animationRange[0], parseFloat(e.target.value) || 2]
                      }))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Speed: {options.animationSpeed.toFixed(1)}</Label>
                <Slider
                  value={[options.animationSpeed]}
                  onValueChange={([value]) => setOptions(prev => ({ ...prev, animationSpeed: value }))}
                  min={0.1}
                  max={3}
                  step={0.1}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsAnimating(!isAnimating)}
                  variant={isAnimating ? "destructive" : "default"}
                >
                  {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isAnimating ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={() => setAnimationTime(options.animationRange[0])}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Badge variant="outline">
                  {options.animationParameter} = {animationTime.toFixed(2)}
                </Badge>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {selectedPoint && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <strong>Selected Point:</strong> ({selectedPoint.x.toFixed(3)}, {selectedPoint.y.toFixed(3)}, {selectedPoint.z.toFixed(3)})
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3D Visualization */}
      <Card>
        <CardContent className="p-0">
          <div style={{ width: '100%', height: '600px' }}>
            <Canvas
              camera={{ position: [10, 10, 10], fov: 60 }}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 10]} intensity={0.6} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              
              <Grid args={[20, 20]} cellColor="#ddd" sectionColor="#999" />
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                dampingFactor={0.05}
              />

              <PointPicker onPointSelected={setSelectedPoint} />

              {surfaceData && (
                <SurfaceMesh
                  surfaceData={surfaceData}
                  colorScheme={options.colorScheme}
                  showWireframe={options.showWireframe}
                  opacity={options.surfaceOpacity}
                  zScale={options.zScale}
                />
              )}

              {options.showContours && (
                <ContourLines contours={contours} zScale={options.zScale} />
              )}

              {options.showCriticalPoints && (
                <CriticalPoints criticalPoints={criticalPoints} zScale={options.zScale} />
              )}

              {options.showGradients && (
                <GradientVectors gradients={gradients} zScale={options.zScale} />
              )}

              {options.showCrossSections && (
                <CrossSections 
                  options={options} 
                  surfaceData={surfaceData} 
                  zScale={options.zScale} 
                />
              )}

              {/* Coordinate axes labels */}
              <Text position={[6, 0, 0]} fontSize={0.5} color="red">X</Text>
              <Text position={[0, 6, 0]} fontSize={0.5} color="green">Y</Text>
              <Text position={[0, 0, 6]} fontSize={0.5} color="blue">Z</Text>
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}