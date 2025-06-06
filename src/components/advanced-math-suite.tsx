"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, FunctionSquare, TrendingUp, Zap, Target, 
  Brain, BookOpen, ChevronRight, Play, Settings,
  Eye, Grid3X3, BarChart3, PieChart, Lightbulb,
  CheckCircle, XCircle, AlertTriangle, Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import our powerful new engines
import { SymbolicMathEngine, type SymbolicSolution, type EquationSolution } from '@/lib/symbolic-math-engine';
import { AdvancedEquationSolver, type SolverResult } from '@/lib/advanced-equation-solver';
import { AdvancedGraphingEngine, type GraphData, type MultiGraphData } from '@/lib/advanced-graphing-engine';

interface StepVisualizationProps {
  steps: Array<{
    stepNumber: number;
    operation: string;
    description?: string;
    before?: string;
    after?: string;
    expression?: string;
    explanation?: string;
    reasoning?: string;
    rule: string;
    confidence?: number;
  }>;
}

const StepVisualization: React.FC<StepVisualizationProps> = ({ steps }) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                Step {step.stepNumber}
              </Badge>
              {step.confidence && (
                <Badge variant={step.confidence > 0.8 ? "default" : "secondary"}>
                  {Math.round(step.confidence * 100)}% confident
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm text-blue-700">
                {step.operation.replace(/_/g, ' ').toUpperCase()}: {step.rule}
              </div>
              
              {step.description && (
                <p className="text-sm text-gray-600">{step.description}</p>
              )}
              
              {step.explanation && (
                <p className="text-sm text-gray-600">{step.explanation}</p>
              )}
              
              {step.reasoning && (
                <p className="text-sm text-gray-600">{step.reasoning}</p>
              )}
              
              {step.before && step.after && (
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                  <div className="text-gray-500">Before: <span className="text-black">{step.before}</span></div>
                  <div className="flex items-center my-1">
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-gray-500">After: <span className="text-black font-semibold">{step.after}</span></div>
                </div>
              )}
              
              {step.expression && (
                <div className="bg-blue-50 p-2 rounded font-mono text-sm">
                  {step.expression}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function AdvancedMathSuite() {
  const [activeTab, setActiveTab] = useState('symbolic');
  const [expression, setExpression] = useState('');
  const [equation, setEquation] = useState('');
  const [graphFunction, setGraphFunction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Results state
  const [symbolicResult, setSymbolicResult] = useState<SymbolicSolution | null>(null);
  const [equationResult, setEquationResult] = useState<{ primary: SolverResult; alternatives: SolverResult[] } | null>(null);
  const [graphResult, setGraphResult] = useState<GraphData | MultiGraphData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Symbolic Math Operations
  const handleSymbolicOperation = useCallback(async (operation: 'differentiate' | 'integrate' | 'factor' | 'simplify') => {
    if (!expression.trim()) {
      toast({ title: "Input Required", description: "Please enter a mathematical expression" });
      return;
    }

    setIsLoading(true);
    try {
      let result: SymbolicSolution;
      
      switch (operation) {
        case 'differentiate':
          result = await SymbolicMathEngine.differentiate(expression);
          break;
        case 'integrate':
          result = await SymbolicMathEngine.integrate(expression);
          break;
        case 'factor':
          result = await SymbolicMathEngine.factorExpression(expression);
          break;
        case 'simplify':
          result = await SymbolicMathEngine.simplifyExpression(expression);
          break;
      }
      
      setSymbolicResult(result);
      toast({ 
        title: "Calculation Complete!", 
        description: `${operation} completed with ${result.steps.length} steps` 
      });
    } catch (error) {
      toast({ 
        title: "Calculation Error", 
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [expression]);

  // Equation Solving
  const handleSolveEquation = useCallback(async (useSpecificMethod: boolean = false) => {
    if (!equation.trim()) {
      toast({ title: "Input Required", description: "Please enter an equation to solve" });
      return;
    }

    setIsLoading(true);
    try {
      if (useSpecificMethod && selectedMethod) {
        const result = await AdvancedEquationSolver.solveWithMethod(equation, selectedMethod);
        setEquationResult({ primary: result, alternatives: [] });
      } else {
        const result = await AdvancedEquationSolver.solveWithMultipleMethods(equation);
        setEquationResult({ primary: result.primarySolution, alternatives: result.alternativeSolutions });
      }
      
      toast({ 
        title: "Equation Solved!", 
        description: "Multiple solution methods applied successfully" 
      });
    } catch (error) {
      toast({ 
        title: "Solving Error", 
        description: error instanceof Error ? error.message : "Unable to solve equation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [equation, selectedMethod]);

  // Graphing Functions
  const handleGraphFunction = useCallback(async (graphType: 'single' | 'derivative' | 'integral') => {
    if (!graphFunction.trim()) {
      toast({ title: "Input Required", description: "Please enter a function to graph" });
      return;
    }

    setIsLoading(true);
    try {
      let result: any;
      
      switch (graphType) {
        case 'single':
          result = await AdvancedGraphingEngine.graphFunction(graphFunction, {
            showGrid: true,
            showAxes: true,
            resolution: 1000,
            interactiveMode: true
          });
          break;
        case 'derivative':
          result = await AdvancedGraphingEngine.visualizeDerivative(graphFunction, 0);
          break;
        case 'integral':
          result = await AdvancedGraphingEngine.visualizeIntegral(graphFunction, [-5, 5]);
          break;
      }
      
      setGraphResult(result);
      toast({ 
        title: "Graph Generated!", 
        description: `${graphType} visualization created successfully` 
      });
    } catch (error) {
      toast({ 
        title: "Graphing Error", 
        description: error instanceof Error ? error.message : "Unable to generate graph",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [graphFunction]);

  const availableMethods = [
    'Linear Solver',
    'Quadratic Formula', 
    'Factoring Method',
    'Completing the Square',
    'Substitution Method',
    'Numerical Methods'
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Advanced Mathematical Suite
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Powerful symbolic mathematics with step-by-step solutions, multiple equation solving methods, and advanced graphing capabilities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="symbolic" className="flex items-center gap-2">
            <FunctionSquare className="h-4 w-4" />
            Symbolic Math
          </TabsTrigger>
          <TabsTrigger value="equations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Equation Solver
          </TabsTrigger>
          <TabsTrigger value="graphing" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Advanced Graphing
          </TabsTrigger>
        </TabsList>

        {/* Symbolic Mathematics Tab */}
        <TabsContent value="symbolic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Symbolic Mathematics Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbolic-input">Mathematical Expression</Label>
                <Input
                  id="symbolic-input"
                  placeholder="Enter expression (e.g., x^2 + 3*x + 2, sin(x)*cos(x), ln(x^2))"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  className="font-mono"
                />
                <div className="text-xs text-gray-500">
                  Supports: polynomials, trigonometric functions, logarithms, exponentials
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleSymbolicOperation('differentiate')}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Differentiate
                </Button>
                <Button 
                  onClick={() => handleSymbolicOperation('integrate')}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Integrate
                </Button>
                <Button 
                  onClick={() => handleSymbolicOperation('factor')}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Factor
                </Button>
                <Button 
                  onClick={() => handleSymbolicOperation('simplify')}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Simplify
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Symbolic Results */}
          {symbolicResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Solution Summary</span>
                    <Badge variant={symbolicResult.difficulty === 'elementary' ? 'default' : 
                                   symbolicResult.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                      {symbolicResult.difficulty}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Original Problem:</div>
                    <div className="font-mono bg-gray-50 p-2 rounded">{symbolicResult.originalProblem}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Final Answer:</div>
                    <div className="font-mono bg-green-50 p-3 rounded text-lg font-semibold">
                      {symbolicResult.finalAnswer}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Method Used:</div>
                    <Badge variant="outline">{symbolicResult.method}</Badge>
                  </div>

                  {symbolicResult.concepts.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Concepts Applied:</div>
                      <div className="flex flex-wrap gap-1">
                        {symbolicResult.concepts.map((concept, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {symbolicResult.verification && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Verification:</div>
                      <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        {symbolicResult.verification}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Step-by-Step Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <StepVisualization steps={symbolicResult.steps} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Equation Solver Tab */}
        <TabsContent value="equations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                Advanced Equation Solver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equation-input">Equation to Solve</Label>
                <Input
                  id="equation-input"
                  placeholder="Enter equation (e.g., x^2 + 5*x + 6 = 0, 2*x + 3 = 7, sin(x) = 0.5)"
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="method-select">Solution Method (Optional)</Label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-select best method" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSolveEquation(false)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Solve with All Methods
                </Button>
                {selectedMethod && (
                  <Button 
                    onClick={() => handleSolveEquation(true)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Use {selectedMethod}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Equation Results */}
          {equationResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Primary Solution - {equationResult.primary.method}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="font-medium">Solutions Found:</div>
                      {equationResult.primary.solutions.map((solution, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded">
                          <div className="font-mono text-lg">x = {solution.value}</div>
                          <div className="text-sm text-gray-600">Type: {solution.type}</div>
                          {solution.multiplicity && (
                            <div className="text-sm text-gray-600">Multiplicity: {solution.multiplicity}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium">Properties:</div>
                      <div className="space-y-1 text-sm">
                        <div>Domain: {equationResult.primary.domain}</div>
                        <div>Range: {equationResult.primary.range}</div>
                      </div>
                      
                      {equationResult.primary.verification && (
                        <div className="bg-green-50 p-2 rounded text-sm">
                          <CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />
                          {equationResult.primary.verification}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solution Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <StepVisualization steps={equationResult.primary.steps} />
                  </ScrollArea>
                </CardContent>
              </Card>

              {equationResult.alternatives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Alternative Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {equationResult.alternatives.map((alt, index) => (
                        <div key={index} className="border rounded p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{alt.method}</Badge>
                            <div className="text-sm text-gray-600">
                              {alt.solutions.length} solution(s)
                            </div>
                          </div>
                          <div className="text-sm font-mono">
                            {alt.solutions.map(s => s.value).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Advanced Graphing Tab */}
        <TabsContent value="graphing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-500" />
                Advanced Function Graphing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="graph-input">Function to Graph</Label>
                <Input
                  id="graph-input"
                  placeholder="Enter function (e.g., x^2, sin(x), ln(x), x^3-2*x^2+1)"
                  value={graphFunction}
                  onChange={(e) => setGraphFunction(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleGraphFunction('single')}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Graph Function
                </Button>
                <Button 
                  onClick={() => handleGraphFunction('derivative')}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Show Derivative
                </Button>
                <Button 
                  onClick={() => handleGraphFunction('integral')}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Show Integral
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Graph Results */}
          {graphResult && (
            <Card>
              <CardHeader>
                <CardTitle>Graph Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                        <div>Interactive Graph</div>
                        <div className="text-sm">Would render here with Chart.js/D3</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(graphResult as GraphData).metadata && (
                      <>
                        <div>
                          <div className="font-medium mb-2">Function Properties</div>
                          <div className="space-y-1 text-sm">
                            <div>Type: {(graphResult as GraphData).metadata.functionType}</div>
                            <div>Complexity: {(graphResult as GraphData).metadata.complexity}</div>
                            <div>Data Points: {(graphResult as GraphData).metadata.dataPoints}</div>
                            <div>Render Time: {(graphResult as GraphData).metadata.renderTime}ms</div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <div className="font-medium mb-2">Domain & Range</div>
                          <div className="space-y-1 text-sm">
                            <div>Domain: [{(graphResult as GraphData).domain.min}, {(graphResult as GraphData).domain.max}]</div>
                            <div>Range: [{(graphResult as GraphData).range.min}, {(graphResult as GraphData).range.max}]</div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <div className="font-medium mb-2">Mathematical Properties</div>
                          <div className="space-y-1 text-sm">
                            <div>Continuous: {(graphResult as GraphData).properties.continuous ? 'Yes' : 'No'}</div>
                            <div>Differentiable: {(graphResult as GraphData).properties.differentiable ? 'Yes' : 'No'}</div>
                            <div>Monotonic: {(graphResult as GraphData).properties.monotonic}</div>
                            <div>Symmetry: {(graphResult as GraphData).properties.symmetry}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="text-blue-700 font-medium">Processing mathematical operation...</div>
              <div className="text-sm text-blue-600 mt-1">This may take a few moments for complex expressions</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}