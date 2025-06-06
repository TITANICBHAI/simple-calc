"use client";

import React, { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Target, RotateCw, Loader2, AlertCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseExpression, type ASTNode } from '@/lib/math-parser/symbolicParser';
import { limit } from '@/lib/math-parser/symbolicLimiter'; // Assuming symbolicLimiter exports 'limit'

const SymbolicLimiterTool: React.FC = () => {
  const [expression, setExpression] = useState<string>('sin(x)/x');
  const [variable, setVariable] = useState<string>('x');
  const [approachingValue, setApproachingValue] = useState<string>('0');
  
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError(null);
    setResult(null);
  };

  const handleCalculateLimit = () => {
    setError(null);
    setResult(null);
    setIsLoading(true);

    if (!expression.trim()) {
      setError("Expression cannot be empty.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "Expression cannot be empty.", variant: "destructive" });
      return;
    }
    if (!variable.trim()) {
      setError("Variable name cannot be empty.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "Variable name cannot be empty.", variant: "destructive" });
      return;
    }
     if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.trim())) {
      setError("Invalid variable name. Must start with a letter or underscore, followed by letters, numbers, or underscores.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "Invalid variable name format.", variant: "destructive" });
      return;
    }

    let astNode: ASTNode;
    try {
      astNode = parseExpression(expression);
    } catch (parseError: any) {
      setError(`Parsing Error: ${parseError.message || "Invalid expression format."}`);
      setIsLoading(false);
      toast({ title: "Parsing Error", description: parseError.message || "Invalid expression.", variant: "destructive" });
      return;
    }

    let numericApproaching: number | '∞' | '-∞';
    const approachingTrimmed = approachingValue.trim().toLowerCase();

    if (approachingTrimmed === 'infinity' || approachingTrimmed === 'inf' || approachingTrimmed === '+infinity' || approachingTrimmed === '+inf') {
      numericApproaching = '∞';
    } else if (approachingTrimmed === '-infinity' || approachingTrimmed === '-inf') {
      numericApproaching = '-∞';
    } else {
      const parsedNum = parseFloat(approachingValue);
      if (isNaN(parsedNum)) {
        setError("Approaching value must be a number, 'Infinity', or '-Infinity'.");
        setIsLoading(false);
        toast({ title: "Input Error", description: "Invalid approaching value.", variant: "destructive" });
        return;
      }
      numericApproaching = parsedNum;
    }

    try {
      // The limit function from symbolicLimiter.ts expects an ASTNode
      const limitResult = limit(astNode, variable.trim(), numericApproaching);
      setResult(limitResult);
      toast({ title: "Limit Calculated", description: `Result: ${limitResult}` });
    } catch (e: any) {
      const errorMessage = e.message || "An error occurred during limit calculation.";
      setError(errorMessage);
      toast({ title: "Limit Calculation Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExpression('sin(x)/x');
    setVariable('x');
    setApproachingValue('0');
    setResult(null);
    setError(null);
    setIsLoading(false);
    toast({ title: "Limit Calculator Reset", description: "Inputs reset to default." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Target className="mr-2 h-6 w-6 text-accent" />
          Limit Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-secondary/30 border-secondary">
          <Target className="h-4 w-4" />
          <AlertTitle>Instructions</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            <p>Enter a function (e.g., <code className="font-mono">sin(x)/x</code>, <code className="font-mono">(x^2-1)/(x-1)</code>).</p>
            <p>Specify the variable (default 'x').</p>
            <p>Specify the value the variable is approaching (e.g., <code className="font-mono">0</code>, <code className="font-mono">Infinity</code>, <code className="font-mono">-inf</code>).</p>
            <p>This tool numerically estimates limits by checking points near the target.</p>
            <p>Available functions for the expression: sin, cos, tan, ln, log, sqrt, abs, exp, pow. Constants: pi, e. (Case-insensitive)</p>
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="limit-expression">Function f(var)</Label>
          <Input
            id="limit-expression"
            value={expression}
            onChange={handleInputChange(setExpression)}
            placeholder="e.g., sin(x)/x"
            className="mt-1 font-mono"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="limit-variable">Variable</Label>
            <Input
              id="limit-variable"
              value={variable}
              onChange={handleInputChange(setVariable)}
              placeholder="x"
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="limit-approaching">Approaching Value</Label>
            <Input
              id="limit-approaching"
              value={approachingValue}
              onChange={handleInputChange(setApproachingValue)}
              placeholder="0, Infinity, -inf"
              className="mt-1 font-mono"
            />
          </div>
        </div>
        
        <Button onClick={handleCalculateLimit} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />}
          Calculate Limit
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result !== null && !error && (
          <div className="space-y-2 pt-3 border-t mt-4">
            <Label className="text-sm font-medium text-muted-foreground">Calculated Limit:</Label>
            <div className="p-3 bg-muted/30 rounded-md text-lg font-mono text-center text-accent">
              {result}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col items-center gap-4">
          <Button onClick={handleCalculateLimit} disabled={isLoading} className="w-full max-w-xs">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              "Calculate Limit"
            )}
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full max-w-xs">
            Reset
          </Button>
          <ins className="adsbygoogle"
               style={{ display: 'block', textAlign: 'center' }}
               data-ad-client="ca-pub-1074051846339488"
               data-ad-slot="8922282796"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default SymbolicLimiterTool;
