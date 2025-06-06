"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LineChart, Cpu, Atom, Calculator, Target, Sparkles,
  TrendingUp, BarChart3, Zap, Brain, Eye, Layers
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import our powerful mathematical engines
import { InteractiveGraphingEngine, type GraphData, type GraphOptions } from '@/lib/interactive-graphing-engine';
import { Visualization3DEngine, type Surface3DData, type Plot3DOptions } from '@/lib/3d-visualization-engine';
import { SymbolicAlgebraEngine, type SymbolicResult, type EquationSolution } from '@/lib/symbolic-algebra-engine';

export default function AdvancedMathVisualization() {
  const [activeTab, setActiveTab] = useState('graphing');
  
  // 2D Graphing states
  const [graphExpression, setGraphExpression] = useState('sin(x) + cos(x)');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [graphOptions, setGraphOptions] = useState<Partial<GraphOptions>>({
    domain: [-10, 10],
    resolution: 1000,
    showCriticalPoints: true,
    showAsymptotes: true,
    showDerivative: false
  });
  
  // 3D Visualization states
  const [surface3DExpression, setSurface3DExpression] = useState('sin(sqrt(x^2 + y^2))');
  const [surface3DData, setSurface3DData] = useState<Surface3DData | null>(null);
  const [surface3DOptions, setSurface3DOptions] = useState<Partial<Plot3DOptions>>({
    xDomain: [-5, 5],
    yDomain: [-5, 5],
    resolution: 30,
    showCriticalPoints: true,
    showGradients: true,
    colorScheme: 'viridis'
  });
  
  // Symbolic Algebra states
  const [symbolicExpression, setSymbolicExpression] = useState('x^2 + 3*x + 2');
  const [symbolicResult, setSymbolicResult] = useState<SymbolicResult | null>(null);
  const [equationToSolve, setEquationToSolve] = useState('x^2 - 4 = 0');
  const [equationSolution, setEquationSolution] = useState<EquationSolution | null>(null);
  
  // Canvas references
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const canvas3DRef = useRef<HTMLCanvasElement>(null);

  // 2D Graphing functions
  const generateGraph = () => {
    try {
      const data = InteractiveGraphingEngine.generateGraphData(graphExpression, graphOptions);
      setGraphData(data);
      drawGraph2D(data);
      
      toast({
        title: "Graph Generated Successfully",
        description: `Found ${data.critical_points.length} critical points and ${data.zeros.length} zeros`
      });
    } catch (error) {
      toast({
        title: "Graphing Error",
        description: error instanceof Error ? error.message : "Invalid expression",
        variant: "destructive"
      });
    }
  };

  const drawGraph2D = (data: GraphData) => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    const [xMin, xMax] = data.domain;
    const [yMin, yMax] = data.range;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Draw grid
    if (graphOptions.showGrid !== false) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * width;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * height;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
      }
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis
    const yZero = padding + height - ((-yMin) / yRange) * height;
    ctx.beginPath();
    ctx.moveTo(padding, yZero);
    ctx.lineTo(padding + width, yZero);
    ctx.stroke();

    // Y-axis
    const xZero = padding + ((-xMin) / xRange) * width;
    ctx.beginPath();
    ctx.moveTo(xZero, padding);
    ctx.lineTo(xZero, padding + height);
    ctx.stroke();

    // Draw function
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let firstPoint = true;
    for (let i = 0; i < data.x.length; i++) {
      if (isFinite(data.y[i])) {
        const x = padding + ((data.x[i] - xMin) / xRange) * width;
        const y = padding + height - ((data.y[i] - yMin) / yRange) * height;

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      } else {
        firstPoint = true;
      }
    }
    ctx.stroke();

    // Draw critical points
    if (graphOptions.showCriticalPoints && data.critical_points.length > 0) {
      data.critical_points.forEach(point => {
        const x = padding + ((point.x - xMin) / xRange) * width;
        const y = padding + height - ((point.y - yMin) / yRange) * height;
        
        ctx.fillStyle = point.type === 'minimum' ? '#10b981' : 
                       point.type === 'maximum' ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Arial';
        ctx.fillText(`(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`, x + 10, y - 10);
      });
    }

    // Draw zeros
    if (data.zeros.length > 0) {
      ctx.fillStyle = '#8b5cf6';
      data.zeros.forEach(zero => {
        const x = padding + ((zero - xMin) / xRange) * width;
        const y = yZero;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw derivative if enabled
    if (graphOptions.showDerivative && data.derivative) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      let firstDerivPoint = true;
      for (let i = 0; i < data.derivative.x.length; i++) {
        if (isFinite(data.derivative.y[i])) {
          const x = padding + ((data.derivative.x[i] - xMin) / xRange) * width;
          const y = padding + height - ((data.derivative.y[i] - yMin) / yRange) * height;

          if (firstDerivPoint) {
            ctx.moveTo(x, y);
            firstDerivPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          firstDerivPoint = true;
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  // 3D Surface functions
  const generate3DSurface = () => {
    try {
      const data = Visualization3DEngine.generateSurface(surface3DExpression, surface3DOptions);
      setSurface3DData(data);
      draw3DSurface(data);
      
      toast({
        title: "3D Surface Generated",
        description: `Surface with ${data.criticalPoints.length} critical points analyzed`
      });
    } catch (error) {
      toast({
        title: "3D Visualization Error",
        description: error instanceof Error ? error.message : "Invalid expression",
        variant: "destructive"
      });
    }
  };

  const draw3DSurface = (data: Surface3DData) => {
    const canvas = canvas3DRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple 3D wireframe projection
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 8;
    const angleX = 0.6;
    const angleY = 0.8;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    // Draw wireframe
    for (let i = 0; i < data.z.length - 1; i += 2) {
      for (let j = 0; j < data.z[i].length - 1; j += 2) {
        if (isFinite(data.z[i][j]) && isFinite(data.z[i+1][j]) && 
            isFinite(data.z[i][j+1]) && isFinite(data.z[i+1][j+1])) {
          
          // Project 3D points to 2D
          const points = [
            project3D(data.x[j], data.y[i], data.z[i][j], angleX, angleY, scale, centerX, centerY),
            project3D(data.x[j+1], data.y[i], data.z[i][j+1], angleX, angleY, scale, centerX, centerY),
            project3D(data.x[j+1], data.y[i+1], data.z[i+1][j+1], angleX, angleY, scale, centerX, centerY),
            project3D(data.x[j], data.y[i+1], data.z[i+1][j], angleX, angleY, scale, centerX, centerY)
          ];

          // Draw quad
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          ctx.lineTo(points[1].x, points[1].y);
          ctx.lineTo(points[2].x, points[2].y);
          ctx.lineTo(points[3].x, points[3].y);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    // Draw critical points
    if (surface3DOptions.showCriticalPoints && data.criticalPoints.length > 0) {
      data.criticalPoints.forEach(point => {
        const projected = project3D(point.x, point.y, point.z, angleX, angleY, scale, centerX, centerY);
        
        ctx.fillStyle = point.type === 'local_min' ? '#10b981' : 
                       point.type === 'local_max' ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  const project3D = (x: number, y: number, z: number, angleX: number, angleY: number, scale: number, centerX: number, centerY: number) => {
    // Simple 3D to 2D projection
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    const x2d = (x * cosY - z * sinY) * scale + centerX;
    const y2d = (y * cosX + (x * sinY + z * cosY) * sinX) * scale + centerY;

    return { x: x2d, y: y2d };
  };

  // Symbolic Algebra functions
  const processSymbolic = () => {
    try {
      const result = SymbolicAlgebraEngine.processExpression(symbolicExpression);
      setSymbolicResult(result);
      
      toast({
        title: "Symbolic Processing Complete",
        description: `Applied ${result.transformations.length} transformations`
      });
    } catch (error) {
      toast({
        title: "Symbolic Algebra Error",
        description: error instanceof Error ? error.message : "Invalid expression",
        variant: "destructive"
      });
    }
  };

  const solveEquation = () => {
    try {
      const solution = SymbolicAlgebraEngine.solveEquation(equationToSolve);
      setEquationSolution(solution);
      
      toast({
        title: "Equation Solved",
        description: `Found ${solution.solutions.length} solution(s)`
      });
    } catch (error) {
      toast({
        title: "Equation Solving Error",
        description: error instanceof Error ? error.message : "Invalid equation",
        variant: "destructive"
      });
    }
  };

  // Initialize with examples
  useEffect(() => {
    generateGraph();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <CardTitle>Advanced Mathematical Visualization & Algebra</CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Research Grade
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Professional mathematical visualization, 3D surface analysis, and symbolic computation
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="graphing" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                2D Graphing
              </TabsTrigger>
              <TabsTrigger value="3d" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                3D Surfaces
              </TabsTrigger>
              <TabsTrigger value="symbolic" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Symbolic Algebra
              </TabsTrigger>
            </TabsList>

            {/* 2D Graphing */}
            <TabsContent value="graphing" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="graph_expression">Mathematical Function</Label>
                    <Input 
                      id="graph_expression"
                      value={graphExpression}
                      onChange={(e) => setGraphExpression(e.target.value)}
                      placeholder="e.g., sin(x) + cos(x), x^2 - 4, log(x)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>X Domain</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Min"
                          value={graphOptions.domain?.[0] || -10}
                          onChange={(e) => setGraphOptions(prev => ({
                            ...prev,
                            domain: [Number(e.target.value), prev.domain?.[1] || 10]
                          }))}
                        />
                        <Input 
                          type="number" 
                          placeholder="Max"
                          value={graphOptions.domain?.[1] || 10}
                          onChange={(e) => setGraphOptions(prev => ({
                            ...prev,
                            domain: [prev.domain?.[0] || -10, Number(e.target.value)]
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Resolution</Label>
                      <Input 
                        type="number"
                        value={graphOptions.resolution || 1000}
                        onChange={(e) => setGraphOptions(prev => ({
                          ...prev,
                          resolution: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Show Critical Points</Label>
                      <Switch 
                        checked={graphOptions.showCriticalPoints || false}
                        onCheckedChange={(checked) => setGraphOptions(prev => ({
                          ...prev,
                          showCriticalPoints: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Show Asymptotes</Label>
                      <Switch 
                        checked={graphOptions.showAsymptotes || false}
                        onCheckedChange={(checked) => setGraphOptions(prev => ({
                          ...prev,
                          showAsymptotes: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Show Derivative</Label>
                      <Switch 
                        checked={graphOptions.showDerivative || false}
                        onCheckedChange={(checked) => setGraphOptions(prev => ({
                          ...prev,
                          showDerivative: checked
                        }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={generateGraph} className="w-full">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Graph
                  </Button>
                </div>

                <div className="space-y-4">
                  <canvas
                    ref={canvas2DRef}
                    width={400}
                    height={300}
                    className="w-full border rounded-lg bg-white"
                  />
                  
                  {graphData && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Analysis Results:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Critical Points: {graphData.critical_points.length}</div>
                        <div>Zeros: {graphData.zeros.length}</div>
                        <div>Asymptotes: {graphData.asymptotes.length}</div>
                        <div>Domain: [{graphData.domain[0]}, {graphData.domain[1]}]</div>
                      </div>
                      
                      {graphData.critical_points.length > 0 && (
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {graphData.critical_points.map((point, index) => (
                              <div key={index} className="text-xs p-1 bg-muted rounded">
                                {point.description}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 3D Surfaces */}
            <TabsContent value="3d" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="surface3d_expression">3D Function f(x,y)</Label>
                    <Input 
                      id="surface3d_expression"
                      value={surface3DExpression}
                      onChange={(e) => setSurface3DExpression(e.target.value)}
                      placeholder="e.g., sin(sqrt(x^2 + y^2)), x^2 + y^2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>X Domain</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Min"
                          value={surface3DOptions.xDomain?.[0] || -5}
                          onChange={(e) => setSurface3DOptions(prev => ({
                            ...prev,
                            xDomain: [Number(e.target.value), prev.xDomain?.[1] || 5]
                          }))}
                        />
                        <Input 
                          type="number" 
                          placeholder="Max"
                          value={surface3DOptions.xDomain?.[1] || 5}
                          onChange={(e) => setSurface3DOptions(prev => ({
                            ...prev,
                            xDomain: [prev.xDomain?.[0] || -5, Number(e.target.value)]
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Y Domain</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Min"
                          value={surface3DOptions.yDomain?.[0] || -5}
                          onChange={(e) => setSurface3DOptions(prev => ({
                            ...prev,
                            yDomain: [Number(e.target.value), prev.yDomain?.[1] || 5]
                          }))}
                        />
                        <Input 
                          type="number" 
                          placeholder="Max"
                          value={surface3DOptions.yDomain?.[1] || 5}
                          onChange={(e) => setSurface3DOptions(prev => ({
                            ...prev,
                            yDomain: [prev.yDomain?.[0] || -5, Number(e.target.value)]
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Color Scheme</Label>
                      <Select 
                        value={surface3DOptions.colorScheme || 'viridis'}
                        onValueChange={(value: any) => setSurface3DOptions(prev => ({
                          ...prev,
                          colorScheme: value
                        }))}
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
                    
                    <div className="flex items-center justify-between">
                      <Label>Show Critical Points</Label>
                      <Switch 
                        checked={surface3DOptions.showCriticalPoints || false}
                        onCheckedChange={(checked) => setSurface3DOptions(prev => ({
                          ...prev,
                          showCriticalPoints: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Show Gradients</Label>
                      <Switch 
                        checked={surface3DOptions.showGradients || false}
                        onCheckedChange={(checked) => setSurface3DOptions(prev => ({
                          ...prev,
                          showGradients: checked
                        }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={generate3DSurface} className="w-full">
                    <Layers className="mr-2 h-4 w-4" />
                    Generate 3D Surface
                  </Button>
                </div>

                <div className="space-y-4">
                  <canvas
                    ref={canvas3DRef}
                    width={400}
                    height={300}
                    className="w-full border rounded-lg bg-white"
                  />
                  
                  {surface3DData && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Surface Analysis:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Critical Points: {surface3DData.criticalPoints.length}</div>
                        <div>Volume: {surface3DData.analysis.volume.toFixed(2)}</div>
                        <div>Surface Area: {surface3DData.analysis.surfaceArea.toFixed(2)}</div>
                        <div>Symmetries: {surface3DData.analysis.symmetries.length}</div>
                      </div>
                      
                      <div className="text-sm">
                        <div><strong>Global Min:</strong> ({surface3DData.analysis.extrema.globalMin.x.toFixed(2)}, {surface3DData.analysis.extrema.globalMin.y.toFixed(2)}, {surface3DData.analysis.extrema.globalMin.z.toFixed(2)})</div>
                        <div><strong>Global Max:</strong> ({surface3DData.analysis.extrema.globalMax.x.toFixed(2)}, {surface3DData.analysis.extrema.globalMax.y.toFixed(2)}, {surface3DData.analysis.extrema.globalMax.z.toFixed(2)})</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Symbolic Algebra */}
            <TabsContent value="symbolic" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Expression Analysis</h3>
                    <div>
                      <Label htmlFor="symbolic_expression">Mathematical Expression</Label>
                      <Input 
                        id="symbolic_expression"
                        value={symbolicExpression}
                        onChange={(e) => setSymbolicExpression(e.target.value)}
                        placeholder="e.g., x^2 + 3*x + 2, sin(x)^2 + cos(x)^2"
                      />
                    </div>
                    
                    <Button onClick={processSymbolic} className="w-full">
                      <Cpu className="mr-2 h-4 w-4" />
                      Process Expression
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Equation Solver</h3>
                    <div>
                      <Label htmlFor="equation_to_solve">Equation to Solve</Label>
                      <Input 
                        id="equation_to_solve"
                        value={equationToSolve}
                        onChange={(e) => setEquationToSolve(e.target.value)}
                        placeholder="e.g., x^2 - 4 = 0, 2*x + 3 = 7"
                      />
                    </div>
                    
                    <Button onClick={solveEquation} className="w-full">
                      <Target className="mr-2 h-4 w-4" />
                      Solve Equation
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {symbolicResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Expression Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Original:</Label>
                          <div className="font-mono text-sm bg-muted p-2 rounded">{symbolicResult.original}</div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Simplified:</Label>
                          <div className="font-mono text-sm bg-muted p-2 rounded">{symbolicResult.simplified}</div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Expanded:</Label>
                          <div className="font-mono text-sm bg-muted p-2 rounded">{symbolicResult.expanded}</div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Factored:</Label>
                          <div className="font-mono text-sm bg-muted p-2 rounded">{symbolicResult.factored}</div>
                        </div>
                        
                        {symbolicResult.derivative && (
                          <div>
                            <Label className="text-sm font-medium">Derivative:</Label>
                            <div className="font-mono text-sm bg-muted p-2 rounded">{symbolicResult.derivative}</div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Type: {symbolicResult.analysis.type}</div>
                          <div>Degree: {symbolicResult.analysis.degree}</div>
                          <div>Variables: {symbolicResult.analysis.variables.join(', ')}</div>
                          <div>Domain: {symbolicResult.domain}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {equationSolution && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Equation Solutions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Variable: {equationSolution.variable}</Label>
                        </div>
                        
                        <div className="space-y-2">
                          {equationSolution.solutions.map((solution, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="font-mono">{solution.value}</span>
                              <Badge variant={solution.verified ? "default" : "secondary"}>
                                {solution.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Method: {equationSolution.method}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {symbolicResult && symbolicResult.transformations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Transformation Steps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {symbolicResult.transformations.map((transform, index) => (
                              <div key={index} className="text-xs p-2 bg-muted rounded">
                                <div className="font-semibold">{transform.operation}</div>
                                <div>{transform.explanation}</div>
                                <div className="font-mono">{transform.from} → {transform.to}</div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}