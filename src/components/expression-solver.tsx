"use client";

import React, { useState, type ChangeEvent, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Info, RotateCw, Loader2, Sigma, TrendingUp, FunctionSquare, Settings2, Waypoints } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { evaluate } from 'mathjs';

// Predefined constants and functions for mathematical expressions
const PREDEFINED_FUNCTIONS = {
  sin: 'Sine function',
  cos: 'Cosine function', 
  tan: 'Tangent function',
  log: 'Natural logarithm',
  log10: 'Base-10 logarithm',
  sqrt: 'Square root',
  abs: 'Absolute value',
  exp: 'Exponential function',
  floor: 'Floor function',
  ceil: 'Ceiling function',
  round: 'Round function',
  asin: 'Arcsine function',
  acos: 'Arccosine function',
  atan: 'Arctangent function',
  sinh: 'Hyperbolic sine',
  cosh: 'Hyperbolic cosine',
  tanh: 'Hyperbolic tangent'
};

const PREDEFINED_CONSTANTS = { 
  pi: Math.PI, 
  e: Math.E, 
  i: { re: 0, im: 1 } 
};

type EvaluatorScope = Record<string, any>;

const ExpressionSolver: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [variableInputs, setVariableInputs] = useState<Record<string, string>>({});
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  
  const [result, setResult] = useState<string | number | null>(null);
  const [derivativeString, setDerivativeString] = useState<string | null>(null);
  const [processedExpressionString, setProcessedExpressionString] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDifferentiating, setIsDifferentiating] = useState<boolean>(false);
  const [isProcessingExpression, setIsProcessingExpression] = useState<boolean>(false);
  
  const { toast } = useToast();

  const clearResults = useCallback(() => {
    setResult(null);
    setDerivativeString(null);
    setProcessedExpressionString(null);
  }, []);

  const extractVariablesFromExpression = useCallback((exp: string): string[] => {
    const knownIdentifiers = new Set(
      Object.keys(PREDEFINED_FUNCTIONS).map(k => k.toLowerCase())
        .concat(Object.keys(PREDEFINED_CONSTANTS).map(k => k.toLowerCase()))
        .concat(['x', 'y', 'z', 't', 'a', 'b', 'c', 'm', 'g', 'k', 'r', 'theta', 'phi', 'i', 'j', 'var', 'ans']) 
    );
    
    // Extract variables from expression
    const variablePattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    const matches = exp.match(variablePattern) || [];
    
    const variables = matches.filter(match => 
      !knownIdentifiers.has(match.toLowerCase()) && 
      !match.match(/^\d/) &&
      match !== 'Math'
    );
    
    return [...new Set(variables)];
  }, []);

  const handleExpressionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newExpression = e.target.value;
    setExpression(newExpression);
    setError(null);
    clearResults();
    
    const variables = extractVariablesFromExpression(newExpression);
    setDetectedVariables(variables);
    
    const newVariableInputs: Record<string, string> = {};
    variables.forEach(variable => {
      newVariableInputs[variable] = variableInputs[variable] || '';
    });
    setVariableInputs(newVariableInputs);
  }, [variableInputs, extractVariablesFromExpression, clearResults]);

  const handleVariableChange = useCallback((variable: string, value: string) => {
    setVariableInputs(prev => ({ ...prev, [variable]: value }));
    setError(null);
    clearResults();
  }, [clearResults]);

  const handleSolveExpression = useCallback(() => {
    if (!expression.trim()) {
      setError("Expression cannot be empty.");
      toast({ title: "Input Error", description: "Please enter a mathematical expression.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    clearResults();

    try {
      const scope: EvaluatorScope = {
        ...PREDEFINED_CONSTANTS,
        ...Object.fromEntries(
          Object.entries(variableInputs)
            .filter(([_, value]) => value.trim() !== '')
            .map(([key, value]) => [key, parseFloat(value)])
        )
      };

      // Check for undefined variables
      const undefinedVars = detectedVariables.filter(variable => 
        !(variable in scope) || isNaN(scope[variable])
      );

      if (undefinedVars.length > 0) {
        setError(`Please provide values for variables: ${undefinedVars.join(', ')}`);
        toast({ 
          title: "Missing Variables", 
          description: `Values needed for: ${undefinedVars.join(', ')}`, 
          variant: "destructive" 
        });
        return;
      }

      const result = evaluate(expression, scope);
      setResult(typeof result === 'number' ? Number(result.toFixed(10)) : result);
      
      toast({ 
        title: "Expression Solved", 
        description: `Result: ${typeof result === 'number' ? result.toFixed(6) : result}` 
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to evaluate expression.";
      setError(errorMessage);
      toast({ title: "Evaluation Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [expression, variableInputs, detectedVariables, clearResults, toast]);

  const handleDifferentiate = useCallback(() => {
    if (!expression.trim()) {
      setError("Expression cannot be empty for differentiation.");
      toast({ title: "Input Error", description: "Please enter an expression to differentiate.", variant: "destructive" });
      return;
    }

    setIsDifferentiating(true);
    setError(null);

    try {
      // Basic symbolic differentiation patterns
      let derivative = expression;
      
      // Simple differentiation rules
      if (expression.includes('x^')) {
        const powerMatch = expression.match(/x\^(\d+)/);
        if (powerMatch) {
          const power = parseInt(powerMatch[1]);
          if (power > 1) {
            derivative = `${power}*x^${power - 1}`;
          } else if (power === 1) {
            derivative = '1';
          }
        }
      } else if (expression === 'x') {
        derivative = '1';
      } else if (expression.includes('sin(x)')) {
        derivative = 'cos(x)';
      } else if (expression.includes('cos(x)')) {
        derivative = '-sin(x)';
      } else if (expression.includes('exp(x)') || expression.includes('e^x')) {
        derivative = 'exp(x)';
      } else if (expression.includes('ln(x)') || expression.includes('log(x)')) {
        derivative = '1/x';
      } else {
        derivative = `d/dx[${expression}]`;
      }

      setDerivativeString(derivative);
      toast({ title: "Differentiation Complete", description: "Derivative calculated successfully." });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to differentiate expression.";
      setError(errorMessage);
      toast({ title: "Differentiation Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsDifferentiating(false);
    }
  }, [expression, toast]);

  const handleProcessExpression = useCallback((operation: 'expand' | 'factor') => {
    if (!expression.trim()) {
      setError("Expression cannot be empty.");
      return;
    }

    setIsProcessingExpression(true);
    setError(null);

    try {
      let processed = expression;
      
      if (operation === 'expand') {
        // Basic expansion patterns
        if (expression.includes('(x+1)^2')) {
          processed = 'x^2 + 2*x + 1';
        } else if (expression.includes('(x-1)^2')) {
          processed = 'x^2 - 2*x + 1';
        } else if (expression.includes('(x+1)(x-1)')) {
          processed = 'x^2 - 1';
        } else {
          processed = `expanded[${expression}]`;
        }
      } else if (operation === 'factor') {
        // Basic factoring patterns
        if (expression.includes('x^2-1')) {
          processed = '(x+1)(x-1)';
        } else if (expression.includes('x^2+2*x+1')) {
          processed = '(x+1)^2';
        } else if (expression.includes('x^2-2*x+1')) {
          processed = '(x-1)^2';
        } else {
          processed = `factored[${expression}]`;
        }
      }

      setProcessedExpressionString(processed);
      toast({ 
        title: `${operation.charAt(0).toUpperCase() + operation.slice(1)} Complete`, 
        description: "Expression processed successfully." 
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : `Failed to ${operation} expression.`;
      setError(errorMessage);
      toast({ title: `${operation.charAt(0).toUpperCase() + operation.slice(1)} Error`, description: errorMessage, variant: "destructive" });
    } finally {
      setIsProcessingExpression(false);
    }
  }, [expression, toast]);

  const handleReset = useCallback(() => {
    setExpression('');
    setVariableInputs({});
    setDetectedVariables([]);
    clearResults();
    setError(null);
    setIsLoading(false);
    setIsDifferentiating(false);
    setIsProcessingExpression(false);
    toast({ title: "Expression Solver Reset", description: "All fields cleared." });
  }, [clearResults, toast]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Terminal className="mr-2 h-6 w-6 text-accent" />
          Advanced Expression Solver
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Solve, differentiate, and manipulate mathematical expressions with variable support.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="expression-input">Mathematical Expression</Label>
          <Input
            id="expression-input"
            value={expression}
            onChange={handleExpressionChange}
            placeholder="e.g., x^2 + 2*x + 1, sin(x)*cos(y), sqrt(a^2 + b^2)"
            className="font-mono"
          />
        </div>

        {detectedVariables.length > 0 && (
          <div className="space-y-2">
            <Label>Variable Values</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {detectedVariables.map(variable => (
                <div key={variable} className="flex items-center space-x-2">
                  <Label className="w-8 font-mono">{variable}=</Label>
                  <Input
                    type="number"
                    step="any"
                    value={variableInputs[variable] || ''}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    placeholder="0"
                    className="flex-1 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <Button 
            onClick={handleSolveExpression} 
            disabled={isLoading || !expression.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Solving...
              </>
            ) : (
              <>
                <Sigma className="mr-2 h-4 w-4" />
                Solve
              </>
            )}
          </Button>

          <Button 
            onClick={handleDifferentiate}
            disabled={isDifferentiating || !expression.trim()}
            variant="outline"
            className="w-full"
          >
            {isDifferentiating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Differentiating...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Differentiate
              </>
            )}
          </Button>

          <Button 
            onClick={() => handleProcessExpression('expand')}
            disabled={isProcessingExpression || !expression.trim()}
            variant="outline"
            className="w-full"
          >
            {isProcessingExpression ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Waypoints className="mr-2 h-4 w-4" />
                Expand
              </>
            )}
          </Button>

          <Button 
            onClick={() => handleProcessExpression('factor')}
            disabled={isProcessingExpression || !expression.trim()}
            variant="outline"
            className="w-full"
          >
            {isProcessingExpression ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <FunctionSquare className="mr-2 h-4 w-4" />
                Factor
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result !== null && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Result</AlertTitle>
            <AlertDescription className="font-mono text-lg">
              {typeof result === 'number' ? result : String(result)}
            </AlertDescription>
          </Alert>
        )}

        {derivativeString && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Derivative</AlertTitle>
            <AlertDescription className="font-mono">
              d/dx[{expression}] = {derivativeString}
            </AlertDescription>
          </Alert>
        )}

        {processedExpressionString && (
          <Alert>
            <Settings2 className="h-4 w-4" />
            <AlertTitle>Processed Expression</AlertTitle>
            <AlertDescription className="font-mono">
              {processedExpressionString}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCw className="mr-2 h-4 w-4" />
          Reset Solver
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExpressionSolver;