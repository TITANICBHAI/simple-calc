"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { evaluate } from 'mathjs';
import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react';

// Dynamic import for Canvas to avoid SSR issues
import dynamic from 'next/dynamic';

const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);

const OrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
);

const Grid = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Grid),
  { ssr: false }
);

interface PlotSettings {
  expression: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  resolution: number;
  zScale: number;
  colorScheme: 'viridis' | 'plasma' | 'rainbow' | 'cool';
  showWireframe: boolean;
  showContours: boolean;
  showCrossSections: boolean;
  surfaceOpacity: number;
  crossSectionX: number;
  crossSectionY: number;
  animationEnabled: boolean;
  animationSpeed: number;
}

// Simple 3D Surface Component
function Surface3D({ 
  points, 
  showWireframe, 
  opacity, 
  zScale 
}: {
  points: Array<{ x: number; y: number; z: number; color: [number, number, number] }>;
  showWireframe: boolean;
  opacity: number;
  zScale: number;
}) {
  if (typeof window === 'undefined') return null;
  
  const THREE = require('three');
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    
    points.forEach(point => {
      vertices.push(point.x, point.y, point.z * zScale);
      colors.push(point.color[0], point.color[1], point.color[2]);
    });
    
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geom;
  }, [points, zScale, THREE]);

  return (
    <points geometry={geometry}>
      <pointsMaterial 
        size={0.05} 
        vertexColors 
        transparent 
        opacity={opacity}
      />
    </points>
  );
}

// Cross Section Lines
function CrossSectionLines({ 
  settings, 
  zScale 
}: { 
  settings: PlotSettings; 
  zScale: number;
}) {
  if (typeof window === 'undefined' || !settings.showCrossSections) return null;
  
  const THREE = require('three');
  
  const xSectionPoints = useMemo(() => {
    const points = [];
    const resolution = 50;
    
    for (let i = 0; i <= resolution; i++) {
      const y = settings.yMin + (settings.yMax - settings.yMin) * i / resolution;
      try {
        const z = evaluate(settings.expression, { x: settings.crossSectionX, y });
        if (typeof z === 'number' && isFinite(z)) {
          points.push(new THREE.Vector3(settings.crossSectionX, y, z * zScale));
        }
      } catch (e) {
        // Skip invalid points
      }
    }
    return points;
  }, [settings, zScale, THREE]);

  const ySectionPoints = useMemo(() => {
    const points = [];
    const resolution = 50;
    
    for (let i = 0; i <= resolution; i++) {
      const x = settings.xMin + (settings.xMax - settings.xMin) * i / resolution;
      try {
        const z = evaluate(settings.expression, { x, y: settings.crossSectionY });
        if (typeof z === 'number' && isFinite(z)) {
          points.push(new THREE.Vector3(x, settings.crossSectionY, z * zScale));
        }
      } catch (e) {
        // Skip invalid points
      }
    }
    return points;
  }, [settings, zScale, THREE]);

  return (
    <group>
      {xSectionPoints.length > 1 && (
        <line>
          <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(xSectionPoints)} />
          <lineBasicMaterial attach="material" color="#ff0000" linewidth={3} />
        </line>
      )}
      
      {ySectionPoints.length > 1 && (
        <line>
          <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(ySectionPoints)} />
          <lineBasicMaterial attach="material" color="#0000ff" linewidth={3} />
        </line>
      )}
    </group>
  );
}

export default function Stable3DGrapher() {
  const [settings, setSettings] = useState<PlotSettings>({
    expression: 'sin(sqrt(x^2 + y^2))',
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    resolution: 40,
    zScale: 1,
    colorScheme: 'viridis',
    showWireframe: false,
    showContours: false,
    showCrossSections: false,
    surfaceOpacity: 0.9,
    crossSectionX: 0,
    crossSectionY: 0,
    animationEnabled: false,
    animationSpeed: 1
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number; z: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate surface data
  const surfacePoints = useMemo(() => {
    if (!settings.expression || !mounted) return [];
    
    setIsLoading(true);
    setError(null);

    try {
      const points: Array<{ x: number; y: number; z: number; color: [number, number, number] }> = [];
      const { xMin, xMax, yMin, yMax, resolution } = settings;
      
      let minZ = Infinity;
      let maxZ = -Infinity;

      // First pass: find Z range
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const x = xMin + (xMax - xMin) * i / resolution;
          const y = yMin + (yMax - yMin) * j / resolution;
          
          try {
            let z = evaluate(settings.expression, { 
              x, 
              y, 
              t: settings.animationEnabled ? animationTime : 0 
            });
            
            if (typeof z === 'number' && isFinite(z)) {
              minZ = Math.min(minZ, z);
              maxZ = Math.max(maxZ, z);
            }
          } catch (e) {
            // Skip invalid points
          }
        }
      }

      // Second pass: generate points with colors
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const x = xMin + (xMax - xMin) * i / resolution;
          const y = yMin + (yMax - yMin) * j / resolution;
          
          try {
            let z = evaluate(settings.expression, { 
              x, 
              y, 
              t: settings.animationEnabled ? animationTime : 0 
            });
            
            if (typeof z !== 'number' || !isFinite(z)) z = 0;
            
            // Normalize Z for color mapping
            const normalizedZ = maxZ > minZ ? (z - minZ) / (maxZ - minZ) : 0;
            const color = getColor(normalizedZ, settings.colorScheme);
            
            points.push({ x, y, z, color });
          } catch (e) {
            // Skip invalid points
          }
        }
      }

      setIsLoading(false);
      return points;
    } catch (err) {
      setError(`Error evaluating function: ${err}`);
      setIsLoading(false);
      return [];
    }
  }, [settings, animationTime, mounted]);

  // Color mapping function
  const getColor = (t: number, scheme: string): [number, number, number] => {
    t = Math.max(0, Math.min(1, t));
    
    switch (scheme) {
      case 'viridis':
        return [
          0.267 + 0.533 * t,
          0.004 + 0.873 * t,
          0.329 + 0.524 * t
        ];
      case 'plasma':
        return [
          0.050 + 0.898 * t,
          0.030 + 0.718 * t,
          0.527 + 0.416 * t
        ];
      case 'rainbow': {
        const hue = (1 - t) * 240;
        const { r, g, b } = hslToRgb(hue / 360, 1, 0.5);
        return [r, g, b];
      }
      case 'cool':
        return [t, 1 - t, 1];
      default:
        return [t, t, t];
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
    if (!settings.animationEnabled || !mounted) return;

    const interval = setInterval(() => {
      setAnimationTime(prev => prev + settings.animationSpeed * 0.02);
    }, 16);

    return () => clearInterval(interval);
  }, [settings.animationEnabled, settings.animationSpeed, mounted]);

  const updateSetting = <K extends keyof PlotSettings>(key: K, value: PlotSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading 3D Visualization...</p>
        </div>
      </div>
    );
  }

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
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
            </TabsList>

            <TabsContent value="function" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expression">Function f(x,y)</Label>
                  <Input
                    id="expression"
                    value={settings.expression}
                    onChange={(e) => updateSetting('expression', e.target.value)}
                    placeholder="e.g., sin(sqrt(x^2 + y^2))"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    Examples: sin(x)*cos(y), x^2 - y^2, exp(-x^2-y^2), x*y/(x^2+y^2+1)
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>X Min</Label>
                    <Input
                      type="number"
                      value={settings.xMin}
                      onChange={(e) => updateSetting('xMin', parseFloat(e.target.value) || -5)}
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>X Max</Label>
                    <Input
                      type="number"
                      value={settings.xMax}
                      onChange={(e) => updateSetting('xMax', parseFloat(e.target.value) || 5)}
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Min</Label>
                    <Input
                      type="number"
                      value={settings.yMin}
                      onChange={(e) => updateSetting('yMin', parseFloat(e.target.value) || -5)}
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Max</Label>
                    <Input
                      type="number"
                      value={settings.yMax}
                      onChange={(e) => updateSetting('yMax', parseFloat(e.target.value) || 5)}
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Resolution: {settings.resolution}</Label>
                  <Slider
                    value={[settings.resolution]}
                    onValueChange={([value]) => updateSetting('resolution', value)}
                    min={20}
                    max={60}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Z Scale: {settings.zScale.toFixed(1)}</Label>
                  <Slider
                    value={[settings.zScale]}
                    onValueChange={([value]) => updateSetting('zScale', value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opacity: {settings.surfaceOpacity.toFixed(1)}</Label>
                  <Slider
                    value={[settings.surfaceOpacity]}
                    onValueChange={([value]) => updateSetting('surfaceOpacity', value)}
                    min={0.2}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value: any) => updateSetting('colorScheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viridis">Viridis</SelectItem>
                      <SelectItem value="plasma">Plasma</SelectItem>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                      <SelectItem value="cool">Cool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Cross Sections</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.showCrossSections}
                      onCheckedChange={(checked) => updateSetting('showCrossSections', checked)}
                    />
                    <Label>Show Cross Sections</Label>
                  </div>
                  
                  {settings.showCrossSections && (
                    <div className="ml-6 space-y-3">
                      <div className="space-y-2">
                        <Label>X = {settings.crossSectionX.toFixed(1)} (Red Line)</Label>
                        <Slider
                          value={[settings.crossSectionX]}
                          onValueChange={([value]) => updateSetting('crossSectionX', value)}
                          min={settings.xMin}
                          max={settings.xMax}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Y = {settings.crossSectionY.toFixed(1)} (Blue Line)</Label>
                        <Slider
                          value={[settings.crossSectionY]}
                          onValueChange={([value]) => updateSetting('crossSectionY', value)}
                          min={settings.yMin}
                          max={settings.yMax}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animation" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.animationEnabled}
                    onCheckedChange={(checked) => updateSetting('animationEnabled', checked)}
                  />
                  <Label>Enable Animation (parameter t)</Label>
                </div>
                
                {settings.animationEnabled && (
                  <div className="space-y-4 ml-6">
                    <div className="space-y-2">
                      <Label>Speed: {settings.animationSpeed.toFixed(1)}</Label>
                      <Slider
                        value={[settings.animationSpeed]}
                        onValueChange={([value]) => updateSetting('animationSpeed', value)}
                        min={0.1}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => updateSetting('animationEnabled', !settings.animationEnabled)}
                        variant={settings.animationEnabled ? "destructive" : "default"}
                        size="sm"
                      >
                        {settings.animationEnabled ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {settings.animationEnabled ? "Pause" : "Play"}
                      </Button>
                      <Button
                        onClick={() => setAnimationTime(0)}
                        variant="outline"
                        size="sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Badge variant="outline">
                        t = {animationTime.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
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
            {mounted && (
              <Canvas
                camera={{ position: [15, 15, 15], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
              >
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 10]} intensity={0.6} />
                <pointLight position={[-10, -10, -10]} intensity={0.3} />
                
                <Grid 
                  args={[20, 20]} 
                  cellColor="#ddd" 
                  sectionColor="#999"
                />
                
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  dampingFactor={0.05}
                />

                {surfacePoints.length > 0 && (
                  <Surface3D
                    points={surfacePoints}
                    showWireframe={settings.showWireframe}
                    opacity={settings.surfaceOpacity}
                    zScale={settings.zScale}
                  />
                )}

                <CrossSectionLines settings={settings} zScale={settings.zScale} />
              </Canvas>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}