"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Plus, Minus, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { KatexDisplay } from '@/components/ui/katex-display';
import { parseExpression } from '@/lib/math-parser/symbolicParser';
import { evaluateAST } from '@/lib/math-parser/symbolicEvaluator';

interface EquationSolverProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

interface LinearEquation {
  id: string;
  coefficients: Record<string, number>;
  constant: number;
  expression: string;
}

interface QuadraticSolution {
  discriminant: number;
  solutions: number[];
  type: 'real' | 'complex' | 'repeated';
}

interface SystemSolution {
  variables: Record<string, number>;
  solutionType: 'unique' | 'infinite' | 'none';
  steps: string[];
}

// Matrix operations for linear systems
class Matrix {
  constructor(public data: number[][]) {}

  static fromSystem(equations: LinearEquation[], variables: string[]): Matrix {
    const rows = equations.length;
    const cols = variables.length + 1; // +1 for constants
    const data: number[][] = [];

    equations.forEach((eq, i) => {
      const row: number[] = [];
      variables.forEach(variable => {
        row.push(eq.coefficients[variable] || 0);
      });
      row.push(eq.constant);
      data.push(row);
    });

    return new Matrix(data);
  }

  gaussianElimination(): { solution: number[] | null; steps: string[]; type: 'unique' | 'infinite' | 'none' } {
    const steps: string[] = [];
    const matrix = this.data.map(row => [...row]);
    const rows = matrix.length;
    const cols = matrix[0].length;

    steps.push("Starting Gaussian elimination...");

    // Forward elimination
    for (let i = 0; i < rows; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < rows; k++) {
        if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows if needed
      if (maxRow !== i) {
        [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
        steps.push(`Swapped row ${i + 1} with row ${maxRow + 1}`);
      }

      // Check for zero pivot
      if (Math.abs(matrix[i][i]) < 1e-10) {
        continue;
      }

      // Eliminate column
      for (let k = i + 1; k < rows; k++) {
        if (Math.abs(matrix[k][i]) > 1e-10) {
          const factor = matrix[k][i] / matrix[i][i];
          steps.push(`R${k + 1} = R${k + 1} - ${factor.toFixed(3)} × R${i + 1}`);
          
          for (let j = i; j < cols; j++) {
            matrix[k][j] -= factor * matrix[i][j];
          }
        }
      }
    }

    // Check for inconsistency
    for (let i = 0; i < rows; i++) {
      let allZero = true;
      for (let j = 0; j < cols - 1; j++) {
        if (Math.abs(matrix[i][j]) > 1e-10) {
          allZero = false;
          break;
        }
      }
      if (allZero && Math.abs(matrix[i][cols - 1]) > 1e-10) {
        steps.push("System is inconsistent - no solution exists");
        return { solution: null, steps, type: 'none' };
      }
    }

    // Back substitution
    const solution: number[] = new Array(cols - 1).fill(0);
    
    for (let i = rows - 1; i >= 0; i--) {
      if (Math.abs(matrix[i][i]) < 1e-10) continue;
      
      let sum = matrix[i][cols - 1];
      for (let j = i + 1; j < cols - 1; j++) {
        sum -= matrix[i][j] * solution[j];
      }
      solution[i] = sum / matrix[i][i];
      steps.push(`x${i + 1} = ${solution[i].toFixed(4)}`);
    }

    return { solution, steps, type: 'unique' };
  }
}

// Quadratic equation solver
const solveQuadratic = (a: number, b: number, c: number): QuadraticSolution => {
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant > 0) {
    const sqrt_d = Math.sqrt(discriminant);
    return {
      discriminant,
      solutions: [(-b + sqrt_d) / (2 * a), (-b - sqrt_d) / (2 * a)],
      type: 'real'
    };
  } else if (discriminant === 0) {
    return {
      discriminant,
      solutions: [-b / (2 * a)],
      type: 'repeated'
    };
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    return {
      discriminant,
      solutions: [realPart, imagPart], // Real and imaginary parts
      type: 'complex'
    };
  }
};

// Parse linear equation from string
const parseLinearEquation = (expression: string, id: string): LinearEquation => {
  const sides = expression.split('=');
  if (sides.length !== 2) {
    throw new Error('Equation must contain exactly one equals sign');
  }

  const leftSide = sides[0].trim();
  const rightSide = sides[1].trim();
  
  // For simplicity, we'll handle basic linear equations
  // This is a simplified parser - in practice, you'd want more robust parsing
  const coefficients: Record<string, number> = {};
  let constant = 0;

  try {
    // Parse right side as constant
    constant = parseFloat(rightSide);
    if (isNaN(constant)) constant = 0;

    // Simple parsing for left side (x, y, z coefficients)
    const variables = ['x', 'y', 'z', 'a', 'b', 'c'];
    variables.forEach(variable => {
      const regex = new RegExp(`([+-]?\\d*\\.?\\d*)${variable}`, 'g');
      const matches = leftSide.match(regex);
      
      if (matches) {
        let coeff = 0;
        matches.forEach(match => {
          let coeffStr = match.replace(variable, '');
          if (coeffStr === '' || coeffStr === '+') coeffStr = '1';
          if (coeffStr === '-') coeffStr = '-1';
          coeff += parseFloat(coeffStr) || 0;
        });
        coefficients[variable] = coeff;
      }
    });

  } catch (error) {
    throw new Error(`Failed to parse equation: ${expression}`);
  }

  return { id, coefficients, constant, expression };
};

export const EquationSolverEngine: React.FC<EquationSolverProps> = ({ onResult, onError }) => {
  // Linear system state
  const [equations, setEquations] = useState<LinearEquation[]>([
    { id: '1', coefficients: { x: 2, y: 1 }, constant: 5, expression: '2x + y = 5' },
    { id: '2', coefficients: { x: 1, y: -1 }, constant: 1, expression: 'x - y = 1' }
  ]);
  
  // Quadratic equation state
  const [quadraticA, setQuadraticA] = useState('1');
  const [quadraticB, setQuadraticB] = useState('-5');
  const [quadraticC, setQuadraticC] = useState('6');
  
  // UI state
  const [solverType, setSolverType] = useState<'linear' | 'quadratic' | 'polynomial'>('linear');
  const [solution, setSolution] = useState<SystemSolution | QuadraticSolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get variables used in the system
  const variables = useMemo(() => {
    const vars = new Set<string>();
    equations.forEach(eq => {
      Object.keys(eq.coefficients).forEach(variable => {
        if (eq.coefficients[variable] !== 0) {
          vars.add(variable);
        }
      });
    });
    return Array.from(vars).sort();
  }, [equations]);

  const addEquation = () => {
    const newId = (equations.length + 1).toString();
    setEquations([...equations, {
      id: newId,
      coefficients: {},
      constant: 0,
      expression: ''
    }]);
  };

  const removeEquation = (id: string) => {
    setEquations(equations.filter(eq => eq.id !== id));
  };

  const updateEquation = (id: string, expression: string) => {
    try {
      const parsedEq = parseLinearEquation(expression, id);
      setEquations(equations.map(eq => 
        eq.id === id ? parsedEq : eq
      ));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid equation format');
    }
  };

  const solveLinearSystem = () => {
    try {
      if (equations.length === 0 || variables.length === 0) {
        setError('Please add some equations first');
        return;
      }

      const matrix = Matrix.fromSystem(equations, variables);
      const result = matrix.gaussianElimination();
      
      if (result.solution) {
        const variableValues: Record<string, number> = {};
        variables.forEach((variable, index) => {
          variableValues[variable] = result.solution![index];
        });
        
        const systemSolution: SystemSolution = {
          variables: variableValues,
          solutionType: result.type,
          steps: result.steps
        };
        
        setSolution(systemSolution);
        setError(null);
        
        const resultText = Object.entries(variableValues)
          .map(([var_, val]) => `${var_} = ${val.toFixed(4)}`)
          .join(', ');
        onResult?.(`Linear system solved: ${resultText}`);
      } else {
        setSolution({ variables: {}, solutionType: result.type, steps: result.steps });
        setError('No unique solution exists');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to solve system';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const solveQuadraticEquation = () => {
    try {
      const a = parseFloat(quadraticA);
      const b = parseFloat(quadraticB);
      const c = parseFloat(quadraticC);
      
      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        setError('Please enter valid coefficients');
        return;
      }
      
      if (a === 0) {
        setError('Coefficient "a" cannot be zero for a quadratic equation');
        return;
      }
      
      const quadSolution = solveQuadratic(a, b, c);
      setSolution(quadSolution);
      setError(null);
      
      let resultText = '';
      if (quadSolution.type === 'real') {
        resultText = `Two real solutions: x₁ = ${quadSolution.solutions[0].toFixed(4)}, x₂ = ${quadSolution.solutions[1].toFixed(4)}`;
      } else if (quadSolution.type === 'repeated') {
        resultText = `One repeated solution: x = ${quadSolution.solutions[0].toFixed(4)}`;
      } else {
        resultText = `Complex solutions: x = ${quadSolution.solutions[0].toFixed(4)} ± ${quadSolution.solutions[1].toFixed(4)}i`;
      }
      
      onResult?.(resultText);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to solve quadratic equation';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const resetSolver = () => {
    if (solverType === 'linear') {
      setEquations([
        { id: '1', coefficients: { x: 2, y: 1 }, constant: 5, expression: '2x + y = 5' },
        { id: '2', coefficients: { x: 1, y: -1 }, constant: 1, expression: 'x - y = 1' }
      ]);
    } else {
      setQuadraticA('1');
      setQuadraticB('-5');
      setQuadraticC('6');
    }
    setSolution(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Advanced Equation Solver Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={solverType} onValueChange={(value) => setSolverType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="linear">Linear Systems</TabsTrigger>
              <TabsTrigger value="quadratic">Quadratic Equations</TabsTrigger>
              <TabsTrigger value="polynomial">Polynomial Equations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="linear" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">System of Linear Equations</Label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addEquation} className="flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      Add Equation
                    </Button>
                  </div>
                </div>
                
                {equations.map((eq, index) => (
                  <div key={eq.id} className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <Input
                      placeholder="e.g., 2x + 3y = 7"
                      value={eq.expression}
                      onChange={(e) => updateEquation(eq.id, e.target.value)}
                      className="flex-1"
                    />
                    {equations.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeEquation(eq.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {variables.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Variables detected</AlertTitle>
                    <AlertDescription>
                      Variables in your system: {variables.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={solveLinearSystem} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Solve System
                </Button>
                <Button variant="outline" onClick={resetSolver}>
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="quadratic" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold">Quadratic Equation: ax² + bx + c = 0</Label>
                  <div className="mt-2">
                    <KatexDisplay 
                      math={`${quadraticA}x^2 + ${quadraticB}x + ${quadraticC} = 0`}
                      displayMode={false}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="coeff-a">Coefficient a</Label>
                    <Input
                      id="coeff-a"
                      value={quadraticA}
                      onChange={(e) => setQuadraticA(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coeff-b">Coefficient b</Label>
                    <Input
                      id="coeff-b"
                      value={quadraticB}
                      onChange={(e) => setQuadraticB(e.target.value)}
                      placeholder="-5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coeff-c">Coefficient c</Label>
                    <Input
                      id="coeff-c"
                      value={quadraticC}
                      onChange={(e) => setQuadraticC(e.target.value)}
                      placeholder="6"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={solveQuadraticEquation} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Solve Quadratic
                </Button>
                <Button variant="outline" onClick={resetSolver}>
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="polynomial" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Polynomial equation solver with Newton-Raphson and other numerical methods is in development.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {solution && (
        <Card>
          <CardHeader>
            <CardTitle>Solution</CardTitle>
          </CardHeader>
          <CardContent>
            {'variables' in solution ? (
              // Linear system solution
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Solution Type: </Label>
                  <Badge variant={solution.solutionType === 'unique' ? 'default' : 'secondary'}>
                    {solution.solutionType}
                  </Badge>
                </div>
                
                {Object.keys(solution.variables).length > 0 && (
                  <div>
                    <Label className="font-semibold">Variables:</Label>
                    <div className="mt-2 space-y-1">
                      {Object.entries(solution.variables).map(([variable, value]) => (
                        <div key={variable} className="flex items-center gap-2">
                          <KatexDisplay math={`${variable} = ${value.toFixed(6)}`} displayMode={false} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <Label className="font-semibold">Solution Steps:</Label>
                  <div className="mt-2 space-y-1 text-sm font-mono">
                    {solution.steps.map((step, index) => (
                      <div key={index} className="text-muted-foreground">
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Quadratic solution
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Discriminant: </Label>
                  <KatexDisplay math={`\\Delta = ${solution.discriminant.toFixed(4)}`} displayMode={false} />
                </div>
                
                <div>
                  <Label className="font-semibold">Solution Type: </Label>
                  <Badge variant={solution.type === 'real' ? 'default' : 'secondary'}>
                    {solution.type === 'real' ? 'Two Real Solutions' : 
                     solution.type === 'repeated' ? 'One Repeated Solution' : 
                     'Complex Solutions'}
                  </Badge>
                </div>
                
                <div>
                  <Label className="font-semibold">Solutions:</Label>
                  <div className="mt-2">
                    {solution.type === 'complex' ? (
                      <KatexDisplay 
                        math={`x = ${solution.solutions[0].toFixed(4)} \\pm ${solution.solutions[1].toFixed(4)}i`}
                        displayMode={false}
                      />
                    ) : solution.type === 'repeated' ? (
                      <KatexDisplay 
                        math={`x = ${solution.solutions[0].toFixed(4)}`}
                        displayMode={false}
                      />
                    ) : (
                      <div className="space-y-1">
                        <KatexDisplay 
                          math={`x_1 = ${solution.solutions[0].toFixed(4)}`}
                          displayMode={false}
                        />
                        <KatexDisplay 
                          math={`x_2 = ${solution.solutions[1].toFixed(4)}`}
                          displayMode={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};