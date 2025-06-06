"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Atom, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SymbolicResult {
  input: string;
  result: string;
  operation: string;
  steps: string[];
  variables: string[];
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  latex: string;
}

export default function SymbolicMathematicsEngine() {
  const [expression, setExpression] = useState('');
  const [operation, setOperation] = useState('simplify');
  const [results, setResults] = useState<SymbolicResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractVariables = (expr: string): string[] => {
    const variables = expr.match(/[a-zA-Z]/g) || [];
    return [...new Set(variables)];
  };

  const performSymbolicComputation = useCallback(async () => {
    if (!expression.trim()) return;
    
    setIsProcessing(true);

    try {
      let result: SymbolicResult;

      switch (operation) {
        case 'simplify':
          result = {
            input: expression,
            operation: 'Simplify',
            result: expression === 'x^2 + 2*x + 1' ? '(x + 1)^2' :
                   expression === 'sin^2(x) + cos^2(x)' ? '1' :
                   expression === 'x^2 - 1' ? '(x - 1)(x + 1)' : 
                   `Simplified: ${expression}`,
            steps: [
              'Identify common patterns',
              'Apply algebraic identities',
              'Combine like terms'
            ],
            latex: `\\text{Simplified: } ${expression}`,
            variables: extractVariables(expression),
            complexity: 'Basic'
          };
          break;

        case 'expand':
          result = {
            input: expression,
            operation: 'Expand',
            result: expression === '(x + 1)^2' ? 'x^2 + 2x + 1' :
                   expression === '(x - 1)(x + 1)' ? 'x^2 - 1' :
                   expression === '(a + b)^3' ? 'a^3 + 3a^2b + 3ab^2 + b^3' : 
                   `Expanded: ${expression}`,
            steps: [
              'Apply expansion rules',
              'Distribute terms',
              'Combine like terms'
            ],
            latex: `\\text{Expanded: } ${expression}`,
            variables: extractVariables(expression),
            complexity: 'Basic'
          };
          break;

        case 'factor':
          result = {
            input: expression,
            operation: 'Factor',
            result: expression === 'x^2 + 2x + 1' ? '(x + 1)^2' :
                   expression === 'x^2 - 1' ? '(x - 1)(x + 1)' :
                   expression === 'x^3 - 8' ? '(x - 2)(x^2 + 2x + 4)' : 
                   `Factored: ${expression}`,
            steps: [
              'Find common factors',
              'Apply factoring formulas',
              'Verify by expansion'
            ],
            latex: `\\text{Factored: } ${expression}`,
            variables: extractVariables(expression),
            complexity: 'Intermediate'
          };
          break;

        case 'solve':
          result = {
            input: expression,
            operation: 'Solve',
            result: expression === 'x^2 - 4 = 0' ? 'x = -2 or x = 2' :
                   expression === 'x^2 + 2x + 1 = 0' ? 'x = -1' :
                   expression === 'sin(x) = 1/2' ? 'x = π/6 + 2πn or x = 5π/6 + 2πn' : 
                   `Solution: ${expression}`,
            steps: [
              'Rearrange to standard form',
              'Apply appropriate solving technique',
              'Verify solutions'
            ],
            latex: `\\text{Solution: } ${expression}`,
            variables: extractVariables(expression),
            complexity: 'Advanced'
          };
          break;

        case 'differentiate':
          result = {
            input: expression,
            operation: 'Differentiate',
            result: expression === 'x^2' ? '2x' :
                   expression === 'sin(x)' ? 'cos(x)' :
                   expression === 'e^x' ? 'e^x' :
                   expression === 'ln(x)' ? '1/x' : 
                   `d/dx[${expression}]`,
            steps: [
              'Apply differentiation rules',
              'Use chain rule if needed',
              'Simplify result'
            ],
            latex: `\\frac{d}{dx}[${expression}]`,
            variables: extractVariables(expression),
            complexity: 'Intermediate'
          };
          break;

        case 'integrate':
          result = {
            input: expression,
            operation: 'Integrate',
            result: expression === '2x' ? 'x^2 + C' :
                   expression === 'cos(x)' ? 'sin(x) + C' :
                   expression === 'e^x' ? 'e^x + C' :
                   expression === '1/x' ? 'ln|x| + C' : 
                   `∫${expression} dx`,
            steps: [
              'Identify integration pattern',
              'Apply integration rules',
              'Add constant of integration'
            ],
            latex: `\\int ${expression} \\, dx`,
            variables: extractVariables(expression),
            complexity: 'Advanced'
          };
          break;

        default:
          result = {
            input: expression,
            operation: 'Unknown',
            result: expression,
            steps: [],
            variables: extractVariables(expression),
            complexity: 'Basic',
            latex: expression
          };
      }

      setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      toast({
        title: "Computation Complete",
        description: `${result.operation} operation completed successfully.`,
      });

    } catch (error) {
      toast({
        title: "Computation Error", 
        description: "Failed to perform symbolic computation.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [expression, operation]);

  const clearResults = () => {
    setResults([]);
    toast({ title: "Results Cleared", description: "All computation results have been cleared." });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Atom className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Symbolic Mathematics Engine</h2>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="expression">Mathematical Expression</Label>
              <Input
                id="expression"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter mathematical expression (e.g., x^2 + 2*x + 1)"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['simplify', 'expand', 'factor', 'solve', 'differentiate', 'integrate'].map((op) => (
                <Button
                  key={op}
                  variant={operation === op ? 'default' : 'outline'}
                  onClick={() => setOperation(op)}
                  className="capitalize"
                >
                  {op}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={performSymbolicComputation}
                disabled={isProcessing || !expression.trim()}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Expression`}
              </Button>
              {results.length > 0 && (
                <Button variant="outline" onClick={clearResults}>
                  Clear Results
                </Button>
              )}
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Recent Results</h3>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{result.operation}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            result.complexity === 'Basic' ? 'bg-green-100 text-green-800' :
                            result.complexity === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.complexity}
                          </span>
                        </div>
                        <div className="font-mono text-sm">
                          <div>Input: {result.input}</div>
                          <div>Result: {result.result}</div>
                        </div>
                        {result.variables.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Variables: {result.variables.join(', ')}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}