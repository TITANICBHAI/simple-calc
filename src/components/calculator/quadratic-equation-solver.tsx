
"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FunctionSquare, RefreshCw, AlertCircleIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuadraticEquationSolver: React.FC = () => {
  const [coeffA, setCoeffA] = useState<string>('');
  const [coeffB, setCoeffB] = useState<string>('');
  const [coeffC, setCoeffC] = useState<string>('');

  const [discriminant, setDiscriminant] = useState<string | null>(null);
  const [root1, setRoot1] = useState<string | null>(null);
  const [root2, setRoot2] = useState<string | null>(null);
  const [solutionType, setSolutionType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <FunctionSquare className="mr-2 h-6 w-6 text-accent" />
          Quadratic Equation Solver (P)
        </CardTitle>
        <p className="text-sm text-muted-foreground">Solves equations of the form: ax² + bx + c = 0</p>
      </CardHeader>
      <CardContent className="space-y-6">
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
        
        <Button onClick={handleSolve} className="w-full">
          Solve Equation
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Input Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(discriminant || root1 || solutionType) && !error && (
          <div className="space-y-3 pt-4 border-t mt-4">
            <h3 className="text-md font-semibold text-center text-muted-foreground">Solution:</h3>
            {solutionType && (
                <p className="text-center text-sm font-medium text-primary">{solutionType}</p>
            )}
            {discriminant && (
              <p className="text-center font-mono text-sm">
                {discriminant}
              </p>
            )}
            {root1 && (
              <p className="text-center font-mono text-lg text-accent">
                {root1}
              </p>
            )}
            {root2 && (
              <p className="text-center font-mono text-lg text-accent">
                {root2}
              </p>
            )}
          </div>
        )}
         <p className="text-xs text-muted-foreground text-center pt-2">
            Enter the coefficients a, b, and c for the quadratic equation ax² + bx + c = 0.
          </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Solver
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuadraticEquationSolver;

    