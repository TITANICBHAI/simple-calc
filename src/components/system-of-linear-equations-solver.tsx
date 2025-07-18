"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sigma, RefreshCw, AlertCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemOfLinearEquationsSolver: React.FC = () => {
  // Coefficients for equation 1: a1x + b1y = c1
  const [a1, setA1] = useState<string>('');
  const [b1, setB1] = useState<string>('');
  const [c1, setC1] = useState<string>('');

  // Coefficients for equation 2: a2x + b2y = c2
  const [a2, setA2] = useState<string>('');
  const [b2, setB2] = useState<string>('');
  const [c2, setC2] = useState<string>('');

  const [xSol, setXSol] = useState<string | null>(null);
  const [ySol, setYSol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value) || value === '' || value === '-') {
      setter(value);
      setError(null);
      setXSol(null);
      setYSol(null);
    }
  };

  const formatNumber = (num: number, precision: number = 5): string => {
    const fixed = parseFloat(num.toFixed(precision));
    if (Math.abs(fixed) < 1e-7 && fixed !== 0) {
      return fixed.toExponential(2);
    }
    return String(fixed);
  };

  const handleSolveSystem = () => {
    setError(null);
    setXSol(null);
    setYSol(null);

    const pa1 = parseFloat(a1); const pb1 = parseFloat(b1); const pc1 = parseFloat(c1);
    const pa2 = parseFloat(a2); const pb2 = parseFloat(b2); const pc2 = parseFloat(c2);

    if (isNaN(pa1) || isNaN(pb1) || isNaN(pc1) || isNaN(pa2) || isNaN(pb2) || isNaN(pc2)) {
      setError("All coefficients (a1, b1, c1, a2, b2, c2) must be valid numbers.");
      toast({ title: "Input Error", description: "Please enter valid numbers for all coefficients.", variant: "destructive" });
      return;
    }

    // Coefficient matrix A
    const matrixA = [
      [pa1, pb1],
      [pa2, pb2],
    ];

    // Constant vector B (as a column matrix)
    const matrixB = [
      [pc1],
      [pc2],
    ];

    // Calculate determinant of A
    const detA = matrixA[0][0] * matrixA[1][1] - matrixA[0][1] * matrixA[1][0];

    if (Math.abs(detA) < 1e-9) { 
      setError("No unique solution exists (determinant is zero). The system may have no solutions or infinitely many solutions.");
      toast({ title: "Solver Info", description: "The system does not have a unique solution.", variant: "default" });
      return;
    }

    // Calculate inverse of A
    const invDetA = 1 / detA;
    const inverseA = [
      [matrixA[1][1] * invDetA, -matrixA[0][1] * invDetA],
      [-matrixA[1][0] * invDetA, matrixA[0][0] * invDetA],
    ];

    // Calculate solution X = A_inverse * B
    const solutionX = inverseA[0][0] * matrixB[0][0] + inverseA[0][1] * matrixB[1][0];
    const solutionY = inverseA[1][0] * matrixB[0][0] + inverseA[1][1] * matrixB[1][0];

    setXSol(formatNumber(solutionX));
    setYSol(formatNumber(solutionY));
    toast({ title: "System Solved!", description: `x = ${formatNumber(solutionX)}, y = ${formatNumber(solutionY)}` });
  };

  const handleReset = () => {
    setA1(''); setB1(''); setC1('');
    setA2(''); setB2(''); setC2('');
    setXSol(null); setYSol(null);
    setError(null);
    toast({ title: "Solver Reset", description: "All fields cleared." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Sigma className="mr-2 h-6 w-6 text-accent" />
          System of Linear Equations Solver (2×2)
        </CardTitle>
        <p className="text-sm text-muted-foreground">Solves: a₁x + b₁y = c₁  AND  a₂x + b₂y = c₂</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base font-medium">Equation 1: a₁x + b₁y = c₁</Label>
          <div className="flex items-center space-x-2">
            <Input
              value={a1}
              onChange={handleInputChange(setA1)}
              placeholder="a₁"
              className="w-20 text-center font-mono"
              type="text"
              inputMode="decimal"
            />
            <span className="text-sm">x +</span>
            <Input
              value={b1}
              onChange={handleInputChange(setB1)}
              placeholder="b₁"
              className="w-20 text-center font-mono"
              type="text"
              inputMode="decimal"
            />
            <span className="text-sm">y =</span>
            <Input
              value={c1}
              onChange={handleInputChange(setC1)}
              placeholder="c₁"
              className="w-20 text-center font-mono"
              type="text"
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">Equation 2: a₂x + b₂y = c₂</Label>
          <div className="flex items-center space-x-2">
            <Input
              value={a2}
              onChange={handleInputChange(setA2)}
              placeholder="a₂"
              className="w-20 text-center font-mono"
              type="text"
              inputMode="decimal"
            />
            <span className="text-sm">x +</span>
            <Input
              value={b2}
              onChange={handleInputChange(setB2)}
              placeholder="b₂"
              className="w-20 text-center font-mono"
              type="text"
              inputMode="decimal"
            />
            <span className="text-sm">y =</span>
            <Input
              value={c2}
              onChange={handleInputChange(setC2)}
              placeholder="c₂"
              className="w-20 text-center font-mono"
              type="text"
              inputMode="decimal"
            />
          </div>
        </div>

        <Button 
          onClick={handleSolveSystem} 
          className="w-full"
          disabled={!a1 || !b1 || !c1 || !a2 || !b2 || !c2}
        >
          <Sigma className="mr-2 h-4 w-4" />
          Solve System
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(xSol !== null && ySol !== null) && (
          <Alert>
            <Sigma className="h-4 w-4" />
            <AlertTitle>Solution Found</AlertTitle>
            <AlertDescription>
              <div className="space-y-1 font-mono">
                <div>x = {xSol}</div>
                <div>y = {ySol}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How it works:</strong> Uses Cramer's rule and matrix inversion to solve the system.</p>
          <p><strong>Example:</strong> 2x + 3y = 7 and x - y = 1 gives x = 2, y = 1</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Solver
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SystemOfLinearEquationsSolver;