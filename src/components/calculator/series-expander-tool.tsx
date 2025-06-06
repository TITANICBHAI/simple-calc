"use client";

import React, { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, RotateCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMultivariableTaylorSeries } from '../../lib/math-parser/multivariableSeries';
import { KatexDisplay } from '@/components/ui/katex-display'; // Corrected import path
import { simplify } from 'mathjs';


const SeriesExpanderTool: React.FC = () => {
  const [expression, setExpression] = useState<string>('sin(x*y)');
  const [variablesInput, setVariablesInput] = useState<string>('x, y');
  const [pointInput, setPointInput] = useState<string>('0, 0');
  const [orderInput, setOrderInput] = useState<string>('2');
  
  const [resultStringForDisplay, setResultStringForDisplay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCalculate = () => {
    setError(null);
    setResultStringForDisplay(null);
    setIsLoading(true);

    if (!expression.trim()) {
      setError("Expression cannot be empty.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "Expression cannot be empty.", variant: "destructive" });
      return;
    }

    const parsedVars = variablesInput.split(',').map(v => v.trim()).filter(Boolean);
    const parsedPointValuesStr = pointInput.split(',').map(p => p.trim()).filter(Boolean);
    const parsedOrder = parseInt(orderInput, 10);

    if (parsedVars.length === 0) {
      setError("Please define at least one variable (e.g., 'x').");
      setIsLoading(false);
      toast({ title: "Input Error", description: "At least one variable is required.", variant: "destructive" });
      return;
    }
    if (parsedVars.length !== parsedPointValuesStr.length) {
      setError("The number of variables must match the number of point values.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "Variable count must match point value count.", variant: "destructive" });
      return;
    }
    if (isNaN(parsedOrder) || parsedOrder < 0 || parsedOrder > 7) { 
      setError("Order must be an integer between 0 and 7.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "Order must be an integer between 0 and 7.", variant: "destructive" });
      return;
    }

    const atPoint: Record<string, number> = {};
    let pointValuesValid = true;
    for (let i = 0; i < parsedVars.length; i++) {
      const val = parseFloat(parsedPointValuesStr[i]);
      if (isNaN(val)) {
        pointValuesValid = false;
        break;
      }
      atPoint[parsedVars[i]] = val;
    }

    if (!pointValuesValid) {
      setError("All point values must be valid numbers.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "All point values must be numeric.", variant: "destructive" });
      return;
    }

    try {
      const seriesTermsOrError = generateMultivariableTaylorSeries(expression, parsedVars, atPoint, parsedOrder);
      
      if (typeof seriesTermsOrError === 'string') {
        setError(seriesTermsOrError);
        setResultStringForDisplay(null);
        toast({ title: "Calculation Error", description: seriesTermsOrError, variant: "destructive" });
      } else {
        if (seriesTermsOrError.length === 0) {
            const zeroTermLatex = "0";
            setResultStringForDisplay(zeroTermLatex);
            toast({ title: "Calculation Complete", description: "The series resulted in zero or no terms." });
        } else {
            const combinedTerms = seriesTermsOrError.map(t => `(${t.termString})`).join(' + ');
            try {
                // Simplify the string representation using mathjs
                const simplifiedSeries = simplify(combinedTerms).toString({ parenthesis: 'auto', implicit: 'hide' });
                setResultStringForDisplay(simplifiedSeries);
                toast({ title: "Taylor Series Calculated", description: "Expansion complete." });
            } catch (simplifyError) {
                console.error("Error simplifying series:", simplifyError);
                const unsimplifiedSeries = seriesTermsOrError.map(t => t.termString).join(' + ');
                setResultStringForDisplay(unsimplifiedSeries); // Display unsimplified if error
                toast({ title: "Taylor Series Calculated", description: "Expansion complete, but final simplification failed. Displaying unsimplified series.", variant: "default" });
            }
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during series expansion.";
      setError(errorMessage);
      setResultStringForDisplay(null);
      toast({ title: "Expansion Error", description: errorMessage, variant: "destructive" });
      console.error("Series expansion error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExpression('sin(x*y)');
    setVariablesInput('x, y');
    setPointInput('0, 0');
    setOrderInput('2');
    setResultStringForDisplay(null);
    setError(null);
    setIsLoading(false);
    toast({ title: "Series Tool Reset", description: "Inputs reset to default." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Settings className="mr-2 h-6 w-6 text-accent" />
          Multivariable Taylor Series (P)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Expands a function around a point using Taylor series. Uses <code className="font-mono text-xs">mathjs</code> for parsing and differentiation.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-secondary/30 border-secondary">
          <Settings className="h-4 w-4" />
          <AlertTitle>Instructions</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            <p>Enter a function (e.g., <code className="font-mono">sin(x*y)</code>, <code className="font-mono">exp(x+y^2)</code>).</p>
            <p>Define variable(s) comma-separated (e.g., <code className="font-mono">x, y</code>).</p>
            <p>Define point values comma-separated, matching variables (e.g., <code className="font-mono">0, 0</code> for x=0, y=0).</p>
            <p>Set the order of expansion (0-7 recommended for performance).</p>
            <p>Uses standard <code className="font-mono">mathjs</code> functions and syntax. Result is rendered with KaTeX.</p>
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="series-expression">Function f(vars)</Label>
          <Input
            id="series-expression"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g., sin(x*y) + x"
            className="mt-1 font-mono"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="series-variables">Variable(s) (e.g., x, y)</Label>
            <Input
              id="series-variables"
              value={variablesInput}
              onChange={(e) => setVariablesInput(e.target.value)}
              placeholder="x, y"
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="series-point">Point Values (e.g., 0, 0)</Label>
            <Input
              id="series-point"
              value={pointInput}
              onChange={(e) => setPointInput(e.target.value)}
              placeholder="0, 0"
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="series-order">Order (0-7)</Label>
            <Input
              id="series-order"
              type="number"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              placeholder="2"
              min="0"
              max="10" 
              className="mt-1 font-mono"
            />
          </div>
        </div>
        
        <Button onClick={handleCalculate} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Calculate Expansion
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <Settings className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resultStringForDisplay && !error && (
          <div className="space-y-2 pt-3 border-t mt-4">
            <Label className="text-sm font-medium text-muted-foreground">Taylor Series Expansion:</Label>
            <div className="p-3 bg-muted/30 rounded-md text-sm overflow-x-auto">
                <KatexDisplay latexString={resultStringForDisplay} className="text-base"/>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};

export default SeriesExpanderTool;
