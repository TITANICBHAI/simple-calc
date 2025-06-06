"use client";

import { useState, type ChangeEvent, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FunctionSquare, RefreshCw, AlertCircleIcon, TrendingUp, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text3D } from '@react-three/drei';
import * as THREE from 'three';

// 3D Parabola Component
const ParabolaMesh = ({ a, b, c }: { a: number; b: number; c: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: 0x4f46e5,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });

  // Generate parabola vertices
  const vertices: number[] = [];
  const indices: number[] = [];
  
  const xRange = 10;
  const resolution = 50;
  
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const x = (i / resolution - 0.5) * xRange * 2;
      const z = (j / resolution - 0.5) * xRange * 2;
      const y = a * x * x + b * x + c;
      
      vertices.push(x, y, z);
      
      if (i < resolution && j < resolution) {
        const index = i * (resolution + 1) + j;
        indices.push(index, index + 1, index + resolution + 1);
        indices.push(index + 1, index + resolution + 2, index + resolution + 1);
      }
    }
  }
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};

// Root Markers Component
const RootMarkers = ({ roots }: { roots: Array<{ x: number; y: number }> }) => {
  return (
    <>
      {roots.map((root, index) => (
        <mesh key={index} position={[root.x, root.y, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color={0xff4444} />
        </mesh>
      ))}
    </>
  );
};

const QuadraticEquationSolver: React.FC = () => {
  const [coeffA, setCoeffA] = useState<string>('1');
  const [coeffB, setCoeffB] = useState<string>('0');
  const [coeffC, setCoeffC] = useState<string>('0');

  const [discriminant, setDiscriminant] = useState<string | null>(null);
  const [root1, setRoot1] = useState<string | null>(null);
  const [root2, setRoot2] = useState<string | null>(null);
  const [solutionType, setSolutionType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVisualization, setShowVisualization] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('solve');

  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers, a single decimal point, and a leading minus sign
    if (/^-?\d*\.?\d*$/.test(value) || value === '' || value === '-') {
      setter(value);
      setError(null); // Clear error on input change
      setDiscriminant(null); setRoot1(null); setRoot2(null); setSolutionType(null); // Clear previous results
    }
  };
  
  const formatNumber = (num: number, precision: number = 4): string => {
    const fixed = parseFloat(num.toFixed(precision));
    if (Math.abs(fixed) < 1e-7 && fixed !== 0) { // Use scientific for very small non-zero
        return fixed.toExponential(2);
    }
    return String(fixed); // Remove trailing zeros for whole numbers or simple decimals
  };

  // Calculate real roots for visualization
  const calculateRoots = () => {
    const a = parseFloat(coeffA);
    const b = parseFloat(coeffB);
    const c = parseFloat(coeffC);
    
    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return [];
    
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return [];
    
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const root1 = (-b + sqrtDiscriminant) / (2 * a);
    const root2 = (-b - sqrtDiscriminant) / (2 * a);
    
    return [
      { x: root1, y: 0 },
      ...(discriminant > 0 ? [{ x: root2, y: 0 }] : [])
    ];
  };

  const handleSolve = () => {
    setError(null);
    setDiscriminant(null);
    setRoot1(null);
    setRoot2(null);
    setSolutionType(null);

    const a = parseFloat(coeffA);
    const b = parseFloat(coeffB);
    const c = parseFloat(coeffC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError("Please enter valid numerical coefficients for a, b, and c.");
      toast({ title: "Input Error", description: "Coefficients must be numbers.", variant: "destructive" });
      return;
    }

    if (a === 0) {
      // Linear equation: bx + c = 0
      if (b === 0) {
        if (c === 0) {
          setSolutionType("Infinite solutions (0x = 0)");
          setError("This is an identity (0 = 0), not a quadratic equation.");
        } else {
          setSolutionType("No solution (0x = -c where c ≠ 0)");
          setError("This equation has no solution (e.g., 0 = 5).");
        }
      } else {
        const x = -c / b;
        setSolutionType("Linear Equation (a=0)");
        setRoot1(`x = ${formatNumber(x)}`);
        setRoot2(null); // Only one root for linear
        setDiscriminant(null); // Discriminant not applicable
        toast({ title: "Linear Equation Solved", description: `Since a=0, solved bx+c=0.` });
      }
      return;
    }

    const delta = b * b - 4 * a * c;
    setDiscriminant(`Δ = ${formatNumber(delta)}`);

    if (delta > 0) {
      setSolutionType("Two distinct real roots");
      const x1 = (-b + Math.sqrt(delta)) / (2 * a);
      const x2 = (-b - Math.sqrt(delta)) / (2 * a);
      setRoot1(`x₁ = ${formatNumber(x1)}`);
      setRoot2(`x₂ = ${formatNumber(x2)}`);
      toast({ title: "Solved!", description: "Found two distinct real roots." });
    } else if (delta === 0) {
      setSolutionType("One real root (repeated)");
      const x = -b / (2 * a);
      setRoot1(`x₁ = x₂ = ${formatNumber(x)}`);
      setRoot2(null);
      toast({ title: "Solved!", description: "Found one real root (repeated)." });
    } else { // delta < 0
      setSolutionType("Two complex conjugate roots");
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-delta) / (2 * a);
      setRoot1(`x₁ = ${formatNumber(realPart)} + ${formatNumber(imagPart)}i`);
      setRoot2(`x₂ = ${formatNumber(realPart)} - ${formatNumber(imagPart)}i`);
      toast({ title: "Solved!", description: "Found two complex roots." });
    }
  };

  const handleReset = () => {
    setCoeffA('');
    setCoeffB('');
    setCoeffC('');
    setDiscriminant(null);
    setRoot1(null);
    setRoot2(null);
    setSolutionType(null);
    setError(null);
    toast({ title: "Quadratic Solver Reset", description: "Fields cleared." });
  };

  const currentRoots = calculateRoots();

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <FunctionSquare className="mr-2 h-6 w-6 text-accent" />
            Enhanced Quadratic Equation Solver
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            With 3D Visualization
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Solve and visualize quadratic equations: ax² + bx + c = 0
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="solve" className="flex items-center gap-2">
              <FunctionSquare className="w-4 h-4" />
              Solve
            </TabsTrigger>
            <TabsTrigger value="visualize" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              3D Visualization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solve" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Show Real-time Visualization</Label>
              <Switch
                checked={showVisualization}
                onCheckedChange={setShowVisualization}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <Label htmlFor="coeff-a" className="text-sm font-medium">Coefficient a</Label>
                <Input
                  id="coeff-a"
                  type="text"
                  inputMode="decimal"
                  value={coeffA}
                  onChange={handleInputChange(setCoeffA)}
                  placeholder="e.g., 1"
                  className="mt-1"
                  aria-label="Coefficient a"
                />
              </div>
              <div>
                <Label htmlFor="coeff-b" className="text-sm font-medium">Coefficient b</Label>
                <Input
                  id="coeff-b"
                  type="text"
                  inputMode="decimal"
                  value={coeffB}
                  onChange={handleInputChange(setCoeffB)}
                  placeholder="e.g., -3"
                  className="mt-1"
                  aria-label="Coefficient b"
                />
              </div>
              <div>
                <Label htmlFor="coeff-c" className="text-sm font-medium">Coefficient c</Label>
                <Input
                  id="coeff-c"
                  type="text"
                  inputMode="decimal"
                  value={coeffC}
                  onChange={handleInputChange(setCoeffC)}
                  placeholder="e.g., 2"
                  className="mt-1"
                  aria-label="Coefficient c"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSolve} className="flex-1">
                <FunctionSquare className="mr-2 h-4 w-4" />
                Solve Equation
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Results Section */}
            {error && (
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {solutionType && !error && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-green-800">Equation</Label>
                      <p className="text-lg font-mono bg-white p-2 rounded border">
                        {`${coeffA}x² + ${coeffB}x + ${coeffC} = 0`}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-800">Discriminant (Δ)</Label>
                      <p className="text-lg font-mono bg-white p-2 rounded border">
                        {discriminant}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-green-800">Solution Type</Label>
                    <Badge className="ml-2 bg-green-200 text-green-800">
                      {solutionType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {root1 && (
                      <div>
                        <Label className="text-sm font-semibold text-green-800">Root 1 (x₁)</Label>
                        <p className="text-lg font-mono bg-white p-2 rounded border">
                          {root1}
                        </p>
                      </div>
                    )}
                    {root2 && (
                      <div>
                        <Label className="text-sm font-semibold text-green-800">Root 2 (x₂)</Label>
                        <p className="text-lg font-mono bg-white p-2 rounded border">
                          {root2}
                        </p>
                      </div>
                    )}
                  </div>

                  {currentRoots.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-semibold text-green-800">
                        Root Visualization
                      </Label>
                      <p className="text-sm text-green-700">
                        {currentRoots.length === 1 ? 'One real root' : 'Two real roots'} marked in red on the 3D visualization
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Compact 2D Preview when visualization is enabled */}
            {showVisualization && (
              <div className="mt-6">
                <Label className="text-sm font-semibold mb-2 block">Live Preview</Label>
                <div className="h-32 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Switch to 3D Visualization tab for interactive view
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualize" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Interactive 3D Parabola</Label>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export View
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="h-96 w-full">
                  {typeof window !== 'undefined' && (
                    <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
                      <ambientLight intensity={0.4} />
                      <directionalLight position={[5, 5, 5]} intensity={1} />
                      
                      {/* 3D Parabola Surface */}
                      {parseFloat(coeffA) !== 0 && !isNaN(parseFloat(coeffA)) && (
                        <ParabolaMesh 
                          a={parseFloat(coeffA) || 1} 
                          b={parseFloat(coeffB) || 0} 
                          c={parseFloat(coeffC) || 0} 
                        />
                      )}

                      {/* Root Markers */}
                      <RootMarkers roots={currentRoots} />

                      {/* Coordinate System */}
                      <Grid infiniteGrid fadeDistance={30} fadeStrength={5} />
                      
                      {/* Axes */}
                      <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[10, 0.05, 0.05]} />
                        <meshStandardMaterial color={0xff0000} />
                      </mesh>
                      <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.05, 10, 0.05]} />
                        <meshStandardMaterial color={0x00ff00} />
                      </mesh>
                      <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.05, 0.05, 10]} />
                        <meshStandardMaterial color={0x0000ff} />
                      </mesh>

                      <OrbitControls enablePan enableZoom enableRotate />
                    </Canvas>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <Card className="p-3">
                  <Label className="font-semibold text-blue-600">Current Equation</Label>
                  <p className="font-mono mt-1">
                    f(x) = {coeffA || '1'}x² + {coeffB || '0'}x + {coeffC || '0'}
                  </p>
                </Card>
                <Card className="p-3">
                  <Label className="font-semibold text-green-600">Vertex</Label>
                  <p className="font-mono mt-1">
                    {parseFloat(coeffA) !== 0 ? (
                      `x = ${(-(parseFloat(coeffB) || 0) / (2 * (parseFloat(coeffA) || 1))).toFixed(2)}`
                    ) : 'N/A'}
                  </p>
                </Card>
                <Card className="p-3">
                  <Label className="font-semibold text-purple-600">Opens</Label>
                  <p className="font-mono mt-1">
                    {parseFloat(coeffA) > 0 ? 'Upward' : parseFloat(coeffA) < 0 ? 'Downward' : 'Linear'}
                  </p>
                </Card>
              </div>

              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Use mouse to rotate, zoom, and explore the 3D parabola. Red spheres mark the real roots where the parabola crosses the x-axis.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuadraticEquationSolver;